export interface VariantInput {
  name: string;
  price: number;
  stock: number;
}

export interface CreateProductBody {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  variants?: VariantInput[];
}

export interface UpdateProductBody {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
}

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}