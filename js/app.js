/* ==========================================================================
   Green Agro Seeds — Core App Logic
   ========================================================================== */

const bangladeshData = {
  "Barisal": ["Agailjhara","Babuganj","Bakerganj","Banaripara","Gaurnadi","Hizla","Barisal Sadar","Mehendiganj","Muladi","Wazirpur"],
  "Barguna": ["Amtali","Bamna","Barguna Sadar","Betagi","Patharghata","Taltali"],
  "Bhola": ["Bhola Sadar","Burhanuddin","Char Fasson","Daulatkhan","Lalmohan","Manpura","Tazumuddin"],
  "Jhalokati": ["Jhalokati Sadar","Kanthalia","Nalchity","Rajapur"],
  "Patuakhali": ["Bauphal","Dashmina","Galachipa","Kalapara","Mirzaganj","Patuakhali Sadar","Rangabali","Dumki"],
  "Pirojpur": ["Bhandaria","Kawkhali","Mathbaria","Nazirpur","Nesarabad","Pirojpur Sadar","Zianagar"],
  "Bandarban": ["Ali Kadam","Bandarban Sadar","Lama","Naikhongchhari","Rowangchhari","Ruma","Thanchi"],
  "Brahmanbaria": ["Akhaura","Ashuganj","Bancharampur","Bijoynagar","Brahmanbaria Sadar","Kasba","Nabinagar","Nasirnagar","Sarail"],
  "Chandpur": ["Chandpur Sadar","Faridganj","Haimchar","Haziganj","Kachua","Matlab Dakshin","Matlab Uttar","Shahrasti"],
  "Chittagong": ["Anwara","Banshkhali","Boalkhali","Chandanaish","Fatikchhari","Hathazari","Karnaphuli","Lohagara","Mirsharai","Patiya","Rangunia","Raozan","Sandwip","Satkania","Sitakunda","Chittagong Sadar"],
  "Comilla": ["Barura","Brahmanpara","Burichang","Chandina","Chauddagram","Comilla Sadar","Daudkandi","Debidwar","Homna","Laksam","Lalmai","Meghna","Monohorganj","Muradnagar","Nangalkot","Titas"],
  "Cox's Bazar": ["Chakaria","Cox's Bazar Sadar","Kutubdia","Maheshkhali","Pekua","Ramu","Teknaf","Ukhia"],
  "Feni": ["Chhagalnaiya","Daganbhuiyan","Feni Sadar","Parshuram","Sonagazi","Fulgazi"],
  "Khagrachhari": ["Dighinala","Khagrachhari Sadar","Lakshmichhari","Mahalchhari","Manikchhari","Matiranga","Panchhari","Ramgarh"],
  "Lakshmipur": ["Kamalnagar","Lakshmipur Sadar","Ramganj","Ramgati","Roypur"],
  "Noakhali": ["Begumganj","Chatkhil","Companiganj","Hatiya","Kabirhat","Noakhali Sadar","Senbagh","Sonaimuri","Subarnachar"],
  "Rangamati": ["Bagaichhari","Barkal","Belaichhari","Juraichhari","Kaptai","Kawkhali","Langadu","Naniarchar","Rajasthali","Rangamati Sadar"],
  "Dhaka": ["Dhamrai","Dohar","Keraniganj","Nawabganj","Savar","Demra","Khilgaon","Tejgaon","Gulshan","Mirpur","Mohammadpur","Motijheel","Pallabi","Ramna","Rayer Bazar","Sabujbagh","Sutrapur","Uttara","Badda","Banani","Cantonment","Dhanmondi","Hazaribagh","Jatrabari","Kadamtali","Kafrul","Kalabagan","Kamrangirchar","Kotwali","Lalbagh","Shyampur","Wari"],
  "Faridpur": ["Alfadanga","Bhanga","Boalmari","Charbhadrasan","Faridpur Sadar","Madhukhali","Nagarkanda","Sadarpur","Saltha"],
  "Gazipur": ["Gazipur Sadar","Kaliakair","Kaliganj","Kapasia","Sreepur","Tongi"],
  "Gopalganj": ["Gopalganj Sadar","Kashiani","Kotalipara","Muksudpur","Tungipara"],
  "Kishoreganj": ["Austagram","Bajitpur","Bhairab","Hossainpur","Itna","Karimganj","Katiadi","Kishoreganj Sadar","Kuliarchar","Mithamain","Nikli","Pakundia","Tarail"],
  "Madaripur": ["Kalkini","Madaripur Sadar","Rajoir","Shibchar"],
  "Manikganj": ["Daulatpur","Ghior","Harirampur","Manikganj Sadar","Saturia","Shivalaya","Singair"],
  "Munshiganj": ["Gazaria","Lohajang","Munshiganj Sadar","Sirajdikhan","Sreenagar","Tongibari"],
  "Mymensingh": ["Bhaluka","Dhobaura","Fulbaria","Gaffargaon","Gauripur","Haluaghat","Ishwarganj","Muktagachha","Mymensingh Sadar","Nandail","Phulpur","Trishal"],
  "Narayanganj": ["Araihazar","Bandar","Narayanganj Sadar","Rupganj","Sonargaon"],
  "Narsingdi": ["Belabo","Monohardi","Narsingdi Sadar","Palash","Raipura","Shibpur"],
  "Rajbari": ["Baliakandi","Goalandaghat","Kalukhali","Pangsha","Rajbari Sadar"],
  "Shariatpur": ["Bhedarganj","Damudya","Gosairhat","Jajira","Naria","Shariatpur Sadar","Zajira"],
  "Tangail": ["Basail","Bhuapur","Delduar","Dhanbari","Ghatail","Gopalpur","Kalihati","Madhupur","Mirzapur","Nagarpur","Sakhipur","Tangail Sadar"],
  "Bagerhat": ["Bagerhat Sadar","Chitalmari","Fakirhat","Kachua","Mollahat","Mongla","Morrelganj","Rampal","Sarankhola"],
  "Chuadanga": ["Alamdanga","Chuadanga Sadar","Damurhuda","Jibannagar"],
  "Jessore": ["Abhaynagar","Bagherpara","Chaugachha","Jhikargachha","Jessore Sadar","Keshabpur","Manirampur","Sharsha"],
  "Jhenaidah": ["Harinakunda","Jhenaidah Sadar","Kaliganj","Kotchandpur","Maheshpur","Shailkupa"],
  "Khulna": ["Batiaghata","Dacope","Dighalia","Dumuria","Koyra","Paikgachha","Phultala","Rupsa","Terokhada","Khulna Sadar"],
  "Kushtia": ["Bheramara","Daulatpur","Khoksa","Kumarkhali","Kushtia Sadar","Mirpur"],
  "Magura": ["Magura Sadar","Mohammadpur","Shalikha","Sreepur"],
  "Meherpur": ["Gangni","Meherpur Sadar","Mujib Nagar"],
  "Narail": ["Kalia","Lohagara","Narail Sadar"],
  "Satkhira": ["Assasuni","Debhata","Kalaroa","Kaliganj","Satkhira Sadar","Shyamnagar","Tala"],
  "Jamalpur": ["Bakshiganj","Dewanganj","Islampur","Jamalpur Sadar","Madarganj","Melandaha","Sarishabari"],
  "Netrokona": ["Atpara","Barhatta","Durgapur","Khaliajuri","Kalmakanda","Kendua","Madan","Mohanganj","Netrokona Sadar","Purbadhala"],
  "Sherpur": ["Jhenaigati","Nakla","Nalitabari","Sherpur Sadar","Sreebardi"],
  "Bogra": ["Adamdighi","Bogra Sadar","Dhunat","Dhupchanchia","Gabtali","Kahaloo","Nandigram","Sariakandi","Shajahanpur","Sherpur","Shibganj","Sonatala"],
  "Chapai Nawabganj": ["Bholahat","Gomastapur","Nachole","Chapai Nawabganj Sadar","Shibganj"],
  "Joypurhat": ["Akkelpur","Joypurhat Sadar","Kalai","Khetlal","Panchbibi"],
  "Naogaon": ["Atrai","Badalgachhi","Dhamoirhat","Mahadebpur","Manda","Naogaon Sadar","Niamatpur","Patnitala","Porsha","Raninagar","Sapahar"],
  "Natore": ["Bagatipara","Baraigram","Gurudaspur","Lalpur","Natore Sadar","Singra"],
  "Pabna": ["Atgharia","Bera","Bhangura","Chatmohar","Faridpur","Ishwardi","Pabna Sadar","Santhia","Sujanagar"],
  "Rajshahi": ["Bagha","Bagmara","Charghat","Durgapur","Godagari","Mohanpur","Paba","Puthia","Tanore","Rajshahi Sadar"],
  "Sirajganj": ["Belkuchi","Chauhali","Enayetpur","Kamarkhanda","Kazipur","Raiganj","Shahjadpur","Sirajganj Sadar","Tarash","Ullapara"],
  "Dinajpur": ["Birampur","Birganj","Biral","Bochaganj","Chirirbandar","Dinajpur Sadar","Fulbari","Ghoraghat","Hakimpur","Kaharole","Khansama","Nawabganj","Parbatipur"],
  "Gaibandha": ["Fulchhari","Gaibandha Sadar","Gobindaganj","Palashbari","Sadullapur","Saghata","Sundarganj"],
  "Kurigram": ["Bhurungamari","Char Rajibpur","Chilmari","Kurigram Sadar","Nageshwari","Phulbari","Rajarhat","Raumari","Ulipur"],
  "Lalmonirhat": ["Aditmari","Hatibandha","Kaliganj","Lalmonirhat Sadar","Patgram"],
  "Nilphamari": ["Dimla","Domar","Jaldhaka","Kishoreganj","Nilphamari Sadar","Saidpur"],
  "Panchagarh": ["Atwari","Boda","Debiganj","Panchagarh Sadar","Tetulia"],
  "Rangpur": ["Badarganj","Gangachara","Kaunia","Mithapukur","Pirgachha","Pirganj","Rangpur Sadar","Taraganj"],
  "Thakurgaon": ["Baliadangi","Haripur","Pirganj","Ranisankail","Thakurgaon Sadar"],
  "Habiganj": ["Ajmiriganj","Baniachong","Bahubal","Chunarughat","Habiganj Sadar","Lakhai","Madhabpur","Nabiganj"],
  "Moulvibazar": ["Barlekha","Juri","Kamalganj","Kulaura","Moulvibazar Sadar","Rajnagar","Sreemangal"],
  "Sunamganj": ["Bishwamvarpur","Chhatak","Derai","Dharampasha","Dowarabazar","Jagannathpur","Jamalganj","Sulla","Sunamganj Sadar","Tahirpur","Shalla"],
  "Sylhet": ["Balaganj","Beanibazar","Bishwanath","Companiganj","Fenchuganj","Golapganj","Gowainghat","Jaintiapur","Kanaighat","Osmani Nagar","Sylhet Sadar","Zakiganj","South Surma"]
};

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

  if (typeof bangladeshData === "undefined") {
    // data/bangladesh.js লোড হয়নি — এই একটা কারণে যেন পুরো অ্যাপ ভেঙে না পড়ে
    console.error("bangladeshData পাওয়া যায়নি — data/bangladesh.js ফাইলটা data/ ফোল্ডারে ঠিকভাবে আছে কিনা দেখুন।");
    distSel.innerHTML = `<option value="">জেলার তালিকা লোড হয়নি</option>`;
    thanaSel.innerHTML = `<option value="">—</option>`;
    return;
  }

  const districts = Object.keys(bangladeshData);
  distSel.innerHTML = `<option value="">— জেলা নির্বাচন করুন —</option>` +
    districts.map(d => `<option value="${d}">${d}</option>`).join("");
  thanaSel.innerHTML = `<option value="">— প্রথমে জেলা নির্বাচন করুন —</option>`;
  distSel.onchange = () => populateThanaSelect(distSel.value, thanaSelectId);
}

function populateThanaSelect(district, thanaSelectId) {
  const thanaSel = document.getElementById(thanaSelectId);
  if (typeof bangladeshData === "undefined") { thanaSel.innerHTML = `<option value="">—</option>`; return; }
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
  toast("Order যুক্ত হয়েছে");
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
  const normPhone = normalizePhone(phone);

  const oldDue = Number(document.getElementById("oldDueAmount").value || 0);
  const itemsTotal = currentOrderItems.reduce((s, it) => s + it.total, 0);
  const total = updateGrandTotal();
  const explicitPaid = Number(document.getElementById("paidAmount").value || 0);

  // এই গ্রাহকের যদি আগে থেকে "অগ্রিম জমা" (ledger balance ঋণাত্মক) থাকে, সেটা এই
  // নতুন চালানের বিপরীতে স্বয়ংক্রিয়ভাবে ব্যবহার হবে — যাতে চালানের নিজের বাকির
  // পরিমাণ, বিক্রয় ইতিহাস আর ledger-এর সামগ্রিক হিসাব সবসময় একসাথে মিলে থাকে।
  const existingBalance = getBalance(normPhone); // ঋণাত্মক মানে অগ্রিম জমা আছে
  const advanceAvailable = existingBalance < 0 ? -existingBalance : 0;
  const advanceUsed = Math.min(advanceAvailable, Math.max(total - explicitPaid, 0));
  const paid = explicitPaid + advanceUsed;
  const due = Math.max(total - paid, 0);

  const sale = {
    invoiceNo: nextInvoiceNo(),
    date: new Date().toISOString(),
    customerName: name,
    customerPhone: normPhone,
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

  ensureCustomerProfile(normPhone, { name, address, district, thana, varietyNote });

  if (advanceUsed > 0) {
    addLedgerEntry(normPhone, name, address, "debit", advanceUsed, `চালান ${sale.invoiceNo} — পূর্বের অগ্রিম জমা সমন্বয়`);
  }
  if (due > 0) {
    const note = oldDue > 0
      ? `চালান ${sale.invoiceNo} — বাকি (পুরাতন বকেয়া ${formatTaka(oldDue)} সহ)`
      : `চালান ${sale.invoiceNo} — বাকি`;
    addLedgerEntry(normPhone, name, address, "debit", due, note);
  }

  pushSaleToSheet(sale);

  const advanceNote = advanceUsed > 0 ? ` (অগ্রিম জমা থেকে ${formatTaka(advanceUsed)} বাদ হয়েছে)` : "";
  toast(`বিক্রয় সংরক্ষিত হয়েছে — ${sale.invoiceNo}${advanceNote}`);
  return sale;
}

/* ---------------------------------------------------------------------- */
/* Google Sheet সিঙ্ক — বিক্রয়ের ইতিহাস                                    */
/* ---------------------------------------------------------------------- */

async function pushSaleToSheet(sale) {
  if (!isSheetConnected()) return;
  try { await sheetSaveSale(sale); } catch (err) { console.error("Sheet sync (save sale) failed:", err); }
}

/* "বাকি/পাওনা" পেজ থেকে কোনো গ্রাহকের নামে সরাসরি একটা পেমেন্ট (credit) এন্ট্রি
   যোগ করলে সেটা কোনো নির্দিষ্ট চালানের সাথে যুক্ত থাকে না — শুধু ledger ব্যালান্স
   কমে যেত, কিন্তু বিক্রয় ইতিহাস/Sheet-এ কোনো চালানের বাকি কমত না। এই ফাংশনটা
   সেই টাকাটা গ্রাহকের বকেয়া চালানগুলোতে (পুরনোটা আগে) বণ্টন করে দেয়, যাতে
   ledger, বিক্রয় ইতিহাস আর Google Sheet — তিন জায়গাতেই হিসাব মিলে যায়। */
async function applyPaymentToCustomerSales(phone, amount) {
  let remaining = amount;
  const allSales = getAllSales();
  const dueSales = allSales
    .filter(s => s.customerPhone === phone && s.dueAmount > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (dueSales.length === 0) return amount; // কোনো বকেয়া চালান নেই — পুরো টাকাটাই অগ্রিম জমা হিসেবে থেকে যাবে

  // একাধিক চালান আপডেট করতে হলে একটার পর একটা (sequentially) পাঠানো হয় —
  // একসাথে অনেকগুলো রিকোয়েস্ট পাঠালে মাঝেমধ্যে Sheet-এ কোনোটা বাদ পড়ে যেতে পারত।
  for (const s of dueSales) {
    if (remaining <= 0) break;
    const pay = Math.min(remaining, s.dueAmount);
    const target = allSales.find(x => x.invoiceNo === s.invoiceNo);
    target.paidAmount = Number(target.paidAmount || 0) + pay;
    target.dueAmount = Math.max(target.grandTotal - target.paidAmount, 0);
    remaining -= pay;

    localStorage.setItem(LS_SALES, JSON.stringify(allSales)); // প্রতিটা ধাপেই লোকালি সেভ রাখা হয়

    if (isSheetConnected()) {
      try {
        await sheetUpdateSale({
          invoiceNo: target.invoiceNo, paidAmount: target.paidAmount,
          dueAmount: target.dueAmount, grandTotal: target.grandTotal,
        });
      } catch (err) {
        console.error("Sheet sync (ledger payment → sale) failed:", err);
      }
    }
  }

  if (typeof renderHistory === "function") renderHistory();
  return remaining; // যা বাকি রইলো, সেটা অগ্রিম জমা হিসেবে ledger balance-এই থেকে যাবে
}

async function syncSalesFromSheet() {
  if (!isSheetConnected()) return;
  try {
    const rows = await sheetFetchSales();
    if (Array.isArray(rows)) {
      const sales = rows.map(r => ({
        invoiceNo: r.invoiceNo,
        date: r.date,
        customerName: r.customerName,
        customerPhone: normalizePhone(String(r.customerPhone || "").replace(/^'/, "")),
        customerDistrict: r.customerDistrict || "",
        customerThana: r.customerThana || "",
        customerAddress: r.customerAddress || "",
        items: JSON.parse(r.itemsJSON || "[]"),
        itemsTotal: Number(r.itemsTotal || 0),
        oldDueAmount: Number(r.oldDueAmount || 0),
        grandTotal: Number(r.grandTotal || 0),
        paidAmount: Number(r.paidAmount || 0),
        dueAmount: Number(r.dueAmount || 0),
      }));
      localStorage.setItem(LS_SALES, JSON.stringify(sales));

      // Sheet-এর সর্বোচ্চ চালান নম্বরের সাথে লোকাল কাউন্টার মিলিয়ে নেওয়া, যাতে ডুপ্লিকেট নম্বর তৈরি না হয়
      let maxNum = 0;
      sales.forEach(s => {
        const m = /GAS-(\d+)/.exec(s.invoiceNo || "");
        if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
      });
      if (maxNum > Number(localStorage.getItem(LS_INVOICE_COUNTER) || "0")) {
        localStorage.setItem(LS_INVOICE_COUNTER, String(maxNum));
      }
    }
  } catch (err) {
    console.error("Sheet থেকে বিক্রয় ইতিহাস লোড ব্যর্থ, লোকাল ক্যাশ ব্যবহার হচ্ছে:", err);
  }
}

/* ---------------------------------------------------------------------- */
/* পুরনো চালানে নতুন পরিশোধ আপডেট করা                                       */
/* ---------------------------------------------------------------------- */

function openUpdatePaymentModal(invoiceNo) {
  const sale = findSaleByInvoice(invoiceNo);
  if (!sale) { toast("চালান খুঁজে পাওয়া যায়নি"); return; }
  document.getElementById("updatePaymentInvoiceNo").textContent = sale.invoiceNo;
  document.getElementById("updatePaymentCurrentDue").textContent = formatTaka(sale.dueAmount);
  document.getElementById("updatePaymentForm").dataset.invoiceNo = invoiceNo;
  document.getElementById("updatePaymentModal").classList.add("open");
}

function closeUpdatePaymentModal() {
  document.getElementById("updatePaymentModal").classList.remove("open");
  document.getElementById("updatePaymentForm").reset();
}

function submitUpdatePayment(e) {
  e.preventDefault();
  const f = e.target;
  const invoiceNo = f.dataset.invoiceNo;
  const newPayment = Number(f.amount.value || 0);
  if (newPayment <= 0) return;

  const sales = getAllSales();
  const sale = sales.find(s => s.invoiceNo === invoiceNo);
  if (!sale) { toast("চালান খুঁজে পাওয়া যায়নি"); return; }

  sale.paidAmount = Number(sale.paidAmount || 0) + newPayment;
  sale.dueAmount = Math.max(sale.grandTotal - sale.paidAmount, 0);
  localStorage.setItem(LS_SALES, JSON.stringify(sales));

  addLedgerEntry(sale.customerPhone, sale.customerName, sale.customerAddress, "credit", newPayment, `চালান ${sale.invoiceNo} — পরিশোধ`);

  if (isSheetConnected()) {
    sheetUpdateSale({
      invoiceNo: sale.invoiceNo, paidAmount: sale.paidAmount, dueAmount: sale.dueAmount, grandTotal: sale.grandTotal,
    }).catch(err => console.error("Sheet sync (update sale) failed:", err));
  }

  closeUpdatePaymentModal();
  renderHistory();
  toast(`পরিশোধ আপডেট হয়েছে — ${sale.invoiceNo}`);
  downloadInvoicePDF(sale.invoiceNo);
}

/* ---------------------------------------------------------------------- */
/* Google Sheet সংযোগ সেটিংস                                               */
/* ---------------------------------------------------------------------- */

function openSettingsModal() {
  document.getElementById("webAppUrlInput").value = getWebAppUrl();
  updateSyncStatusUI();
  document.getElementById("settingsModal").classList.add("open");
}
function closeSettingsModal() { document.getElementById("settingsModal").classList.remove("open"); }

function updateSyncStatusUI() {
  const dot = document.getElementById("syncStatusDot");
  const text = document.getElementById("syncStatusText");
  const connected = isSheetConnected();
  if (dot) dot.classList.toggle("connected", connected);
  if (text) {
    text.textContent = connected ? "🟢 Google Sheet সংযুক্ত আছে" : "⚪ শুধু লোকাল — Sheet সংযুক্ত নেই";
    text.style.color = connected ? "var(--green-2)" : "var(--ink-muted)";
  }
}

async function fullSyncFromSheet() {
  await Promise.all([syncProductsFromSheet(), syncLedgerFromSheet(), syncSalesFromSheet()]);
}

async function refreshAllViews() {
  initSaleForm();
  renderCatalog();
  renderCustomerList();
  renderHistory();
}

async function saveWebAppUrl(e) {
  e.preventDefault();
  const url = document.getElementById("webAppUrlInput").value.trim();
  if (!url) { toast("Web App URL দিন"); return; }
  setWebAppUrl(url);
  toast("সংরক্ষিত হয়েছে — সিঙ্ক করা হচ্ছে...");
  try {
    await fullSyncFromSheet();
    toast("Google Sheet-এর সাথে সিঙ্ক সম্পন্ন হয়েছে");
  } catch (err) {
    toast("সিঙ্ক ব্যর্থ হয়েছে — URL চেক করুন");
    console.error(err);
  }
  updateSyncStatusUI();
  refreshAllViews();
}

async function manualSyncNow() {
  if (!isSheetConnected()) { toast("প্রথমে Web App URL সংরক্ষণ করুন"); return; }
  toast("সিঙ্ক করা হচ্ছে...");
  try {
    await fullSyncFromSheet();
    toast("সিঙ্ক সম্পন্ন হয়েছে");
  } catch (err) {
    toast("সিঙ্ক ব্যর্থ হয়েছে");
    console.error(err);
  }
  refreshAllViews();
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
  const hint = document.getElementById("custBalanceHint");
  if (hint) hint.style.display = "none";
  updateGrandTotal();
}

function normalizePhone(phone) {
  let p = String(phone).trim().replace(/[\s\-]/g, "");
  p = p.replace(/^\+?88/, "");
  if (p.length === 10 && p.startsWith("1")) p = "0" + p;
  return p;
}

/* ---------------------------------------------------------------------- */
/* রিপিট গ্রাহক অটো-ফিল — ফোন নম্বর লিখলে আগের তথ্য (নাম/ঠিকানা/জেলা-থানা/নোটস)
   স্বয়ংক্রিয়ভাবে ফিল হয়ে যায়। ledger ক্যাশ Google Sheet থেকে সিঙ্ক করা থাকে,
   তাই এটা মূলত Sheet-এরই তথ্য দেখায় — প্রতিটা কি-প্রেসে আলাদা করে Sheet-এ
   কল করার দরকার নেই। */
let autofillDebounceTimer;

function initCustomerAutofill() {
  const phoneInput = document.getElementById("custPhone");
  phoneInput.addEventListener("input", () => {
    clearTimeout(autofillDebounceTimer);
    autofillDebounceTimer = setTimeout(() => tryAutofillCustomer(phoneInput.value), 500);
  });
}

function tryAutofillCustomer(rawPhone) {
  const phone = normalizePhone(rawPhone);
  const hint = document.getElementById("custBalanceHint");
  if (phone.length < 11) { if (hint) hint.style.display = "none"; return; }

  const c = getLedger()[phone];
  if (!c) { if (hint) hint.style.display = "none"; return; }

  document.getElementById("custName").value = c.name || "";
  document.getElementById("custAddress").value = c.address || "";
  document.getElementById("custNote").value = c.varietyNote || "";
  if (c.district) {
    document.getElementById("custDistrict").value = c.district;
    populateThanaSelect(c.district, "custThana");
    if (c.thana) document.getElementById("custThana").value = c.thana;
  }

  // এখানে ইচ্ছাকৃতভাবে "পুরাতন বকেয়া" ফিল্ডে কিছু বসানো হচ্ছে না — কারণ এই গ্রাহকের
  // আগের বাকি ইতিমধ্যেই ledger-এ ট্র্যাক করা আছে এবং প্রতিটা নতুন চালানের অপরিশোধিত
  // অংশ স্বয়ংক্রিয়ভাবে সেই ব্যালান্সে যোগ হয়ে যাবে। এখানে আবার বসালে দুইবার গোনা
  // (double-count) হয়ে যেত। শুধু তথ্যের জন্য বর্তমান ব্যালান্স দেখানো হচ্ছে।
  const balance = getBalance(phone);
  if (hint) {
    if (balance > 0) {
      hint.textContent = `⚠️ এই গ্রাহকের বর্তমান বাকি: ${formatTaka(balance)} (নতুন করে "পুরাতন বকেয়া"-তে বসানোর দরকার নেই, এমনিতেই যোগ হয়ে যাবে)`;
      hint.style.color = "var(--rust)";
      hint.style.display = "block";
    } else if (balance < 0) {
      hint.textContent = `✓ এই গ্রাহকের অগ্রিম জমা আছে: ${formatTaka(-balance)} — নতুন চালানে স্বয়ংক্রিয়ভাবে বাদ যাবে`;
      hint.style.color = "var(--green-2)";
      hint.style.display = "block";
    } else {
      hint.textContent = "✓ এই গ্রাহকের হিসাব বর্তমানে ক্লিয়ার";
      hint.style.color = "var(--ink-muted)";
      hint.style.display = "block";
    }
  }
  toast(`পুরনো গ্রাহক পাওয়া গেছে — ${c.name || phone}`);
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

function openEditProductModal(rowId) {
  const flat = readJSON(PRODUCTS_CACHE_KEY, []);
  const option = flat.find(o => o.id === rowId);
  if (!option) { toast("পণ্যটি খুঁজে পাওয়া যায়নি"); return; }
  editingOption = { rowId };

  const f = document.getElementById("editProductForm");
  f.qty.value = option.qty;
  f.unit.value = option.unit;
  f.packetPrice.value = option.packetPrice;
  f.kgPrice.value = option.kgPrice;
  f.bulkPrice.value = option.bulkPrice;
  f.retailPrice.value = option.retailPrice;
  document.getElementById("editProductTitle").textContent = `${option.category} — ${option.variety}`;
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
  updateProductRow(editingOption.rowId, {
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

function confirmDeleteProduct(rowId) {
  if (!confirm(`এই পণ্যের এন্ট্রিটি মুছে ফেলতে চান?`)) return;
  deleteProductRow(rowId);
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
  try {
    initSaleForm();
    renderOrderItems();
    initCustomerAutofill();
    document.getElementById("paidAmount").addEventListener("input", updateGrandTotal);
    document.getElementById("oldDueAmount").addEventListener("input", updateGrandTotal);
    document.getElementById("bulkRateType").addEventListener("change", updateLivePriceHint);
    document.getElementById("customProductForm").addEventListener("submit", addCustomProduct);
    document.getElementById("editProductForm").addEventListener("submit", submitEditProduct);
    document.getElementById("quickAddForm").addEventListener("submit", submitQuickAdd);
    document.getElementById("quickAddQtyForm").addEventListener("submit", submitQuickAddQty);
    document.getElementById("webAppUrlForm").addEventListener("submit", saveWebAppUrl);
    document.getElementById("updatePaymentForm").addEventListener("submit", submitUpdatePayment);
    updateSyncStatusUI();
  } catch (err) {
    // কোনো একটা ফিচার লোড হতে ব্যর্থ হলেও যেন পুরো পেজ ফাঁকা/সাদা হয়ে না যায় —
    // অন্তত মূল পেজটা সবসময় দেখা যাবে, আর কনসোলে আসল সমস্যাটা লগ হবে।
    console.error("Init error:", err);
  } finally {
    showPage("sale");
  }

  // Sheet সংযুক্ত থাকলে ব্যাকগ্রাউন্ডে সিঙ্ক করে ভিউগুলো রিফ্রেশ করা হয় —
  // এটা পেজ লোডকে আটকায় না, তাই প্রথমে instant লোকাল ক্যাশ দিয়েই পেজ দেখা যায়
  if (isSheetConnected()) {
    fullSyncFromSheet().then(refreshAllViews).catch(err => console.error("Initial sync failed:", err));
  }
});
