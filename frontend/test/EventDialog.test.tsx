import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventDialog from '../src/components/event/EventDialog.tsx';

jest.mock('../src/components/event/NewEventForm.tsx', () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel }) => (
    <div>
      <button onClick={() => onSubmit('Event Name', 1234567890, 10, 100)}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('EventDialog', () => {
  it('renders the dialog with the title and close button', () => {
    render(<EventDialog open={true} onClose={() => {}} onSubmit={() => Promise.resolve()} />);

    expect(screen.getByText('Create New Event')).toBeInTheDocument();
    
    expect(screen.getByLabelText('close')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<EventDialog open={true} onClose={onClose} onSubmit={() => Promise.resolve()} />);

    fireEvent.click(screen.getByLabelText('close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when the submit button is clicked', async () => {
    const onSubmit = jest.fn(() => Promise.resolve());
    render(<EventDialog open={true} onClose={() => {}} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Event Name', 1234567890, 10, 100));
  });

  it('calls onClose when the cancel button is clicked', () => {
    const onClose = jest.fn();
    render(<EventDialog open={true} onClose={onClose} onSubmit={() => Promise.resolve()} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
