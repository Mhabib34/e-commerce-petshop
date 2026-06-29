import { getDashboardStats } from "$lib/service/dashboard.service";
import { createQuery } from "@tanstack/svelte-query";

export const useDashboardStats = (range: () => "7d" | "30d") =>
  createQuery(() => ({
    queryKey: ["dashboard", range()],
    queryFn: () => getDashboardStats(range()),
  }));
