import React from 'react';
import { render, screen } from '@testing-library/react';
import NoTicketsMessage from '../src/components/ticket/NoTicketsMessage';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('NoTicketsMessage Component', () => {
  const theme = createTheme();
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it('renders primary message with ticket icon', () => {
    const { container } = renderWithTheme(<NoTicketsMessage />);

    expect(screen.getByText(/You haven't purchased any tickets yet\./i)).toBeInTheDocument();

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders secondary call-to-action with money icon', () => {
    const { container } = renderWithTheme(<NoTicketsMessage />);

    expect(screen.getByText(/Visit the Events section to purchase your first tickets!/i)).toBeInTheDocument();

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('applies dashed border and hover styles', () => {
    const { getByText } = renderWithTheme(<NoTicketsMessage />);
    const boxElement = getByText(/You haven't purchased any tickets yet\./i).closest('div');
    expect(boxElement).toHaveStyle(`border: 1px dashed ${theme.palette.divider}`);
    expect(boxElement).toHaveStyle(`background-color: rgba(255, 255, 255, 0.6)`);
  });
});

