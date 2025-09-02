import { createEvent } from '../src/interactions/CreateEventInteraction.ts';
import { ethers } from 'ethers';

jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn().mockImplementation(() => ({
      createEvent: jest.fn(),
    })),
  },
}));

describe('createEvent', () => {
  let mockContract: ethers.Contract;

  beforeEach(() => {
    mockContract = new ethers.Contract();
  });

  it('should call createEvent on the contract with the correct parameters', async () => {
    const mockTx = { hash: 'mock-tx-hash' }; 
    mockContract.createEvent.mockResolvedValue(mockTx);

    const name = 'Sample Event';
    const date = 1634774400; // Example date
    const price = 100;
    const tickets = 50;

    const result = await createEvent(mockContract, name, date, price, tickets);

    expect(mockContract.createEvent).toHaveBeenCalledWith(name, date, price, tickets);
    expect(result).toBe(mockTx);  
  });

  it('should throw an error if createEvent fails', async () => {
    const mockError = new Error('Transaction failed');
    mockContract.createEvent.mockRejectedValue(mockError); 

    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    const name = 'Sample Event';
    const date = 1634774400; 
    const price = 100;
    const tickets = 50;

    try {
      await createEvent(mockContract, name, date, price, tickets);
    } catch (error) {
      expect(error).toBe(mockError); 
    }

    consoleErrorMock.mockRestore();
  });
});

