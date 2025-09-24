import { useState } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    error: null
  });

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setWalletState({
            isConnected: true,
            address,
            balance: null,
            error: null
          });
          
          // Get balance
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [address, 'latest']
          });
          
          setWalletState(prev => ({
            ...prev,
            balance: balance
          }));
        }
      } else {
        setWalletState(prev => ({
          ...prev,
          error: 'MetaMask not detected. Please install MetaMask.'
        }));
      }
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        error: error.message || 'Failed to connect wallet'
      }));
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      error: null
    });
  };

  // Removed auto-connection - users must manually connect wallet

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
