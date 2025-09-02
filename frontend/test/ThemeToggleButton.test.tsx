import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggleButton from '../src/components/header/ThemeToggleButton';
import { useTheme } from '../src/contexts/ThemeContext';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

jest.mock('../src/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

describe('ThemeToggleButton', () => {
  it('renders dark mode icon and tooltip when in dark mode', () => {
    (useTheme as jest.Mock).mockReturnValue({
      isDarkMode: true,
      toggleTheme: jest.fn(),
    });

    render(
      <ThemeProvider theme={createTheme()}>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    expect(screen.getByRole('button')).toContainElement(screen.getByTestId('Brightness7Icon'));
  });

  it('renders light mode icon and tooltip when in light mode', () => {
    (useTheme as jest.Mock).mockReturnValue({
      isDarkMode: false,
      toggleTheme: jest.fn(),
    });

    render(
      <ThemeProvider theme={createTheme()}>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    expect(screen.getByRole('button')).toContainElement(screen.getByTestId('Brightness4Icon'));
  });

  it('calls toggleTheme when button is clicked', () => {
    const mockToggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      isDarkMode: true,
      toggleTheme: mockToggleTheme,
    });

    render(
      <ThemeProvider theme={createTheme()}>
        <ThemeToggleButton />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
