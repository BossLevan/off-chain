import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp, collection, where, orderBy, startAfter, limit, query, getDocs, QueryDocumentSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "firebase/storage";
import { app } from "@/app/firebase_config"
import { GraphQLClient } from "graphql-request";
import { ContractUser, SingleCoinVolumeResponse, User } from "@/lib/utils/types";
import { SINGLE_COIN_VOLUME_QUERY } from "@/lib/utils/queries";
import { onSnapshot } from "firebase/firestore";
import { convertStatToUsd, convertWeiToUsd } from "@/lib/utils/convertStatsToUsd";
import { COST_PER_IMAGE } from "@/lib/constants";

import { writeBatch, increment } from 'firebase/firestore';

interface GetRaveUsersOptions {
    sortBy?: 'joinedAt' | 'username';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    startAfter?: QueryDocumentSnapshot;
    joinedAfter?: Date;
    joinedBefore?: Date;
  }
  
  interface GetRaveUsersResult {
    users: ContractUser[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }

// Your Firestore and Storage refs
const db = getFirestore(app, "off-chain");
const storage = getStorage(app, "gs://off-chain-c1547.firebasestorage.app");

/**
 * Uploads text and 1–4 image files to Firestore and Storage, keyed by contract address.
 * 
 * @param contractAddress - Unique identifier in Firestore.
 * @param text - Text field to store alongside images.
 * @param imageFiles - Array of 1–4 image files.
 */
/**
 * Upload image files to Firebase Storage
 * @param contractAddress - The contract address used as part of the storage path
 * @param imageFiles - Array of image files to upload (1-4 files)
 * @returns Array of download URLs for the uploaded images
 */
export async function uploadImagesToStorage(
    contractAddress: string,
    imageFiles: File[]
  ): Promise<string[]> {
    try {
      // Validate image count
      if (!imageFiles || imageFiles.length < 1 || imageFiles.length > 4) {
        throw new Error("Image count must be between 1 and 4.");
      }
      
      // Validate contract address
      if (!contractAddress || typeof contractAddress !== 'string' || contractAddress.trim() === '') {
        throw new Error("Valid contract address is required.");
      }
  
      // Sanitize contract address for use in storage path
      // Remove any invalid characters that might cause issues with Firebase Storage paths
      const sanitizedAddress = contractAddress.replace(/[.#$[\]/]/g, "_");
  
      const uploadPromises = imageFiles.map(async (file, index) => {
        try {
          if (!file || !(file instanceof File)) {
            throw new Error(`Invalid file at index ${index}.`);
          }
          
          // Create a blob from the file and specify content type
          const blob = new Blob([await file.arrayBuffer()], { type: file.type });
          
          // Use a more reliable path format with timestamp to avoid conflicts
          const timestamp = new Date().getTime();
          const fileName = `image-${index + 1}-${timestamp}`;
          const storageRef = ref(storage, `contract-images/${sanitizedAddress}/${fileName}`);
          
          // Log upload attempt details
          console.log(`Attempting to upload file: ${file.name}, size: ${file.size}, type: ${file.type}`);
          
          // Set metadata with content type
          const metadata = {
            contentType: file.type || 'image/jpeg', // Default to JPEG if type is missing
            customMetadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString()
            }
          };
          
          // Upload with metadata
          const snapshot = await uploadBytes(storageRef, blob, metadata);
          console.log(`Upload successful for image ${index + 1}`);
          
          // Get download URL
          return await getDownloadURL(snapshot.ref);
        } catch (error: any) {
          console.error(`Error uploading image ${index + 1}:`, error);
          
          // Provide more specific error message based on Firebase error code
          if (error.code === 'storage/unauthorized') {
            throw new Error(`Permission denied when uploading image ${index + 1}. Check Firebase Storage rules.`);
          } else if (error.code === 'storage/canceled') {
            throw new Error(`Upload canceled for image ${index + 1}.`);
          } else if (error.code === 'storage/retry-limit-exceeded') {
            throw new Error(`Network error occurred when uploading image ${index + 1}. Check your connection.`);
          } else if (error.code === 'storage/invalid-checksum') {
            throw new Error(`File integrity check failed for image ${index + 1}. Try uploading again.`);
          } else {
            throw new Error(`Failed to upload image ${index + 1}: ${error?.message || 'Unknown error'}`);
          }
        }
      });
  
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      console.error("Error in uploadImagesToStorage:", error);
      throw new Error(`Failed to upload images: ${error?.message || 'Unknown error'}`);
    }
  }



type UploadableImage = File | string;

export async function uploadImagesToStorageTemporary(
  imageInputs: UploadableImage[]
): Promise<string[]> {
  try {
    if (!imageInputs || imageInputs.length < 1 || imageInputs.length > 4) {
      throw new Error("Image count must be between 1 and 4.");
    }

    const uploadPromises = imageInputs.map(async (input, index) => {
      const timestamp = new Date().getTime();
      const fileName = `image-${index + 1}-${timestamp}`;
      const storageRef = ref(storage, `temporary-images/${fileName}`);

      try {
        if (typeof input === "string") {
          // Handle base64 string
          const matches = input.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
          const contentType = matches ? matches[1] : 'image/png';
          const base64Data = matches ? matches[2] : input; // in case it's raw base64 only

          console.log(`Uploading base64 image ${index + 1}`);
          const metadata = {
            contentType,
            customMetadata: {
              uploadedAt: new Date().toISOString(),
              source: "base64"
            }
          };


          const snapshot = await uploadString(storageRef, base64Data, 'base64', metadata);
          return await getDownloadURL(snapshot.ref);

        } else if (input instanceof File) {
          // Handle File object
          const blob = new Blob([await input.arrayBuffer()], { type: input.type });
          const metadata = {
            contentType: input.type || 'image/jpeg',
            customMetadata: {
              originalName: input.name,
              uploadedAt: new Date().toISOString()
            }
          };

          console.log(`Uploading file: ${input.name}`);
          const snapshot = await uploadBytes(storageRef, blob, metadata);
          return await getDownloadURL(snapshot.ref);

        } else {
          throw new Error(`Unsupported input type at index ${index}.`);
        }
      } catch (error: any) {
        console.error(`Error uploading image ${index + 1}:`, error);
        if (error.code === 'storage/unauthorized') {
          throw new Error(`Permission denied for image ${index + 1}.`);
        } else if (error.code === 'storage/canceled') {
          throw new Error(`Upload canceled for image ${index + 1}.`);
        } else if (error.code === 'storage/retry-limit-exceeded') {
          throw new Error(`Network error for image ${index + 1}.`);
        } else if (error.code === 'storage/invalid-checksum') {
          throw new Error(`Checksum failed for image ${index + 1}.`);
        } else {
          throw new Error(`Failed to upload image ${index + 1}: ${error?.message || 'Unknown error'}`);
        }
      }
    });

    return await Promise.all(uploadPromises);
  } catch (error: any) {
    console.error("Error in uploadImagesToStorageTemporary:", error);
    throw new Error(`Failed to upload images: ${error?.message || 'Unknown error'}`);
  }
}


export async function getImageUrlFromId(id: string) {
  try {
    const storageRef = ref(storage, `temporary-images/${id}`);
    return await getDownloadURL(storageRef);
  } catch (e: any) {
    console.error(e)
    throw new Error(`Failed to get image: ${e?.message || 'Unknown error'}`);
  }
}

//Add User once logged in to Firestore
//User Clicks Share: Add User & Contract Address of Token to UserJoined
//any edit to user document should be done twice.
//LATER: UserCreated 
//increment totalRaversOnboarded when someone joins with your link.


export async function handleUserJoinRave(
    contractAddress: string,
    user: User
  ): Promise<void> {
    const { fid, username, pfpUrl } = user;
    const contractUserRef = doc(db, `/contracts/${contractAddress}/users/${fid}`);
    const userRef = doc(db, `/users/${fid}`);
    const contractRef = doc(db, `/contracts/${contractAddress}`);
  
    try {
      // Run both operations in parallel
      const [contractUserSnap, userSnap] = await Promise.all([
        getDoc(contractUserRef),
        getDoc(userRef)
      ]);
  
      // Check if user is actually joining (not already in the rave)
      const isNewContractUser = !contractUserSnap.exists();
      const userData = userSnap.exists() ? userSnap.data() as User : null;
      const ravesJoined = userData?.ravesJoined || [];
      const isNewRaveForUser = !ravesJoined.includes(contractAddress);
  
      // Only proceed if user is actually joining
      if (!isNewContractUser && !isNewRaveForUser) {
        return; // User already in this rave
      }
  
      // Use batch for atomic operations
      const batch = writeBatch(db);
  
      // Handle contract user creation
      if (isNewContractUser) {
        const newContractUser = { 
          fid, 
          username, 
          pfpUrl,
          joinedAt: serverTimestamp() // Firebase handles this
        };
        batch.set(contractUserRef, newContractUser);
        
        // Increment user count only for new contract users
        batch.update(contractRef, {
          userCount: increment(1)
        });
      }
  
      // Handle user profile creation/update
      if (!userSnap.exists()) {
        const newUser = {
          ...user,
          ravesJoined: [contractAddress],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        batch.set(userRef, newUser);
      } else if (isNewRaveForUser) {
        batch.update(userRef, {
          ravesJoined: arrayUnion(contractAddress),
          updatedAt: serverTimestamp()
        });
      }
  
      // Execute all operations atomically
      await batch.commit();
  
    } catch (error) {
      console.error(
        `❌ Error handling user join for fid: ${fid}, contract: ${contractAddress}`,
        error
      );
      throw new Error("Failed to handle user join. Check logs for details.");
    }
  } 

  
  /**
   * Save metadata to Firestore
   * @param contractAddress - The contract address used as the document ID
   * @param prompt - The prompt text associated with the contract
   * @param imageUrls - Array of image URLs to store
   * @returns Promise that resolves when the operation is complete
   */
  export async function saveMetadataToFirestore(
    contractAddress: string,
    prompt: string,
    imageUrls: string[]
  ): Promise<void> {
    try {
      // Validate inputs
      if (!contractAddress || typeof contractAddress !== 'string' || contractAddress.trim() === '') {
        throw new Error("Valid contract address is required.");
      }
      
      if (!prompt || typeof prompt !== 'string') {
        throw new Error("Valid prompt text is required.");
      }
      
      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length < 1) {
        throw new Error("At least one image URL is required.");
      }
  
      for (let i = 0; i < imageUrls.length; i++) {
        if (typeof imageUrls[i] !== 'string' || !imageUrls[i].startsWith('http')) {
          throw new Error(`Invalid image URL at index ${i}.`);
        }
      }
  //total AI cost, images generated, total volume, total rewards
      const docRef = doc(db, "contracts", contractAddress);
      await setDoc(docRef, {
        prompt,
        imageUrls,
        uploadedAt: new Date().toISOString(),
        totalInferenceCost: 0,
        totalImagesGenerated: 0,
        model: "",
        totalVolumeGenerated: 0,
        totalRewardsGenerated: 0,
        netCost: 0
      });
    } catch (error) {
      console.error("Error in saveMetadataToFirestore:", error);
      throw new Error(`Failed to save metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  export async function uploadToFirestore(
    contractAddress: string,
    prompt: string,
    imageFiles: File[]
  ): Promise<
    | { success: true; contractAddress: string; imageUrls: string[] }
    | { success: false; error: string }
  > {
    try {
      const imageUrls = await uploadImagesToStorage(contractAddress, imageFiles);
      await saveMetadataToFirestore(contractAddress, prompt, imageUrls);
      console.log("Successfully uploaded to Firestore");
  
      return { success: true, contractAddress, imageUrls };
    } catch (error) {
      console.error("Upload failed:", error);
      throw {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
  
  

  /**
 * Fetch token metadata from Firestore using contract address.
 * 
 * @param contractAddress - Unique document key in Firestore.
 * @returns Token details or error object.
 */
export async function getTokenDetails(
    contractAddress: string
  ): Promise<
    | { success: true; prompt: string; imageUrls: string[]; netCost: string, totalImagesGenerated: number, uploadedAt: string }
    | { success: false; prompt?: null, imageUrls?: null, totalImagesGenerated?: null, netCost?: null, error: string }
  > {
    try {
      const docRef = doc(db, "contracts", contractAddress);
      const snapshot = await getDoc(docRef);
  
      if (!snapshot.exists()) {
        console.log("snapshot dosent exist")
        return { success: false, error: "Token not found" };
      }
  
      const data = snapshot.data();
      console.log(data)
  
      // Validate expected fields
      if (!data.prompt || !Array.isArray(data.imageUrls)) {
        console.log("invalid token format")
        return { success: false, error: "Invalid token data format" };
      }
  
      return {
        success: true,
        prompt: data.prompt,
        imageUrls: data.imageUrls,
        netCost: data.netCost,
        uploadedAt: data.uploadedAt,
        totalImagesGenerated: data.totalImagesGenerated
      };
    } catch (error) {
      console.error("Error fetching token:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * @param 
   */
  // await setDoc(docRef, {
//     prompt,
//     imageUrls,
//     uploadedAt: new Date().toISOString(),
//     totalInferenceCost: 0,
//     totalImagesGenerated: 0,
//     model: "",
//     totalVolumeGenerated: 0,
//     totalRewardsGenerated: 0,
//     netCost: 0
//   });
  //Call InferenceManager()
  //update GPU inference costing and update rewards calc from volume.
  //basically like a net cost. so update the net cost. 
  //Fields: - total AI cost, images generated, total volume, total rewards
  //if net < 10 (dosent have to be 0), clip the ui untill vol improves.
  //Calculated in $
  export async function notifyBusinessManager(
    contractAddress: string,
    imageGenerated: boolean,
  ) {
    try {
      const docRef = doc(db, "contracts", contractAddress);
      const snapshot = await getDoc(docRef);
  
      if (!snapshot.exists()) {
        console.log("snapshot doesn't exist");
        return { success: false, error: "Token not found" };
      }
  
      const data = snapshot.data();
      const updates: any = {};
  
      // 1. 🔧 Update Image Metrics
      if (imageGenerated) {
        
        updates.totalImagesGenerated = (data.totalImagesGenerated || 0) + 1;
        const costPerImage = COST_PER_IMAGE; // for example
        updates.totalInferenceCost = updates.totalImagesGenerated * costPerImage;
      }

      // 2. 🌊 Fetch Onchain Volume from The Graph
      const volume = await getVolumeFromGraphQL(contractAddress); // Implement this
      //convert volume to USD
      const volumeInUSD: string = await convertWeiToUsd(volume.toString())
      console.log('volume', volumeInUSD)
      //convert from string to number
      updates.totalVolumeGenerated = Number.parseFloat(volumeInUSD);
      console.log(updates.totalVolumeGenerated)
  
      // 3. 🎁 Calculate Rewards (1% of volume)
      const rewards = Number.parseFloat(volumeInUSD) * 0.01;
      updates.totalRewardsGenerated = rewards;
  
      // 4. 🧮 Compute Net Cost
      if(updates.totalInferenceCost){
        //means that an image was generated so we use the new inference cost
        updates.netCost = rewards - updates.totalInferenceCost;
      } else {
        //means an image was NOT generated so we use the previous inference cost
        updates.netCost = rewards - data.totalInferenceCost;
      }
    //   updates.netCost = rewards - updates.totalInferenceCost;
    //   updates.netCost = data.netCost += 2;
  
      // 5. 💾 Commit to Firestore
      console.log(updates)
      await updateDoc(docRef, updates);
  
      return { success: true };
    } catch (error) {
      console.error("Error updating business metrics:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
  
  async function getVolumeFromGraphQL(contractAddress: string): Promise<number> {
    const DATA_URL = process.env.FLAUNCH_URL_MAINNET;
    if (!DATA_URL) {
      throw new Error("Missing FLAUNCH_URL_MAINNET environment variable");
    }
  
    const client = new GraphQLClient(DATA_URL);
    
  try {
    const response = await client.request<{ collectionToken: {volumeETH: string}
       }>(
        SINGLE_COIN_VOLUME_QUERY, { id: contractAddress }
      );
  

    console.log("GraphQL response:", JSON.stringify(response, null, 2));
    if (!response?.collectionToken.volumeETH) {
      throw new Error("Unexpected response structure");
    }

    const data = response.collectionToken;
    console.log(data)
    return Number.parseInt(data.volumeETH!);
  } catch (error: any) {
    console.error("Error fetching tokens:", error);
    throw new Error('Could not get Volume for Token', error)
  }
  }



export function listenToNetCost(
  contractAddress: string,
  onChange: (netCost: number) => void
) {
  const docRef = doc(db, "contracts", contractAddress);

  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.warn("Document not found:", contractAddress);
      return;
    }

    const data = snapshot.data();
    if (data.netCost !== undefined) {
      onChange(data.netCost);
    }
  });

  return unsubscribe; // 🔁 Call this to stop listening when component unmounts
}


  
  export async function getRaveUsers(
    contractAddress: string,
    options: GetRaveUsersOptions = {}
  ): Promise<GetRaveUsersResult> {
    const {
      sortBy = 'joinedAt',
      sortOrder = 'desc',
      limit: userLimit = 50,
      startAfter: startAfterDoc,
      joinedAfter,
      joinedBefore
    } = options;
  
    try {
      const usersCollectionRef = collection(db, `/contracts/${contractAddress}/users`);
      
      // Build query constraints
      const constraints = [];
      
      // Add date filters if provided
      if (joinedAfter) {
        constraints.push(where('joinedAt', '>', joinedAfter));
      }
      if (joinedBefore) {
        constraints.push(where('joinedAt', '<', joinedBefore));
      }
      
      // Add ordering
      constraints.push(orderBy(sortBy, sortOrder));
      
      // Add pagination
      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }
      
      // Add limit (get one extra to check if there are more)
      constraints.push(limit(userLimit + 1));
      
      // Execute query
      const querySnapshot = await getDocs(query(usersCollectionRef, ...constraints));
      
      // Process results
      const users: ContractUser[] = [];
      const docs = querySnapshot.docs;
      
      // Check if there are more results
      const hasMore = docs.length > userLimit;
      const actualDocs = hasMore ? docs.slice(0, -1) : docs;
      
      // Convert to ContractUser objects
      actualDocs.forEach(doc => {
        users.push(doc.data() as ContractUser);
      });
      
      // Get last document for pagination
      const lastDoc = actualDocs.length > 0 ? actualDocs[actualDocs.length - 1] : undefined;
      
      return {
        users,
        lastDoc,
        hasMore
      };
      
    } catch (error) {
      console.error(`❌ Error getting users for contract: ${contractAddress}`, error);
      throw new Error("Failed to get rave users. Check logs for details.");
    }
  }
  
  // Convenience function to get all users (use carefully for large raves)
  export async function getAllRaveUsers(contractAddress: string): Promise<ContractUser[]> {
    try {
      const usersCollectionRef = collection(db, `/contracts/${contractAddress}/users`);
      const querySnapshot = await getDocs(
        query(usersCollectionRef, orderBy('joinedAt', 'desc'))
      );
      
      return querySnapshot.docs.map(doc => doc.data() as ContractUser);
      
    } catch (error) {
      console.error(`❌ Error getting all users for contract: ${contractAddress}`, error);
      throw new Error("Failed to get all rave users. Check logs for details.");
    }
  }
  
  // Get recent joiners
  export async function getRecentRaveJoiners(
    contractAddress: string, 
    days: number = 7,
    limitCount: number = 20
  ): Promise<ContractUser[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    
    const result = await getRaveUsers(contractAddress, {
      joinedAfter: sinceDate,
      limit: limitCount,
      sortBy: 'joinedAt',
      sortOrder: 'desc'
    });
    
    return result.users;
  }
  
  // Get user count (fast)
  export async function getRaveUserCount(contractAddress: string): Promise<number> {
    try {
      const contractDoc = await getDoc(doc(db, `/contracts/${contractAddress}`));
      return contractDoc.data()?.userCount || 0;
    } catch (error) {
      console.error(`❌ Error getting user count for contract: ${contractAddress}`, error);
      return 0;
    }
  }

  type RaveSummary = {
    totalRavers: number;
    recentRavers: ContractUser[];
  };
  
  export async function getRaveSummary(
    contractAddress: string,
    recentLimit: number = 3,
    days: number = 7
  ): Promise<RaveSummary> {
    try {
      const [count, recentRavers] = await Promise.all([
        getRaveUserCount(contractAddress),
        getRecentRaveJoiners(contractAddress, days, recentLimit)
      ]);
  
      return {
        totalRavers: count,
        recentRavers
      };
    } catch (error) {
      console.error("❌ Error fetching rave summary:", error);
      return {
        totalRavers: 0,
        recentRavers: []
      };
    }
  }
  

