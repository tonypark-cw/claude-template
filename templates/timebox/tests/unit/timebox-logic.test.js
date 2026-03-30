// Unit tests for timebox pure logic functions
import { describe, it, expect } from 'vitest';
import {
  buildTimeline,
  autoAssignTasks,
  placeBreaks,
  computeStats,
  formatBlockTime,
  sortByPriority,
} from '../../src/timebox-logic.js';

describe('buildTimeline', () => {
  it('produces correct number of blocks', () => {
    const tl = buildTimeline(6, 16);
    expect(tl).toHaveLength(192);
  });

  it('first block is start hour, last block is correct', () => {
    const tl = buildTimeline(6, 16);
    expect(tl[0].time).toBe('06:00');
    expect(tl[tl.length - 1].time).toBe('21:55');
  });

  it('custom start hour works', () => {
    const tl = buildTimeline(9, 8);
    expect(tl[0].time).toBe('09:00');
    expect(tl).toHaveLength(96);
  });

  it('wraps past midnight', () => {
    const tl = buildTimeline(22, 4);
    expect(tl[0].time).toBe('22:00');
    expect(tl[tl.length - 1].time).toBe('01:55');
  });

  it('all blocks start with null taskId and done=false', () => {
    const tl = buildTimeline(6, 2);
    tl.forEach(b => {
      expect(b.taskId).toBeNull();
      expect(b.done).toBe(false);
    });
  });

  it('preserves existing assignments in overlapping range', () => {
    const existing = [
      { time: '09:00', taskId: 42, done: true },
      { time: '09:05', taskId: 42, done: false },
    ];
    const tl = buildTimeline(8, 4, existing);
    const block9 = tl.find(b => b.time === '09:00');
    expect(block9.taskId).toBe(42);
    expect(block9.done).toBe(true);
  });

  it('drops assignments outside new range', () => {
    const existing = [{ time: '06:00', taskId: 1, done: false }];
    const tl = buildTimeline(9, 4, existing);
    expect(tl.every(b => b.taskId === null)).toBe(true);
  });
});

describe('autoAssignTasks', () => {
  const emptyTimeline = (n) =>
    Array.from({ length: n }, (_, i) => ({
      time: `${String(Math.floor(i * 5 / 60)).padStart(2, '0')}:${String((i * 5) % 60).padStart(2, '0')}`,
      taskId: null,
      done: false,
    }));

  it('assigns high priority before medium before low', () => {
    const tasks = [
      { id: 1, name: 'Low', blocks: 2, priority: 'low' },
      { id: 2, name: 'High', blocks: 2, priority: 'high' },
      { id: 3, name: 'Med', blocks: 2, priority: 'medium' },
    ];
    const result = autoAssignTasks(tasks, emptyTimeline(10));
    expect(result[0].taskId).toBe(2);
    expect(result[1].taskId).toBe(2);
    expect(result[2].taskId).toBe(3);
    expect(result[3].taskId).toBe(3);
    expect(result[4].taskId).toBe(1);
    expect(result[5].taskId).toBe(1);
  });

  it('fills exact number of blocks per task', () => {
    const tasks = [{ id: 1, name: 'A', blocks: 3, priority: 'high' }];
    const result = autoAssignTasks(tasks, emptyTimeline(10));
    const filled = result.filter(b => b.taskId === 1);
    expect(filled).toHaveLength(3);
  });

  it('skips already assigned blocks', () => {
    const tl = emptyTimeline(6);
    tl[0].taskId = 99;
    const tasks = [{ id: 1, name: 'A', blocks: 2, priority: 'high' }];
    const result = autoAssignTasks(tasks, tl);
    expect(result[0].taskId).toBe(99);
    expect(result[1].taskId).toBe(1);
    expect(result[2].taskId).toBe(1);
  });

  it('handles not enough empty blocks gracefully', () => {
    const tl = emptyTimeline(2);
    const tasks = [{ id: 1, name: 'Big', blocks: 5, priority: 'high' }];
    const result = autoAssignTasks(tasks, tl);
    const filled = result.filter(b => b.taskId === 1);
    expect(filled).toHaveLength(2);
  });

  it('empty tasks produces no changes', () => {
    const tl = emptyTimeline(5);
    const result = autoAssignTasks([], tl);
    expect(result.every(b => b.taskId === null)).toBe(true);
  });
});

describe('placeBreaks', () => {
  const emptyTimeline = (n) =>
    Array.from({ length: n }, () => ({ time: '00:00', taskId: null, done: false }));

  it('places breaks at correct intervals', () => {
    const { timeline: result } = placeBreaks(emptyTimeline(80));
    expect(result[24].taskId).toBe('break');
    expect(result[25].taskId).toBe('break');
    // Next break at 24 + 26 = 50
    expect(result[50].taskId).toBe('break');
    expect(result[51].taskId).toBe('break');
    // Next at 76
    expect(result[76].taskId).toBe('break');
    expect(result[77].taskId).toBe('break');
  });

  it('each break is 2 blocks (10 min)', () => {
    const { timeline: result, count } = placeBreaks(emptyTimeline(30));
    const breaks = result.filter(b => b.taskId === 'break');
    expect(breaks).toHaveLength(2);
    expect(count).toBe(2);
  });

  it('does not overwrite assigned blocks', () => {
    const tl = emptyTimeline(30);
    tl[24].taskId = 42;
    const { timeline: result } = placeBreaks(tl);
    expect(result[24].taskId).toBe(42);
    expect(result[25].taskId).toBe('break');
  });

  it('short timeline gets no breaks', () => {
    const { timeline: result, count } = placeBreaks(emptyTimeline(20));
    expect(count).toBe(0);
    expect(result.every(b => b.taskId === null)).toBe(true);
  });
});

describe('computeStats', () => {
  it('empty timeline returns all zeros', () => {
    expect(computeStats([])).toEqual({ total: 0, assigned: 0, done: 0, progress: 0 });
  });

  it('all assigned none done = 0% progress', () => {
    const tl = [
      { taskId: 1, done: false },
      { taskId: 2, done: false },
    ];
    const s = computeStats(tl);
    expect(s.assigned).toBe(2);
    expect(s.done).toBe(0);
    expect(s.progress).toBe(0);
  });

  it('all assigned all done = 100% progress', () => {
    const tl = [
      { taskId: 1, done: true },
      { taskId: 2, done: true },
    ];
    expect(computeStats(tl).progress).toBe(100);
  });

  it('mixed: correct percentage with rounding', () => {
    const tl = [
      { taskId: 1, done: true },
      { taskId: 2, done: false },
      { taskId: 3, done: false },
    ];
    expect(computeStats(tl).progress).toBe(33);
  });

  it('break blocks count as assigned', () => {
    const tl = [
      { taskId: 'break', done: false },
      { taskId: null, done: false },
    ];
    expect(computeStats(tl).assigned).toBe(1);
  });
});

describe('formatBlockTime', () => {
  it('rounds down to 5-min boundary', () => {
    expect(formatBlockTime(new Date(2026, 0, 1, 14, 3))).toBe('14:00');
    expect(formatBlockTime(new Date(2026, 0, 1, 14, 7))).toBe('14:05');
    expect(formatBlockTime(new Date(2026, 0, 1, 14, 59))).toBe('14:55');
  });

  it('zero-pads single digit hours', () => {
    expect(formatBlockTime(new Date(2026, 0, 1, 0, 0))).toBe('00:00');
    expect(formatBlockTime(new Date(2026, 0, 1, 9, 12))).toBe('09:10');
  });
});

describe('sortByPriority', () => {
  it('sorts high → medium → low', () => {
    const tasks = [
      { id: 1, priority: 'low' },
      { id: 2, priority: 'high' },
      { id: 3, priority: 'medium' },
    ];
    const sorted = sortByPriority(tasks);
    expect(sorted.map(t => t.id)).toEqual([2, 3, 1]);
  });

  it('maintains relative order for same priority', () => {
    const tasks = [
      { id: 1, priority: 'high' },
      { id: 2, priority: 'high' },
      { id: 3, priority: 'high' },
    ];
    const sorted = sortByPriority(tasks);
    expect(sorted.map(t => t.id)).toEqual([1, 2, 3]);
  });

  it('empty array returns empty', () => {
    expect(sortByPriority([])).toEqual([]);
  });
});
