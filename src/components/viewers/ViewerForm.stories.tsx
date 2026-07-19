import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ViewerForm } from './ViewerForm';

/**
 * ViewerForm Component
 *
 * Create/edit form for read-only viewer accounts (D-27). Password is
 * required on create (8-72 bytes) and optional on edit (blank keeps the
 * current password).
 */
const meta = {
  title: 'Viewers/ViewerForm',
  component: ViewerForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onSubmit: async () => {},
    onCancel: () => {},
    isLoading: false,
    error: null,
  },
} satisfies Meta<typeof ViewerForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Create mode: password required
 */
export const Create: Story = {
  args: {
    mode: 'create',
  },
};

/**
 * Edit mode: seeded with existing values, blank password keeps the
 * current one
 */
export const Edit: Story = {
  args: {
    mode: 'edit',
    initialData: {
      name: 'Alice',
      email: 'alice@example.com',
      password: '',
    },
  },
};

/**
 * Submitting state
 */
export const Submitting: Story = {
  args: {
    mode: 'create',
    isLoading: true,
  },
};

/**
 * With API error (e.g., duplicate email 409)
 */
export const WithError: Story = {
  args: {
    mode: 'create',
    error: new Error('email already exists'),
  },
};
