import React from 'react';
import { render, screen } from '@testing-library/react';
import EventDetails from '../src/components/event/EventDetails.tsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('EventDetails', () => {
  const mockDate = new Date('2025-05-01T15:30:00');

  it('renders the correct price', () => {
    renderWithTheme(<EventDetails date={mockDate} price="0.5" tickets={10} />);

    expect(screen.getByText('0.5 ETH per ticket')).toBeInTheDocument();
  });

  it('renders the correct number of tickets', () => {
    renderWithTheme(<EventDetails date={mockDate} price="0.5" tickets={10} />);

    expect(screen.getByText('10 tickets available')).toBeInTheDocument();
  });

  it('renders the correct singular text when there is one ticket', () => {
    renderWithTheme(<EventDetails date={mockDate} price="0.5" tickets={1} />);

    expect(screen.getByText('1 ticket available')).toBeInTheDocument();
  });

  it('renders the Calendar icon', () => {
    renderWithTheme(<EventDetails date={mockDate} price="0.5" tickets={10} />);

    const calendarIcon = screen.getByTestId('calendar-icon');
    expect(calendarIcon).toBeInTheDocument();
  });

  it('renders the Money icon', () => {
    renderWithTheme(<EventDetails date={mockDate} price="0.5" tickets={10} />);

    const moneyIcon = screen.getByTestId('money-icon');
    expect(moneyIcon).toBeInTheDocument();
  });

  it('renders the Ticket icon', () => {
    renderWithTheme(<EventDetails date={mockDate} price="0.5" tickets={10} />);

    const ticketIcon = screen.getByTestId('ticket-icon');
    expect(ticketIcon).toBeInTheDocument();
  });
});
