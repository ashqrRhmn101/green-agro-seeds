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
  populateDistrictSelect("custDistrict", "custThana");
  populateDistrictSelect("newCustDistrict", "newCustThana");
}

/* ---------------------------------------------------------------------- */
/* জেলা / থানা ড্রপডাউন (data/bangladesh.js থেকে)                          */
/* ---------------------------------------------------------------------- */

function populateDistrictSelect(districtSelectId, thanaSelectId) {
  const distSel = document.getElementById(districtSelectId);
  const thanaSel = document.getElementById(thanaSelectId);
  if (!distSel || !thanaSel) return;
  const districts = Object.keys(bangladeshData);
  distSel.innerHTML = `<option value="">— জেলা নির্বাচন করুন —</option>` +
    districts.map(d => `<option value="${d}">${d}</option>`).join("");
  thanaSel.innerHTML = `<option value="">— প্রথমে জেলা নির্বাচন করুন —</option>`;
  distSel.onchange = () => populateThanaSelect(distSel.value, thanaSelectId);
}

function populateThanaSelect(district, thanaSelectId) {
  const thanaSel = document.getElementById(thanaSelectId);
  const thanas = bangladeshData[district] || [];
  thanaSel.innerHTML = thanas.length
    ? `<option value="">— থানা নির্বাচন করুন —</option>` + thanas.map(t => `<option value="${t}">${t}</option>`).join("")
    : `<option value="">— প্রথমে জেলা নির্বাচন করুন —</option>`;
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
  if (!option) { toast("এই জাতের জন্য এখনো কোনো পরিমাণ/দাম যোগ করা হয়নি — '+ Add' দিয়ে যোগ করুন"); return; }
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
  const itemsTotal = currentOrderItems.reduce((s, it) => s + it.total, 0);
  const oldDue = Number(document.getElementById("oldDueAmount").value || 0);
  const total = itemsTotal + oldDue;
  document.getElementById("grandTotal").textContent = formatTaka(total);

  const hint = document.getElementById("oldDueHint");
  if (oldDue > 0) {
    hint.textContent = `(পণ্য ${formatTaka(itemsTotal)} + পুরাতন বকেয়া ${formatTaka(oldDue)})`;
    hint.style.display = "block";
  } else {
    hint.style.display = "none";
  }

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
  const district = document.getElementById("custDistrict").value;
  const thana = document.getElementById("custThana").value;
  const address = document.getElementById("custAddress").value.trim();
  const varietyNote = document.getElementById("custNote").value;
  if (!name || !phone) { toast("গ্রাহকের নাম ও ফোন নম্বর আবশ্যক"); return null; }

  const oldDue = Number(document.getElementById("oldDueAmount").value || 0);
  const itemsTotal = currentOrderItems.reduce((s, it) => s + it.total, 0);
  const total = updateGrandTotal();
  const paid = Number(document.getElementById("paidAmount").value || 0);
  const due = Math.max(total - paid, 0);

  const sale = {
    invoiceNo: nextInvoiceNo(),
    date: new Date().toISOString(),
    customerName: name,
    customerPhone: normalizePhone(phone),
    customerDistrict: district,
    customerThana: thana,
    customerAddress: address,
    items: currentOrderItems.map(it => ({ ...it })),
    itemsTotal,
    oldDueAmount: oldDue,
    grandTotal: total,
    paidAmount: paid,
    dueAmount: due,
  };

  const sales = getAllSales();
  sales.push(sale);
  localStorage.setItem(LS_SALES, JSON.stringify(sales));

  ensureCustomerProfile(sale.customerPhone, { name, address, district, thana, varietyNote });

  if (due > 0) {
    const note = oldDue > 0
      ? `চালান ${sale.invoiceNo} — বাকি (পুরাতন বকেয়া ${formatTaka(oldDue)} সহ)`
      : `চালান ${sale.invoiceNo} — বাকি`;
    addLedgerEntry(sale.customerPhone, name, address, "debit", due, note);
  }

  toast(`বিক্রয় সংরক্ষিত হয়েছে — ${sale.invoiceNo}`);
  return sale;
}

function resetSaleForm() {
  currentOrderItems = [];
  renderOrderItems();
  document.getElementById("custName").value = "";
  document.getElementById("custPhone").value = "";
  document.getElementById("custDistrict").value = "";
  populateThanaSelect("", "custThana");
  document.getElementById("custAddress").value = "";
  document.getElementById("custNote").value = "";
  document.getElementById("oldDueAmount").value = "";
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
/* Edit / Delete product (catalog page)                                    */
/* ---------------------------------------------------------------------- */

let editingOption = null; // { catId, varietyName, qty, unit }

function openEditProductModal(catId, varietyName, qty, unit) {
  const cat = getFullCatalog().find(c => c.id === catId);
  const variety = cat.varieties.find(v => v.name === varietyName);
  const option = variety.options.find(o => o.qty === qty && o.unit === unit);
  editingOption = { catId, varietyName, qty, unit };

  const f = document.getElementById("editProductForm");
  f.qty.value = option.qty;
  f.unit.value = option.unit;
  f.packetPrice.value = option.packetPrice;
  f.kgPrice.value = option.kgPrice;
  f.bulkPrice.value = option.bulkPrice;
  f.retailPrice.value = option.retailPrice;
  document.getElementById("editProductTitle").textContent = `${cat.category} — ${varietyName}`;
  document.getElementById("editProductModal").classList.add("open");
}

function closeEditProductModal() {
  document.getElementById("editProductModal").classList.remove("open");
  editingOption = null;
}

function submitEditProduct(e) {
  e.preventDefault();
  if (!editingOption) return;
  const f = e.target;
  const { catId, varietyName, qty, unit } = editingOption;
  setOptionOverride(catId, varietyName, qty, unit, {
    qty: Number(f.qty.value),
    unit: f.unit.value,
    packetPrice: Number(f.packetPrice.value),
    kgPrice: Number(f.kgPrice.value),
    bulkPrice: Number(f.bulkPrice.value),
    retailPrice: Number(f.retailPrice.value),
  });
  closeEditProductModal();
  renderCatalog();
  initSaleForm();
  toast("পণ্যের তথ্য হালনাগাদ হয়েছে");
}

function confirmDeleteProduct(catId, varietyName, qty, unit) {
  if (!confirm(`"${varietyName}" (${qty}${unit}) — এই এন্ট্রিটি মুছে ফেলতে চান?`)) return;
  deleteOption(catId, varietyName, qty, unit);
  renderCatalog();
  initSaleForm();
  toast("মুছে ফেলা হয়েছে");
}

/* ---------------------------------------------------------------------- */
/* Quick add: new category / variety (from Sale Entry page)                */
/* ---------------------------------------------------------------------- */

function openQuickAddCategory() {
  document.getElementById("quickAddModalTitle").textContent = "নতুন ক্যাটাগরি যোগ করুন";
  document.getElementById("quickAddForm").dataset.mode = "category";
  document.getElementById("quickAddCategoryField").style.display = "block";
  document.getElementById("quickAddModal").classList.add("open");
}

function openQuickAddVariety() {
  const catSel = document.getElementById("saleCategory");
  if (!catSel.value) { toast("প্রথমে একটি ক্যাটাগরি নির্বাচন করুন"); return; }
  document.getElementById("quickAddModalTitle").textContent = "নতুন জাতের নাম যোগ করুন";
  document.getElementById("quickAddForm").dataset.mode = "variety";
  document.getElementById("quickAddForm").dataset.catId = catSel.value;
  document.getElementById("quickAddCategoryField").style.display = "none";
  document.getElementById("quickAddModal").classList.add("open");
}

function closeQuickAddModal() {
  document.getElementById("quickAddModal").classList.remove("open");
  document.getElementById("quickAddForm").reset();
}

function submitQuickAdd(e) {
  e.preventDefault();
  const f = e.target;
  const mode = f.dataset.mode;
  const varietyName = f.varietyName.value.trim();
  if (!varietyName) return;

  let newCatId;
  if (mode === "category") {
    const categoryName = f.categoryName.value.trim();
    if (!categoryName) { toast("ক্যাটাগরির নাম দিন"); return; }
    newCatId = addCategoryOrVariety({ categoryName, varietyName });
  } else {
    newCatId = f.dataset.catId;
    addCategoryOrVariety({ categoryId: newCatId, varietyName });
  }

  closeQuickAddModal();
  initSaleForm();
  document.getElementById("saleCategory").value = newCatId;
  populateVarieties();
  const varSel = document.getElementById("saleVariety");
  [...varSel.options].forEach((opt, i) => { if (opt.textContent === varietyName) varSel.value = i; });
  populateQtyChips();
  toast("যোগ হয়েছে — এখন এর জন্য পরিমাণ/দাম যোগ করুন");
}

/* ---------------------------------------------------------------------- */
/* Quick add: custom quantity option (from Sale Entry page)                */
/* ---------------------------------------------------------------------- */

function openQuickAddQty() {
  if (!document.getElementById("saleVariety").value && document.getElementById("saleVariety").options.length === 0) {
    toast("প্রথমে একটি জাত নির্বাচন করুন"); return;
  }
  document.getElementById("quickAddQtyModal").classList.add("open");
}

function closeQuickAddQtyModal() {
  document.getElementById("quickAddQtyModal").classList.remove("open");
  document.getElementById("quickAddQtyForm").reset();
}

function submitQuickAddQty(e) {
  e.preventDefault();
  const f = e.target;
  const { cat, variety } = getSelectedOption();
  const option = {
    qty: Number(f.qty.value),
    unit: f.unit.value,
    packetPrice: Number(f.packetPrice.value),
    kgPrice: Number(f.kgPrice.value),
    bulkPrice: Number(f.bulkPrice.value),
    retailPrice: Number(f.retailPrice.value),
  };
  addCustomOption(cat.id, variety.name, option);
  closeQuickAddQtyModal();
  populateQtyChips();
  const wrap = document.getElementById("saleQtyChips");
  selectQtyChip(wrap.children.length - 1);
  toast("নতুন পরিমাণ যোগ হয়েছে");
}

/* ---------------------------------------------------------------------- */
/* Init                                                                    */
/* ---------------------------------------------------------------------- */

window.addEventListener("DOMContentLoaded", () => {
  initSaleForm();
  renderOrderItems();
  document.getElementById("paidAmount").addEventListener("input", updateGrandTotal);
  document.getElementById("oldDueAmount").addEventListener("input", updateGrandTotal);
  document.getElementById("bulkRateType").addEventListener("change", updateLivePriceHint);
  document.getElementById("customProductForm").addEventListener("submit", addCustomProduct);
  document.getElementById("editProductForm").addEventListener("submit", submitEditProduct);
  document.getElementById("quickAddForm").addEventListener("submit", submitQuickAdd);
  document.getElementById("quickAddQtyForm").addEventListener("submit", submitQuickAddQty);
  showPage("sale");
});
