/**
 * Megacart – script.js  (Database-integrated version)
 * All cart/auth operations now delegate to MegacartDB (db.js).
 * The UI layer is completely unchanged.
 */

/* ════════════════════════════════════════════════════════
   1. DATA
   ════════════════════════════════════════════════════════ */

const BANNERS = [
  { id:"b1", eyebrow:"New Arrivals",    title:"Next-Gen Electronics",  subtitle:"Up to 40% off on top brands. Limited-time deals.",              cta:"Shop Electronics",  category:"electronics", slide:"slide-1" },
  { id:"b2", eyebrow:"Summer Collection", title:"Fashion Forward",     subtitle:"Trendy styles for every occasion. Free delivery over ₹499.",    cta:"Explore Fashion",   category:"fashion",     slide:"slide-2" },
  { id:"b3", eyebrow:"Home Makeover",   title:"Transform Your Space",  subtitle:"Stylish home & kitchen essentials at unbeatable prices.",       cta:"Shop Home",         category:"home",        slide:"slide-3" },
  { id:"b4", eyebrow:"Mega Sale",       title:"Today's Deals",         subtitle:"Massive discounts across all categories. Don't miss out!",      cta:"See All Deals",     category:"deals",       slide:"slide-4" },
  { id:"b5", eyebrow:"Just Launched 🚀",title:"Fresh New Arrivals",    subtitle:"The hottest products of 2025 — be the first to own them!",      cta:"Shop New Arrivals", category:"new-launch",  slide:"slide-5" },
];

const CATEGORIES = [
  { key:"electronics", name:"Electronics",     icon:"bi-cpu-fill",              count:"2,400+ items" },
  { key:"fashion",     name:"Fashion",          icon:"bi-bag-fill",              count:"5,100+ items" },
  { key:"home",        name:"Home & Kitchen",   icon:"bi-house-fill",            count:"3,200+ items" },
  { key:"books",       name:"Books",            icon:"bi-book-fill",             count:"8,700+ items" },
  { key:"sports",      name:"Sports",           icon:"bi-trophy-fill",           count:"1,500+ items" },
  { key:"beauty",      name:"Beauty",           icon:"bi-stars",                 count:"2,900+ items" },
  { key:"toys",        name:"Toys",             icon:"bi-controller",            count:"1,200+ items" },
  { key:"deals",       name:"Today's Deals",    icon:"bi-lightning-charge-fill", count:"Limited offers" },
];

const PRODUCTS = [
  { id:"p01", name:"Samsung Galaxy M34 5G (128 GB, Midnight Blue)", category:"electronics", price:14999, mrp:24999, discount:40, rating:4.3, ratingCount:"1.2L", image:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop&auto=format", badge:"hot", description:"Experience the next-gen 5G connectivity with the Samsung Galaxy M34. Powered by a 6000 mAh battery and a 120Hz Super AMOLED display.", features:["6.5-inch 120Hz Super AMOLED Display","50 MP Triple Camera System","Exynos 1280 Octa-core Processor","6000 mAh Battery with 25W Fast Charging"], stock:"In Stock", tags:["bestseller","recommended"] },
  { id:"p02", name:"boAt Airdopes 141 True Wireless Earbuds", category:"electronics", price:1299, mrp:4490, discount:71, rating:4.1, ratingCount:"85K", image:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&auto=format", badge:"deal", description:"Immerse yourself in music with boAt Airdopes 141. Featuring 8mm drivers and up to 42 hours total playback.", features:["42 Hours Total Playback","Beast Mode with Low Latency","IPX4 Water Resistance","Bluetooth 5.0 Connectivity"], stock:"In Stock", tags:["deal","bestseller"] },
  { id:"p03", name:"HP Victus 15 Gaming Laptop (Intel Core i5, RTX 3050)", category:"electronics", price:55999, mrp:74999, discount:25, rating:4.5, ratingCount:"9.4K", image:"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Dominate every game with the HP Victus 15. Equipped with an NVIDIA RTX 3050 GPU and Intel Core i5 processor.", features:["Intel Core i5-12500H Processor","NVIDIA GeForce RTX 3050 4GB","15.6-inch FHD 144Hz Display","16 GB DDR5 RAM | 512 GB SSD"], stock:"In Stock", tags:["recommended"] },
  { id:"p04", name:"Sony WH-1000XM5 Noise-Cancelling Headphones", category:"electronics", price:24990, mrp:34990, discount:29, rating:4.7, ratingCount:"14K", image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format", badge:"hot", description:"The industry-leading Sony WH-1000XM5 redefines noise cancellation with Dual Noise Sensor technology.", features:["Industry-Leading Noise Cancellation","30-Hour Battery Life with Quick Charge","Multi-Device Pairing","Hi-Res Audio & LDAC Support"], stock:"In Stock", tags:["bestseller","recommended"] },
  { id:"p05", name:"Redmi Smart TV X55 4K QLED (55 inch)", category:"electronics", price:37999, mrp:49999, discount:24, rating:4.2, ratingCount:"22K", image:"https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=400&fit=crop&auto=format", badge:null, description:"Elevate your entertainment with the Redmi Smart TV X55 QLED featuring Quantum Dot technology.", features:["55-inch 4K QLED Panel","Dolby Vision & Dolby Atmos","Android TV 11 with Google Assistant","30W Box Speaker System"], stock:"In Stock", tags:["deal"] },
  { id:"p06", name:"Apple iPhone 15 (128 GB, Black)", category:"electronics", price:69999, mrp:79999, discount:12, rating:4.8, ratingCount:"48K", image:"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&auto=format", badge:"new", description:"The iPhone 15 brings the Dynamic Island to all models with USB-C connectivity and A16 Bionic chip.", features:["A16 Bionic Chip","48 MP Main Camera with 2x Optical Zoom","USB-C with USB 3 speeds","Dynamic Island Interface"], stock:"In Stock", tags:["bestseller","recommended"] },
  { id:"p07", name:"Levi's 511 Slim Fit Stretch Jeans – Dark Indigo", category:"fashion", price:1799, mrp:3999, discount:55, rating:4.3, ratingCount:"44K", image:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&auto=format", badge:"deal", description:"The iconic Levi's 511 Slim Fit jeans with added stretch for all-day comfort.", features:["Slim Fit with Stretch Fabric","Dark Indigo Stonewash Finish","5-Pocket Design","Machine Washable"], stock:"In Stock", tags:["deal","bestseller"] },
  { id:"p08", name:"Nike Air Max 270 React Running Shoes", category:"fashion", price:7495, mrp:12495, discount:40, rating:4.6, ratingCount:"19K", image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Nike Air Max 270 React fuses two innovative cushioning technologies for an ultra-soft ride.", features:["Air Max 270 Unit for Heel Cushioning","React Foam Midsole","Breathable Mesh Upper","Rubber Waffle Outsole for Traction"], stock:"In Stock", tags:["recommended"] },
  { id:"p09", name:"Allen Solly Men's Regular Fit Oxford Shirt", category:"fashion", price:999, mrp:1799, discount:44, rating:4.0, ratingCount:"28K", image:"https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop&auto=format", badge:null, description:"Crafted from premium Oxford cotton, ideal for both office and casual wear.", features:["100% Premium Cotton","Regular Fit","Full Button Placket","Available in Multiple Colors"], stock:"In Stock", tags:["deal"] },
  { id:"p10", name:"Puma Women's Sports Windbreaker Jacket", category:"fashion", price:2399, mrp:4299, discount:44, rating:4.4, ratingCount:"11K", image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format", badge:"hot", description:"Lightweight windbreaker jacket perfect for morning jogs or casual streetwear.", features:["Lightweight Windproof Material","Zip Pockets on Both Sides","Adjustable Hood","Reflective Puma Logo"], stock:"Only 8 left", tags:["bestseller","recommended"] },
  { id:"p11", name:"Prestige IRIS 750W Mixer Grinder (3 Jars)", category:"home", price:2699, mrp:5995, discount:55, rating:4.3, ratingCount:"33K", image:"https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop&auto=format", badge:"deal", description:"Kitchen powerhouse with 3 stainless steel jars for grinding, blending, and chutney making.", features:["750W High-Performance Motor","3 Stainless Steel Jars","3-Speed Control with Pulse Function","ISI Certified & 5 Year Warranty"], stock:"In Stock", tags:["deal","bestseller"] },
  { id:"p12", name:"Havells Fresco RO + UV Water Purifier (7 Stage)", category:"home", price:8499, mrp:14999, discount:43, rating:4.1, ratingCount:"7.6K", image:"https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop&auto=format", badge:"new", description:"7-stage RO+UV purification for 100% safe drinking water.", features:["7-Stage RO + UV Purification","10 Litre Storage Tank","Mineral Retention Technology","Auto Shut-Off & Filter Alerts"], stock:"In Stock", tags:["recommended"] },
  { id:"p13", name:"Philips HL7756/00 650W Hand Blender", category:"home", price:1499, mrp:2799, discount:46, rating:4.4, ratingCount:"18K", image:"https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop&auto=format", badge:null, description:"Makes soups, smoothies, and sauces in seconds with a powerful 650W motor.", features:["650W Motor for Powerful Blending","2-Speed Settings + Turbo Boost","Stainless Steel Blending Shaft","Easy to Detach and Clean"], stock:"In Stock", tags:["deal"] },
  { id:"p14", name:"Atomic Habits by James Clear", category:"books", price:299, mrp:499, discount:40, rating:4.8, ratingCount:"95K", image:"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop&auto=format", badge:"hot", description:"Proven framework for improving every day with practical strategies for habits.", features:["Paperback – 320 pages","Publisher: Random House Business","Language: English","ISBN: 978-1847941831"], stock:"In Stock", tags:["bestseller","deal","recommended"] },
  { id:"p15", name:"Rich Dad Poor Dad – 20th Anniversary Edition", category:"books", price:249, mrp:395, discount:37, rating:4.7, ratingCount:"78K", image:"https://images.unsplash.com/photo-1481627834876-b7833e8f84f0?w=400&h=400&fit=crop&auto=format", badge:null, description:"Classic bestseller exploring the difference between working for money and making money work for you.", features:["Paperback – 336 pages","Publisher: Plata Publishing","Language: English","Includes Author Commentary & Q&A"], stock:"In Stock", tags:["bestseller","recommended"] },
  { id:"p16", name:"The Psychology of Money by Morgan Housel", category:"books", price:279, mrp:450, discount:38, rating:4.8, ratingCount:"55K", image:"https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=400&fit=crop&auto=format", badge:"new", description:"19 short stories exploring the strange ways people think about money.", features:["Paperback – 256 pages","Publisher: Jaico Publishing House","Language: English","International Bestseller"], stock:"In Stock", tags:["deal","recommended"] },
  { id:"p17", name:"Boldfit Yoga Mat 6mm Anti-Slip with Bag", category:"sports", price:399, mrp:799, discount:50, rating:4.4, ratingCount:"41K", image:"https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=400&fit=crop&auto=format", badge:"deal", description:"Eco-friendly TPE yoga mat with excellent cushioning and grip.", features:["6mm High Density TPE Material","Anti-Slip Surface on Both Sides","Comes with Carry Bag & Strap","Dimensions: 183 x 61 cm"], stock:"In Stock", tags:["deal","bestseller"] },
  { id:"p18", name:"Cosco Football Premier – Size 5", category:"sports", price:649, mrp:999, discount:35, rating:4.3, ratingCount:"12K", image:"https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=400&fit=crop&auto=format", badge:null, description:"Synthetic leather football designed for match-play and training.", features:["Synthetic Leather Casing","Butyl Bladder for Air Retention","Size 5 (Official Match Size)","32-Panel Construction"], stock:"In Stock", tags:["recommended"] },
  { id:"p19", name:"Lakme Absolute Argan Oil Serum Foundation SPF 45", category:"beauty", price:549, mrp:1099, discount:50, rating:4.2, ratingCount:"23K", image:"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&auto=format", badge:"deal", description:"Lightweight foundation with Argan Oil and SPF 45 sun protection for a flawless finish.", features:["SPF 45 Sun Protection","Argan Oil Infused for Nourishment","12-Hour Hydration","30 ml – Available in 8 Shades"], stock:"In Stock", tags:["deal","bestseller"] },
  { id:"p20", name:"Mamaearth Vitamin C Face Serum with Hyaluronic Acid", category:"beauty", price:399, mrp:599, discount:33, rating:4.5, ratingCount:"67K", image:"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&auto=format", badge:"hot", description:"Brightens skin, reduces dark spots, and provides intense hydration.", features:["1% Vitamin C for Brightening","Hyaluronic Acid for Deep Hydration","Reduces Dark Spots & Blemishes","Dermatologically Tested, 30 ml"], stock:"In Stock", tags:["recommended","bestseller"] },
  { id:"p21", name:"LEGO Classic Large Creative Brick Box (790 Pieces)", category:"toys", price:3499, mrp:5999, discount:42, rating:4.9, ratingCount:"31K", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format", badge:"new", description:"790 bricks in 33 colors — endless creative possibilities.", features:["790 Bricks in 33 Vibrant Colors","Includes Eyes, Wheels & Axles","Storage Box with Sorting Trays","Ages 4+ | Great Gift Idea"], stock:"In Stock", tags:["recommended","bestseller"] },
  { id:"p22", name:"Funskool Hot Wheels 5-Car Gift Pack", category:"toys", price:299, mrp:499, discount:40, rating:4.4, ratingCount:"15K", image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=400&fit=crop&auto=format", badge:"deal", description:"5 die-cast Hot Wheels vehicles in assorted styles built for speed.", features:["5 Die-Cast Vehicles Included","1:64 Scale Models","Assorted Designs","Ages 3+ | Collectible Series"], stock:"Only 12 left", tags:["deal"] },
  { id:"p23", name:"OnePlus 13 5G (256 GB, Midnight Ocean)", category:"electronics", price:69999, mrp:79999, discount:13, rating:4.6, ratingCount:"8.2K", image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Snapdragon 8 Elite chip, 6000 mAh battery, Hasselblad triple camera.", features:["Snapdragon 8 Elite Processor","50 MP Hasselblad Triple Camera","6000 mAh Battery + 100W Charging","6.82-inch LTPO AMOLED 120Hz Display"], stock:"In Stock", tags:["new-launch","recommended"] },
  { id:"p24", name:"Samsung Galaxy S25 Ultra (512 GB, Titanium Black)", category:"electronics", price:129999, mrp:144999, discount:10, rating:4.8, ratingCount:"5.4K", image:"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Redefines mobile AI with built-in S Pen, Galaxy AI, and 200 MP camera.", features:["Snapdragon 8 Elite for Galaxy","200 MP Pro-Grade Camera System","Built-in S Pen with AI Features","5000 mAh Battery + 45W Wired Charging"], stock:"In Stock", tags:["new-launch","bestseller"] },
  { id:"p25", name:"Apple MacBook Air M3 (13-inch, 16 GB RAM, 512 GB SSD)", category:"electronics", price:134900, mrp:149900, discount:10, rating:4.9, ratingCount:"3.1K", image:"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&auto=format", badge:"new", description:"MacBook Air with M3 chip — up to 18 hours battery, stunning Liquid Retina display.", features:["Apple M3 Chip (8-core CPU, 10-core GPU)","16 GB Unified Memory","13.6-inch Liquid Retina Display","18-Hour Battery Life | 1.24 kg"], stock:"In Stock", tags:["new-launch","recommended"] },
  { id:"p26", name:"Sony PlayStation 5 Slim (Digital Edition)", category:"electronics", price:37990, mrp:44990, discount:16, rating:4.7, ratingCount:"12K", image:"https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=400&fit=crop&auto=format", badge:"new", description:"PS5 Slim — 30% smaller, 4K gaming at 120fps, DualSense with haptic feedback.", features:["4K Gaming at up to 120fps","DualSense Controller with Haptic Feedback","1 TB Ultra-High Speed SSD","30% Smaller than Original PS5"], stock:"Only 5 left", tags:["new-launch","deal"] },
  { id:"p27", name:"Realme GT 7 Pro 5G (256 GB, Mars Orange)", category:"electronics", price:41999, mrp:49999, discount:16, rating:4.4, ratingCount:"4.8K", image:"https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Snapdragon 8 Elite with 6500 mAh battery and periscope camera.", features:["Snapdragon 8 Elite Chipset","50 MP Periscope Telephoto Camera","6500 mAh Battery + 120W Charging","6.78-inch AMOLED 144Hz Display"], stock:"In Stock", tags:["new-launch","deal"] },
  { id:"p28", name:"Noise ColorFit Ultra 3 Smartwatch (46mm)", category:"electronics", price:3499, mrp:8999, discount:61, rating:4.2, ratingCount:"22K", image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format", badge:"hot", description:"1.96-inch AMOLED, 100+ sports modes, Bluetooth calling, 7-day battery.", features:["1.96-inch AMOLED Always-On Display","Bluetooth Calling + Built-in Mic & Speaker","100+ Sports Modes | 7-Day Battery","IP68 Water Resistance"], stock:"In Stock", tags:["new-launch","bestseller","deal"] },
  { id:"p29", name:"boAt Wave Alpha Smartwatch with AMOLED Display", category:"electronics", price:1999, mrp:5999, discount:67, rating:4.0, ratingCount:"34K", image:"https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop&auto=format", badge:"deal", description:"Vivid AMOLED display, stress monitor, SpO2 tracking, 5 days battery.", features:["1.43-inch AMOLED Display","Heart Rate + SpO2 Monitor","5-Day Battery Life","105+ Sport Modes | BT v5.0"], stock:"In Stock", tags:["new-launch","deal"] },
  { id:"p30", name:"Levi's Men's Slim Fit Graphic Tee – 2025 Edition", category:"fashion", price:799, mrp:1499, discount:47, rating:4.3, ratingCount:"18K", image:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Vintage-inspired print on premium 100% cotton, slim fit.", features:["100% Premium Cotton","Slim Fit | Machine Washable","Vintage Graphic Print","Available in S, M, L, XL, XXL"], stock:"In Stock", tags:["new-launch","deal"] },
  { id:"p31", name:"Adidas Ultraboost 5.0 DNA Running Shoes", category:"fashion", price:11999, mrp:18999, discount:37, rating:4.7, ratingCount:"6.2K", image:"https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop&auto=format", badge:"new", description:"BOOST midsole, Primeknit+ upper, Continental rubber outsole.", features:["BOOST Midsole for Energy Return","Primeknit+ Adaptive Upper","Continental Rubber Outsole","Available in 8 Colorways"], stock:"In Stock", tags:["new-launch","recommended"] },
  { id:"p32", name:"Dyson V15 Detect Absolute Cordless Vacuum", category:"home", price:59900, mrp:69900, discount:14, rating:4.8, ratingCount:"2.4K", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Laser technology reveals hidden dust. HEPA filtration, 60 min runtime.", features:["Laser Dust Detection Technology","Up to 60 Min Cordless Runtime","HEPA Filtration – captures 99.99% particles","LCD Screen with Real-time Performance Data"], stock:"In Stock", tags:["new-launch","recommended"] },
  { id:"p33", name:"Instant Pot Pro 10-in-1 Multi-Cooker (5.7 L)", category:"home", price:9999, mrp:15999, discount:38, rating:4.6, ratingCount:"9.8K", image:"https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Replaces 10 kitchen appliances — pressure cooker, slow cooker, rice cooker and more.", features:["10-in-1 Multifunctional Kitchen Appliance","5.7 L Stainless Steel Inner Pot","Smart Programs + Customisable Settings","UL Certified Safety with 11 Safety Mechanisms"], stock:"In Stock", tags:["new-launch","deal"] },
  { id:"p34", name:"The Alchemist (25th Anniversary Edition) – Paulo Coelho", category:"books", price:199, mrp:350, discount:43, rating:4.9, ratingCount:"1.2L", image:"https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Anniversary edition with bonus content and exclusive artwork.", features:["Anniversary Edition with Bonus Content","Paperback – 208 pages","Publisher: HarperOne","Over 65 Million Copies Sold Worldwide"], stock:"In Stock", tags:["new-launch","bestseller","recommended"] },
  { id:"p35", name:"Kosher Cosmetics BB Tinted Sunscreen SPF 50+", category:"beauty", price:599, mrp:999, discount:40, rating:4.4, ratingCount:"14K", image:"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format", badge:"new", description:"BB cream coverage with SPF 50+ protection, hydrates and blurs pores.", features:["SPF 50+ + PA++++ Broad Spectrum","BB Cream Tint for Natural Coverage","Lightweight, Non-Greasy Formula","Suitable for All Skin Types | 50 ml"], stock:"In Stock", tags:["new-launch","deal","recommended"] },
  { id:"p36", name:"Boldfit Adjustable Dumbbell Set (2–24 kg, 15 Levels)", category:"sports", price:7999, mrp:14999, discount:47, rating:4.5, ratingCount:"5.6K", image:"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Replaces 15 pairs of dumbbells with a single adjustable set.", features:["Adjustable 2–24 kg in 15 Levels","Quick-Turn Dial for Fast Adjustment","Replaces 15 Sets of Dumbbells","Anti-Roll Design | 1-Year Warranty"], stock:"In Stock", tags:["new-launch","recommended"] },
  { id:"p37", name:"Hot Wheels Ultimate Garage Playset 2025 Edition", category:"toys", price:4999, mrp:7999, discount:38, rating:4.8, ratingCount:"8.9K", image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=400&fit=crop&auto=format", badge:"new", description:"Stores 140+ Hot Wheels cars with working elevator, car wash and jumps.", features:["Stores 140+ Hot Wheels Cars","Working Elevator & Car Wash","Includes 1 Exclusive Die-Cast Car","Ages 4+ | Easy Assembly"], stock:"In Stock", tags:["new-launch","recommended"] },
];

/* ════════════════════════════════════════════════════════
   2. STATE – Cart (now backed by MegacartDB)
   ════════════════════════════════════════════════════════ */

const CART_KEY = "megacart_cart_v1";

function getCart()       { return MegacartDB.cart.toLegacyFormat(); }
function saveCart(cart)  { /* MegacartDB handles persistence */ }

function addToCart(productId, qty = 1) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  MegacartDB.cart.add({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.image }, qty);
  updateCartUI();
  showToast(`"${product.name.slice(0, 40)}…" added to cart`, "success");
}

function removeFromCart(productId) {
  MegacartDB.cart.remove(productId);
  updateCartUI();
  renderCartItems();
}

function setCartQty(productId, delta) {
  MegacartDB.cart.adjustQty(productId, delta);
  updateCartUI();
  renderCartItems();
}

function cartItemCount() { return MegacartDB.cart.totalItems(); }
function cartSubtotal()  { return MegacartDB.cart.subtotal(); }

/* ════════════════════════════════════════════════════════
   3. UTILS
   ════════════════════════════════════════════════════════ */

function formatINR(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

function buildStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

function debounce(fn, ms = 280) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; }

function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 3 + Math.floor(Math.random() * 3));
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function showToast(msg, type = "success") {
  const el = document.getElementById("mcToast");
  if (!el) return;
  el.textContent = msg;
  el.className = "mc-toast " + type;
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 2800);
}

/* ════════════════════════════════════════════════════════
   4. RENDER
   ════════════════════════════════════════════════════════ */

function renderCarousel() {
  const inner = document.getElementById("carouselInner");
  const indicators = document.getElementById("carouselIndicators");
  if (!inner || !indicators) return;

  inner.innerHTML = BANNERS.map((b, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <div class="hero-slide ${b.slide}">
        <div class="hero-content">
          <p class="hero-eyebrow">${b.eyebrow}</p>
          <h1>${b.title}</h1>
          <p class="hero-sub">${b.subtitle}</p>
          <a href="#" class="hero-cta" data-category="${b.category}">${b.cta}</a>
        </div>
      </div>
    </div>
  `).join("");

  indicators.innerHTML = BANNERS.map((_, i) => `
    <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${i}"
      class="${i === 0 ? "active" : ""}" aria-label="Slide ${i + 1}"></button>
  `).join("");

  inner.querySelectorAll(".hero-cta[data-category]").forEach(btn => {
    btn.addEventListener("click", e => { e.preventDefault(); filterByCategory(btn.dataset.category); });
  });
}

function renderCategoryGrid() {
  const grid = document.getElementById("categoryGrid");
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-box" data-category="${cat.key}" tabindex="0" role="button">
      <span class="cat-icon"><i class="bi ${cat.icon}"></i></span>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-count">${cat.count}</span>
    </div>
  `).join("");
  grid.querySelectorAll(".category-box").forEach(box => {
    box.addEventListener("click", () => filterByCategory(box.dataset.category));
    box.addEventListener("keydown", e => { if (e.key === "Enter") filterByCategory(box.dataset.category); });
  });
}

function buildCard(product, scrollable = false) {
  const inCart = MegacartDB.cart.myItems().some(i => i.productId === product.id);
  const badge = product.badge
    ? `<span class="card-badge badge-${product.badge}">${product.badge === "bs" ? "Best Seller" : product.badge === "deal" ? "Deal" : product.badge === "new" ? "New" : "Hot"}</span>`
    : "";
  const scrollClass = scrollable ? " scroll-card" : "";
  return `
    <article class="product-card${scrollClass}" data-id="${product.id}" tabindex="0" role="button" aria-label="View ${product.name}">
      ${badge}
      <div class="card-img-wrap">
        <img class="card-img" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://placehold.co/300x300/eaeded/565959?text=Megacart'" />
      </div>
      <div class="card-body">
        <p class="card-title" title="${product.name}">${product.name}</p>
        <div class="card-rating">
          <span class="stars" title="${product.rating} / 5">${buildStars(product.rating)}</span>
          <span class="rating-count">${product.ratingCount}</span>
        </div>
        <div class="card-price-row">
          <span class="card-price">${formatINR(product.price)}</span>
          <span class="card-mrp">${formatINR(product.mrp)}</span>
          <span class="card-discount">${product.discount}% off</span>
        </div>
        <button class="btn-add-cart ${inCart ? "in-cart" : ""}" data-cart-id="${product.id}" aria-label="${inCart ? "Already in cart" : "Add to cart"}">
          <i class="bi ${inCart ? "bi-cart-check" : "bi-cart-plus"} me-1"></i>
          ${inCart ? "In Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  `;
}

function attachCardEvents(container) {
  container.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", e => { if (e.target.closest(".btn-add-cart")) return; openProductModal(card.dataset.id); });
    card.addEventListener("keydown", e => { if (e.key === "Enter" && !e.target.closest(".btn-add-cart")) openProductModal(card.dataset.id); });
  });
  container.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      addToCart(btn.dataset.cartId);
      btn.classList.add("in-cart");
      btn.innerHTML = '<i class="bi bi-cart-check me-1"></i>In Cart';
      btn.setAttribute("aria-label", "Already in cart");
    });
  });
}

function renderScrollRow(containerId, filterFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const items = PRODUCTS.filter(filterFn);
  container.innerHTML = items.map(p => buildCard(p, true)).join("");
  attachCardEvents(container);
}

function renderGrid(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (items.length === 0) {
    container.innerHTML = `<div class="no-results"><i class="bi bi-search"></i><h3>No products found</h3><p>Try a different search term or category.</p></div>`;
    return;
  }
  container.innerHTML = items.map(p => buildCard(p, false)).join("");
  attachCardEvents(container);
}

function renderHome() {
  renderCategoryGrid();
  renderScrollRow("newArrivalsRow",  p => p.tags.includes("new-launch"));
  renderScrollRow("bestSellersRow",  p => p.tags.includes("bestseller"));
  renderScrollRow("dealsRow",        p => p.tags.includes("deal"));
  renderGrid("recommendedGrid", PRODUCTS.filter(p => p.tags.includes("recommended")));
}

/* ════════════════════════════════════════════════════════
   5. CART UI
   ════════════════════════════════════════════════════════ */

function updateCartUI() {
  const count = cartItemCount();
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartItemCount").textContent = count;
  document.getElementById("cartSubtotal").textContent = formatINR(cartSubtotal());
  const footer = document.getElementById("cartFooter");
  const empty  = document.getElementById("cartEmpty");
  if (count > 0) { footer.style.display = "block"; empty.style.display = "none"; }
  else           { footer.style.display = "none";  empty.style.display = "flex"; }
}

function renderCartItems() {
  const container = document.getElementById("cartItems");
  const empty     = document.getElementById("cartEmpty");
  const cart      = getCart();
  container.querySelectorAll(".cart-item").forEach(el => el.remove());
  if (cart.length === 0) { empty.style.display = "flex"; return; }
  empty.style.display = "none";
  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.dataset.cartId = item.id;
    div.innerHTML = `
      <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/72x72/eaeded/565959?text=Img'" />
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatINR(item.price)}</p>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" data-delta="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button>
          <span class="cart-qty-display">${item.qty}</span>
          <button class="cart-qty-btn" data-delta="1"  data-id="${item.id}" aria-label="Increase quantity">+</button>
          <button class="cart-remove-btn" data-remove="${item.id}" aria-label="Remove item">Delete</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
  container.querySelectorAll(".cart-qty-btn").forEach(btn => {
    btn.addEventListener("click", () => setCartQty(btn.dataset.id, parseInt(btn.dataset.delta)));
  });
  container.querySelectorAll(".cart-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
  });
  updateCartUI();
}

function openCart() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("cartOverlay").classList.add("active");
  document.body.style.overflow = "hidden";
  renderCartItems();
}
function closeCart() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("active");
  document.body.style.overflow = "";
}

/* ════════════════════════════════════════════════════════
   6. PRODUCT MODAL
   ════════════════════════════════════════════════════════ */

let modalCurrentProduct = null;
let modalQty = 1;

function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  modalCurrentProduct = product;
  modalQty = 1;
  document.getElementById("modalProductTitle").textContent = product.name;
  document.getElementById("modalCategory").textContent = CATEGORIES.find(c => c.key === product.category)?.name || product.category;
  document.getElementById("modalPrice").textContent = formatINR(product.price);
  document.getElementById("modalOriginalPrice").textContent = formatINR(product.mrp);
  document.getElementById("modalDiscount").textContent = `${product.discount}% off`;
  document.getElementById("modalDescription").textContent = product.description;
  document.getElementById("modalQtyVal").textContent = modalQty;
  document.getElementById("modalDeliveryDate").textContent = getDeliveryDate();
  const badgeEl = document.getElementById("modalBadge");
  if (product.badge) { badgeEl.textContent = product.badge.toUpperCase(); badgeEl.className = `modal-badge card-badge badge-${product.badge}`; }
  else { badgeEl.textContent = ""; badgeEl.className = "modal-badge"; }
  document.getElementById("modalRating").innerHTML =
    `<span class="stars" style="color:#f0a500">${buildStars(product.rating)}</span><span style="font-size:12px;color:var(--mc-blue);margin-left:4px;">${product.rating} (${product.ratingCount} ratings)</span>`;
  const stockEl = document.getElementById("modalStock");
  stockEl.textContent = product.stock || "In Stock";
  stockEl.className = "modal-stock" + (product.stock?.toLowerCase().includes("out") ? " out" : "");
  document.getElementById("modalFeatures").innerHTML = (product.features || []).map(f => `<li>${f}</li>`).join("");
  const mainImg = document.getElementById("modalMainImage");
  mainImg.src = product.image; mainImg.alt = product.name;
  const thumbsEl = document.getElementById("modalThumbnails");
  const seeds = [product.image, product.image.replace("/400/400", "/401/401"), product.image.replace("/400/400", "/402/402")];
  thumbsEl.innerHTML = seeds.map((src, i) => `<img class="modal-thumb ${i === 0 ? "active" : ""}" src="${src}" alt="View ${i + 1}" data-src="${src}" />`).join("");
  thumbsEl.querySelectorAll(".modal-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => { mainImg.src = thumb.dataset.src; thumbsEl.querySelectorAll(".modal-thumb").forEach(t => t.classList.remove("active")); thumb.classList.add("active"); });
  });
  document.getElementById("productModalOverlay").classList.add("active");
  document.getElementById("productModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  document.getElementById("productModalOverlay").classList.remove("active");
  document.getElementById("productModal").classList.remove("active");
  document.body.style.overflow = "";
  modalCurrentProduct = null;
}

/* ════════════════════════════════════════════════════════
   7. SEARCH & FILTER
   ════════════════════════════════════════════════════════ */

function performSearch(query, categoryKey) {
  const q = (query || "").trim().toLowerCase();
  const catKey = (categoryKey || "all").toLowerCase();
  let results = PRODUCTS;
  if (catKey !== "all" && catKey !== "") {
    if (catKey === "deals") results = results.filter(p => p.tags.includes("deal"));
    else results = results.filter(p => p.category === catKey);
  }
  if (q) results = results.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
  return results;
}

function showSearchResults(results, label) {
  document.getElementById("homeContent").style.display = "none";
  document.getElementById("searchResultsSection").style.display = "block";
  document.getElementById("searchResultsTitle").textContent = label;
  renderGrid("searchResultsGrid", results);
}

function clearSearch() {
  document.getElementById("searchInput").value = "";
  document.getElementById("searchCategory").value = "all";
  document.getElementById("homeContent").style.display = "block";
  document.getElementById("searchResultsSection").style.display = "none";
  document.querySelectorAll(".sec-nav-link").forEach(l => l.classList.remove("active"));
}

function filterByCategory(catKey) {
  let results, label;
  if (catKey === "new-launch") { results = PRODUCTS.filter(p => p.tags.includes("new-launch")); label = "🚀 New Arrivals 2025"; }
  else if (catKey === "deals") { results = PRODUCTS.filter(p => p.tags.includes("deal")); label = "Today's Deals"; }
  else if (catKey === "all")   { clearSearch(); document.getElementById("pageMain").scrollIntoView({ behavior: "smooth" }); return; }
  else { results = PRODUCTS.filter(p => p.category === catKey); label = CATEGORIES.find(c => c.key === catKey)?.name || catKey; }
  showSearchResults(results, label);
  document.querySelectorAll(".sec-nav-link").forEach(l => { l.classList.toggle("active", l.dataset.category === catKey); });
  document.getElementById("searchInput").value = "";
  document.getElementById("searchCategory").value = catKey !== "new-launch" ? catKey : "all";
  document.getElementById("pageMain").scrollIntoView({ behavior: "smooth" });
}

/* ════════════════════════════════════════════════════════
   8. INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  // Seed products into DB
  if (window.MegacartDB) MegacartDB.products.seed(PRODUCTS);

  renderCarousel();
  renderHome();
  updateCartUI();

  document.getElementById("cartToggleBtn").addEventListener("click", openCart);
  document.getElementById("cartToggleBtn").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") openCart(); });
  document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
  document.getElementById("cartOverlay").addEventListener("click", closeCart);
  document.getElementById("modalCloseBtn").addEventListener("click", closeProductModal);
  document.getElementById("productModalOverlay").addEventListener("click", closeProductModal);

  document.getElementById("modalQtyDec").addEventListener("click", () => { if (modalQty > 1) { modalQty--; document.getElementById("modalQtyVal").textContent = modalQty; } });
  document.getElementById("modalQtyInc").addEventListener("click", () => { modalQty++; document.getElementById("modalQtyVal").textContent = modalQty; });
  document.getElementById("modalAddToCart").addEventListener("click", () => { if (modalCurrentProduct) { addToCart(modalCurrentProduct.id, modalQty); closeProductModal(); openCart(); } });

  // Checkout → place order via DB
  document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    const result = MegacartDB.orders.place();
    if (result.ok) { showToast(`Order placed! Order ID: ${result.order.id.slice(-8).toUpperCase()}`, "success"); updateCartUI(); renderCartItems(); closeCart(); }
    else showToast(result.message, "error");
  });

  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); closeProductModal(); } });

  const doSearch = () => {
    const q   = document.getElementById("searchInput").value.trim();
    const cat = document.getElementById("searchCategory").value;
    if (!q && cat === "all") { clearSearch(); return; }
    const results = performSearch(q, cat);
    const label = q
      ? `Results for "${q}"${cat !== "all" ? ` in ${CATEGORIES.find(c => c.key === cat)?.name || cat}` : ""}`
      : (cat === "deals" ? "Today's Deals" : CATEGORIES.find(c => c.key === cat)?.name || "All Products");
    showSearchResults(results, label);
  };
  document.getElementById("searchBtn").addEventListener("click", doSearch);
  document.getElementById("searchInput").addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
  document.getElementById("searchInput").addEventListener("input", debounce(doSearch, 320));
  document.getElementById("searchCategory").addEventListener("change", doSearch);
  document.getElementById("clearSearchBtn").addEventListener("click", clearSearch);

  document.querySelectorAll(".sec-nav-link[data-category]").forEach(link => { link.addEventListener("click", e => { e.preventDefault(); filterByCategory(link.dataset.category); }); });

  document.querySelectorAll(".mobile-menu-link[data-category]").forEach(link => { link.addEventListener("click", e => { e.preventDefault(); filterByCategory(link.dataset.category); closeMobileMenu(); }); });

  const mobileMenu    = document.getElementById("mobileMenu");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  function closeMobileMenu() { mobileMenu.classList.remove("open"); mobileMenuBtn.querySelector("i").className = "bi bi-list"; }
  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    mobileMenuBtn.querySelector("i").className = mobileMenu.classList.contains("open") ? "bi bi-x-lg" : "bi bi-list";
  });

  document.querySelectorAll(".scroll-arrow").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const scroll = target.clientWidth * 0.75;
      target.scrollBy({ left: btn.classList.contains("scroll-right") ? scroll : -scroll, behavior: "smooth" });
    });
  });

  document.getElementById("backToTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.getElementById("backToTop").addEventListener("keydown", e => { if (e.key === "Enter") window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.getElementById("logoLink").addEventListener("click", e => { e.preventDefault(); clearSearch(); window.scrollTo({ top: 0, behavior: "smooth" }); });

  document.querySelectorAll(".see-all-link[data-filter]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const filter = link.dataset.filter;
      const results = PRODUCTS.filter(p => p.tags.includes(filter));
      const labels  = { bestseller:"Best Sellers", deal:"Deals of the Day", recommended:"Recommended for You", "new-launch":"🚀 New Arrivals 2025" };
      showSearchResults(results, labels[filter] || "Products");
      document.getElementById("pageMain").scrollIntoView({ behavior: "smooth" });
    });
  });

});

/* ════════════════════════════════════════════════════════
   9. AUTH
   ════════════════════════════════════════════════════════ */

const AUTH_KEY  = "megacart_user_v1";
const USERS_KEY = "megacart_users_v1";

function getUser()  { return window.MegacartDB ? MegacartDB.session.get() : (JSON.parse(localStorage.getItem(AUTH_KEY)) || null); }
function saveUser(u){ if (window.MegacartDB) MegacartDB.session.set(u); else localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function clearUser(){ if (window.MegacartDB) MegacartDB.session.clear(); else localStorage.removeItem(AUTH_KEY); }

function updateAuthUI() {
  const container = document.getElementById("accountNavBtn");
  if (!container) return;
  const user = getUser();

  const mobileAuthLink = document.getElementById("mobileAuthLink");
  if (mobileAuthLink) {
    if (user) { mobileAuthLink.innerHTML = `<i class="bi bi-person-circle me-2"></i>Hello, ${user.name.split(" ")[0]}`; mobileAuthLink.style.color = "var(--mc-orange)"; mobileAuthLink.href = "#"; mobileAuthLink.onclick = e => e.preventDefault(); }
    else { mobileAuthLink.innerHTML = `<i class="bi bi-person-circle me-2"></i>Sign In / Create Account`; mobileAuthLink.href = "login.html"; mobileAuthLink.onclick = null; }
  }

  const mobileLogoutLink = document.getElementById("mobileLogoutLink");
  if (mobileLogoutLink) mobileLogoutLink.style.display = user ? "block" : "none";

  const navLogoutBtn = document.getElementById("navLogoutBtn");
  if (navLogoutBtn) navLogoutBtn.style.display = user ? "flex" : "none";

  if (user) {
    const initial = (user.name || "U").charAt(0).toUpperCase();
    container.innerHTML = `
      <div class="account-menu-trigger" id="accountMenuTrigger" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
        <span class="nav-label">Hello, ${user.name.split(" ")[0]}</span>
        <span class="nav-bold">Account &amp; Lists <i class="bi bi-chevron-down small"></i></span>
      </div>
      <div class="account-dropdown" id="accountDropdown" role="menu">
        <div class="account-dropdown-header">
          <div class="acc-avatar">${initial}</div>
          <div><strong>${user.name}</strong><p>${user.email}</p></div>
        </div>
        <hr class="account-dropdown-divider" />
        <a href="#" class="account-dropdown-item" role="menuitem"><i class="bi bi-person"></i>Your Account</a>
        <a href="#" class="account-dropdown-item" role="menuitem"><i class="bi bi-bag"></i>Your Orders</a>
        <a href="#" class="account-dropdown-item" role="menuitem"><i class="bi bi-heart"></i>Wish List</a>
        <hr class="account-dropdown-divider" />
        <button class="account-dropdown-item logout-btn" id="logoutBtn" role="menuitem"><i class="bi bi-box-arrow-right"></i>Sign Out</button>
      </div>
    `;
    const trigger  = document.getElementById("accountMenuTrigger");
    const dropdown = document.getElementById("accountDropdown");
    trigger.addEventListener("click", e => { e.stopPropagation(); const open = dropdown.classList.toggle("show"); trigger.setAttribute("aria-expanded", String(open)); });
    trigger.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); trigger.click(); } });
    document.getElementById("logoutBtn").addEventListener("click", e => { e.stopPropagation(); handleLogout(); });
  } else {
    container.innerHTML = `<a href="login.html" class="nav-link-item" id="openLoginBtn"><span class="nav-label">Hello, Sign in</span><span class="nav-bold">Account &amp; Lists <i class="bi bi-chevron-down small"></i></span></a>`;
  }
}

function openLoginModal()    { document.getElementById("loginView").style.display = "block"; document.getElementById("registerView").style.display = "none"; document.getElementById("authOverlay").classList.add("active"); document.getElementById("authModal").classList.add("active"); document.body.style.overflow = "hidden"; clearAuthErrors(); setTimeout(() => document.getElementById("loginEmail")?.focus(), 50); }
function openRegisterModal() { document.getElementById("loginView").style.display = "none"; document.getElementById("registerView").style.display = "block"; document.getElementById("authOverlay").classList.add("active"); document.getElementById("authModal").classList.add("active"); document.body.style.overflow = "hidden"; clearAuthErrors(); setTimeout(() => document.getElementById("regName")?.focus(), 50); }
function closeAuthModal()    { document.getElementById("authOverlay").classList.remove("active"); document.getElementById("authModal").classList.remove("active"); document.body.style.overflow = ""; }

function clearAuthErrors() { document.querySelectorAll(".field-error").forEach(el => el.textContent = ""); document.querySelectorAll(".auth-input").forEach(el => el.classList.remove("error")); document.querySelectorAll(".password-wrap").forEach(el => el.classList.remove("error")); }

function setFieldError(inputId, wrapId, errorId, msg) {
  const input = document.getElementById(inputId);
  const wrap  = wrapId ? document.getElementById(wrapId) : null;
  const err   = document.getElementById(errorId);
  if (wrap) wrap.classList.add("error"); else if (input) input.classList.add("error");
  if (err) err.textContent = msg;
}

function isValidContact(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^[6-9]\d{9}$/.test(v.replace(/[\s\-+]/g, "")); }

function handleLogin(e) {
  e.preventDefault();
  clearAuthErrors();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  let valid = true;
  if (!email) { setFieldError("loginEmail", null, "loginEmailError", "Enter your email or mobile number."); valid = false; }
  else if (!isValidContact(email)) { setFieldError("loginEmail", null, "loginEmailError", "Enter a valid email or 10-digit mobile number."); valid = false; }
  if (!password) { setFieldError("loginPassword", "loginPwdWrap", "loginPasswordError", "Enter your password."); valid = false; }
  else if (password.length < 6) { setFieldError("loginPassword", "loginPwdWrap", "loginPasswordError", "Minimum 6 characters required."); valid = false; }
  if (!valid) return;

  const result = MegacartDB.users.login(email, password);
  if (!result.ok) { setFieldError("loginPassword", "loginPwdWrap", "loginPasswordError", result.message); return; }
  MegacartDB.session.set(result.user);
  closeAuthModal();
  updateAuthUI();
  showToast(`Welcome back, ${result.user.name.split(" ")[0]}!`, "success");
}

function handleRegister(e) {
  e.preventDefault();
  clearAuthErrors();
  const name     = document.getElementById("regName").value.trim();
  const email    = document.getElementById("regEmail").value.trim().toLowerCase();
  const phone    = (document.getElementById("regPhone")?.value || "").trim().replace(/[\s\-+]/g, "");
  const password = document.getElementById("regPassword").value;
  const confirm  = document.getElementById("regConfirm").value;
  let valid = true;
  if (!name || name.length < 2) { setFieldError("regName", null, "regNameError", "Enter your name (at least 2 characters)."); valid = false; }
  if (!email) { setFieldError("regEmail", null, "regEmailError", "Enter your email address."); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError("regEmail", null, "regEmailError", "Enter a valid email address."); valid = false; }
  if (!password || password.length < 6) { setFieldError("regPassword", "regPwdWrap", "regPasswordError", "Password must be at least 6 characters."); valid = false; }
  if (!confirm) { setFieldError("regConfirm", null, "regConfirmError", "Please re-enter your password."); valid = false; }
  else if (password !== confirm) { setFieldError("regConfirm", null, "regConfirmError", "Passwords do not match."); valid = false; }
  if (!valid) return;

  const result = MegacartDB.users.register({ name, email, phone, password });
  if (!result.ok) { setFieldError("regEmail", null, "regEmailError", result.message); return; }
  MegacartDB.session.set(result.user);
  closeAuthModal();
  updateAuthUI();
  showToast(`Welcome to Megacart, ${name.split(" ")[0]}! Account created.`, "success");
}

function handleLogout() {
  MegacartDB.session.clear();
  showToast("You've been signed out. See you soon!", "success");
  setTimeout(() => { window.location.href = 'login.html'; }, 900);
}

/* ════════════════════════════════════════════════════════
   10. AUTH INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  document.getElementById("openLoginBtn")?.addEventListener("click", e => { e.preventDefault(); openLoginModal(); });
  document.getElementById("authCloseBtn").addEventListener("click", closeAuthModal);
  document.getElementById("authOverlay").addEventListener("click", closeAuthModal);
  document.getElementById("goToRegister").addEventListener("click", openRegisterModal);
  document.getElementById("goToLogin").addEventListener("click", openLoginModal);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("registerForm").addEventListener("submit", handleRegister);
  document.querySelectorAll(".toggle-pwd-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      if (input.type === "password") { input.type = "text"; btn.textContent = "Hide"; }
      else { input.type = "password"; btn.textContent = "Show"; }
    });
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAuthModal(); });
  document.addEventListener("click", e => {
    if (!e.target.closest("#accountNavBtn")) {
      document.getElementById("accountDropdown")?.classList.remove("show");
      document.getElementById("accountMenuTrigger")?.setAttribute("aria-expanded", "false");
    }
  });
});
