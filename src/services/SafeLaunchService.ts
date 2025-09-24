import { type Hex, type WalletClient, createPublicClient, getContract, http } from "viem";
import { assetChainTestnet } from "viem/chains";
import SafeLaunchERC20Abi from '../abi/SafeLaunchERC20.json';
import SafeLaunchAbi from '../abi/SafeLaunch.json';

import { getExchangeContract } from '../config/tokenMappings';
import { assetChainMainnet } from "./assetchain";

export interface TokenBalance {
  balance: string;
  formatted: string;
  symbol: string;
  name: string;
}

export interface SellResult {
  ok: boolean;
  receipt?: any;
  error?: any;
}

// mainnet
export const TOKEN_EXCHANGE_MAPPINGS: Record<string, string> = {
  "0xe28741866a131acdd1876182a1674a44834e9e32": "0x7e4064d6fc0961aa908c1f2ee9c605ab8ae26e40",
  "0x70f7b4509ef265c23fffabf48d7bf326c3bf9916": "0x8f9dbb53768695f67aa913f9f047b02d83f301b8",
  "0x463a89d35f51d99c84c9874ea6bfa6beb60a69d8": "0xc6ac46006493e1bc91d3f05b27c8cf095d8d90b6"
};

// testnet
// export const TOKEN_EXCHANGE_MAPPINGS: Record<string, string> = {
//   "0x3c42b256d089594f4fa594e280077f0b2ffa7934": "0xf266f32ab286f7ae7a293d4640185e375a4f6683",
//   "0xfeaa593cf956e79bc9eee26f9f452738f04d0364": "0x45f30eab95a0210ed21f9cba2fc777b3d163fc4e",
//   "0x0f4e94cB7fE0D7b20E2EDF4c259ADF077D0f69D0":"0x1BcA83A12012656CbAd6e2782776dB5D56b21DC2"
// };

export const IS_MAINNET = true
const RPC_URL = IS_MAINNET ? "https://mainnet-rpc.assetchain.org" : "https://enugu-rpc.assetchain.org"

export class SafeLaunchService {
  private walletClient: WalletClient;
  private publicClient: any;
  private fromAddress: string;
  constructor(walletClient: WalletClient, fromAddress: string) {
    this.walletClient = walletClient;
    this.fromAddress = fromAddress;

    this.publicClient = createPublicClient({
      chain: IS_MAINNET ? assetChainMainnet : assetChainTestnet,
      transport: http(RPC_URL)
    })
  }

  getExchangeContract(tokenAddress: string): string | null {
    return getExchangeContract(tokenAddress);
  }

  async getTokenBalance(tokenAddress: string): Promise<TokenBalance> {
    try {
      const [balance, symbol, name] = await Promise.all([
        this.publicClient.readContract({
          address: tokenAddress as Hex,
          abi: SafeLaunchERC20Abi,
          functionName: 'balanceOf',
          args: [this.fromAddress]
        }),
        this.publicClient.readContract({
          address: tokenAddress as Hex,
          abi: SafeLaunchERC20Abi,
          functionName: 'symbol',
          args: []
        }),
        this.publicClient.readContract({
          address: tokenAddress as Hex,
          abi: SafeLaunchERC20Abi,
          functionName: 'name',
          args: []
        })
      ]);
      
      console.log({balance, symbol, name})

      return {
        balance: balance.toString(),
        formatted: (Number(balance) / 1e18).toString(),
        symbol: symbol as string,
        name: name as string
      };
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return {
        balance: '0',
        formatted: '0',
        symbol: 'UNKNOWN',
        name: 'Unknown Token'
      };
    }
  }

  async sellTokens(tokenAddress: string, amount: string): Promise<SellResult> {
    try {
      const exchangeAddress = this.getExchangeContract(tokenAddress);
      if (!exchangeAddress) {
        return {
          ok: false,
          error: 'Exchange contract not found for this token'
        };
      }

      console.log({exchangeAddress})

      const exchangeContract = getContract({
        address: exchangeAddress as Hex,
        abi: SafeLaunchAbi,
        client: { public: this.publicClient, wallet: this.walletClient },
      })

      const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
      console.log({amountWei})

      // @ts-ignore
      const approveHash = await this.walletClient.writeContract({
        address: tokenAddress as Hex,
        abi: SafeLaunchERC20Abi,
        functionName: 'approve',
        args: [exchangeAddress, amountWei],
      });
      console.log({approveHash})

      await this.publicClient.waitForTransactionReceipt({ hash: approveHash });

      const sellHash = await exchangeContract.write.sellTokens([amountWei]);
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash: sellHash });
      console.log({receipt})

      return { ok: true, receipt };
    } catch (error: any) {
      console.error('Error selling tokens:', error);
      return { ok: false, error };
    }
  }
}
