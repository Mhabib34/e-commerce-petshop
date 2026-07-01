<script lang="ts">
	import type { Category } from "$lib/types/category.type";
	import { Plus, Edit2, Trash2, PawPrint, Bone, Home, Syringe, Scissors, Tag } from "lucide-svelte";

	let {
		categories,
		isLoading,
		onEdit,
		onDelete,
		onCreate
	} = $props<{
		categories: Category[];
		isLoading: boolean;
		onEdit: (cat: Category) => void;
		onDelete: (id: string) => void;
		onCreate: () => void;
	}>();

	function getCategoryStyle(name: string) {
		const n = name.toLowerCase();
		if (n.includes('makanan')) return { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', iconBg: 'bg-white', iconColor: 'text-[#92400E]' };
		if (n.includes('mainan')) return { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]', iconBg: 'bg-white', iconColor: 'text-[#0F766E]' };
		if (n.includes('kandang') || n.includes('bedding')) return { bg: 'bg-[#FCE7F3]', text: 'text-[#9D174D]', iconBg: 'bg-white', iconColor: 'text-[#9D174D]' };
		if (n.includes('obat') || n.includes('vitamin')) return { bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]', iconBg: 'bg-white', iconColor: 'text-[#6B21A8]' };
		if (n.includes('grooming')) return { bg: 'bg-[#ECFDF5]', text: 'text-[#047857]', iconBg: 'bg-white', iconColor: 'text-[#047857]' };
		return { bg: 'bg-gray-100', text: 'text-gray-800', iconBg: 'bg-white', iconColor: 'text-gray-500' };
	}

	function getCategoryIcon(name: string) {
		const n = name.toLowerCase();
		if (n.includes('makanan')) return PawPrint;
		if (n.includes('mainan')) return Bone;
		if (n.includes('kandang') || n.includes('bedding')) return Home;
		if (n.includes('obat') || n.includes('vitamin')) return Syringe;
		if (n.includes('grooming')) return Scissors;
		return Tag;
	}
</script>

{#if isLoading}
	<div class="flex justify-center py-20">
		<p class="text-gray-400 animate-pulse">Memuat kategori...</p>
	</div>
{:else}
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
		{#each categories as cat (cat.id)}
			{@const style = getCategoryStyle(cat.name)}
			{@const IconComp = getCategoryIcon(cat.name)}
			<div class="{style.bg} rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm relative group overflow-hidden transition-transform hover:-translate-y-1">
				<!-- Hover Actions -->
				<div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<button 
						onclick={(e) => { e.stopPropagation(); onEdit(cat); }}
						class="w-8 h-8 rounded-full bg-white/80 backdrop-blur text-gray-700 flex items-center justify-center hover:bg-white hover:text-blue-600 shadow-sm transition-colors cursor-pointer"
						title="Edit"
					>
						<Edit2 size={14} />
					</button>
					<button 
						onclick={(e) => { e.stopPropagation(); onDelete(cat.id); }}
						class="w-8 h-8 rounded-full bg-white/80 backdrop-blur text-gray-700 flex items-center justify-center hover:bg-white hover:text-red-600 shadow-sm transition-colors cursor-pointer"
						title="Hapus"
					>
						<Trash2 size={14} />
					</button>
				</div>

				<div class="w-16 h-16 rounded-full {style.iconBg} {style.iconColor} flex items-center justify-center mb-4 shadow-sm">
					<IconComp size={32} strokeWidth={2.5} />
				</div>
				<h3 class="text-lg font-bold {style.text} leading-tight mb-2 px-2">
					{cat.name}
				</h3>
				<p class="{style.text} opacity-70 text-xs font-semibold">
					{cat._count?.products || 0} Produk
				</p>
			</div>
		{/each}

		<!-- Add New Card -->
		<button 
			onclick={onCreate}
			class="border-2 border-dashed border-[#E5D5C5] hover:border-[#D4A48A] hover:bg-white/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[200px]"
		>
			<div class="w-14 h-14 rounded-full bg-[#F4E6DB] text-[#D4A48A] flex items-center justify-center mb-4">
				<Plus size={28} strokeWidth={2.5} />
			</div>
			<h3 class="text-lg font-bold text-[#D4A48A]">
				Tambah Baru
			</h3>
		</button>
	</div>
{/if}
