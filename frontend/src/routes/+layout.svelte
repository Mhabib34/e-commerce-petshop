<script lang="ts">
	import "./layout.css";

	import {
		QueryClient,
		QueryClientProvider,
	} from "@tanstack/svelte-query";

	const queryClient = new QueryClient();

	const { children } = $props();
</script>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>