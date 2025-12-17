import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hashPassword = async (password: string): Promise<string> => {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(password, SALT_ROUNDS);
};

async function main() {
  console.log("Seeding database...");

  const adminPassword = await hashPassword("Admin123@");
  const _admin = await prisma.user.upsert({
    where: { email: "admin@novektech.com" },
    update: {},
    create: {
      email: "admin@novektech.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created");

  const ownerPassword = await hashPassword("Password123@");
  const owner = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      password: ownerPassword,
      role: "OWNER",
    },
  });
  console.log("Owner user created");

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "pizza-palace" },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Pizza Palace",
      slug: "pizza-palace",
      location: "123 Main Street, Addis Ababa",
      contactEmail: "info@pizzapalace.com",
      contactPhone: "+251 911 123 456",
      primaryColor: "#dc2626",
      backgroundColor: "#ffffff",
    },
  });
  console.log("Demo restaurant created");

  const appetizers = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Appetizers",
      sortOrder: 1,
    },
  });

  const pizzas = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Pizzas",
      sortOrder: 2,
    },
  });

  const pasta = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Pasta",
      sortOrder: 3,
    },
  });

  const drinks = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Drinks",
      sortOrder: 4,
    },
  });
  console.log("Categories created");

  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: appetizers.id,
        name: "Garlic Bread",
        description: "Toasted bread with garlic butter and herbs",
        price: 150,
        isAvailable: true,
        sortOrder: 1,
      },
      {
        categoryId: appetizers.id,
        name: "Mozzarella Sticks",
        description: "Breaded mozzarella cheese sticks served with marinara sauce",
        price: 200,
        isAvailable: true,
        sortOrder: 2,
      },
      {
        categoryId: pizzas.id,
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
        price: 350,
        isAvailable: true,
        sortOrder: 1,
      },
      {
        categoryId: pizzas.id,
        name: "Pepperoni Pizza",
        description: "Loaded with pepperoni and mozzarella cheese",
        price: 400,
        isAvailable: true,
        sortOrder: 2,
      },
      {
        categoryId: pizzas.id,
        name: "Quattro Formaggi",
        description: "Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta",
        price: 450,
        isAvailable: true,
        sortOrder: 3,
      },
      {
        categoryId: pasta.id,
        name: "Spaghetti Carbonara",
        description: "Creamy pasta with bacon, eggs, and parmesan cheese",
        price: 320,
        isAvailable: true,
        sortOrder: 1,
      },
      {
        categoryId: pasta.id,
        name: "Fettuccine Alfredo",
        description: "Rich and creamy alfredo sauce with fettuccine pasta",
        price: 300,
        isAvailable: true,
        sortOrder: 2,
      },
      {
        categoryId: drinks.id,
        name: "Coca Cola",
        description: "Classic refreshing soda",
        price: 50,
        isAvailable: true,
        sortOrder: 1,
      },
      {
        categoryId: drinks.id,
        name: "Fresh Lemonade",
        description: "Homemade lemonade with fresh lemons",
        price: 80,
        isAvailable: true,
        sortOrder: 2,
      },
      {
        categoryId: drinks.id,
        name: "Mineral Water",
        description: "Sparkling or still mineral water",
        price: 40,
        isAvailable: true,
        sortOrder: 3,
      },
    ],
  });
  console.log("Menu items created");

  console.log("\nDatabase seeded successfully!");
  console.log("\nTest Credentials:");
  console.log("Admin: admin@novektech.com / Admin123@");
  console.log("Owner: test@example.com / Password123@");
  console.log("\nDemo Restaurant: pizza-palace");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
