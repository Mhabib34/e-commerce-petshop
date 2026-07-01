<script lang="ts">
	import { useDashboardStats } from '$lib/queries/dashboard';
	import type { DashboardStats } from '$lib/types/dashboard.type';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import { formatRupiah } from '$lib/utils/formatters';

	let range = $state<'7d' | '30d'>('7d');
	const statsQuery = useDashboardStats(() => range);



	let dashData = $derived<DashboardStats | null>(statsQuery.data?.data ?? null);



	// Compute total orders for percentage calculations
	let totalOrdersByStatus = $derived(
		dashData?.stats
			? (dashData.stats.totalOrders || 1)
			: 1
	);

	// Generate SVG path for area chart
	function generateChartPath(data: { date: string; revenue: number }[], width: number, height: number): { linePath: string; areaPath: string; points: { x: number; y: number; revenue: number; date: string }[] } {
		if (!data || data.length === 0) return { linePath: '', areaPath: '', points: [] };
		
		const padding = 0;
		const chartWidth = width - padding * 2;
		const chartHeight = height - padding * 2;
		const max = Math.max(...data.map(d => d.revenue), 1);
		
		const points = data.map((d, i) => ({
			x: padding + (i / (data.length - 1 || 1)) * chartWidth,
			y: padding + chartHeight - (d.revenue / max) * chartHeight,
			revenue: d.revenue,
			date: d.date
		}));

		// Create smooth curve using bezier
		let linePath = `M ${points[0].x} ${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1];
			const curr = points[i];
			const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
			const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
			linePath += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
		}

		const areaPath = linePath + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

		return { linePath, areaPath, points };
	}

	// Order status data derived from API
	let orderStatusData = $derived(() => {
		if (!dashData) return [];
		const statuses = [
			{ key: 'PENDING', label: 'PENDING', color: '#E8A838', bgColor: '#FEF3C7', count: 0 },
			{ key: 'DIPROSES', label: 'DIPROSES', color: '#3B9B7A', bgColor: '#D1FAE5', count: 0 },
			{ key: 'SELESAI', label: 'SELESAI', color: '#DC6B4A', bgColor: '#FEE2E2', count: 0 },
		];
		
		// Use ordersByStatus from API if available
		if (dashData.stats && 'ordersByStatus' in dashData.stats) {
			const obs = (dashData.stats as Record<string, Record<string, number>>).ordersByStatus;
			statuses[0].count = obs?.PENDING ?? 0;
			statuses[1].count = obs?.DIPROSES ?? 0;
			statuses[2].count = obs?.SELESAI ?? 0;
		}
		
		return statuses;
	});

</script>

<svelte:head>
	<title>Dashboard - {PUBLIC_APP_NAME} Admin</title>
	<meta name="description" content="Panel dashboard admin {PUBLIC_APP_NAME} untuk memantau pesanan, revenue, dan produk." />
</svelte:head>

<div class="dashboard">
	<h1 class="page-title">Dashboard</h1>

	{#if statsQuery.isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Memuat data dashboard...</p>
		</div>
	{:else if statsQuery.isError}
		<div class="error-state">
			<p>Gagal memuat data: {statsQuery.error?.message}</p>
		</div>
	{:else if dashData}
		<!-- Stat Cards -->
		<div class="stat-cards">
			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Total Orders</span>
					<div class="stat-icon" style="background: #FEF2E8; color: #D4634E;">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
							<line x1="3" y1="6" x2="21" y2="6"/>
							<path d="M16 10a4 4 0 01-8 0"/>
						</svg>
					</div>
				</div>
				<div class="stat-bottom">
					<div class="stat-value">{dashData.stats.totalOrders.toLocaleString('id-ID')}</div>
					<div class="stat-indicator positive">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
						<span>12.5%</span>
					</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Revenue</span>
					<div class="stat-icon" style="background: #E8F5E9; color: #4CAF50;">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="12" y1="1" x2="12" y2="23"/>
							<path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
						</svg>
					</div>
				</div>
				<div class="stat-bottom">
					<div class="stat-value stat-value-small">{formatRupiah(dashData.stats.totalRevenue)}</div>
					<div class="stat-indicator positive">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
						<span>24.8%</span>
					</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Products</span>
					<div class="stat-icon" style="background: #E3F2FD; color: #2196F3;">
						<svg viewBox="0 0 40 40" fill="none" width="20" height="20">
							<ellipse cx="12" cy="8" rx="4" ry="4.5" fill="currentColor" opacity="0.7"/>
							<ellipse cx="28" cy="8" rx="4" ry="4.5" fill="currentColor" opacity="0.7"/>
							<ellipse cx="7" cy="18" rx="3" ry="3.5" fill="currentColor" opacity="0.7"/>
							<ellipse cx="33" cy="18" rx="3" ry="3.5" fill="currentColor" opacity="0.7"/>
							<ellipse cx="20" cy="22" rx="8.5" ry="9" fill="currentColor"/>
						</svg>
					</div>
				</div>
				<div class="stat-bottom">
					<div class="stat-value">{dashData.stats.totalProducts.toLocaleString('id-ID')} <span class="stat-unit">Item</span></div>
					<div class="stat-indicator positive">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
						<span>4.2%</span>
					</div>
				</div>
			</div>

			<div class="stat-card">
				<div class="stat-header">
					<span class="stat-label">Customers</span>
					<div class="stat-icon" style="background: #FFF8E1; color: #FF9800;">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
							<path d="M23 21v-2a4 4 0 00-3-3.87"/>
							<path d="M16 3.13a4 4 0 010 7.75"/>
						</svg>
					</div>
				</div>
				<div class="stat-bottom">
					<div class="stat-value">{dashData.stats.totalCustomers.toLocaleString('id-ID')} <span class="stat-unit">Users</span></div>
					<div class="stat-indicator negative">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
						<span>1.5%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Chart + Status Section -->
		<div class="chart-status-row">
			<!-- Revenue Chart -->
			<div class="chart-card">
				<div class="chart-header">
					<h2>Grafik Pendapatan</h2>
					<div class="chart-dropdown">
						<select bind:value={range}>
							<option value="7d">Terakhir 7 Hari</option>
							<option value="30d">Terakhir 30 Hari</option>
						</select>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<path d="M6 9l6 6 6-6"/>
						</svg>
					</div>
				</div>

				{#if dashData.revenueChart && dashData.revenueChart.length > 0}
					{@const chartData = generateChartPath(dashData.revenueChart, 600, 200)}
					<div class="chart-container">
						<svg viewBox="0 0 600 240" preserveAspectRatio="none" class="chart-svg">
							<!-- Grid lines -->
							{#each [0, 50, 100, 150, 200] as y (y)}
								<line x1="0" y1={y} x2="600" y2={y} stroke="#F5EDE7" stroke-width="1" stroke-dasharray="4,4"/>
							{/each}

							<!-- Area fill -->
							<defs>
								<linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stop-color="#D4634E" stop-opacity="0.2"/>
									<stop offset="100%" stop-color="#D4634E" stop-opacity="0.02"/>
								</linearGradient>
							</defs>
							<path d={chartData.areaPath} fill="url(#areaGradient)"/>
							
							<!-- Line -->
							<path d={chartData.linePath} fill="none" stroke="#D4634E" stroke-width="2.5" stroke-linecap="round"/>

							<!-- Data points -->
							{#each chartData.points as point (point.x)}
								<circle cx={point.x} cy={point.y} r="4" fill="#D4634E" stroke="white" stroke-width="2" class="chart-dot"/>
							{/each}
						</svg>

						<!-- X-axis labels -->
						<div class="chart-labels">
							{#each dashData.revenueChart as item, i (item.date)}
								<span style="left: {(i / (dashData.revenueChart.length - 1 || 1)) * 100}%">
									{new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
								</span>
							{/each}
						</div>
					</div>
				{:else}
					<div class="chart-empty">
						<p>Belum ada data pendapatan.</p>
					</div>
				{/if}
			</div>

			<!-- Order Status Panel -->
			<div class="status-card">
				<h2>Pesanan berdasarkan Status</h2>

				<div class="status-list">
					{#each orderStatusData() as status (status.key)}
						{@const percentage = totalOrdersByStatus > 0 ? Math.round((status.count / totalOrdersByStatus) * 100) : 0}
						<div class="status-item">
							<div class="status-label-row">
								<span class="status-name">{status.label}</span>
								<span class="status-count" style="color: {status.color};">{status.count} Pesanan ({percentage}%)</span>
							</div>
							<div class="status-bar-bg">
								<div 
									class="status-bar-fill" 
									style="width: {percentage}%; background: {status.color};"
								>
									<div class="status-bar-icon">
										<svg viewBox="0 0 24 24" width="14" height="14" fill="none">
											<ellipse cx="8" cy="6" rx="2.5" ry="3" fill="white" opacity="0.9"/>
											<ellipse cx="16" cy="6" rx="2.5" ry="3" fill="white" opacity="0.9"/>
											<ellipse cx="5" cy="13" rx="2" ry="2.5" fill="white" opacity="0.9"/>
											<ellipse cx="19" cy="13" rx="2" ry="2.5" fill="white" opacity="0.9"/>
											<ellipse cx="12" cy="15" rx="5.5" ry="6" fill="white"/>
										</svg>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Decorative cat illustration -->
				<div class="status-illustration">
					<svg viewBox="0 0 120 100" width="120" height="100">
						<!-- Cat body -->
						<ellipse cx="60" cy="70" rx="35" ry="25" fill="#E8D5C4"/>
						<!-- Cat head -->
						<circle cx="60" cy="40" r="22" fill="#D4B8A4"/>
						<!-- Ears -->
						<polygon points="42,25 38,5 52,18" fill="#D4B8A4"/>
						<polygon points="78,25 82,5 68,18" fill="#D4B8A4"/>
						<polygon points="44,23 40,8 52,18" fill="#C9A08A"/>
						<polygon points="76,23 80,8 68,18" fill="#C9A08A"/>
						<!-- Eyes -->
						<circle cx="50" cy="38" r="4" fill="#333"/>
						<circle cx="70" cy="38" r="4" fill="#333"/>
						<circle cx="51.5" cy="36.5" r="1.5" fill="white"/>
						<circle cx="71.5" cy="36.5" r="1.5" fill="white"/>
						<!-- Nose -->
						<ellipse cx="60" cy="45" rx="2.5" ry="2" fill="#C9A08A"/>
						<!-- Mouth -->
						<path d="M56 48 Q60 52 64 48" stroke="#C9A08A" stroke-width="1.5" fill="none"/>
						<!-- Whiskers -->
						<line x1="35" y1="42" x2="48" y2="44" stroke="#C9A08A" stroke-width="1"/>
						<line x1="35" y1="46" x2="48" y2="46" stroke="#C9A08A" stroke-width="1"/>
						<line x1="72" y1="44" x2="85" y2="42" stroke="#C9A08A" stroke-width="1"/>
						<line x1="72" y1="46" x2="85" y2="46" stroke="#C9A08A" stroke-width="1"/>
						<!-- Tail -->
						<path d="M95 65 Q110 45 100 30" stroke="#E8D5C4" stroke-width="6" fill="none" stroke-linecap="round"/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Recent Orders Table -->
		{#if dashData.recentOrders}
			<div class="orders-card">
				<div class="orders-header">
					<h2>Aktivitas Pesanan Terakhir</h2>
					<a href="/admin/orders" class="view-all-link">Lihat Semua</a>
				</div>

				<div class="orders-table-wrapper">
					<table class="orders-table">
						<thead>
							<tr>
								<th>Order ID</th>
								<th>Customer</th>
								<th>Produk</th>
								<th>Total</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{#each dashData.recentOrders.slice(0, 5) as order (order.id)}
								<tr>
									<td class="order-id">#{order.id.substring(0, 8).toUpperCase()}</td>
									<td class="order-customer">{order.user?.name ?? '-'}</td>
									<td class="order-product">
										{#if order.items && order.items.length > 0}
											{order.items[0].variant.product.name}
											{#if order.items.length > 1}
												<span style="color: #999; font-size: 0.8em; margin-left: 4px;">(+{order.items.length - 1})</span>
											{/if}
										{:else}
											-
										{/if}
									</td>
									<td class="order-total">{formatRupiah(order.totalPrice)}</td>
									<td>
										<span class="status-badge status-{order.status.toLowerCase()}">
											{order.status}
										</span>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="5" style="text-align: center; padding: 3rem 1rem; color: #999;">Belum ada pesanan masuk.</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

	{/if}
</div>

<style>
	.dashboard {
		font-family: 'Nunito', sans-serif;
		position: relative;
		min-height: calc(100vh - 72px);
		padding-bottom: 5rem;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 800;
		color: #333;
		margin: 0 0 1.5rem;
		letter-spacing: -0.02em;
	}

	/* Loading & Error */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 6rem 0;
	}
	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #F0E5DD;
		border-top-color: #8B2E2E;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	.loading-state p {
		margin-top: 1rem;
		color: #999;
		font-weight: 600;
		font-size: 0.9rem;
	}
	.error-state {
		background: #FEF2F2;
		color: #DC2626;
		padding: 1.25rem 1.5rem;
		border-radius: 16px;
		border: 1px solid #FECACA;
		font-weight: 600;
		font-size: 0.9rem;
	}

	/* Stat Cards */
	.stat-cards {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.stat-card {
		background: white;
		border-radius: 18px;
		padding: 1.25rem 1.5rem;
		box-shadow: 0 2px 12px rgba(139, 46, 46, 0.04);
		border: 1px solid #F5EDE7;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(139, 46, 46, 0.08);
	}
	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}
	.stat-label {
		font-size: 0.8rem;
		font-weight: 700;
		color: #999;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.stat-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.stat-value {
		font-size: 1.65rem;
		font-weight: 800;
		color: #333;
		letter-spacing: -0.02em;
	}
	.stat-value-small {
		font-size: 1.15rem;
	}
	.stat-unit {
		font-size: 0.85rem;
		font-weight: 600;
		color: #999;
	}
	.stat-bottom {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.5rem;
	}
	.stat-indicator {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		font-weight: 800;
		padding: 0.25rem 0.5rem;
		border-radius: 20px;
	}
	.stat-indicator.positive {
		color: #10B981;
		background: #D1FAE5;
	}
	.stat-indicator.negative {
		color: #EF4444;
		background: #FEE2E2;
	}

	/* Chart + Status Row */
	.chart-status-row {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.chart-card {
		background: white;
		border-radius: 18px;
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(139, 46, 46, 0.04);
		border: 1px solid #F5EDE7;
	}
	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
	.chart-header h2 {
		font-size: 1.1rem;
		font-weight: 800;
		color: #333;
		margin: 0;
	}
	.chart-dropdown {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		position: relative;
	}
	.chart-dropdown select {
		appearance: none;
		background: #FFF9F5;
		border: 1.5px solid #F0E0D6;
		border-radius: 10px;
		padding: 0.45rem 2rem 0.45rem 0.85rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: #666;
		cursor: pointer;
		font-family: 'Nunito', sans-serif;
		outline: none;
		transition: border-color 0.2s;
	}
	.chart-dropdown select:focus {
		border-color: #D4A48A;
	}
	.chart-dropdown svg {
		position: absolute;
		right: 8px;
		pointer-events: none;
		color: #999;
	}

	.chart-container {
		position: relative;
	}
	.chart-svg {
		width: 100%;
		height: 200px;
	}
	.chart-dot {
		transition: r 0.2s;
	}
	.chart-dot:hover {
		r: 6;
	}
	.chart-labels {
		position: relative;
		height: 30px;
		margin-top: 0.5rem;
	}
	.chart-labels span {
		position: absolute;
		transform: translateX(-50%);
		font-size: 0.7rem;
		font-weight: 600;
		color: #BBB;
	}
	.chart-empty {
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #CCC;
		font-weight: 600;
	}

	/* Status Card */
	.status-card {
		background: white;
		border-radius: 18px;
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(139, 46, 46, 0.04);
		border: 1px solid #F5EDE7;
		display: flex;
		flex-direction: column;
	}
	.status-card h2 {
		font-size: 1.05rem;
		font-weight: 800;
		color: #333;
		margin: 0 0 1.25rem;
		line-height: 1.3;
	}

	.status-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.status-label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.4rem;
	}
	.status-name {
		font-size: 0.75rem;
		font-weight: 700;
		color: #888;
		letter-spacing: 0.05em;
	}
	.status-count {
		font-size: 0.75rem;
		font-weight: 800;
	}
	.status-bar-bg {
		width: 100%;
		height: 18px;
		background: #F5F0EB;
		border-radius: 10px;
		overflow: hidden;
		position: relative;
	}
	.status-bar-fill {
		height: 100%;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 4px;
		transition: width 0.8s ease;
		min-width: 24px;
	}
	.status-bar-icon {
		display: flex;
		align-items: center;
	}

	.status-illustration {
		margin-top: auto;
		display: flex;
		justify-content: center;
		padding-top: 0.75rem;
		opacity: 0.8;
	}

	/* Orders Table */
	.orders-card {
		background: white;
		border-radius: 18px;
		padding: 1.5rem;
		box-shadow: 0 2px 12px rgba(139, 46, 46, 0.04);
		border: 1px solid #F5EDE7;
	}
	.orders-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.25rem;
	}
	.orders-header h2 {
		font-size: 1.1rem;
		font-weight: 800;
		color: #333;
		margin: 0;
	}
	.view-all-link {
		font-size: 0.8rem;
		font-weight: 700;
		color: #3B9B7A;
		text-decoration: none;
		transition: color 0.2s;
	}
	.view-all-link:hover {
		color: #2D7A5E;
		text-decoration: underline;
	}

	.orders-table-wrapper {
		overflow-x: auto;
	}
	.orders-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.85rem;
	}
	.orders-table thead th {
		text-align: left;
		font-size: 0.75rem;
		font-weight: 700;
		color: #AAA;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #F5EDE7;
	}
	.orders-table tbody tr {
		border-bottom: 1px solid #FAF5F0;
		transition: background 0.15s;
	}
	.orders-table tbody tr:hover {
		background: #FEFBF8;
	}
	.orders-table tbody tr:last-child {
		border-bottom: none;
	}
	.orders-table td {
		padding: 1rem;
		vertical-align: middle;
	}
	.order-id {
		font-weight: 800;
		color: #555;
		font-size: 0.85rem;
	}
	.order-customer {
		font-weight: 600;
		color: #555;
	}
	.order-product {
		font-weight: 500;
		color: #888;
	}
	.order-total {
		font-weight: 800;
		color: #333;
	}

	.status-badge {
		display: inline-block;
		padding: 0.3rem 0.75rem;
		border-radius: 8px;
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.status-selesai {
		background: #D1FAE5;
		color: #059669;
	}
	.status-pending {
		background: #FEF3C7;
		color: #D97706;
	}
	.status-diproses {
		background: #DBEAFE;
		color: #2563EB;
	}



	/* Responsive */
	@media (max-width: 1024px) {
		.stat-cards {
			grid-template-columns: repeat(2, 1fr);
		}
		.chart-status-row {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 640px) {
		.stat-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
