
// assetchain.ts
import { defineChain } from 'viem'

const sourceId = 42420 // mainnet

export const assetChainMainnet = /*#__PURE__*/ defineChain({
  id: 42420, // Assuming this is the chain ID for assetchain mainnet
  name: 'AssetChain',
  nativeCurrency: { name: 'RWA', symbol: 'RWA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.assetchain.org'], // Replace with actual RPC URL
    },
  },
  blockExplorers: {
    default: {
      name: 'Asset Chain Scan',
      url: 'https://scan.assetchain.org', // Replace with actual explorer URL
      apiUrl: 'https://mainnet-rpc.assetchain.org/api', // Replace with actual API URL
    },
  },
  contracts: {
  },
  sourceId,
})
