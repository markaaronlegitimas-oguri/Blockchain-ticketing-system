import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { useAccount } from '../../contexts/AccountContext';
import ConnectWalletMessage from '../ConnectWalletMessage';
import TicketListHeader from './TicketListHeader';
import TicketList from './TicketList';
import NoTicketsMessage from './NoTicketsMessage';
import TransferDialog from './TransferDialog';
import { Ticket, TicketStatus } from '../../utils/ticketTypes';

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { contract, account, isConnected, connectWallet } = useAccount();
  const [transferAddress, setTransferAddress] = useState<string>('');
  const [transferTicketId, setTransferTicketId] = useState<number | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);

      const ids = await contract.getTicketsOwnedBy(account);

      const results: Ticket[] = await Promise.all(
        ids.map(async (rawId: any) => {
          const id = Number(rawId.toString());
          const t = await contract.getTicket(id);
          console.debug('getTicket', id, t); // remove once verified
          return { id, status: Number(t.status) as TicketStatus };
        })
      );

      setTickets(results);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  const handleTransferTicket = async () => {
    if (!contract || !transferAddress || transferTicketId === null) return;

    try {
      if (!transferAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        alert('Invalid Ethereum address');
        return;
      }

      const ticket = tickets.find((t) => t.id === transferTicketId);
      if (ticket?.status !== TicketStatus.Sold) {
        alert('Only unused, active tickets can be transferred');
        return;
      }

      const tx = await contract.transferTicket(transferTicketId, transferAddress);
      await tx.wait();

      alert('Ticket transferred successfully!');
      setTransferTicketId(null);
      setTransferAddress('');
      fetchTickets();
    } catch (error: any) {
      console.error('Error transferring ticket:', error);
      alert(`Error: ${error.reason || error.message || 'Unknown error'}`);
    }
  };

  const handleTransferClick = (ticketId: number) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket?.status !== TicketStatus.Sold) {
      alert('Only unused, active tickets can be transferred');
      return;
    }
    setTransferTicketId(ticketId);
  };

  const handleTransferClose = () => {
    setTransferTicketId(null);
    setTransferAddress('');
  };

  useEffect(() => {
    if (!contract || !account) return;

    fetchTickets();

    // Refresh when a transfer happens (only if the contract has this event)
    if (contract.filters?.TicketTransferred) {
      const transferFilter = contract.filters.TicketTransferred();
      contract.on(transferFilter, fetchTickets);
      return () => {
        contract.off(transferFilter, fetchTickets);
      };
    }
  }, [contract, account, fetchTickets]);

  if (!isConnected) {
    return <ConnectWalletMessage onConnect={connectWallet} />;
  }

  return (
    <Box>
      <TicketListHeader />

      {loading ? (
        <TicketList tickets={[]} loading={true} onTransferClick={handleTransferClick} />
      ) : tickets.length === 0 ? (
        <NoTicketsMessage />
      ) : (
        <TicketList tickets={tickets} loading={false} onTransferClick={handleTransferClick} />
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