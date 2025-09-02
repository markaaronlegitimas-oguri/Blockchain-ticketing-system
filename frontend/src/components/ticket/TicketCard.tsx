import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  Divider 
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  ConfirmationNumber as TicketIcon,
  SwapHoriz as TransferIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface TicketCardProps {
  ticket: {
    id: number;
    eventName: string;
    date: number;
    valid: boolean;
    isCancelled?: boolean;
  };
  onTransferClick: (ticketId: number) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onTransferClick }) => {
  const theme = useTheme();
  const eventDate = new Date(ticket.date * 1000);
  const isPastEvent = new Date() > eventDate;
  const isUsed = !ticket.valid && isPastEvent;
  const isInvalid = !ticket.valid && !isPastEvent;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: ticket.valid ? 1 : 0.7,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: ticket.valid ? 'translateY(-8px)' : 'none',
          boxShadow: ticket.valid ? 8 : 3,
        }
      }}
    >
      <Box
        sx={{
          height: 4,
          background: ticket.valid
            ? `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            : isUsed 
              ? theme.palette.grey[400]
              : theme.palette.error.main,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius
        }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              flex: 1,
              mr: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {ticket.eventName}
          </Typography>
          <Chip
            label={ticket.valid ? "Valid" : isUsed ? "Used" : "Invalid"}
            color={ticket.valid ? "success" : isUsed ? "default" : "error"}
            size="small"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        <Box>
          <Box display="flex" alignItems="center" mb={1.5}>
            <CalendarIcon
              fontSize="small"
              sx={{ mr: 1.5, color: theme.palette.primary.main }}
            />
            <Typography variant="body2">
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })} at {eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={1.5}>
            <TicketIcon
              fontSize="small"
              sx={{ mr: 1.5, color: theme.palette.primary.main }}
            />
            <Typography variant="body2">
              Seat: {ticket.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          {ticket.valid ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={<TransferIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onTransferClick(ticket.id);
              }}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              Transfer
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              disabled
              startIcon={<CancelIcon />}
              sx={{
                color: isUsed ? theme.palette.text.secondary : theme.palette.error.main,
                borderColor: isUsed ? theme.palette.divider : theme.palette.error.main
              }}
            >
              {isUsed ? "Used" : "Invalid"}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketCard; 