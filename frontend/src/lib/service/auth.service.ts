import { api } from "$lib/api/client";
import type { LoginUser } from "$lib/types/user.type";

export const login = async (data: LoginUser) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const me = async () => {
  // Only attempt if token exists
  if (typeof window !== "undefined" && !localStorage.getItem("token")) {
    throw new Error("No token");
  }
  const { data } = await api.get("/auth/me");
  return data;
};