<script lang="ts">
	import type { ProductListItem } from '$lib/types/product.type';
	import { BACKEND_URL } from '$lib/api/client';
	import { formatRupiah } from '$lib/utils/formatters';
	import { Image as ImageIcon, Package, AlertTriangle, Edit2, Trash2 } from 'lucide-svelte';

	let {
		products,
		isLoading,
		onEdit,
		onDelete
	} = $props<{
		products: ProductListItem[];
		isLoading: boolean;
		onEdit: (product: ProductListItem) => void;
		onDelete: (id: string) => void;
	}>();
</script>

{#if isLoading}
	<div class="flex justify-center py-20">
		<p class="text-gray-400 animate-pulse">Memuat produk...</p>
	</div>
{:else if products.length === 0}
	<div class="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
		<Package size={48} class="mx-auto text-gray-300 mb-4" />
		<p class="text-gray-500 font-medium">Tidak ada produk ditemukan.</p>
		<p class="text-sm text-gray-400 mt-1">Coba sesuaikan pencarian atau tambah produk baru.</p>
	</div>
{:else}
	<div class="overflow-x-auto pb-6 border-b border-gray-100">
		<table class="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-y-2">
			<thead>
				<tr class="text-gray-500 font-semibold border-b border-gray-100">
					<th class="py-3 px-4 w-16">Gambar</th>
					<th class="py-3 px-4 font-semibold">Nama Produk</th>
					<th class="py-3 px-4 font-semibold">Kategori</th>
					<th class="py-3 px-4 font-semibold text-right">Harga</th>
					<th class="py-3 px-4 font-semibold text-center w-24">Stok</th>
					<th class="py-3 px-4 font-semibold">Varian</th>
					<th class="py-3 px-4 font-semibold text-right">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each products as product (product.id)}
					<tr class="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
						<td class="py-4 px-4">
							{#if product.imageUrl}
								<img
									src={`${BACKEND_URL}${product.imageUrl}`}
									alt={product.name}
									class="w-[52px] h-[52px] object-cover rounded-xl shadow-sm border border-gray-100"
								/>
							{:else}
								<div class="w-[52px] h-[52px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-gray-200/50">
									<ImageIcon size={20} />
								</div>
							{/if}
						</td>
						<td class="py-4 px-4 font-bold text-gray-800 text-sm whitespace-normal max-w-xs leading-snug">
							{product.name}
						</td>
						<td class="py-4 px-4 font-bold">
							<span
								class="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider
								{product.category?.name.toLowerCase() === 'makanan'
									? 'bg-[#5EEAD4] text-teal-900'
									: product.category?.name.toLowerCase() === 'mainan'
										? 'bg-[#D97706] text-white'
										: product.category?.name.toLowerCase() === 'aksesoris'
											? 'bg-[#2DD4BF] text-teal-900'
											: product.category?.name.toLowerCase() === 'kesehatan'
												? 'bg-[#FECACA] text-red-900'
												: 'bg-gray-100 text-gray-600'}"
							>
								{product.category?.name ?? '-'}
							</span>
						</td>
						<td class="py-4 px-4 text-right font-medium text-gray-800 text-sm">
							{formatRupiah(product.price)}
						</td>
						<td class="py-4 px-4 text-center">
							{#if product.stock <= 5}
								<div class="inline-flex items-center justify-center gap-1 bg-[#B91C1C] text-white px-3 py-1 rounded-full text-xs font-bold">
									<AlertTriangle size={12} strokeWidth={3} />
									{product.stock}
								</div>
							{:else}
								<div class="inline-flex items-center justify-center bg-[#E5E5E5] text-gray-700 px-4 py-1 rounded-full text-sm font-bold">
									{product.stock}
								</div>
							{/if}
						</td>
						<td class="py-4 px-4 text-gray-400 text-xs whitespace-normal max-w-[120px]">
							{#if product.variants && product.variants.length > 0}
								{product.variants.map((v: { name: string }) => v.name).join(', ')}
							{:else}
								-
							{/if}
						</td>
						<td class="py-4 px-4 text-right">
							<div class="flex justify-end gap-2">
								<button
									onclick={() => onEdit(product)}
									class="w-9 h-9 rounded-full bg-[#5EEAD4] text-teal-900 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-colors cursor-pointer"
									title="Edit"
								>
									<Edit2 size={16} />
								</button>
								<button
									onclick={() => onDelete(product.id)}
									class="w-9 h-9 rounded-full bg-[#FECACA] text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
									title="Hapus"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
