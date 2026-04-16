import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import OAuthCallback from '../pages/OAuthCallback';

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    login: vi.fn(),
    messageSuccess: vi.fn(),
    messageError: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: () => mocks.navigate,
    useSearchParams: () => [new URLSearchParams(globalThis.location.search)],
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ login: mocks.login }),
}));

vi.mock('antd', () => ({
    message: { success: mocks.messageSuccess, error: mocks.messageError },
}));

describe('OAuthCallback', () => {
    beforeEach(() => {
        mocks.navigate.mockReset();
        mocks.login.mockReset();
        mocks.messageSuccess.mockReset();
        mocks.messageError.mockReset();
        window.history.replaceState({}, '', '/oauth/callback');
    });

    it('logs in and navigates home when token exists', async () => {
        const payload = btoa(JSON.stringify({ sub: 'github_user', email: 'g@ex.com', roles: ['ROLE_USER'] }));
        window.history.replaceState({}, '', `/oauth/callback?token=aaa.${payload}.bbb`);

        render(<OAuthCallback />);

        await waitFor(() => {
            expect(mocks.login).toHaveBeenCalledTimes(1);
            expect(mocks.navigate).toHaveBeenCalledWith('/');
        });
    });

    it('navigates to login when error exists', async () => {
        window.history.replaceState({}, '', '/oauth/callback?error=OAUTH_LOGIN_FAILED');

        render(<OAuthCallback />);

        await waitFor(() => {
            expect(mocks.messageError).toHaveBeenCalled();
            expect(mocks.navigate).toHaveBeenCalledWith('/login');
        });
    });

    it('navigates to login when token is malformed', async () => {
        window.history.replaceState({}, '', '/oauth/callback?token=badtoken');

        render(<OAuthCallback />);

        await waitFor(() => {
            expect(mocks.messageError).toHaveBeenCalled();
            expect(mocks.navigate).toHaveBeenCalledWith('/login');
        });
    });
});
