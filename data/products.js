/* ==========================================================================
   Green Agro Seeds — Product Catalog
   মূল্য তালিকা ২০২৬ (১লা জানুয়ারি – ৩১ ডিসেম্বর) অনুযায়ী তৈরি
   প্রতিটি ভ্যারাইটির প্রতিটি quantity-option-এর ৪টি দাম (প্যাকেট / কেজি / বাল্ক-লুজ / খুচরা)
   শীট থেকে হুবহু তোলা — এগুলো কোনো ফর্মুলা দিয়ে অটো-ক্যালকুলেট করা হয়নি,
   কারণ কিছু পণ্যে (যেমন তরমুজ) দাম রৈখিক (linear) সূত্র মানে না।
   অ্যাডমিন প্যানেল থেকে যেকোনো সময় এই মানগুলো এডিট/যোগ করা যাবে।
   ========================================================================== */

const PRODUCT_CATALOG = [
  {
    id: "morich",
    category: "মরিচ বীজ",
    varieties: [
      { name: "ঝলক-১", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 380, kgPrice: 38000, bulkPrice: 35000, retailPrice: 500 }
      ]},
      { name: "ঝলক-১ ডিজি DG", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 850, kgPrice: 85000, bulkPrice: 82000, retailPrice: 600 }
      ]},
      { name: "গ্রীণ প্লাস-১০৫", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 650, kgPrice: 65000, bulkPrice: 55000, retailPrice: 600 }
      ]},
      { name: "গ্রীন ফায়ার", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 920, kgPrice: 92000, bulkPrice: 80000, retailPrice: 1000 }
      ]},
    ]
  },
  {
    id: "dhundul",
    category: "ধন্দুল বীজ",
    varieties: [
      { name: "আগমনী-১", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 75, kgPrice: 7500, bulkPrice: 8500, retailPrice: 110 }
      ]},
    ]
  },
  {
    id: "derosh",
    category: "ঢেঁড়স বীজ",
    varieties: [
      { name: "নবীন-১", options: [
        { qty: 50,  unit: "গ্রাম", packetPrice: 200, kgPrice: 4000, bulkPrice: 3800, retailPrice: 350 },
        { qty: 100, unit: "গ্রাম", packetPrice: 380, kgPrice: 3800, bulkPrice: 3800, retailPrice: 650 },
      ]},
    ]
  },
  {
    id: "chichinga",
    category: "চিচিঙ্গা বীজ",
    varieties: [
      { name: "প্রভাতী-১০০", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 155, kgPrice: 15500, bulkPrice: 14000, retailPrice: 200 }
      ]},
    ]
  },
  {
    id: "korola",
    category: "করলা বীজ",
    varieties: [
      { name: "তিতাস-১০০", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 180, kgPrice: 18000, bulkPrice: 14000, retailPrice: 250 }
      ]},
    ]
  },
  {
    id: "lau",
    category: "লাউ বীজ",
    varieties: [
      { name: "তমা", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 70, kgPrice: 7000, bulkPrice: 5600, retailPrice: 120 }
      ]},
    ]
  },
  {
    id: "dhonia",
    category: "ধনিয়া",
    varieties: [
      { name: "গ্রীণ এগ্রো-৩০", options: [
        { qty: 1000, unit: "গ্রাম", packetPrice: 330, kgPrice: 330, bulkPrice: 280, retailPrice: 800 }
      ]},
    ]
  },
  {
    id: "borboti",
    category: "বরবটি",
    varieties: [
      { name: "সবুজ সাথি", options: [
        { qty: 100, unit: "গ্রাম", packetPrice: 220, kgPrice: 2200, bulkPrice: 1900, retailPrice: 350 }
      ]},
    ]
  },
  {
    id: "shosha",
    category: "শশা",
    varieties: [
      { name: "বৈশাখী-৩৫", options: [
        { qty: 10, unit: "গ্রাম", packetPrice: 280, kgPrice: 28000, bulkPrice: 20000, retailPrice: 800 }
      ]},
    ]
  },
  {
    id: "tarmuj",
    category: "তরমুজ",
    varieties: [
      { name: "তৃপ্তি-৬৫", options: [
        { qty: 50, unit: "গ্রাম", packetPrice: 1800, kgPrice: 28000, bulkPrice: 28000, retailPrice: 2800 }
      ]},
      { name: "রয়েল-৬০", options: [
        { qty: 100, unit: "গ্রাম", packetPrice: 2600, kgPrice: 26000, bulkPrice: 24000, retailPrice: 8500 }
      ]},
    ]
  },
];

/* ==========================================================================
   localStorage layers on top of the base catalog:
   - CUSTOM_PRODUCTS_KEY : সম্পূর্ণ নতুন ক্যাটাগরি/জাত (একটা অপশনসহ)
   - CUSTOM_OPTIONS_KEY  : বিদ্যমান কোনো জাতে নতুন quantity-option যোগ
   - OVERRIDES_KEY       : কোনো option-এর দাম/পরিমাণ এডিট করলে তার override
   - DELETED_KEY         : মুছে ফেলা option-গুলোর key (soft delete)
   সবগুলো getFullCatalog() একসাথে মার্জ করে চূড়ান্ত ক্যাটালগ তৈরি করে।
   ========================================================================== */

const CUSTOM_PRODUCTS_KEY = "gas_custom_products";
const CUSTOM_OPTIONS_KEY  = "gas_custom_options";
const OVERRIDES_KEY       = "gas_overrides";
const DELETED_KEY         = "gas_deleted";

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function optionKey(catId, varietyName, qty, unit) {
  return `${catId}::${varietyName}::${qty}${unit}`;
}

function saveCustomProduct(product) {
  const custom = readJSON(CUSTOM_PRODUCTS_KEY, []);
  custom.push(product);
  writeJSON(CUSTOM_PRODUCTS_KEY, custom);
}

/* নতুন খালি ক্যাটাগরি বা বিদ্যমান ক্যাটাগরিতে নতুন জাত (দাম ছাড়া নাম-মাত্র) যোগ */
function addCategoryOrVariety({ categoryId, categoryName, varietyName }) {
  const custom = readJSON(CUSTOM_PRODUCTS_KEY, []);
  if (categoryId) {
    custom.push({ id: categoryId, category: null, varieties: [{ name: varietyName, options: [] }] });
  } else {
    const id = "cat-" + Date.now();
    custom.push({ id, category: categoryName, varieties: [{ name: varietyName, options: [] }] });
  }
  writeJSON(CUSTOM_PRODUCTS_KEY, custom);
  return categoryId || custom[custom.length - 1].id;
}

function addCustomOption(catId, varietyName, option) {
  const all = readJSON(CUSTOM_OPTIONS_KEY, {});
  const key = `${catId}::${varietyName}`;
  if (!all[key]) all[key] = [];
  all[key].push(option);
  writeJSON(CUSTOM_OPTIONS_KEY, all);
}

function setOptionOverride(catId, varietyName, qty, unit, fields) {
  const all = readJSON(OVERRIDES_KEY, {});
  all[optionKey(catId, varietyName, qty, unit)] = fields;
  writeJSON(OVERRIDES_KEY, all);
}

function deleteOption(catId, varietyName, qty, unit) {
  const deleted = readJSON(DELETED_KEY, []);
  const key = optionKey(catId, varietyName, qty, unit);
  if (!deleted.includes(key)) deleted.push(key);
  writeJSON(DELETED_KEY, deleted);
}

function getFullCatalog() {
  const customProducts = readJSON(CUSTOM_PRODUCTS_KEY, []);
  const customOptions = readJSON(CUSTOM_OPTIONS_KEY, {});
  const overrides = readJSON(OVERRIDES_KEY, {});
  const deleted = readJSON(DELETED_KEY, []);

  // base + custom category/variety merge (একই id একাধিকবার থাকলে varieties একত্র হয়)
  const byId = {};
  [...PRODUCT_CATALOG, ...customProducts].forEach(c => {
    if (!byId[c.id]) byId[c.id] = { id: c.id, category: c.category, varieties: [] };
    if (c.category) byId[c.id].category = c.category;
    c.varieties.forEach(v => byId[c.id].varieties.push({ name: v.name, options: [...v.options] }));
  });

  return Object.values(byId).map(cat => ({
    ...cat,
    varieties: cat.varieties.map(v => {
      const extra = customOptions[`${cat.id}::${v.name}`] || [];
      const allOptions = [...v.options, ...extra]
        .map(o => {
          const key = optionKey(cat.id, v.name, o.qty, o.unit);
          return overrides[key] ? { ...o, ...overrides[key] } : o;
        })
        .filter(o => !deleted.includes(optionKey(cat.id, v.name, o.qty, o.unit)));
      return { ...v, options: allOptions };
    }),
  }));
}
