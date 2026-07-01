// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with Pet Shop data...");

  // ── Admin ──────────────────────────────
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@letshop.com" },
    update: {},
    create: {
      name: "Admin Let Shop",
      email: "admin@letshop.com",
      password: adminPassword,
      phone: "081200000000",
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ── Demo Customers ──────────────────────
  const customerPassword = await hash("customer123", 10);
  const customer1 = await prisma.user.upsert({
    where: { email: "adit.baskoro@email.com" },
    update: {},
    create: {
      name: "Adit Baskoro",
      email: "adit.baskoro@email.com",
      password: customerPassword,
      phone: "081299999991",
      role: Role.CUSTOMER,
    },
  });
  const customer2 = await prisma.user.upsert({
    where: { email: "siti.mae@web.id" },
    update: {},
    create: {
      name: "Siti Maesaroh",
      email: "siti.mae@web.id",
      password: customerPassword,
      phone: "081299999992",
      role: Role.CUSTOMER,
    },
  });
  const customer3 = await prisma.user.upsert({
    where: { email: "budi_petlover@gmail.com" },
    update: {},
    create: {
      name: "Budi Kusuma",
      email: "budi_petlover@gmail.com",
      password: customerPassword,
      phone: "081299999993",
      role: Role.CUSTOMER,
    },
  });
  const customer4 = await prisma.user.upsert({
    where: { email: "riana@petcare.co" },
    update: {},
    create: {
      name: "Riana Larasati",
      email: "riana@petcare.co",
      password: customerPassword,
      phone: "081299999994",
      role: Role.CUSTOMER,
    },
  });
  console.log(`✅ Customers created`);

  // ── Categories ─────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "makanan" },
      update: {},
      create: { name: "Makanan", slug: "makanan" },
    }),
    prisma.category.upsert({
      where: { slug: "mainan" },
      update: {},
      create: { name: "Mainan", slug: "mainan" },
    }),
    prisma.category.upsert({
      where: { slug: "aksesoris" },
      update: {},
      create: { name: "Aksesoris", slug: "aksesoris" },
    }),
    prisma.category.upsert({
      where: { slug: "kesehatan" },
      update: {},
      create: { name: "Kesehatan", slug: "kesehatan" },
    }),
  ]);
  console.log(`✅ Categories: ${categories.map((c) => c.name).join(", ")}`);

  const makanan = categories[0];
  const mainan = categories[1];
  const aksesoris = categories[2];
  const kesehatan = categories[3];

  // ── Products ───────────────────────────
  const whiskas = await prisma.product.upsert({
    where: { id: "product-whiskas-salmon" },
    update: {},
    create: {
      id: "product-whiskas-salmon",
      name: "Whiskas Gourmet Salmon",
      description: "Makanan kucing lezat rasa salmon.",
      price: 85000,
      stock: 124,
      categoryId: makanan.id,
      imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80",
      variants: {
        create: [
          { name: "Adult, Salmon", price: 85000, stock: 80 },
          { name: "Kitten, Salmon", price: 80000, stock: 44 },
        ],
      },
    },
  });

  const boneToy = await prisma.product.upsert({
    where: { id: "product-toughchew-bone" },
    update: {},
    create: {
      id: "product-toughchew-bone",
      name: "ToughChew Bone Toy",
      description: "Mainan tulang anjing tahan gigitan.",
      price: 45000,
      stock: 5, // Stok menipis
      categoryId: mainan.id,
      imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&q=80",
      variants: {
        create: [
          { name: "Large, Coral", price: 45000, stock: 5 },
        ],
      },
    },
  });

  const harness = await prisma.product.upsert({
    where: { id: "product-neowalk-harness" },
    update: {},
    create: {
      id: "product-neowalk-harness",
      name: "NeoWalk Comfort Harness",
      description: "Tali anjing nyaman anti tercekik.",
      price: 120000,
      stock: 42,
      categoryId: aksesoris.id,
      imageUrl: "https://images.unsplash.com/photo-1605051934279-d363b922d56a?w=400&q=80",
      variants: {
        create: [
          { name: "Medium, Teal", price: 120000, stock: 20 },
          { name: "Large, Teal", price: 130000, stock: 22 },
        ],
      },
    },
  });

  const vitamins = await prisma.product.upsert({
    where: { id: "product-pawsome-vitamins" },
    update: {},
    create: {
      id: "product-pawsome-vitamins",
      name: "Pawsome Multi-Vitamins",
      description: "Vitamin harian untuk menjaga kesehatan anjing dan kucing.",
      price: 150000,
      stock: 18,
      categoryId: kesehatan.id,
      imageUrl: "https://images.unsplash.com/photo-1629851602715-d3658593a21f?w=400&q=80",
      variants: {
        create: [
          { name: "60 Caps, All Breed", price: 150000, stock: 18 },
        ],
      },
    },
  });

  console.log(`✅ Products created`);

  // Fetch variants for orders
  const whiskasVar = await prisma.productVariant.findFirst({ where: { productId: whiskas.id } });
  const boneToyVar = await prisma.productVariant.findFirst({ where: { productId: boneToy.id } });
  const harnessVar = await prisma.productVariant.findFirst({ where: { productId: harness.id } });
  const vitaminsVar = await prisma.productVariant.findFirst({ where: { productId: vitamins.id } });

  // ── Orders ───────────────────────────
  // We'll create some dummy orders for today and past days
  const now = new Date();
  const pastDate = new Date();
  pastDate.setDate(now.getDate() - 2);

  // Clear existing orders to avoid duplicates on re-seed
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  const ordersToCreate = [
    {
      userId: customer1.id,
      status: "PENDING",
      totalPrice: 345000,
      paymentMethod: "COD",
      shippingAddress: "Jl. Merdeka No 1, Jakarta",
      createdAt: now,
      items: [
        { variantId: whiskasVar!.id, quantity: 2, price: whiskasVar!.price },
        { variantId: vitaminsVar!.id, quantity: 1, price: vitaminsVar!.price },
      ]
    },
    {
      userId: customer2.id,
      status: "DIPROSES",
      totalPrice: 1250000,
      paymentMethod: "DUMMY",
      shippingAddress: "Jl. Sudirman No 2, Jakarta",
      createdAt: pastDate,
      items: [
        { variantId: harnessVar!.id, quantity: 10, price: harnessVar!.price },
      ]
    },
    {
      userId: customer3.id,
      status: "SELESAI",
      totalPrice: 75000,
      paymentMethod: "COD",
      shippingAddress: "Jl. Thamrin No 3, Jakarta",
      createdAt: pastDate,
      items: [
        { variantId: boneToyVar!.id, quantity: 1, price: boneToyVar!.price },
      ]
    },
    {
      userId: customer4.id,
      status: "PENDING",
      totalPrice: 520000,
      paymentMethod: "DUMMY",
      shippingAddress: "Jl. Gatot Subroto No 4, Jakarta",
      createdAt: now,
      items: [
        { variantId: whiskasVar!.id, quantity: 1, price: whiskasVar!.price },
        { variantId: vitaminsVar!.id, quantity: 2, price: vitaminsVar!.price },
        { variantId: harnessVar!.id, quantity: 1, price: harnessVar!.price },
      ]
    }
  ];

  for (const orderData of ordersToCreate) {
    await prisma.order.create({
      data: {
        userId: orderData.userId,
        status: orderData.status as any,
        totalPrice: orderData.totalPrice,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
        createdAt: orderData.createdAt,
        items: {
          create: orderData.items,
        }
      }
    });
  }

  console.log(`✅ 4 Dummy orders created`);

  console.log("\n🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
