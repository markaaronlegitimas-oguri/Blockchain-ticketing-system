import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConnectWalletMessage from "../src/components/ConnectWalletMessage";

describe("ConnectWalletMessage", () => {
  const mockOnConnect = jest.fn();

  beforeEach(() => {
    mockOnConnect.mockReset();
  });

  test("renders the component with correct text content", () => {
    render(<ConnectWalletMessage onConnect={mockOnConnect} />);

    expect(screen.getByText("Explore Theater Events")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Connect your wallet to browse available events and purchase tickets on the blockchain"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Connect MetaMask" })
    ).toBeInTheDocument();
  });

  test("calls onConnect when button is clicked", () => {
    render(<ConnectWalletMessage onConnect={mockOnConnect} />);

    const connectButton = screen.getByRole("button", {
      name: "Connect MetaMask",
    });
    fireEvent.click(connectButton);

    expect(mockOnConnect).toHaveBeenCalledTimes(1);
  });

  test("button has the correct styling", () => {
    render(<ConnectWalletMessage onConnect={mockOnConnect} />);

    const button = screen.getByRole("button", { name: "Connect MetaMask" });

    expect(button).toHaveClass("MuiButton-contained");

    expect(button).toHaveClass("MuiButton-sizeLarge");
  });

  test("renders with the correct layout structure", () => {
    const { container } = render(
      <ConnectWalletMessage onConnect={mockOnConnect} />
    );

    const boxElement = container.firstChild;
    expect(boxElement).toHaveStyle({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    });

    const heading = screen.getByRole("heading", {
      name: /Explore Theater Events/i,
    });
    const description = screen.getByText(
      /Connect your wallet to browse available events and purchase tickets on the blockchain/i
    );
    const button = screen.getByRole("button", { name: /Connect MetaMask/i });

    expect(heading).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(button).toBeInTheDocument();

    // Check order in DOM
    const children = Array.from(boxElement?.childNodes || []);
    const headingIndex = children.indexOf(heading);
    const descriptionIndex = children.indexOf(description);
    const buttonIndex = children.indexOf(button);

    expect(headingIndex).toBeLessThan(descriptionIndex);
    expect(descriptionIndex).toBeLessThan(buttonIndex);
  });
});
