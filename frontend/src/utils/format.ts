/**
 * Format various date input types (string, number, Date, array) to a locale string.
 */
export function formatDate(dateInput: unknown): string {
    if (!dateInput) return '';
    if (Array.isArray(dateInput)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput as number[];
        if (typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number') return '';
        return new Date(year, month - 1, day, hour, minute, second).toLocaleDateString();
    }
    return new Date(dateInput as string | number | Date).toLocaleDateString();
}

/**
 * Get Tailwind classes for order status badges.
 */
export function getStatusColor(status: string): string {
    switch (status) {
        case 'COMPLETED': return 'bg-green-100 text-green-600';
        case 'PENDING': return 'bg-blue-100 text-blue-600';
        case 'PAID': return 'bg-indigo-100 text-indigo-600';
        case 'SHIPPED': return 'bg-amber-100 text-amber-600';
        case 'CANCELLED': return 'bg-slate-100 text-slate-600';
        default: return 'bg-slate-100 text-slate-600';
    }
}

/**
 * Get Chinese label for order status.
 */
export function getStatusText(status: string): string {
    switch (status) {
        case 'COMPLETED': return '已完成';
        case 'PENDING': return '待付款';
        case 'PAID': return '待发货';
        case 'SHIPPED': return '已发货';
        case 'CANCELLED': return '已取消';
        default: return status;
    }
}

/**
 * Extract error message from various error types.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (error as { response?: { data?: unknown } }).response;
        const data = response?.data;
        if (typeof data === 'string') return data;
        if (typeof data === 'object' && data !== null && 'message' in data) {
            const messageValue = (data as { message?: unknown }).message;
            if (typeof messageValue === 'string') return messageValue;
        }
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}
