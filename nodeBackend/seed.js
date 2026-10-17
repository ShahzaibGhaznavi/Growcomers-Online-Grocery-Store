const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/categoryModel");
const Brand = require("./models/brandModel");
const Product = require("./models/productModel");

const categoriesData = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Beverages",
  "Snacks",
  "Breakfast & Cereals",
  "Bakery",
  "Cooking Essentials",
  "Personal Care",
];

const brandsData = [
  "Nestle",
  "Pepsi",
  "Coca Cola",
  "Surf Excel",
  "National",
  "Shan",
  "Unilever",
  "Dawn",
  "Tapal",
  "Engro",
];

const productsData = [
  {
    title: "Nestle Milk Pack 1L",
    brand: "Nestle",
    categories: ["Dairy & Eggs"],
    feature: "Fresh full cream milk",
    price: 290,
    MRP: 310,
    quantity: 50,
  },
  {
    title: "Nestle Yogurt 500g",
    brand: "Nestle",
    categories: ["Dairy & Eggs"],
    feature: "Fresh creamy yogurt",
    price: 220,
    MRP: 240,
    quantity: 40,
  },
  {
    title: "Coca Cola 1.5L",
    brand: "Coca Cola",
    categories: ["Beverages"],
    feature: "Refreshing carbonated drink",
    price: 180,
    MRP: 200,
    quantity: 100,
  },
  {
    title: "Pepsi 1.5L",
    brand: "Pepsi",
    categories: ["Beverages"],
    feature: "Refreshing cola drink",
    price: 170,
    MRP: 190,
    quantity: 100,
  },
  {
    title: "Tapal Danedar Tea 190g",
    brand: "Tapal",
    categories: ["Beverages", "Breakfast & Cereals"],
    feature: "Strong aromatic black tea",
    price: 420,
    MRP: 450,
    quantity: 60,
  },
  {
    title: "National Tea 95g",
    brand: "National",
    categories: ["Beverages", "Breakfast & Cereals"],
    feature: "Rich tea blend",
    price: 210,
    MRP: 230,
    quantity: 60,
  },
  {
    title: "Shan Biryani Masala",
    brand: "Shan",
    categories: ["Cooking Essentials"],
    feature: "Authentic biryani spice mix",
    price: 120,
    MRP: 140,
    quantity: 100,
  },
  {
    title: "National Ketchup 800g",
    brand: "National",
    categories: ["Cooking Essentials"],
    feature: "Rich tomato ketchup",
    price: 350,
    MRP: 390,
    quantity: 50,
  },
  {
    title: "Surf Excel Washing Powder 1kg",
    brand: "Surf Excel",
    categories: ["Personal Care"],
    feature: "Powerful stain removal",
    price: 450,
    MRP: 500,
    quantity: 50,
  },
  {
    title: "Dawn Bread Large",
    brand: "Dawn",
    categories: ["Bakery"],
    feature: "Soft fresh sliced bread",
    price: 180,
    MRP: 200,
    quantity: 40,
  },
  {
    title: "Dawn Bran Bread",
    brand: "Dawn",
    categories: ["Bakery", "Breakfast & Cereals"],
    feature: "Healthy high-fiber bread",
    price: 200,
    MRP: 220,
    quantity: 40,
  },
  {
    title: "Nestle Corn Flakes 500g",
    brand: "Nestle",
    categories: ["Breakfast & Cereals"],
    feature: "Crunchy breakfast cereal",
    price: 650,
    MRP: 700,
    quantity: 35,
  },
  {
    title: "Nestle KitKat 4 Finger",
    brand: "Nestle",
    categories: ["Snacks"],
    feature: "Crispy chocolate wafer",
    price: 180,
    MRP: 200,
    quantity: 80,
  },
  {
    title: "Lays Classic 50g",
    brand: "Pepsi",
    categories: ["Snacks"],
    feature: "Classic salted potato chips",
    price: 100,
    MRP: 120,
    quantity: 100,
  },
  {
    title: "National Biscuits 200g",
    brand: "National",
    categories: ["Snacks"],
    feature: "Crispy tea-time biscuits",
    price: 160,
    MRP: 180,
    quantity: 70,
  },
  {
    title: "Shan Chicken Handi Masala",
    brand: "Shan",
    categories: ["Cooking Essentials"],
    feature: "Traditional chicken handi spices",
    price: 130,
    MRP: 150,
    quantity: 80,
  },
  {
    title: "Shan Karahi Masala",
    brand: "Shan",
    categories: ["Cooking Essentials"],
    feature: "Traditional karahi spice mix",
    price: 130,
    MRP: 150,
    quantity: 80,
  },
  {
    title: "Unilever Lux Soap",
    brand: "Unilever",
    categories: ["Personal Care"],
    feature: "Fragrant moisturizing soap",
    price: 140,
    MRP: 160,
    quantity: 100,
  },
  {
    title: "Sunsilk Shampoo 360ml",
    brand: "Unilever",
    categories: ["Personal Care"],
    feature: "Daily hair care shampoo",
    price: 520,
    MRP: 580,
    quantity: 40,
  },
  {
    title: "Olpers Milk 1L",
    brand: "Engro",
    categories: ["Dairy & Eggs"],
    feature: "Pure UHT milk",
    price: 300,
    MRP: 320,
    quantity: 60,
  },
  {
    title: "Olpers Cream 200ml",
    brand: "Engro",
    categories: ["Dairy & Eggs"],
    feature: "Rich dairy cream",
    price: 230,
    MRP: 250,
    quantity: 40,
  },
  {
    title: "Fresh Apples 1kg",
    brand: "Engro",
    categories: ["Fruits & Vegetables"],
    feature: "Fresh red apples",
    price: 450,
    MRP: 500,
    quantity: 50,
  },
  {
    title: "Fresh Bananas 1 Dozen",
    brand: "Engro",
    categories: ["Fruits & Vegetables"],
    feature: "Fresh ripe bananas",
    price: 220,
    MRP: 250,
    quantity: 60,
  },
  {
    title: "Fresh Potatoes 1kg",
    brand: "Engro",
    categories: ["Fruits & Vegetables"],
    feature: "Fresh farm potatoes",
    price: 150,
    MRP: 180,
    quantity: 100,
  },
];

const makeImage = (name) =>
  `https://placehold.co/600x600/png?text=${encodeURIComponent(name)}`;

async function seed() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    console.log("MongoDB connected");

    // Clear current catalog
    await Product.deleteMany({});
    await Brand.deleteMany({});
    await Category.deleteMany({});

    console.log("Old catalog cleared");

    // Create categories
    const categories = await Category.insertMany(
      categoriesData.map((title) => ({
        title,
        featuredImage: makeImage(title),
      }))
    );

    console.log(`Categories inserted: ${categories.length}`);

    // Create category lookup
    const categoryMap = {};

    categories.forEach((category) => {
      categoryMap[category.title] = category._id;
    });

    // Create brands
    const brands = await Brand.insertMany(
      brandsData.map((title) => ({
        title,
        featuredImage: makeImage(title),
      }))
    );

    console.log(`Brands inserted: ${brands.length}`);

    // Create brand lookup
    const brandMap = {};

    brands.forEach((brand) => {
      brandMap[brand.title] = brand._id;
    });

    // Create products
    const products = productsData.map((product) => ({
      title: product.title,

      brandId: brandMap[product.brand],

      categoryId: product.categories.map(
        (category) => categoryMap[category]
      ),

      feature: product.feature,

      imageURL: [
        makeImage(product.title),
      ],

      imageURLHighRes: [
        makeImage(product.title),
      ],

      description:
        `${product.title}. ${product.feature}. ` +
        "This product is added for Growcomers application testing.",

      price: product.price,

      MRP: product.MRP,

      quantity: product.quantity,

      active: true,
    }));

    await Product.insertMany(products);

    console.log(`Products inserted: ${products.length}`);

    // Final verification
    console.log("\n========== DATABASE SUMMARY ==========");

    console.log(
      "Categories:",
      await Category.countDocuments()
    );

    console.log(
      "Brands:",
      await Brand.countDocuments()
    );

    console.log(
      "Products:",
      await Product.countDocuments()
    );

    console.log(
      "Active Products:",
      await Product.countDocuments({ active: true })
    );

    console.log("======================================");

    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("SEED ERROR:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
}

seed();