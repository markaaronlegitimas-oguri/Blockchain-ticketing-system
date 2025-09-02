import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface ConnectWalletMessageProps {
  onConnect: () => void;
}

const ConnectWalletMessage: React.FC<ConnectWalletMessageProps> = ({ onConnect }) => {
  return (
    <Box
      sx={{
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        backgroundImage: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15) 0%, rgba(245, 0, 87, 0.15) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={2} sx={{ 
        background: 'linear-gradient(to right, #f50057, #3f51b5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Explore Theater Events
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4} sx={{ maxWidth: 600 }}>
        Connect your wallet to browse available events and purchase tickets on the blockchain
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={onConnect}
        sx={{ 
          px: 4, 
          py: 1.5,
          background: 'linear-gradient(45deg, #f50057, #3f51b5)',
          boxShadow: '0 4px 20px rgba(245, 0, 87, 0.25)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff1a6c, #536dfe)',
            boxShadow: '0 6px 25px rgba(245, 0, 87, 0.35)',
          }
        }}
      >
        Connect MetaMask
      </Button>
    </Box>
  );
};

export default ConnectWalletMessage; 
