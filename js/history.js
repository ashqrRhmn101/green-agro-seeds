/* ==========================================================================
   Sales History + Product Catalog rendering
   ========================================================================== */

function renderHistory() {
  const sales = getAllSales().slice().reverse();
  const totalRevenue = sales.reduce((s, x) => s + x.grandTotal, 0);
  const totalDue = sales.reduce((s, x) => s + x.dueAmount, 0);

  document.getElementById("histCount").textContent = sales.length.toLocaleString("bn-BD");
  document.getElementById("histRevenue").textContent = formatTaka(totalRevenue);
  document.getElementById("histDue").textContent = formatTaka(totalDue);
  document.getElementById("histAvg").textContent = formatTaka(sales.length ? Math.round(totalRevenue / sales.length) : 0);

  const wrap = document.getElementById("historyTableWrap");
  if (sales.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p>এখনো কোনো বিক্রয় রেকর্ড নেই</p></div>`;
    return;
  }

  wrap.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>চালান নং</th><th>তারিখ</th><th>গ্রাহক</th><th>পণ্য</th><th>মোট</th><th>পরিশোধ</th><th>বাকি</th><th></th>
        </tr></thead>
        <tbody>
          ${sales.map(s => `
            <tr>
              <td class="en">${s.invoiceNo}</td>
              <td>${new Date(s.date).toLocaleDateString("bn-BD")}</td>
              <td>${s.customerName}<br><span style="color:var(--ink-faint);font-size:11.5px">${s.customerPhone}</span></td>
              <td>${s.items.length} আইটেম</td>
              <td class="en">${formatTaka(s.grandTotal)}</td>
              <td class="en">${formatTaka(s.paidAmount)}</td>
              <td class="en" style="color:${s.dueAmount > 0 ? 'var(--rust)' : 'var(--green-2)'}">${formatTaka(s.dueAmount)}</td>
              <td>
                <button class="btn btn--ghost btn--sm" onclick="downloadInvoicePDF('${s.invoiceNo}')">ইনভয়েস</button>
                <button class="btn btn--ghost btn--sm" onclick="downloadChalanPDF('${s.invoiceNo}')">চালান</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function findSaleByInvoice(invoiceNo) {
  return getAllSales().find(s => s.invoiceNo === invoiceNo);
}

/* ---------------------------------------------------------------------- */
/* Product catalog page                                                    */
/* ---------------------------------------------------------------------- */

function renderCatalog() {
  const catalog = getFullCatalog();
  const wrap = document.getElementById("catalogGrid");
  const cards = [];
  catalog.forEach(cat => {
    cat.varieties.forEach(v => {
      if (v.options.length === 0) {
        cards.push(`
          <div class="card product-card">
            <p class="product-card__cat">${cat.category}</p>
            <p class="product-card__name">${v.name}</p>
            <p style="font-size:12.5px;color:var(--ink-faint);margin:0">এখনো কোনো দাম/পরিমাণ যোগ করা হয়নি</p>
          </div>
        `);
      }
      v.options.forEach(o => {
        const argStr = `'${cat.id}', '${escapeJs(v.name)}', ${o.qty}, '${o.unit}'`;
        cards.push(`
          <div class="card product-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <p class="product-card__cat">${cat.category}</p>
                <p class="product-card__name">${v.name} <span style="color:var(--ink-faint);font-weight:400;font-size:13px">(${o.qty}${o.unit})</span></p>
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0">
                <button class="icon-btn" title="এডিট করুন" onclick="openEditProductModal(${argStr})">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" title="মুছে ফেলুন" onclick="confirmDeleteProduct(${argStr})">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            </div>
            <div class="product-card__row"><span>প্যাকেট প্রতি</span><b>${formatTaka(o.packetPrice)}</b></div>
            <div class="product-card__row"><span>কেজি প্রতি</span><b>${formatTaka(o.kgPrice)}</b></div>
            <div class="product-card__row"><span>বাল্ক/লুজ (কেজি)</span><b>${formatTaka(o.bulkPrice)}</b></div>
            <div class="product-card__row"><span>খুচরা মূল্য</span><b>${formatTaka(o.retailPrice)}</b></div>
          </div>
        `);
      });
    });
  });
  wrap.innerHTML = cards.join("") || `<div class="empty-state"><p>কোনো পণ্য নেই</p></div>`;
}

function escapeJs(str) {
  return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
