export interface CreateOrderBody {
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