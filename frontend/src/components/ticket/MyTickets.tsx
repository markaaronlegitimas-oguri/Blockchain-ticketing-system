import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useAccount } from '../../contexts/AccountContext';
import ConnectWalletMessage from '../ConnectWalletMessage';
import TicketListHeader from './TicketListHeader';
import TicketList from './TicketList';
import NoTicketsMessage from './NoTicketsMessage';
import TransferDialog from './TransferDialog';

interface Ticket {
  id: number;
  eventId: number;
  eventName: string;
  date: number;
  valid: boolean;
  isCancelled: boolean;
}

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { contract, account, isConnected, connectWallet } = useAccount();
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [transferTicketId, setTransferTicketId] = useState<number | null>(null);

  const fetchTickets = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);

      const userTicketsArray = await contract.getUserTickets(account);

      if (userTicketsArray.length === 0) {
        setTickets([]);
        setLoading(false);
        return;
      }

      const ticketPromises = [];
      const eventInfoPromises = [];

      for (let i = 0; i < userTicketsArray.length; i++) {
        const ticketId = userTicketsArray[i].toNumber();
        ticketPromises.push(contract.tickets(ticketId));
      }

      const ticketResults = await Promise.all(ticketPromises);

      for (let i = 0; i < ticketResults.length; i++) {
        const eventId = ticketResults[i].eventId.toNumber();
        eventInfoPromises.push(contract.events(eventId));
      }

      const eventResults = await Promise.all(eventInfoPromises);

      const formattedTickets = ticketResults.map((ticket, index) => {
        const eventId = ticket.eventId.toNumber();
        const eventInfo = eventResults[index];
        const eventDate = new Date(eventInfo.date.toNumber() * 1000);
        const isPastEvent = new Date() > eventDate;
        const isTicketValid = ticket.valid && !isPastEvent;

        return {
          id: userTicketsArray[index].toNumber(),
          eventId,
          eventName: eventInfo.name,
          date: eventInfo.date.toNumber(),
          valid: isTicketValid,
          isCancelled: !eventInfo.active
        };
      });

      setTickets(formattedTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferTicket = async () => {
    if (!contract || !transferAddress || transferTicketId === null) return;

    try {
      // Check if the address is valid
      if (!transferAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        alert("Invalid Ethereum address");
        return;
      }

      // Check if the ticket is still valid
      const ticket = tickets.find(t => t.id === transferTicketId);
      if (!ticket?.valid) {
        alert("This ticket is no longer valid for transfer");
        return;
      }

      const tx = await contract.transferTicket(transferTicketId, transferAddress);
      await tx.wait();

      alert("Ticket transferred successfully!");
      setTransferTicketId(null);
      setTransferAddress('');
      fetchTickets();
    } catch (error: any) {
      console.error("Error transferring ticket:", error);
      alert(`Error: ${error.message || "Unknown error"}`);
    }
  };

  const handleTransferClick = (ticketId: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket?.valid) {
      alert("This ticket is no longer valid for transfer");
      return;
    }
    setTransferTicketId(ticketId);
  };

  const handleTransferClose = () => {
    setTransferTicketId(null);
    setTransferAddress('');
  };

  useEffect(() => {
    if (contract && account) {
      fetchTickets();

      // Listen for transfer events
      const transferFilter = contract.filters.TicketTransferred();
      contract.on(transferFilter, fetchTickets);

      return () => {
        contract.off(transferFilter, fetchTickets);
      };
    }
  }, [contract, account]);

  if (!isConnected) {
    return <ConnectWalletMessage onConnect={connectWallet} />;
  }

  return (
    <Box>
      <TicketListHeader />

      {loading ? (
        <TicketList 
          tickets={[]} 
          loading={true} 
          onTransferClick={handleTransferClick} 
        />
      ) : tickets.length === 0 ? (
        <NoTicketsMessage />
      ) : (
        <TicketList 
          tickets={tickets} 
          loading={false} 
          onTransferClick={handleTransferClick} 
        />
      )}

      <TransferDialog
        open={transferTicketId !== null} 
        onClose={handleTransferClose}
        onTransfer={handleTransferTicket}
        transferAddress={transferAddress}
        onAddressChange={setTransferAddress}
      />
    </Box>
  );
};

export default MyTickets;