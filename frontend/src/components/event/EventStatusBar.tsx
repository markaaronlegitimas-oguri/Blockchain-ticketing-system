import React from 'react';
import { Box, useTheme } from '@mui/material';

interface EventStatusBarProps {
  isUpcoming: boolean;
  isCancelled: boolean;
}

const EventStatusBar: React.FC<EventStatusBarProps> = ({ isUpcoming, isCancelled }) => {
  const theme = useTheme();

  return (
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
  );
};

export default EventStatusBar; 