import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';

const { getMock, postMock, deleteMock, putMock, clearTokenCacheMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  deleteMock: vi.fn(),
  putMock: vi.fn(),
  clearTokenCacheMock: vi.fn(),
}));

vi.mock('../api', () => ({
  default: {
    get: getMock,
    post: postMock,
    delete: deleteMock,
    put: putMock,
  },
  clearTokenCache: clearTokenCacheMock,
}));

vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function SessionHarness() {
  const { user, login, logout, isAdmin } = useAuth();
  const { cartCount, addToCart } = useCart();

  return (
    <>
      <div data-testid="username">{user?.username ?? 'guest'}</div>
      <div data-testid="is-admin">{String(isAdmin)}</div>
      <div data-testid="cart-count">{String(cartCount)}</div>
      <button
        type="button"
        onClick={() => login({
          id: 1,
          username: 'admin-lower',
          email: 'admin@example.com',
          roles: ['admin'],
          accessToken: 'token-1',
          tokenType: 'Bearer',
        })}
      >
        Login lowercase admin
      </button>
      <button
        type="button"
        onClick={() => login({
          id: 2,
          username: 'shopper',
          email: 'shopper@example.com',
          roles: ['ROLE_USER'],
          accessToken: 'token-2',
          tokenType: 'Bearer',
        })}
      >
        Login shopper
      </button>
      <button type="button" onClick={() => logout()}>
        Logout
      </button>
      <button
        type="button"
        onClick={() => addToCart({
          id: 99,
          title: 'Test Book',
          author: 'Tester',
          price: 10,
          stock: 5,
          coverImage: '',
          description: '',
          categoryId: 1,
          categoryName: 'Testing',
          isbn: '123',
          publisher: 'Test Press',
          publishDate: '2026-01-01',
          rating: 0,
          salesCount: 0,
        })}
      >
        Add book
      </button>
    </>
  );
}

describe('auth session state', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    getMock.mockReset();
    postMock.mockReset();
    deleteMock.mockReset();
    putMock.mockReset();
    clearTokenCacheMock.mockReset();
    getMock.mockResolvedValue({ data: [] });
  });

  it('treats lowercase admin roles as admin', async () => {
    render(
      <AuthProvider>
        <CartProvider>
          <SessionHarness />
        </CartProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login lowercase admin' }));

    await waitFor(() => {
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    });
  });

  it('clears local cart state on logout', async () => {
    render(
      <AuthProvider>
        <CartProvider>
          <SessionHarness />
        </CartProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add book' }));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
      expect(localStorage.getItem('cart')).toBe('[]');
    });
  });

  it('drops previous local cart items when switching accounts', async () => {
    render(
      <AuthProvider>
        <CartProvider>
          <SessionHarness />
        </CartProvider>
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add book' }));
    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Login shopper' }));

    await waitFor(() => {
      expect(screen.getByTestId('username')).toHaveTextContent('shopper');
      expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    });
  });

  it('keeps local cart items when cart sync returns 401', async () => {
    localStorage.setItem('user', JSON.stringify({
      id: 2,
      username: 'shopper',
      email: 'shopper@example.com',
      roles: ['ROLE_USER'],
      accessToken: 'expired-token',
      tokenType: 'Bearer',
    }));
    localStorage.setItem('cart', JSON.stringify([{
      id: 99,
      title: 'Saved Book',
      author: 'Tester',
      price: 10,
      stock: 5,
      coverImage: '',
      description: '',
      categoryId: 1,
      categoryName: 'Testing',
      isbn: '123',
      publisher: 'Test Press',
      publishDate: '2026-01-01',
      rating: 0,
      salesCount: 0,
      quantity: 2,
    }]));
    getMock.mockRejectedValueOnce({ response: { status: 401 } });

    render(
      <AuthProvider>
        <CartProvider>
          <SessionHarness />
        </CartProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/cart');
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(localStorage.getItem('cart')).toContain('Saved Book');
  });
});

