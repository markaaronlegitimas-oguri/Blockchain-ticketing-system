import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface LoginRegisterModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({ open, onClose }) => {
  const { login, register, loading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'login' | 'register') => {
    setTab(newValue);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(fullName, email, password);
      }
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Login" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {tab === 'register' && (
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              fullWidth
            />
          )}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText={tab === 'register' ? 'At least 8 characters' : undefined}
          />

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mt: 1 }}>
            {loading ? <CircularProgress size={24} /> : tab === 'login' ? 'Log In' : 'Create Account'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginRegisterModal;