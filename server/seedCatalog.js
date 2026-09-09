import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import Product from "./src/models/Product.js";
import Store from "./src/models/Store.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env");
}

/*
====================================================
STORE HELPERS
====================================================
*/

const storeCache = {};

async function getStore(storeName) {
  if (storeCache[storeName]) {
    return storeCache[storeName];
  }

  const store = await Store.findOne({
    name: storeName,
    status: "ACTIVE",
  });

  if (!store) {
    throw new Error(`Active store not found: ${storeName}`);
  }

  storeCache[storeName] = store;
  return store;
}

/*
====================================================
CATALOG
====================================================
*/

const catalog = [

  // =================================================
  // FASHION -> MEN
  // =================================================

  {
    name: "Classic Men's Casual Cotton Shirt",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Men",
    price: 1299,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788577842/Gemini_Generated_Image_tg08tgtg08tgtg08.png",
      "https://res.cloudinary.com/jyggisti/image/upload/v1788537351/Copilot_20260904_095002.png",
      "https://res.cloudinary.com/jyggisti/image/upload/v1788537157/Copilot_20260904_094929.png",
    ],
  },

  {
    name: "Straight-Fit Denim Jeans",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Men",
    price: 1899,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788577894/Gemini_Generated_Image_gcdncjgcdncjgcdn.png",
      "https://res.cloudinary.com/jyggisti/image/upload/v1788577867/Gemini_Generated_Image_bdbvjzbdbvjzbdbv.png",
      "https://res.cloudinary.com/jyggisti/image/upload/v1788537384/Copilot_20260904_095009.png",
    ],
  },

  {
    name: "Men's Casual Sneakers",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Men",
    price: 2299,
    stock: 18,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788537319/Copilot_20260904_094949.png",
      "https://res.cloudinary.com/jyggisti/image/upload/v1788537275/Copilot_20260904_094947.png",
      "https://res.cloudinary.com/jyggisti/image/upload/v1788537181/Copilot_20260904_094940.png",
    ],
  },

  {
    name: "Men's Polo T-Shirt",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Men",
    price: 999,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788577916/Gemini_Generated_Image_bdmk31bdmk31bdmk.png",
    ],
  },

  {
    name: "Men's Casual Hoodie",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Men",
    price: 1599,
    stock: 22,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788577945/Gemini_Generated_Image_uqli7puqli7puqli.png",
    ],
  },

  {
    name: "Men's Leather-Style Wallet",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Men",
    price: 799,
    stock: 35,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788577968/Gemini_Generated_Image_n7gn52n7gn52n7gn.png",
    ],
  },

  // =================================================
  // FASHION -> WOMEN
  // =================================================

  {
    name: "Women's Casual Handbag",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Women",
    price: 1799,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788577995/Gemini_Generated_Image_c9lh9qc9lh9qc9lh.png",
    ],
  },

  {
    name: "Women's Cotton Kurti",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Women",
    price: 1299,
    stock: 24,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578027/Gemini_Generated_Image_ukdzndukdzndukdz.png",
    ],
  },

  {
    name: "Women's Oversized T-Shirt",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Women",
    price: 899,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578061/Gemini_Generated_Image_i2hm2zi2hm2zi2hm.png",
    ],
  },

  {
    name: "Women's Denim Jacket",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Women",
    price: 1999,
    stock: 16,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578091/Gemini_Generated_Image_t688p7t688p7t688.png",
    ],
  },

  {
    name: "Women's Crossbody Bag",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Women",
    price: 1199,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578121/Gemini_Generated_Image_ze6ryqze6ryqze6r.png",
    ],
  },

  {
    name: "Women's Casual Blouse",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Women",
    price: 1099,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788583287/Gemini_Generated_Image_gg7u9ngg7u9ngg7u.png",
    ],
  },

  // =================================================
  // FASHION -> KIDS
  // =================================================

  {
    name: "Kids Cartoon Backpack",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Kids",
    price: 799,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578185/Gemini_Generated_Image_wtmfyewtmfyewtmf.png",
    ],
  },

  {
    name: "Kids Cotton T-Shirt",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Kids",
    price: 599,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578208/Gemini_Generated_Image_4tr4rz4tr4rz4tr4.png",
    ],
  },

  {
    name: "Kids Building Blocks Set",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Kids",
    price: 899,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578235/Gemini_Generated_Image_y4iu31y4iu31y4iu.png",
    ],
  },

  {
    name: "Educational Puzzle Set",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Kids",
    price: 699,
    stock: 24,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578260/Gemini_Generated_Image_hpjsxhhpjsxhhpjs.png",
    ],
  },

  {
    name: "Kids Hooded Sweatshirt",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Kids",
    price: 999,
    stock: 18,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578280/Gemini_Generated_Image_q2yzy2q2yzy2q2yz.png",
    ],
  },

  {
    name: "Kids Water Bottle",
    store: "UrbanGear",
    category: "Fashion",
    subcategory: "Kids",
    price: 499,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578306/Gemini_Generated_Image_5afypx5afypx5afy.png",
    ],
  },

  // =================================================
  // FOOD
  // =================================================

  {
    name: "Chocolate Chip Cookies",
    store: "PAN-Cakes",
    category: "Food",
    subcategory: "Snacks",
    price: 249,
    stock: 40,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578349/Gemini_Generated_Image_y4lvvby4lvvby4lv.png",
    ],
  },

  {
    name: "Mixed Fruit Juice",
    store: "PAN-Cakes",
    category: "Food",
    subcategory: "Beverages",
    price: 199,
    stock: 35,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578370/Gemini_Generated_Image_n325dyn325dyn325.png",
    ],
  },

  {
    name: "Dark Chocolate Bar",
    store: "PAN-Cakes",
    category: "Food",
    subcategory: "Snacks",
    price: 179,
    stock: 45,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578392/Gemini_Generated_Image_hlqw1zhlqw1zhlqw.png",
    ],
  },

  // =================================================
  // GROCERY
  // =================================================

  {
    name: "Premium Basmati Rice",
    store: "PAN-Cakes",
    category: "Grocery",
    subcategory: "Staples",
    price: 699,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578320/Gemini_Generated_Image_tcd24xtcd24xtcd2.png",
    ],
  },

  {
    name: "Organic Wheat Flour",
    store: "PAN-Cakes",
    category: "Grocery",
    subcategory: "Staples",
    price: 299,
    stock: 35,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578414/Gemini_Generated_Image_o5jfouo5jfouo5jf.png",
    ],
  },

  {
    name: "Cooking Oil Bottle",
    store: "PAN-Cakes",
    category: "Grocery",
    subcategory: "Staples",
    price: 549,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578431/Gemini_Generated_Image_hqatrrhqatrrhqat.png",
    ],
  },

  {
    name: "Premium Green Tea Pack",
    store: "PAN-Cakes",
    category: "Grocery",
    subcategory: "Beverages",
    price: 399,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578452/Gemini_Generated_Image_6lktr16lktr16lkt.png",
    ],
  },

  {
    name: "Fresh Mixed Vegetable Basket",
    store: "PAN-Cakes",
    category: "Grocery",
    subcategory: "Fresh Produce",
    price: 449,
    stock: 15,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578475/Gemini_Generated_Image_3bieo33bieo33bie.png",
    ],
  },

  {
    name: "Fresh Seasonal Fruit Basket",
    store: "PAN-Cakes",
    category: "Grocery",
    subcategory: "Fresh Produce",
    price: 499,
    stock: 15,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578498/Gemini_Generated_Image_k22obgk22obgk22o.png",
    ],
  },

  // =================================================
  // ELECTRONICS -> NOVATECH
  // =================================================

  {
    name: "Modern Laptop",
    store: "NovaTech",
    category: "Electronics",
    subcategory: "Computers",
    price: 64999,
    stock: 10,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578518/Gemini_Generated_Image_jr28kvjr28kvjr28.png",
    ],
  },

  {
    name: "Modern Smartphone",
    store: "NovaTech",
    category: "Electronics",
    subcategory: "Smartphones",
    price: 24999,
    stock: 15,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578544/Gemini_Generated_Image_mkpw2rmkpw2rmkpw.png",
    ],
  },

  {
    name: "Front-load Washing Machine",
    store: "NovaTech",
    category: "Electronics",
    subcategory: "Home Appliances",
    price: 32999,
    stock: 8,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578566/Gemini_Generated_Image_tj4wcwtj4wcwtj4w.png",
    ],
  },

  {
    name: "Modern Smart TV",
    store: "NovaTech",
    category: "Electronics",
    subcategory: "Home Appliances",
    price: 45999,
    stock: 7,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578583/Gemini_Generated_Image_x6gkaax6gkaax6gk.png",
    ],
  },

  // =================================================
  // BEAUTY
  // =================================================

  {
    name: "Premium Skincare Set",
    store: "UrbanGear",
    category: "Beauty",
    subcategory: "Skincare",
    price: 1899,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578610/Gemini_Generated_Image_hkmiehhkmiehhkmi.png",
    ],
  },

  {
    name: "Matte Lipstick",
    store: "UrbanGear",
    category: "Beauty",
    subcategory: "Makeup",
    price: 699,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578621/Gemini_Generated_Image_2yqj4l2yqj4l2yqj.png",
    ],
  },

  {
    name: "Hydrating Face Moisturizer",
    store: "UrbanGear",
    category: "Beauty",
    subcategory: "Skincare",
    price: 799,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578640/Gemini_Generated_Image_3vbwo73vbwo73vbw.png",
    ],
  },

  {
    name: "Premium Moisturizing Shampoo",
    store: "UrbanGear",
    category: "Beauty",
    subcategory: "Haircare",
    price: 599,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578657/Gemini_Generated_Image_tps7octps7octps7.png",
    ],
  },

  {
    name: "Elegant Perfume Bottle",
    store: "UrbanGear",
    category: "Beauty",
    subcategory: "Fragrance",
    price: 1499,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578678/Gemini_Generated_Image_jv2dt8jv2dt8jv2d.png",
    ],
  },

  // =================================================
  // HOME & LIVING
  // =================================================

  {
    name: "Modern Table Lamp",
    store: "UrbanGear",
    category: "Home & Living",
    subcategory: "Decor",
    price: 1299,
    stock: 18,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578732/Gemini_Generated_Image_x8p87kx8p87kx8p8.png",
    ],
  },

  {
    name: "Decorative Indoor Plant Set",
    store: "UrbanGear",
    category: "Home & Living",
    subcategory: "Decor",
    price: 999,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578744/Gemini_Generated_Image_tl6aumtl6aumtl6a.png",
    ],
  },

  {
    name: "Modern Decorative Ceramic Vase",
    store: "UrbanGear",
    category: "Home & Living",
    subcategory: "Decor",
    price: 899,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578757/Gemini_Generated_Image_j6jggdj6jggdj6jg.png",
    ],
  },

  // =================================================
  // STATIONERY
  // =================================================

  {
    name: "Premium Hardcover Notebook",
    store: "UrbanGear",
    category: "Stationery",
    subcategory: "Writing",
    price: 349,
    stock: 40,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578774/Gemini_Generated_Image_7qw67r7qw67r7qw6.png",
    ],
  },

  {
    name: "Premium Gel Pen Set",
    store: "UrbanGear",
    category: "Stationery",
    subcategory: "Writing",
    price: 249,
    stock: 45,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578787/Gemini_Generated_Image_qizpd7qizpd7qizp.png",
    ],
  },

  {
    name: "Modern Pencil Case",
    store: "UrbanGear",
    category: "Stationery",
    subcategory: "Writing",
    price: 299,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578801/Gemini_Generated_Image_411ph1411ph1411p.png",
    ],
  },

  {
    name: "Geometry & School Stationery Kit",
    store: "UrbanGear",
    category: "Stationery",
    subcategory: "School Supplies",
    price: 499,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578815/Gemini_Generated_Image_psck3ypsck3ypsck.png",
    ],
  },

  // =================================================
  // TOOLS
  // =================================================

  {
    name: "Professional Claw Hammer",
    store: "UrbanGear",
    category: "Tools",
    subcategory: "Hand Tools",
    price: 699,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578830/Gemini_Generated_Image_9fzxg69fzxg69fzx.png",
    ],
  },

  {
    name: "Professional Screwdriver Set",
    store: "UrbanGear",
    category: "Tools",
    subcategory: "Hand Tools",
    price: 799,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578842/Gemini_Generated_Image_q6dnsiq6dnsiq6dn.png",
    ],
  },

  {
    name: "Professional Adjustable Wrench",
    store: "UrbanGear",
    category: "Tools",
    subcategory: "Hand Tools",
    price: 599,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578860/Gemini_Generated_Image_gxm7afgxm7afgxm7.png",
    ],
  },

  {
    name: "Cordless Power Drill",
    store: "UrbanGear",
    category: "Tools",
    subcategory: "Power Tools",
    price: 3499,
    stock: 10,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788583505/Gemini_Generated_Image_2inatc2inatc2ina.png",
    ],
  },

  {
    name: "Retractable Measuring Tape",
    store: "UrbanGear",
    category: "Tools",
    subcategory: "Measuring Tools",
    price: 299,
    stock: 35,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578871/Gemini_Generated_Image_w75go7w75go7w75g.png",
    ],
  },

  // =================================================
  // ARTS
  // =================================================

  {
    name: "Professional Acrylic Paint Set",
    store: "UrbanGear",
    category: "Arts",
    subcategory: "Painting",
    price: 899,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578886/Gemini_Generated_Image_9k947o9k947o9k94.png",
    ],
  },

  {
    name: "Professional Paint Brush Set",
    store: "UrbanGear",
    category: "Arts",
    subcategory: "Painting",
    price: 699,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578901/Gemini_Generated_Image_9kcbl39kcbl39kcb.png",
    ],
  },

  {
    name: "Premium Artist Sketchbook",
    store: "UrbanGear",
    category: "Arts",
    subcategory: "Drawing",
    price: 599,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578911/Gemini_Generated_Image_9xacsg9xacsg9xac.png",
    ],
  },

  {
    name: "Professional Drawing Pencil Set",
    store: "UrbanGear",
    category: "Arts",
    subcategory: "Drawing",
    price: 349,
    stock: 20,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578926/Gemini_Generated_Image_mcf2ivmcf2ivmcf2.png",
    ],
  },

  {
    name: "Professional Blank Canvas Painting Board",
    store: "UrbanGear",
    category: "Arts",
    subcategory: "Painting",
    price: 499,
    stock: 25,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788582377/Gemini_Generated_Image_1s6yve1s6yve1s6y.png",
    ],
  },
];

/*
====================================================
IMPORTED PRODUCTS
Update the five products already present in Atlas.
====================================================
*/

const importedProducts = [

  {
    name: "BoAT Airpods 292",
    store: "BOAT FIRE",
    category: "Electronics",
    subcategory: "Audio",
    price: 2999,
    stock: 37,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578937/Gemini_Generated_Image_2etw0a2etw0a2etw.png",
    ],
  },

  {
    name: "POWER BANK 10000mAh Battery",
    store: "BOAT FIRE",
    category: "Electronics",
    subcategory: "Mobile Accessories",
    price: 4500,
    stock: 17,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578951/Gemini_Generated_Image_hrt1phrt1phrt1ph.png",
    ],
  },

  {
    name: "Neckband Primium BoAt",
    store: "BOAT FIRE",
    category: "Electronics",
    subcategory: "Audio",
    price: 799,
    stock: 30,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578964/Gemini_Generated_Image_73rzlf73rzlf73rz.png",
    ],
  },

  {
    name: "2 Kg blackforest",
    store: "PAN-Cakes",
    category: "Food",
    subcategory: "Bakery",
    price: 850,
    stock: 50,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578973/Gemini_Generated_Image_135wuf135wuf135w.png",
    ],
  },

  {
    name: "1 Kg Whiteforest",
    store: "PAN-Cakes",
    category: "Food",
    subcategory: "Bakery",
    price: 400,
    stock: 8,
    images: [
      "https://res.cloudinary.com/jyggisti/image/upload/v1788578983/Gemini_Generated_Image_9wf8c29wf8c29wf8.png",
    ],
  },

];

/*
====================================================
UPSERT PRODUCT
====================================================
*/

async function upsertProduct(data) {
  const store = await getStore(data.store);

  const productData = {
    storeId: store._id,
    vendorId: store.vendorId,

    name: data.name,
    price: data.price,
    stock: data.stock,

    category: data.category,
    subcategory: data.subcategory,

    images: data.images,

    active: true,
  };

  const existing = await Product.findOne({
    storeId: store._id,
    name: data.name,
  });

  if (existing) {
    Object.assign(existing, productData);

    await existing.save();

    console.log(
      `UPDATED: ${data.name} → ${data.category} / ${data.subcategory}`
    );

    return "updated";
  }

  await Product.create(productData);

  console.log(
    `CREATED: ${data.name} → ${data.category} / ${data.subcategory}`
  );

  return "created";
}

/*
====================================================
RUN
====================================================
*/

async function run() {
  try {
    console.log("\nConnecting to MongoDB...\n");

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected.\n");

    let created = 0;
    let updated = 0;

    for (const product of catalog) {
      const result = await upsertProduct(product);

      if (result === "created") {
        created++;
      } else {
        updated++;
      }
    }

    console.log("\nUpdating imported products...\n");

    for (const product of importedProducts) {
      const result = await upsertProduct(product);

      if (result === "created") {
        created++;
      } else {
        updated++;
      }
    }

    const totalCatalogProducts = await Product.countDocuments();

    console.log("\n========================================");
    console.log("CATALOG MIGRATION COMPLETE");
    console.log("========================================");
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`Total products in database: ${totalCatalogProducts}`);
    console.log("========================================\n");

  } catch (error) {
    console.error("\nCATALOG MIGRATION ERROR:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

run();