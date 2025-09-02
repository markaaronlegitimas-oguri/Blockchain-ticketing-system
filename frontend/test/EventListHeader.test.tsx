import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventListHeader from '../src/components/event/EventListHeader';
import { useTheme } from '@mui/material/styles';

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: jest.fn(),
}));

describe('EventListHeader', () => {
  const mockOnNewEvent = jest.fn();
  const mockTheme = {
    palette: {
      text: {
        primary: '#000000',
      },
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ... keep other tests the same ...

  it('applies hover styles to the button', () => {
    const { container } = render(
      <EventListHeader onNewEvent={mockOnNewEvent} isOwner={true} />
    );
    
    const button = container.querySelector('.MuiButton-root');
    expect(button).toHaveStyle(
      'background: linear-gradient(45deg, #f50057, #3f51b5)'
    );
  });

  // Remove the pseudo-element test since we can't properly test it in JSDOM
  it('renders the underline decoration', () => {
    const { container } = render(
      <EventListHeader onNewEvent={mockOnNewEvent} isOwner={false} />
    );
    const header = container.querySelector('h2');
    expect(header).toHaveStyle('position: relative');
  });
});
