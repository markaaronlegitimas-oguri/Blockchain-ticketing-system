import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip, Avatar, useTheme } from '@mui/material';
import { useAccount } from '../../contexts/AccountContext';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ThemeToggleButton from './ThemeToggleButton';

const Header: React.FC = () => {
  const { account, balance, isOwner, connectWallet, isConnected } = useAccount();
  const theme = useTheme();

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{ 
        mb: 4,
        background: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <TheaterComedyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TheaterChain
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {isConnected ? (
            <>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2,
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 2,
                  background: 'linear-gradient(to right, rgba(245, 0, 87, 0.1), rgba(63, 81, 181, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {isOwner ? (
                  <Chip 
                    label="Owner" 
                    color="secondary" 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 'bold',
                      boxShadow: 2,
                      background: 'linear-gradient(45deg, #f50057 30%, #3f51b5 90%)',
                      color: 'white',
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.3s ease',
                    }} 
                  />
                ) : (
                  <Chip 
                    label="Customer" 
                    color="primary" 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 'bold',
                      boxShadow: 2,
                      background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)',
                      color: 'white',
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.3s ease',
                    }} 
                  />
                )}
                <Chip
                  icon={<AccountBalanceWalletIcon />}
                  label={`${balance} ETH`}
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'bold',
                    borderColor: 'primary.main',
                    color: 'text.primary',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
                <Chip
                  avatar={
                    <Avatar 
                      sx={{ 
                        bgcolor: 'transparent',
                        borderRadius: 2,
                        '& .MuiSvgIcon-root': {
                          color: 'text.primary',
                          fontSize: '1.5rem',
                        }
                      }}
                    >
                      <AccountCircleIcon />
                    </Avatar>
                  }
                  label={`${account?.substring(0, 6)}...${account?.substring(account.length - 4)}`}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'bold',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                    transition: 'all 0.3s ease',
                  }}
                />
              </Box>
            </>
          ) : (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AccountBalanceWalletIcon />}
              onClick={connectWallet}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #3f51b5 30%, #f50057 90%)',
                boxShadow: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Connect Wallet
            </Button>
          )}
          <ThemeToggleButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;