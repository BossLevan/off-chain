function resizeToAspectRatio(base64: string, aspectRatio = 3 / 2): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        const originalWidth = img.width;
        const originalHeight = img.height;
        const originalRatio = originalWidth / originalHeight;
  
        let targetWidth, targetHeight;
  
        if (originalRatio > aspectRatio) {
          targetHeight = originalHeight;
          targetWidth = originalHeight * aspectRatio;
        } else {
          targetWidth = originalWidth;
          targetHeight = originalWidth / aspectRatio;
        }
  
        canvas.width = targetWidth;
        canvas.height = targetHeight;
  
        const xOffset = (originalWidth - targetWidth) / 2;
        const yOffset = (originalHeight - targetHeight) / 2;
  
        ctx?.drawImage(img, xOffset, yOffset, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/png"));
      };
  
      img.onerror = (err) => {
        reject(err);
      };
    });
  }
  