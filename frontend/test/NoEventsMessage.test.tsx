import React from 'react';
import { render, screen } from '@testing-library/react';
import NoEventsMessage from '../src/components/event/NoEventsMessage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('NoEventsMessage', () => {
  it('shows owner message when isOwner is true', () => {
    renderWithTheme(<NoEventsMessage isOwner={true} />);
    
    expect(screen.getByText(/No events available yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Create your first event!/i)).toBeInTheDocument();
    expect(screen.queryByText(/Check back later/i)).not.toBeInTheDocument();
  });

  it('shows guest message when isOwner is false', () => {
    renderWithTheme(<NoEventsMessage isOwner={false} />);
    
    expect(screen.getByText(/No events available yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Check back later for upcoming events/i)).toBeInTheDocument();
    expect(screen.queryByText(/Create your first event!/i)).not.toBeInTheDocument();
  });
});
