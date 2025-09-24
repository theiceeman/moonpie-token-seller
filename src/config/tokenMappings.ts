import { TOKEN_EXCHANGE_MAPPINGS } from "../services/SafeLaunchService";




export const getExchangeContract = (tokenAddress: string): string | null => {
  return TOKEN_EXCHANGE_MAPPINGS[tokenAddress.toLowerCase()] || null;
};

export const hasExchangeContract = (tokenAddress: string): boolean => {
  return tokenAddress.toLowerCase() in TOKEN_EXCHANGE_MAPPINGS;
};

export const addTokenMapping = (tokenAddress: string, exchangeAddress: string): void => {
  TOKEN_EXCHANGE_MAPPINGS[tokenAddress.toLowerCase()] = exchangeAddress;
};
