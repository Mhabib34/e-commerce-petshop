<script lang="ts">
	import type { Order } from '$lib/types/order.type';
	import { formatDate, formatTime, getInitials } from '$lib/utils/formatters';
	import { Package, Eye } from 'lucide-svelte';

	let {
		orders,
		isLoading,
		onView
	} = $props<{
		orders: Order[];
		isLoading: boolean;
		onView: (order: Order) => void;
	}>();
</script>

{#if isLoading}
	<div class="flex justify-center py-20">
		<p class="text-gray-400 animate-pulse">Memuat pesanan...</p>
	</div>
{:else if orders.length === 0}
	<div class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
		<Package size={48} class="mx-auto text-gray-300 mb-4" />
		<p class="text-gray-500 font-medium">Tidak ada pesanan ditemukan.</p>
	</div>
{:else}
	<div class="overflow-x-auto pb-4">
		<table class="w-full text-sm text-left whitespace-nowrap border-separate border-spacing-y-3">
			<thead>
				<tr class="text-gray-500 font-semibold text-xs uppercase tracking-wider">
					<th class="px-5 pb-2">ID Pesanan</th>
					<th class="px-5 pb-2">Customer</th>
					<th class="px-5 pb-2">Total Harga</th>
					<th class="px-5 pb-2 text-center">Metode Pembayaran</th>
					<th class="px-5 pb-2 text-center">Status</th>
					<th class="px-5 pb-2">Tanggal</th>
					<th class="px-5 pb-2 text-center">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each orders as order (order.id)}
					<tr class="bg-white hover:bg-gray-50/80 transition-colors shadow-sm group">
						<td class="py-4 px-5 font-bold text-gray-800 rounded-l-2xl">
							#{order.id.substring(0, 6).toUpperCase()}-{order.id.substring(6, 10)}
						</td>
						<td class="py-4 px-5">
							<div class="flex items-center gap-3">
								<div
									class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
									{order.user?.name.charAt(0) > 'M'
										? 'bg-[#FEE2E2] text-[#B91C1C]'
										: 'bg-[#E0E7FF] text-[#4338CA]'}"
								>
									{getInitials(order.user?.name ?? 'Unknown')}
								</div>
								<div>
									<p class="font-bold text-gray-800">{order.user?.name ?? '-'}</p>
									<p class="text-xs text-gray-500">{order.user?.email ?? '-'}</p>
								</div>
							</div>
						</td>
						<td class="py-4 px-5 font-bold text-gray-800">
							<div class="flex flex-col">
								<span>Rp</span>
								<span>{new Intl.NumberFormat('id-ID').format(order.totalPrice)}</span>
							</div>
						</td>
						<td class="py-4 px-5 text-center">
							<span class="border border-[#34D399] text-[#059669] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
								{order.paymentMethod}
							</span>
						</td>
						<td class="py-4 px-5 text-center">
							<span
								class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
								{order.status === 'PENDING'
									? 'bg-[#FEF08A] text-yellow-800'
									: order.status === 'DIPROSES'
										? 'bg-[#DBEAFE] text-blue-800'
										: 'bg-[#D1FAE5] text-green-800'}"
							>
								{order.status}
							</span>
						</td>
						<td class="py-4 px-5 text-gray-500">
							<p class="font-medium text-gray-700">{formatDate(order.createdAt)},</p>
							<p class="text-xs">{formatTime(order.createdAt)}</p>
						</td>
						<td class="py-4 px-5 rounded-r-2xl text-center">
							<button
								onclick={() => onView(order)}
								class="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto hover:bg-[#DC2626] hover:text-white transition-colors shadow-sm"
							>
								<Eye size={18} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
