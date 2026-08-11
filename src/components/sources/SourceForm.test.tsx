import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SourceForm } from './SourceForm';
import type { SourceFormData } from '@/utils/validation/sourceValidation';

describe('SourceForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Edit Mode Tests', () => {
    const initialData: SourceFormData = {
      kind: 'rss',
      name: 'Tech Blog',
      feedURL: 'https://example.com/feed.xml',
      category: 'dev',
      lang: 'en',
    };

    it('should render with pre-populated values from initialData', () => {
      render(
        <SourceForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const categoryInput = screen.getByLabelText('カテゴリ');
      const langInput = screen.getByLabelText('言語');

      expect(nameInput).toHaveValue('Tech Blog');
      expect(urlInput).toHaveValue('https://example.com/feed.xml');
      expect(categoryInput).toHaveValue('dev');
      expect(langInput).toHaveValue('en');
    });

    it('should show "Save Changes" button text', () => {
      render(
        <SourceForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: '保存する' });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('保存する');
    });

    it('should show "Saving..." when isLoading is true', () => {
      render(
        <SourceForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          isLoading={true}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('保存中…')).toBeInTheDocument();
      // Check for loading spinner
      const loadingIcon = screen.getByText('保存中…').parentElement;
      expect(loadingIcon?.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Create Mode Tests', () => {
    it('should render with empty values (no initialData)', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const categoryInput = screen.getByLabelText('カテゴリ');
      const langInput = screen.getByLabelText('言語');

      expect(nameInput).toHaveValue('');
      expect(urlInput).toHaveValue('');
      expect(categoryInput).toHaveValue('');
      expect(langInput).toHaveValue('');
    });

    it('should show "Add Source" button text', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: '追加する' });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('追加する');
    });

    it('should show "Adding..." when isLoading is true', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={true}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('追加中…')).toBeInTheDocument();
      // Check for loading spinner
      const loadingIcon = screen.getByText('追加中…').parentElement;
      expect(loadingIcon?.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Validation Tests', () => {
    it('should show error when name field is empty on blur', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');

      // Blur without entering any value
      await user.click(nameInput);
      await user.tab(); // Move to next field (triggers blur)

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when URL field is invalid on blur', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const urlInput = screen.getByLabelText('フィード URL');

      // Enter invalid URL
      await user.type(urlInput, 'not-a-valid-url');
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
      });
    });

    it('should show error when URL field is empty on blur', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const urlInput = screen.getByLabelText('フィード URL');

      // Blur without entering any value
      await user.click(urlInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/feed url is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when category field is empty on blur', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const categoryInput = screen.getByLabelText('カテゴリ');

      // Blur without entering any value
      await user.click(categoryInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/category is required/i)).toBeInTheDocument();
      });
    });

    it('should not show error when lang field is empty on blur (optional)', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const langInput = screen.getByLabelText('言語');

      // Blur without entering any value
      await user.click(langInput);
      await user.tab();

      // Lang is optional, so no error should appear
      expect(screen.queryByText(/maximum 20 characters allowed/i)).not.toBeInTheDocument();
      expect(langInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should clear error when valid input is entered after error', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');

      // Trigger error by blurring empty field
      await user.click(nameInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      // Enter valid value
      await user.type(nameInput, 'Valid Name');
      await user.tab(); // Blur to trigger validation

      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });
    });

    it('should clear URL error when valid URL is entered', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const urlInput = screen.getByLabelText('フィード URL');

      // Enter invalid URL
      await user.type(urlInput, 'invalid');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
      });

      // Clear and enter valid URL
      await user.clear(urlInput);
      await user.type(urlInput, 'https://example.com/feed.xml');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
      });
    });

    it('should show errors for all invalid fields on submit', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole('button', { name: '追加する' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/feed url is required/i)).toBeInTheDocument();
        expect(screen.getByText(/category is required/i)).toBeInTheDocument();
      });

      // Should not call onSubmit when validation fails
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Kind Selection Tests', () => {
    it('should default to rss and hide the YouTube help text', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('ソース種別')).toHaveValue('rss');
      expect(screen.queryByText(/youtube\.com\/feeds\/videos\.xml/i)).not.toBeInTheDocument();
    });

    it('should show the feed URL format help when youtube is selected', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      await user.selectOptions(screen.getByLabelText('ソース種別'), 'youtube');

      expect(
        screen.getByText(/https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=/i)
      ).toBeInTheDocument();
    });

    it('should submit the selected kind', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('ソース名'), 'Some Channel');
      await user.type(
        screen.getByLabelText('フィード URL'),
        'https://www.youtube.com/feeds/videos.xml?channel_id=UC123'
      );
      await user.type(screen.getByLabelText('カテゴリ'), 'tech');
      await user.selectOptions(screen.getByLabelText('ソース種別'), 'youtube');
      await user.click(screen.getByRole('button', { name: '追加する' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          kind: 'youtube',
          name: 'Some Channel',
          feedURL: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC123',
          category: 'tech',
          lang: '',
        });
      });
    });

    it('should submit the newsletter kind when selected', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('ソース名'), 'Weekly Links');
      await user.type(screen.getByLabelText('フィード URL'), 'https://newsletter.example.com/rss');
      await user.type(screen.getByLabelText('カテゴリ'), 'tech');
      await user.selectOptions(screen.getByLabelText('ソース種別'), 'newsletter');
      await user.click(screen.getByRole('button', { name: '追加する' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          kind: 'newsletter',
          name: 'Weekly Links',
          feedURL: 'https://newsletter.example.com/rss',
          category: 'tech',
          lang: '',
        });
      });
    });

    it('should pre-select the kind from initialData in edit mode', () => {
      render(
        <SourceForm
          mode="edit"
          initialData={{
            kind: 'podcast',
            name: 'Some Podcast',
            feedURL: 'https://podcast.example.com/feed.xml',
            category: 'tech',
            lang: 'ja',
          }}
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('ソース種別')).toHaveValue('podcast');
    });
  });

  describe('Form Submission Tests', () => {
    it('should call onSubmit with trimmed values on submit', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const categoryInput = screen.getByLabelText('カテゴリ');
      const langInput = screen.getByLabelText('言語');
      const submitButton = screen.getByRole('button', { name: '追加する' });

      // Enter values with extra whitespace
      await user.type(nameInput, '  Tech Blog  ');
      await user.type(urlInput, '  https://example.com/feed.xml  ');
      await user.type(categoryInput, '  dev  ');
      await user.type(langInput, '  en  ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          kind: 'rss',
          name: 'Tech Blog',
          feedURL: 'https://example.com/feed.xml',
          category: 'dev',
          lang: 'en',
        });
      });
    });

    it('should submit with empty lang (optional field)', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      await user.type(screen.getByLabelText('ソース名'), 'Tech Blog');
      await user.type(screen.getByLabelText('フィード URL'), 'https://example.com/feed.xml');
      await user.type(screen.getByLabelText('カテゴリ'), 'dev');
      await user.click(screen.getByRole('button', { name: '追加する' }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          kind: 'rss',
          name: 'Tech Blog',
          feedURL: 'https://example.com/feed.xml',
          category: 'dev',
          lang: '',
        });
      });
    });

    it('should submit form with valid data in edit mode', async () => {
      const user = userEvent.setup();
      const initialData: SourceFormData = {
        kind: 'rss',
        name: 'Old Name',
        feedURL: 'https://old-url.com/feed',
        category: 'dev',
        lang: 'ja',
      };

      render(
        <SourceForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const submitButton = screen.getByRole('button', { name: '保存する' });

      // Update name
      await user.clear(nameInput);
      await user.type(nameInput, 'New Name');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          kind: 'rss',
          name: 'New Name',
          feedURL: 'https://old-url.com/feed',
          category: 'dev',
          lang: 'ja',
        });
      });
    });

    it('should form be disabled during loading (isLoading=true)', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={true}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const categoryInput = screen.getByLabelText('カテゴリ');
      const langInput = screen.getByLabelText('言語');
      const submitButton = screen.getByRole('button', { name: /追加/ });
      const cancelButton = screen.getByRole('button', { name: '編集をキャンセル' });

      expect(nameInput).toBeDisabled();
      expect(urlInput).toBeDisabled();
      expect(categoryInput).toBeDisabled();
      expect(langInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should not submit when validation fails', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const submitButton = screen.getByRole('button', { name: /追加/ });

      // Enter valid name but invalid URL (empty)
      await user.type(nameInput, 'Valid Name');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/feed url is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error Display Tests', () => {
    it('should display API error alert when error prop is set', () => {
      const error = new Error('Failed to save source');

      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={error}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Failed to save source')).toBeInTheDocument();
    });

    it('should error alert have role="alert" for accessibility', () => {
      const error = new Error('Network error');

      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={error}
          onCancel={mockOnCancel}
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Network error');
    });

    it('should not display error alert when error prop is null', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      // ErrorAlert doesn't render when error is null, so no alert should exist
      // before any form interaction
      const alerts = screen.queryAllByRole('alert');
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Cancel Button Tests', () => {
    it('should call onCancel when Cancel clicked', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '編集をキャンセル' });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should cancel button be disabled during loading', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={true}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: '編集をキャンセル' });
      expect(cancelButton).toBeDisabled();
    });

    it('should cancel button not trigger form submission', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const cancelButton = screen.getByRole('button', { name: '編集をキャンセル' });

      // Enter valid data
      await user.type(nameInput, 'Test Source');
      await user.type(urlInput, 'https://example.com/feed');
      await user.click(cancelButton);

      // onSubmit should not be called
      expect(mockOnSubmit).not.toHaveBeenCalled();
      // onCancel should be called
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA attributes for inputs', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const categoryInput = screen.getByLabelText('カテゴリ');
      const langInput = screen.getByLabelText('言語');

      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      expect(urlInput).toHaveAttribute('aria-required', 'true');
      expect(urlInput).toHaveAttribute('aria-invalid', 'false');
      expect(categoryInput).toHaveAttribute('aria-required', 'true');
      expect(categoryInput).toHaveAttribute('aria-invalid', 'false');
      // Lang is optional
      expect(langInput).not.toHaveAttribute('aria-required');
      expect(langInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should mark invalid inputs with aria-invalid when errors exist', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');

      // Trigger validation error
      await user.click(nameInput);
      await user.tab();

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby for error messages', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const urlInput = screen.getByLabelText('フィード URL');

      // Trigger validation error
      await user.click(urlInput);
      await user.tab();

      await waitFor(() => {
        expect(urlInput).toHaveAttribute('aria-describedby', 'source-feedURL-error');
      });
    });

    it('should reference both the error and the YouTube help in aria-describedby', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      // Select the youtube kind so the format help text is shown
      await user.selectOptions(screen.getByLabelText('ソース種別'), 'youtube');

      const urlInput = screen.getByLabelText('フィード URL');

      // Trigger validation error while the help text is visible
      await user.click(urlInput);
      await user.tab();

      await waitFor(() => {
        expect(urlInput).toHaveAttribute(
          'aria-describedby',
          'source-feedURL-error source-feedURL-help'
        );
      });
    });

    it('should have proper labels for screen readers', () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('ソース名')).toBeInTheDocument();
      expect(screen.getByLabelText('フィード URL')).toBeInTheDocument();
      expect(screen.getByLabelText('カテゴリ')).toBeInTheDocument();
      expect(screen.getByLabelText('言語')).toBeInTheDocument();
      expect(screen.getByLabelText('編集をキャンセル')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      const slowOnSubmit = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      const { rerender } = render(
        <SourceForm
          mode="create"
          onSubmit={slowOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const categoryInput = screen.getByLabelText('カテゴリ');
      const submitButton = screen.getByRole('button', { name: '追加する' });

      // Enter valid data
      await user.type(nameInput, 'Test Source');
      await user.type(urlInput, 'https://example.com/feed');
      await user.type(categoryInput, 'dev');

      // First click
      await user.click(submitButton);

      // Simulate loading state from parent
      rerender(
        <SourceForm
          mode="create"
          onSubmit={slowOnSubmit}
          isLoading={true}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      // Try to click again (should be disabled)
      const disabledButton = screen.getByRole('button', { name: /追加/ });
      expect(disabledButton).toBeDisabled();

      // Should only be called once
      expect(slowOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should handle whitespace-only input as empty', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const submitButton = screen.getByRole('button', { name: '追加する' });

      // Enter whitespace-only value
      await user.type(nameInput, '   ');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should handle form with max length input', async () => {
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');
      const categoryInput = screen.getByLabelText('カテゴリ');
      const langInput = screen.getByLabelText('言語');

      // Name should have maxLength attribute
      expect(nameInput).toHaveAttribute('maxlength', '255');
      // URL should have maxLength attribute
      expect(urlInput).toHaveAttribute('maxlength', '2048');
      // Category should have maxLength attribute
      expect(categoryInput).toHaveAttribute('maxlength', '100');
      // Lang should have maxLength attribute
      expect(langInput).toHaveAttribute('maxlength', '20');
    });

    it('should handle protocol validation for URL', async () => {
      const user = userEvent.setup();
      render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const urlInput = screen.getByLabelText('フィード URL');

      // Test ftp:// protocol (should fail)
      await user.type(urlInput, 'ftp://example.com/feed');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
      });

      // Clear and test valid https://
      await user.clear(urlInput);
      await user.type(urlInput, 'https://example.com/feed');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
      });
    });

    it('should preserve form data when error occurs', async () => {
      const user = userEvent.setup();
      const error = new Error('Save failed');

      const { rerender } = render(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={null}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText('ソース名');
      const urlInput = screen.getByLabelText('フィード URL');

      // Enter data
      await user.type(nameInput, 'Test Source');
      await user.type(urlInput, 'https://example.com/feed');

      // Simulate error from parent
      rerender(
        <SourceForm
          mode="create"
          onSubmit={mockOnSubmit}
          isLoading={false}
          error={error}
          onCancel={mockOnCancel}
        />
      );

      // Form data should be preserved
      expect(nameInput).toHaveValue('Test Source');
      expect(urlInput).toHaveValue('https://example.com/feed');
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });
});
