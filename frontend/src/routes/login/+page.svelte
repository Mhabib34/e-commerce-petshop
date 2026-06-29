<script lang="ts">
    import { goto } from "$app/navigation";
    import { useQueryClient } from "@tanstack/svelte-query";
    import { useLogin } from "$lib/mutations/auth";

    const queryClient = useQueryClient();
    const loginMutation = useLogin();

    let email = $state("");
    let password = $state("");

    function submit() {
        loginMutation.mutate(
            { email, password },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["me"] });
                    goto("/");
                },
            }
        );
    }
</script>

<div class="flex justify-center items-center h-screen w-screen px-5">
    <form
        onsubmit={(e) => { e.preventDefault(); submit(); }}
        class="w-full md:w-[600px] p-8 flex flex-col justify-center gap-6 border-2 rounded-lg shadow-2xl"
    >
        <h1 class="text-2xl font-bold text-center">Login</h1>

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
            class="w-full p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium cursor-pointer"
        >
            Login
        </button>
    </form>
</div>