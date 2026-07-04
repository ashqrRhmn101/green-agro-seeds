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

/* localStorage-এ ম্যানুয়ালি যোগ করা কাস্টম পণ্য/জাত এই key-তে সেভ হয়,
   এবং অ্যাপ চালু হওয়ার সময় মূল ক্যাটালগের সাথে merge হয়ে যায়। */
const CUSTOM_PRODUCTS_KEY = "gas_custom_products";

function getFullCatalog() {
  const custom = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]");
  return [...PRODUCT_CATALOG, ...custom];
}

function saveCustomProduct(product) {
  const custom = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]");
  custom.push(product);
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(custom));
}
