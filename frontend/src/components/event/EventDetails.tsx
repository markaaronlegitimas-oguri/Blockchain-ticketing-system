import React from "react";
import { Box, Typography } from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ConfirmationNumber as TicketIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material";

interface EventDetailsProps {
  date: Date;
  price: string;
  tickets: number;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  date,
  price,
  tickets,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ color: theme.palette.text.secondary }}>
      <Box display="flex" alignItems="center" mb={1.5}>
        <CalendarIcon
          fontSize="small"
          sx={{ mr: 1.5, color: theme.palette.primary.main }}
          data-testid="calendar-icon"
        />
        <Typography variant="body2">
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}{" "}
          at{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" mb={1.5}>
        <MoneyIcon
          fontSize="small"
          sx={{ mr: 1.5, color: theme.palette.primary.main }}
          data-testid="money-icon"
        />
        <Typography variant="body2">{price} ETH per ticket</Typography>
      </Box>

      <Box display="flex" alignItems="center">
        <TicketIcon
          fontSize="small"
          sx={{ mr: 1.5, color: theme.palette.primary.main }}
          data-testid="ticket-icon"
        />
        <Typography variant="body2">
          {tickets} {tickets === 1 ? "ticket available" : "tickets available"}
        </Typography>
      </Box>
    </Box>
  );
};

export default EventDetails;
