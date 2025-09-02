import React from 'react';
import { ethers } from 'ethers';
import { 
  Card, 
  CardContent, 
  Button, 
  Box, 
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Cancel as CancelIcon,
  EventBusy as EventEndedIcon,
  EventSeat as SoldOutIcon
} from '@mui/icons-material';
import { useAccount } from '../../contexts/AccountContext';
import EventHeader from './EventHeader';
import EventCountdown from './EventCountdown';
import EventDetails from './EventDetails';

interface TheaterEventProps {
  id: number;
  name: string;
  date: number;
  ticketPrice: string;
  availableTickets: number;
  active: boolean;
  onPurchase: (id: number) => void;
  onCancel: (id: number) => void;
}

const TheaterEvent: React.FC<TheaterEventProps> = ({
  id,
  name,
  date,
  ticketPrice,
  availableTickets,
  active,
  onPurchase,
  onCancel
}) => {
  const { isOwner } = useAccount();
  const theme = useTheme();
  const eventDate = new Date(date * 1000);
  const isPastEvent = new Date() > eventDate;
  const isUpcoming = !isPastEvent && active;
  const isCancelled = !active;

  // Calculate time remaining for upcoming events
  const timeRemaining = isUpcoming ? {
    days: Math.floor((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    hours: Math.floor(((eventDate.getTime() - new Date().getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  } : null;

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isCancelled ? 0.7 : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: isUpcoming ? 'translateY(-8px)' : 'none',
          boxShadow: isUpcoming ? 8 : 3,
        }
      }}
    >
      <Box
        sx={{
          height: 4,
          background: isUpcoming 
            ? `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            : isCancelled 
              ? theme.palette.error.main 
              : theme.palette.grey[400],
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <EventHeader 
          name={name}
          date={eventDate}
          isUpcoming={isUpcoming}
          isCancelled={isCancelled}
        />

        {isUpcoming && timeRemaining && timeRemaining.days < 7 && (
          <EventCountdown 
            days={timeRemaining.days}
            hours={timeRemaining.hours}
          />
        )}

        <EventDetails 
          date={eventDate}
          price={ethers.utils.formatEther(ticketPrice)}
          tickets={availableTickets}
        />

        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          {isPastEvent ? (
            <Button 
              fullWidth 
              variant="outlined" 
              disabled
              startIcon={<EventEndedIcon />}
              sx={{ 
                color: theme.palette.text.secondary,
                borderColor: theme.palette.divider
              }}
            >
              Event ended
            </Button>
          ) : isCancelled ? (
            <Button 
              fullWidth 
              variant="outlined" 
              disabled
              startIcon={<CancelIcon />}
              sx={{ 
                color: theme.palette.error.main,
                borderColor: theme.palette.error.main
              }}
            >
              Cancelled
            </Button>
          ) : availableTickets > 0 ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {isOwner && (
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(id);
                  }}
                  startIcon={<CancelIcon />}
                  sx={{ 
                    background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                    }
                  }}
                >
                  Cancel Event
                </Button>
              )}
              <Button 
                fullWidth 
                variant="contained" 
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchase(id);
                }}
                sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  }
                }}
              >
                Purchase Ticket
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {isOwner && (
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(id);
                  }}
                  startIcon={<CancelIcon />}
                  sx={{ 
                    background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                    }
                  }}
                >
                  Cancel Event
                </Button>
              )}
              <Button 
                fullWidth 
                variant="outlined" 
                disabled
                startIcon={<SoldOutIcon />}
                sx={{ 
                  color: theme.palette.text.secondary,
                  borderColor: theme.palette.divider
                }}
              >
                Sold Out
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TheaterEvent;