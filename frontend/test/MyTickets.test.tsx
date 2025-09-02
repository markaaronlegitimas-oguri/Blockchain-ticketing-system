import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MyTickets from '../src/components/ticket/MyTickets';
import { useAccount } from '../src/contexts/AccountContext';

// Mock child components
jest.mock('../src/components/ConnectWalletMessage', () => () => <div>Connect your wallet</div>);
jest.mock('../src/components/ticket/NoTicketsMessage', () => () => <div>No tickets available</div>);
jest.mock('../src/components/ticket/TicketList', () => ({ tickets }: any) => (
  <div>{tickets.length === 0 ? 'No tickets rendered' : 'Tickets rendered'}</div>
));
jest.mock('../src/components/ticket/TicketListHeader', () => () => <div>Ticket Header</div>);
jest.mock('../src/components/ticket/TransferDialog', () => () => <div>Transfer Dialog</div>);

// Mock the context
jest.mock('../src/contexts/AccountContext');

describe('MyTickets', () => {
  it('shows ConnectWalletMessage when not connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: false,
      connectWallet: jest.fn(),
    });

    render(<MyTickets />);
    expect(screen.getByText(/Connect your wallet/i)).toBeInTheDocument();
  });

  it('renders ticket list when connected and tickets exist', async () => {
    const mockContract = {
      getUserTickets: jest.fn().mockResolvedValue([{ toNumber: () => 1 }]),
      tickets: jest.fn().mockResolvedValue({ 
        eventId: { toNumber: () => 101 }, 
        valid: true 
      }),
      events: jest.fn().mockResolvedValue({ 
        name: 'Sample Event', 
        date: { toNumber: () => Math.floor(Date.now() / 1000 + 10000) }, 
        active: true 
      }),
      filters: {
        TicketTransferred: jest.fn().mockReturnValue('mock-filter'),
      },
      on: jest.fn(),
      off: jest.fn(),
    };

    // Add proper account context mock
    (useAccount as jest.Mock).mockReturnValue({
      contract: mockContract,
      account: '0xTestAccount', // Mock account address
      isConnected: true, // Critical for bypassing ConnectWalletMessage
      connectWallet: jest.fn(),
    });

    render(<MyTickets />);
  
    await waitFor(() => {
      expect(screen.getByText(/Tickets rendered/)).toBeInTheDocument();
    });
  });
});

