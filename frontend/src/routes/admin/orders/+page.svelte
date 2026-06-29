<script lang="ts">
	import { useAdminOrders } from '$lib/queries/order';
	import { useUpdateOrderStatus } from '$lib/mutations/order';
	import type { Order, OrderStatus } from '$lib/types/order.type';

	let statusFilter = $state<OrderStatus | ''>('');
	let currentPage = $state(1);
	const limit = 10;

	const ordersQuery = useAdminOrders(() => ({
		status: statusFilter || undefined,
		page: currentPage,
		limit
	}));

	const updateStatusMutation = useUpdateOrderStatus();

	let errorMsg = $state('');
	let successMsg = $state('');

	function clearMessages() {
		errorMsg = '';
		successMsg = '';
	}

	function handleStatusChange(orderId: string, newStatus: OrderStatus) {
		clearMessages();
		updateStatusMutation.mutate(
			{ id: orderId, status: newStatus },
			{
				onSuccess: () => {
					successMsg = 'Status pesanan berhasil diupdate';
				},
				onError: (err: Error & { response?: { data?: { message?: string } } }) => {
					errorMsg = err?.response?.data?.message || 'Gagal mengupdate status';
				}
			}
		);
	}

	function formatRupiah(num: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(num);
	}

	function formatDateTime(dateStr: string): string {
		return new Date(dateStr).toLocaleString('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function statusColor(status: OrderStatus): string {
		switch (status) {
			case 'PENDING':
				return 'bg-yellow-100 text-yellow-800';
			case 'DIPROSES':
				return 'bg-blue-100 text-blue-800';
			case 'SELESAI':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	// Next valid statuses
	function getNextStatuses(current: OrderStatus): OrderStatus[] {
		switch (current) {
			case 'PENDING':
				return ['DIPROSES'];
			case 'DIPROSES':
				return ['SELESAI'];
			case 'SELESAI':
				return [];
			default:
				return [];
		}
	}

	let orders = $derived<Order[]>(ordersQuery.data?.data ?? []);
	let meta = $derived(ordersQuery.data?.meta);

	// Expanded order details
	let expandedOrderId = $state<string | null>(null);

	function toggleExpand(id: string) {
		expandedOrderId = expandedOrderId === id ? null : id;
	}
</script>

<svelte:head>
	<title>Pesanan - Let Shop Admin</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-gray-800 mb-6">Kelola Pesanan</h1>

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

	<!-- Filter -->
	<div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
		<select bind:value={statusFilter} class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
			<option value="">Semua Status</option>
			<option value="PENDING">Pending</option>
			<option value="DIPROSES">Diproses</option>
			<option value="SELESAI">Selesai</option>
		</select>
	</div>

	<!-- Orders Table -->
	<div class="bg-white rounded-lg border border-gray-200">
		{#if ordersQuery.isLoading}
			<p class="p-5 text-gray-500">Memuat pesanan...</p>
		{:else if orders.length === 0}
			<p class="p-5 text-gray-400">Tidak ada pesanan ditemukan.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-200 bg-gray-50">
							<th class="text-left px-5 py-3 text-gray-600 font-medium">Order ID</th>
							<th class="text-left px-5 py-3 text-gray-600 font-medium">Customer</th>
							<th class="text-right px-5 py-3 text-gray-600 font-medium">Total</th>
							<th class="text-left px-5 py-3 text-gray-600 font-medium">Pembayaran</th>
							<th class="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
							<th class="text-left px-5 py-3 text-gray-600 font-medium">Tanggal</th>
							<th class="text-right px-5 py-3 text-gray-600 font-medium">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each orders as order (order.id)}
							<tr
								class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
								onclick={() => toggleExpand(order.id)}
							>
								<td class="px-5 py-3 font-mono text-xs">{order.id.slice(0, 8)}...</td>
								<td class="px-5 py-3">
									<div class="font-medium text-gray-800">
										{order.user?.name ?? '-'}
									</div>
									<div class="text-xs text-gray-400">
										{order.user?.email ?? ''}
									</div>
								</td>
								<td class="px-5 py-3 text-right font-medium">{formatRupiah(order.totalPrice)}</td>
								<td class="px-5 py-3 text-gray-500">{order.paymentMethod}</td>
								<td class="px-5 py-3">
									<span
										class="px-2 py-1 rounded-full text-xs font-medium {statusColor(order.status)}"
									>
										{order.status}
									</span>
								</td>
								<td class="px-5 py-3 text-gray-500 text-xs">{formatDateTime(order.createdAt)}</td>
								<td class="px-5 py-3 text-right" onclick={(e) => e.stopPropagation()}>
									{#each getNextStatuses(order.status) as nextStatus (nextStatus)}
										<button
											onclick={() => handleStatusChange(order.id, nextStatus)}
											disabled={updateStatusMutation.isPending}
											class="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer disabled:opacity-50"
										>
											→ {nextStatus}
										</button>
									{/each}
									{#if getNextStatuses(order.status).length === 0}
										<span class="text-gray-400 text-xs">Selesai</span>
									{/if}
								</td>
							</tr>

							<!-- Expanded Detail -->
							{#if expandedOrderId === order.id}
								<tr class="bg-gray-50">
									<td colspan={7} class="px-5 py-4">
										<div class="mb-2">
											<strong class="text-sm text-gray-700">Alamat Pengiriman:</strong>
											<span class="text-sm text-gray-600">
												{order.shippingAddress}
											</span>
										</div>
										<strong class="text-sm text-gray-700">Item Pesanan:</strong>
										<div class="mt-1 space-y-1">
											{#each order.items as item (item.id)}
												<div
													class="flex justify-between text-sm text-gray-600 bg-white p-2 rounded"
												>
													<span>
														{item.variant?.product?.name ?? '-'}
														({item.variant?.name ?? '-'}) × {item.quantity}
													</span>
													<span class="font-medium">
														{formatRupiah(item.price * item.quantity)}
													</span>
												</div>
											{/each}
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if meta && meta.totalPages > 1}
				<div class="flex items-center justify-between px-5 py-3 border-t border-gray-200">
					<span class="text-sm text-gray-500">
						Halaman {meta.page} dari {meta.totalPages} ({meta.total}
						pesanan)
					</span>
					<div class="flex gap-2">
						<button
							onclick={() => (currentPage = Math.max(1, currentPage - 1))}
							disabled={currentPage <= 1}
							class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 cursor-pointer disabled:cursor-default"
						>
							Prev
						</button>
						<button
							onclick={() => (currentPage = Math.min(meta.totalPages, currentPage + 1))}
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
