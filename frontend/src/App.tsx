import React, { useState, useEffect } from 'react';
import Header from './components/header/Header';
import EventsPage from './components/event/EventsPage';
import MyTickets from './components/ticket/MyTickets';
import { AccountProvider } from './contexts/AccountContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CONTRACT_ADDRESS } from './config';
import { Container, Box, Typography, Tabs, Tab, Paper } from '@mui/material';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'tickets'>('events');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider>
      <AccountProvider contractAddress={CONTRACT_ADDRESS}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          {/* Header */}
          <Header />

          {/* Main Content */}
          <Container maxWidth="lg" sx={{ flexGrow: 1, py: 4 }}>
            {/* Hero Section */}
            <Box
              sx={{
                textAlign: 'center',
                mb: 4,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.5s ease',
              }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #f50057, #3f51b5)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                }}
              >
                Welcome to TheaterChain
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your destination for decentralized theater tickets. Secure, transparent, and unforgettable.
              </Typography>
            </Box>

            {/* Navigation Tabs */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 2, 
              boxShadow: 3,
              mb: 3,
              border: '1px solid',
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}>
              <Paper 
                elevation={0}
                sx={{ 
                  backgroundImage: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15) 0%, rgba(245, 0, 87, 0.15) 100%)',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  centered
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                      background: 'linear-gradient(to right, #f50057, #3f51b5)',
                    },
                  }}
                >
                  <Tab 
                    label="Events" 
                    value="events" 
                    sx={{
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  />
                  <Tab 
                    label="My Tickets" 
                    value="tickets"
                    sx={{
                      '&.Mui-selected': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </Tabs>
              </Paper>
            </Box>

            {/* Content */}
            <Box sx={{ 
              p: 3, 
              bgcolor: 'background.paper', 
              borderRadius: 2, 
              boxShadow: 3,
              border: '1px solid',
              borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
            }}>
              {activeTab === 'events' ? <EventsPage /> : <MyTickets />}
            </Box>
          </Container>

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              bgcolor: 'background.default',
              py: 3,
              mt: 4,
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} TheaterChain. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </AccountProvider>
    </ThemeProvider>
  );
};

export default App;