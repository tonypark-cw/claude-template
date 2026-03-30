// Playwright E2E tests for timebox app — clean grid, modal-based interactions
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('.time-block');
});

// Helper: open add-task modal, add a task, close modal
async function addTaskViaModal(page, name, blocks = 1, priority = 'medium') {
  await page.click('button:has-text("+ 작업 추가")');
  await page.fill('#task-name', name);
  if (blocks !== 1) await page.fill('#task-blocks', String(blocks));
  if (priority !== 'medium') await page.selectOption('#task-priority', priority);
  await page.click('#add-modal-overlay .add-form button:has-text("추가")');
  await page.click('#add-modal-overlay button:has-text("닫기")');
}

// Helper: assign first task to first empty block via modal
async function assignFirstTask(page) {
  await page.locator('.block-content.empty').first().click();
  await page.locator('#modal-tasks li').first().click();
}

// ============ A. Page Load & Initial State ============

test('page loads with correct title and header', async ({ page }) => {
  await expect(page).toHaveTitle('타임박싱 - 5분 블록 플래너');
  await expect(page.locator('.header h1')).toContainText('타임박싱');
});

test('initial timeline has 216 blocks (18h x 12)', async ({ page }) => {
  await expect(page.locator('.time-block')).toHaveCount(216);
});

test('initial stats show zeros', async ({ page }) => {
  await expect(page.locator('#stat-total')).toHaveText('216');
  await expect(page.locator('#stat-assigned')).toHaveText('0');
  await expect(page.locator('#stat-done')).toHaveText('0');
  await expect(page.locator('#stat-progress')).toHaveText('0%');
});

// ============ B. Task CRUD (via modal) ============

test('add a task via modal', async ({ page }) => {
  await addTaskViaModal(page, 'Test Task');
  await expect(page.locator('.task-chip')).toHaveCount(1);
  await expect(page.locator('.task-chip')).toContainText('Test Task');
});

test('add task with custom blocks and priority', async ({ page }) => {
  await addTaskViaModal(page, 'Big Task', 6, 'high');
  await expect(page.locator('.task-chip')).toHaveCount(1);
});

test('add task with Enter key', async ({ page }) => {
  await page.click('button:has-text("+ 작업 추가")');
  await page.fill('#task-name', 'Enter Task');
  await page.press('#task-name', 'Enter');
  await expect(page.locator('.task-chip')).toHaveCount(1);
});

test('cannot add empty task', async ({ page }) => {
  await page.click('button:has-text("+ 작업 추가")');
  await page.click('#add-modal-overlay .add-form button:has-text("추가")');
  await expect(page.locator('.task-chip')).toHaveCount(0);
});

test('remove a task clears it from chips and timeline', async ({ page }) => {
  await addTaskViaModal(page, 'ToRemove');
  await assignFirstTask(page);
  await expect(page.locator('.block-content.filled')).toHaveCount(1);

  await page.locator('.chip-remove').click();
  await expect(page.locator('.task-chip')).toHaveCount(0);
  await expect(page.locator('.block-content.filled')).toHaveCount(0);
});

// ============ C. Click-to-Assign (Modal) ============

test('clicking empty block opens assign modal', async ({ page }) => {
  await addTaskViaModal(page, 'ModalTest');
  await page.locator('.block-content.empty').first().click();
  await expect(page.locator('#modal-overlay')).toHaveClass(/show/);
  await expect(page.locator('#modal-title')).toHaveText('작업 배정');
});

test('assign task via modal creates filled block', async ({ page }) => {
  await addTaskViaModal(page, 'Assigned');
  await assignFirstTask(page);
  await expect(page.locator('.block-content.filled')).toHaveCount(1);
});

test('clicking filled block shows task info', async ({ page }) => {
  await addTaskViaModal(page, 'MyTask');
  await assignFirstTask(page);

  await page.locator('.block-content.filled').first().click();
  await expect(page.locator('#modal-current-name')).toHaveText('MyTask');
  await expect(page.locator('#modal-current')).toBeVisible();
});

test('assign break via modal', async ({ page }) => {
  await page.locator('.block-content.empty').first().click();
  await page.locator('#modal-overlay .modal-footer button:has-text("휴식")').click();
  await expect(page.locator('.break-block')).toHaveCount(1);
});

test('add and assign new task directly from block modal', async ({ page }) => {
  await page.locator('.block-content.empty').first().click();
  await page.fill('#modal-task-name', 'DirectTask');
  await page.fill('#modal-task-blocks', '2');
  await page.click('#modal-overlay button:has-text("추가+배정")');

  await expect(page.locator('.block-content.filled')).toHaveCount(2);
  await expect(page.locator('.task-chip')).toContainText('DirectTask');
});

test('add and assign with Enter key', async ({ page }) => {
  await page.locator('.block-content.empty').first().click();
  await page.fill('#modal-task-name', 'EnterAssign');
  await page.press('#modal-task-name', 'Enter');
  await expect(page.locator('.block-content.filled')).toHaveCount(1);
});

test('clear assigned block via modal', async ({ page }) => {
  await addTaskViaModal(page, 'ToClear');
  await assignFirstTask(page);
  await expect(page.locator('.block-content.filled')).toHaveCount(1);

  await page.locator('.block-content.filled').first().click();
  await page.click('#modal-current button:has-text("비우기")');
  await expect(page.locator('.block-content.filled')).toHaveCount(0);
});

// ============ D. Drag and Drop (from chip) ============

test('drag task chip to timeline block', async ({ page }) => {
  await addTaskViaModal(page, 'DragMe');
  await page.locator('.task-chip').first().dragTo(page.locator('.time-block[data-index="0"]'));
  await expect(page.locator('.time-block[data-index="0"] .block-content')).toHaveClass(/filled/);
});

test('multi-block task fills consecutive slots', async ({ page }) => {
  await addTaskViaModal(page, 'Multi', 3);
  await page.locator('.task-chip').first().dragTo(page.locator('.time-block[data-index="5"]'));
  for (const idx of [5, 6, 7]) {
    await expect(page.locator(`.time-block[data-index="${idx}"] .block-content`)).toHaveClass(/filled/);
  }
});

test('notification appears after drop', async ({ page }) => {
  await addTaskViaModal(page, 'NotifyDrop');
  await page.locator('.task-chip').first().dragTo(page.locator('.time-block[data-index="0"]'));
  await expect(page.locator('.notification')).toHaveClass(/show/);
  await expect(page.locator('.notification')).toContainText('NotifyDrop');
});

// ============ D2. Cell Drag (move between blocks) ============

test('drag filled cell to empty cell moves task', async ({ page }) => {
  await addTaskViaModal(page, 'Mover');
  await assignFirstTask(page);
  await expect(page.locator('.time-block[data-index="0"] .block-content')).toHaveClass(/filled/);

  // Drag cell 0 → cell 5
  await page.locator('.time-block[data-index="0"]').dragTo(page.locator('.time-block[data-index="5"]'));
  await expect(page.locator('.time-block[data-index="5"] .block-content')).toHaveClass(/filled/);
  await expect(page.locator('.time-block[data-index="0"] .block-content')).toHaveClass(/empty/);
});

test('drag filled cell to filled cell swaps', async ({ page }) => {
  await addTaskViaModal(page, 'TaskA');
  await addTaskViaModal(page, 'TaskB');
  // Assign A to block 0, B to block 1
  await page.locator('.time-block[data-index="0"] .block-content').click();
  await page.locator('#modal-tasks li').first().click();
  await page.locator('.time-block[data-index="1"] .block-content').click();
  await page.locator('#modal-tasks li').nth(1).click();

  // Drag block 0 → block 1 (swap)
  await page.locator('.time-block[data-index="0"]').dragTo(page.locator('.time-block[data-index="1"]'));

  // After swap: block 0 should have TaskB, block 1 should have TaskA
  await expect(page.locator('.time-block[data-index="0"]')).toHaveAttribute('title', /TaskB/);
  await expect(page.locator('.time-block[data-index="1"]')).toHaveAttribute('title', /TaskA/);
});

// ============ E. Auto-Assign ============

test('auto-assign places tasks by priority order', async ({ page }) => {
  await addTaskViaModal(page, 'Low', 2, 'low');
  await addTaskViaModal(page, 'High', 2, 'high');
  await page.click('button:has-text("자동 배정")');

  // Verify via tooltip title (High first, then Low)
  await expect(page.locator('.time-block[data-index="0"]')).toHaveAttribute('title', /High/);
  await expect(page.locator('.time-block[data-index="2"]')).toHaveAttribute('title', /Low/);
});

test('auto-assign skips already-filled blocks', async ({ page }) => {
  await addTaskViaModal(page, 'Manual', 1, 'high');
  await assignFirstTask(page);
  await addTaskViaModal(page, 'Auto', 1, 'low');
  await page.click('button:has-text("자동 배정")');

  await expect(page.locator('.time-block[data-index="0"]')).toHaveAttribute('title', /Manual/);
});

test('auto-assign shows notification', async ({ page }) => {
  await addTaskViaModal(page, 'Any');
  await page.click('button:has-text("자동 배정")');
  await expect(page.locator('.notification')).toContainText('자동 배정');
});

// ============ F. Break Blocks ============

test('add breaks places blocks at intervals', async ({ page }) => {
  await page.click('.toolbar button:has-text("휴식 추가")');
  expect(await page.locator('.break-block').count()).toBeGreaterThan(0);
});

test('breaks do not overwrite assigned tasks', async ({ page }) => {
  await addTaskViaModal(page, 'Protected', 1);
  await page.locator('.time-block[data-index="24"] .block-content').click();
  await page.locator('#modal-tasks li').first().click();
  await page.click('.toolbar button:has-text("휴식 추가")');
  await expect(page.locator('.time-block[data-index="24"]')).toHaveAttribute('title', /Protected/);
});

test('clear all breaks removes only breaks', async ({ page }) => {
  await addTaskViaModal(page, 'KeepMe');
  await page.click('button:has-text("자동 배정")');
  await page.click('.toolbar button:has-text("휴식 추가")');
  expect(await page.locator('.break-block').count()).toBeGreaterThan(0);

  await page.click('.toolbar button:has-text("휴식 제거")');
  await expect(page.locator('.break-block')).toHaveCount(0);
  await expect(page.locator('.block-content.filled')).toHaveCount(1);
});

test('adding breaks twice does not duplicate', async ({ page }) => {
  await page.click('.toolbar button:has-text("휴식 추가")');
  const first = await page.locator('.break-block').count();
  await page.click('.toolbar button:has-text("휴식 추가")');
  const second = await page.locator('.break-block').count();
  expect(second).toBe(first);
});

test('example after breaks does not corrupt timeline', async ({ page }) => {
  await page.click('.toolbar button:has-text("휴식 추가")');
  expect(await page.locator('.break-block').count()).toBeGreaterThan(0);
  page.on('dialog', d => d.accept());
  await page.click('.toolbar button:has-text("예시")');
  await expect(page.locator('.time-block')).toHaveCount(216);
  expect(await page.locator('.block-content.filled').count()).toBeGreaterThan(0);
});

// ============ G. Completion (via modal) ============

test('toggle done via modal', async ({ page }) => {
  await addTaskViaModal(page, 'CheckMe');
  await assignFirstTask(page);

  // Click filled block → modal with task info
  await page.locator('.block-content.filled').first().click();
  await page.click('#modal-done-btn');

  // Block should have .completed class
  await expect(page.locator('.time-block.completed')).toHaveCount(1);
  await expect(page.locator('#stat-done')).toHaveText('1');
});

test('toggle done updates stats', async ({ page }) => {
  await addTaskViaModal(page, 'StatCheck');
  await assignFirstTask(page);

  await page.locator('.block-content.filled').first().click();
  await page.click('#modal-done-btn');
  await expect(page.locator('#stat-done')).toHaveText('1');
  await expect(page.locator('#stat-progress')).toHaveText('100%');
});

test('toggle done off via modal', async ({ page }) => {
  await addTaskViaModal(page, 'Toggle');
  await assignFirstTask(page);

  // Complete
  await page.locator('.block-content.filled').first().click();
  await page.click('#modal-done-btn');
  await expect(page.locator('.time-block.completed')).toHaveCount(1);

  // Uncomplete
  await page.locator('.time-block.completed .block-content').first().click();
  await page.click('#modal-done-btn');
  await expect(page.locator('.time-block.completed')).toHaveCount(0);
  await expect(page.locator('#stat-done')).toHaveText('0');
});

// ============ H. Statistics ============

test('stats update on task assignment', async ({ page }) => {
  await addTaskViaModal(page, 'S1', 3);
  await page.click('button:has-text("자동 배정")');
  await expect(page.locator('#stat-assigned')).toHaveText('3');
});

test('progress bar width matches percentage', async ({ page }) => {
  await addTaskViaModal(page, 'PB', 2);
  await page.click('button:has-text("자동 배정")');

  // Complete 1 of 2 via modal
  await page.locator('.block-content.filled').first().click();
  await page.click('#modal-done-btn');
  await expect(page.locator('#stat-progress')).toHaveText('50%');
  const width = await page.locator('#progress-fill').evaluate(el => el.style.width);
  expect(width).toBe('50%');
});

// ============ I. Configuration ============

test('change start hour rebuilds timeline', async ({ page }) => {
  await page.fill('#start-hour', '9');
  await page.click('.toolbar button:has-text("적용")');
  const firstLabel = await page.locator('.time-label').first().textContent();
  expect(firstLabel).toBe('09:00');
});

test('change total hours adjusts block count', async ({ page }) => {
  await page.fill('#total-hours', '8');
  await page.click('.toolbar button:has-text("적용")');
  await expect(page.locator('.time-block')).toHaveCount(96);
});

test('settings preserve assigned tasks in overlapping range', async ({ page }) => {
  await addTaskViaModal(page, 'Keep');
  await page.locator('.time-block[data-index="12"] .block-content').click();
  await page.locator('#modal-tasks li').first().click();

  await page.fill('#start-hour', '9');
  await page.click('.toolbar button:has-text("적용")');
  const block0900 = page.locator('.time-block').filter({ has: page.locator('.time-label', { hasText: '09:00' }) });
  await expect(block0900.locator('.block-content')).toHaveClass(/filled/);
});

// ============ J. localStorage Persistence ============

test('tasks persist across reload', async ({ page }) => {
  await addTaskViaModal(page, 'Persist');
  await page.reload();
  await page.waitForSelector('.task-chip');
  await expect(page.locator('.task-chip')).toContainText('Persist');
});

test('timeline assignments persist across reload', async ({ page }) => {
  await addTaskViaModal(page, 'SavedAssign');
  await assignFirstTask(page);
  await page.reload();
  await page.waitForSelector('.block-content.filled');
  await expect(page.locator('.block-content.filled')).toHaveCount(1);
});

test('completion state persists across reload', async ({ page }) => {
  await addTaskViaModal(page, 'DonePersist');
  await assignFirstTask(page);
  await page.locator('.block-content.filled').first().click();
  await page.click('#modal-done-btn');

  await page.reload();
  await page.waitForSelector('.time-block.completed');
  await expect(page.locator('.time-block.completed')).toHaveCount(1);
});

// ============ K. Reset All ============

test('reset clears everything', async ({ page }) => {
  await addTaskViaModal(page, 'Gone');
  await page.click('button:has-text("자동 배정")');

  page.on('dialog', dialog => dialog.accept());
  await page.locator('.toolbar button:has-text("전체 초기화")').click();

  await expect(page.locator('.task-chip')).toHaveCount(0);
  await expect(page.locator('.block-content.filled')).toHaveCount(0);
  await expect(page.locator('#stat-assigned')).toHaveText('0');
});

test('reset clears localStorage', async ({ page }) => {
  await addTaskViaModal(page, 'Temp');
  page.on('dialog', dialog => dialog.accept());
  await page.locator('.toolbar button:has-text("전체 초기화")').click();
  await page.reload();
  await page.waitForSelector('.time-block');
  await expect(page.locator('.task-chip')).toHaveCount(0);
});

// ============ L. Real-Time Clock ============

test('clock displays valid time format', async ({ page }) => {
  const clockText = await page.locator('#stat-clock').textContent();
  expect(clockText).toMatch(/^\d{2}:\d{2}:\d{2}$/);
});

// ============ M. Notifications ============

test('notification appears on task add', async ({ page }) => {
  await addTaskViaModal(page, 'NotiTest');
  await expect(page.locator('.notification')).toContainText('NotiTest');
});

test('notification disappears after timeout', async ({ page }) => {
  await addTaskViaModal(page, 'Vanish');
  await expect(page.locator('.notification')).toHaveClass(/show/);
  await page.waitForTimeout(3000);
  await expect(page.locator('.notification')).not.toHaveClass(/show/);
});
