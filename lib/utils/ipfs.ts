export const convertIpfsToPinataUrl = async (metadataIpfsUri: string): Promise<string> => {
    const ipfsGateway = "https://orange-encouraging-guanaco-614.mypinata.cloud/";
  
    if (!metadataIpfsUri.startsWith("ipfs://")) {
      throw new Error('Invalid IPFS URI. It should start with "ipfs://".');
    }
  
    const metadataUrl = metadataIpfsUri.replace("ipfs://", ipfsGateway);
  
    const res = await fetch(metadataUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch metadata: ${res.statusText}`);
    }
  
    const metadata = await res.json();
    const imageIpfsUri = metadata.image;
  
    if (!imageIpfsUri || !imageIpfsUri.startsWith("ipfs://")) {
      throw new Error("Missing or invalid 'image' field in metadata.");
    }
  
    const imageUrl = imageIpfsUri.replace("ipfs://", ipfsGateway);
    return imageUrl;
  };
  