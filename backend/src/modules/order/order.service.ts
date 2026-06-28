import { orderRepository } from "./order.repository.ts";
import { cartRepository } from "../cart/cart.repository.ts";
import { prisma } from "../../config/prisma.ts";
import { NotFoundError } from "../../errors/NotFoundError.ts";
import { ValidationError } from "../../errors/ValidationError.ts";
import { ForbiddenError } from "../../errors/ForbiddenError.ts";
import type { CreateOrderBody, DirectCheckoutBody, OrderQuery, UpdateOrderStatusBody } from "./order.types.ts";

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

  /**
   * Checkout dari keranjang.
   * - Jika cartItemIds diberikan → hanya checkout item yang dipilih (selective checkout)
   * - Jika cartItemIds tidak diberikan → checkout semua item di cart (backward compatible)
   */
  async checkout(userId: string, body: CreateOrderBody) {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    // Tentukan item mana yang akan di-checkout
    let selectedItems = cart.items;

    if (body.cartItemIds && body.cartItemIds.length > 0) {
      // Selective checkout: hanya item yang dipilih
      selectedItems = cart.items.filter((item) =>
        body.cartItemIds!.includes(item.id)
      );

      if (selectedItems.length === 0) {
        throw new ValidationError(
          "No matching cart items found for the given cartItemIds"
        );
      }

      // Pastikan semua cartItemIds valid
      if (selectedItems.length !== body.cartItemIds.length) {
        const foundIds = selectedItems.map((item) => item.id);
        const invalidIds = body.cartItemIds.filter(
          (id) => !foundIds.includes(id)
        );
        throw new ValidationError(
          `Invalid cart item IDs: ${invalidIds.join(", ")}`
        );
      }
    }

    // Validasi stok semua item yang dipilih
    for (const item of selectedItems) {
      if (item.variant.stock < item.quantity) {
        throw new ValidationError(
          `Insufficient stock for variant: ${item.variant.name}`
        );
      }
    }

    const totalPrice = selectedItems.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    const orderItems = selectedItems.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      price: Number(item.variant.price),
    }));

    // Transaksi: buat order + kurangi stok + hapus item yang di-checkout dari cart
    const order = await prisma.$transaction(async (tx) => {
      // Kurangi stok setiap varian
      for (const item of selectedItems) {
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

      // Hapus item yang di-checkout dari cart
      const selectedItemIds = selectedItems.map((item) => item.id);
      await tx.cartItem.deleteMany({
        where: {
          id: { in: selectedItemIds },
        },
      });

      return newOrder;
    });

    return order;
  },

  /**
   * Direct checkout — beli langsung dari halaman detail produk tanpa masuk keranjang.
   */
  async directCheckout(userId: string, body: DirectCheckoutBody) {
    // Validasi variant ada
    const variant = await prisma.productVariant.findUnique({
      where: { id: body.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundError("Product variant not found");
    }

    // Validasi stok cukup
    if (variant.stock < body.quantity) {
      throw new ValidationError(
        `Insufficient stock for variant: ${variant.name}`
      );
    }

    const totalPrice = Number(variant.price) * body.quantity;

    // Transaksi: buat order + kurangi stok
    const order = await prisma.$transaction(async (tx) => {
      // Kurangi stok varian
      await tx.productVariant.update({
        where: { id: body.variantId },
        data: { stock: { decrement: body.quantity } },
      });

      // Buat order
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddress: body.shippingAddress,
          paymentMethod: body.paymentMethod,
          totalPrice,
          items: {
            create: [
              {
                variantId: body.variantId,
                quantity: body.quantity,
                price: Number(variant.price),
              },
            ],
          },
        },
        include: {
          items: {
            include: { variant: { include: { product: true } } },
          },
        },
      });

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