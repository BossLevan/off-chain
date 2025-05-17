// 'use server'


import { chain, flaunchBaseUrl } from "@/lib/constants";
import axios, { AxiosError, AxiosInstance } from "axios";
import { FlaunchApiError, FlaunchTokenConfig, JobStatusResponse, LaunchMemecoinJobResponse, LaunchStatus, RevenueManagerConfig, UploadImageResponse, UploadImageResponseSuccess } from '@/lib/utils/types';

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));
export class FlaunchClient {
    private rest: AxiosInstance;
  
    constructor(
      baseURL = flaunchBaseUrl // prod default
    ) {
      this.rest = axios.create({
        baseURL,
        headers: { "Content-Type": 'application/json' },
        timeout: 15_000,
      });
    }
  
    /* ---------- Public helpers --------------------------------------------- */
  
    async createRevenueManager(cfg: RevenueManagerConfig): Promise<string> {
      try {
        const { data } = await this.rest.post<{ managerAddress: string, success: true, recipientAddress: string }>(
          `/api/v1/${chain}/create-revenue-manager`,
          {
            protocolFee: cfg.protocolFeeBps,
            recipientAddress: cfg.recipient,
            ownerAddress: cfg.ownerAddress,
          }
        );
        return data.managerAddress;
      } catch (err) {
        throw this.toFlaunchError(err, "createRevenueManager");
      }
    }
  
    async flaunchToken(cfg: FlaunchTokenConfig): Promise<LaunchMemecoinJobResponse> {
      try {
        const { data } = await this.rest.post<LaunchMemecoinJobResponse>(`/api/v1/${chain}/launch-memecoin`, {
          name: cfg.name,
          symbol: cfg.symbol,
          description: cfg.description,
          imageIpfs: cfg.imageIpfs,
          //Should be in constants.ts
          creatorFeeSplit: "8000",
          creatorAddress: cfg.creatorAddress,
          revenueManagerAddress: cfg.revenueManagerAddress,
          marketCap: "10000000000",
          fairLaunchDuration: "1800",
        //   fairLaunchSupply: "0",
        //   websiteUrl: cfg.websiteUrl,
        //   telegramUrl: cfg.telegramUrl,
        //   discordUrl: cfg.discordUrl,
        //   twitterUrl: cfg.twitterUrl
        });
        return data;
      } catch (err) {
        throw this.toFlaunchError(err, "flaunchToken");
      }
    }
  
    /**
   * Polls `/launch-status/:jobId` until the job finishes or fails.
   */
   async pollLaunchStatus(
      jobId: string,
      pollingMs = 7_000,
      timeoutMs = 15 * 60 * 1000 // 15 min
    ): Promise<LaunchStatus> {
      const start = Date.now();
    
      while (true) {
        if (Date.now() - start > timeoutMs) {
          return {
            state: "failed",
            error: `Timeout after ${timeoutMs / 1_000}s`,
          };
        }
    
        let res: JobStatusResponse;
        try {
          ({ data: res } = await this.rest.get<JobStatusResponse>(
            `/api/v1/launch-status/${jobId}`
          ));
        } catch (err) {
          // Network hiccup – log + retry
          console.warn("Status poll error", err);
          await delay(pollingMs);
          continue;
        }
    
        if (!res.success) {
          // "Job not found" or other server failure
          return { state: "failed", error: res.error };
        }
    
        if (res.state === "completed") {
        console.log(res)
          return {
            state: "completed",
            tokenAddress: res.collectionToken.address,
            txHash: res.transactionHash,
          };
        }
    
        // waiting | active → bubble progress for UI if caller needs it
        if (res.state === "waiting" || res.state === "active") {
          console.log(
            `[queue] ${res.state} • pos ${res.queuePosition} • eta ${res.estimatedWaitTime}s`
          );
        }
    
        await delay(pollingMs);
      }
    }
  
  
    /* ---------- Private helpers -------------------------------------------- */
  
    private toFlaunchError(err: unknown, ctx: string): FlaunchApiError {
      if (axios.isAxiosError(err)) {
        const axErr = err as AxiosError<{ error?: string }>;
        return {
          status: axErr.response?.status ?? 0,
          message:
            axErr.response?.data?.error ??
            axErr.message ??
            "Unknown Axios error",
          data: axErr.response?.data,
        };
      }
      return {
        status: 0,
        message: `Unexpected error in ${ctx}: ${String(err)}`,
      };
    }
  
  
  async uploadImage(
      /** `data:image/jpeg;base64,/9j/..`  or similar */
      base64Image: string
    ): Promise<UploadImageResponseSuccess> {
      try {
        const { data } = await this.rest.post<UploadImageResponse>(
          "/api/v1/upload-image",
          { base64Image }
        );
    
        if (!data.success) {
          // API returned success:false (e.g. NSFW or generic validation fail)
          throw <FlaunchApiError>{
            status: 400,
            message: data.error ?? "Image rejected",
            data,
          };
        }
    
        return data; // { success:true, ipfsHash, tokenURI, nsfwDetection }
      } catch (err) {
        throw this.toFlaunchError(err, "uploadImage");
      }
    }
  }
  


//Get all Tokens on Off-Chain

//Get all Tokens by date created

//Get a single token

//Add Token to firetore (private)

//Create Token + Add to firestore

//get token from firestore (need to design a data structure to hold this data)

//image generation call