/**
 * Green Agro Seeds — Google Apps Script (ভবিষ্যতের জন্য)
 * ==========================================================
 * এই কোডটি এখনই ওয়েবসাইটের সাথে যুক্ত নয়। এখন সবকিছু browser-এর
 * localStorage-এ সেভ হচ্ছে। ভবিষ্যতে ক্লাউড ব্যাকআপ / একাধিক ডিভাইস থেকে
 * অ্যাক্সেসের দরকার হলে এই স্ক্রিপ্টটি একটি Google Sheet-এর
 * Extensions → Apps Script এ পেস্ট করে "Deploy → Web app" হিসেবে
 * পাবলিশ করলে চালু হবে। তারপর js/app.js-এ SHEET_WEBAPP_URL বসিয়ে
 * saveSale() ফাংশনে একটা fetch/JSONP কল যোগ করলেই cloud sync চালু হবে।
 *
 * Sheet-এ থাকবে দুইটা Tab:
 *  - "Sales"  : প্রতিটা বিক্রয়ের এক সারি
 *  - "Ledger" : প্রতিটা ডেবিট/ক্রেডিট এন্ট্রির এক সারি (append-only)
 */

function doGet(e) {
  const action = e.parameter.action;

  if (action === "fetchSales") return jsonp_(e, getSheetRows_("Sales"));
  if (action === "fetchLedger") return jsonp_(e, getSheetRows_("Ledger"));

  if (action === "saveSale") return jsonp_(e, saveSaleRow_(e.parameter));
  if (action === "saveLedgerEntry") return jsonp_(e, saveLedgerRow_(e.parameter));

  return jsonp_(e, { error: "unknown action" });
}

function getSheetRows_(tabName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
}

function saveSaleRow_(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sales");
  sheet.appendRow([
    p.invoiceNo, new Date(), p.customerName, "'" + normalizePhone_(p.customerPhone),
    p.customerAddress, p.itemsJSON, p.grandTotal, p.paidAmount, p.dueAmount,
  ]);
  return { ok: true };
}

function saveLedgerRow_(p) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ledger");
  sheet.appendRow([
    new Date(), "'" + normalizePhone_(p.phone), p.name, p.type, p.amount, p.note,
  ]);
  return { ok: true };
}

function normalizePhone_(phone) {
  let p = String(phone).trim().replace(/[\s\-]/g, "");
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
