import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ViewerCard } from './ViewerCard';
import type { Viewer } from '@/types/api';

/**
 * ViewerCard Component
 *
 * Displays a read-only viewer account (D-27) with active/deactivated
 * status, login email, and management actions. Deactivation is a
 * reversible logical toggle; deletion is physical.
 */
const meta = {
  title: 'Viewers/ViewerCard',
  component: ViewerCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ViewerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const activeViewer: Viewer = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  active: true,
  created_at: '2026-07-01T09:00:00Z',
  updated_at: '2026-07-01T09:00:00Z',
  deactivated_at: null,
};

const deactivatedViewer: Viewer = {
  ...activeViewer,
  id: 2,
  name: 'Bob',
  email: 'bob@example.com',
  active: false,
  deactivated_at: '2026-07-10T12:00:00Z',
};

/**
 * Active viewer with all actions
 */
export const Active: Story = {
  args: {
    viewer: activeViewer,
    onEdit: () => {},
    onToggleActive: () => {},
    onDelete: () => {},
  },
};

/**
 * Deactivated viewer (greyed out, toggle shows Reactivate)
 */
export const Deactivated: Story = {
  args: {
    viewer: deactivatedViewer,
    onEdit: () => {},
    onToggleActive: () => {},
    onDelete: () => {},
  },
};

/**
 * Toggle in flight (button disabled)
 */
export const Toggling: Story = {
  args: {
    viewer: activeViewer,
    onEdit: () => {},
    onToggleActive: () => {},
    onDelete: () => {},
    isToggling: true,
  },
};
