import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('../src/config', () => ({
  CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000',
}));

import App from '../src/App';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AccountProvider } from '../src/contexts/AccountContext';

jest.mock('../src/components/event/EventsPage', () => () => <div>EventsPage</div>);
jest.mock('../src/components/ticket/MyTickets',  () => () => <div>MyTickets</div>);

describe('App container', () => {
  it('renders header and welcome text', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to TheaterChain/i)).toBeInTheDocument();
  });

  it('toggles between tabs correctly', async () => {
    render(<App />);
    expect(screen.getByText('EventsPage')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /My Tickets/i }));
    await waitFor(() => {
      expect(screen.getByText('MyTickets')).toBeInTheDocument();
    });
  });
});

