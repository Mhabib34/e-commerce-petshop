<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	let {
		meta,
		limit = 10,
		currentPage = $bindable(1)
	} = $props<{
		meta: { page: number; total: number; totalPages: number } | undefined | null;
		limit?: number;
		currentPage: number;
	}>();
</script>

<div class="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm font-medium text-gray-400 px-2">
	<div>
		Menampilkan {(meta?.page ?? 1) * limit - limit + 1}-{Math.min(
			(meta?.page ?? 1) * limit,
			meta?.total ?? 0
		)} dari {meta?.total ?? 0} data
	</div>

	{#if meta && meta.totalPages > 1}
		<div class="flex gap-2 mt-4 sm:mt-0">
			<button
				onclick={() => (currentPage = Math.max(1, currentPage - 1))}
				disabled={currentPage <= 1}
				class="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
			>
				<ChevronLeft size={16} />
			</button>
			{#each Array(Math.min(3, meta.totalPages)) as idx (idx)}
				{@const i = idx}
				<button
					onclick={() => (currentPage = i + 1)}
					class="w-8 h-8 rounded flex items-center justify-center font-bold transition-colors cursor-pointer {currentPage ===
					i + 1
						? 'bg-[#EF4444] text-white border-transparent'
						: 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}"
				>
					{i + 1}
				</button>
			{/each}
			{#if meta.totalPages > 3}
				<span class="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
				<button
					onclick={() => (currentPage = meta.totalPages)}
					class="w-8 h-8 rounded flex items-center justify-center font-bold transition-colors cursor-pointer {currentPage ===
					meta.totalPages
						? 'bg-[#EF4444] text-white border-transparent'
						: 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}"
				>
					{meta.totalPages}
				</button>
			{/if}
			<button
				onclick={() => (currentPage = Math.min(meta.totalPages, currentPage + 1))}
				disabled={currentPage >= meta.totalPages}
				class="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed bg-white"
			>
				<ChevronRight size={16} />
			</button>
		</div>
	{/if}
</div>
