/**
 * Green Agro Seeds — Google Apps Script Backend
 * ==========================================================
 * সেটআপ ধাপ:
 * ১. sheets.new দিয়ে একটা নতুন খালি Google Sheet খুলুন, নাম দিন "Green Agro Seeds DB"
 * ২. মেনু থেকে Extensions → Apps Script খুলুন
 * ৩. যা কিছু আগে থেকে লেখা আছে (Code.gs-এ) সব মুছে এই পুরো ফাইলের কনটেন্ট পেস্ট করুন
 * ৪. উপরের ফাংশন ড্রপডাউন থেকে "setup" সিলেক্ট করে ▶ Run বাটনে চাপুন
 *    — প্রথমবার permission চাইবে, "Allow" করে দিন
 *    — এটা "Products", "Customers", "Ledger", "Sales" নামে ৪টা ট্যাব ও হেডার রো বানিয়ে দেবে
 *    — Sheet-এ ট্যাবগুলো তৈরি হয়েছে কিনা সরাসরি দেখেই বোঝা যাবে (কোনো পপ-আপ আসবে না;
 *      বিস্তারিত দেখতে চাইলে Execution log-এ চোখ রাখুন)
 * ৫. Deploy → New deployment → টাইপ হিসেবে "Web app" বেছে নিন
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Deploy চাপুন, যে URL পাবেন (....../exec দিয়ে শেষ হয়) সেটা কপি করুন
 * ৬. ওয়েবসাইটে উপরে ডানদিকে ⚙️ আইকনে ক্লিক করে সেই URL পেস্ট করে সংরক্ষণ করুন
 *
 * ভবিষ্যতে কোড আপডেট করলে: Deploy → Manage deployments → পেন্সিল আইকন → নতুন
 * ভার্সন সিলেক্ট করে আবার Deploy করতে হবে (নতুন URL তৈরি হবে না, পুরনোটাই থাকবে)।
 *
 * ইতিমধ্যে Sheet ব্যবহার করছেন এবং নতুন কোনো কলাম (যেমন itemsSummary) যোগ হয়েছে?
 * ফাংশন ড্রপডাউন থেকে "addMissingColumns" সিলেক্ট করে একবার Run করুন —
 * পুরনো ডেটা/কলাম অক্ষত রেখেই যা বাকি আছে তা যোগ করে দেবে।
 */

const SHEETS = {
  PRODUCTS: "Products",
  CUSTOMERS: "Customers",
  LEDGER: "Ledger",
  SALES: "Sales",
};

const HEADERS = {
  Products:  ["id", "category", "variety", "qty", "unit", "packetPrice", "kgPrice", "bulkPrice", "retailPrice"],
  Customers: ["phone", "name", "address", "district", "thana", "varietyNote"],
  Ledger:    ["timestamp", "phone", "type", "amount", "note"],
  Sales:     ["invoiceNo", "date", "customerName", "customerPhone", "customerDistrict", "customerThana", "customerAddress", "itemsSummary", "itemsJSON", "itemsTotal", "oldDueAmount", "grandTotal", "paidAmount", "dueAmount"],
};

/* এই ফাংশনটা প্রথমবার ম্যানুয়ালি Run করতে হবে — ৪টা ট্যাব ও হেডার তৈরি করে দেয় */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[name]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight("bold").setBackground("#EAF3E4");
    }
  });
  // getUi() স্ক্রিপ্ট এডিটর থেকে সরাসরি Run করলে কাজ করে না (UI context থাকে না),
  // তাই Logger ব্যবহার করা হচ্ছে — ফলাফল দেখতে উপরের মেনু থেকে View → Logs খুলুন
  Logger.log("সেটআপ সম্পন্ন হয়েছে — Products, Customers, Ledger, Sales ট্যাব তৈরি হয়ে গেছে। এখন Deploy → New deployment করুন।");
}

/* আগে থেকে Sheet ব্যবহার করছেন এমন কারো জন্য — নতুন কোনো কলাম (যেমন itemsSummary)
   যোগ হলে এই ফাংশনটা একবার Run করলেই বিদ্যমান ট্যাবগুলোতে সেই কলাম যোগ হয়ে যাবে,
   পুরনো ডেটা/কলামের অবস্থান একদম অক্ষত থাকবে (শেষে যোগ হয়)। */
function addMissingColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) return;
    const lastCol = sheet.getLastColumn();
    const existing = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    HEADERS[name].forEach(h => {
      if (existing.indexOf(h) === -1) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
      }
    });
  });
  Logger.log("প্রয়োজনীয় নতুন কলাম যোগ করা হয়েছে (আগের ডেটা অক্ষত আছে)।");
}

function doGet(e) {
  const action = e.parameter.action;
  const WRITE_ACTIONS = ["addProduct", "updateProduct", "deleteProduct", "upsertCustomer", "addLedgerEntry", "saveSale", "updateSale"];
  let result;
  let lock;
  try {
    // দুইটা রিকোয়েস্ট (যেমন একই সময়ে দুইটা ইনভয়েস আপডেট) একসাথে এসে একে অপরের লেখা
    // এলোমেলো করে ফেলতে পারত — এই লক দিয়ে write অপারেশনগুলো এক-এক করে (সিরিয়ালি)
    // চলে, যার ফলে "মাঝে মাঝে আপডেট নেয় না" জাতীয় সমস্যা আর হবে না।
    if (WRITE_ACTIONS.indexOf(action) !== -1) {
      lock = LockService.getScriptLock();
      lock.waitLock(15000);
    }
    switch (action) {
      case "fetchProducts": result = getRows_(SHEETS.PRODUCTS); break;
      case "addProduct":    result = addProduct_(e.parameter); break;
      case "updateProduct": result = updateProduct_(e.parameter); break;
      case "deleteProduct": result = deleteProduct_(e.parameter); break;

      case "fetchCustomers": result = getRows_(SHEETS.CUSTOMERS); break;
      case "upsertCustomer": result = upsertCustomer_(e.parameter); break;

      case "fetchLedger":    result = getRows_(SHEETS.LEDGER); break;
      case "addLedgerEntry": result = addLedgerEntry_(e.parameter); break;

      case "fetchSales":  result = getRows_(SHEETS.SALES); break;
      case "saveSale":    result = saveSale_(e.parameter); break;
      case "updateSale":  result = updateSale_(e.parameter); break;

      default: result = { error: "unknown action: " + action };
    }
  } catch (err) {
    result = { error: String(err) };
  } finally {
    if (lock) lock.releaseLock();
  }
  return jsonp_(e, result);
}

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error(name + " ট্যাব পাওয়া যায়নি — প্রথমে setup() ফাংশনটা Run করুন।");
  return sheet;
}

function getRows_(sheetName) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data
    .filter(row => row.some(cell => cell !== "" && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
}

function findRowIndexByValue_(sheet, colName, value) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIdx = headers.indexOf(colName);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][colIdx]).replace(/^'/, "") === String(value).replace(/^'/, "")) return i + 1; // 1-based sheet row
  }
  return -1;
}

/* কলামের POSITION-এর বদলে HEADER NAME ধরে row বসায় — তাই কেউ Sheet-এ ম্যানুয়ালি
   কলাম যোগ/সরিয়ে ফেললেও ডেটা ভুল ঘরে গিয়ে বসে না। dataObj-এ যে কী নেই তার ঘর খালি থাকে। */
function appendRowByHeaders_(sheet, dataObj) {
  ensureHeaders_(sheet, Object.keys(dataObj));
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => (dataObj[h] !== undefined ? dataObj[h] : ""));
  sheet.appendRow(row);
}
function setRowByHeaders_(sheet, rowIdx, dataObj) {
  ensureHeaders_(sheet, Object.keys(dataObj));
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => (dataObj[h] !== undefined ? dataObj[h] : sheet.getRange(rowIdx, headers.indexOf(h) + 1).getValue()));
  sheet.getRange(rowIdx, 1, 1, headers.length).setValues([row]);
}

/* dataObj-এ যেসব key হেডারে এখনো নেই, সেগুলো নিজে থেকেই নতুন কলাম হিসেবে যোগ করে দেয় —
   তাই "addMissingColumns" ম্যানুয়ালি Run করার আর দরকার নেই, প্রতিটা রাইট নিজে থেকেই
   ঠিক করে নেয়। itemsSummary/itemsJSON কলামে word-wrap ও যুক্তিসঙ্গত width সেট করে দেয়,
   যাতে টেক্সট পাশের ঘরে উপচে পড়ে হিজিবিজি দেখানোর বদলে নিজের ঘরেই সুন্দরভাবে wrap হয়। */
function ensureHeaders_(sheet, keys) {
  let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  keys.forEach(key => {
    if (headers.indexOf(key) === -1) {
      const newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(key).setFontWeight("bold").setBackground("#EAF3E4");
      if (key === "itemsSummary") {
        sheet.setColumnWidth(newCol, 340);
        sheet.getRange(1, newCol, sheet.getMaxRows(), 1).setWrap(true);
      } else if (key === "itemsJSON") {
        sheet.setColumnWidth(newCol, 90);
      }
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
  });
}

/* ---------------------------------------------------------------------- */
/* Products                                                                */
/* ---------------------------------------------------------------------- */
function addProduct_(p) {
  const sheet = getSheet_(SHEETS.PRODUCTS);
  const id = p.id || "p" + new Date().getTime();
  appendRowByHeaders_(sheet, { id, category: p.category, variety: p.variety, qty: p.qty, unit: p.unit, packetPrice: p.packetPrice, kgPrice: p.kgPrice, bulkPrice: p.bulkPrice, retailPrice: p.retailPrice });
  return { ok: true, id: id };
}
function updateProduct_(p) {
  const sheet = getSheet_(SHEETS.PRODUCTS);
  const rowIdx = findRowIndexByValue_(sheet, "id", p.id);
  if (rowIdx === -1) return { error: "product not found: " + p.id };
  setRowByHeaders_(sheet, rowIdx, { id: p.id, category: p.category, variety: p.variety, qty: p.qty, unit: p.unit, packetPrice: p.packetPrice, kgPrice: p.kgPrice, bulkPrice: p.bulkPrice, retailPrice: p.retailPrice });
  return { ok: true };
}
function deleteProduct_(p) {
  const sheet = getSheet_(SHEETS.PRODUCTS);
  const rowIdx = findRowIndexByValue_(sheet, "id", p.id);
  if (rowIdx === -1) return { error: "product not found: " + p.id };
  sheet.deleteRow(rowIdx);
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/* Customers                                                                */
/* ---------------------------------------------------------------------- */
function upsertCustomer_(c) {
  const sheet = getSheet_(SHEETS.CUSTOMERS);
  const phoneNorm = normalizePhone_(c.phone);
  const rowIdx = findRowIndexByValue_(sheet, "phone", phoneNorm);
  const rowData = { phone: "'" + phoneNorm, name: c.name || "", address: c.address || "", district: c.district || "", thana: c.thana || "", varietyNote: c.varietyNote || "" };
  if (rowIdx === -1) {
    appendRowByHeaders_(sheet, rowData);
  } else {
    setRowByHeaders_(sheet, rowIdx, rowData);
  }
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/* Ledger (বাকি-পাওনা)                                                     */
/* ---------------------------------------------------------------------- */
function addLedgerEntry_(p) {
  const sheet = getSheet_(SHEETS.LEDGER);
  appendRowByHeaders_(sheet, { timestamp: new Date(), phone: "'" + normalizePhone_(p.phone), type: p.type, amount: p.amount, note: p.note || "" });
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/* Sales (বিক্রয়ের ইতিহাস)                                                 */
/* ---------------------------------------------------------------------- */
function saveSale_(p) {
  const sheet = getSheet_(SHEETS.SALES);
  appendRowByHeaders_(sheet, {
    invoiceNo: p.invoiceNo, date: p.date, customerName: p.customerName,
    customerPhone: "'" + normalizePhone_(p.customerPhone),
    customerDistrict: p.customerDistrict || "", customerThana: p.customerThana || "",
    customerAddress: p.customerAddress || "", itemsSummary: p.itemsSummary || "",
    itemsJSON: p.itemsJSON, itemsTotal: p.itemsTotal, oldDueAmount: p.oldDueAmount,
    grandTotal: p.grandTotal, paidAmount: p.paidAmount, dueAmount: p.dueAmount,
  });
  return { ok: true };
}
function updateSale_(p) {
  const sheet = getSheet_(SHEETS.SALES);
  const rowIdx = findRowIndexByValue_(sheet, "invoiceNo", p.invoiceNo);
  if (rowIdx === -1) return { error: "invoice not found: " + p.invoiceNo };
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  ["paidAmount", "dueAmount", "grandTotal", "itemsTotal", "oldDueAmount"].forEach(field => {
    if (p[field] !== undefined) {
      const colIdx = headers.indexOf(field) + 1;
      if (colIdx > 0) sheet.getRange(rowIdx, colIdx).setValue(p[field]);
    }
  });
  return { ok: true };
}

/* ---------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ---------------------------------------------------------------------- */
function normalizePhone_(phone) {
  let p = String(phone).trim().replace(/^'/, "").replace(/[\s\-]/g, "");
  p = p.replace(/^\+?88/, "");
  if (p.length === 10 && p.charAt(0) === "1") p = "0" + p;
  return p;
}

function jsonp_(e, obj) {
  const callback = e.parameter.callback;
  const json = JSON.stringify(obj);
  const output = callback ? `${callback}(${json})` : json;
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
}
