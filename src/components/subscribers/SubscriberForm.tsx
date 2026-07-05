'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FormField } from '@/components/common/FormField';
import { SUBSCRIBER_LIMITS, SUBSCRIBER_TEST_IDS } from '@/constants/subscriber';
import {
  validateSubscriberForm,
  type SubscriberFormData,
  type SubscriberFormErrors,
} from '@/utils/validation/subscriberValidation';

export interface SubscriberFormProps {
  /** Form mode: create or edit */
  mode: 'create' | 'edit';
  /** Initial form data (for edit mode) */
  initialData?: SubscriberFormData;
  /**
   * Callback when the form is submitted with valid data.
   * Receives ALL fields — PUT /subscribers/:id is a full replacement,
   * so edit mode must always send the complete state.
   */
  onSubmit: (data: SubscriberFormData) => Promise<void>;
  /** Whether a submission is in progress */
  isLoading: boolean;
  /** API error to display */
  error: Error | null;
  /** Callback when cancel button is clicked */
  onCancel: () => void;
}

const defaultFormData: SubscriberFormData = {
  name: '',
  email: '',
  note: '',
};

/**
 * SubscriberForm - create/edit form for friends.
 *
 * Name is required; email (for episode notifications) and note are
 * optional. Edit mode submits every field because the backend PUT is a
 * full replacement (empty fields clear the stored value).
 */
export function SubscriberForm({
  mode,
  initialData,
  onSubmit,
  isLoading,
  error,
  onCancel,
}: SubscriberFormProps) {
  const [formData, setFormData] = React.useState<SubscriberFormData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = React.useState<SubscriberFormErrors>({});

  const handleChange = (field: keyof SubscriberFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof SubscriberFormData) => {
    const fieldErrors = validateSubscriberForm(formData);
    setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateSubscriberForm(formData);
    setErrors(newErrors);

    if (newErrors.name || newErrors.email || newErrors.note) {
      return;
    }

    await onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      note: formData.note.trim(),
    });
  };

  const submitButtonText = mode === 'create' ? 'Add Friend' : 'Save Changes';
  const loadingButtonText = mode === 'create' ? 'Adding...' : 'Saving...';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert error={error} />

      {/* Name Field */}
      <FormField label="Name" required htmlFor="subscriber-name" error={errors.name}>
        <Input
          id="subscriber-name"
          data-testid={SUBSCRIBER_TEST_IDS.NAME_INPUT}
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g., Taro"
          aria-required="true"
          aria-invalid={!!errors.name}
          disabled={isLoading}
          maxLength={SUBSCRIBER_LIMITS.NAME_MAX_LENGTH}
        />
      </FormField>

      {/* Email Field */}
      <FormField label="Email" htmlFor="subscriber-email" error={errors.email}>
        <Input
          id="subscriber-email"
          type="email"
          data-testid={SUBSCRIBER_TEST_IDS.EMAIL_INPUT}
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="friend@example.com (optional, for new episode emails)"
          aria-invalid={!!errors.email}
          disabled={isLoading}
          maxLength={SUBSCRIBER_LIMITS.EMAIL_MAX_LENGTH}
        />
      </FormField>

      {/* Note Field */}
      <FormField label="Note" htmlFor="subscriber-note" error={errors.note}>
        <Textarea
          id="subscriber-note"
          data-testid={SUBSCRIBER_TEST_IDS.NOTE_INPUT}
          value={formData.note}
          onChange={(e) => handleChange('note', e.target.value)}
          onBlur={() => handleBlur('note')}
          placeholder="Anything to remember about this friend (optional)"
          aria-invalid={!!errors.note}
          disabled={isLoading}
          maxLength={SUBSCRIBER_LIMITS.NOTE_MAX_LENGTH}
          rows={3}
        />
      </FormField>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid={SUBSCRIBER_TEST_IDS.CANCEL_BUTTON}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} data-testid={SUBSCRIBER_TEST_IDS.SAVE_BUTTON}>
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
