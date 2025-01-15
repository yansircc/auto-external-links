import sharp from "sharp";

/**
 * Compress image and convert to base64
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Compression options
 * @param {number} options.width - Target width (default: 800)
 * @param {number} options.quality - JPEG quality 1-100 (default: 80)
 * @returns {Promise<string>} Base64 encoded compressed image
 */
export async function compressAndConvertToBase64(
  imagePath: string,
  options = { width: 800, quality: 80 },
): Promise<string> {
  const { width, quality } = options;

  const compressedImageBuffer = await sharp(imagePath)
    .resize(width, null, {
      withoutEnlargement: true,
    })
    .jpeg({ quality })
    .toBuffer();

  return compressedImageBuffer.toString("base64");
}
