'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FormField } from '@/components/common/FormField';
import { VIEWER_LIMITS, VIEWER_TEST_IDS } from '@/constants/viewer';
import {
  validateViewerForm,
  type ViewerFormData,
  type ViewerFormErrors,
} from '@/utils/validation/viewerValidation';

export interface ViewerFormProps {
  /** Form mode: create (password required) or edit (password optional) */
  mode: 'create' | 'edit';
  /** Initial form data (for edit mode; password should be '') */
  initialData?: ViewerFormData;
  /**
   * Callback when the form is submitted with valid data. In edit mode an
   * empty password means "keep the current password" (the caller must omit
   * the password key from the PUT body).
   */
  onSubmit: (data: ViewerFormData) => Promise<void>;
  /** Whether a submission is in progress */
  isLoading: boolean;
  /** API error to display */
  error: Error | null;
  /** Callback when cancel button is clicked */
  onCancel: () => void;
}

const defaultFormData: ViewerFormData = {
  name: '',
  email: '',
  password: '',
};

/**
 * ViewerForm - create/edit form for read-only viewer accounts (D-27).
 *
 * Name and email (the login identifier) are required. Password is required
 * on create (8–72 bytes, set by the admin and shared out-of-band); on edit
 * it is optional and blank keeps the current password.
 */
export function ViewerForm({
  mode,
  initialData,
  onSubmit,
  isLoading,
  error,
  onCancel,
}: ViewerFormProps) {
  const [formData, setFormData] = React.useState<ViewerFormData>(initialData || defaultFormData);
  const [errors, setErrors] = React.useState<ViewerFormErrors>({});

  const handleChange = (field: keyof ViewerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof ViewerFormData) => {
    const fieldErrors = validateViewerForm(formData, mode);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateViewerForm(formData, mode);
    setErrors(newErrors);

    if (newErrors.name || newErrors.email || newErrors.password) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      // Password is never trimmed: leading/trailing spaces are legal.
      password: formData.password,
    });
  };

  const submitButtonText = mode === 'create' ? 'Add Viewer' : 'Save Changes';
  const loadingButtonText = mode === 'create' ? 'Adding...' : 'Saving...';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert error={error} />

      {/* Name Field */}
      <FormField label="Name" required htmlFor="viewer-name" error={errors.name}>
        <Input
          id="viewer-name"
          data-testid={VIEWER_TEST_IDS.NAME_INPUT}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g., Alice"
          aria-required="true"
          aria-invalid={!!errors.name}
          disabled={isLoading}
          maxLength={VIEWER_LIMITS.NAME_MAX_LENGTH}
        />
      </FormField>

      {/* Email Field */}
      <FormField label="Email" required htmlFor="viewer-email" error={errors.email}>
        <Input
          id="viewer-email"
          type="email"
          data-testid={VIEWER_TEST_IDS.EMAIL_INPUT}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="friend@example.com (used to log in)"
          aria-required="true"
          aria-invalid={!!errors.email}
          disabled={isLoading}
          maxLength={VIEWER_LIMITS.EMAIL_MAX_LENGTH}
        />
      </FormField>

      {/* Password Field */}
      <FormField
        label={mode === 'create' ? 'Password' : 'New Password'}
        required={mode === 'create'}
        htmlFor="viewer-password"
        error={errors.password}
      >
        <Input
          id="viewer-password"
          type="password"
          autoComplete="new-password"
          data-testid={VIEWER_TEST_IDS.PASSWORD_INPUT}
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          placeholder={
            mode === 'create'
              ? '8-72 bytes; share it with your friend yourself'
              : 'Leave blank to keep the current password'
          }
          aria-required={mode === 'create'}
          aria-invalid={!!errors.password}
          disabled={isLoading}
        />
      </FormField>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid={VIEWER_TEST_IDS.CANCEL_BUTTON}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-testid={VIEWER_TEST_IDS.SAVE_BUTTON}>
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
