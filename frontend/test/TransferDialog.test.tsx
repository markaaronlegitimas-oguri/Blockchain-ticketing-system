import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransferDialog from '../src/components/ticket/TransferDialog';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('TransferDialog Component', () => {
  const theme = createTheme();
  const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onTransfer: jest.fn(),
    transferAddress: '',
    onAddressChange: jest.fn(),
  };

  it('renders dialog title and input when open', () => {
    renderWithTheme(<TransferDialog {...defaultProps} />);

    expect(screen.getByText(/Transfer Ticket/i)).toBeInTheDocument();
    const input = screen.getByLabelText(/Recipient Address/i);
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('');

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Transfer/i })).toBeInTheDocument();
  });

  it('calls onAddressChange when typing in input', () => {
    const onAddressChange = jest.fn();
    renderWithTheme(
      <TransferDialog {...defaultProps} onAddressChange={onAddressChange} />
    );

    const input = screen.getByLabelText(/Recipient Address/i);
    fireEvent.change(input, { target: { value: '0xABC' } });
    expect(onAddressChange).toHaveBeenCalledWith('0xABC');
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn();
    renderWithTheme(<TransferDialog {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onTransfer when transfer button is clicked', () => {
    const onTransfer = jest.fn();
    renderWithTheme(<TransferDialog {...defaultProps} onTransfer={onTransfer} />);

    fireEvent.click(screen.getByRole('button', { name: /Transfer/i }));
    expect(onTransfer).toHaveBeenCalled();
  });

  it('does not render dialog when open is false', () => {
    renderWithTheme(<TransferDialog {...defaultProps} open={false} />);
    expect(screen.queryByText(/Transfer Ticket/i)).not.toBeInTheDocument();
  });
});

