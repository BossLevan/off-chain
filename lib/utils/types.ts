export interface Token {
  id: string
  baseURI: string;
  marketCapETH: number;
  marketCapUSDC: number;
  volumeETH: number;
  volumeUSDC: number;
  totalHolders: number;
  name: string;
  metadata: {
    description: string;
    name: string;
    symbol: string;
  };
}

export type User = {
  displayName: string;
  fid: number;
  pfpUrl: string;
  ravesCreated?: string[];
  ravesJoined?: string[];
  totalRaversOnboarded?: number;
  username: string;
  createdAt?: Date; // Clean Date types
  updatedAt?: Date;
};

export type ContractUser = {
  fid: number;
  username: string;
  pfpUrl: string;
  joinedAt: Date; // Clean Date type
};


export type CollectionToken = {
  id: string;
  baseURI: string;
  createdAt: string; // If it's a timestamp string. Use `number` if it's a Unix number.
  volumeETH: number;
  marketCapETH: number;
  metadata: {
    description: string;
    name: string;
    symbol: string;
  };
};

export type CollectionTokensResponse = {
  collectionTokens: CollectionToken[];
};
  
  
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

  export interface SingleCoinVolumeResponse {
    collectionToken: {
      volumeETH: string;
    } | null; 
  };
  
  
  export interface SingleCoinQueryResponse {
    collectionToken: SingleTokenDetailed | null;
  }
  
  export interface SingleCoinQueryVariables {
    id: string;
  }
  
  export type ErrorResponse = {
    error: string;
  };
  
  // ---------- Core Types ------------------------------------------------------

export interface RevenueManagerConfig {
  /** Basis-points: 500 = 5 %, 10 000 = 100 % */
  protocolFeeBps: number;
  /** EVM address, e-mail, Twitter @ or Farcaster fid */
  recipient: string;
  ownerAddress?: string;
}

export interface FlaunchTokenConfig {
  name: string;
  symbol: string;
  description: string;
  imageIpfs: string;
  creatorFeeSplit?: number;
  creatorAddress?: string;
  revenueManagerAddress?: string;
  marketCap?: string;
  fairLaunchDuration?: number;
  fairLaunchSupply?: number;
  websiteUrl?: string;
  telegramUrl?: string;
  discordUrl?: string;
  twitterUrl?: string;
}

//For adding the prompt
export type ExtendedFlaunchConfig = FlaunchTokenConfig & {
  prompt: string;
  sampleImages: File[]
};

export interface FlaunchApiError {
  status: number;
  message: string;
  data?: unknown;
}

export interface LaunchMemecoinJobResponse {
    success: true;
    message: string;          // "Memecoin launch request queued"
    jobId: string;            // e.g. "40"
    queueStatus: {
      position: number;       // 0-based
      waitingJobs: number;
      activeJobs: number;
      estimatedWaitSeconds: number;
    };
    privy: {
      type: "wallet" | "email" | "twitter" | "farcaster";
      address?: string;       // present when type === "wallet"
      identifier?: string;    // other id (email, handle, fid…)
    };
  }

  /* ------------------------------------------------------------------ */
/*  Job-polling response shapes                                       */
/* ------------------------------------------------------------------ */

/** Enum of server-reported states */
export type JobState = "waiting" | "active" | "completed";

export interface PendingJobResponse {
  success: true;
  state: "waiting" | "active";
  queuePosition: number;
  estimatedWaitTime: number; // seconds
}

export interface CompletedJobResponse {
  success: true;
  state: "completed";
  queuePosition: 0;
  estimatedWaitTime: 0;
  transactionHash: string;
  collectionToken: {
    address: string;
    imageIpfs: string;
    name: string;
    symbol: string;
    tokenURI: string;
    creator: string;
  };
}

export interface UnknownJobResponse {
  success: false;
  error: string; // e.g. "Job not found"
}

export type JobStatusResponse =
  | PendingJobResponse
  | CompletedJobResponse
  | UnknownJobResponse;

/** Unified return for callers */
export interface LaunchStatus {
  state: JobState | "failed";
  queuePosition?: number;
  estimatedWaitTime?: number;
  tokenAddress?: string;
  txHash?: string;
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Types for /upload-image                                           */
/* ------------------------------------------------------------------ */

export interface UploadImageResponseSuccess {
    success: true;
    ipfsHash: string;
    tokenURI: string;
    nsfwDetection: null | {
      isNSFW: boolean;
      score: number;
      message: string;
      details: unknown[];
    };
  }
  
  export interface UploadImageResponseError {
    success: false;
    error: string;
    /** Present when the API flags the file */
    nsfwDetection?: {
      isNSFW: boolean;
      score: number;
      message: string;
      details: unknown[];
    };
  }
  
  export type UploadImageResponse =
    | UploadImageResponseSuccess
    | UploadImageResponseError;

  