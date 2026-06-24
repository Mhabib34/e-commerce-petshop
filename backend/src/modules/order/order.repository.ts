import { prisma } from "../../config/prisma.ts";
import type { CreateOrderBody, OrderQuery } from "./order.types.ts";

export const orderRepository = {
  async findAllByUser(userId: string, query: OrderQuery) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { variant: { include: { product: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async findAll(query: OrderQuery) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: { variant: { include: { product: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total, page, limit };
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });
  },

  async create(
    userId: string,
    body: CreateOrderBody,
    totalPrice: number,
    orderItems: { variantId: string; quantity: number; price: number }[]
  ) {
    return prisma.order.create({
      data: {
        userId,
        shippingAddress: body.shippingAddress,
        paymentMethod: body.paymentMethod,
        totalPrice,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
      },
    });
  },

  async updateStatus(id: string, status: "PENDING" | "DIPROSES" | "SELESAI") {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  },
};