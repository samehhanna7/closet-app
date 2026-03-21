/**
 * Compresses an image file to a base64 string suitable for localStorage.
 * Targets ~150KB output regardless of input size.
 * Uses canvas to resize and re-encode as JPEG.
 */
export function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG base64
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Returns the total size of all localStorage data in MB.
 */
export function getStorageUsedMB() {
  let total = 0;
  Object.keys(localStorage).forEach(key => {
    total += (localStorage.getItem(key) || '').length;
  });
  return (total * 2 / 1024 / 1024).toFixed(2);
}

/**
 * Returns true if adding `newDataSize` bytes would exceed the safe limit.
 */
export function isStorageNearLimit(newDataLength = 0) {
  let total = newDataLength;
  Object.keys(localStorage).forEach(key => {
    total += (localStorage.getItem(key) || '').length;
  });
  // 4MB safe limit (localStorage max is 5MB, leave 1MB buffer)
  return total * 2 > 4 * 1024 * 1024;
}
