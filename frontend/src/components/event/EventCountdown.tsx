import React from 'react';
import { Box, Typography } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material';

interface EventCountdownProps {
  days: number;
  hours: number;
}

const EventCountdown: React.FC<EventCountdownProps> = ({ days, hours }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        p: 1,
        bgcolor: alpha(theme.palette.warning.main, 0.1),
        borderRadius: 1
      }}
    >
      <AccessTimeIcon color="warning" sx={{ mr: 1 }} />
      <Typography variant="body2" color="warning.main">
        {days > 0 
          ? `In ${days} days and ${hours} hours`
          : `In ${hours} hours`}
      </Typography>
    </Box>
  );
};

export default EventCountdown; 