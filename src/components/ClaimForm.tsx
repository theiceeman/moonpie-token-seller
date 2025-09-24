import React, { useState, useEffect } from 'react'
import './ClaimForm.css'
import { useWallet } from '../hooks/useWallet'
import { IS_MAINNET, SafeLaunchService } from '../services/SafeLaunchService'
import { assetChainMainnet } from '../services/assetchain'
import { assetChainTestnet } from 'viem/chains'
import { createWalletClient, custom } from 'viem'

interface FormData {
  tokenAddress: string
}

interface TokenBalance {
  balance: string
  formatted: string
  symbol: string
  name: string
}

const ClaimForm: React.FC = () => {
  const { isConnected, address, connectWallet, error: walletError } = useWallet()
  const [formData, setFormData] = useState<FormData>({ tokenAddress: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null)
  const [exchangeAddress, setExchangeAddress] = useState<string | null>(null)
  const [safeLaunchService, setSafeLaunchService] = useState<SafeLaunchService | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      const switchNetwork = async () => {
        if (window.ethereum) {
          const chainId = '0x' + (IS_MAINNET ? assetChainMainnet.id : assetChainTestnet.id).toString(16);
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId,
                  chainName: IS_MAINNET ? assetChainMainnet.name : assetChainTestnet.name,
                  rpcUrls: IS_MAINNET ? assetChainMainnet.rpcUrls.default.http : assetChainTestnet.rpcUrls.default.http,
                  nativeCurrency: IS_MAINNET ? assetChainMainnet.nativeCurrency : {
                    name: 'AssetChain',
                    symbol: 'AC',
                    decimals: 18,
                  },
                }],
              });
            }
          }
        }
      };

      const createWalletClientInstance = async () => {
        await switchNetwork();
        const client = createWalletClient({
          account: address as `0x${string}`,
          chain: IS_MAINNET ? assetChainMainnet : assetChainTestnet,
          transport: custom(window.ethereum)
        });
        const service = new SafeLaunchService(client, address);
        setSafeLaunchService(service);
      };

      createWalletClientInstance();
    }
  }, [isConnected, address])

  useEffect(() => {
    if (formData.tokenAddress && safeLaunchService) {
      const checkToken = async () => {
        try {
          const balance = await safeLaunchService.getTokenBalance(formData.tokenAddress)
          setTokenBalance(balance)
          const exchange = safeLaunchService.getExchangeContract(formData.tokenAddress)
          setExchangeAddress(exchange)
          if (!exchange) {
            setMessage('No exchange contract found for this token address')
          } else {
            setMessage('')
          }
        } catch (error) {
          setMessage('Error checking token balance')
          setTokenBalance(null)
          setExchangeAddress(null)
        }
      }
      checkToken()
    }
  }, [formData.tokenAddress, safeLaunchService])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      setMessage('Please connect your wallet first')
      return
    }

    if (!safeLaunchService) {
      setMessage('Wallet service not initialized')
      return
    }

    if (!exchangeAddress) {
      setMessage('No exchange contract found for this token')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const amountToSell = tokenBalance?.formatted || '0'
      const result = await safeLaunchService.sellTokens(formData.tokenAddress, amountToSell)

      if (result.ok) {
        setMessage('Tokens sold successfully! 🎉')
        setFormData({ tokenAddress: '' })
        setTokenBalance(null)
        setExchangeAddress(null)
      } else {
        setMessage(`Error selling tokens: ${result.error}`)
      }
    } catch (error: any) {
      setMessage(`Error selling tokens: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="claim-form-container">
      <div className="modal">
        <div className="modal-header">
          <div className="bridge-icon">
            <div className="arrow yellow-arrow">→</div>
            <div className="arrow purple-arrow">→</div>
          </div>
          <h2>Sell Your Tokens</h2>
          <p>Enter your token address to sell your entire holding</p>
        </div>

        <div className="wallet-section">
          {!isConnected ? (
            <button onClick={connectWallet} className="connect-wallet-button">
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-info">
              <span className="wallet-address">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <span className="connected-indicator">✓ Connected</span>
            </div>
          )}
          {walletError && (
            <div className="error-message">{walletError}</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="claim-form">
          <div className="form-group">
            <label htmlFor="tokenAddress">Token Address</label>
            <input
              type="text"
              id="tokenAddress"
              name="tokenAddress"
              value={formData.tokenAddress}
              onChange={handleInputChange}
              placeholder="0x..."
              required
              className="form-input"
            />
            {tokenBalance && (
              <div className="balance-info">
                <span>Your Balance: {tokenBalance.formatted} {tokenBalance.symbol}</span>
              </div>
            )}
          </div>

          {exchangeAddress && (
            <div className="exchange-info">
              <span>Exchange Contract: {exchangeAddress.slice(0, 6)}...{exchangeAddress.slice(-4)}</span>
            </div>
          )}

          <button
            type="submit"
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting || !isConnected || !exchangeAddress}
          >
            {isSubmitting ? 'Selling...' : 'Sell Tokens'}
          </button>

          {message && (
            <div className={`message ${message.includes('Error') || message.includes('error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ClaimForm
