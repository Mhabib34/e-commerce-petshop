import { cartRepository } from "./cart.repository.ts";
import { prisma } from "../../config/prisma.ts";
import { NotFoundError } from "../../errors/NotFoundError.ts";
import { ValidationError } from "../../errors/ValidationError.ts";
import { ForbiddenError } from "../../errors/ForbiddenError.ts";
import type { AddToCartBody, UpdateCartItemBody } from "./cart.types.ts";

export const cartService = {
  async getCart(userId: string) {
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart) return { id: null, items: [], total: 0 };

    const total = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    return { ...cart, total };
  },

  async addItem(userId: string, body: AddToCartBody) {
    // Cek variant ada dan stok cukup
    const variant = await prisma.productVariant.findUnique({
      where: { id: body.variantId },
    });
    if (!variant) throw new NotFoundError("Product variant not found");
    if (variant.stock < body.quantity) {
      throw new ValidationError("Insufficient stock");
    }

    const cart = await cartRepository.ensureCart(userId);
    return cartRepository.addItem(cart.id, body.variantId, body.quantity);
  },

  async updateItem(userId: string, itemId: string, body: UpdateCartItemBody) {
    const item = await cartRepository.findCartItemById(itemId);
    if (!item) throw new NotFoundError("Cart item not found");
    if (item.cart.userId !== userId) throw new ForbiddenError();

    if (body.quantity <= 0) {
      throw new ValidationError("Quantity must be greater than 0");
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
    });
    if (!variant) throw new NotFoundError("Product variant not found");
    if (variant.stock < body.quantity) {
      throw new ValidationError("Insufficient stock");
    }

    return cartRepository.updateItem(itemId, body.quantity);
  },

  async deleteItem(userId: string, itemId: string) {
    const item = await cartRepository.findCartItemById(itemId);
    if (!item) throw new NotFoundError("Cart item not found");
    if (item.cart.userId !== userId) throw new ForbiddenError();
    await cartRepository.deleteItem(itemId);
  },
};