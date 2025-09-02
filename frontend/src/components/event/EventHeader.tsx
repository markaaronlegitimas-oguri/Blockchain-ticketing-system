import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { format } from 'date-fns';

interface EventHeaderProps {
  name: string;
  date: Date;
  isUpcoming: boolean;
  isCancelled: boolean;
}

const EventHeader: React.FC<EventHeaderProps> = ({ 
  name, 
  date, 
  isUpcoming, 
  isCancelled 
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
        {name}
      </Typography>
      <Chip
        label={isUpcoming ? 'Upcoming' : isCancelled ? 'Cancelled' : 'Past'}
        color={isUpcoming ? 'primary' : isCancelled ? 'error' : 'default'}
        size="small"
      />
    </Box>
  );
};

export default EventHeader; 