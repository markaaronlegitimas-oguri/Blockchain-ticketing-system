import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TicketList from '../src/components/ticket/TicketList';
import { ThemeProvider, createTheme } from '@mui/material/styles';

jest.mock('../src/components/ticket/TicketCard', () => {
  return ({ ticket }: any) => (
    <div data-testid={`ticket-${ticket.id}`}>
      {ticket.eventName}
    </div>
  );
});

describe('TicketList Component', () => {
  const theme = createTheme();
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it('displays 3 skeletons when loading', () => {
    const { container } = renderWithTheme(
      <TicketList tickets={[]} loading={true} onTransferClick={jest.fn()} />
    );
    const skeletons = container.getElementsByClassName('MuiSkeleton-root');
    expect(skeletons.length).toBe(3);
  });

  it('renders tickets when not loading', () => {
    const tickets = [
      { id: 1, eventName: 'Event A', date: Date.now() / 1000, valid: true },
      { id: 2, eventName: 'Event B', date: Date.now() / 1000, valid: false },
    ];
    renderWithTheme(
      <TicketList tickets={tickets} loading={false} onTransferClick={jest.fn()} />
    );

    expect(screen.getByTestId('ticket-1')).toHaveTextContent('Event A');
    expect(screen.getByTestId('ticket-2')).toHaveTextContent('Event B');
  });

  it('calls onTransferClick for valid tickets on click', () => {
    const tickets = [{ id: 1, eventName: 'Event A', date: Date.now() / 1000, valid: true }];
    const onTransferClick = jest.fn();

    renderWithTheme(
      <TicketList tickets={tickets} loading={false} onTransferClick={onTransferClick} />
    );

    fireEvent.click(screen.getByTestId('ticket-1'));
    expect(onTransferClick).toHaveBeenCalledWith(1);
  });

  it('does not call onTransferClick for invalid tickets on click', () => {
    const tickets = [{ id: 2, eventName: 'Event B', date: Date.now() / 1000, valid: false }];
    const onTransferClick = jest.fn();

    renderWithTheme(
      <TicketList tickets={tickets} loading={false} onTransferClick={onTransferClick} />
    );

    fireEvent.click(screen.getByTestId('ticket-2'));
    expect(onTransferClick).not.toHaveBeenCalled();
  });
});
