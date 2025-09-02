import React from 'react';
import { Grid, Box, Skeleton } from '@mui/material';
import { Grow } from '@mui/material';
import TicketCard from './TicketCard';

interface Ticket {
  id: number;
  eventName: string;
  date: number;
  valid: boolean;
}

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
  onTransferClick: (ticketId: number) => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, loading, onTransferClick }) => {
  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((_, index) => (
          <Skeleton key={index} variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {tickets.map((ticket, index) => (
        <Grow in={true} timeout={(index + 1) * 200} key={ticket.id}>
          <Box
            onClick={() => {
              if (ticket.valid) {
                onTransferClick(ticket.id);
              }
            }}
            sx={{
              cursor: ticket.valid ? 'pointer' : 'default',
              '&:hover': {
                '& .MuiCard-root': {
                  transform: ticket.valid ? 'translateY(-8px)' : 'none',
                  boxShadow: ticket.valid ? 8 : 3,
                }
              }
            }}
          >
            <TicketCard
              ticket={ticket}
              onTransferClick={onTransferClick}
            />
          </Box>
        </Grow>
      ))}
    </Grid>
  );
};

export default TicketList; 