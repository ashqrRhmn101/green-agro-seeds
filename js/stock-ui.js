/* ==========================================================================
   Stock Inventory — পেজ রেন্ডারিং
   ========================================================================== */

const LOW_STOCK_THRESHOLD_KG = 5; // এর নিচে নামলে "স্টক কম" সতর্কতা দেখাবে

let stockSearchQuery = "";

function onStockSearchInput(value) {
  stockSearchQuery = value;
  renderStockPage();
}

function filterStockRows(rows) {
  const q = stockSearchQuery.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(r => (r.category || "").toLowerCase().includes(q) || (r.variety || "").toLowerCase().includes(q));
}

/* ---------------------------------------------------------------------- */
/* এন্ট্রি ফর্ম — ক্যাটাগরি/জাত পণ্য তালিকা থেকে                            */
/* ---------------------------------------------------------------------- */

function initStockForm() {
  const catSel = document.getElementById("stockCategory");
  // console.log(catSel);
  if (!catSel) return;
  const catalog = getFullCatalog();
  catSel.innerHTML = catalog.map(c => `<option value="${c.category}">${c.category}</option>`).join("");
  populateStockVarieties();
  catSel.onchange = populateStockVarieties;
  updateStockLivePreview();
}

function populateStockVarieties() {
  const catName = document.getElementById("stockCategory").value;
  const cat = getFullCatalog().find(c => c.category === catName);
  const varSel = document.getElementById("stockVariety");
  varSel.innerHTML = (cat ? cat.varieties : []).map(v => `<option value="${v.name}">${v.name}</option>`).join("");
  fillExistingStockHint();
}

function fillExistingStockHint() {
  const catName = document.getElementById("stockCategory").value;
  const varName = document.getElementById("stockVariety").value;
  const existing = findStockEntry(catName, varName);
  const hint = document.getElementById("stockExistingHint");
  if (existing) {
    hint.textContent = `বর্তমানে মজুদ আছে ${existing.stockKg.toLocaleString("bn-BD")} কেজি (ক্রয়মূল্য ৳${existing.costPricePerKg}/কেজি) — নতুন পরিমাণ এর সাথে যোগ হয়ে ওজন-গড় দামে আপডেট হবে`;
    hint.style.display = "block";
  } else {
    hint.style.display = "none";
  }
}

function updateStockLivePreview() {
  const kg = Number(document.getElementById("stockKgInput").value || 0);
  const cost = Number(document.getElementById("stockCostInput").value || 0);
  const selling = Number(document.getElementById("stockSellingInput").value || 0);
  document.getElementById("stockTotalCostPreview").textContent = formatTaka(Math.round(kg * cost));
  document.getElementById("stockTotalSellingPreview").textContent = formatTaka(Math.round(kg * selling));
}

async function submitStockEntry(e) {
  e.preventDefault();
  const category = document.getElementById("stockCategory").value;
  const variety = document.getElementById("stockVariety").value;
  const kg = Number(document.getElementById("stockKgInput").value || 0);
  const cost = Number(document.getElementById("stockCostInput").value || 0);
  const selling = Number(document.getElementById("stockSellingInput").value || 0);
  const remarks = document.getElementById("stockRemarksInput").value.trim();

  if (!category || !variety) { toast("ক্যাটাগরি ও জাত নির্বাচন করুন"); return; }
  if (kg <= 0) { toast("সঠিক পরিমাণ (কেজি) দিন"); return; }

  toast("স্টক আপডেট হচ্ছে...");
  await restockProduct(category, variety, kg, cost, selling, remarks);

  document.getElementById("stockEntryForm").reset();
  document.getElementById("stockTotalCostPreview").textContent = "৳ 0";
  document.getElementById("stockTotalSellingPreview").textContent = "৳ 0";
  fillExistingStockHint();
  renderStockPage();
  toast("স্টক সংরক্ষিত হয়েছে");
}

/* ---------------------------------------------------------------------- */
/* সামারি কার্ড + স্টক তালিকা                                              */
/* ---------------------------------------------------------------------- */

function renderStockPage() {
  const all = getStockList();
  const rows = filterStockRows(all);

  const totalProducts = rows.length;
  const totalKg = rows.reduce((s, r) => s + Number(r.stockKg || 0), 0);
  const totalCostValue = rows.reduce((s, r) => s + Number(r.stockKg || 0) * Number(r.costPricePerKg || 0), 0);
  const totalSellingValue = rows.reduce((s, r) => s + Number(r.stockKg || 0) * Number(r.sellingPricePerKg || 0), 0);
  const potentialProfit = totalSellingValue - totalCostValue;
  const lowStockCount = rows.filter(r => Number(r.stockKg) <= LOW_STOCK_THRESHOLD_KG).length;

  document.getElementById("stockTotalProducts").textContent = totalProducts.toLocaleString("bn-BD");
  document.getElementById("stockTotalKg").textContent = totalKg.toLocaleString("bn-BD") + " কেজি";
  document.getElementById("stockTotalCostValue").textContent = formatTaka(Math.round(totalCostValue));
  document.getElementById("stockTotalSellingValue").textContent = formatTaka(Math.round(totalSellingValue));
  document.getElementById("stockPotentialProfit").textContent = formatTaka(Math.round(potentialProfit));
  document.getElementById("stockLowCount").textContent = lowStockCount.toLocaleString("bn-BD");

  const wrap = document.getElementById("stockGrid");
  if (all.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p>এখনো কোনো স্টক এন্ট্রি নেই — উপরের ফর্ম থেকে যোগ করুন</p></div>`;
    return;
  }
  if (rows.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p>সার্চের সাথে মিলে এমন কিছু পাওয়া যায়নি</p></div>`;
    return;
  }

  wrap.innerHTML = rows
    .slice()
    .sort((a, b) => a.category.localeCompare(b.category, "bn") || a.variety.localeCompare(b.variety, "bn"))
    .map(r => {
      const low = Number(r.stockKg) <= LOW_STOCK_THRESHOLD_KG;
      const empty = Number(r.stockKg) <= 0;
      const totalCost = Number(r.stockKg || 0) * Number(r.costPricePerKg || 0);
      const totalSelling = Number(r.stockKg || 0) * Number(r.sellingPricePerKg || 0);
      return `
        <div class="card product-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <p class="product-card__cat">${r.category}</p>
              <p class="product-card__name">${r.variety}</p>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0">
              <button class="icon-btn" title="সংশোধন করুন" onclick="openEditStockModal('${escapeJs(r.id)}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button class="icon-btn icon-btn--danger" title="মুছে ফেলুন" onclick="confirmDeleteStock('${escapeJs(r.id)}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
              </button>
            </div>
          </div>
          <div class="product-card__row"><span>স্টক পরিমাণ</span><b style="color:${empty ? 'var(--rust)' : low ? 'var(--gold)' : 'var(--ink)'}">${Number(r.stockKg).toLocaleString("bn-BD")} কেজি</b></div>
          <div class="product-card__row"><span>ক্রয়মূল্য/কেজি</span><b>${formatTaka(r.costPricePerKg)}</b></div>
          <div class="product-card__row"><span>বিক্রয়মূল্য/কেজি</span><b>${formatTaka(r.sellingPricePerKg)}</b></div>
          <div class="product-card__row"><span>মোট ক্রয়মূল্য</span><b>${formatTaka(Math.round(totalCost))}</b></div>
          <div class="product-card__row"><span>মোট বিক্রয়মূল্য</span><b>${formatTaka(Math.round(totalSelling))}</b></div>
          ${r.remarks ? `<div class="product-card__row"><span>মন্তব্য</span><b style="font-weight:400;color:var(--ink-muted)">${r.remarks}</b></div>` : ""}
          ${empty ? `<span class="badge badge--due" style="margin-top:10px">স্টক শেষ</span>` : low ? `<span class="badge badge--gold" style="margin-top:10px">স্টক কম</span>` : ""}
        </div>
      `;
    }).join("");
}

/* ---------------------------------------------------------------------- */
/* Edit / Delete                                                           */
/* ---------------------------------------------------------------------- */

let editingStockId = null;

function openEditStockModal(id) {
  const entry = getStockList().find(s => s.id === id);
  if (!entry) return;
  editingStockId = id;
  document.getElementById("editStockTitle").textContent = `${entry.category} — ${entry.variety}`;
  const f = document.getElementById("editStockForm");
  f.stockKg.value = entry.stockKg;
  f.costPricePerKg.value = entry.costPricePerKg;
  f.sellingPricePerKg.value = entry.sellingPricePerKg;
  f.remarks.value = entry.remarks || "";
  document.getElementById("editStockModal").classList.add("open");
}

function closeEditStockModal() {
  document.getElementById("editStockModal").classList.remove("open");
  editingStockId = null;
}

function submitEditStock(e) {
  e.preventDefault();
  if (!editingStockId) return;
  const f = e.target;
  setStockFields(editingStockId, {
    stockKg: Number(f.stockKg.value),
    costPricePerKg: Number(f.costPricePerKg.value),
    sellingPricePerKg: Number(f.sellingPricePerKg.value),
    remarks: f.remarks.value.trim(),
  });
  closeEditStockModal();
  renderStockPage();
  toast("স্টকের তথ্য হালনাগাদ হয়েছে");
}

function confirmDeleteStock(id) {
  const entry = getStockList().find(s => s.id === id);
  if (!entry) return;
  if (!confirm(`"${entry.category} — ${entry.variety}" এর স্টক এন্ট্রিটি মুছে ফেলতে চান?`)) return;
  deleteStockEntry(id);
  renderStockPage();
  toast("মুছে ফেলা হয়েছে");
}

/* ---------------------------------------------------------------------- */
/* CSV / PDF এক্সপোর্ট                                                     */
/* ---------------------------------------------------------------------- */

function exportStockCSV() {
  const rows = filterStockRows(getStockList());
  const headers = ["ক্যাটাগরি", "জাত", "স্টক (কেজি)", "ক্রয়মূল্য/কেজি", "বিক্রয়মূল্য/কেজি", "মোট ক্রয়মূল্য", "মোট বিক্রয়মূল্য", "মন্তব্য"];
  const csvRows = rows.map(r => [
    r.category, r.variety, r.stockKg, r.costPricePerKg, r.sellingPricePerKg,
    Math.round(r.stockKg * r.costPricePerKg), Math.round(r.stockKg * r.sellingPricePerKg), r.remarks || "",
  ]);
  downloadCSV(`stock-inventory-${Date.now()}.csv`, [headers, ...csvRows]);
}

function exportStockPDF() {
  const rows = filterStockRows(getStockList());
  const headers = ["ক্যাটাগরি", "জাত", "স্টক (কেজি)", "ক্রয়/কেজি", "বিক্রয়/কেজি", "মোট ক্রয়মূল্য", "মোট বিক্রয়মূল্য"];
  const pdfRows = rows.map(r => [
    r.category, r.variety, Number(r.stockKg).toLocaleString("bn-BD"),
    formatTaka(r.costPricePerKg), formatTaka(r.sellingPricePerKg),
    formatTaka(Math.round(r.stockKg * r.costPricePerKg)), formatTaka(Math.round(r.stockKg * r.sellingPricePerKg)),
  ]);
  const totalCost = rows.reduce((s, r) => s + r.stockKg * r.costPricePerKg, 0);
  const totalSelling = rows.reduce((s, r) => s + r.stockKg * r.sellingPricePerKg, 0);
  const summaryLines = [
    ["মোট পণ্য সংখ্যা", rows.length.toLocaleString("bn-BD")],
    ["সর্বমোট স্টক", rows.reduce((s, r) => s + Number(r.stockKg || 0), 0).toLocaleString("bn-BD") + " কেজি"],
    ["মোট ক্রয় মূল্য", formatTaka(Math.round(totalCost))],
    ["মোট বিক্রয় মূল্য", formatTaka(Math.round(totalSelling))],
    ["সম্ভাব্য মুনাফা", formatTaka(Math.round(totalSelling - totalCost))],
  ];
  downloadTablePDF("স্টক ইনভেন্টরি রিপোর্ট", headers, pdfRows, `stock-inventory-${Date.now()}.pdf`, summaryLines);
}
