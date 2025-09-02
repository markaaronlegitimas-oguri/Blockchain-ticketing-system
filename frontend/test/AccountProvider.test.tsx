import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AccountProvider } from '../src/contexts/AccountContext';
import '@testing-library/jest-dom';

const mockEthereum = {
  request: jest.fn().mockImplementation(({ method }) => {
    if (method === 'eth_accounts') {
      return Promise.resolve([]); // Simulate no connected accounts
    }
    return Promise.resolve([]);
  }),
  on: jest.fn(),
  removeListener: jest.fn(),
};

beforeEach(() => {
  (window as any).ethereum = mockEthereum;
});

afterEach(() => {
  jest.clearAllMocks();
});

const DummyComponent = () => {
  const { account, balance, isConnected, isOwner } = require('../src/contexts/AccountContext').useAccount();
  return (
    <div>
      <div>Account: {account}</div>
      <div>Balance: {balance}</div>
      <div>Connected: {isConnected ? 'yes' : 'no'}</div>
      <div>Owner: {isOwner ? 'yes' : 'no'}</div>
    </div>
  );
};

test('handles empty accounts correctly', async () => {
  const { getByText } = render(
    <AccountProvider contractAddress="0x0000000000000000000000000000000000000000">
      <DummyComponent />
    </AccountProvider>
  );

  await waitFor(() => {
    expect(getByText(/Account:/i)).toBeInTheDocument();
    expect(getByText(/Connected: no/i)).toBeInTheDocument();
  });
});
