import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/shared/utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const _admin = await prisma.user.upsert({
    where: { email: "admin@novekmenu.com" },
    update: {},
    create: {
      email: "admin@novekmenu.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user created");

  // Create owner user
  const ownerPassword = await hashPassword("owner123");
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      password: ownerPassword,
      role: "OWNER",
    },
  });
  console.log("✓ Owner user created");

  // Create demo restaurant with full customization
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "pizza-palace" },
    update: {},
    create: {
      ownerId: owner.id,
      name: "Pizza Palace",
      slug: "pizza-palace",
      location: "123 Main Street, New York, NY 10001",
      contactEmail: "info@pizzapalace.com",
      contactPhone: "+1 (555) 123-4567",
      primaryColor: "#dc2626",
      backgroundColor: "#ffffff",
      logoUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
      headerImageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop",
    },
  });
  console.log("✓ Demo restaurant created");

  // Create categories
  const appetizersCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Appetizers",
      sortOrder: 1,
    },
  });

  const pizzasCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Pizzas",
      sortOrder: 2,
    },
  });

  const pastaCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Pasta",
      sortOrder: 3,
    },
  });

  const dessertsCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Desserts",
      sortOrder: 4,
    },
  });

  const drinksCategory = await prisma.category.create({
    data: {
      restaurantId: restaurant.id,
      name: "Drinks",
      sortOrder: 5,
    },
  });
  console.log("✓ Categories created");

  // Create menus
  const lunchMenu = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: "Lunch Menu",
      isActive: true,
    },
  });

  const dinnerMenu = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: "Dinner Menu",
      isActive: true,
    },
  });

  const drinksMenu = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: "Beverages",
      isActive: true,
    },
  });
  console.log("✓ Menus created");

  // Create menu items - Appetizers
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: lunchMenu.id,
        categoryId: appetizersCategory.id,
        name: "Garlic Bread",
        description: "Toasted bread with garlic butter and herbs",
        price: 5.99,
        imageUrl: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: lunchMenu.id,
        categoryId: appetizersCategory.id,
        name: "Mozzarella Sticks",
        description: "Breaded mozzarella cheese sticks served with marinara sauce",
        price: 7.99,
        imageUrl: "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: dinnerMenu.id,
        categoryId: appetizersCategory.id,
        name: "Bruschetta",
        description: "Toasted bread topped with fresh tomatoes, basil, and olive oil",
        price: 8.99,
        imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop",
        isAvailable: true,
      },
    ],
  });

  // Create menu items - Pizzas
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: lunchMenu.id,
        categoryId: pizzasCategory.id,
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: lunchMenu.id,
        categoryId: pizzasCategory.id,
        name: "Pepperoni Pizza",
        description: "Loaded with pepperoni and mozzarella cheese",
        price: 14.99,
        imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: dinnerMenu.id,
        categoryId: pizzasCategory.id,
        name: "Quattro Formaggi",
        description: "Four cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta",
        price: 16.99,
        imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: dinnerMenu.id,
        categoryId: pizzasCategory.id,
        name: "Hawaiian Pizza",
        description: "Ham and pineapple with mozzarella cheese",
        price: 15.99,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
        isAvailable: true,
      },
    ],
  });

  // Create menu items - Pasta
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: dinnerMenu.id,
        categoryId: pastaCategory.id,
        name: "Spaghetti Carbonara",
        description: "Creamy pasta with bacon, eggs, and parmesan cheese",
        price: 13.99,
        imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: dinnerMenu.id,
        categoryId: pastaCategory.id,
        name: "Fettuccine Alfredo",
        description: "Rich and creamy alfredo sauce with fettuccine pasta",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: dinnerMenu.id,
        categoryId: pastaCategory.id,
        name: "Lasagna",
        description: "Layers of pasta, meat sauce, and cheese baked to perfection",
        price: 15.99,
        imageUrl: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop",
        isAvailable: true,
      },
    ],
  });

  // Create menu items - Desserts
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: dinnerMenu.id,
        categoryId: dessertsCategory.id,
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
        price: 6.99,
        imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: dinnerMenu.id,
        categoryId: dessertsCategory.id,
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
        price: 7.99,
        imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: dinnerMenu.id,
        categoryId: dessertsCategory.id,
        name: "Panna Cotta",
        description: "Creamy Italian custard with berry compote",
        price: 6.99,
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
        isAvailable: true,
      },
    ],
  });

  // Create menu items - Drinks
  await prisma.menuItem.createMany({
    data: [
      {
        menuId: drinksMenu.id,
        categoryId: drinksCategory.id,
        name: "Coca Cola",
        description: "Classic refreshing soda",
        price: 2.99,
        isAvailable: true,
      },
      {
        menuId: drinksMenu.id,
        categoryId: drinksCategory.id,
        name: "Fresh Lemonade",
        description: "Homemade lemonade with fresh lemons",
        price: 3.99,
        imageUrl: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f8f?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: drinksMenu.id,
        categoryId: drinksCategory.id,
        name: "Italian Espresso",
        description: "Strong and aromatic espresso coffee",
        price: 3.49,
        imageUrl: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop",
        isAvailable: true,
      },
      {
        menuId: drinksMenu.id,
        categoryId: drinksCategory.id,
        name: "Mineral Water",
        description: "Sparkling or still mineral water",
        price: 2.49,
        isAvailable: true,
      },
    ],
  });
  console.log("✓ Menu items created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("Admin: admin@novekmenu.com / admin123");
  console.log("Owner: owner@example.com / owner123");
  console.log("\n🍕 Demo Restaurant:");
  console.log("Name: Pizza Palace");
  console.log("Slug: pizza-palace");
  console.log("URL: http://localhost:5173/menu/pizza-palace");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
