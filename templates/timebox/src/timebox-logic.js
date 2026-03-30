// Extracted pure logic from timebox app for unit testing

export function buildTimeline(startHour, totalHours, existingTimeline = []) {
  const blocksPerHour = 12;
  const total = totalHours * blocksPerHour;

  const oldMap = {};
  existingTimeline.forEach(b => {
    if (b.taskId !== null) oldMap[b.time] = { taskId: b.taskId, done: b.done };
  });

  const timeline = [];
  for (let i = 0; i < total; i++) {
    const mins = i * 5;
    const h = startHour + Math.floor(mins / 60);
    const m = mins % 60;
    const hh = String(h % 24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    const time = `${hh}:${mm}`;
    const old = oldMap[time];
    timeline.push({
      time,
      taskId: old ? old.taskId : null,
      done: old ? old.done : false,
    });
  }
  return timeline;
}

export function autoAssignTasks(tasks, timeline) {
  const order = { high: 0, medium: 1, low: 2 };
  const sorted = [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
  const result = timeline.map(b => ({ ...b }));

  let ptr = 0;
  for (const task of sorted) {
    let assigned = 0;
    while (assigned < task.blocks && ptr < result.length) {
      if (result[ptr].taskId === null) {
        result[ptr].taskId = task.id;
        assigned++;
      }
      ptr++;
    }
  }
  return result;
}

export function placeBreaks(timeline) {
  const interval = 24;
  const breakLen = 2;
  const result = timeline.map(b => ({ ...b }));
  let count = 0;

  for (let i = interval; i < result.length; i += interval + breakLen) {
    for (let j = 0; j < breakLen && (i + j) < result.length; j++) {
      if (result[i + j].taskId === null) {
        result[i + j].taskId = 'break';
        count++;
      }
    }
  }
  return { timeline: result, count };
}

export function computeStats(timeline) {
  const total = timeline.length;
  const assigned = timeline.filter(b => b.taskId !== null).length;
  const done = timeline.filter(b => b.done).length;
  const progress = assigned > 0 ? Math.round((done / assigned) * 100) : 0;
  return { total, assigned, done, progress };
}

export function formatBlockTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(Math.floor(date.getMinutes() / 5) * 5).padStart(2, '0');
  return `${h}:${m}`;
}

export function sortByPriority(tasks) {
  const order = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
}
