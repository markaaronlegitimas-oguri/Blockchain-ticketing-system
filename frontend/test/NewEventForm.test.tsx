import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import NewEventForm from '../src/components/event/NewEventForm';

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('NewEventForm', () => {
  const mockOnSubmit = jest.fn(() => Promise.resolve());
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all input fields and buttons', () => {
    renderWithTheme(<NewEventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tickets/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderWithTheme(<NewEventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    await waitFor(() => {
      expect(screen.getByText(/event name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/time is required/i)).toBeInTheDocument();
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
      expect(screen.getByText(/number of tickets is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    renderWithTheme(<NewEventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'My Event' } });
    fireEvent.change(screen.getByLabelText(/date/i), { target: { value: '2025-12-01' } });
    fireEvent.change(screen.getByLabelText(/time/i), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '0.1' } });
    fireEvent.change(screen.getByLabelText(/tickets/i), { target: { value: '50' } });

    fireEvent.click(screen.getByRole('button', { name: /create event/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        'My Event',
        expect.any(Number), // timestamp
        0.1,
        50
      );
    });
  });

  it('calls onCancel when Cancel button is clicked', () => {
    renderWithTheme(<NewEventForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});

