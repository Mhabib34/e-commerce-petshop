<script lang="ts">
    import { goto } from "$app/navigation";
    import { useQueryClient } from "@tanstack/svelte-query";
    import { useRegister } from "$lib/mutations/auth";

    const queryClient = useQueryClient();
    const registerMutation = useRegister();

    let name = $state("");
    let email = $state("");
    let phone = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let errorMsg = $state("");

    function submit() {
        errorMsg = "";

        if (!name.trim()) {
            errorMsg = "Nama wajib diisi";
            return;
        }
        if (!email.trim()) {
            errorMsg = "Email wajib diisi";
            return;
        }
        if (password.length < 6) {
            errorMsg = "Password minimal 6 karakter";
            return;
        }
        if (password !== confirmPassword) {
            errorMsg = "Konfirmasi password tidak cocok";
            return;
        }

        registerMutation.mutate(
            { name: name.trim(), email: email.trim(), phone: phone.trim(), password },
            {
                onSuccess: (data) => {
                    if (data.data?.token) {
                        localStorage.setItem("token", data.data.token);
                    }
                    queryClient.invalidateQueries({ queryKey: ["me"] });
                    if (data.data?.user?.role === "ADMIN") {
                        goto("/admin");
                    } else {
                        goto("/");
                    }
                },
                onError: (error: Error & { response?: { data?: { message?: string } } }) => {
                    errorMsg =
                        error?.response?.data?.message ||
                        "Gagal mendaftar, coba lagi";
                },
            }
        );
    }
</script>

<div class="flex justify-center items-center h-screen w-screen px-5">
    <form
        onsubmit={(e) => {
            e.preventDefault();
            submit();
        }}
        class="w-full md:w-[600px] p-8 flex flex-col justify-center gap-6 border-2 rounded-lg shadow-2xl"
    >
        <h1 class="text-2xl font-bold text-center">Register</h1>

        {#if errorMsg}
            <div class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                {errorMsg}
            </div>
        {/if}

        <div class="flex flex-col gap-2">
            <label for="name" class="font-medium">Nama</label>
            <input
                type="text"
                bind:value={name}
                id="name"
                class="w-full p-2 border rounded-lg text-gray-800"
                placeholder="Nama lengkap"
            />

            <label for="email" class="font-medium">Email</label>
            <input
                type="email"
                bind:value={email}
                id="email"
                class="w-full p-2 border rounded-lg text-gray-800"
                placeholder="Email"
            />

            <label for="phone" class="font-medium">No. Telepon</label>
            <input
                type="tel"
                bind:value={phone}
                id="phone"
                class="w-full p-2 border rounded-lg text-gray-800"
                placeholder="081234567890 (opsional)"
            />

            <label for="password" class="font-medium">Password</label>
            <input
                type="password"
                bind:value={password}
                id="password"
                class="w-full p-2 border rounded-lg text-gray-800"
                placeholder="Minimal 6 karakter"
            />

            <label for="confirm-password" class="font-medium">Konfirmasi Password</label>
            <input
                type="password"
                bind:value={confirmPassword}
                id="confirm-password"
                class="w-full p-2 border rounded-lg text-gray-800"
                placeholder="Ulangi password"
            />
        </div>

        <button
            type="submit"
            disabled={registerMutation.isPending}
            class="w-full p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium cursor-pointer disabled:opacity-50"
        >
            {registerMutation.isPending ? "Mendaftar..." : "Register"}
        </button>

        <p class="text-center text-sm text-gray-500">
            Sudah punya akun? <a href="/login" class="text-blue-500 hover:underline">Login</a>
        </p>
    </form>
</div>
