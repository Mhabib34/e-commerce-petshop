// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

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

  // ── Demo Customer ──────────────────────
  const customerPassword = await hash("customer123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "user@letshop.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@letshop.com",
      password: customerPassword,
      phone: "081299999999",
      role: Role.CUSTOMER,
    },
  });
  console.log(`✅ Customer: ${customer.email}`);

  // ── Categories ─────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "pakaian" },
      update: {},
      create: { name: "Pakaian", slug: "pakaian" },
    }),
    prisma.category.upsert({
      where: { slug: "sepatu" },
      update: {},
      create: { name: "Sepatu", slug: "sepatu" },
    }),
    prisma.category.upsert({
      where: { slug: "aksesoris" },
      update: {},
      create: { name: "Aksesoris", slug: "aksesoris" },
    }),
  ]);
  console.log(`✅ Categories: ${categories.map((c) => c.name).join(", ")}`);

  // ── Products ───────────────────────────
  const pakaian = categories[0];
  const sepatu = categories[1];
  const aksesoris = categories[2];

  const kaos = await prisma.product.upsert({
    where: { id: "product-kaos-polos" },
    update: {},
    create: {
      id: "product-kaos-polos",
      name: "Kaos Polos Premium",
      description: "Kaos polos berbahan cotton combed 30s, nyaman dipakai sehari-hari.",
      price: 120000,
      stock: 100,
      categoryId: pakaian.id,
      variants: {
        create: [
          { name: "Putih - S", price: 120000, stock: 20 },
          { name: "Putih - M", price: 120000, stock: 30 },
          { name: "Putih - L", price: 120000, stock: 25 },
          { name: "Hitam - S", price: 120000, stock: 10 },
          { name: "Hitam - M", price: 120000, stock: 15 },
        ],
      },
    },
  });

  const celana = await prisma.product.upsert({
    where: { id: "product-celana-chino" },
    update: {},
    create: {
      id: "product-celana-chino",
      name: "Celana Chino Slim Fit",
      description: "Celana chino slim fit bahan katun stretch, cocok untuk casual maupun semi-formal.",
      price: 250000,
      stock: 60,
      categoryId: pakaian.id,
      variants: {
        create: [
          { name: "Navy - 30", price: 250000, stock: 15 },
          { name: "Navy - 32", price: 250000, stock: 15 },
          { name: "Khaki - 30", price: 250000, stock: 15 },
          { name: "Khaki - 32", price: 250000, stock: 15 },
        ],
      },
    },
  });

  const sneakers = await prisma.product.upsert({
    where: { id: "product-sneakers-basic" },
    update: {},
    create: {
      id: "product-sneakers-basic",
      name: "Sneakers Basic Canvas",
      description: "Sepatu sneakers kanvas ringan dan breathable untuk aktivitas harian.",
      price: 350000,
      stock: 40,
      categoryId: sepatu.id,
      variants: {
        create: [
          { name: "Putih - 39", price: 350000, stock: 10 },
          { name: "Putih - 40", price: 350000, stock: 10 },
          { name: "Putih - 41", price: 350000, stock: 10 },
          { name: "Hitam - 40", price: 350000, stock: 10 },
        ],
      },
    },
  });

  const topi = await prisma.product.upsert({
    where: { id: "product-topi-baseball" },
    update: {},
    create: {
      id: "product-topi-baseball",
      name: "Topi Baseball Unisex",
      description: "Topi baseball bahan twill, adjustable, cocok untuk pria dan wanita.",
      price: 95000,
      stock: 80,
      categoryId: aksesoris.id,
      variants: {
        create: [
          { name: "Hitam", price: 95000, stock: 30 },
          { name: "Putih", price: 95000, stock: 25 },
          { name: "Navy", price: 95000, stock: 25 },
        ],
      },
    },
  });

  console.log(`✅ Products: ${[kaos, celana, sneakers, topi].map((p) => p.name).join(", ")}`);
  console.log("\n🎉 Seeding selesai!");
  console.log("\nAkun demo:");
  console.log("  Admin    → admin@letshop.com / admin123");
  console.log("  Customer → user@letshop.com  / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
