import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TicketListHeader: React.FC = () => {
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
        My tickets
      </Typography>
    </Box>
  );
};

export default TicketListHeader; 