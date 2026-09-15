/* ==========================================================================
   Stock Inventory — data layer
   ক্যাটাগরি+জাত অনুযায়ী কেজিতে স্টক ট্র্যাক হয়। ওজন-গড় (weighted average)
   ক্রয়মূল্যের হিসাব Google Sheet সাইডে হয় (race-condition safe, একাধিক
   ডিভাইস থেকে একসাথে রিস্টক করলেও ভুল হবে না) — এই ফাইল শুধু সেটার সাথে
   localStorage ক্যাশ সিঙ্ক করে রাখে, যাতে অফলাইনেও পড়া/দেখা যায়।
   ========================================================================== */

const STOCK_CACHE_KEY = "gas_stock_cache";

function getStockList() { return readJSON(STOCK_CACHE_KEY, []); }
function saveStockList(list) { writeJSON(STOCK_CACHE_KEY, list); }

function findStockEntry(category, variety) {
  return getStockList().find(s => s.category === category && s.variety === variety);
}

/* বিক্রয় এন্ট্রি পেজে লাইভ দেখানোর জন্য — ট্র্যাক করা না থাকলে null ফেরত দেয়
   (তার মানে এই জাতের জন্য স্টক ট্র্যাকিং এখনো চালু করা হয়নি, এটা ঐচ্ছিক ফিচার) */
function getStockKg(category, variety) {
  const e = findStockEntry(category, variety);
  return e ? Number(e.stockKg) : null;
}

/* নতুন/রিস্টক এন্ট্রি — চূড়ান্ত (ওজন-গড় সহ) মান Sheet থেকে ফেরত এলে সেটাই
   ব্যবহার হয়; Sheet সংযুক্ত না থাকলে অফলাইন ফলব্যাক হিসেবে লোকালি হিসাব হয়। */
async function restockProduct(category, variety, addKg, costPerKg, sellingPerKg, remarks) {
  let result = null;
  if (isSheetConnected()) {
    try { result = await sheetRestockEntry({ category, variety, addKg, costPerKg, sellingPerKg, remarks: remarks || "" }); }
    catch (err) { console.error("Sheet sync (restock) failed:", err); }
  }

  const list = getStockList();
  let entry = list.find(s => s.category === category && s.variety === variety);
  if (!entry) {
    entry = { id: "s" + Date.now(), category, variety, stockKg: 0, costPricePerKg: 0, sellingPricePerKg: 0, remarks: "" };
    list.push(entry);
  }

  if (result && result.ok) {
    entry.id = result.id || entry.id;
    entry.stockKg = result.stockKg;
    entry.costPricePerKg = result.costPricePerKg;
    entry.sellingPricePerKg = result.sellingPricePerKg;
  } else {
    const newStock = (Number(entry.stockKg) || 0) + addKg;
    entry.costPricePerKg = newStock > 0
      ? (((entry.stockKg || 0) * (entry.costPricePerKg || 0)) + (addKg * costPerKg)) / newStock
      : costPerKg;
    entry.stockKg = newStock;
    entry.sellingPricePerKg = sellingPerKg;
  }
  if (remarks) entry.remarks = remarks;
  entry.lastUpdated = new Date().toISOString();
  saveStockList(list);
  return entry;
}

/* সরাসরি সংশোধন (ওজন-গড় হিসাব ছাড়া) — ভুল এন্ট্রি ঠিক করার জন্য */
function setStockFields(id, fields) {
  const list = getStockList();
  const entry = list.find(s => s.id === id);
  if (!entry) return;
  Object.assign(entry, fields, { lastUpdated: new Date().toISOString() });
  saveStockList(list);
  if (isSheetConnected()) {
    sheetSetStockFields({ id, ...fields }).catch(err => console.error("Sheet sync (stock edit) failed:", err));
  }
}

function deleteStockEntry(id) {
  saveStockList(getStockList().filter(s => s.id !== id));
  if (isSheetConnected()) {
    sheetDeleteStock(id).catch(err => console.error("Sheet sync (delete stock) failed:", err));
  }
}

/* বিক্রয় নিশ্চিত হওয়ার পর প্রতিটা আইটেমের সমপরিমাণ কেজি স্টক থেকে বিয়োগ হয়।
   স্টক শূন্যের নিচেও যেতে পারে (হার্ড ব্লক নেই) — শুধু কার্ডে লাল সতর্কতা দেখাবে। */
async function deductStockForSale(items) {
  const list = getStockList();
  for (const it of items || []) {
    const kg = it.mode === "bulk" ? Number(it.totalKg) : (Number(it.qty) * Number(it.count)) / 1000;
    if (!kg || kg <= 0) continue;

    const entry = list.find(s => s.category === it.category && s.variety === it.variety);
    if (entry) {
      entry.stockKg = Number(entry.stockKg) - kg;
      entry.lastUpdated = new Date().toISOString();
    }

    if (isSheetConnected()) {
      try { await sheetAdjustStock({ category: it.category, variety: it.variety, deltaKg: -kg }); }
      catch (err) { console.error("Sheet sync (stock deduct) failed:", err); }
    }
  }
  saveStockList(list);
}

async function syncStockFromSheet() {
  if (!isSheetConnected()) return;
  try {
    const rows = await sheetFetchStock();
    if (Array.isArray(rows)) {
      saveStockList(rows.map(r => ({
        id: String(r.id), category: r.category, variety: r.variety,
        stockKg: Number(r.stockKg) || 0,
        costPricePerKg: Number(r.costPricePerKg) || 0,
        sellingPricePerKg: Number(r.sellingPricePerKg) || 0,
        remarks: r.remarks || "",
        lastUpdated: r.lastUpdated,
      })));
    }
  } catch (err) {
    console.error("Sheet থেকে স্টক লোড ব্যর্থ, লোকাল ক্যাশ ব্যবহার হচ্ছে:", err);
  }
}
