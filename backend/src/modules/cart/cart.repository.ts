import { prisma } from "../../config/prisma.ts";

export const cartRepository = {
  async findCartByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  async ensureCart(userId: string) {
    return prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  },

  async findCartItem(cartId: string, variantId: string) {
    return prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId, variantId } },
    });
  },

  async findCartItemById(itemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
  },

  async addItem(cartId: string, variantId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      create: { cartId, variantId, quantity },
      update: { quantity: { increment: quantity } },
    });
  },

  async updateItem(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  },

  async deleteItem(itemId: string) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  },

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },
};