import { api } from "$lib/api/client";

export type GetProductsParams = {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
};

export const getProducts = async (params: GetProductsParams = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};

export const getProduct = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (formData: FormData) => {
  const { data } = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProduct = async (id: string, formData: FormData) => {
  const { data } = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};
