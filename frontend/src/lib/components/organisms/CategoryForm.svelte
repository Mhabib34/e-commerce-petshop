<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import { backOut } from "svelte/easing";
	import { X } from "lucide-svelte";
	import { toast } from 'svelte-sonner';

	let {
		showForm = $bindable(false),
		editingCategory,
		onSubmit,
		isPending
	} = $props<{
		showForm: boolean;
		editingCategory: { id: string; name: string } | null;
		onSubmit: (name: string) => void;
		isPending: boolean;
	}>();

	let formName = $state("");

	$effect(() => {
		if (showForm) {
			if (editingCategory) {
				formName = editingCategory.name;
			} else {
				formName = "";
			}
		}
	});

	function closeForm() {
		showForm = false;
	}

	function handleSubmit() {
		if (!formName.trim()) {
			toast.error("Nama kategori tidak boleh kosong");
			return;
		}
		onSubmit(formName.trim());
	}
</script>

{#if showForm}
	<!-- Backdrop -->
	<div transition:fade={{ duration: 250 }} class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"></div>
	
	<!-- Modal -->
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
		<div transition:scale={{ duration: 400, start: 0.9, easing: backOut }} class="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
			<!-- Header -->
			<div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
				<h2 class="text-xl font-bold text-gray-800 tracking-tight">
					{editingCategory ? "Edit Kategori" : "Tambah Kategori"}
				</h2>
				<button onclick={closeForm} class="text-gray-400 hover:text-gray-800 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100">
					<X size={20} />
				</button>
			</div>

			<!-- Body -->
			<div class="p-8 overflow-y-auto bg-gray-50/30">
				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6" id="category-form">
					<div>
						<label for="cat-name" class="block text-sm font-semibold text-gray-700 mb-2">Nama Kategori</label>
						<!-- svelte-ignore a11y_autofocus -->
						<input 
							id="cat-name" 
							type="text" 
							bind:value={formName} 
							class="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm" 
							placeholder="Contoh: Makanan Kucing" 
							autofocus
						/>
					</div>
				</form>
			</div>

			<!-- Footer -->
			<div class="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-3xl">
				<button type="button" onclick={closeForm} class="px-6 py-2.5 rounded-full text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
					Batal
				</button>
				<button
					type="submit"
					form="category-form"
					disabled={isPending}
					class="bg-[#FF6B6B] hover:bg-[#FF5252] shadow-md shadow-[#FF6B6B]/20 text-white px-8 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isPending ? "Menyimpan..." : editingCategory ? "Simpan Perubahan" : "Simpan Kategori"}
				</button>
			</div>
		</div>
	</div>
{/if}
