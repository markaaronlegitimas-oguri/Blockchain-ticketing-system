import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress,
  InputAdornment,
  useTheme
} from '@mui/material';
import { 
  Event as EventIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  ConfirmationNumber as TicketIcon
} from '@mui/icons-material';

interface NewEventFormProps {
    onSubmit: (name: string, date: number, price: number, tickets: number) => Promise<void>;
    onCancel: () => void;
}

const NewEventForm: React.FC<NewEventFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [tickets, setTickets] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const theme = useTheme();

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) newErrors.name = 'Event name is required';
    if (!date) newErrors.date = 'Date is required';
    if (!time) newErrors.time = 'Time is required';
    
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!tickets) {
      newErrors.tickets = 'Number of tickets is required';
    } else if (isNaN(parseInt(tickets)) || parseInt(tickets) <= 0) {
      newErrors.tickets = 'Number of tickets must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const timestamp = Math.floor(new Date(`${date}T${time}`).getTime() / 1000);
        const priceValue = parseFloat(price);
        const ticketCount = parseInt(tickets);

        if (isNaN(timestamp)) {
            setErrors({...errors, date: 'Date or time is not valid'});
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(name, timestamp, priceValue, ticketCount);
        } catch (error) {
            console.error("Error creating event:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <TextField
            fullWidth
            id="event-name"
            label="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            InputProps={{
              startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon color="primary" />
                  </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
        />

        <TextField
            fullWidth
            id="event-date"
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                  <InputAdornment position="start">
                    <EventIcon color="primary" />
                  </InputAdornment>
              ),
            }}
        />

        <TextField
            fullWidth
            id="event-time"
            label="Time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            error={!!errors.time}
            helperText={errors.time}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                  <InputAdornment position="start">
                    <TimeIcon color="primary" />
                  </InputAdornment>
              ),
            }}
        />

        <TextField
            fullWidth
            id="event-price"
            label="Price (ETH)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={!!errors.price}
            helperText={errors.price}
            required
            inputProps={{ step: "0.01", min: "0" }}
            placeholder="0.05"
            InputProps={{
              startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="primary" />
                  </InputAdornment>
              ),
            }}
        />

        <TextField
            fullWidth
            id="event-tickets"
            label="Available Tickets"
            type="number"
            value={tickets}
            onChange={(e) => setTickets(e.target.value)}
            error={!!errors.tickets}
            helperText={errors.tickets}
            required
            inputProps={{ min: "1" }}
            placeholder="100"
            InputProps={{
              startAdornment: (
                  <InputAdornment position="start">
                    <TicketIcon color="primary" />
                  </InputAdornment>
              ),
            }}
        />
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={{ px: 3 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ 
            px: 3,
            background: isSubmitting ? undefined : 'linear-gradient(45deg, #3f51b5, #f50057)',
            '&:hover': {
              background: isSubmitting ? undefined : 'linear-gradient(45deg, #536dfe, #ff1a6c)',
            }
          }}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
      </Box>
    </Box>
  );
};

export default NewEventForm;