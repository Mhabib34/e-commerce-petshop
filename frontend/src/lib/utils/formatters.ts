export function formatRupiah(num: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(num);
}

export function formatDate(dateStr: string, includeTime: boolean = false): string {
	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		...(includeTime && { hour: '2-digit', minute: '2-digit' })
	};
	return new Date(dateStr).toLocaleDateString('id-ID', options);
}

export function formatTime(dateStr: string): string {
	return new Date(dateStr).toLocaleTimeString('id-ID', {
		hour: '2-digit',
		minute: '2-digit'
	});
}

export function getInitials(name: string): string {
	if (!name) return '??';
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.substring(0, 2)
		.toUpperCase();
}
