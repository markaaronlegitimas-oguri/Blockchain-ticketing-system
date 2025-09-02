import React from 'react';
import { render, screen } from '@testing-library/react';
import EventCountdown from '../src/components/event/EventCountdown.tsx'
import { ThemeProvider, createTheme } from '@mui/material/styles';

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('EventCountdown', () => {
  it('renders correct text when days > 0', () => {
    renderWithTheme(<EventCountdown days={3} hours={5} />);
    expect(screen.getByText(/In 3 days and 5 hours/i)).toBeInTheDocument();
  });

  it('renders correct text when days = 0', () => {
    renderWithTheme(<EventCountdown days={0} hours={10} />);
    expect(screen.getByText(/In 10 hours/i)).toBeInTheDocument();
  });

  it('renders an SVG icon (AccessTimeIcon)', () => {
    renderWithTheme(<EventCountdown days={1} hours={2} />);
    const svgIcon = document.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();  // Just check if the icon exists
  });
});
