import React from 'react';
import { Grid, Box, Skeleton, Grow } from '@mui/material';
import TicketCard from './TicketCard';
import { Ticket, TicketStatus } from '../../utils/ticketTypes';

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
      {tickets.map((ticket, index) => {
        const isActive = ticket.status === TicketStatus.Sold;
        return (
          <Grow in={true} timeout={(index + 1) * 200} key={ticket.id}>
            <Box
              onClick={() => {
                if (isActive) {
                  onTransferClick(ticket.id);
                }
              }}
              sx={{
                cursor: isActive ? 'pointer' : 'default',
                '&:hover': {
                  '& .MuiCard-root': {
                    transform: isActive ? 'translateY(-8px)' : 'none',
                    boxShadow: isActive ? 8 : 3,
                  },
                },
              }}
            >
              <TicketCard ticket={ticket} onTransferClick={onTransferClick} />
            </Box>
          </Grow>
        );
      })}
    </Grid>
  );
};

export default TicketList;