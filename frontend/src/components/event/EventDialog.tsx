import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Fade } from '@mui/material';
import NewEventForm from './NewEventForm';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, date: number, price: number, tickets: number) => Promise<void>;
}

const EventDialog: React.FC<EventDialogProps> = ({ open, onClose, onSubmit }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 2,
          backgroundImage: 'linear-gradient(135deg, rgba(63, 81, 181, 0.03) 0%, rgba(245, 0, 87, 0.03) 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center' 
      }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          Create New Event
        </Typography>
        <IconButton 
          edge="end" 
          color="inherit" 
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <NewEventForm 
          onSubmit={onSubmit} 
          onCancel={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog; 