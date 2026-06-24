export interface AddToCartBody {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemBody {
  quantity: number;
}