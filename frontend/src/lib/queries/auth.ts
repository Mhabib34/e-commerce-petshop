import { me } from "$lib/service/auth.service";
import { createQuery } from "@tanstack/svelte-query";

export const useMe = () =>
    createQuery(() => ({
        queryKey: ["me"],
        queryFn: me,
        retry: false,
        staleTime: 5 * 60 * 1000,
    }));