'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FormField } from '@/components/common/FormField';
import { SOURCE_TEST_IDS, SOURCE_ARIA_LABELS } from '@/constants/source';
import {
  validateSourceName,
  validateSourceFeedURL,
  validateSourceCategory,
  validateSourceLang,
  type SourceFormData,
  type SourceFormErrors,
} from '@/utils/validation/sourceValidation';
import { SOURCE_CONFIG } from '@/config/sourceConfig';
import type { SourceKind } from '@/types/api';

/**
 * Text form fields (validated as strings); `kind` is handled separately
 * because it is a constrained select and needs no validation.
 */
type TextField = Exclude<keyof SourceFormData, 'kind'>;

/**
 * Selectable source kinds with display labels.
 * 'rss' first: it is the default and the overwhelmingly common case.
 */
const KIND_OPTIONS: ReadonlyArray<{ value: SourceKind; label: string }> = [
  { value: 'rss', label: 'RSS' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'podcast', label: 'Podcast' },
];

/**
 * SourceForm Component Props
 */
export interface SourceFormProps {
  /** Form mode: create or edit */
  mode: 'create' | 'edit';
  /** Initial form data (for edit mode) */
  initialData?: SourceFormData;
  /** Callback when form is submitted with valid data */
  onSubmit: (data: SourceFormData) => Promise<void>;
  /** Whether a submission is in progress */
  isLoading: boolean;
  /** API error to display */
  error: Error | null;
  /** Callback when cancel button is clicked */
  onCancel: () => void;
}

/**
 * Default form data for create mode
 */
const defaultFormData: SourceFormData = {
  name: '',
  feedURL: '',
  category: '',
  lang: '',
  kind: 'rss',
};

/**
 * SourceForm Component
 *
 * A reusable form component for creating and editing RSS/Atom feed sources.
 * Supports both create and edit modes with proper validation and error handling.
 *
 * Features:
 * - Client-side validation with real-time feedback
 * - Accessible form controls with ARIA labels
 * - Loading states during submission
 * - Error display for API errors
 * - Input trimming before submission
 *
 * @example
 * ```tsx
 * // Create mode
 * <SourceForm
 *   mode="create"
 *   onSubmit={async (data) => await createSource(data)}
 *   isLoading={isPending}
 *   error={error}
 *   onCancel={() => setIsOpen(false)}
 * />
 *
 * // Edit mode
 * <SourceForm
 *   mode="edit"
 *   initialData={{ name: 'Tech Blog', feedURL: 'https://example.com/feed' }}
 *   onSubmit={async (data) => await updateSource(data)}
 *   isLoading={isPending}
 *   error={error}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */
export function SourceForm({
  mode,
  initialData,
  onSubmit,
  isLoading,
  error,
  onCancel,
}: SourceFormProps) {
  const [formData, setFormData] = React.useState<SourceFormData>(initialData || defaultFormData);
  const [errors, setErrors] = React.useState<SourceFormErrors>({});

  /**
   * Validate a single field
   */
  const validateField = (field: TextField, value: string): string | undefined => {
    if (field === 'name') {
      return validateSourceName(value);
    }

    if (field === 'feedURL') {
      return validateSourceFeedURL(value);
    }

    if (field === 'category') {
      return validateSourceCategory(value);
    }

    if (field === 'lang') {
      return validateSourceLang(value);
    }

    return undefined;
  };

  /**
   * Handle field value change
   */
  const handleChange = (field: TextField, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handle kind selection change (no validation: values are constrained)
   */
  const handleKindChange = (kind: SourceKind) => {
    setFormData((prev) => ({ ...prev, kind }));
  };

  /**
   * Handle field blur for validation
   */
  const handleBlur = (field: TextField) => {
    const fieldValue = formData[field];
    const error = validateField(field, fieldValue);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: SourceFormErrors = {
      name: validateField('name', formData.name),
      feedURL: validateField('feedURL', formData.feedURL),
      category: validateField('category', formData.category),
      lang: validateField('lang', formData.lang),
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (newErrors.name || newErrors.feedURL || newErrors.category || newErrors.lang) {
      return;
    }

    // Submit the form with trimmed values
    await onSubmit({
      name: formData.name.trim(),
      feedURL: formData.feedURL.trim(),
      category: formData.category.trim(),
      lang: formData.lang.trim(),
      kind: formData.kind,
    });
  };

  // Submit button text based on mode
  const submitButtonText = mode === 'create' ? 'Add Source' : 'Save Changes';
  const loadingButtonText = mode === 'create' ? 'Adding...' : 'Saving...';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API Error Alert */}
      <ErrorAlert error={error} />

      {/* Name Field */}
      <FormField label="Name" required htmlFor="source-name" error={errors.name}>
        <Input
          id="source-name"
          data-testid={SOURCE_TEST_IDS.NAME_INPUT}
          aria-label={SOURCE_ARIA_LABELS.NAME_INPUT}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g., Tech Blog"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'source-name-error' : undefined}
          disabled={isLoading}
          maxLength={SOURCE_CONFIG.NAME_MAX_LENGTH}
        />
      </FormField>

      {/* Kind Field (constrained select; native element for the mobile picker) */}
      <FormField label="Type" required htmlFor="source-kind">
        <select
          id="source-kind"
          data-testid={SOURCE_TEST_IDS.KIND_SELECT}
          aria-label={SOURCE_ARIA_LABELS.KIND_SELECT}
          value={formData.kind}
          onChange={(e) => handleKindChange(e.target.value as SourceKind)}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 focus-visible:shadow-glow-sm disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          {KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      {/* Feed URL Field */}
      <FormField label="Feed URL" required htmlFor="source-feedURL" error={errors.feedURL}>
        <Input
          id="source-feedURL"
          type="url"
          data-testid={SOURCE_TEST_IDS.URL_INPUT}
          aria-label={SOURCE_ARIA_LABELS.URL_INPUT}
          value={formData.feedURL}
          onChange={(e) => handleChange('feedURL', e.target.value)}
          onBlur={() => handleBlur('feedURL')}
          placeholder="https://example.com/feed.xml"
          aria-required="true"
          aria-invalid={!!errors.feedURL}
          aria-describedby={
            // Error and YouTube help can coexist; point at every visible description.
            [
              errors.feedURL ? 'source-feedURL-error' : null,
              formData.kind === 'youtube' ? 'source-feedURL-help' : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          disabled={isLoading}
          maxLength={SOURCE_CONFIG.URL_MAX_LENGTH}
        />
        {formData.kind === 'youtube' && (
          <p id="source-feedURL-help" className="text-xs text-muted-foreground">
            For YouTube channels, use the RSS form:
            https://www.youtube.com/feeds/videos.xml?channel_id=...
          </p>
        )}
      </FormField>

      {/* Category Field */}
      <FormField label="Category" required htmlFor="source-category" error={errors.category}>
        <Input
          id="source-category"
          data-testid={SOURCE_TEST_IDS.CATEGORY_INPUT}
          aria-label={SOURCE_ARIA_LABELS.CATEGORY_INPUT}
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          onBlur={() => handleBlur('category')}
          placeholder="e.g., dev"
          aria-required="true"
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? 'source-category-error' : undefined}
          disabled={isLoading}
          maxLength={SOURCE_CONFIG.CATEGORY_MAX_LENGTH}
        />
      </FormField>

      {/* Lang Field */}
      <FormField label="Language" htmlFor="source-lang" error={errors.lang}>
        <Input
          id="source-lang"
          data-testid={SOURCE_TEST_IDS.LANG_INPUT}
          aria-label={SOURCE_ARIA_LABELS.LANG_INPUT}
          value={formData.lang}
          onChange={(e) => handleChange('lang', e.target.value)}
          onBlur={() => handleBlur('lang')}
          placeholder="e.g., ja, en (optional)"
          aria-invalid={!!errors.lang}
          aria-describedby={errors.lang ? 'source-lang-error' : undefined}
          disabled={isLoading}
          maxLength={SOURCE_CONFIG.LANG_MAX_LENGTH}
        />
      </FormField>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid={SOURCE_TEST_IDS.CANCEL_BUTTON}
          aria-label={SOURCE_ARIA_LABELS.CANCEL_BUTTON}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          data-testid={SOURCE_TEST_IDS.SAVE_BUTTON}
          aria-label={mode === 'create' ? 'Add source' : SOURCE_ARIA_LABELS.SAVE_BUTTON}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingButtonText}
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}
