# MoonPie Token Selling Application

A React TypeScript application for selling tokens through exchange contracts, built with the MoonPie design system.

## Features

- **Wallet Connection**: Connect to MetaMask or other Web3 wallets
- **Token Balance Checking**: Automatically fetch and display user's token balance
- **Exchange Contract Mapping**: Map token addresses to their corresponding exchange contracts
- **Token Selling**: Sell tokens through the SafeLaunch exchange system
- **MoonPie Design System**: Beautiful dark theme with yellow accents and animations

## Project Structure

```
src/
├── components/
│   ├── ClaimForm.tsx          # Main form component
│   └── ClaimForm.css          # Form styling
├── services/
│   └── SafeLaunchService.ts   # SafeLaunch integration service
├── hooks/
│   └── useWallet.ts           # Wallet connection hook
├── config/
│   └── tokenMappings.ts      # Token to exchange contract mappings
├── App.tsx                    # Main app component
├── App.css                    # App styling
└── main.tsx                   # App entry point
```

## Implementation Details

### Token Selling Workflow

1. **User connects wallet** - MetaMask integration
2. **User enters token address** - System checks for exchange contract
3. **System fetches token balance** - Displays user's current balance
4. **User enters amount to sell** - With max button for convenience
5. **User clicks sell button** - Initiates the selling process:
   - Approves exchange contract to spend tokens
   - Calls sell function with user's token balance
   - Handles transaction confirmation

### SafeLaunch Integration

The `SafeLaunchService` class provides:

- **Token Balance Checking**: `getTokenBalance(tokenAddress)`
- **Exchange Contract Mapping**: `getExchangeContract(tokenAddress)`
- **Token Selling**: `sellTokens(tokenAddress, amount)`
- **Market Stats**: `getExchangeMarketStats()`

### Configuration

Add your token-to-exchange mappings in `src/config/tokenMappings.ts`:

```typescript
export const TOKEN_EXCHANGE_MAPPINGS: Record<string, string> = {
  "0xYourTokenAddress": "0xYourExchangeContractAddress",
  // Add more mappings as needed
};
```

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Install Viem** (for blockchain interactions):
   ```bash
   npm install viem
   ```

3. **Configure Environment Variables**:
   Create a `.env` file with:
   ```
   SAFE_LAUNCH_FACTORY_ADDRESS=your_factory_address
   SAFE_LAUNCH_RPC_URL=your_rpc_url
   IS_MAINNET=false
   ```

4. **Update Token Mappings**:
   Edit `src/config/tokenMappings.ts` with your actual token and exchange contract addresses.

5. **Replace Mock Implementations**:
   - Update `SafeLaunchService.ts` with actual viem implementations
   - Replace mock wallet client with real Web3 wallet integration
   - Add actual ABI files for your contracts

6. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Dependencies

- React 19.1.0
- TypeScript
- Vite
- Viem (for blockchain interactions)
- MetaMask/Web3 wallet integration

## Notes

- The current implementation includes mock data and functions for demonstration
- Replace mock implementations with actual blockchain interactions
- Add proper error handling for production use
- Implement proper wallet client integration
- Add actual ABI files for your smart contracts

## Design System

The application uses the MoonPie design system with:
- Dark theme with gradient backgrounds
- Yellow accent colors (#ffd700)
- Animated elements and transitions
- Responsive design
- Modern UI components