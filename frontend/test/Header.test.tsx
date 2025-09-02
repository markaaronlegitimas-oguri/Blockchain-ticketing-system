import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../src/components/header/Header";
import { useAccount } from "../src/contexts/AccountContext";
import ThemeToggleButton from "../src/components/header/ThemeToggleButton";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

jest.mock("../src/contexts/AccountContext", () => ({
  useAccount: jest.fn(),
}));

jest.mock("../src/components/header/ThemeToggleButton", () => () => (
  <button>Toggle Theme</button>
));

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme({
    palette: {
      mode: "light",
    },
  });

  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {ui}
    </ThemeProvider>
  );
};

describe("Header", () => {
  it('renders "Connect Wallet" button when not connected', () => {
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: false,
      connectWallet: jest.fn(),
    });

    renderWithTheme(<Header />);
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
    expect(screen.getByText(/toggle theme/i)).toBeInTheDocument();
  });

  it("renders owner chips when connected as owner", () => {
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: true,
      isOwner: true,
      account: "0xAbc123456789",
      balance: 1.2345,
    });

    renderWithTheme(<Header />);

    expect(screen.getByText(/owner/i)).toBeInTheDocument();
    expect(screen.getByText(/1.2345 ETH/i)).toBeInTheDocument();
    // Use regex to match the exact shortened address
    expect(screen.getByText(/0xAbc1\.\.\.6789/)).toBeInTheDocument();
  });

  it("renders customer chips when connected but not owner", () => {
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: true,
      isOwner: false,
      account: "0x9876543210ef",
      balance: 0.456,
    });

    renderWithTheme(<Header />);

    expect(screen.getByText(/customer/i)).toBeInTheDocument();
    expect(screen.getByText(/0.456 ETH/i)).toBeInTheDocument();
    // Adjust regex for customer address
    expect(screen.getByText(/0x9876\.\.\.10ef/)).toBeInTheDocument();
  });

  it("calls connectWallet when button clicked", () => {
    const mockConnect = jest.fn();
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: false,
      connectWallet: mockConnect,
    });

    renderWithTheme(<Header />);
    fireEvent.click(screen.getByText(/connect wallet/i));
    expect(mockConnect).toHaveBeenCalled();
  });
});
