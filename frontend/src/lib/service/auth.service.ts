import { api } from "$lib/api/client";
import type { LoginUser } from "$lib/types/user.type";

export const login = async (data: LoginUser) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};