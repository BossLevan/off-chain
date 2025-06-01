// export const convertIpfsToPinataUrl = async (metadataIpfsUri: string): Promise<string> => {
//     const ipfsGateway = "https://orange-encouraging-guanaco-614.mypinata.cloud/";
  
//     if (!metadataIpfsUri.startsWith("ipfs://")) {
//       throw new Error('Invalid IPFS URI. It should start with "ipfs://".');
//     }
  
//     const metadataUrl = metadataIpfsUri.replace("ipfs://", ipfsGateway);
  
//     const res = await fetch(metadataUrl);
//     if (!res.ok) {
//       throw new Error(`Failed to fetch metadata: ${res.statusText}`);
//     }
  
//     const metadata = await res.json();
//     const imageIpfsUri = metadata.image;
  
//     if (!imageIpfsUri || !imageIpfsUri.startsWith("ipfs://")) {
//       throw new Error("Missing or invalid 'image' field in metadata.");
//     }
  
//     const imageUrl = imageIpfsUri.replace("ipfs://", ipfsGateway);
//     return imageUrl;
//   };
  

export async function convertIpfsToPinataUrl(ipfsUrl: string) {
    const ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';
    if (!ipfsUrl.startsWith('ipfs://')) {
      throw new Error('Invalid IPFS URI. It should start with "ipfs://".');
    }
    const ipfsHash = ipfsUrl.replace('ipfs://', '');
    console.log(`${ipfsGateway}${ipfsHash}`)
    try {
    //   console.log('fetching')
      const response = await fetch(`${ipfsGateway}${ipfsHash}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
    //   console.log('data', data.image)
  
      if (!data.image) {
        throw new Error("Image field not found in the JSON");
      }
      const imageHash = data.image.replace('ipfs://', '');
    //   console.log('imaghash', imageHash)
  
      return`${ipfsGateway}${imageHash}`;
    } catch (error) {
      console.error("Error fetching from IPFS:", error);
      return null;
    }
  }
  