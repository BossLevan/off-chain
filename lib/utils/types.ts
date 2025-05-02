export interface Token {
    baseURI: string;
    createdAt: string;
    creator: {
      id: string;
    };
    tokenPrice: string;
    volumeETH: string;
    marketCapETH: string;
    metadata: {
      description: string;
      name: string;
      symbol: string;
    };
  }
  
  export interface AllTokens {
    collectionTokens: Token[];
  }

  export interface SingleTokenDetailed {
    id: string;
    baseURI: string;
    createdAt: string;
    marketCapETH: string;
    tokenPrice: string;
    volumeETH: string;
    totalHolders: string;
    metadata: {
      description: string;
      discord?: string;
      name: string;
      symbol: string;
      twitter?: string;
      website?: string;
    };
  }
  
  export interface SingleCoinQueryResponse {
    collectionToken: SingleTokenDetailed | null;
  }
  
  export interface SingleCoinQueryVariables {
    id: string;
  }
  
  export type ErrorResponse = {
    error: string;
  };
  