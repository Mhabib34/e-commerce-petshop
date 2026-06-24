import { orderRepository } from "./order.repository.ts";
import { cartRepository } from "../cart/cart.repository.ts";
import { prisma } from "../../config/prisma.ts";
import { NotFoundError } from "../../errors/NotFoundError.ts";
import { ValidationError } from "../../errors/ValidationError.ts";
import { ForbiddenError } from "../../errors/ForbiddenError.ts";
import type { CreateOrderBody, OrderQuery, UpdateOrderStatusBody } from "./order.types.ts";

const STATUS_FLOW: Record<string, string> = {
  PENDING: "DIPROSES",
  DIPROSES: "SELESAI",
};

export const orderService = {
  async getMyOrders(userId: string, query: OrderQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await orderRepository.findAllByUser(userId, {
      ...query,
      page,
      limit,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getMyOrderById(userId: string, orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");
    if (order.userId !== userId) throw new ForbiddenError();
    return order;
  },

  async checkout(userId: string, body: CreateOrderBody) {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    // Validasi stok semua item
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for variant: ${item.variant.name}`
        );
      }
    }

    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    const orderItems = cart.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: Number(item.variant.price),
    }));

    // Transaksi: buat order + kurangi stok + kosongkan cart
    const order = await prisma.$transaction(async (tx) => {
      // Kurangi stok setiap varian
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Buat order
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddress: body.shippingAddress,
          paymentMethod: body.paymentMethod,
          totalPrice,
          items: { create: orderItems },
        },
        include: {
          items: {
            include: { variant: { include: { product: true } } },
          },
        },
      });

      // Kosongkan cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  },

  async getAllOrders(query: OrderQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const { items, total } = await orderRepository.findAll({
      ...query,
      page,
      limit,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateStatus(orderId: string, body: UpdateOrderStatusBody) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError("Order not found");

    const expectedNext = STATUS_FLOW[order.status];
    if (body.status !== expectedNext) {
      throw new ValidationError(
        `Invalid status transition: ${order.status} → ${body.status}. Expected: ${expectedNext}`
      );
    }

    return orderRepository.updateStatus(orderId, body.status);
  },
};