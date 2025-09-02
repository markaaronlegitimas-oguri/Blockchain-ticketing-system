import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface EventListHeaderProps {
  onNewEvent: () => void;
  isOwner: boolean;
}

const EventListHeader: React.FC<EventListHeaderProps> = ({ onNewEvent, isOwner }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h4" component="h2" fontWeight="bold" sx={{ 
        color: theme.palette.text.primary,
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: -8,
          left: 0,
          width: 60,
          height: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right, #f50057, #3f51b5)',
        }
      }}>
        Theater Events
      </Typography>
      {isOwner && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewEvent}
          sx={{ 
            background: 'linear-gradient(45deg, #f50057, #3f51b5)',
            boxShadow: '0 4px 10px rgba(245, 0, 87, 0.2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #ff1a6c, #536dfe)',
            }
          }}
        >
          New Event
        </Button>
      )}
    </Box>
  );
};

export default EventListHeader; 