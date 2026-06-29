import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "$lib/service/category.service";
import { createMutation, useQueryClient } from "@tanstack/svelte-query";

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  }));
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  }));
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  }));
};
