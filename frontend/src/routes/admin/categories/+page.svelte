<script lang="ts">
    import { useCategories } from "$lib/queries/category";
    import {
        useCreateCategory,
        useUpdateCategory,
        useDeleteCategory,
    } from "$lib/mutations/category";
    import type { Category } from "$lib/types/category.type";

    const categoriesQuery = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    // Form state
    let newName = $state("");
    let editingId = $state<string | null>(null);
    let editName = $state("");
    let errorMsg = $state("");
    let successMsg = $state("");

    function clearMessages() {
        errorMsg = "";
        successMsg = "";
    }

    function handleCreate() {
        clearMessages();
        if (!newName.trim()) {
            errorMsg = "Nama kategori tidak boleh kosong";
            return;
        }
        createMutation.mutate(
            { name: newName.trim() },
            {
                onSuccess: () => {
                    newName = "";
                    successMsg = "Kategori berhasil ditambahkan";
                },
                onError: (err: Error & { response?: { data?: { message?: string } } }) => {
                    errorMsg =
                        err?.response?.data?.message ||
                        "Gagal menambahkan kategori";
                },
            }
        );
    }

    function startEdit(cat: Category) {
        clearMessages();
        editingId = cat.id;
        editName = cat.name;
    }

    function cancelEdit() {
        editingId = null;
        editName = "";
    }

    function handleUpdate() {
        clearMessages();
        if (!editingId || !editName.trim()) {
            errorMsg = "Nama kategori tidak boleh kosong";
            return;
        }
        updateMutation.mutate(
            { id: editingId, name: editName.trim() },
            {
                onSuccess: () => {
                    editingId = null;
                    editName = "";
                    successMsg = "Kategori berhasil diupdate";
                },
                onError: (err: Error & { response?: { data?: { message?: string } } }) => {
                    errorMsg =
                        err?.response?.data?.message ||
                        "Gagal mengupdate kategori";
                },
            }
        );
    }

    function handleDelete(id: string) {
        clearMessages();
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        deleteMutation.mutate(id, {
            onSuccess: () => {
                successMsg = "Kategori berhasil dihapus";
            },
            onError: (err: Error & { response?: { data?: { message?: string } } }) => {
                errorMsg =
                    err?.response?.data?.message || "Gagal menghapus kategori";
            },
        });
    }

    let categories = $derived<Category[]>(
        categoriesQuery.data?.data ?? []
    );
</script>

<svelte:head>
    <title>Kategori - Let Shop Admin</title>
</svelte:head>

<div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Kelola Kategori</h1>

    {#if errorMsg}
        <div class="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">
            {errorMsg}
        </div>
    {/if}
    {#if successMsg}
        <div class="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">
            {successMsg}
        </div>
    {/if}

    <!-- Add Category Form -->
    <div class="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <h2 class="font-semibold text-gray-700 mb-3">Tambah Kategori Baru</h2>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                handleCreate();
            }}
            class="flex gap-3"
        >
            <input
                type="text"
                bind:value={newName}
                placeholder="Nama kategori"
                class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
                type="submit"
                disabled={createMutation.isPending}
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
            >
                {createMutation.isPending ? "Menambahkan..." : "Tambah"}
            </button>
        </form>
    </div>

    <!-- Category List -->
    <div class="bg-white rounded-lg border border-gray-200">
        {#if categoriesQuery.isLoading}
            <p class="p-5 text-gray-500">Memuat kategori...</p>
        {:else if categories.length === 0}
            <p class="p-5 text-gray-400">Belum ada kategori.</p>
        {:else}
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-200 bg-gray-50">
                        <th class="text-left px-5 py-3 text-gray-600 font-medium"
                            >Nama</th
                        >
                        <th class="text-left px-5 py-3 text-gray-600 font-medium"
                            >Slug</th
                        >
                        <th class="text-right px-5 py-3 text-gray-600 font-medium"
                            >Aksi</th
                        >
                    </tr>
                </thead>
                <tbody>
                    {#each categories as cat (cat.id)}
                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                            <td class="px-5 py-3">
                                {#if editingId === cat.id}
                                    <input
                                        type="text"
                                        bind:value={editName}
                                        class="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                    />
                                {:else}
                                    {cat.name}
                                {/if}
                            </td>
                            <td class="px-5 py-3 text-gray-500">{cat.slug}</td>
                            <td class="px-5 py-3 text-right">
                                {#if editingId === cat.id}
                                    <button
                                        onclick={handleUpdate}
                                        disabled={updateMutation.isPending}
                                        class="text-green-600 hover:text-green-800 text-sm mr-2 cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        onclick={cancelEdit}
                                        class="text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                {:else}
                                    <button
                                        onclick={() => startEdit(cat)}
                                        class="text-blue-600 hover:text-blue-800 text-sm mr-2 cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onclick={() => handleDelete(cat.id)}
                                        disabled={deleteMutation.isPending}
                                        class="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>
