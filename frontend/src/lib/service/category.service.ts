import { api } from "$lib/api/client";
import type { CategoryRequest } from "$lib/types/category.type";

export const getCategories = async () => {
  const { data } = await api.get("/categories");
  return data;
};

export const createCategory = async (payload: CategoryRequest) => {
  const { data } = await api.post("/categories", payload);
  return data;
};

export const updateCategory = async (id: string, payload: CategoryRequest) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id: string) => {
  const { data } = await api.delete(`/categories/${id}`);
  return data;
};
