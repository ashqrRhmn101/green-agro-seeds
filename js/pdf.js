/* ==========================================================================
   PDF Generation — html2canvas + jsPDF (CDN, index.html-এ লোড হয়)
   দুই ধরনের PDF:
   - Invoice : দামসহ, পূর্ণাঙ্গ বিল
   - Chalan  : শুধু পণ্য/পরিমাণ/ওজন + গ্রাহকের নাম-ঠিকানা, কোনো দাম থাকবে না
   ========================================================================== */

function itemTotalWeightKg(items) {
  return items.reduce((sum, it) => {
    const grams = it.mode === "bulk" ? it.totalKg * 1000 : it.qty * it.count;
    return sum + grams;
  }, 0) / 1000;
}

function invoiceHeaderHTML(sale, subtitle) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #136831;padding-bottom:16px;margin-bottom:20px">
      <div>
        <div style="font-family:'Fraunces',serif;font-size:26px;font-weight:600;color:#136831">Green Agro Seeds</div>
        <div style="font-size:12px;color:#56685C">All Kinds of Seeds Importer & Wholesaler</div>
        <div style="font-size:11px;color:#8B9A8F;margin-top:2px">Hazi Kutir, Kalibari Road, Kotchandpur, Jhenaidah-7330 · +880 1717-146341</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:15px;font-weight:700;color:#142B1B">${subtitle}</div>
        <div style="font-size:12px;color:#56685C;margin-top:4px">নং: <b class="en">${sale.invoiceNo}</b></div>
        <div style="font-size:12px;color:#56685C">তারিখ: ${new Date(sale.date).toLocaleDateString("bn-BD")}</div>
      </div>
    </div>
  `;
}

function customerBlockHTML(sale) {
  return `
    <div style="background:#F2F1E6;border-radius:8px;padding:12px 16px;margin-bottom:18px;font-size:13px">
      <div><b>গ্রাহকের নাম:</b> ${sale.customerName}</div>
      <div><b>ফোন:</b> <span class="en">${sale.customerPhone}</span></div>
      ${sale.customerAddress ? `<div><b>ঠিকানা:</b> ${sale.customerAddress}</div>` : ""}
    </div>
  `;
}

function buildInvoiceHTML(sale) {
  const rows = sale.items.map((it, i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${it.category} — ${it.variety}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${it.breakdown}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right" class="en">${it.total.toLocaleString("bn-BD")}</td>
    </tr>
  `).join("");

  return `
    <div style="font-family:'Hind Siliguri',sans-serif;padding:32px;background:#fff;color:#142B1B">
      ${invoiceHeaderHTML(sale, "ইনভয়েস")}
      ${customerBlockHTML(sale)}
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#EAF3E4">
            <th style="padding:8px;text-align:left">#</th>
            <th style="padding:8px;text-align:left">পণ্য</th>
            <th style="padding:8px;text-align:left">হিসাব</th>
            <th style="padding:8px;text-align:right">টাকা</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-top:14px">
        <table style="font-size:13px;min-width:240px">
          <tr><td style="padding:4px 8px">সর্বমোট</td><td style="padding:4px 8px;text-align:right;font-weight:700" class="en">৳ ${sale.grandTotal.toLocaleString("bn-BD")}</td></tr>
          <tr><td style="padding:4px 8px">পরিশোধিত</td><td style="padding:4px 8px;text-align:right" class="en">৳ ${sale.paidAmount.toLocaleString("bn-BD")}</td></tr>
          <tr><td style="padding:4px 8px;color:${sale.dueAmount > 0 ? '#B5502E' : '#0d4e24'}">বাকি</td><td style="padding:4px 8px;text-align:right;font-weight:700;color:${sale.dueAmount > 0 ? '#B5502E' : '#0d4e24'}" class="en">৳ ${sale.dueAmount.toLocaleString("bn-BD")}</td></tr>
        </table>
      </div>
      <div style="margin-top:36px;display:flex;justify-content:space-between;font-size:11px;color:#8B9A8F">
        <div>ধন্যবাদান্তে — Green Agro Seeds</div>
        <div>স্বাক্ষর: ______________</div>
      </div>
    </div>
  `;
}

function buildChalanHTML(sale) {
  const totalKg = itemTotalWeightKg(sale.items);
  const rows = sale.items.map((it, i) => {
    const kg = (it.mode === "bulk" ? it.totalKg : (it.qty * it.count) / 1000).toFixed(2);
    const qtyDesc = it.mode === "bulk" ? `${it.totalKg} কেজি` : `${it.qty}${it.unit} × ${it.count} প্যাকেট`;
    return `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${it.category} — ${it.variety}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${qtyDesc}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right" class="en">${kg} কেজি</td>
      </tr>
    `;
  }).join("");

  return `
    <div style="font-family:'Hind Siliguri',sans-serif;padding:32px;background:#fff;color:#142B1B">
      ${invoiceHeaderHTML(sale, "মালামাল চালান")}
      ${customerBlockHTML(sale)}
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#EAF3E4">
            <th style="padding:8px;text-align:left">#</th>
            <th style="padding:8px;text-align:left">পণ্য</th>
            <th style="padding:8px;text-align:left">পরিমাণ</th>
            <th style="padding:8px;text-align:right">ওজন</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-top:14px">
        <table style="font-size:13px;min-width:220px">
          <tr><td style="padding:4px 8px;font-weight:700">মোট ওজন</td><td style="padding:4px 8px;text-align:right;font-weight:700" class="en">${totalKg.toFixed(2)} কেজি</td></tr>
        </table>
      </div>
      <div style="margin-top:8px;font-size:11px;color:#8B9A8F">* এই চালানে কোনো মূল্য উল্লেখ নেই — শুধুমাত্র মালামাল বুঝিয়ে দেওয়ার প্রমাণপত্র</div>
      <div style="margin-top:36px;display:flex;justify-content:space-between;font-size:11px;color:#8B9A8F">
        <div>প্রেরক স্বাক্ষর: ______________</div>
        <div>প্রাপক স্বাক্ষর: ______________</div>
      </div>
    </div>
  `;
}

async function renderToPDF(html, filename) {
  const root = document.getElementById("print-root");
  root.innerHTML = html;
  root.style.left = "0px";
  root.style.position = "absolute";
  root.style.top = "-99999px";

  const canvas = await html2canvas(root.firstElementChild, { scale: 1.5, useCORS: true });
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  const pdfWidth = 210; // A4 mm
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [pdfWidth, pdfHeight] });
  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);

  root.style.left = "-9999px";
  root.innerHTML = "";
}

function downloadInvoicePDF(invoiceNo) {
  const sale = findSaleByInvoice(invoiceNo);
  if (!sale) { toast("বিক্রয় খুঁজে পাওয়া যায়নি"); return; }
  renderToPDF(buildInvoiceHTML(sale), `${sale.invoiceNo}-invoice.pdf`);
}

function downloadChalanPDF(invoiceNo) {
  const sale = findSaleByInvoice(invoiceNo);
  if (!sale) { toast("বিক্রয় খুঁজে পাওয়া যায়নি"); return; }
  renderToPDF(buildChalanHTML(sale), `${sale.invoiceNo}-chalan.pdf`);
}

/* সরাসরি বিক্রয় ফর্ম থেকে সেভ করার পর তাৎক্ষণিক ডাউনলোড */
function saveSaleAndDownload(type) {
  const sale = saveSale();
  if (!sale) return;
  if (type === "invoice") downloadInvoicePDF(sale.invoiceNo);
  if (type === "chalan") downloadChalanPDF(sale.invoiceNo);
  resetSaleForm();
}
