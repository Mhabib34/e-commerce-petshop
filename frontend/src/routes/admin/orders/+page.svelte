<script lang="ts">
	import { useAdminOrders } from '$lib/queries/order';
	import type { Order, OrderStatus } from '$lib/types/order.type';
	import { Search, Calendar, Download } from 'lucide-svelte';
	import OrderDetailSlideover from './OrderDetailSlideover.svelte';
	import { toast } from 'svelte-sonner';
	
	// Components
	import OrderTable from '$lib/components/organisms/OrderTable.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import { useUpdateOrderStatus } from '$lib/mutations/order';
	import { PUBLIC_APP_NAME } from '$env/static/public';

	let statusFilter = $state<OrderStatus | ''>('');
	let search = $state('');
	let currentPage = $state(1);
	const limit = 10;

	const ordersQuery = useAdminOrders(() => ({
		status: statusFilter || undefined,
		page: currentPage,
		limit
	}));

	let orders = $derived<Order[]>(ordersQuery.data?.data ?? []);
	let meta = $derived(ordersQuery.data?.meta);

	const updateStatusMutation = useUpdateOrderStatus();

	function handleUpdateStatus(id: string, status: OrderStatus) {
		updateStatusMutation.mutate(
			{ id, status },
			{
				onSuccess: () => {
					toast.success('Status pesanan berhasil diperbarui');
					if (selectedOrder && selectedOrder.id === id) {
						selectedOrder = { ...selectedOrder, status };
					}
				},
				onError: (err: Error & { response?: { data?: { message?: string } } }) => {
					toast.error(err?.response?.data?.message || 'Gagal memperbarui status');
				}
			}
		);
	}

	// Slideover
	let slideoverOpen = $state(false);
	let selectedOrder = $state<Order | null>(null);

	function viewOrder(order: Order) {
		selectedOrder = order;
		slideoverOpen = true;
	}

	function exportToCSV() {
		const ordersData = ordersQuery.data?.data || [];
		if (ordersData.length === 0) {
			toast.error('Tidak ada data untuk di-export');
			return;
		}

		// Import the date formatter just for CSV logic
		// This avoids keeping duplicate logic in the page component
		import('$lib/utils/formatters').then(({ formatDate }) => {
			const headers = ['ID Pesanan', 'Tanggal', 'Pelanggan', 'Status', 'Total (Rp)'];
			const csvContent = [
				headers.join(','),
				...ordersData.map((order: Order) =>
					[
						order.id,
						`"${formatDate(order.createdAt)}"`,
						`"${order.user.name}"`,
						order.status,
						order.totalPrice
					].join(',')
				)
			].join('\n');

			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			const url = URL.createObjectURL(blob);
			link.setAttribute('href', url);
			link.setAttribute('download', `pesanan_petshop_${new Date().toISOString().split('T')[0]}.csv`);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});
	}
</script>

<svelte:head>
	<title>Pesanan - {PUBLIC_APP_NAME} Admin</title>
</svelte:head>

<div class="relative">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-bold text-gray-800 tracking-tight">Pesanan</h1>
		<div class="relative">
			<span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
				<Search size={16} />
			</span>
			<input
				type="text"
				bind:value={search}
				placeholder="Cari ID/Customer..."
				class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B] transition-all placeholder-gray-400 w-64 shadow-sm"
			/>
		</div>
	</div>

	<!-- Top Actions / Tabs -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
		<!-- Tabs -->
		<div class="flex bg-gray-100 p-1 rounded-xl w-fit">
			<button
				onclick={() => {
					statusFilter = '';
					currentPage = 1;
				}}
				class="px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer
                {statusFilter === ''
					? 'bg-white text-gray-800 shadow-sm'
					: 'text-gray-500 hover:text-gray-700'}"
			>
				Semua
			</button>
			<button
				onclick={() => {
					statusFilter = 'PENDING';
					currentPage = 1;
				}}
				class="px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2
                {statusFilter === 'PENDING'
					? 'bg-white text-yellow-600 shadow-sm'
					: 'text-gray-500 hover:text-yellow-600'}"
			>
				Pending
			</button>
			<button
				onclick={() => {
					statusFilter = 'DIPROSES';
					currentPage = 1;
				}}
				class="px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2
                {statusFilter === 'DIPROSES'
					? 'bg-white text-blue-600 shadow-sm'
					: 'text-gray-500 hover:text-blue-600'}"
			>
				Diproses
			</button>
			<button
				onclick={() => {
					statusFilter = 'SELESAI';
					currentPage = 1;
				}}
				class="px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2
                {statusFilter === 'SELESAI'
					? 'bg-white text-green-600 shadow-sm'
					: 'text-gray-500 hover:text-green-600'}"
			>
				Selesai
			</button>
		</div>

		<div class="flex gap-3">
			<button class="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm">
				<Calendar size={16} /> Pilih Tanggal
			</button>
			<button
				onclick={exportToCSV}
				class="flex items-center gap-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
			>
				<Download size={16} /> Export CSV
			</button>
		</div>
	</div>

	<!-- Orders Table Container -->
	<div class="bg-[#FCF9F7] rounded-3xl p-8 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-[#F4E1D2]/50">
		<OrderTable 
			{orders}
			isLoading={ordersQuery.isLoading}
			onView={viewOrder}
		/>

		<Pagination {meta} bind:currentPage />
	</div>

	<OrderDetailSlideover 
		bind:isOpen={slideoverOpen} 
		order={selectedOrder} 
		onUpdateStatus={handleUpdateStatus}
		isUpdating={updateStatusMutation.isPending}
	/>
</div>
