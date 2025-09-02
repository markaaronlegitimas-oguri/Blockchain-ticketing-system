import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

interface NoEventsMessageProps {
  isOwner: boolean;
}

const NoEventsMessage: React.FC<NoEventsMessageProps> = ({ isOwner }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 8,
        textAlign: 'center',
        borderRadius: 2,
        border: `1px dashed ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        }
      }}
    >
      <Typography 
        variant="h6" 
        color="text.secondary" 
        gutterBottom
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >
        <CalendarIcon color="primary" />
        No events available yet.
      </Typography>
      <Typography 
        variant="body2" 
        color="primary" 
        sx={{ 
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}
      >
        {isOwner ? (
          <>
            <AddIcon color="primary" />
            Create your first event!
          </>
        ) : (
          <>
            <MoneyIcon color="primary" />
            Check back later for upcoming events.
          </>
        )}
      </Typography>
    </Box>
  );
};

export default NoEventsMessage; 