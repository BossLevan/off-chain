export function extractImageId(firebaseUrl: string): string | null {
    try {
      const url = new URL(firebaseUrl);
      
      // Handle Firebase Storage format: 
      // https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Ffilename?alt=media&token=...
      if (url.hostname === 'firebasestorage.googleapis.com') {
        // Extract the path after /o/
        const pathMatch = url.pathname.match(/\/o\/(.+)$/);
        if (pathMatch) {
          const encodedPath = pathMatch[1];
          // Decode the URL-encoded path
          const decodedPath = decodeURIComponent(encodedPath);
          
          // Split by '/' and get the last segment (the actual filename)
          const pathSegments = decodedPath.split('/');
          const filename = pathSegments[pathSegments.length - 1];
          
          return filename;
        }
      }
      
      // Fallback for other URL formats
      const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);
      const lastSegment = pathSegments[pathSegments.length - 1];
      return decodeURIComponent(lastSegment);
      
    } catch (error) {
      console.error('Error extracting image ID:', error);
      return null;
    }
  }