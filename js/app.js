/* ==========================================================================
   Green Agro Seeds — Core App Logic
   ========================================================================== */

const LS_SALES = "gas_sales";
const LS_INVOICE_COUNTER = "gas_invoice_counter";

let currentOrderItems = [];   // চলতি বিক্রয়ে যোগ হওয়া পণ্যের লাইন-আইটেম
let saleMode = "packet";      // "packet" | "bulk"

/* ---------------------------------------------------------------------- */
/* Navigation                                                              */
/* ---------------------------------------------------------------------- */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + pageId).classList.add("active");
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });
  if (pageId === "catalog") renderCatalog();
  if (pageId === "ledger") renderCustomerList();
  if (pageId === "history") renderHistory();
}

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ---------------------------------------------------------------------- */
/* Sale entry — dropdown population                                       */
/* ---------------------------------------------------------------------- */

function initSaleForm() {
  const catSel = document.getElementById("saleCategory");
  const catalog = getFullCatalog();
  catSel.innerHTML = catalog.map(c => `<option value="${c.id}">${c.category}</option>`).join("");
  populateVarieties();
  document.getElementById("saleCategory").addEventListener("change", populateVarieties);
  document.getElementById("saleVariety").addEventListener("change", populateQtyChips);
  setSaleMode("packet");
}

function populateVarieties() {
  const catId = document.getElementById("saleCategory").value;
  const cat = getFullCatalog().find(c => c.id === catId);
  const varSel = document.getElementById("saleVariety");
  varSel.innerHTML = cat.varieties.map((v, i) => `<option value="${i}">${v.name}</option>`).join("");
  populateQtyChips();
}

function populateQtyChips() {
  const catId = document.getElementById("saleCategory").value;
  const cat = getFullCatalog().find(c => c.id === catId);
  const variety = cat.varieties[document.getElementById("saleVariety").value];
  const wrap = document.getElementById("saleQtyChips");
  wrap.innerHTML = variety.options.map((o, i) =>
    `<button type="button" class="chip ${i === 0 ? 'active' : ''}" data-idx="${i}" onclick="selectQtyChip(${i})">${o.qty} ${o.unit}</button>`
  ).join("");
  wrap.dataset.selected = "0";
  updateLivePriceHint();
}

function selectQtyChip(idx) {
  const wrap = document.getElementById("saleQtyChips");
  wrap.dataset.selected = idx;
  [...wrap.children].forEach((c, i) => c.classList.toggle("active", i === idx));
  updateLivePriceHint();
}

function getSelectedOption() {
  const catId = document.getElementById("saleCategory").value;
  const cat = getFullCatalog().find(c => c.id === catId);
  const variety = cat.varieties[document.getElementById("saleVariety").value];
  const idx = Number(document.getElementById("saleQtyChips").dataset.selected || 0);
  return { cat, variety, option: variety.options[idx] };
}

function setSaleMode(mode) {
  saleMode = mode;
  document.querySelectorAll(".mode-toggle button").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  document.getElementById("packetCountWrap").style.display = mode === "packet" ? "block" : "none";
  document.getElementById("bulkKgWrap").style.display = mode === "bulk" ? "block" : "none";
  document.getElementById("bulkRateWrap").style.display = mode === "bulk" ? "block" : "none";
  updateLivePriceHint();
}

function updateLivePriceHint() {
  const { option } = getSelectedOption();
  const hint = document.getElementById("livePriceHint");
  if (!option) { hint.textContent = ""; return; }
  if (saleMode === "packet") {
    hint.textContent = `প্রতি প্যাকেট (${option.qty}${option.unit}) = ${formatTaka(option.packetPrice)}`;
  } else {
    const rate = document.getElementById("bulkRateType").value === "bulk" ? option.bulkPrice : option.kgPrice;
    hint.textContent = `প্রতি কেজি = ${formatTaka(rate)}`;
  }
}

/* ---------------------------------------------------------------------- */
/* Order building                                                         */
/* ---------------------------------------------------------------------- */

function addOrderItem() {
  const { cat, variety, option } = getSelectedOption();
  let result;

  if (saleMode === "packet") {
    const count = Number(document.getElementById("packetCount").value || 0);
    if (count <= 0) { toast("প্যাকেট সংখ্যা দিন"); return; }
    result = calcPacketSale(option, count);
    result.label = `${variety.name} — ${option.qty}${option.unit} × ${count} প্যাকেট`;
  } else {
    const totalKg = Number(document.getElementById("bulkKg").value || 0);
    if (totalKg <= 0) { toast("মোট কেজি দিন"); return; }
    const useBulk = document.getElementById("bulkRateType").value === "bulk";
    result = calcBulkSale(option, totalKg, useBulk);
    result.label = `${variety.name} — ${totalKg} কেজি (${useBulk ? "বাল্ক/লুজ" : "কেজি"} রেট)`;
  }

  currentOrderItems.push({
    category: cat.category,
    variety: variety.name,
    qty: option.qty,
    unit: option.unit,
    ...result,
  });

  renderOrderItems();
  updateGrandTotal();
}

function removeOrderItem(idx) {
  currentOrderItems.splice(idx, 1);
  renderOrderItems();
  updateGrandTotal();
}

function renderOrderItems() {
  const wrap = document.getElementById("orderItemsList");
  if (currentOrderItems.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p>এখনো কোনো পণ্য যোগ করা হয়নি</p></div>`;
    return;
  }
  wrap.innerHTML = currentOrderItems.map((it, i) => `
    <div class="order-item">
      <div>
        <div class="order-item__name">${it.label}</div>
        <div class="order-item__meta">${it.category} · ${it.breakdown}</div>
      </div>
      <div class="order-item__price">${formatTaka(it.total)}</div>
      <button class="order-item__remove" onclick="removeOrderItem(${i})" aria-label="বাদ দিন" title="বাদ দিন">×</button>
    </div>
  `).join("");
}

function updateGrandTotal() {
  const total = currentOrderItems.reduce((s, it) => s + it.total, 0);
  document.getElementById("grandTotal").textContent = formatTaka(total);
  const paid = Number(document.getElementById("paidAmount").value || 0);
  const due = Math.max(total - paid, 0);
  document.getElementById("dueAmountView").textContent = formatTaka(due);
  return total;
}

/* ---------------------------------------------------------------------- */
/* Save sale                                                               */
/* ---------------------------------------------------------------------- */

function nextInvoiceNo() {
  let n = Number(localStorage.getItem(LS_INVOICE_COUNTER) || "0") + 1;
  localStorage.setItem(LS_INVOICE_COUNTER, String(n));
  return "GAS-" + String(n).padStart(6, "0");
}

function getAllSales() {
  return JSON.parse(localStorage.getItem(LS_SALES) || "[]");
}

function saveSale() {
  if (currentOrderItems.length === 0) { toast("অন্তত একটি পণ্য যোগ করুন"); return null; }

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  if (!name || !phone) { toast("গ্রাহকের নাম ও ফোন নম্বর আবশ্যক"); return null; }

  const total = updateGrandTotal();
  const paid = Number(document.getElementById("paidAmount").value || 0);
  const due = Math.max(total - paid, 0);

  const sale = {
    invoiceNo: nextInvoiceNo(),
    date: new Date().toISOString(),
    customerName: name,
    customerPhone: normalizePhone(phone),
    customerAddress: address,
    items: currentOrderItems.map(it => ({ ...it })),
    grandTotal: total,
    paidAmount: paid,
    dueAmount: due,
  };

  const sales = getAllSales();
  sales.push(sale);
  localStorage.setItem(LS_SALES, JSON.stringify(sales));

  if (due > 0) {
    addLedgerEntry(sale.customerPhone, name, address, "debit", due, `চালান ${sale.invoiceNo} — বাকি`);
  }

  toast(`বিক্রয় সংরক্ষিত হয়েছে — ${sale.invoiceNo}`);
  return sale;
}

function resetSaleForm() {
  currentOrderItems = [];
  renderOrderItems();
  document.getElementById("custName").value = "";
  document.getElementById("custPhone").value = "";
  document.getElementById("custAddress").value = "";
  document.getElementById("paidAmount").value = "";
  updateGrandTotal();
}

function normalizePhone(phone) {
  let p = String(phone).trim().replace(/[\s\-]/g, "");
  p = p.replace(/^\+?88/, "");
  if (p.length === 10 && p.startsWith("1")) p = "0" + p;
  return p;
}

/* ---------------------------------------------------------------------- */
/* Manual product add (catalog page)                                      */
/* ---------------------------------------------------------------------- */

function addCustomProduct(e) {
  e.preventDefault();
  const f = e.target;
  const product = {
    id: "custom-" + Date.now(),
    category: f.category.value.trim(),
    varieties: [{
      name: f.variety.value.trim(),
      options: [{
        qty: Number(f.qty.value),
        unit: f.unit.value,
        packetPrice: Number(f.packetPrice.value),
        kgPrice: Number(f.kgPrice.value),
        bulkPrice: Number(f.bulkPrice.value),
        retailPrice: Number(f.retailPrice.value),
      }]
    }]
  };
  saveCustomProduct(product);
  f.reset();
  toast("নতুন পণ্য যোগ হয়েছে");
  renderCatalog();
  initSaleForm();
}

/* ---------------------------------------------------------------------- */
/* Init                                                                    */
/* ---------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  initSaleForm();
  renderOrderItems();
  document.getElementById("paidAmount").addEventListener("input", updateGrandTotal);
  document.getElementById("bulkRateType").addEventListener("change", updateLivePriceHint);
  document.getElementById("customProductForm").addEventListener("submit", addCustomProduct);
  showPage("sale");
});
