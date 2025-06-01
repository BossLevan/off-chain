export function extractImageId(firebaseUrl: string) {
    try {
      // Parse the URL to get the pathname
      const url = new URL(firebaseUrl);
      const pathname = url.pathname;
      
      // Split by '/' and get the last segment (the filename)
      const pathSegments = pathname.split('/');
      const filename = pathSegments[pathSegments.length - 1];
      
      // Decode the filename (Firebase URLs are URL encoded)
      const decodedFilename = decodeURIComponent(filename);
      
      return decodedFilename;
    } catch (error) {
      console.error('Error extracting image ID:', error);
      return null;
    }
  }