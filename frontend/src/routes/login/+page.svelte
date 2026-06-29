<script lang="ts">
    import { goto } from "$app/navigation";
    import { useQueryClient } from "@tanstack/svelte-query";
    import { useLogin } from "$lib/mutations/auth";

    const queryClient = useQueryClient();
    const loginMutation = useLogin();

    let email = $state("");
    let password = $state("");
    let errorMsg = $state("");

    function submit() {
        errorMsg = "";
        loginMutation.mutate(
            { email, password },
            {
                onSuccess: (data) => {
                    if (data.data?.token) {
                        localStorage.setItem("token", data.data.token);
                    }
                    queryClient.invalidateQueries({ queryKey: ["me"] });
                    // Check role and redirect
                    if (data.data?.user?.role === "ADMIN") {
                        goto("/admin");
                    } else {
                        goto("/");
                    }
                },
                onError: (error: any) => {
                    errorMsg =
                        error?.response?.data?.message ||
                        "Email atau password salah";
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
        <h1 class="text-2xl font-bold text-center">Login Admin</h1>

        {#if errorMsg}
            <div class="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                {errorMsg}
            </div>
        {/if}

        <div class="flex flex-col gap-2">
            <label for="email" class="font-medium">Email</label>
            <input
                type="email"
                bind:value={email}
                id="email"
                class="w-full p-2 border rounded-lg text-gray-800"
                placeholder="Email"
            />

            <label for="password" class="font-medium">Password</label>
            <input
                type="password"
                bind:value={password}
                id="password"
                class="w-full p-2 border rounded-lg text-gray-800"
                placeholder="Password"
            />
        </div>

        <button
            type="submit"
            disabled={loginMutation.isPending}
            class="w-full p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium cursor-pointer disabled:opacity-50"
        >
            {loginMutation.isPending ? "Loading..." : "Login"}
        </button>
    </form>
</div>