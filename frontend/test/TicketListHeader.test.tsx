import React from 'react';
import { render, screen } from '@testing-library/react';
import TicketListHeader from '../src/components/ticket/TicketListHeader';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('TicketListHeader Component', () => {
  const theme = createTheme();
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it('renders the heading with correct text', () => {
    renderWithTheme(<TicketListHeader />);
    const heading = screen.getByRole('heading', { name: /My tickets/i });
    expect(heading).toBeInTheDocument();
  });

  it('uses an h2 element with variant h4', () => {
    renderWithTheme(<TicketListHeader />);
    const heading = screen.getByRole('heading', { name: /My tickets/i });
    // MUI Typography with component="h2"
    expect(heading.tagName).toBe('H2');
    // Check variant class applied (MuiTypography-h4)
    expect(heading.className).toMatch(/MuiTypography-h4/);
  });

  it('applies primary text color from theme', () => {
    renderWithTheme(<TicketListHeader />);
    const heading = screen.getByRole('heading', { name: /My tickets/i });
    expect(heading).toHaveStyle(`color: ${theme.palette.text.primary}`);
  });
});

