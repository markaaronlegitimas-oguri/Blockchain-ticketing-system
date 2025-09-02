import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import EventStatusBar from '../src/components/event/EventStatusBar';

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('EventStatusBar', () => {
  it('renders with upcoming gradient background', () => {
    const { container } = renderWithTheme(
      <EventStatusBar isUpcoming={true} isCancelled={false} />
    );

    const bar = container.firstChild;
    expect(bar).toHaveStyle('height: 4px');
    expect(bar).toHaveStyle('background: linear-gradient'); // Partially match gradient
  });

  it('renders with error color background when cancelled', () => {
    const theme = createTheme();
    const { container } = render(
      <ThemeProvider theme={theme}>
        <EventStatusBar isUpcoming={false} isCancelled={true} />
      </ThemeProvider>
    );

    const bar = container.firstChild;
    expect(bar).toHaveStyle(`background: ${theme.palette.error.main}`);
  });

  it('renders with grey background when not upcoming and not cancelled', () => {
    const theme = createTheme();
    const { container } = render(
      <ThemeProvider theme={theme}>
        <EventStatusBar isUpcoming={false} isCancelled={false} />
      </ThemeProvider>
    );

    const bar = container.firstChild;
    expect(bar).toHaveStyle(`background: ${theme.palette.grey[400]}`);
  });
});

