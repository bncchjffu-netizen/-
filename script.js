/* ================================================================
   script.js — Gold Nutrition Rouiba
   المنطق الكامل: Firebase · السلة · واتساب · استبدال النص
   ================================================================ */

/* ================================================================
   0. استبدال النص — Arabic ➜ French
   ================================================================
   يبحث عن "غولد نيوتريشن رويبة" في كامل الصفحة ويستبدلها
   بـ "Gold Nutrition Rouiba" حتى في المحتوى المُحمَّل ديناميكياً.
   ================================================================ */

/**
 * يستبدل نص داخل عقدة نصية واحدة (TextNode).
 * @param {Text} node
 */
function replaceInTextNode(node) {
  if (node.nodeValue && node.nodeValue.includes("غولد نيوتريشن رويبة")) {
    node.nodeValue = node.nodeValue.replace(/غولد نيوتريشن رويبة/g, "Gold Nutrition Rouiba");
  }
}

/**
 * يمشي على كل العقد النصية داخل عنصر معيّن.
 * @param {Element} root - العنصر الجذري للبحث فيه
 */
function walkTextNodes(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,   // فقط العقد النصية
    null
  );
  let node;
  while ((node = walker.nextNode())) {
    replaceInTextNode(node);
  }
}

/**
 * يُشغَّل فور تحميل الصفحة ثم يراقب أي تغييرات DOM لاحقة.
 * يعمل حتى مع المحتوى المُضاف ديناميكياً (Firebase / Ajax).
 */
function initTextReplacer() {
  /* --- استبدال أوّلي لكل محتوى الصفحة --- */
  walkTextNodes(document.body);

  /* --- مراقب DOM: يعمل على كل عقدة تُضاف لاحقاً --- */
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      /* عقد نصية جديدة مباشرة */
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          replaceInTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          walkTextNodes(node);
        }
      });
      /* تغيير في نص عقدة موجودة */
      if (
        mutation.type === "characterData" &&
        mutation.target.nodeType === Node.TEXT_NODE
      ) {
        replaceInTextNode(mutation.target);
      }
    });
  });

  observer.observe(document.body, {
    childList:     true,   // رصد إضافة / إزالة العناصر
    subtree:       true,   // رصد كل المستويات
    characterData: true,   // رصد تغيير النصوص مباشرة
  });
}

/* تشغيل المستبدِل بعد اكتمال DOM */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTextReplacer);
} else {
  initTextReplacer();
}

/* ================================================================
   نهاية قسم استبدال النص
   ================================================================ */

/* ----------------------------------------------------------------
   1. إعداد Firebase
   ----------------------------------------------------------------
   خطوات الحصول على المفاتيح:
   1. اذهب إلى https://console.firebase.google.com
   2. أنشئ مشروعاً جديداً أو افتح مشروعاً موجوداً
   3. Project Settings → General → Your Apps → Add Web App
   4. انسخ firebaseConfig وضعه هنا
   5. فعّل Realtime Database وضع قواعد القراءة/الكتابة:
      { "rules": { ".read": true, ".write": true } }
   ---------------------------------------------------------------- */
const firebaseConfig = {
  apiKey:            "PASTE_YOUR_API_KEY_HERE",
  authDomain:        "PASTE_YOUR_AUTH_DOMAIN_HERE",
  databaseURL:       "PASTE_YOUR_DATABASE_URL_HERE",     // مثال: https://my-app-default-rtdb.firebaseio.com
  projectId:         "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket:     "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId:             "PASTE_YOUR_APP_ID_HERE",
};

/* -------- هل تم تكوين Firebase؟ -------- */
const FB_CONFIGURED =
  firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE" &&
  firebaseConfig.databaseURL !== "PASTE_YOUR_DATABASE_URL_HERE";

/* -------- تهيئة التطبيق -------- */
let db = null;
if (FB_CONFIGURED) {
  firebase.initializeApp(firebaseConfig);
  db = firebase.database();
}

/* ================================================================
   2. المنتجات الافتراضية (تُستخدم عندما لا يوجد Firebase)
   ================================================================ */
const DEFAULT_PRODUCTS = [
  { id:"1", name:"واي بروتين جولد",       category:"بروتين",           price:4500, image:"https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&q=80", description:"بروتين واي ممتاز – 2.27 كغ", inStock:true },
  { id:"2", name:"كرياتين مونوهيدرات",    category:"كرياتين",          price:2200, image:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", description:"كرياتين نقي مجهري – 500 غ",    inStock:true },
  { id:"3", name:"ماس جينر برو",          category:"زيادة الوزن",      price:5800, image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", description:"مكمل ضخامة – 5 كغ",          inStock:true },
  { id:"4", name:"بري-ووركاوت بلاست",     category:"ما قبل التمرين",   price:3100, image:"https://images.unsplash.com/photo-1616279969856-759f316a5ac1?w=400&q=80", description:"طاقة انفجارية – 300 غ",       inStock:true },
  { id:"5", name:"BCAA 8:1:1",            category:"أحماض أمينية",     price:2800, image:"https://images.unsplash.com/photo-1620714223084-8fcacc2523f0?w=400&q=80", description:"أحماض أمينية للتعافي – 250 غ",inStock:true },
  { id:"6", name:"أوميغا 3 زيت السمك",   category:"فيتامينات",        price:1400, image:"https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&q=80", description:"زيت السمك – 90 كبسولة",       inStock:true },
  { id:"7", name:"حارق الدهون ثيرمو",    category:"حرق الدهون",       price:3500, image:"https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80", description:"حارق دهون حراري – 60 كبسولة", inStock:true },
  { id:"8", name:"مولتي فيتامين إيليت",  category:"فيتامينات",        price:1800, image:"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80", description:"مجمع فيتامينات – 30 كيس",     inStock:true },
];

/* ================================================================
   3. وظائف CRUD — Firebase
   ================================================================ */

/**
 * جلب المنتجات والاستماع للتغييرات في الوقت الفعلي
 * @param {function} callback - يُنادى عند كل تغيير بقائمة المنتجات
 */
function listenProducts(callback) {
  if (!FB_CONFIGURED) {
    /* وضع محلي — استخدام localStorage */
    const saved = localStorage.getItem("gnr_classic_products");
    const list = saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    callback(list);
    window.addEventListener("gnr_update", () => {
      const s = localStorage.getItem("gnr_classic_products");
      callback(s ? JSON.parse(s) : DEFAULT_PRODUCTS);
    });
    return;
  }
  db.ref("products").on("value", (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      const list = Object.entries(data).map(([id, p]) => ({ id, ...p }));
      callback(list);
    } else {
      /* زرع المنتجات الافتراضية */
      DEFAULT_PRODUCTS.forEach((p) => {
        const { id, ...rest } = p;
        db.ref(`products/${id}`).set(rest);
      });
      callback(DEFAULT_PRODUCTS);
    }
  });
}

/**
 * إضافة منتج جديد
 * @param {{ name, price, category, image, description, inStock }} product
 */
async function addProduct(product) {
  if (!FB_CONFIGURED) {
    const saved = localStorage.getItem("gnr_classic_products");
    const list = saved ? JSON.parse(saved) : [...DEFAULT_PRODUCTS];
    const newP = { ...product, id: "p_" + Date.now() };
    list.unshift(newP);
    localStorage.setItem("gnr_classic_products", JSON.stringify(list));
    window.dispatchEvent(new Event("gnr_update"));
    return newP;
  }
  const ref = db.ref("products").push();
  await ref.set(product);
  return { id: ref.key, ...product };
}

/**
 * تعديل سعر المنتج
 * @param {string} id
 * @param {number} newPrice
 */
async function updatePrice(id, newPrice) {
  if (!FB_CONFIGURED) {
    const saved = localStorage.getItem("gnr_classic_products");
    const list = saved ? JSON.parse(saved) : [...DEFAULT_PRODUCTS];
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) list[idx].price = newPrice;
    localStorage.setItem("gnr_classic_products", JSON.stringify(list));
    window.dispatchEvent(new Event("gnr_update"));
    return;
  }
  await db.ref(`products/${id}/price`).set(newPrice);
}

/**
 * تعديل منتج كامل
 * @param {string} id
 * @param {object} data
 */
async function updateProduct(id, data) {
  if (!FB_CONFIGURED) {
    const saved = localStorage.getItem("gnr_classic_products");
    const list = saved ? JSON.parse(saved) : [...DEFAULT_PRODUCTS];
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) Object.assign(list[idx], data);
    localStorage.setItem("gnr_classic_products", JSON.stringify(list));
    window.dispatchEvent(new Event("gnr_update"));
    return;
  }
  await db.ref(`products/${id}`).update(data);
}

/**
 * حذف منتج
 * @param {string} id
 */
async function deleteProduct(id) {
  if (!FB_CONFIGURED) {
    const saved = localStorage.getItem("gnr_classic_products");
    const list = saved ? JSON.parse(saved) : [...DEFAULT_PRODUCTS];
    localStorage.setItem("gnr_classic_products", JSON.stringify(list.filter((p) => p.id !== id)));
    window.dispatchEvent(new Event("gnr_update"));
    return;
  }
  await db.ref(`products/${id}`).remove();
}

/* ================================================================
   4. السلة
   ================================================================ */
const Cart = (() => {
  let items = []; // [{ product, qty }]
  const listeners = [];

  const notify = () => listeners.forEach((fn) => fn());

  return {
    subscribe(fn) { listeners.push(fn); },

    add(product) {
      const existing = items.find((i) => i.product.id === product.id);
      if (existing) existing.qty += 1;
      else items.push({ product, qty: 1 });
      notify();
    },

    remove(id) {
      items = items.filter((i) => i.product.id !== id);
      notify();
    },

    setQty(id, qty) {
      if (qty <= 0) { this.remove(id); return; }
      const item = items.find((i) => i.product.id === id);
      if (item) { item.qty = qty; notify(); }
    },

    clear() { items = []; notify(); },

    getItems() { return [...items]; },

    getCount() { return items.reduce((s, i) => s + i.qty, 0); },

    getTotal() { return items.reduce((s, i) => s + i.product.price * i.qty, 0); },
  };
})();

/* ================================================================
   5. واتساب — تنسيق الرسالة وإرسالها
   ================================================================ */
const WHATSAPP_NUMBER = "213549195666";

/**
 * فتح واتساب مع تفاصيل الطلب
 * @param {{ firstName, lastName, wilaya, baladiya, phone }} customer
 */
function sendWhatsApp(customer) {
  const items = Cart.getItems();
  if (!items.length) return alert("السلة فارغة!");

  const lines = items
    .map((i) => `• ${i.product.name} x${i.qty} = ${fmt(i.product.price * i.qty)}`)
    .join("\n");

  const msg = encodeURIComponent(
    `🛒 *طلب جديد — غولد نيوتريشن رويبة*\n\n` +
    `👤 الاسم: ${customer.firstName} ${customer.lastName}\n` +
    `📍 الولاية: ${customer.wilaya}\n` +
    `🏘️ البلدية: ${customer.baladiya}\n` +
    `📞 الهاتف: ${customer.phone}\n\n` +
    `*تفاصيل الطلب:*\n${lines}\n\n` +
    `💰 *المجموع: ${fmt(Cart.getTotal())}*\n\n` +
    `شكراً! أرجو تأكيد طلبي.`
  );

  Cart.clear();
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

/* ---- مساعد تنسيق السعر ---- */
function fmt(n) {
  return n.toLocaleString("fr-DZ") + " دج";
}

/* ================================================================
   6. قائمة الولايات الجزائرية
   ================================================================ */
const WILAYAS = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار",
  "البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر",
  "الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة",
  "قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض",
  "إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي",
  "خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت",
  "غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس",
  "عين صالح","عين قزام","توقرت","جانت","المغير","المنيعة",
];
