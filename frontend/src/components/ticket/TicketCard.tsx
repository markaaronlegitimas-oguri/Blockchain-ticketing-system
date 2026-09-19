import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip, Divider } from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ConfirmationNumber as TicketIcon,
  SwapHoriz as TransferIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Ticket, TicketStatus } from '../../utils/ticketTypes';

interface TicketCardProps {
  ticket: Ticket;
  onTransferClick: (ticketId: number) => void;
}

const STATUS_LABEL: Record<number, string> = {
  [TicketStatus.Unsold]: 'Unsold',
  [TicketStatus.Sold]: 'Valid',
  [TicketStatus.Used]: 'Used',
  [TicketStatus.Cancelled]: 'Cancelled',
  [TicketStatus.Refunded]: 'Refunded',
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onTransferClick }) => {
  const theme = useTheme();
  const isActive = ticket.status === TicketStatus.Sold;
  const label = STATUS_LABEL[ticket.status] ?? 'Unknown';
  const chipColor: 'success' | 'default' | 'error' | 'warning' =
    ticket.status === TicketStatus.Sold
      ? 'success'
      : ticket.status === TicketStatus.Used
      ? 'default'
      : ticket.status === TicketStatus.Refunded
      ? 'warning'
      : 'error';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isActive ? 1 : 0.7,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: isActive ? 'translateY(-8px)' : 'none',
          boxShadow: isActive ? 8 : 3,
        },
      }}
    >
      <Box
        sx={{
          height: 4,
          background: isActive
            ? `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            : ticket.status === TicketStatus.Used
            ? theme.palette.grey[400]
            : theme.palette.error.main,
          borderTopLeftRadius: theme.shape.borderRadius,
          borderTopRightRadius: theme.shape.borderRadius,
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
              WebkitBoxOrient: 'vertical',
            }}
          >
            {ticket.eventName ?? `Ticket #${ticket.id}`}
          </Typography>
          <Chip label={label} color={chipColor} size="small" sx={{ flexShrink: 0 }} />
        </Box>

        <Box>
          {ticket.sessionDate && (
            <Box display="flex" alignItems="center" mb={1.5}>
              <CalendarIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.primary.main }} />
              <Typography variant="body2">{ticket.sessionDate}</Typography>
            </Box>
          )}

          <Box display="flex" alignItems="center" mb={1.5}>
            <TicketIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="body2">Ticket ID: {ticket.id}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          {isActive ? (
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
                },
              }}
            >
              Transfer
            </Button>
          ) : (
            <Button fullWidth variant="outlined" disabled startIcon={<CancelIcon />}>
              {label}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketCard;