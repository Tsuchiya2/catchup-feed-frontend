import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LegalHeader } from './LegalHeader';

// Mock Next.js router / pathname (legal pages live at /terms and /privacy)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/terms',
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('LegalHeader', () => {
  it('shows only legal links (no main nav, no logout) for anonymous visitors', () => {
    renderWithProviders(<LegalHeader />);

    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('header-logout-button')).not.toBeInTheDocument();
  });

  it('shows the full admin navigation and logout for a signed-in admin', () => {
    renderWithProviders(<LegalHeader role="admin" />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Friends' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms' })).toBeInTheDocument();
    expect(screen.getByTestId('header-logout-button')).toBeInTheDocument();
  });

  it('shows only the viewer navigation for a signed-in viewer', () => {
    renderWithProviders(<LegalHeader role="viewer" />);

    expect(screen.getByRole('link', { name: 'Sources' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(screen.getByTestId('header-logout-button')).toBeInTheDocument();
  });
});
