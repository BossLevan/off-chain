import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/app/firebase_config"

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
  
      const docRef = doc(db, "contracts", contractAddress);
      await setDoc(docRef, {
        prompt,
        imageUrls,
        uploadedAt: new Date().toISOString(),
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
    | { success: true; prompt: string; imageUrls: string[]; uploadedAt: string }
    | { success: false; prompt?: null, imageUrls?: null,  error: string }
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
        uploadedAt: data.uploadedAt,
      };
    } catch (error) {
      console.error("Error fetching token:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }