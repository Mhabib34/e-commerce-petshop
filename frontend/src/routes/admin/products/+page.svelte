<script lang="ts">
    import { useProducts } from "$lib/queries/product";
    import { useCategories } from "$lib/queries/category";
    import {
        useCreateProduct,
        useUpdateProduct,
        useDeleteProduct,
    } from "$lib/mutations/product";
    import type { ProductListItem } from "$lib/types/product.type";
    import type { Category } from "$lib/types/category.type";

    // Query params
    let search = $state("");
    let categoryFilter = $state("");
    let currentPage = $state(1);
    const limit = 10;

    const productsQuery = useProducts(() => ({
        search: search || undefined,
        categoryId: categoryFilter || undefined,
        page: currentPage,
        limit,
    }));
    const categoriesQuery = useCategories();

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    // Form state
    let showForm = $state(false);
    let editingProduct = $state<ProductListItem | null>(null);
    let formName = $state("");
    let formDescription = $state("");
    let formPrice = $state(0);
    let formStock = $state(0);
    let formCategoryId = $state("");
    let formImage = $state<File | null>(null);
    let formVariants = $state<{ name: string; price: number; stock: number }[]>(
        []
    );
    let errorMsg = $state("");
    let successMsg = $state("");

    function clearMessages() {
        errorMsg = "";
        successMsg = "";
    }

    function resetForm() {
        formName = "";
        formDescription = "";
        formPrice = 0;
        formStock = 0;
        formCategoryId = "";
        formImage = null;
        formVariants = [];
        editingProduct = null;
        showForm = false;
    }

    function openCreateForm() {
        clearMessages();
        resetForm();
        showForm = true;
    }

    function openEditForm(product: ProductListItem) {
        clearMessages();
        editingProduct = product;
        formName = product.name;
        formDescription = "";
        formPrice = product.price;
        formStock = product.stock;
        formCategoryId = product.category?.id ?? "";
        formImage = null;
        formVariants = [];
        showForm = true;
    }

    function addVariant() {
        formVariants = [...formVariants, { name: "", price: 0, stock: 0 }];
    }

    function removeVariant(index: number) {
        formVariants = formVariants.filter((_, i) => i !== index);
    }

    function handleFileChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            formImage = target.files[0];
        }
    }

    function handleSubmit() {
        clearMessages();
        if (!formName.trim()) {
            errorMsg = "Nama produk wajib diisi";
            return;
        }
        if (!formCategoryId) {
            errorMsg = "Kategori wajib dipilih";
            return;
        }

        const fd = new FormData();
        fd.append("name", formName.trim());
        fd.append("description", formDescription.trim());
        fd.append("price", String(formPrice));
        fd.append("stock", String(formStock));
        fd.append("categoryId", formCategoryId);
        if (formImage) {
            fd.append("image", formImage);
        }
        if (formVariants.length > 0) {
            fd.append("variants", JSON.stringify(formVariants));
        }

        if (editingProduct) {
            updateMutation.mutate(
                { id: editingProduct.id, formData: fd },
                {
                    onSuccess: () => {
                        successMsg = "Produk berhasil diupdate";
                        resetForm();
                    },
                    onError: (err: any) => {
                        errorMsg =
                            err?.response?.data?.message ||
                            "Gagal mengupdate produk";
                    },
                }
            );
        } else {
            createMutation.mutate(fd, {
                onSuccess: () => {
                    successMsg = "Produk berhasil ditambahkan";
                    resetForm();
                },
                onError: (err: any) => {
                    errorMsg =
                        err?.response?.data?.message ||
                        "Gagal menambahkan produk";
                },
            });
        }
    }

    function handleDelete(id: string) {
        clearMessages();
        if (!confirm("Yakin ingin menghapus produk ini?")) return;
        deleteMutation.mutate(id, {
            onSuccess: () => {
                successMsg = "Produk berhasil dihapus";
            },
            onError: (err: any) => {
                errorMsg =
                    err?.response?.data?.message || "Gagal menghapus produk";
            },
        });
    }

    function formatRupiah(num: number): string {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);
    }

    let products = $derived<ProductListItem[]>(
        productsQuery.data?.data ?? []
    );
    let meta = $derived(productsQuery.data?.meta);
    let categories = $derived<Category[]>(
        categoriesQuery.data?.data ?? []
    );
</script>

<svelte:head>
    <title>Produk - Let Shop Admin</title>
</svelte:head>

<div>
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Kelola Produk</h1>
        <button
            onclick={openCreateForm}
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
        >
            + Tambah Produk
        </button>
    </div>

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

    <!-- Product Form Modal -->
    {#if showForm}
        <div class="bg-white rounded-lg border border-gray-200 p-5 mb-6">
            <h2 class="font-semibold text-gray-700 mb-4">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </h2>
            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                class="space-y-4"
            >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            for="prod-name"
                            class="block text-sm font-medium text-gray-600 mb-1"
                            >Nama Produk</label
                        >
                        <input
                            id="prod-name"
                            type="text"
                            bind:value={formName}
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label
                            for="prod-category"
                            class="block text-sm font-medium text-gray-600 mb-1"
                            >Kategori</label
                        >
                        <select
                            id="prod-category"
                            bind:value={formCategoryId}
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Pilih Kategori</option>
                            {#each categories as cat}
                                <option value={cat.id}>{cat.name}</option>
                            {/each}
                        </select>
                    </div>
                    <div>
                        <label
                            for="prod-price"
                            class="block text-sm font-medium text-gray-600 mb-1"
                            >Harga</label
                        >
                        <input
                            id="prod-price"
                            type="number"
                            bind:value={formPrice}
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label
                            for="prod-stock"
                            class="block text-sm font-medium text-gray-600 mb-1"
                            >Stok</label
                        >
                        <input
                            id="prod-stock"
                            type="number"
                            bind:value={formStock}
                            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label
                        for="prod-desc"
                        class="block text-sm font-medium text-gray-600 mb-1"
                        >Deskripsi</label
                    >
                    <textarea
                        id="prod-desc"
                        bind:value={formDescription}
                        rows={3}
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    ></textarea>
                </div>

                <div>
                    <label
                        for="prod-image"
                        class="block text-sm font-medium text-gray-600 mb-1"
                        >Gambar Produk</label
                    >
                    <input
                        id="prod-image"
                        type="file"
                        accept="image/jpeg,image/png"
                        onchange={handleFileChange}
                        class="w-full text-sm"
                    />
                </div>

                <!-- Variants -->
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-600"
                            >Varian</span
                        >
                        <button
                            type="button"
                            onclick={addVariant}
                            class="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                        >
                            + Tambah Varian
                        </button>
                    </div>
                    {#each formVariants as variant, i}
                        <div
                            class="flex gap-2 items-end mb-2 border border-gray-100 p-3 rounded-lg"
                        >
                            <div class="flex-1">
                                <label
                                    for="var-name-{i}"
                                    class="text-xs text-gray-500">Nama</label
                                >
                                <input
                                    id="var-name-{i}"
                                    type="text"
                                    bind:value={variant.name}
                                    placeholder="Merah - L"
                                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <div class="w-28">
                                <label
                                    for="var-price-{i}"
                                    class="text-xs text-gray-500">Harga</label
                                >
                                <input
                                    id="var-price-{i}"
                                    type="number"
                                    bind:value={variant.price}
                                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <div class="w-20">
                                <label
                                    for="var-stock-{i}"
                                    class="text-xs text-gray-500">Stok</label
                                >
                                <input
                                    id="var-stock-{i}"
                                    type="number"
                                    bind:value={variant.stock}
                                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onclick={() => removeVariant(i)}
                                class="text-red-500 hover:text-red-700 text-sm pb-1 cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    {/each}
                </div>

                <div class="flex gap-3">
                    <button
                        type="submit"
                        disabled={createMutation.isPending ||
                            updateMutation.isPending}
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                        {createMutation.isPending || updateMutation.isPending
                            ? "Menyimpan..."
                            : editingProduct
                              ? "Update"
                              : "Simpan"}
                    </button>
                    <button
                        type="button"
                        onclick={resetForm}
                        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                    >
                        Batal
                    </button>
                </div>
            </form>
        </div>
    {/if}

    <!-- Search & Filter -->
    <div
        class="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex flex-wrap gap-3"
    >
        <input
            type="text"
            bind:value={search}
            placeholder="Cari produk..."
            class="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
            bind:value={categoryFilter}
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
            <option value="">Semua Kategori</option>
            {#each categories as cat}
                <option value={cat.id}>{cat.name}</option>
            {/each}
        </select>
    </div>

    <!-- Product Table -->
    <div class="bg-white rounded-lg border border-gray-200">
        {#if productsQuery.isLoading}
            <p class="p-5 text-gray-500">Memuat produk...</p>
        {:else if products.length === 0}
            <p class="p-5 text-gray-400">Tidak ada produk ditemukan.</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 bg-gray-50">
                            <th
                                class="text-left px-5 py-3 text-gray-600 font-medium"
                                >Gambar</th
                            >
                            <th
                                class="text-left px-5 py-3 text-gray-600 font-medium"
                                >Nama</th
                            >
                            <th
                                class="text-left px-5 py-3 text-gray-600 font-medium"
                                >Kategori</th
                            >
                            <th
                                class="text-right px-5 py-3 text-gray-600 font-medium"
                                >Harga</th
                            >
                            <th
                                class="text-right px-5 py-3 text-gray-600 font-medium"
                                >Stok</th
                            >
                            <th
                                class="text-right px-5 py-3 text-gray-600 font-medium"
                                >Aksi</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        {#each products as product (product.id)}
                            <tr
                                class="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td class="px-5 py-3">
                                    {#if product.imageUrl}
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            class="w-12 h-12 object-cover rounded"
                                        />
                                    {:else}
                                        <div
                                            class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs"
                                        >
                                            N/A
                                        </div>
                                    {/if}
                                </td>
                                <td class="px-5 py-3 font-medium text-gray-800"
                                    >{product.name}</td
                                >
                                <td class="px-5 py-3 text-gray-500"
                                    >{product.category?.name ?? "-"}</td
                                >
                                <td class="px-5 py-3 text-right"
                                    >{formatRupiah(product.price)}</td
                                >
                                <td class="px-5 py-3 text-right"
                                    >{product.stock}</td
                                >
                                <td class="px-5 py-3 text-right">
                                    <button
                                        onclick={() => openEditForm(product)}
                                        class="text-blue-600 hover:text-blue-800 text-sm mr-2 cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onclick={() =>
                                            handleDelete(product.id)}
                                        class="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            {#if meta && meta.totalPages > 1}
                <div
                    class="flex items-center justify-between px-5 py-3 border-t border-gray-200"
                >
                    <span class="text-sm text-gray-500">
                        Halaman {meta.page} dari {meta.totalPages} ({meta.total}
                        produk)
                    </span>
                    <div class="flex gap-2">
                        <button
                            onclick={() =>
                                (currentPage = Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default"
                        >
                            Prev
                        </button>
                        <button
                            onclick={() =>
                                (currentPage = Math.min(
                                    meta.totalPages,
                                    currentPage + 1
                                ))}
                            disabled={currentPage >= meta.totalPages}
                            class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default"
                        >
                            Next
                        </button>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</div>
