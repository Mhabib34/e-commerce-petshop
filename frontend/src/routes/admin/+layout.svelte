<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import { useMe } from '$lib/queries/auth';
	import { Search, LogOut } from 'lucide-svelte';
	import { Toaster, toast } from 'svelte-sonner';

	const { children } = $props();
	const meQuery = useMe();

	let globalSearch = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	function handleGlobalInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const query = globalSearch.trim();
			if (query) {
				goto(`/admin/products?q=${encodeURIComponent(query)}`, { keepFocus: true });
			} else if (page.url.pathname === '/admin/products') {
				goto(`/admin/products`, { keepFocus: true });
			}
		}, 300);
	}

	// Redirect if not admin
	$effect(() => {
		if (meQuery.isError) {
			goto('/login');
		}
		if (meQuery.data && meQuery.data.data?.role !== 'ADMIN') {
			goto('/login');
		}
	});

	function logout() {
		toast('Konfirmasi Logout', {
			description: 'Apakah Anda yakin ingin keluar dari akun ini?',
			duration: Infinity,
			action: {
				label: 'Ya, Logout',
				onClick: () => {
					localStorage.removeItem('token');
					goto('/login');
				}
			},
			cancel: {
				label: 'Batal',
				onClick: () => {}
			}
		});
	}

	const navItems = [
		{ href: '/admin', label: 'Dashboard', icon: 'dashboard' },
		{ href: '/admin/products', label: 'Produk', icon: 'produk' },
		{ href: '/admin/categories', label: 'Kategori', icon: 'kategori' },
		{ href: '/admin/orders', label: 'Pesanan', icon: 'pesanan' }
	];

	function isActive(href: string): boolean {
		if (href === '/admin') return page.url.pathname === '/admin';
		return page.url.pathname.startsWith(href);
	}
</script>

{#if meQuery.isLoading}
	<div class="loading-screen">
		<div class="loading-paw">
			<svg viewBox="0 0 40 40" fill="none" width="48" height="48">
				<ellipse cx="12" cy="8" rx="4.5" ry="5.5" fill="#8B2E2E" />
				<ellipse cx="28" cy="8" rx="4.5" ry="5.5" fill="#8B2E2E" />
				<ellipse cx="6" cy="20" rx="3.5" ry="4.5" fill="#8B2E2E" />
				<ellipse cx="34" cy="20" rx="3.5" ry="4.5" fill="#8B2E2E" />
				<ellipse cx="20" cy="24" rx="10" ry="11" fill="#8B2E2E" />
			</svg>
		</div>
		<p class="loading-text">Memuat...</p>
	</div>
{:else if meQuery.data?.data?.role === 'ADMIN'}
	<Toaster 
		richColors
		position="top-right" 
		toastOptions={{
			style: 'background: #FEFDFB; border: 2px solid #F4E1D2; color: #374151; border-radius: 20px; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); padding: 16px;',
			descriptionClass: 'text-gray-500 font-medium',
			actionButtonStyle: 'background: #FF6B6B; color: white; border-radius: 10px; font-weight: 700; padding: 8px 16px; border: none;',
			cancelButtonStyle: 'background: #F3F4F6; color: #4B5563; border-radius: 10px; font-weight: 700; padding: 8px 16px; border: none;'
		}}
	/>
	<div class="admin-layout">
		<!-- Sidebar -->
		<aside class="sidebar">
			<!-- Logo -->
			<div class="sidebar-logo">
				<div class="logo-paw">
					<svg viewBox="0 0 40 40" fill="none" width="28" height="28">
						<ellipse cx="12" cy="8" rx="4.5" ry="5.5" fill="#8B2E2E" />
						<ellipse cx="28" cy="8" rx="4.5" ry="5.5" fill="#8B2E2E" />
						<ellipse cx="6" cy="20" rx="3.5" ry="4.5" fill="#8B2E2E" />
						<ellipse cx="34" cy="20" rx="3.5" ry="4.5" fill="#8B2E2E" />
						<ellipse cx="20" cy="24" rx="10" ry="11" fill="#8B2E2E" />
					</svg>
				</div>
				<span class="logo-text">{PUBLIC_APP_NAME}</span>
			</div>

			<!-- Navigation -->
			<nav class="sidebar-nav">
				{#each navItems as item (item.label)}
					<a href={item.href} class="nav-item {isActive(item.href) ? 'active' : ''}">
						<span class="nav-icon">
							{#if item.icon === 'dashboard'}
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect x="3" y="3" width="7" height="7" rx="1" />
									<rect x="14" y="3" width="7" height="7" rx="1" />
									<rect x="3" y="14" width="7" height="7" rx="1" />
									<rect x="14" y="14" width="7" height="7" rx="1" />
								</svg>
							{:else if item.icon === 'produk'}
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path
										d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
									/>
									<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
									<line x1="12" y1="22.08" x2="12" y2="12" />
								</svg>
							{:else if item.icon === 'kategori'}
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="M12 2L2 7l10 5 10-5-10-5z" />
									<path d="M2 17l10 5 10-5" />
									<path d="M2 12l10 5 10-5" />
								</svg>
							{:else if item.icon === 'pesanan'}
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<circle cx="9" cy="21" r="1" />
									<circle cx="20" cy="21" r="1" />
									<path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
								</svg>
							{/if}
						</span>
						<span class="nav-label">{item.label}</span>
					</a>
				{/each}
			</nav>

			<!-- Logout -->
			<div class="sidebar-footer">
				<button onclick={logout} class="logout-btn" id="logout-button">
					<LogOut size={20} />
					<span>Logout</span>
				</button>
			</div>
		</aside>

		<!-- Main content -->
		<main class="main-content">
			<!-- Top Header -->
			<header class="top-header">
				<div class="header-left">
					<!-- Page title injected by children -->
				</div>
				<div class="header-right">
					<div class="search-wrapper" id="global-search">
						<Search size={18} class="search-icon" />
						<input
							type="text"
							bind:value={globalSearch}
							oninput={handleGlobalInput}
							placeholder="Cari produk..."
						/>
					</div>
				</div>
			</header>

			<div class="content-area">
				{@render children()}
			</div>
		</main>
	</div>
{/if}

<style>
	.loading-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		background: #fff5ee;
		font-family: 'Nunito', sans-serif;
	}
	.loading-paw {
		animation: pulsePaw 1.2s ease-in-out infinite;
	}
	@keyframes pulsePaw {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.1);
			opacity: 0.7;
		}
	}
	.loading-text {
		margin-top: 1rem;
		color: #8b2e2e;
		font-weight: 700;
		font-size: 1rem;
	}

	.admin-layout {
		display: flex;
		height: 100vh;
		background: #f8f0ea;
		font-family: 'Nunito', sans-serif;
	}

	/* Sidebar */
	.sidebar {
		width: 240px;
		min-width: 240px;
		background: white;
		display: flex;
		flex-direction: column;
		border-right: 1px solid #f0e5dd;
		box-shadow: 2px 0 15px rgba(139, 46, 46, 0.03);
	}

	.sidebar-logo {
		padding: 1.5rem 1.5rem 1.75rem;
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}
	.logo-paw {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.logo-text {
		font-size: 1.25rem;
		font-weight: 800;
		color: #8b2e2e;
		letter-spacing: -0.02em;
	}

	.sidebar-nav {
		flex: 1;
		padding: 0 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 600;
		color: #888;
		transition: all 0.2s ease;
	}
	.nav-item:hover {
		background: #fff5ee;
		color: #8b2e2e;
	}
	.nav-item.active {
		background: #8b2e2e;
		color: white;
		box-shadow: 0 4px 12px rgba(139, 46, 46, 0.25);
	}
	.nav-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
	}

	.sidebar-footer {
		padding: 1rem 0.75rem 1.5rem;
		border-top: 1px solid #f5ede7;
	}
	.logout-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		color: #888;
		width: 100%;
		font-family: 'Nunito', sans-serif;
		transition: all 0.2s;
	}
	.logout-btn:hover {
		background: #fef2f2;
		color: #dc2626;
	}

	/* Main content */
	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.top-header {
		height: 72px;
		padding: 0 2rem;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		background: #f8f0ea;
		flex-shrink: 0;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}
	.search-wrapper :global(.search-icon) {
		position: absolute;
		left: 14px;
		color: #bbb;
		pointer-events: none;
	}
	.search-wrapper input {
		width: 240px;
		padding: 0.6rem 1rem 0.6rem 2.6rem;
		background: white;
		border: 1.5px solid #ede3db;
		border-radius: 12px;
		font-size: 0.85rem;
		color: #555;
		font-family: 'Nunito', sans-serif;
		font-weight: 500;
		outline: none;
		transition: all 0.2s;
	}
	.search-wrapper input::placeholder {
		color: #c4b0a0;
	}
	.search-wrapper input:focus {
		border-color: #d4a48a;
		box-shadow: 0 0 0 3px rgba(139, 46, 46, 0.06);
		width: 300px;
	}

	.content-area {
		flex: 1;
		overflow: auto;
		padding: 0 2rem 2rem;
	}
</style>
