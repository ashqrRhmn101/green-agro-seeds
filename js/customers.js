/* ==========================================================================
   Customer Ledger — গ্রাহকের বাকি/পাওনার সহজ running-balance হিসাব
   নিয়ম:
   - DEBIT   = গ্রাহক কোম্পানির কাছে টাকা বাকি রাখলেন (কোম্পানি পাবে)
   - CREDIT  = গ্রাহক টাকা পরিশোধ করলেন
   - ব্যালান্স = মোট ডেবিট − মোট ক্রেডিট।  ধনাত্মক মানে গ্রাহক বাকি আছেন।
   এটি ডাবল-এন্ট্রি accounting নয় — প্রতিটি গ্রাহকের জন্য একটি সরল, append-only
   এন্ট্রি লগ, যা থেকে ব্যালান্স যোগফল করে বের করা হয়। ভবিষ্যতে সাপ্লায়ার/ডিলার
   পক্ষের হিসাব যোগ করা হলে এই একই প্যাটার্ন সম্প্রসারণ করা যাবে।
   ========================================================================== */

const LS_LEDGER = "gas_ledger";

function getLedger() {
  return JSON.parse(localStorage.getItem(LS_LEDGER) || "{}");
}

function saveLedger(ledger) {
  localStorage.setItem(LS_LEDGER, JSON.stringify(ledger));
}

function addLedgerEntry(phone, name, address, type, amount, note) {
  if (!phone || amount <= 0) return;
  const ledger = getLedger();
  if (!ledger[phone]) ledger[phone] = { name, address, entries: [] };
  ledger[phone].name = name || ledger[phone].name;
  ledger[phone].address = address || ledger[phone].address;
  ledger[phone].entries.push({ date: new Date().toISOString(), type, amount: Number(amount), note: note || "" });
  saveLedger(ledger);
  pushLedgerEntryToSheet({ phone, type, amount, note });
}

/* গ্রাহকের প্রোফাইল তথ্য (নাম/ঠিকানা/জেলা/থানা/নোটস) আপডেট বা তৈরি করে —
   entries অ্যারে অক্ষত থাকে, শুধু প্রোফাইল ফিল্ডগুলো merge হয় */
function ensureCustomerProfile(phone, { name, address, district, thana, varietyNote } = {}) {
  if (!phone) return;
  const ledger = getLedger();
  if (!ledger[phone]) ledger[phone] = { name: "", address: "", district: "", thana: "", varietyNote: "", entries: [] };
  if (name) ledger[phone].name = name;
  if (address) ledger[phone].address = address;
  if (district) ledger[phone].district = district;
  if (thana) ledger[phone].thana = thana;
  if (varietyNote) ledger[phone].varietyNote = varietyNote;
  saveLedger(ledger);
  pushCustomerToSheet({
    phone, name: ledger[phone].name, address: ledger[phone].address,
    district: ledger[phone].district, thana: ledger[phone].thana, varietyNote: ledger[phone].varietyNote,
  });
}

/* ---------------------------------------------------------------------- */
/* Google Sheet সিঙ্ক                                                      */
/* ---------------------------------------------------------------------- */

async function pushLedgerEntryToSheet(entry) {
  if (!isSheetConnected()) return;
  try { await sheetAddLedgerEntry(entry); } catch (err) { console.error("Sheet sync (ledger entry) failed:", err); }
}

async function pushCustomerToSheet(customer) {
  if (!isSheetConnected()) return;
  try { await sheetUpsertCustomer(customer); } catch (err) { console.error("Sheet sync (customer) failed:", err); }
}

async function syncLedgerFromSheet() {
  if (!isSheetConnected()) return;
  try {
    const [customers, entries] = await Promise.all([sheetFetchCustomers(), sheetFetchLedger()]);
    const ledger = {};
    (customers || []).forEach(c => {
      const phone = normalizePhone(String(c.phone || "").replace(/^'/, ""));
      if (!phone) return;
      ledger[phone] = { name: c.name || "", address: c.address || "", district: c.district || "", thana: c.thana || "", varietyNote: c.varietyNote || "", entries: [] };
    });
    (entries || []).forEach(e => {
      const phone = normalizePhone(String(e.phone || "").replace(/^'/, ""));
      if (!phone) return;
      if (!ledger[phone]) ledger[phone] = { name: "", address: "", district: "", thana: "", varietyNote: "", entries: [] };
      ledger[phone].entries.push({ date: e.timestamp, type: e.type, amount: Number(e.amount), note: e.note || "" });
    });
    saveLedger(ledger);
  } catch (err) {
    console.error("Sheet থেকে গ্রাহক/লেজার লোড ব্যর্থ, লোকাল ক্যাশ ব্যবহার হচ্ছে:", err);
  }
}

function getBalance(phone) {
  const ledger = getLedger();
  const cust = ledger[phone];
  if (!cust) return 0;
  return cust.entries.reduce((s, e) => s + (e.type === "debit" ? e.amount : -e.amount), 0);
}

/* ---------------------------------------------------------------------- */
/* Rendering                                                               */
/* ---------------------------------------------------------------------- */

function renderCustomerList() {
  const ledger = getLedger();
  const wrap = document.getElementById("customerList");
  const phones = Object.keys(ledger);

  if (phones.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><p>এখনো কোনো গ্রাহকের হিসাব নেই — বিক্রয় করলে বা ম্যানুয়াল এন্ট্রি দিলে এখানে দেখা যাবে</p></div>`;
    return;
  }

  const rows = phones.map(phone => {
    const c = ledger[phone];
    const bal = getBalance(phone);
    return { phone, ...c, bal };
  }).sort((a, b) => b.bal - a.bal);

  wrap.innerHTML = rows.map(r => `
    <div class="card customer-row" style="cursor:pointer" onclick="openCustomerDetail('${r.phone}')">
      <div>
        <div class="customer-row__name">${r.name || "নাম নেই"}</div>
        <div class="customer-row__phone">${r.phone}${r.district ? ` · ${r.district}${r.thana ? ", " + r.thana : ""}` : ""}</div>
        ${r.varietyNote ? `<span class="badge badge--gold" style="margin-top:4px">${r.varietyNote}</span>` : ""}
      </div>
      <div>${r.bal > 0 ? `<span class="badge badge--due">বাকি আছে</span>` : `<span class="badge badge--ok">ক্লিয়ার</span>`}</div>
      <div class="customer-row__balance ${r.bal > 0 ? 'due' : 'clear'}">${formatTaka(Math.abs(r.bal))}</div>
    </div>
  `).join("");
}

let activeCustomerPhone = null;

function openCustomerDetail(phone) {
  activeCustomerPhone = phone;
  const ledger = getLedger();
  const c = ledger[phone];
  const bal = getBalance(phone);

  document.getElementById("custModalName").textContent = c.name || "নাম নেই";
  document.getElementById("custModalPhone").textContent = phone;
  document.getElementById("custModalLocation").textContent =
    [c.district, c.thana, c.address].filter(Boolean).join(" · ");
  document.getElementById("custModalNote").value = c.varietyNote || "";
  document.getElementById("custModalBalance").textContent = formatTaka(Math.abs(bal));
  document.getElementById("custModalBalance").className = "en " + (bal > 0 ? "due" : "clear");
  document.getElementById("custModalBalanceLabel").textContent = bal > 0 ? "বাকি আছে" : (bal < 0 ? "অগ্রিম জমা" : "হিসাব ক্লিয়ার");

  const entriesWrap = document.getElementById("custModalEntries");
  entriesWrap.innerHTML = [...c.entries].reverse().map(e => `
    <div class="ledger-entry">
      <div>
        <div>${e.note || (e.type === "debit" ? "বাকি" : "পরিশোধ")}</div>
        <div style="font-size:11.5px;color:var(--ink-faint)">${new Date(e.date).toLocaleDateString("bn-BD")}</div>
      </div>
      <div class="ledger-entry__amt ${e.type}">${e.type === "debit" ? "+" : "−"} ${formatTaka(e.amount)}</div>
    </div>
  `).join("") || `<p style="color:var(--ink-muted);font-size:13px">কোনো এন্ট্রি নেই</p>`;

  document.getElementById("customerModal").classList.add("open");
}

function updateCustomerNote(value) {
  if (!activeCustomerPhone) return;
  ensureCustomerProfile(activeCustomerPhone, { varietyNote: value });
  renderCustomerList();
  toast("নোটস হালনাগাদ হয়েছে");
}

function closeCustomerModal() {
  document.getElementById("customerModal").classList.remove("open");
}

function submitManualLedgerEntry(e) {
  e.preventDefault();
  const f = e.target;
  const type = f.type.value;
  const amount = Number(f.amount.value);
  const note = f.note.value.trim();
  if (!activeCustomerPhone || amount <= 0) return;
  const ledger = getLedger();
  const c = ledger[activeCustomerPhone];
  addLedgerEntry(activeCustomerPhone, c.name, c.address, type, amount, note || (type === "debit" ? "নতুন বাকি" : "পরিশোধ গ্রহণ"));
  f.reset();
  openCustomerDetail(activeCustomerPhone);
  renderCustomerList();
  toast("এন্ট্রি যোগ হয়েছে");
}

function addNewCustomerManually(e) {
  e.preventDefault();
  const f = e.target;
  const phone = normalizePhone(f.phone.value);
  const name = f.name.value.trim();
  const district = f.district.value;
  const thana = f.thana.value;
  const address = f.address.value.trim();
  const varietyNote = f.note.value;
  const openingDue = Number(f.openingDue.value || 0);
  if (!phone || !name) { toast("নাম ও ফোন নম্বর দিন"); return; }
  ensureCustomerProfile(phone, { name, address, district, thana, varietyNote });
  if (openingDue > 0) addLedgerEntry(phone, name, address, "debit", openingDue, "প্রারম্ভিক বাকি (opening balance)");
  f.reset();
  closeNewCustomerModal();
  renderCustomerList();
  toast("গ্রাহক যোগ হয়েছে");
}

function openNewCustomerModal() { document.getElementById("newCustomerModal").classList.add("open"); }
function closeNewCustomerModal() { document.getElementById("newCustomerModal").classList.remove("open"); }
