import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TheaterEvent from '../src/components/event/TheaterEvent';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as AccountContext from '../src/contexts/AccountContext';

jest.mock('../src/components/event/EventHeader', () => () => <div>Mock EventHeader</div>);
jest.mock('../src/components/event/EventCountdown', () => ({ days, hours }: { days: number, hours: number }) => (
  <div>{`Countdown: ${days}d ${hours}h`}</div>
));
jest.mock('../src/components/event/EventDetails', () => ({ date, price, tickets }: any) => (
  <div>{`Details: ${date} ${price} ${tickets}`}</div>
));

jest.mock('ethers', () => ({
  ethers: {
    utils: {
      formatEther: (val: string) => `${val} ETH`
    }
  }
}));

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TheaterEvent', () => {
  const baseProps = {
    id: 1,
    name: 'Hamlet',
    ticketPrice: '1000000000000000000', // 1 ETH
    onPurchase: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Event ended for past events', () => {
    jest.spyOn(AccountContext, 'useAccount').mockReturnValue({ isOwner: false });

    const pastDate = Math.floor((Date.now() - 100000000) / 1000); // in the past

    renderWithTheme(
      <TheaterEvent
        {...baseProps}
        date={pastDate}
        availableTickets={10}
        active={true}
      />
    );

    expect(screen.getByText('Event ended')).toBeInTheDocument();
  });

  it('shows Cancelled for inactive events', () => {
    jest.spyOn(AccountContext, 'useAccount').mockReturnValue({ isOwner: false });

    const futureDate = Math.floor((Date.now() + 100000000) / 1000);

    renderWithTheme(
      <TheaterEvent
        {...baseProps}
        date={futureDate}
        availableTickets={10}
        active={false}
      />
    );

    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('shows Purchase and Cancel buttons for upcoming active event when owner', () => {
    jest.spyOn(AccountContext, 'useAccount').mockReturnValue({ isOwner: true });

    const futureDate = Math.floor((Date.now() + 3 * 86400) / 1000); // 3 days in future

    renderWithTheme(
      <TheaterEvent
        {...baseProps}
        date={futureDate}
        availableTickets={5}
        active={true}
      />
    );

    expect(screen.getByText('Cancel Event')).toBeInTheDocument();
    expect(screen.getByText('Purchase Ticket')).toBeInTheDocument();
    expect(screen.getByText((content) => content.startsWith('Countdown:'))).toBeInTheDocument();
  });

  it('shows Sold Out when tickets are 0 and not owner', () => {
    jest.spyOn(AccountContext, 'useAccount').mockReturnValue({ isOwner: false });

    const futureDate = Math.floor((Date.now() + 3 * 86400) / 1000);

    renderWithTheme(
      <TheaterEvent
        {...baseProps}
        date={futureDate}
        availableTickets={0}
        active={true}
      />
    );

    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('calls onPurchase when Purchase button is clicked', () => {
    jest.spyOn(AccountContext, 'useAccount').mockReturnValue({ isOwner: false });

    const futureDate = Math.floor((Date.now() + 3 * 86400) / 1000);

    renderWithTheme(
      <TheaterEvent
        {...baseProps}
        date={futureDate}
        availableTickets={5}
        active={true}
      />
    );

    fireEvent.click(screen.getByText('Purchase Ticket'));
    expect(baseProps.onPurchase).toHaveBeenCalledWith(1);
  });

  it('calls onCancel when Cancel Event button is clicked (owner)', () => {
    jest.spyOn(AccountContext, 'useAccount').mockReturnValue({ isOwner: true });

    const futureDate = Math.floor((Date.now() + 3 * 86400) / 1000);

    renderWithTheme(
      <TheaterEvent
        {...baseProps}
        date={futureDate}
        availableTickets={5}
        active={true}
      />
    );

    fireEvent.click(screen.getByText('Cancel Event'));
    expect(baseProps.onCancel).toHaveBeenCalledWith(1);
  });
});

