import { login } from "$lib/service/auth.service";
import { createMutation } from "@tanstack/svelte-query";

export const useLogin = () =>
    createMutation(() => ({
        mutationFn: login,
        onSuccess: () => {
            console.log("Login berhasil");
        },
        onError: (error) => {
            console.log("Login gagal", error);
        }
    }));