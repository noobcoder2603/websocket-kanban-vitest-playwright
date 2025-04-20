import { test, expect } from '@playwright/test';

test.describe('Kanban Board Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.getByText('Real-Time Kanban Board')).toBeVisible();
  });

  test('should create a new task', async ({ page }) => {
    // Fill out the task form
    await page.fill('input[placeholder="Enter task title"]', 'E2E Test Task');
    await page.fill('textarea[placeholder="Enter task description"]', 'This is a test description');
    await page.click('button:has-text("Add Task")');

    // Verify task appears in To Do column
    const toDoColumn = page.locator('.kanban-column:has-text("To Do")');
    await expect(toDoColumn.getByText('E2E Test Task')).toBeVisible();
  });

  test('should move task between columns', async ({ page }) => {
    // Create a task first
    await page.fill('input[placeholder="Enter task title"]', 'Task to Move');
    await page.click('button:has-text("Add Task")');

    // Drag and drop from To Do to In Progress
    const task = page.locator('.task-card:has-text("Task to Move")');
    const inProgressColumn = page.locator('.kanban-column:has-text("In Progress")');
    
    await task.dragTo(inProgressColumn);
    await expect(inProgressColumn.getByText('Task to Move')).toBeVisible();
  });

  test('should edit an existing task', async ({ page }) => {
    // Create a task first
    await page.fill('input[placeholder="Enter task title"]', 'Task to Edit');
    await page.click('button:has-text("Add Task")');

    // Click edit button
    await page.locator('.task-card:has-text("Task to Edit")').getByText('Edit').click();
    
    // Update task details
    await page.fill('input[placeholder="Enter task title"]', 'Updated Task');
    await page.click('button:has-text("Update Task")');

    // Verify update
    await expect(page.locator('.task-card:has-text("Updated Task")')).toBeVisible();
    await expect(page.locator('.task-card:has-text("Task to Edit")')).not.toBeVisible();
  });

  test('should delete a task', async ({ page }) => {
    // Create a task first
    await page.fill('input[placeholder="Enter task title"]', 'Task to Delete');
    await page.click('button:has-text("Add Task")');

    // Click delete button
    const taskCard = page.locator('.task-card:has-text("Task to Delete")');
    await taskCard.getByText('Delete').click();

    // Verify deletion
    await expect(taskCard).not.toBeVisible();
  });

  test('should display progress chart', async ({ page }) => {
    // Verify chart exists
    await expect(page.locator('.progress-chart')).toBeVisible();
    
    // Create a task and verify chart updates
    const initialChart = await page.locator('.chart-container').screenshot();
    
    await page.fill('input[placeholder="Enter task title"]', 'Chart Test Task');
    await page.click('button:has-text("Add Task")');
    
    await expect(page.locator('.completion-metric')).toContainText('0%');
    
    // Move to Done and verify completion %
    const task = page.locator('.task-card:has-text("Chart Test Task")');
    const doneColumn = page.locator('.kanban-column:has-text("Done")');
    await task.dragTo(doneColumn);
    
    await expect(page.locator('.completion-metric')).toContainText('100%');
  });
});