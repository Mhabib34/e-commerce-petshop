export interface CreateOrderBody {
  shippingAddress: string;
  paymentMethod: "COD" | "DUMMY";
  cartItemIds?: string[]; // Jika tidak dikirim → checkout SEMUA item di cart
}

export interface DirectCheckoutBody {
  variantId: string;
  quantity: number;
  shippingAddress: string;
  paymentMethod: "COD" | "DUMMY";
}

export interface OrderQuery {
  status?: "PENDING" | "DIPROSES" | "SELESAI";
  page?: number;
  limit?: number;
}

export interface UpdateOrderStatusBody {
  status: "PENDING" | "DIPROSES" | "SELESAI";
}