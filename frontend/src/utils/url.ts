import api from '../api';

export function resolveAssetUrl(url?: string | null): string | undefined {
    if (!url) return undefined;
    if (/^(https?:|data:|blob:)/i.test(url)) return url;

    if (url.startsWith('/')) {
        try {
            const baseUrl = api.defaults.baseURL || window.location.origin;
            return `${new URL(baseUrl, window.location.origin).origin}${url}`;
        } catch {
            return url;
        }
    }

    return url;
}
