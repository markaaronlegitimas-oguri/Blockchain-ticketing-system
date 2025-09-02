import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAccount } from '../../contexts/AccountContext';
import { createEvent } from '../../interactions/CreateEventInteraction';
import ConnectWalletMessage from '../ConnectWalletMessage';
import EventListHeader from './EventListHeader';
import EventList from './EventList';
import NoEventsMessage from './NoEventsMessage';
import EventDialog from './EventDialog';

interface Event {
  id: number;
  name: string;
  date: number;
  ticketPrice: string;
  availableTickets: number;
  active: boolean;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewEventForm, setShowNewEventForm] = useState<boolean>(false);
  const { contract, isOwner, isConnected, connectWallet } = useAccount();

  const fetchEvents = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const eventCount = await contract.eventCounter();
      const eventPromises = [];
      
      for (let i = 0; i < eventCount; i++) {
        eventPromises.push(contract.events(i));
      }
      
      const eventResults = await Promise.all(eventPromises);
      const formattedEvents = eventResults.map((event, index) => ({
        id: index,
        name: event.name,
        date: event.date.toNumber(),
        ticketPrice: event.ticketPrice.toString(),
        availableTickets: event.availableTickets.toNumber(),
        active: event.active
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTicket = async (eventId: number) => {
    if (!contract) return;
    
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      const tx = await contract.purchaseTicket(eventId, {
        value: event.ticketPrice
      });
      
      await tx.wait();
      alert("Ticket purchased successfully!");
      await fetchEvents();
    } catch (error: any) {
      console.error("Error purchasing ticket:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
  };

  const handleCancelEvent = async (eventId: number) => {
    if (!contract) return;
    
    try {
      const tx = await contract.cancelEvent(eventId);
      await tx.wait();
      alert("Event cancelled successfully!");
      await fetchEvents();
    } catch (error: any) {
      console.error("Error cancelling event:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
  };

  const handleCreateEvent = async (
      name: string,
      date: number,
      price: number,
      tickets: number
  ) => {
    if (!contract) return;

    try {
      const tx = await createEvent(contract, name, date, price, tickets);
      await tx.wait();
      alert("Event created successfully!");
      setShowNewEventForm(false);
      await fetchEvents();
    } catch (error: any) {
      console.error("Error creating event:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchEvents();
      
      // Listen for contract events
      const eventCreatedFilter = contract.filters.EventCreated();
      const ticketPurchasedFilter = contract.filters.TicketPurchased();
      const eventCancelledFilter = contract.filters.EventCancelled();
      
      contract.on(eventCreatedFilter, fetchEvents);
      contract.on(ticketPurchasedFilter, fetchEvents);
      contract.on(eventCancelledFilter, fetchEvents);
      
      return () => {
        contract.off(eventCreatedFilter, fetchEvents);
        contract.off(ticketPurchasedFilter, fetchEvents);
        contract.off(eventCancelledFilter, fetchEvents);
      };
    }
  }, [contract]);

  if (!isConnected) {
    return <ConnectWalletMessage onConnect={connectWallet} />;
  }

  return (
    <Box>
      <EventListHeader 
        onNewEvent={() => setShowNewEventForm(true)} 
        isOwner={isOwner} 
      />

      {loading ? (
        <EventList 
          events={[]} 
          loading={true} 
          onPurchase={handlePurchaseTicket} 
          onCancel={handleCancelEvent} 
        />
      ) : events.length === 0 ? (
        <NoEventsMessage isOwner={isOwner} />
      ) : (
        <EventList 
          events={events} 
          loading={false} 
          onPurchase={handlePurchaseTicket} 
          onCancel={handleCancelEvent} 
        />
      )}

      <EventDialog 
        open={showNewEventForm} 
        onClose={() => setShowNewEventForm(false)} 
        onSubmit={handleCreateEvent} 
      />
    </Box>
  );
};

export default EventsPage;