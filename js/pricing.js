/* ==========================================================================
   Pricing Engine
   দুই মোডে হিসাব হয়:
   - "packet"  : প্যাকেট প্রতি দাম × প্যাকেট সংখ্যা   (খুচরা/প্যাকেট বিক্রি)
   - "bulk"    : কেজি/বাল্ক প্রতি দাম × মোট কেজি        (পাইকারি/লুজ বিক্রি)
   প্রতিটি ধাপ traceable রাখা হয় যাতে ইনভয়েসে দেখানো যায় হিসাবটা কীভাবে হলো।
   ========================================================================== */

function calcPacketSale(option, packetCount) {
  const unitTotalGrams = option.qty * packetCount;
  const total = option.packetPrice * packetCount;
  return {
    mode: "packet",
    unitPrice: option.packetPrice,
    count: packetCount,
    totalGrams: unitTotalGrams,
    total,
    breakdown: `${option.packetPrice} × ${packetCount} = ${total}`,
  };
}

function calcBulkSale(option, totalKg, useBulkRate) {
  const rate = useBulkRate ? option.bulkPrice : option.kgPrice;
  const total = Math.round(rate * totalKg);
  return {
    mode: "bulk",
    unitPrice: rate,
    totalKg,
    total,
    breakdown: `${rate} × ${totalKg} কেজি = ${total}`,
  };
}

function calcRetailSale(option, packetCount) {
  const total = option.retailPrice * packetCount;
  return {
    mode: "retail",
    unitPrice: option.retailPrice,
    count: packetCount,
    total,
    breakdown: `${option.retailPrice} × ${packetCount} = ${total}`,
  };
}

function formatTaka(n) {
  return "৳ " + Number(n).toLocaleString("bn-BD");
}
