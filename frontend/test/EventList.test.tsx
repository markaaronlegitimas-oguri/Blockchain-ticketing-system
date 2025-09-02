import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EventList from "../src/components/event/EventList";

jest.mock("../src/components/event/TheaterEvent", () => {
  return function MockTheaterEvent(props: any) {
    return (
      <div data-testid="theater-event">
        {props.name} - {props.ticketPrice}
      </div>
    );
  };
});

describe("EventList", () => {
  const mockEvents = [
    {
      id: 1,
      name: "Concert",
      date: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
      ticketPrice: "10 ETH",
      availableTickets: 10,
      active: true,
    },
    {
      id: 2,
      name: "Play",
      date: Math.floor(Date.now() / 1000) - 86400, // Yesterday
      ticketPrice: "5 ETH",
      availableTickets: 0,
      active: true,
    },
    {
      id: 3,
      name: "Cancelled Show",
      date: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
      ticketPrice: "8 ETH",
      availableTickets: 5,
      active: false,
    },
  ];

  const mockOnPurchase = jest.fn();
  const mockOnCancel = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeletons when loading is true", () => {
    const { container } = render(
      <EventList
        events={[]}
        loading={true}
        onPurchase={mockOnPurchase}
        onCancel={mockOnCancel}
      />
    );

    // Query skeletons using their class name
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons).toHaveLength(3);
  });

  it("calls onPurchase when clicking an active, upcoming event with available tickets", () => {
    render(
      <EventList
        events={[mockEvents[0]]}
        loading={false}
        onPurchase={mockOnPurchase}
        onCancel={mockOnCancel}
      />
    );

    const activeEvent = screen.getByTestId("theater-event");
    fireEvent.click(activeEvent);

    expect(mockOnPurchase).toHaveBeenCalledTimes(1);
    expect(mockOnPurchase).toHaveBeenCalledWith(1);
  });

  it("does not call onPurchase when clicking a past event", () => {
    render(
      <EventList
        events={[mockEvents[1]]}
        loading={false}
        onPurchase={mockOnPurchase}
        onCancel={mockOnCancel}
      />
    );

    const pastEvent = screen.getByTestId("theater-event");
    fireEvent.click(pastEvent);

    expect(mockOnPurchase).not.toHaveBeenCalled();
  });

  it("does not call onPurchase when clicking an inactive event", () => {
    render(
      <EventList
        events={[mockEvents[2]]}
        loading={false}
        onPurchase={mockOnPurchase}
        onCancel={mockOnCancel}
      />
    );

    const inactiveEvent = screen.getByTestId("theater-event");
    fireEvent.click(inactiveEvent);

    expect(mockOnPurchase).not.toHaveBeenCalled();
  });

  it("does not call onPurchase when clicking an event with no available tickets", () => {
    render(
      <EventList
        events={[mockEvents[1]]}
        loading={false}
        onPurchase={mockOnPurchase}
        onCancel={mockOnCancel}
      />
    );

    const soldOutEvent = screen.getByTestId("theater-event");
    fireEvent.click(soldOutEvent);

    expect(mockOnPurchase).not.toHaveBeenCalled();
  });

  it("renders events in a Grid container", () => {
    const { container } = render(
      <EventList
        events={mockEvents}
        loading={false}
        onPurchase={mockOnPurchase}
        onCancel={mockOnCancel}
      />
    );

    const grid = container.querySelector(".MuiGrid-container");
    expect(grid).toBeInTheDocument();
  });

  it("applies correct animation delays to Grow components", () => {
    const { container } = render(
      <EventList
        events={mockEvents}
        loading={false}
        onPurchase={mockOnPurchase}
        onCancel={mockOnCancel}
      />
    );

    const growElements = container.querySelectorAll(".MuiGrow-root");
    growElements.forEach((grow, index) => {
      expect(grow).toHaveStyle(`transition-delay: ${(index + 1) * 200}ms`);
    });
  });
});
