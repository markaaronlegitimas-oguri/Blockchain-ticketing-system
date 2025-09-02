import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketCard from '../src/components/ticket/TicketCard';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('TicketCard Component', () => {
  const theme = createTheme();
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it('shows Transfer button for valid ticket and handles click', () => {
    const mockTicket = {
      id: 1,
      eventName: 'Valid Event',
      date: Math.floor(Date.now() / 1000) + 3600, // future date
      valid: true,
    };
    const onTransferClick = jest.fn();

    renderWithTheme(<TicketCard ticket={mockTicket} onTransferClick={onTransferClick} />);

    const button = screen.getByRole('button', { name: /Transfer/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onTransferClick).toHaveBeenCalledWith(1);
  });

  it('displays Used for past and invalidated tickets', () => {
    const pastTimestamp = Math.floor(new Date('2024-01-01T12:00:00Z').getTime() / 1000);
    const mockTicket = {
      id: 2,
      eventName: 'Past Event',
      date: pastTimestamp,
      valid: false,
    };

    renderWithTheme(<TicketCard ticket={mockTicket} onTransferClick={jest.fn()} />);

    const elements = screen.getAllByText(/Used/i);
    expect(elements.length).toBeGreaterThanOrEqual(2);

    const usedButton = screen.getByRole('button', { name: /Used/i });
    expect(usedButton).toBeDisabled();
  });

  it('displays Invalid for future invalid tickets', () => {
    const futureTimestamp = Math.floor(new Date(Date.now() + 86400000).getTime() / 1000);
    const mockTicket = {
      id: 3,
      eventName: 'Future Cancelled Event',
      date: futureTimestamp,
      valid: false,
    };

    renderWithTheme(<TicketCard ticket={mockTicket} onTransferClick={jest.fn()} />);

    const elements = screen.getAllByText(/Invalid/i);
    expect(elements.length).toBeGreaterThanOrEqual(2);

    const invalidButton = screen.getByRole('button', { name: /Invalid/i });
    expect(invalidButton).toBeDisabled();
  });
});
