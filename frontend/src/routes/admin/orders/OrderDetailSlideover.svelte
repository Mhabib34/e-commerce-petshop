<script lang="ts">
	import { X, MapPin, Phone, Printer, MessageSquare, ChevronDown } from 'lucide-svelte';
	import type { Order, OrderStatus } from '$lib/types/order.type';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { formatRupiah, formatDate, getInitials } from '$lib/utils/formatters';
	import { PUBLIC_APP_NAME } from '$env/static/public';

	let {
		isOpen = $bindable(false),
		order,
		onUpdateStatus,
		isUpdating = false
	}: {
		isOpen: boolean;
		order: Order | null;
		onUpdateStatus: (id: string, status: OrderStatus) => void;
		isUpdating?: boolean;
	} = $props();

	let selectedStatus = $state<OrderStatus | ''>('');

	$effect(() => {
		if (order) {
			selectedStatus = order.status;
		}
	});

	function handleClose() {
		isOpen = false;
	}

	function printReceipt() {
		if (!order) return;
		
		const printWindow = window.open('', '_blank');
		if (!printWindow) return;

		const html = `
			<html>
				<head>
					<title>Resi Pesanan #${order.id.slice(0, 8)}</title>
					<style>
						body { font-family: monospace; padding: 20px; color: #333; max-width: 400px; margin: 0 auto; }
						.header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
						.details { margin-bottom: 20px; }
						.details p { margin: 5px 0; }
						.items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
						.items th, .items td { text-align: left; padding: 8px 0; border-bottom: 1px dashed #eee; }
						.items th { font-weight: bold; }
						.total { text-align: right; font-weight: bold; font-size: 1.2em; border-top: 1px dashed #333; padding-top: 10px; }
						.footer { text-align: center; margin-top: 40px; font-size: 0.9em; color: #666; }
						@media print {
							body { max-width: 100%; }
						}
					</style>
				</head>
				<body>
					<div class="header">
						<h2>${PUBLIC_APP_NAME.toUpperCase()} PETSHOP</h2>
						<p>Resi Pembelian</p>
					</div>
					<div class="details">
						<p><strong>Order ID:</strong> ${order.id}</p>
						<p><strong>Tanggal:</strong> ${formatDate(order.createdAt)}</p>
						<p><strong>Pelanggan:</strong> ${order.user.name}</p>
					</div>
					<table class="items">
						<thead>
							<tr>
								<th>Item</th>
								<th>Qty</th>
								<th style="text-align: right">Harga</th>
							</tr>
						</thead>
						<tbody>
							${order.items.map(item => `
								<tr>
									<td>${item.variant.product.name} - ${item.variant.name}</td>
									<td>x${item.quantity}</td>
									<td style="text-align: right">${formatRupiah(item.price)}</td>
								</tr>
							`).join('')}
						</tbody>
					</table>
					<div class="total">
						Total: ${formatRupiah(order.totalPrice)}
					</div>
					<div class="footer">
						<p>Terima kasih telah berbelanja di ${PUBLIC_APP_NAME}!</p>
					</div>
				</body>
			</html>
		`;
		printWindow.document.write(html);
		printWindow.document.close();
		printWindow.focus();
		setTimeout(() => {
			printWindow.print();
			printWindow.close();
		}, 250);
	}
</script>

{#if isOpen && order}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 bg-gray-900/20 backdrop-blur-[2px] z-40 transition-opacity"
		onclick={handleClose}
	></div>

	<!-- Slide-over panel -->
	<div
		transition:fly={{ x: '100%', duration: 400, easing: quintOut }}
		class="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-2xl flex flex-col border-l border-gray-100"
	>
		<!-- Header -->
		<div
			class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0"
		>
			<div class="flex items-center gap-3">
				<button
					onclick={handleClose}
					class="text-gray-400 hover:text-gray-800 transition-colors p-1 rounded-full hover:bg-gray-100"
				>
					<X size={20} />
				</button>
				<h2 class="text-lg font-bold text-gray-800">
					Detail Pesanan #{order.id.substring(0, 6).toUpperCase()}
				</h2>
				<span
					class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    {order.status === 'PENDING'
						? 'bg-[#FEF08A] text-yellow-800'
						: order.status === 'DIPROSES'
							? 'bg-[#5EEAD4] text-teal-900'
							: 'bg-[#A7F3D0] text-green-800'}"
				>
					{order.status}
				</span>
			</div>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
			<!-- Status Update Box -->
			<div class="bg-white border border-[#F4E1D2]/60 p-5 rounded-2xl shadow-sm">
				<p class="text-xs font-semibold text-gray-500 mb-2">Ganti Status</p>
				<div class="flex gap-3">
					<div class="relative flex-1">
						<select
							bind:value={selectedStatus}
							class="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/20 focus:border-[#FF6B6B]"
						>
							{#if order.status === 'PENDING'}
								<option value="PENDING">Pending</option>
								<option value="DIPROSES">Diproses</option>
							{:else if order.status === 'DIPROSES'}
								<option value="DIPROSES">Diproses</option>
								<option value="SELESAI">Selesai</option>
							{:else}
								<option value="SELESAI">Selesai</option>
							{/if}
						</select>
						<ChevronDown
							size={16}
							class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						/>
					</div>
					<button
						onclick={() => onUpdateStatus(order!.id, selectedStatus as OrderStatus)}
						disabled={isUpdating || selectedStatus === order.status}
						class="bg-[#FF6B6B] hover:bg-[#FF5252] disabled:bg-[#FF6B6B]/50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#FF6B6B]/20 transition-all"
					>
						{isUpdating ? 'Loading...' : 'Update Status'}
					</button>
				</div>
			</div>

			<!-- Customer Info -->
			<div class="bg-white border border-[#F4E1D2]/60 p-5 rounded-2xl shadow-sm">
				<div class="flex items-center gap-4 mb-4">
					<div
						class="w-12 h-12 bg-[#FEE2E2] text-[#B91C1C] rounded-full flex items-center justify-center font-bold text-lg"
					>
						{getInitials(order.user?.name ?? 'Unknown')}
					</div>
					<div>
						<h3 class="font-bold text-gray-800 text-lg leading-tight">{order.user?.name ?? '-'}</h3>
						<p class="text-sm text-gray-500">{order.user?.email ?? '-'}</p>
					</div>
				</div>
				<div class="space-y-3 pt-4 border-t border-gray-100">
					<div class="flex items-start gap-3 text-sm">
						<MapPin size={16} class="text-gray-400 mt-0.5 shrink-0" />
						<span class="text-gray-600 leading-relaxed">{order.shippingAddress}</span>
					</div>
					<div class="flex items-center gap-3 text-sm">
						<Phone size={16} class="text-gray-400 shrink-0" />
						<span class="text-gray-600">{order.user?.phone ?? '-'}</span>
					</div>
				</div>
			</div>

			<!-- Products List -->
			<div class="bg-white border border-[#F4E1D2]/60 rounded-2xl shadow-sm overflow-hidden">
				<div
					class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50"
				>
					<h3 class="font-bold text-gray-800 text-sm">Produk yang Dibeli</h3>
					<span class="text-xs font-semibold text-gray-500">{order.items.length} Item</span>
				</div>
				<div class="p-5">
					<div class="flex text-xs font-bold text-gray-400 mb-3 tracking-wider uppercase">
						<div class="flex-1">PRODUK</div>
						<div class="w-12 text-center">QTY</div>
						<div class="w-24 text-right">SUBTOTAL</div>
					</div>
					<div class="space-y-4">
						{#each order.items as item (item.id)}
							<div
								class="flex items-center gap-3 border-b border-gray-50 pb-4 last:border-0 last:pb-0"
							>
								<div
									class="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden"
								>
									{#if item.variant?.product?.imageUrl}
										<img
											src={item.variant.product.imageUrl}
											alt=""
											class="w-full h-full object-cover"
										/>
									{:else}
										<span class="text-gray-400 text-xs">No Img</span>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="font-bold text-gray-800 text-sm truncate">
										{item.variant?.product?.name ?? '-'}
									</p>
									<p class="text-[11px] text-gray-500 mt-0.5 truncate">
										Varian: {item.variant?.name ?? '-'}
									</p>
								</div>
								<div class="w-12 text-center text-sm font-medium text-gray-600">
									{item.quantity}x
								</div>
								<div class="w-24 text-right font-bold text-gray-800 text-sm">
									{formatRupiah(item.price * item.quantity)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Payment Summary -->
			<div class="bg-[#FDF8F5] border border-[#F4E1D2]/80 p-5 rounded-2xl shadow-sm">
				<div class="space-y-3 text-sm mb-4">
					<div class="flex justify-between text-gray-600">
						<span>Subtotal</span>
						<span class="font-bold text-gray-800">{formatRupiah(order.totalPrice)}</span>
					</div>
					<div class="flex justify-between text-gray-600">
						<span>Ongkos Kirim (Reguler)</span>
						<span class="font-bold text-gray-800">{formatRupiah(0)}</span>
					</div>
					<div class="flex justify-between text-[#059669]">
						<span>Diskon Voucher</span>
						<span class="font-bold">-Rp 0</span>
					</div>
				</div>
				<div class="pt-4 border-t border-[#F4E1D2] flex items-end justify-between">
					<div>
						<p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">TOTAL BAYAR</p>
						<p class="text-2xl font-bold text-[#FF6B6B]">{formatRupiah(order.totalPrice)}</p>
					</div>
					<div class="text-right">
						<p class="text-[10px] text-gray-400 mb-1">Metode Pembayaran</p>
						<div
							class="inline-flex items-center gap-1.5 bg-[#E6F4EA] text-[#059669] px-2 py-1 rounded text-xs font-bold border border-[#A7F3D0]"
						>
							{order.paymentMethod === 'DUMMY' ? 'GOPAY / QRIS' : order.paymentMethod}
						</div>
					</div>
				</div>
			</div>

			<!-- Timeline Dummy -->
			<div class="pt-2">
				<h3 class="font-bold text-gray-800 text-sm mb-4">Riwayat Pesanan</h3>
				<div
					class="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[5px] before:w-px before:bg-[#F4E1D2]"
				>
					<div class="relative">
						<div
							class="absolute left-[21px] w-3 h-3 rounded-full bg-[#059669] ring-4 ring-[#E6F4EA]"
						></div>
						<p class="text-sm font-bold text-gray-800">Pesanan Diproses</p>
						<p class="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)} • Oleh Admin</p>
					</div>
					<div class="relative">
						<div
							class="absolute left-[21px] w-3 h-3 rounded-full bg-[#D1D5DB] ring-4 ring-white"
						></div>
						<p class="text-sm font-bold text-gray-800">Pembayaran Diterima</p>
						<p class="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer Actions -->
		<div class="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
			<button
				onclick={printReceipt}
				class="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
			>
				<Printer size={16} /> Cetak Resi
			</button>
			<button
				class="flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all"
			>
				<MessageSquare size={16} /> Chat Pembeli
			</button>
		</div>
	</div>
{/if}
