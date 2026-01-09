/**
 * Source Filter Utilities Tests
 *
 * Test coverage for sourceFilters.ts predicate-based filtering utilities.
 * Target coverage: >= 90%
 */

import { describe, it, expect } from 'vitest';
import {
  sourceFilters,
  filterSources,
  composeFilters,
  type SourceFilterPredicate,
} from './sourceFilters';
import type { Source } from '@/types/api';

/**
 * Helper to create mock Source entities
 */
const createMockSource = (overrides?: Partial<Source>): Source => ({
  id: 1,
  name: 'Test Source',
  feed_url: 'https://example.com/feed.xml',
  last_crawled_at: '2026-01-09T00:00:00Z',
  active: true,
  ...overrides,
});

describe('sourceFilters.active', () => {
  it('should return true for active source', () => {
    const source = createMockSource({ active: true });
    expect(sourceFilters.active(source)).toBe(true);
  });

  it('should return false for inactive source', () => {
    const source = createMockSource({ active: false });
    expect(sourceFilters.active(source)).toBe(false);
  });

  it('should return false for source with undefined active field', () => {
    const source = createMockSource();
    // @ts-expect-error - Testing defensive behavior for undefined active field
    delete source.active;
    expect(sourceFilters.active(source)).toBe(false);
  });

  it('should use strict equality to handle truthy/falsy values', () => {
    // Test that we use === true, not just truthiness
    const sourceWithTruthyValue = createMockSource();
    // @ts-expect-error - Testing defensive behavior for non-boolean active
    sourceWithTruthyValue.active = 1;
    expect(sourceFilters.active(sourceWithTruthyValue)).toBe(false);

    const sourceWithFalsyValue = createMockSource();
    // @ts-expect-error - Testing defensive behavior for non-boolean active
    sourceWithFalsyValue.active = 0;
    expect(sourceFilters.active(sourceWithFalsyValue)).toBe(false);
  });
});

describe('sourceFilters.all', () => {
  it('should return true for any source', () => {
    const activeSource = createMockSource({ active: true });
    const inactiveSource = createMockSource({ active: false });

    expect(sourceFilters.all(activeSource)).toBe(true);
    expect(sourceFilters.all(inactiveSource)).toBe(true);
  });

  it('should return true even for source with missing fields', () => {
    const source = createMockSource();
    delete source.last_crawled_at;
    expect(sourceFilters.all(source)).toBe(true);
  });
});

describe('filterSources', () => {
  it('should filter to only active sources by default', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, name: 'Active 1', active: true }),
      createMockSource({ id: 2, name: 'Inactive', active: false }),
      createMockSource({ id: 3, name: 'Active 2', active: true }),
    ];

    const result = filterSources(sources);

    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('Active 1');
    expect(result[1]?.name).toBe('Active 2');
  });

  it('should return all sources with sourceFilters.all predicate', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, active: true }),
      createMockSource({ id: 2, active: false }),
      createMockSource({ id: 3, active: true }),
    ];

    const result = filterSources(sources, sourceFilters.all);

    expect(result).toHaveLength(3);
    expect(result).toEqual(sources);
  });

  it('should work with custom predicate', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, name: 'Tech Blog', active: true }),
      createMockSource({ id: 2, name: 'News Site', active: true }),
      createMockSource({ id: 3, name: 'Tech News', active: true }),
    ];

    const customPredicate: SourceFilterPredicate = (source) => source.name.includes('Tech');

    const result = filterSources(sources, customPredicate);

    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('Tech Blog');
    expect(result[1]?.name).toBe('Tech News');
  });

  it('should return empty array when no sources match', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, active: false }),
      createMockSource({ id: 2, active: false }),
    ];

    const result = filterSources(sources);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle empty source array', () => {
    const result = filterSources([]);

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should handle sources with undefined active field', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, active: true }),
      // @ts-expect-error - Testing defensive behavior
      { id: 2, name: 'No Active Field', feed_url: 'https://x.com' },
      createMockSource({ id: 3, active: false }),
    ];

    const result = filterSources(sources);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(1);
  });
});

describe('composeFilters', () => {
  it('should combine predicates with AND logic by default', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, name: 'Tech Blog', active: true }),
      createMockSource({ id: 2, name: 'Tech News', active: false }),
      createMockSource({ id: 3, name: 'News Site', active: true }),
    ];

    const isActive: SourceFilterPredicate = (s) => s.active === true;
    const hasTechInName: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const composed = composeFilters([isActive, hasTechInName]);

    const result = sources.filter(composed);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Tech Blog');
  });

  it('should combine predicates with AND logic when mode is explicit', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, name: 'Active Tech', active: true }),
      createMockSource({ id: 2, name: 'Inactive Tech', active: false }),
    ];

    const isActive: SourceFilterPredicate = (s) => s.active === true;
    const hasTechInName: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const composed = composeFilters([isActive, hasTechInName], 'AND');

    const result = sources.filter(composed);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Active Tech');
  });

  it('should combine predicates with OR logic', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, name: 'Tech Blog', active: false }),
      createMockSource({ id: 2, name: 'News Site', active: true }),
      createMockSource({ id: 3, name: 'Sports News', active: false }),
    ];

    const isActive: SourceFilterPredicate = (s) => s.active === true;
    const hasTechInName: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const composed = composeFilters([isActive, hasTechInName], 'OR');

    const result = sources.filter(composed);

    expect(result).toHaveLength(2);
    expect(result.map((s) => s.name)).toEqual(['Tech Blog', 'News Site']);
  });

  it('should return true for AND mode when all predicates pass', () => {
    const source = createMockSource({ name: 'Tech Blog', active: true });

    const predicate1: SourceFilterPredicate = (s) => s.active === true;
    const predicate2: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const predicate3: SourceFilterPredicate = (s) => s.name.includes('Blog');
    const composed = composeFilters([predicate1, predicate2, predicate3], 'AND');

    expect(composed(source)).toBe(true);
  });

  it('should return false for AND mode when any predicate fails', () => {
    const source = createMockSource({ name: 'Tech Blog', active: false });

    const predicate1: SourceFilterPredicate = (s) => s.active === true;
    const predicate2: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const composed = composeFilters([predicate1, predicate2], 'AND');

    expect(composed(source)).toBe(false);
  });

  it('should return true for OR mode when at least one predicate passes', () => {
    const source = createMockSource({ name: 'Tech Blog', active: false });

    const predicate1: SourceFilterPredicate = (s) => s.active === true;
    const predicate2: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const composed = composeFilters([predicate1, predicate2], 'OR');

    expect(composed(source)).toBe(true);
  });

  it('should return false for OR mode when all predicates fail', () => {
    const source = createMockSource({ name: 'News Site', active: false });

    const predicate1: SourceFilterPredicate = (s) => s.active === true;
    const predicate2: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const composed = composeFilters([predicate1, predicate2], 'OR');

    expect(composed(source)).toBe(false);
  });

  it('should handle empty predicates array with AND mode', () => {
    const source = createMockSource();
    const composed = composeFilters([], 'AND');

    // Array.every() returns true for empty array
    expect(composed(source)).toBe(true);
  });

  it('should handle empty predicates array with OR mode', () => {
    const source = createMockSource();
    const composed = composeFilters([], 'OR');

    // Array.some() returns false for empty array
    expect(composed(source)).toBe(false);
  });

  it('should work with single predicate', () => {
    const source = createMockSource({ active: true });
    const composed = composeFilters([sourceFilters.active]);

    expect(composed(source)).toBe(true);
  });
});

describe('Performance benchmarks', () => {
  /**
   * Performance target: Filter operation < 1ms
   * These tests verify the filter operations meet performance requirements.
   */

  it('should filter small dataset (50 sources) under 1ms', () => {
    const sources: Source[] = Array.from({ length: 50 }, (_, i) =>
      createMockSource({
        id: i + 1,
        name: `Source ${i + 1}`,
        active: i % 2 === 0, // 50% active
      })
    );

    const start = performance.now();
    const result = filterSources(sources);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1);
    expect(result).toHaveLength(25); // 50% of 50
  });

  it('should filter medium dataset (500 sources) under 5ms', () => {
    const sources: Source[] = Array.from({ length: 500 }, (_, i) =>
      createMockSource({
        id: i + 1,
        name: `Source ${i + 1}`,
        active: i % 3 === 0, // ~33% active
      })
    );

    const start = performance.now();
    const result = filterSources(sources);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5);
    expect(result).toHaveLength(167); // ceiling of 500/3
  });

  it('should handle stress test with 1000+ sources under 10ms', () => {
    const sources: Source[] = Array.from({ length: 1000 }, (_, i) =>
      createMockSource({
        id: i + 1,
        name: `Source ${i + 1}`,
        active: i % 10 === 0, // 10% active
      })
    );

    const start = performance.now();
    const result = filterSources(sources);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(10);
    expect(result).toHaveLength(100); // 10% of 1000
  });

  it('should compose filters efficiently with large dataset', () => {
    const sources: Source[] = Array.from({ length: 500 }, (_, i) =>
      createMockSource({
        id: i + 1,
        name: i % 5 === 0 ? `Tech Source ${i}` : `Source ${i}`,
        active: i % 2 === 0,
      })
    );

    const isActive: SourceFilterPredicate = (s) => s.active === true;
    const hasTech: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const composed = composeFilters([isActive, hasTech], 'AND');

    const start = performance.now();
    const result = sources.filter(composed);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should maintain O(n) complexity - linear scaling', () => {
    // Test 100 sources
    const sources100 = Array.from({ length: 100 }, (_, i) =>
      createMockSource({ id: i, active: i % 2 === 0 })
    );
    const start100 = performance.now();
    filterSources(sources100);
    const duration100 = performance.now() - start100;

    // Test 1000 sources (10x)
    const sources1000 = Array.from({ length: 1000 }, (_, i) =>
      createMockSource({ id: i, active: i % 2 === 0 })
    );
    const start1000 = performance.now();
    filterSources(sources1000);
    const duration1000 = performance.now() - start1000;

    // With O(n) complexity, 10x input should be roughly 10x time
    // Allow generous 50x multiplier for test stability
    expect(duration1000).toBeLessThan(duration100 * 50);
  });
});

describe('Integration scenarios', () => {
  it('should handle realistic mixed filtering scenario', () => {
    const sources: Source[] = [
      createMockSource({
        id: 1,
        name: 'Active Tech Blog',
        active: true,
        last_crawled_at: '2026-01-09T10:00:00Z',
      }),
      createMockSource({
        id: 2,
        name: 'Inactive Tech Blog',
        active: false,
        last_crawled_at: '2025-12-01T10:00:00Z',
      }),
      createMockSource({
        id: 3,
        name: 'Active News Site',
        active: true,
        last_crawled_at: '2026-01-09T09:00:00Z',
      }),
      createMockSource({
        id: 4,
        name: 'Active Old Tech',
        active: true,
        last_crawled_at: '2025-11-01T10:00:00Z',
      }),
    ];

    // Scenario: Active sources that were crawled in 2026
    const isActive: SourceFilterPredicate = (s) => s.active === true;
    const isCrawledIn2026: SourceFilterPredicate = (s) =>
      s.last_crawled_at?.startsWith('2026') ?? false;

    const composed = composeFilters([isActive, isCrawledIn2026], 'AND');
    const result = sources.filter(composed);

    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('Active Tech Blog');
    expect(result[1]?.name).toBe('Active News Site');
  });

  it('should support chaining filterSources with composed predicates', () => {
    const sources: Source[] = [
      createMockSource({ id: 1, name: 'Tech Blog', active: true }),
      createMockSource({ id: 2, name: 'News Site', active: true }),
      createMockSource({ id: 3, name: 'Tech News', active: false }),
    ];

    const hasTechInName: SourceFilterPredicate = (s) => s.name.includes('Tech');
    const activeWithTech = composeFilters([sourceFilters.active, hasTechInName], 'AND');

    const result = filterSources(sources, activeWithTech);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Tech Blog');
  });
});
