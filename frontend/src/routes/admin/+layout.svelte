<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { useMe } from "$lib/queries/auth";

    const { children } = $props();
    const meQuery = useMe();

    let sidebarOpen = $state(true);

    // Redirect if not admin
    $effect(() => {
        if (meQuery.isError) {
            goto("/login");
        }
        if (meQuery.data && meQuery.data.data?.role !== "ADMIN") {
            goto("/login");
        }
    });

    function logout() {
        localStorage.removeItem("token");
        goto("/login");
    }

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/products", label: "Produk", icon: "📦" },
        { href: "/admin/categories", label: "Kategori", icon: "🏷️" },
        { href: "/admin/orders", label: "Pesanan", icon: "🛒" },
    ];

    function isActive(href: string): boolean {
        if (href === "/admin") return page.url.pathname === "/admin";
        return page.url.pathname.startsWith(href);
    }
</script>

{#if meQuery.isLoading}
    <div class="flex items-center justify-center h-screen">
        <p class="text-gray-500 text-lg">Loading...</p>
    </div>
{:else if meQuery.data?.data?.role === "ADMIN"}
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <aside
            class="bg-white border-r border-gray-200 flex flex-col transition-all duration-200 {sidebarOpen
                ? 'w-64'
                : 'w-16'}"
        >
            <div
                class="p-4 border-b border-gray-200 flex items-center justify-between"
            >
                {#if sidebarOpen}
                    <h2 class="font-bold text-lg text-gray-800">Let Shop</h2>
                {/if}
                <button
                    onclick={() => (sidebarOpen = !sidebarOpen)}
                    class="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                    {sidebarOpen ? "◀" : "▶"}
                </button>
            </div>

            <nav class="flex-1 p-2">
                {#each navItems as item}
                    <a
                        href={item.href}
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors
                            {isActive(item.href)
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}"
                    >
                        <span class="text-lg">{item.icon}</span>
                        {#if sidebarOpen}
                            <span>{item.label}</span>
                        {/if}
                    </a>
                {/each}
            </nav>

            <div class="p-2 border-t border-gray-200">
                {#if sidebarOpen}
                    <div class="px-3 py-2 text-xs text-gray-400 truncate">
                        {meQuery.data?.data?.name ?? "Admin"}
                    </div>
                {/if}
                <button
                    onclick={logout}
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full cursor-pointer"
                >
                    <span class="text-lg">🚪</span>
                    {#if sidebarOpen}
                        <span>Logout</span>
                    {/if}
                </button>
            </div>
        </aside>

        <!-- Main content -->
        <main class="flex-1 overflow-auto">
            <div class="p-6">
                {@render children()}
            </div>
        </main>
    </div>
{/if}
