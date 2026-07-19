import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SourcesPage from '../page';
import * as sourcesApi from '@/lib/api/endpoints/sources';
import * as useSources from '@/hooks/useSources';
import * as useSourceSearch from '@/hooks/useSourceSearch';
import * as useAuth from '@/hooks/useAuth';
import { ApiError } from '@/lib/api/errors';
import type { Source } from '@/types/api';

// Mock dependencies
vi.mock('@/lib/api/endpoints/sources');
vi.mock('@/hooks/useSources');
vi.mock('@/hooks/useSourceSearch');
vi.mock('@/hooks/useAuth');

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/sources',
}));

describe('SourcesPage', () => {
  let queryClient: QueryClient;

  const mockSources: Source[] = [
    {
      id: 1,
      name: 'Tech Blog',
      feed_url: 'https://example.com/tech.xml',
      url: 'https://example.com/tech.xml',
      category: 'dev',
      lang: 'en',
      active: true,
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: 'News Site',
      feed_url: 'https://example.com/news.xml',
      url: 'https://example.com/news.xml',
      category: 'news',
      lang: 'ja',
      active: false,
      created_at: '2025-01-14T15:30:00Z',
    },
    {
      id: 3,
      name: 'Developer Feed',
      feed_url: 'https://example.com/dev.xml',
      url: 'https://example.com/dev.xml',
      category: 'dev',
      lang: '',
      active: true,
      created_at: '2025-01-13T09:00:00Z',
    },
  ];

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(useSources.useSources).mockReturnValue({
      sources: mockSources,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(useSourceSearch.useSourceSearch).mockReturnValue({
      sources: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Backend responds 204 No Content
    vi.mocked(sourcesApi.updateSourceActive).mockResolvedValue(undefined);

    // Default to the admin role (D-27): management UI is admin-only.
    // Viewer-specific tests override this per-test.
    vi.mocked(useAuth.useMe).mockReturnValue({
      me: { sub: 'admin@example.com', role: 'admin' },
      role: 'admin',
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithClient = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  describe('Management UI (authenticated user)', () => {
    it('should display the Add Source button', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert - the admin role always sees the management UI
      expect(screen.getByRole('button', { name: /add source/i })).toBeInTheDocument();
    });

    it('should display ActiveToggle on all source cards', async () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      await waitFor(() => {
        const toggles = screen.getAllByRole('switch');
        expect(toggles).toHaveLength(3);
      });
    });

    it('should not display StatusBadge when toggles are shown', async () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      await waitFor(() => {
        // StatusBadge shows "Active" or "Inactive" text
        // With ActiveToggle, these texts should not appear
        expect(screen.queryByText('Active')).not.toBeInTheDocument();
        expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
      });
    });

    it('should show toggles in correct initial states', async () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      await waitFor(() => {
        const toggles = screen.getAllByRole('switch');

        // First source is active
        expect(toggles[0]).toBeChecked();

        // Second source is inactive
        expect(toggles[1]).not.toBeChecked();

        // Third source is active
        expect(toggles[2]).toBeChecked();
      });
    });
  });

  describe('Viewer role (read-only, D-27)', () => {
    beforeEach(() => {
      vi.mocked(useAuth.useMe).mockReturnValue({
        me: { sub: 'friend@example.com', role: 'viewer' },
        role: 'viewer',
        isLoading: false,
        error: null,
      });
    });

    it('should NOT display the Add Source button', () => {
      renderWithClient(<SourcesPage />);

      expect(screen.queryByRole('button', { name: /add source/i })).not.toBeInTheDocument();
    });

    it('should NOT display the search panel (search is 403 for viewers)', () => {
      renderWithClient(<SourcesPage />);

      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument();
    });

    it('should render read-only cards: StatusBadge instead of toggles, no edit/delete', async () => {
      renderWithClient(<SourcesPage />);

      await waitFor(() => {
        // No ActiveToggle switches
        expect(screen.queryAllByRole('switch')).toHaveLength(0);
        // StatusBadge text appears instead (server returns active only in
        // production; the mocked list has 2 active + 1 inactive here)
        expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
      });

      expect(screen.queryByRole('button', { name: /edit source/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete source/i })).not.toBeInTheDocument();
    });

    it('should still list the sources themselves', async () => {
      renderWithClient(<SourcesPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Blog')).toBeInTheDocument();
        expect(screen.getByText('News Site')).toBeInTheDocument();
        expect(screen.getByText('Developer Feed')).toBeInTheDocument();
      });
    });
  });

  describe('Toggle Interaction', () => {
    it('should call updateSourceActive API when toggle is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[0]!); // Toggle first source (active → inactive)

      // Assert
      await waitFor(() => {
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledTimes(1);
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledWith(1, false);
      });
    });

    it('should update cache optimistically', async () => {
      // Arrange
      const user = userEvent.setup();
      let resolveUpdate: () => void;
      const updatePromise = new Promise<void>((resolve) => {
        resolveUpdate = resolve;
      });
      vi.mocked(sourcesApi.updateSourceActive).mockReturnValue(updatePromise);

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      const toggles = screen.getAllByRole('switch');
      expect(toggles[0]!).toBeChecked();

      await user.click(toggles[0]!);

      // Assert - Should update optimistically (before API resolves)
      await waitFor(() => {
        expect(toggles[0]!).not.toBeChecked();
      });

      // Resolve the API call (backend responds 204 No Content)
      resolveUpdate!();
    });

    it('should invalidate query cache after successful update', async () => {
      // Arrange
      const user = userEvent.setup();
      const refetchMock = vi.fn();
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: mockSources,
        isLoading: false,
        error: null,
        refetch: refetchMock,
      });

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[0]!);

      // Assert
      await waitFor(() => {
        expect(sourcesApi.updateSourceActive).toHaveBeenCalled();
      });
    });

    it('should handle toggling multiple sources sequentially', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(sourcesApi.updateSourceActive)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      const toggles = screen.getAllByRole('switch');

      // Toggle first source
      await user.click(toggles[0]!);

      await waitFor(() => {
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledWith(1, false);
      });

      // Toggle second source
      await user.click(toggles[1]!);

      // Assert
      await waitFor(() => {
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledWith(2, true);
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message when toggle fails', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(sourcesApi.updateSourceActive).mockRejectedValue(new ApiError('Server error', 500));

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      const toggles = screen.getAllByRole('switch');
      await user.click(toggles[0]!);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Server error. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should revert toggle state on error', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(sourcesApi.updateSourceActive).mockRejectedValue(new Error('Network error'));

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      const toggles = screen.getAllByRole('switch');

      // Initial state: checked
      expect(toggles[0]!).toBeChecked();

      await user.click(toggles[0]!);

      // Assert - Should revert to checked after error
      await waitFor(() => {
        expect(toggles[0]!).toBeChecked();
      });
    });

    it('should show 403 Forbidden error message', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(sourcesApi.updateSourceActive).mockRejectedValue(new ApiError('Forbidden', 403));

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      await user.click(screen.getAllByRole('switch')[0]!);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("You don't have permission to perform this action.")
        ).toBeInTheDocument();
      });
    });

    it('should show 404 Not Found error message', async () => {
      // Arrange
      const user = userEvent.setup();
      vi.mocked(sourcesApi.updateSourceActive).mockRejectedValue(new ApiError('Not Found', 404));

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      await user.click(screen.getAllByRole('switch')[0]!);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Source not found. Please refresh the page.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading skeletons while fetching sources', () => {
      // Arrange
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: [],
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      // Act
      const { container } = renderWithClient(<SourcesPage />);

      // Assert
      // Should show skeleton loaders (animate-pulse class)
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not show source cards while loading', () => {
      // Arrange
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: mockSources,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.queryByText('Tech Blog')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetching sources fails', () => {
      // Arrange
      const mockError = new ApiError('Failed to fetch sources', 500);
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: [],
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
      });

      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByText(/Failed to fetch sources/i)).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      // Arrange
      const mockError = new Error('Network error');
      const refetchMock = vi.fn();
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: [],
        isLoading: false,
        error: mockError,
        refetch: refetchMock,
      });

      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no sources exist', () => {
      // Arrange
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByText('No sources configured')).toBeInTheDocument();
      expect(screen.getByText(/Feed sources will appear here/i)).toBeInTheDocument();
    });

    it('should show RSS icon in empty state', () => {
      // Arrange
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      // Act
      const { container } = renderWithClient(<SourcesPage />);

      // Assert
      const rssIcon = container.querySelector('svg');
      expect(rssIcon).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render all sources in a grid', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByText('Tech Blog')).toBeInTheDocument();
      expect(screen.getByText('News Site')).toBeInTheDocument();
      expect(screen.getByText('Developer Feed')).toBeInTheDocument();
    });

    it('should display total count of sources', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByText('Total: 3 sources')).toBeInTheDocument();
    });

    it('should handle singular vs plural for source count', () => {
      // Arrange
      vi.mocked(useSources.useSources).mockReturnValue({
        sources: [mockSources[0]!],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByText('Total: 1 source')).toBeInTheDocument();
    });
  });

  describe('Page Header', () => {
    it('should display page title', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByText('Sources')).toBeInTheDocument();
    });

    it('should display page description', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByText('RSS/Atom feeds being tracked')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible source cards', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3);
    });

    it('should have accessible labels for each source', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      expect(screen.getByLabelText('Source: Tech Blog')).toBeInTheDocument();
      expect(screen.getByLabelText('Source: News Site')).toBeInTheDocument();
      expect(screen.getByLabelText('Source: Developer Feed')).toBeInTheDocument();
    });

    it('should have accessible time elements', () => {
      // Act
      renderWithClient(<SourcesPage />);

      // Assert
      const timeElements = screen.getAllByRole('time');
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Scenarios', () => {
    it('should work correctly when toggling from active to inactive and back', async () => {
      // Arrange
      const user = userEvent.setup();

      vi.mocked(sourcesApi.updateSourceActive)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      renderWithClient(<SourcesPage />);

      // Act
      await waitFor(() => {
        expect(screen.getAllByRole('switch')).toHaveLength(3);
      });

      const toggles = screen.getAllByRole('switch');

      // Initial state: active (checked)
      expect(toggles[0]!).toBeChecked();

      // Toggle to inactive
      await user.click(toggles[0]!);

      await waitFor(() => {
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledWith(1, false);
      });

      // Toggle back to active
      await user.click(toggles[0]!);

      // Assert
      await waitFor(() => {
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledWith(1, true);
        expect(sourcesApi.updateSourceActive).toHaveBeenCalledTimes(2);
      });
    });
  });
});
