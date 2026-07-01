<script lang="ts">
	import { useCategories } from "$lib/queries/category";
	import { useCreateCategory, useUpdateCategory, useDeleteCategory } from "$lib/mutations/category";
	import type { Category } from "$lib/types/category.type";
	import { toast } from 'svelte-sonner';
	import { Search, Plus } from "lucide-svelte";
	import { PUBLIC_APP_NAME } from '$env/static/public';
	
	// Components
	import CategoryGrid from "$lib/components/organisms/CategoryGrid.svelte";
	import CategoryForm from "$lib/components/organisms/CategoryForm.svelte";

	const categoriesQuery = useCategories();
	const createMutation = useCreateCategory();
	const updateMutation = useUpdateCategory();
	const deleteMutation = useDeleteCategory();

	// Form state
	let showForm = $state(false);
	let editingCategory = $state<{ id: string; name: string } | null>(null);
	let searchQuery = $state("");

	function openCreateForm() {
		editingCategory = null;
		showForm = true;
	}

	function startEdit(cat: Category) {
		editingCategory = { id: cat.id, name: cat.name };
		showForm = true;
	}

	function handleSubmit(name: string) {
		if (editingCategory) {
			updateMutation.mutate(
				{ id: editingCategory.id, name },
				{
					onSuccess: () => {
						toast.success("Kategori berhasil diupdate");
						showForm = false;
					},
					onError: (err: Error & { response?: { data?: { message?: string } } }) => {
						toast.error(err?.response?.data?.message || "Gagal mengupdate kategori");
					}
				}
			);
		} else {
			createMutation.mutate(
				{ name },
				{
					onSuccess: () => {
						toast.success("Kategori berhasil ditambahkan");
						showForm = false;
					},
					onError: (err: Error & { response?: { data?: { message?: string } } }) => {
						toast.error(err?.response?.data?.message || "Gagal menambahkan kategori");
					}
				}
			);
		}
	}

	function handleDelete(id: string) {
		toast('Konfirmasi Hapus', {
			description: 'Yakin ingin menghapus kategori ini?',
			duration: Infinity,
			action: {
				label: 'Ya, Hapus',
				onClick: () => {
					deleteMutation.mutate(id, {
						onSuccess: () => {
							toast.success("Kategori berhasil dihapus");
						},
						onError: (err: Error & { response?: { data?: { message?: string } } }) => {
							toast.error(err?.response?.data?.message || "Gagal menghapus kategori");
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

	let categories = $derived<Category[]>(categoriesQuery.data?.data ?? []);
	let filteredCategories = $derived(
		categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<svelte:head>
	<title>Kategori - {PUBLIC_APP_NAME} Admin</title>
</svelte:head>

<div class="relative">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
		<div>
			<h1 class="text-3xl font-bold text-gray-800 tracking-tight mb-1">Manajemen Kategori</h1>
			<p class="text-sm text-gray-500">Atur pengelompokan produk pet shop Anda.</p>
		</div>
		<div class="flex items-center gap-3">
			<div class="relative">
				<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
					<Search size={16} />
				</span>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Cari kategori..."
					class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400 w-64 shadow-sm"
				/>
			</div>
			<button
				onclick={openCreateForm}
				class="bg-[#B91C1C] hover:bg-[#991B1B] shadow-md shadow-red-900/20 transition-all text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
			>
				<Plus size={18} /> Tambah Kategori
			</button>
		</div>
	</div>

	<CategoryGrid 
		categories={filteredCategories}
		isLoading={categoriesQuery.isLoading}
		onEdit={startEdit}
		onDelete={handleDelete}
		onCreate={openCreateForm}
	/>

	<CategoryForm 
		bind:showForm
		{editingCategory}
		onSubmit={handleSubmit}
		isPending={createMutation.isPending || updateMutation.isPending}
	/>
</div>
