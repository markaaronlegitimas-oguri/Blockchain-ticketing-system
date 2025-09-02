import React from 'react';
import { render, screen } from '@testing-library/react';
import EventHeader from '../src/components/event/EventHeader';
import { Chip } from '@mui/material';

describe('EventHeader', () => {
  it('renders the event name correctly', () => {
    render(
      <EventHeader
        name="Music Concert"
        date={new Date()}
        isUpcoming={true}
        isCancelled={false}
      />
    );
    expect(screen.getByText('Music Concert')).toBeInTheDocument();
  });

  it('displays the correct label on the Chip for upcoming events', () => {
    render(
      <EventHeader
        name="Music Concert"
        date={new Date()}
        isUpcoming={true}
        isCancelled={false}
      />
    );
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('displays the correct label on the Chip for cancelled events', () => {
    render(
      <EventHeader
        name="Music Concert"
        date={new Date()}
        isUpcoming={false}
        isCancelled={true}
      />
    );
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('displays the correct label on the Chip for past events', () => {
    render(
      <EventHeader
        name="Music Concert"
        date={new Date()}
        isUpcoming={false}
        isCancelled={false}
      />
    );
    expect(screen.getByText('Past')).toBeInTheDocument();
  });

  it('applies the correct color for upcoming events', () => {
    render(
      <EventHeader
        name="Music Concert"
        date={new Date()}
        isUpcoming={true}
        isCancelled={false}
      />
    );
    const chip = screen.getByText('Upcoming').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorPrimary');
  });

  it('applies the correct color for cancelled events', () => {
    render(
      <EventHeader
        name="Cancelled Event"
        date={new Date()}
        isUpcoming={false}
        isCancelled={true}
      />
    );
    const chip = screen.getByText('Cancelled').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorError');
  });

  it('applies the correct color for past events', () => {
    render(
      <EventHeader
        name="Past Event"
        date={new Date()}
        isUpcoming={false}
        isCancelled={false}
      />
    );
    const chip = screen.getByText('Past').closest('.MuiChip-root');
    expect(chip).toHaveClass('MuiChip-colorDefault');
  });
});
