import { api } from "$lib/api/client";

export const getDashboardStats = async (range: "7d" | "30d" = "7d") => {
  const { data } = await api.get("/admin/dashboard", {
    params: { period: range },
  });
  return data;
};
