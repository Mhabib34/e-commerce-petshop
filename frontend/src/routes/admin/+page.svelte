<script lang="ts">
	import { useDashboardStats } from '$lib/queries/dashboard';
	import type { DashboardStats } from '$lib/types/dashboard.type';

	let range = $state<'7d' | '30d'>('7d');
	const statsQuery = useDashboardStats(() => range);

	function formatRupiah(num: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(num);
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
	}

	let dashData = $derived<DashboardStats | null>(statsQuery.data?.data ?? null);

	// Compute max revenue for bar chart scaling
	let maxRevenue = $derived(
		dashData?.revenueChart
			? Math.max(...dashData.revenueChart.map((r) => r.revenue), 1)
			: 1
	);
</script>

<svelte:head>
	<title>Dashboard - Let Shop Admin</title>
</svelte:head>

<div>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
		<select bind:value={range} class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
			<option value="7d">7 Hari Terakhir</option>
			<option value="30d">30 Hari Terakhir</option>
		</select>
	</div>

	{#if statsQuery.isLoading}
		<p class="text-gray-500">Memuat data...</p>
	{:else if statsQuery.isError}
		<p class="text-red-500">
			Gagal memuat data: {statsQuery.error?.message}
		</p>
	{:else if dashData}
		<!-- Stat Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			<div class="bg-white rounded-lg border border-gray-200 p-5">
				<p class="text-sm text-gray-500 mb-1">Total Pesanan</p>
				<p class="text-2xl font-bold text-gray-800">
					{dashData.stats.totalOrders}
				</p>
			</div>
			<div class="bg-white rounded-lg border border-gray-200 p-5">
				<p class="text-sm text-gray-500 mb-1">Total Revenue</p>
				<p class="text-2xl font-bold text-gray-800">
					{formatRupiah(dashData.stats.totalRevenue)}
				</p>
			</div>
			<div class="bg-white rounded-lg border border-gray-200 p-5">
				<p class="text-sm text-gray-500 mb-1">Total Produk</p>
				<p class="text-2xl font-bold text-gray-800">
					{dashData.stats.totalProducts}
				</p>
			</div>
			<div class="bg-white rounded-lg border border-gray-200 p-5">
				<p class="text-sm text-gray-500 mb-1">Total Customer</p>
				<p class="text-2xl font-bold text-gray-800">
					{dashData.stats.totalCustomers}
				</p>
			</div>
		</div>

		<!-- Revenue Chart (Simple Bar Chart) -->
		<div class="bg-white rounded-lg border border-gray-200 p-5">
			<h2 class="text-lg font-semibold text-gray-800 mb-4">
				Grafik Revenue ({range === '7d' ? '7 Hari Terakhir' : '30 Hari Terakhir'})
			</h2>
			{#if dashData.revenueChart && dashData.revenueChart.length > 0}
				<div class="flex items-end gap-2 h-48">
					{#each dashData.revenueChart as item (item.date)}
						<div class="flex-1 flex flex-col items-center justify-end h-full">
							<div class="text-xs text-gray-500 mb-1 whitespace-nowrap">
								{formatRupiah(item.revenue)}
							</div>
							<div
								class="w-full bg-blue-500 rounded-t-md min-h-[4px]"
								style="height: {(item.revenue / maxRevenue) * 100}%"
							></div>
							<div class="text-xs text-gray-500 mt-1">
								{formatDate(item.date)}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-gray-400 text-sm">Belum ada data revenue.</p>
			{/if}
		</div>

		<!-- Recent Orders -->
		{#if dashData.recentOrders && dashData.recentOrders.length > 0}
			<div class="bg-white rounded-lg border border-gray-200 p-5 mt-6">
				<h2 class="text-lg font-semibold text-gray-800 mb-4">Pesanan Terbaru</h2>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-200 bg-gray-50">
							<th class="text-left px-4 py-2 text-gray-600 font-medium">Customer</th>
							<th class="text-right px-4 py-2 text-gray-600 font-medium">Total</th>
							<th class="text-left px-4 py-2 text-gray-600 font-medium">Status</th>
							<th class="text-left px-4 py-2 text-gray-600 font-medium">Tanggal</th>
						</tr>
					</thead>
					<tbody>
						{#each dashData.recentOrders as order (order.id)}
							<tr class="border-b border-gray-100">
								<td class="px-4 py-2">{order.user?.name ?? '-'}</td>
								<td class="px-4 py-2 text-right">{formatRupiah(order.totalPrice)}</td>
								<td class="px-4 py-2">
									<span class="px-2 py-0.5 rounded-full text-xs font-medium
										{order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
										order.status === 'DIPROSES' ? 'bg-blue-100 text-blue-800' :
										'bg-green-100 text-green-800'}">
										{order.status}
									</span>
								</td>
								<td class="px-4 py-2 text-gray-500 text-xs">
									{formatDate(order.createdAt)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
