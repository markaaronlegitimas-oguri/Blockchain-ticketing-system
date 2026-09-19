import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { ethers } from 'ethers';
import EventTicketABI from '../utils/EventTicket.json';
import { useAuth } from './AuthContext';

// Add ethereum to window object type
declare global {
  interface Window {
    ethereum: any;
  }
}

interface AccountContextType {
  account: string | null;
  isOwner: boolean;
  contract: ethers.Contract | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  balance: string;
  connectWallet: () => Promise<void>;
  isConnected: boolean;
  chainId: string | null;
}

const AccountContext = createContext<AccountContextType>({
  account: null,
  isOwner: false,
  contract: null,
  provider: null,
  signer: null,
  balance: '0',
  connectWallet: async () => {},
  isConnected: false,
  chainId: null,
});

interface AccountProviderProps {
  children: ReactNode;
  contractAddress: string;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children, contractAddress }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const linkedRef = useRef<string | null>(null);

  const setupContractAndOwner = async (
      newProvider: ethers.providers.Web3Provider,
      newSigner: ethers.Signer,
      address: string
  ) => {
    try {
      // Create contract with proper error handling
      const newContract = new ethers.Contract(
          contractAddress,
          EventTicketABI,
          newSigner
      );

      // Check if contract is deployed at this address
      const code = await newProvider.getCode(contractAddress);
      if (code === '0x') {
        console.error("No contract found at address:", contractAddress);
        return null;
      }

      // Get contract owner for comparison
      let contractOwner;
      try {
        contractOwner = await newContract.owner();
      } catch (error) {
        console.error("Error getting contract owner:", error);
        return null;
      }

      setContract(newContract);
      setIsOwner(contractOwner.toLowerCase() === address.toLowerCase());

      return newContract;
    } catch (error) {
      console.error("Error setting up contract:", error);
      return null;
    }
  };

  const connectWallet = async (): Promise<void> => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts.length === 0) {
          console.error("No accounts returned from MetaMask");
          return;
        }

        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await newProvider.getNetwork();
        setChainId(network.chainId.toString());

        const newSigner = newProvider.getSigner();
        const addr = await newSigner.getAddress();

        // Get balance
        const ethBalance = await newProvider.getBalance(addr);

        // Update state with connected account info
        setAccount(addr);
        setProvider(newProvider);
        setSigner(newSigner);
        setBalance(ethers.utils.formatEther(ethBalance));
        setIsConnected(true);

        // Setup contract
        await setupContractAndOwner(newProvider, newSigner, addr);

      } catch (error) {
        console.error("Error connecting to MetaMask", error);
        setIsConnected(false);
      }
    } else {
      alert("Please install MetaMask to use this application");
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount(null);
      setIsConnected(false);
      setContract(null);
      setSigner(null);
      setIsOwner(false);
    } else {
      // Account changed, reconnect
      await connectWallet();
    }
  };

  const handleChainChanged = () => {
    // When chain changes, we need to reload the page to reset the state
    window.location.reload();
  };

  useEffect(() => {
    if (!window.ethereum) return;

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Initial check for already connected accounts
    window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch((error: any) => {
          console.error("Error checking connected accounts:", error);
        });

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [contractAddress]);

    // Link the connected wallet to the logged-in user (backend: /auth/link-wallet)
  useEffect(() => {
    if (!account || !accessToken) return;

    const key = `${account}:${accessToken}`;
    if (linkedRef.current === key) return;
    linkedRef.current = key;

    const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    fetch(`${API}/auth/link-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ walletAddress: account }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.warn('link-wallet failed', res.status, body);
        }
      })
      .catch((err) => console.error('link-wallet error', err));
  }, [account, accessToken]);

  return (
      <AccountContext.Provider
          value={{
            account,
            isOwner,
            contract,
            provider,
            signer,
            balance,
            connectWallet,
            isConnected,
            chainId
          }}
      >
        {children}
      </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);