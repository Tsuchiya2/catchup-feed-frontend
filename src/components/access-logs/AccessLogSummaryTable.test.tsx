import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessLogSummaryTable } from './AccessLogSummaryTable';
import type { AccessLogSummary } from '@/types/api';

function summary(overrides: Partial<AccessLogSummary> = {}): AccessLogSummary {
  return {
    subscriber_id: 1,
    subscriber_name: 'Taro',
    active: true,
    last_accessed_at: '2026-07-01T00:00:00Z',
    days_since_last_access: 1,
    count_7d: 3,
    count_30d: 10,
    ...overrides,
  };
}

describe('AccessLogSummaryTable', () => {
  it('renders an empty message when there are no friends', () => {
    render(<AccessLogSummaryTable summaries={[]} />);
    expect(screen.getByText(/No friends registered yet/)).toBeInTheDocument();
  });

  it('renders one row per friend with counts', () => {
    render(
      <AccessLogSummaryTable
        summaries={[
          summary({ subscriber_id: 1, subscriber_name: 'Taro', count_7d: 5, count_30d: 20 }),
        ]}
      />
    );

    const row = screen.getByTestId('summary-row-1');
    expect(within(row).getByText('Taro')).toBeInTheDocument();
    expect(within(row).getByText('5')).toBeInTheDocument();
    expect(within(row).getByText('20')).toBeInTheDocument();
  });

  it('flags friends who never accessed the feed', () => {
    render(
      <AccessLogSummaryTable
        summaries={[summary({ last_accessed_at: null, days_since_last_access: null })]}
      />
    );

    expect(screen.getByText('Never accessed')).toBeInTheDocument();
  });

  it('flags friends silent for 3+ weeks', () => {
    render(<AccessLogSummaryTable summaries={[summary({ days_since_last_access: 25 })]} />);

    expect(screen.getByText('25d silent')).toBeInTheDocument();
  });

  it('sorts friends needing attention to the top', () => {
    render(
      <AccessLogSummaryTable
        summaries={[
          summary({ subscriber_id: 1, subscriber_name: 'Healthy', days_since_last_access: 1 }),
          summary({
            subscriber_id: 2,
            subscriber_name: 'Silent',
            days_since_last_access: 30,
          }),
        ]}
      />
    );

    const rows = screen.getAllByTestId(/summary-row-/);
    expect(rows[0]).toHaveTextContent('Silent');
    expect(rows[1]).toHaveTextContent('Healthy');
  });

  it('calls onSelectSubscriber when a row is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AccessLogSummaryTable summaries={[summary({ subscriber_id: 7 })]} onSelectSubscriber={onSelect} />
    );

    await user.click(screen.getByTestId('summary-row-7'));
    expect(onSelect).toHaveBeenCalledWith(7);
  });
});
