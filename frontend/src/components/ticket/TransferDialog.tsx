import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

interface TransferDialogProps {
  open: boolean;
  onClose: () => void;
  onTransfer: () => void;
  transferAddress: string;
  onAddressChange: (address: string) => void;
}

const TransferDialog: React.FC<TransferDialogProps> = ({
  open,
  onClose,
  onTransfer,
  transferAddress,
  onAddressChange
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Transfer Ticket</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Recipient Address"
          type="text"
          fullWidth
          value={transferAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onTransfer} variant="contained">
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog; 