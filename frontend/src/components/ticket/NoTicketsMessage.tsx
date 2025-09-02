import React from 'react';
import { Box, Typography } from '@mui/material';
import { 
  ConfirmationNumber as TicketIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

const NoTicketsMessage: React.FC = () => {
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
        <TicketIcon color="primary" />
        You haven't purchased any tickets yet.
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
        <MoneyIcon color="primary" />
        Visit the Events section to purchase your first tickets!
      </Typography>
    </Box>
  );
};

export default NoTicketsMessage; 