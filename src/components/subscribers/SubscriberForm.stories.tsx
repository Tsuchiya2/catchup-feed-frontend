import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SubscriberForm } from './SubscriberForm';

/**
 * SubscriberForm Component
 *
 * Create/edit form for friends. Name required; email and note optional.
 * Edit mode always submits every field because PUT /subscribers/:id is a
 * full replacement on the backend.
 */
const meta = {
  title: 'Subscribers/SubscriberForm',
  component: SubscriberForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SubscriberForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Create mode (empty form)
 */
export const Create: Story = {
  args: {
    mode: 'create',
    onSubmit: async () => {},
    isLoading: false,
    error: null,
    onCancel: () => {},
  },
};

/**
 * Edit mode seeded with the current values
 */
export const Edit: Story = {
  args: {
    mode: 'edit',
    initialData: {
      name: 'Taro',
      email: 'taro@example.com',
      note: 'College friend.',
    },
    onSubmit: async () => {},
    isLoading: false,
    error: null,
    onCancel: () => {},
  },
};

/**
 * Submitting state
 */
export const Loading: Story = {
  args: {
    ...Create.args,
    isLoading: true,
  },
};

/**
 * With an API error
 */
export const WithError: Story = {
  args: {
    ...Create.args,
    error: new Error('name is required'),
  },
};
