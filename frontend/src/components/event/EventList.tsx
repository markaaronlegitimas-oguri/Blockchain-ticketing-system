import React from 'react';
import { Grid, Box, Skeleton } from '@mui/material';
import { Grow } from '@mui/material';
import TheaterEvent from './TheaterEvent';

interface Event {
  id: number;
  name: string;
  date: number;
  ticketPrice: string;
  availableTickets: number;
  active: boolean;
}

interface EventListProps {
  events: Event[];
  loading: boolean;
  onPurchase: (id: number) => void;
  onCancel: (id: number) => void;
}

const EventList: React.FC<EventListProps> = ({ events, loading, onPurchase, onCancel }) => {
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
      {events.map((event, index) => {
        const eventDate = new Date(event.date * 1000);
        const isPastEvent = new Date() > eventDate;
        
        return (
          <Grow in={true} timeout={(index + 1) * 200} key={event.id}>
            <Box
              onClick={() => {
                if (event.active && !isPastEvent && event.availableTickets > 0) {
                  onPurchase(event.id);
                }
              }}
              sx={{
                cursor: event.active && !isPastEvent && event.availableTickets > 0 ? 'pointer' : 'default',
                '&:hover': {
                  '& .MuiCard-root': {
                    transform: event.active && !isPastEvent ? 'translateY(-8px)' : 'none',
                    boxShadow: event.active && !isPastEvent ? 8 : 3,
                  }
                }
              }}
            >
              <TheaterEvent
                id={event.id}
                name={event.name}
                date={event.date}
                ticketPrice={event.ticketPrice}
                availableTickets={event.availableTickets}
                active={event.active}
                onPurchase={onPurchase}
                onCancel={onCancel}
              />
            </Box>
          </Grow>
        );
      })}
    </Grid>
  );
};

export default EventList; 