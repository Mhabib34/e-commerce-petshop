<script lang="ts">
	import { page } from '$app/state';
	import { useProducts } from '$lib/queries/product';
	import { useCategories } from '$lib/queries/category';
	import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '$lib/mutations/product';
	import type { ProductListItem } from '$lib/types/product.type';
	import type { Category } from '$lib/types/category.type';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	
	// Import Components
	import ProductTable from '$lib/components/organisms/ProductTable.svelte';
	import ProductForm from '$lib/components/organisms/ProductForm.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';

	import { Plus, Search, ChevronDown, ClipboardList, AlertTriangle, TrendingUp } from 'lucide-svelte';

	// Query params
	let search = $state(page.url.searchParams.get('q') || '');

	// Sync local search when URL changes
	$effect(() => {
		const q = page.url.searchParams.get('q') || '';
		if (q !== untrack(() => search)) {
			search = q;
		}

		const action = page.url.searchParams.get('action');
		if (action === 'create' && !untrack(() => showForm)) {
			const url = new URL(window.location.href);
			url.searchParams.delete('action');
			window.history.replaceState({}, '', url);
			openCreateForm();
		}
	});

	let categoryFilter = $state('');
	let currentPage = $state(1);
	const limit = 10;

	const productsQuery = useProducts(() => ({
		search: search || undefined,
		categoryId: categoryFilter || undefined,
		page: currentPage,
		limit
	}));
	const categoriesQuery = useCategories();

	const createMutation = useCreateProduct();
	const updateMutation = useUpdateProduct();
	const deleteMutation = useDeleteProduct();

	// Form state
	let showForm = $state(false);
	let editingProduct = $state<ProductListItem | null>(null);

	function openCreateForm() {
		editingProduct = null;
		showForm = true;
	}

	function openEditForm(product: ProductListItem) {
		editingProduct = product;
		showForm = true;
	}

	function handleSubmit(fd: FormData) {
		if (editingProduct) {
			updateMutation.mutate(
				{ id: editingProduct.id, formData: fd },
				{
					onSuccess: () => {
						toast.success('Produk berhasil diupdate');
						showForm = false;
					},
					onError: (err: Error & { response?: { data?: { message?: string } } }) => {
						toast.error(err?.response?.data?.message || 'Gagal mengupdate produk');
					}
				}
			);
		} else {
			createMutation.mutate(fd, {
				onSuccess: () => {
					toast.success('Produk berhasil ditambahkan');
					showForm = false;
				},
				onError: (err: Error & { response?: { data?: { message?: string } } }) => {
					toast.error(err?.response?.data?.message || 'Gagal menambahkan produk');
				}
			});
		}
	}

	function handleDelete(id: string) {
		toast('Konfirmasi Hapus', {
			description: 'Yakin ingin menghapus produk ini?',
			duration: Infinity,
			action: {
				label: 'Ya, Hapus',
				onClick: () => {
					deleteMutation.mutate(id, {
						onSuccess: () => {
							toast.success('Produk berhasil dihapus');
						},
						onError: (err: Error & { response?: { data?: { message?: string } } }) => {
							toast.error(err?.response?.data?.message || 'Gagal menghapus produk');
						}
					});
				}
			},
			cancel: {
				label: 'Batal',
				onClick: () => {}
			}
		});
	}

	let products = $derived<ProductListItem[]>(productsQuery.data?.data ?? []);
	let meta = $derived(productsQuery.data?.meta);
	let categories = $derived<Category[]>(categoriesQuery.data?.data ?? []);

	$effect(() => {
		const handleOpenAdd = () => openCreateForm();
		window.addEventListener('open-add-product', handleOpenAdd);
		return () => window.removeEventListener('open-add-product', handleOpenAdd);
	});
</script>

<svelte:head>
	<title>Produk - {PUBLIC_APP_NAME} Admin</title>
</svelte:head>

<div class="relative">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-gray-800 tracking-tight mb-1">Kelola Produk</h1>
			<p class="text-sm text-gray-500">Atur semua katalog produk toko Anda</p>
		</div>
		<button
			onclick={openCreateForm}
			class="bg-primary hover:bg-primary-hover shadow-md shadow-primary/30 transition-all text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 cursor-pointer"
		>
			<Plus size={18} /> Tambah Produk
		</button>
	</div>

	<!-- Product Table Container -->
	<div class="bg-white rounded-3xl p-8 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100">
		<!-- Toolbar / Search -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
			<div class="flex items-center gap-4">
				<h2 class="text-2xl font-bold text-gray-800 tracking-tight mr-4">Produk</h2>
				<div class="relative">
					<select
						bind:value={categoryFilter}
						class="appearance-none border border-gray-200 rounded-full pl-5 pr-10 py-2 text-sm bg-white font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-gray-50 transition-colors"
					>
						<option value="">Semua Kategori</option>
						{#each categories as cat (cat.id)}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
					<span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
						<ChevronDown size={16} />
					</span>
				</div>
			</div>

			<div class="flex gap-3">
				<div class="relative">
					<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
						<Search size={16} />
					</span>
					<input
						type="text"
						bind:value={search}
						placeholder="Cari produk..."
						class="pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-full text-sm focus:outline-none focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 w-64"
					/>
				</div>
			</div>
		</div>

		<ProductTable 
			{products} 
			isLoading={productsQuery.isLoading} 
			onEdit={openEditForm} 
			onDelete={handleDelete} 
		/>

		<Pagination {meta} bind:currentPage />

		{#if !productsQuery.isLoading && products.length > 0}
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
				<div class="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
					<div class="w-14 h-14 rounded-full bg-[#A7F3D0] text-teal-700 flex items-center justify-center shrink-0">
						<ClipboardList size={28} />
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-500 mb-1">Total Produk</p>
						<p class="text-2xl font-bold text-gray-800">{meta?.total ?? 0}</p>
					</div>
				</div>
				<div class="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
					<div class="w-14 h-14 rounded-full bg-[#FECACA] text-red-700 flex items-center justify-center shrink-0">
						<AlertTriangle size={28} />
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-500 mb-1">Stok Menipis</p>
						<p class="text-2xl font-bold text-gray-800">
							{products.filter((p) => p.stock <= 5).length}
						</p>
					</div>
				</div>
				<div class="bg-white border border-gray-100 rounded-3xl p-6 flex items-center gap-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
					<div class="w-14 h-14 rounded-full bg-[#D4AF37] text-white flex items-center justify-center shrink-0">
						<TrendingUp size={28} />
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-500 mb-1">Produk Terlaris</p>
						<p class="text-lg font-bold text-gray-800 line-clamp-1">Whiskas Gourmet</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<ProductForm 
		bind:showForm 
		{editingProduct} 
		{categories} 
		onSubmit={handleSubmit} 
		isPending={createMutation.isPending || updateMutation.isPending} 
	/>
</div>
