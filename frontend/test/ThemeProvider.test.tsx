import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext.tsx'; 

beforeAll(() => {
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: jest.fn().mockImplementation((key) => {
        return key === 'theme' ? 'light' : null;
      }),
      setItem: jest.fn(),
    },
    writable: true,
  });
});

describe('ThemeProvider', () => {
  it('should use light theme by default', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText(/current theme: light/i)).toBeInTheDocument();
  });

  it('should toggle theme between dark and light', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByText(/current theme: light/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/toggle theme/i));

    expect(screen.getByText(/current theme: dark/i)).toBeInTheDocument();
  });

  it('should update localStorage when the theme is toggled', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(localStorage.getItem).toHaveBeenCalledWith('theme');
    expect(localStorage.getItem).toReturnWith('light');

    fireEvent.click(screen.getByText(/toggle theme/i));

    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });
});

const TestComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {isDarkMode ? 'dark' : 'light'}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
};
