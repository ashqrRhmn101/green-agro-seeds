/* ==========================================================================
   PDF Generation — html2canvas + jsPDF (CDN, index.html-এ লোড হয়)
   দুই ধরনের PDF:
   - Invoice : দামসহ, পূর্ণাঙ্গ বিল
   - Chalan  : শুধু পণ্য/পরিমাণ/ওজন + গ্রাহকের নাম-ঠিকানা, কোনো দাম থাকবে না
   হেডারে কোম্পানির নাম/ঠিকানা মাঝ-বরাবর, এবং একটা স্বতন্ত্র ব্র্যান্ডেড ফুটার
   (ডেভেলপার ক্রেডিট + LinkedIn) দেওয়া আছে — যাতে PDF-টা ইউনিক দেখায়।
   ফিক্সড-উইথ কনটেইনার + explicit html2canvas width দিয়ে ক্যাপচার করা হয়,
   যাতে ডান পাশের কোনো অংশ কেটে না যায়।
   ========================================================================== */

const PDF_PAGE_WIDTH = 794; // ~210mm @ 96dpi — A4 width in px

function itemTotalWeightKg(items) {
  return items.reduce((sum, it) => {
    const grams = it.mode === "bulk" ? it.totalKg * 1000 : it.qty * it.count;
    return sum + grams;
  }, 0) / 1000;
}

function invoiceHeaderHTML(sale, subtitle) {
  return `
    <div style="text-align:center;border-bottom:3px solid #136831;padding-bottom:18px;margin-bottom:20px">
      <div style="display:inline-flex;align-items:center;gap:10px;justify-content:center">
        <div style="width:34px;height:34px;border-radius:50%;border:1.6px solid #136831;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#136831" stroke-width="1.6"><path d="M12 21c0-6 3-9 3-9s-6 0-6 6c0 1.5 1 3 3 3z"/><path d="M12 21c0-8-4-12-4-12s-3 6 0 9c1.5 1.5 4 3 4 3z"/><path d="M12 21c0-8 4-12 4-12s3 6 0 9c-1.5 1.5-4 3-4 3z"/><path d="M12 21V9"/></svg>
        </div>
        <div style="font-family:'Fraunces',serif;font-size:28px;font-weight:600;color:#136831">Green Agro Seeds</div>
      </div>
      <div style="font-size:12.5px;color:#56685C;margin-top:4px">All Kinds of Seeds Importer &amp; Wholesaler</div>
      <div style="font-size:11.5px;color:#8B9A8F;margin-top:2px">Hazi Kutir, Kalibari Road, Kotchandpur, Jhenaidah-7330 &middot; +880 1717-146341</div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px dashed #d8d4bd">
        <div style="font-size:15px;font-weight:700;color:#142B1B">${subtitle}</div>
        <div style="text-align:right;font-size:12px;color:#56685C">
          <div>নং: <b class="en">${sale.invoiceNo}</b></div>
          <div>তারিখ: ${new Date(sale.date).toLocaleDateString("bn-BD")}</div>
        </div>
      </div>
    </div>
  `;
}

function customerBlockHTML(sale) {
  const location = [sale.customerDistrict, sale.customerThana].filter(Boolean).join(", ");
  return `
    <div style="background:#F2F1E6;border-radius:8px;padding:12px 16px;margin-bottom:18px;font-size:13px">
      <div><b>গ্রাহকের নাম:</b> ${sale.customerName}</div>
      <div><b>ফোন:</b> <span class="en">${sale.customerPhone}</span></div>
      ${location ? `<div><b>জেলা/থানা:</b> ${location}</div>` : ""}
      ${sale.customerAddress ? `<div><b>ঠিকানা:</b> ${sale.customerAddress}</div>` : ""}
    </div>
  `;
}

function footerHTML() {
  return `
    <div style="margin-top:34px;border-top:2px solid #136831;padding-top:12px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:11px;color:#8B9A8F">ধন্যবাদান্তে — Green Agro Seeds</div>
      <div style="font-size:10.5px;color:#8B9A8F;text-align:right">
        Developed by <b style="color:#136831">Md. Lavib Uddin Ashik</b><br>
        <span class="en">linkedin.com/in/lavib-uddin-ashik</span>
      </div>
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
    <div style="box-sizing:border-box;width:${PDF_PAGE_WIDTH}px;font-family:'Hind Siliguri',sans-serif;padding:36px;background:#fff;color:#142B1B">
      ${invoiceHeaderHTML(sale, "ইনভয়েস")}
      ${customerBlockHTML(sale)}
      <table style="width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed;word-break:break-word">
        <thead>
          <tr style="background:#EAF3E4">
            <th style="padding:8px;text-align:left;width:32px">#</th>
            <th style="padding:8px;text-align:left">পণ্য</th>
            <th style="padding:8px;text-align:left">হিসাব</th>
            <th style="padding:8px;text-align:right;width:110px">টাকা</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:14px">
        ${sale.oldDueAmount > 0 ? `
        <tr><td style="padding:4px 8px;text-align:right;color:#56685C">পণ্যের মূল্য</td><td style="padding:4px 8px;text-align:right;width:140px" class="en">৳ ${(sale.itemsTotal ?? (sale.grandTotal - sale.oldDueAmount)).toLocaleString("bn-BD")}</td></tr>
        <tr><td style="padding:4px 8px;text-align:right;color:#56685C">পুরাতন বকেয়া</td><td style="padding:4px 8px;text-align:right;width:140px" class="en">৳ ${sale.oldDueAmount.toLocaleString("bn-BD")}</td></tr>
        ` : ""}
        <tr><td style="padding:4px 8px;text-align:right">সর্বমোট</td><td style="padding:4px 8px;text-align:right;font-weight:700;width:140px" class="en">৳ ${sale.grandTotal.toLocaleString("bn-BD")}</td></tr>
        <tr><td style="padding:4px 8px;text-align:right">পরিশোধিত</td><td style="padding:4px 8px;text-align:right" class="en">৳ ${sale.paidAmount.toLocaleString("bn-BD")}</td></tr>
        <tr><td style="padding:4px 8px;text-align:right;color:${sale.dueAmount > 0 ? '#B5502E' : '#0d4e24'}">বাকি</td><td style="padding:4px 8px;text-align:right;font-weight:700;color:${sale.dueAmount > 0 ? '#B5502E' : '#0d4e24'}" class="en">৳ ${sale.dueAmount.toLocaleString("bn-BD")}</td></tr>
      </table>
      <div style="margin-top:20px;font-size:11px;color:#8B9A8F">স্বাক্ষর: ______________</div>
      ${footerHTML()}
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
    <div style="box-sizing:border-box;width:${PDF_PAGE_WIDTH}px;font-family:'Hind Siliguri',sans-serif;padding:36px;background:#fff;color:#142B1B">
      ${invoiceHeaderHTML(sale, "মালামাল চালান")}
      ${customerBlockHTML(sale)}
      <table style="width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed;word-break:break-word">
        <thead>
          <tr style="background:#EAF3E4">
            <th style="padding:8px;text-align:left;width:32px">#</th>
            <th style="padding:8px;text-align:left">পণ্য</th>
            <th style="padding:8px;text-align:left">পরিমাণ</th>
            <th style="padding:8px;text-align:right;width:110px">ওজন</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:14px">
        <tr><td style="padding:4px 8px;text-align:right;font-weight:700">মোট ওজন</td><td style="padding:4px 8px;text-align:right;font-weight:700;width:140px" class="en">${totalKg.toFixed(2)} কেজি</td></tr>
      </table>
      <div style="margin-top:8px;font-size:11px;color:#8B9A8F">* এই চালানে কোনো মূল্য উল্লেখ নেই — শুধুমাত্র মালামাল বুঝিয়ে দেওয়ার প্রমাণপত্র</div>
      <div style="margin-top:20px;display:flex;justify-content:space-between;font-size:11px;color:#8B9A8F">
        <div>প্রেরক স্বাক্ষর: ______________</div>
        <div>প্রাপক স্বাক্ষর: ______________</div>
      </div>
      ${footerHTML()}
    </div>
  `;
}

async function renderToPDF(html, filename) {
  const root = document.getElementById("print-root");
  root.innerHTML = html;
  root.classList.add("active");
  const target = root.firstElementChild;

  // ফন্ট লোড ও লেআউট/পেইন্ট সম্পূর্ণ হওয়া পর্যন্ত নিশ্চিতভাবে অপেক্ষা করা হচ্ছে
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) {} }
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(target, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  // আসল A4 পেজ সাইজ (210mm x 297mm) — কনটেন্ট এক পেজের বেশি লম্বা হলে একাধিক পেজে ভাগ হয়ে যাবে
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidthMM = pdf.internal.pageSize.getWidth();
  const pageHeightMM = pdf.internal.pageSize.getHeight();

  const imgWidthMM = pageWidthMM;
  const imgHeightMM = (canvas.height * imgWidthMM) / canvas.width;

  let heightLeft = imgHeightMM;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidthMM, imgHeightMM);
  heightLeft -= pageHeightMM;

  while (heightLeft > 0) {
    position = heightLeft - imgHeightMM;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidthMM, imgHeightMM);
    heightLeft -= pageHeightMM;
  }

  pdf.save(filename);

  root.classList.remove("active");
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
