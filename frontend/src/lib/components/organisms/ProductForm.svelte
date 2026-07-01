<script lang="ts">
	import type { ProductListItem } from '$lib/types/product.type';
	import type { Category } from '$lib/types/category.type';
	import { BACKEND_URL } from '$lib/api/client';
	import { toast } from 'svelte-sonner';
	import { X, CloudUpload, PawPrint, Layers, Plus, Trash2 } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	let {
		showForm = $bindable(false),
		editingProduct,
		categories,
		onSubmit,
		isPending
	} = $props<{
		showForm: boolean;
		editingProduct: ProductListItem | null;
		categories: Category[];
		onSubmit: (fd: FormData) => void;
		isPending: boolean;
	}>();

	// Local state
	let formName = $state('');
	let formDescription = $state('');
	let formPrice = $state(0);
	let formStock = $state(0);
	let formCategoryId = $state('');
	let formImage = $state<File | null>(null);
	let imagePreviewUrl = $state<string | null>(null);
	let formVariants = $state<{ name: string; price: number; stock: number }[]>([]);

	// Initialize form when editingProduct or showForm changes
	$effect(() => {
		if (showForm) {
			if (editingProduct) {
				formName = editingProduct.name;
				formDescription = '';
				formPrice = editingProduct.price;
				formStock = editingProduct.stock;
				formCategoryId = editingProduct.category?.id ?? '';
				formImage = null;
				if (imagePreviewUrl) {
					URL.revokeObjectURL(imagePreviewUrl);
					imagePreviewUrl = null;
				}
				if (editingProduct.imageUrl) {
					imagePreviewUrl = `${BACKEND_URL}${editingProduct.imageUrl}`;
				}
				formVariants = [];
			} else {
				// Reset form for create
				formName = '';
				formDescription = '';
				formPrice = 0;
				formStock = 0;
				formCategoryId = '';
				formImage = null;
				if (imagePreviewUrl) {
					URL.revokeObjectURL(imagePreviewUrl);
					imagePreviewUrl = null;
				}
				formVariants = [];
			}
		}
	});

	function closeForm() {
		showForm = false;
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			formImage = target.files[0];
			if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
			imagePreviewUrl = URL.createObjectURL(formImage);
		}
	}

	function removeImage() {
		formImage = null;
		if (imagePreviewUrl) {
			URL.revokeObjectURL(imagePreviewUrl);
			imagePreviewUrl = null;
		}
	}

	function addVariant() {
		formVariants = [...formVariants, { name: '', price: 0, stock: 0 }];
	}

	function removeVariant(index: number) {
		formVariants = formVariants.filter((_, i) => i !== index);
	}

	function handleSubmit() {
		if (!formName.trim()) {
			toast.error('Nama produk wajib diisi');
			return;
		}
		if (!formCategoryId) {
			toast.error('Kategori wajib dipilih');
			return;
		}

		const fd = new FormData();
		fd.append('name', formName.trim());
		fd.append('description', formDescription.trim());
		fd.append('price', String(formPrice));
		fd.append('stock', String(formStock));
		fd.append('categoryId', formCategoryId);
		if (formImage) {
			fd.append('image', formImage);
		}
		if (formVariants.length > 0) {
			fd.append('variants', JSON.stringify(formVariants));
		}

		onSubmit(fd);
	}
</script>

{#if showForm}
	<!-- Backdrop -->
	<div
		transition:fade={{ duration: 250 }}
		class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
	></div>

	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
		<div
			transition:scale={{ duration: 400, start: 0.9, easing: backOut }}
			class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
		>
			<!-- Header -->
			<div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
				<h2 class="text-xl font-bold text-gray-800 tracking-tight">
					{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
				</h2>
				<button
					onclick={closeForm}
					class="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 rounded-full hover:bg-gray-200/50"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Body -->
			<div class="p-8 overflow-y-auto">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					class="flex flex-col gap-8"
					id="product-form"
				>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
						<!-- Left Col: Image Upload -->
						<div class="flex flex-col">
							<label for="prod-image" class="block text-sm font-semibold text-gray-700 mb-3">Foto Produk</label>
							<div class="relative flex-1 border-2 border-dashed border-[#F4E1D2] hover:border-[#FF6B6B] rounded-[32px] bg-[#FEFDFB] transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden min-h-[320px]">
								<input
									id="prod-image"
									type="file"
									accept="image/jpeg,image/png"
									onchange={handleFileChange}
									class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
								/>
								{#if imagePreviewUrl}
									<img src={imagePreviewUrl} alt="Preview" class="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
									<button
										type="button"
										onclick={(e) => { e.stopPropagation(); removeImage(); }}
										class="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
									>
										<Trash2 size={18} />
									</button>
								{:else if formImage}
									<div class="text-sm font-bold text-gray-800 z-10 pointer-events-none">{formImage.name}</div>
								{:else}
									<div class="w-16 h-16 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mb-4 z-10 pointer-events-none">
										<CloudUpload size={32} />
									</div>
									<span class="text-base font-bold text-[#DC2626] z-10 pointer-events-none">Klik atau Seret Foto</span>
									<span class="text-xs text-gray-500 font-medium mt-1 z-10 pointer-events-none">Maksimal 5MB, format JPG atau PNG</span>
								{/if}
								
								<!-- Paw Watermark -->
								<div class="absolute -bottom-10 -right-10 text-[#F4E1D2] opacity-40 z-0 pointer-events-none">
									<PawPrint size={180} />
								</div>
							</div>
						</div>

						<!-- Right Col: Form Fields -->
						<div class="flex flex-col gap-5">
							<div>
								<label for="prod-name" class="block text-sm font-semibold text-gray-700 mb-2">Nama Produk</label>
								<input
									id="prod-name"
									type="text"
									bind:value={formName}
									class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all shadow-sm"
									placeholder="Contoh: Makanan Kucing Premium"
								/>
							</div>
							<div>
								<label for="prod-category" class="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
								<div class="relative">
									<select
										id="prod-category"
										bind:value={formCategoryId}
										class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all cursor-pointer appearance-none shadow-sm"
									>
										<option value="">Pilih Kategori</option>
										{#each categories as cat (cat.id)}
											<option value={cat.id}>{cat.name}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label for="prod-price" class="block text-sm font-semibold text-gray-700 mb-2">Harga (Rp)</label>
									<input
										id="prod-price"
										type="number"
										bind:value={formPrice}
										class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all shadow-sm"
									/>
								</div>
								<div>
									<label for="prod-stock" class="block text-sm font-semibold text-gray-700 mb-2">Stok</label>
									<input
										id="prod-stock"
										type="number"
										bind:value={formStock}
										class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all shadow-sm"
									/>
								</div>
							</div>
							<div>
								<label for="prod-desc" class="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
								<textarea
									id="prod-desc"
									bind:value={formDescription}
									rows={3}
									class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all resize-none shadow-sm"
									placeholder="Jelaskan detail produk Anda..."
								></textarea>
							</div>
						</div>
					</div>

					<!-- Variants Section -->
					<div class="pt-6 border-t border-gray-100">
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center gap-2 text-gray-700 font-bold">
								<Layers size={18} class="text-[#059669]" />
								<span>Varian Produk</span>
							</div>
							<button
								type="button"
								onclick={addVariant}
								class="bg-[#5EEAD4] text-teal-900 hover:bg-[#34D399] hover:text-teal-950 px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
							>
								<Plus size={14} /> Tambah Varian
							</button>
						</div>

						{#if formVariants.length > 0}
							<div class="bg-[#FDF8F5] border border-[#F4E1D2] rounded-2xl p-5 space-y-3">
								<div class="flex text-xs font-semibold text-gray-500 mb-1 px-1">
									<div class="flex-1">Nama Varian</div>
									<div class="w-32">Harga Tambahan</div>
									<div class="w-24">Stok</div>
									<div class="w-8"></div>
								</div>
								
								{#each formVariants as variant, i (i)}
									<div class="flex gap-3 items-center">
										<div class="flex-1">
											<input
												type="text"
												bind:value={variant.name}
												placeholder="Ukuran Kecil (2kg)"
												class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B6B]"
											/>
										</div>
										<div class="w-32">
											<input
												type="number"
												bind:value={variant.price}
												placeholder="0"
												class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B6B]"
											/>
										</div>
										<div class="w-24">
											<input
												type="number"
												bind:value={variant.stock}
												placeholder="10"
												class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#FF6B6B]"
											/>
										</div>
										<button
											type="button"
											onclick={() => removeVariant(i)}
											class="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors cursor-pointer shrink-0"
										>
											<Trash2 size={16} />
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</form>
			</div>

			<!-- Footer -->
			<div class="px-8 py-5 border-t border-gray-100 bg-[#FDF8F5] flex justify-center gap-4 rounded-b-3xl">
				<button
					type="button"
					onclick={closeForm}
					class="w-32 py-2.5 rounded-full text-sm font-bold text-gray-600 border-2 border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
				>
					Batal
				</button>
				<button
					type="submit"
					form="product-form"
					disabled={isPending}
					class="w-48 bg-[#FF6B6B] hover:bg-[#FF5252] shadow-md shadow-[#FF6B6B]/20 text-white py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isPending
						? 'Menyimpan...'
						: editingProduct
							? 'Simpan Perubahan'
							: 'Simpan Produk'}
				</button>
			</div>
		</div>
	</div>
{/if}
