/* ==========================================================================
   Green Agro Seeds — Product Catalog (Google Sheets-সিঙ্কড)
   প্রতিটা সারি (row) = একটা নির্দিষ্ট জাত + পরিমাণের দাম। Google Sheet-এর
   "Products" ট্যাব সংযুক্ত থাকলে সেটাই আসল সোর্স; localStorage সবসময়
   অফলাইন ক্যাশ হিসেবে কাজ করে, তাই Sheet সংযুক্ত না থাকলেও অ্যাপ স্বাভাবিকভাবে চলে।
   ========================================================================== */

const PRODUCTS_CACHE_KEY = "gas_products_cache";
const PENDING_VARIETIES_KEY = "gas_pending_varieties";

/* মূল্য তালিকা ২০২৬ — Sheet সংযুক্ত না থাকা অবস্থায় ডিফল্ট হিসেবে ব্যবহৃত হয় */
const DEFAULT_PRODUCTS_FLAT = [
  { id: "d1",  category: "মরিচ বীজ",   variety: "ঝলক-১",           qty: 10,   unit: "গ্রাম", packetPrice: 380,  kgPrice: 38000, bulkPrice: 35000, retailPrice: 500 },
  { id: "d2",  category: "মরিচ বীজ",   variety: "ঝলক-১ ডিজি DG",   qty: 10,   unit: "গ্রাম", packetPrice: 850,  kgPrice: 85000, bulkPrice: 82000, retailPrice: 600 },
  { id: "d3",  category: "মরিচ বীজ",   variety: "গ্রীণ প্লাস-১০৫",  qty: 10,   unit: "গ্রাম", packetPrice: 650,  kgPrice: 65000, bulkPrice: 55000, retailPrice: 600 },
  { id: "d4",  category: "মরিচ বীজ",   variety: "গ্রীন ফায়ার",      qty: 10,   unit: "গ্রাম", packetPrice: 920,  kgPrice: 92000, bulkPrice: 80000, retailPrice: 1000 },
  { id: "d5",  category: "ধন্দুল বীজ",  variety: "আগমনী-১",         qty: 10,   unit: "গ্রাম", packetPrice: 75,   kgPrice: 7500,  bulkPrice: 8500,  retailPrice: 110 },
  { id: "d6",  category: "ঢেঁড়স বীজ",  variety: "নবীন-১",          qty: 50,   unit: "গ্রাম", packetPrice: 200,  kgPrice: 4000,  bulkPrice: 3800,  retailPrice: 350 },
  { id: "d7",  category: "ঢেঁড়স বীজ",  variety: "নবীন-১",          qty: 100,  unit: "গ্রাম", packetPrice: 380,  kgPrice: 3800,  bulkPrice: 3800,  retailPrice: 650 },
  { id: "d8",  category: "চিচিঙ্গা বীজ", variety: "প্রভাতী-১০০",     qty: 10,   unit: "গ্রাম", packetPrice: 155,  kgPrice: 15500, bulkPrice: 14000, retailPrice: 200 },
  { id: "d9",  category: "করলা বীজ",   variety: "তিতাস-১০০",       qty: 10,   unit: "গ্রাম", packetPrice: 180,  kgPrice: 18000, bulkPrice: 14000, retailPrice: 250 },
  { id: "d10", category: "লাউ বীজ",    variety: "তমা",             qty: 10,   unit: "গ্রাম", packetPrice: 70,   kgPrice: 7000,  bulkPrice: 5600,  retailPrice: 120 },
  { id: "d11", category: "ধনিয়া",      variety: "গ্রীণ এগ্রো-৩০",   qty: 1000, unit: "গ্রাম", packetPrice: 330,  kgPrice: 330,   bulkPrice: 280,   retailPrice: 800 },
  { id: "d12", category: "বরবটি",      variety: "সবুজ সাথি",       qty: 100,  unit: "গ্রাম", packetPrice: 220,  kgPrice: 2200,  bulkPrice: 1900,  retailPrice: 350 },
  { id: "d13", category: "শশা",       variety: "বৈশাখী-৩৫",       qty: 10,   unit: "গ্রাম", packetPrice: 280,  kgPrice: 28000, bulkPrice: 20000, retailPrice: 800 },
  { id: "d14", category: "তরমুজ",     variety: "তৃপ্তি-৬৫",        qty: 50,   unit: "গ্রাম", packetPrice: 1800, kgPrice: 28000, bulkPrice: 28000, retailPrice: 2800 },
  { id: "d15", category: "তরমুজ",     variety: "রয়েল-৬০",         qty: 100,  unit: "গ্রাম", packetPrice: 2600, kgPrice: 26000, bulkPrice: 24000, retailPrice: 8500 },
];

/* পুরনো (localStorage-only) সিস্টেমে ব্যবহৃত ক্যাটাগরি-আইডি — শুধু একবারের মাইগ্রেশনের জন্য দরকার */
const OLD_CATEGORY_ID_MAP = {
  "মরিচ বীজ": "morich", "ধন্দুল বীজ": "dhundul", "ঢেঁড়স বীজ": "derosh",
  "চিচিঙ্গা বীজ": "chichinga", "করলা বীজ": "korola", "লাউ বীজ": "lau",
  "ধনিয়া": "dhonia", "বরবটি": "borboti", "শশা": "shosha", "তরমুজ": "tarmuj",
};

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

/* আগের লেয়ার-ভিত্তিক সিস্টেম (custom products/options/overrides/deletions) থেকে
   একবারের জন্য এই নতুন ফ্ল্যাট ফরম্যাটে মাইগ্রেট করে, যাতে আগের কাস্টম পণ্য/দাম হারিয়ে না যায় */
function migrateOldCatalogIfNeeded() {
  if (localStorage.getItem(PRODUCTS_CACHE_KEY)) return;

  let flat = DEFAULT_PRODUCTS_FLAT.map(o => ({ ...o }));
  let counter = flat.length + 1;

  try {
    const oldCustomProducts = readJSON("gas_custom_products", []);
    const oldCustomOptions = readJSON("gas_custom_options", {});
    const oldOverrides = readJSON("gas_overrides", {});
    const oldDeleted = readJSON("gas_deleted", []);

    oldCustomProducts.forEach(c => {
      const categoryName = c.category || Object.keys(OLD_CATEGORY_ID_MAP).find(k => OLD_CATEGORY_ID_MAP[k] === c.id) || c.id;
      (c.varieties || []).forEach(v => {
        (v.options || []).forEach(o => {
          flat.push({ id: "m" + (counter++), category: categoryName, variety: v.name, ...o });
        });
      });
    });

    Object.entries(oldCustomOptions).forEach(([key, options]) => {
      const [catId, varietyName] = key.split("::");
      const categoryName = Object.keys(OLD_CATEGORY_ID_MAP).find(k => OLD_CATEGORY_ID_MAP[k] === catId) || catId;
      (options || []).forEach(o => flat.push({ id: "m" + (counter++), category: categoryName, variety: varietyName, ...o }));
    });

    Object.entries(oldOverrides).forEach(([key, fields]) => {
      const [catId, varietyName, qtyUnit] = key.split("::");
      const categoryName = Object.keys(OLD_CATEGORY_ID_MAP).find(k => OLD_CATEGORY_ID_MAP[k] === catId) || catId;
      const match = flat.find(o => o.category === categoryName && o.variety === varietyName && `${o.qty}${o.unit}` === qtyUnit);
      if (match) Object.assign(match, fields);
    });

    flat = flat.filter(o => {
      const catId = OLD_CATEGORY_ID_MAP[o.category] || o.category;
      const key = `${catId}::${o.variety}::${o.qty}${o.unit}`;
      return !oldDeleted.includes(key);
    });
  } catch (err) {
    console.error("পুরনো ক্যাটালগ মাইগ্রেশনে সমস্যা হয়েছে, ডিফল্ট তালিকা ব্যবহার হচ্ছে:", err);
    flat = DEFAULT_PRODUCTS_FLAT.map(o => ({ ...o }));
  }

  writeJSON(PRODUCTS_CACHE_KEY, flat);
}

/* ---------------------------------------------------------------------- */
/* Catalog build (nested শেপ — বাকি অ্যাপ কোড এই শেপ-ই আশা করে)             */
/* ---------------------------------------------------------------------- */

function getFullCatalog() {
  const flat = readJSON(PRODUCTS_CACHE_KEY, DEFAULT_PRODUCTS_FLAT);
  const pending = readJSON(PENDING_VARIETIES_KEY, []);
  const byCategory = {};

  function ensureCat(name) {
    if (!byCategory[name]) byCategory[name] = { id: name, category: name, varieties: {} };
    return byCategory[name];
  }
  function ensureVariety(cat, name) {
    if (!cat.varieties[name]) cat.varieties[name] = { name, options: [] };
    return cat.varieties[name];
  }

  flat.forEach(o => {
    const cat = ensureCat(o.category);
    const v = ensureVariety(cat, o.variety);
    v.options.push({
      _rowId: o.id, qty: Number(o.qty), unit: o.unit,
      packetPrice: Number(o.packetPrice), kgPrice: Number(o.kgPrice),
      bulkPrice: Number(o.bulkPrice), retailPrice: Number(o.retailPrice),
    });
  });
  pending.forEach(p => { ensureVariety(ensureCat(p.category), p.variety); });

  return Object.values(byCategory).map(c => ({ ...c, varieties: Object.values(c.varieties) }));
}

/* ---------------------------------------------------------------------- */
/* Create / Update / Delete — লোকাল ক্যাশ সাথে সাথে বদলায়, Sheet ব্যাকগ্রাউন্ডে সিঙ্ক হয় */
/* ---------------------------------------------------------------------- */

function saveCustomProduct(product) {
  const flat = readJSON(PRODUCTS_CACHE_KEY, []);
  (product.varieties || []).forEach(v => {
    (v.options || []).forEach(o => {
      const row = { id: "p" + Date.now() + Math.floor(Math.random() * 1000), category: product.category, variety: v.name, ...o };
      flat.push(row);
      pushProductToSheet(row);
    });
  });
  writeJSON(PRODUCTS_CACHE_KEY, flat);
}

function addCategoryOrVariety({ categoryName, varietyName }) {
  const pending = readJSON(PENDING_VARIETIES_KEY, []);
  pending.push({ category: categoryName, variety: varietyName });
  writeJSON(PENDING_VARIETIES_KEY, pending);
  return categoryName; // নতুন সিস্টেমে ক্যাটাগরির "id" হলো তার নামটাই
}

function addCustomOption(categoryName, varietyName, option) {
  const flat = readJSON(PRODUCTS_CACHE_KEY, []);
  const row = { id: "o" + Date.now() + Math.floor(Math.random() * 1000), category: categoryName, variety: varietyName, ...option };
  flat.push(row);
  writeJSON(PRODUCTS_CACHE_KEY, flat);

  const pending = readJSON(PENDING_VARIETIES_KEY, []).filter(p => !(p.category === categoryName && p.variety === varietyName));
  writeJSON(PENDING_VARIETIES_KEY, pending);

  pushProductToSheet(row);
  return row;
}

function updateProductRow(rowId, fields) {
  const flat = readJSON(PRODUCTS_CACHE_KEY, []);
  const row = flat.find(o => o.id === rowId);
  if (!row) return;
  Object.assign(row, fields);
  writeJSON(PRODUCTS_CACHE_KEY, flat);
  pushProductUpdateToSheet(row);
}

function deleteProductRow(rowId) {
  writeJSON(PRODUCTS_CACHE_KEY, readJSON(PRODUCTS_CACHE_KEY, []).filter(o => o.id !== rowId));
  pushProductDeleteToSheet(rowId);
}

/* ---------------------------------------------------------------------- */
/* Google Sheet সিঙ্ক (fire-and-forget — ব্যর্থ হলেও UI আটকায় না)          */
/* ---------------------------------------------------------------------- */

async function pushProductToSheet(row) {
  if (!isSheetConnected()) return;
  try { await sheetAddProduct(row); } catch (err) { console.error("Sheet sync (add product) failed:", err); }
}
async function pushProductUpdateToSheet(row) {
  if (!isSheetConnected()) return;
  try { await sheetUpdateProduct(row); } catch (err) { console.error("Sheet sync (update product) failed:", err); }
}
async function pushProductDeleteToSheet(rowId) {
  if (!isSheetConnected()) return;
  try { await sheetDeleteProduct(rowId); } catch (err) { console.error("Sheet sync (delete product) failed:", err); }
}

async function syncProductsFromSheet() {
  if (!isSheetConnected()) return;
  try {
    const rows = await sheetFetchProducts();
    if (Array.isArray(rows) && rows.length) {
      const normalized = rows.map(r => ({
        id: String(r.id), category: r.category, variety: r.variety,
        qty: Number(r.qty), unit: r.unit,
        packetPrice: Number(r.packetPrice), kgPrice: Number(r.kgPrice),
        bulkPrice: Number(r.bulkPrice), retailPrice: Number(r.retailPrice),
      }));
      writeJSON(PRODUCTS_CACHE_KEY, normalized);
    }
  } catch (err) {
    console.error("Sheet থেকে পণ্য লোড ব্যর্থ, লোকাল ক্যাশ ব্যবহার হচ্ছে:", err);
  }
}

migrateOldCatalogIfNeeded();
