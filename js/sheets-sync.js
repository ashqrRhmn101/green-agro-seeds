/* ==========================================================================
   Google Sheets Sync Layer (JSONP)
   Apps Script Web App-এর সাথে যোগাযোগের একমাত্র জায়গা এটা। CORS এড়াতে
   Khalid's Dreams-এর মতোই JSONP (script-tag injection) ব্যবহার হয়েছে।
   Web App URL সেট না থাকলে isSheetConnected() false দেয়, আর বাকি সব ফাইল
   সেই চেক করে সিঙ্ক স্কিপ করে দেয় — অর্থাৎ Sheet সংযুক্ত না থাকলেও
   অ্যাপ localStorage দিয়ে স্বাভাবিকভাবে কাজ করে (অফলাইন-প্রথম ডিজাইন অক্ষত থাকে)।
   ========================================================================== */

const WEBAPP_URL_KEY = "gas_webapp_url";

function getWebAppUrl() { return (localStorage.getItem(WEBAPP_URL_KEY) || "").trim(); }
function setWebAppUrl(url) { localStorage.setItem(WEBAPP_URL_KEY, (url || "").trim()); }
function isSheetConnected() { return !!getWebAppUrl(); }

function jsonpRequestOnce(params) {
  return new Promise((resolve, reject) => {
    const base = getWebAppUrl();
    if (!base) { reject(new Error("Google Sheet সংযুক্ত নেই")); return; }

    const cbName = "gasCb_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    const timer = setTimeout(() => { cleanup(); reject(new Error("সময় শেষ (timeout) — সংযোগ চেক করুন")); }, 20000);

    function cleanup() {
      clearTimeout(timer);
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[cbName] = (data) => {
      cleanup();
      if (data && data.error) reject(new Error(data.error));
      else resolve(data);
    };

    const query = new URLSearchParams({ ...params, callback: cbName }).toString();
    const script = document.createElement("script");
    script.src = `${base}?${query}`;
    script.onerror = () => { cleanup(); reject(new Error("Google Sheet-এ সংযোগ ব্যর্থ হয়েছে")); };
    document.body.appendChild(script);
  });
}

/* সাময়িক নেটওয়ার্ক সমস্যা/timeout হলে একবার আবার চেষ্টা করে — এটাই "মাঝে মাঝে
   আপডেট নেয় না" সমস্যার একটা বড় কারণ ছিল, বিশেষ করে দ্রুত একাধিক রিকোয়েস্ট
   পাঠালে। ব্যর্থ হলে সাথে সাথে না চেষ্টা করে সামান্য অপেক্ষা করে আবার পাঠায়। */
function jsonpRequest(params, _retriesLeft = 1) {
  return jsonpRequestOnce(params).catch(err => {
    if (_retriesLeft > 0) {
      return new Promise(resolve => setTimeout(resolve, 900)).then(() => jsonpRequest(params, _retriesLeft - 1));
    }
    throw err;
  });
}

/* ---------------------------------------------------------------------- */
/* Products                                                                */
/* ---------------------------------------------------------------------- */
function sheetFetchProducts() { return jsonpRequest({ action: "fetchProducts" }); }
function sheetAddProduct(row) { return jsonpRequest({ action: "addProduct", ...row }); }
function sheetUpdateProduct(row) { return jsonpRequest({ action: "updateProduct", ...row }); }
function sheetDeleteProduct(id) { return jsonpRequest({ action: "deleteProduct", id }); }

/* ---------------------------------------------------------------------- */
/* Customers / Ledger (বাকি-পাওনা)                                        */
/* ---------------------------------------------------------------------- */
function sheetFetchCustomers() { return jsonpRequest({ action: "fetchCustomers" }); }
function sheetUpsertCustomer(c) { return jsonpRequest({ action: "upsertCustomer", ...c }); }
function sheetFetchLedger() { return jsonpRequest({ action: "fetchLedger" }); }
function sheetAddLedgerEntry(e) { return jsonpRequest({ action: "addLedgerEntry", ...e }); }

/* ---------------------------------------------------------------------- */
/* Sales (বিক্রয়ের ইতিহাস)                                                */
/* ---------------------------------------------------------------------- */
function sheetFetchSales() { return jsonpRequest({ action: "fetchSales" }); }

/* Sheet-এ "itemsJSON" কলামটা raw JSON হওয়ায় পড়া কঠিন — তাই পাশাপাশি
   "itemsSummary" নামে একটা সহজে-পড়া-যায় এমন টেক্সট কলামও পাঠানো হয়
   (PDF-এর "পণ্য | হিসাব | টাকা" ফরম্যাট অনুসরণ করে)। itemsJSON টা রেখে
   দেওয়া হয়েছে যাতে অন্য ডিভাইস থেকে সিঙ্ক করার সময় অ্যাপ আবার সেটা পার্স করতে পারে। */
function buildItemsSummaryText(items) {
  return (items || [])
    .map((it, i) => `${i + 1}) ${it.category} — ${it.variety} | ${it.breakdown} | ৳${it.total}`)
    .join("\n");
}

function sheetSaveSale(sale) {
  return jsonpRequest({
    action: "saveSale",
    invoiceNo: sale.invoiceNo,
    date: sale.date,
    customerName: sale.customerName,
    customerPhone: sale.customerPhone,
    customerDistrict: sale.customerDistrict || "",
    customerThana: sale.customerThana || "",
    customerAddress: sale.customerAddress || "",
    itemsSummary: buildItemsSummaryText(sale.items),
    itemsJSON: JSON.stringify(sale.items),
    itemsTotal: sale.itemsTotal,
    oldDueAmount: sale.oldDueAmount,
    grandTotal: sale.grandTotal,
    paidAmount: sale.paidAmount,
    dueAmount: sale.dueAmount,
  });
}

function sheetUpdateSale(fields) { return jsonpRequest({ action: "updateSale", ...fields }); }
