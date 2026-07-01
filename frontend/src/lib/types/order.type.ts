export type OrderStatus = "PENDING" | "DIPROSES" | "SELESAI";
export type PaymentMethod = "COD" | "DUMMY";

export type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  };
};

export type Order = {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  shippingAddress: string;
  items: OrderItem[];
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
};

export type UpdateOrderStatusRequest = {
  status: OrderStatus;
};
