import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KanbanBoard from '../../src/components/KanbanBoard';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn()
  })
}));

vi.mock('react-chartjs-2', () => ({
  Chart: () => <div data-testid="mock-chart"></div>
}));

describe('KanbanBoard Component', () => {
  const mockTasks = [
    {
      _id: '1',
      title: 'Test Task',
      description: 'Test Description',
      priority: 'Medium',
      category: 'Feature',
      column: 'To Do',
      attachments: []
    }
  ];

  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockTasks)
      })
    );
  });

  it('renders loading state initially', () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays task form', async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
      expect(screen.getByLabelText('Title*')).toBeInTheDocument();
    });
  });

  it('allows task creation', async () => {
    render(<KanbanBoard />);
    
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Title*'), {
        target: { value: 'New Task' }
      });
      fireEvent.click(screen.getByText('Add Task'));
    });

    expect(screen.getByLabelText('Title*').value).toBe('New Task');
  });

  it('switches to edit mode', async () => {
    render(<KanbanBoard />);
    
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Edit')[0]);
      expect(screen.getByText('Update Task')).toBeInTheDocument();
    });
  });
});