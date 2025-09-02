import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventsPage from "../src/components/event/EventsPage";
import { useAccount } from "../src/contexts/AccountContext";
import { createEvent } from "../src/interactions/CreateEventInteraction";

// Mock window.alert
beforeAll(() => {
  window.alert = jest.fn();
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Mock all child components
jest.mock("../src/components/ConnectWalletMessage", () => () => (
  <div>ConnectWalletMessage</div>
));
jest.mock(
  "../src/components/event/EventListHeader",
  () =>
    ({ onNewEvent, isOwner }: any) =>
      <button onClick={onNewEvent}>New Event</button>
);
jest.mock("../src/components/event/EventList", () => ({ events }: any) => (
  <div>Events: {events.length}</div>
));
jest.mock("../src/components/event/NoEventsMessage", () => () => (
  <div>NoEventsMessage</div>
));
jest.mock(
  "../src/components/event/EventDialog",
  () =>
    ({ open, onClose, onSubmit }: any) =>
      open ? (
        <div>
          <button onClick={() => onSubmit("Test Event", 1234567890, 10, 100)}>
            Submit Event
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null
);

// Mock external interaction
jest.mock("../src/interactions/CreateEventInteraction", () => ({
  createEvent: jest.fn(),
}));

// Mock context
jest.mock("../src/contexts/AccountContext", () => ({
  useAccount: jest.fn(),
}));

describe("EventsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows ConnectWalletMessage when not connected", () => {
    (useAccount as jest.Mock).mockReturnValue({
      isConnected: false,
      connectWallet: jest.fn(),
    });

    render(<EventsPage />);
    expect(screen.getByText("ConnectWalletMessage")).toBeInTheDocument();
  });

  it("renders event list when connected and events exist", async () => {
    const contractMock = {
      eventCounter: jest.fn().mockResolvedValue(1),
      events: jest.fn().mockImplementation((index: number) => {
        // Handle index
        return Promise.resolve({
          name: "Test Event",
          date: { toNumber: () => 1234567890 },
          ticketPrice: { toString: () => "100" },
          availableTickets: { toNumber: () => 100 },
          active: true,
        });
      }),
      filters: {
        EventCreated: jest.fn(() => ({})),
        TicketPurchased: jest.fn(() => ({})),
        EventCancelled: jest.fn(() => ({})),
      },
      on: jest.fn(),
      off: jest.fn(),
    };

    (useAccount as jest.Mock).mockReturnValue({
      contract: contractMock,
      isOwner: true,
      isConnected: true,
    });

    render(<EventsPage />);

    // Use findByText to wait for async content
    expect(await screen.findByText(/Events: 1/)).toBeInTheDocument();
  });

  it("can open and submit the create event form", async () => {
    const contractMock = {
      eventCounter: jest.fn().mockResolvedValue(0),
      events: jest.fn(),
      filters: {
        EventCreated: jest.fn(() => ({})),
        TicketPurchased: jest.fn(() => ({})),
        EventCancelled: jest.fn(() => ({})),
      },
      on: jest.fn(),
      off: jest.fn(),
    };

    (createEvent as jest.Mock).mockResolvedValue({ wait: jest.fn() });

    (useAccount as jest.Mock).mockReturnValue({
      contract: contractMock,
      isOwner: true,
      isConnected: true,
    });

    render(<EventsPage />);

    const user = userEvent.setup();
    await user.click(screen.getByText("New Event"));
    await user.click(screen.getByText("Submit Event"));

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledWith(
        contractMock,
        "Test Event",
        1234567890,
        10,
        100
      );
      // Verify alert was triggered
      expect(window.alert).toHaveBeenCalledWith("Event created successfully!");
    });
  });
});
