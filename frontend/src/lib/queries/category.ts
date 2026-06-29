import { getCategories } from "$lib/service/category.service";
import { createQuery } from "@tanstack/svelte-query";

export const useCategories = () =>
  createQuery(() => ({
    queryKey: ["categories"],
    queryFn: getCategories,
  }));
