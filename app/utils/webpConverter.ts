import sharp from 'sharp';
import { ImageProcessingError } from './errors';

/**
 * WebP 변환 옵션 인터페이스
 * @interface WebPConversionOptions
 * @property {number} [quality=80] - WebP 이미지 품질 (0-100)
 * @property {number} [width] - 변환할 이미지의 최대 너비 (픽셀)
 * @property {number} [height] - 변환할 이미지의 최대 높이 (픽셀)
 */
export interface WebPConversionOptions {
  quality?: number;
  width?: number;
  height?: number;
}

/**
 * 이미지를 WebP 형식으로 변환합니다.
 * 
 * @param {Buffer | ArrayBuffer} buffer - 변환할 이미지 데이터
 * @param {WebPConversionOptions} [options={}] - 변환 옵션
 * @returns {Promise<Buffer>} WebP 형식으로 변환된 이미지 버퍼
 * 
 * @example
 * // 기본 옵션으로 변환
 * const webpBuffer = await convertToWebP(imageBuffer);
 * 
 * @example
 * // 품질과 크기 지정하여 변환
 * const webpBuffer = await convertToWebP(imageBuffer, {
 *   quality: 90,
 *   width: 1920,
 *   height: 1080
 * });
 */
export async function convertToWebP(
  buffer: Buffer | ArrayBuffer,
  options: WebPConversionOptions = {}
): Promise<Buffer> {
  try {
    const { quality = 80, width, height } = options;
    
    const imageBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));
    let sharpInstance = sharp(imageBuffer);

    // 리사이징이 필요한 경우
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    return await sharpInstance
      .webp({ quality })
      .toBuffer();
  } catch (error) {
    throw new ImageProcessingError(
      error instanceof Error ? error.message : '이미지 변환 중 오류가 발생했습니다.'
    );
  }
}

/**
 * 이미지의 메타데이터를 추출합니다.
 * 
 * @param {Buffer | ArrayBuffer} buffer - 메타데이터를 추출할 이미지 데이터
 * @returns {Promise<sharp.Metadata>} 이미지 메타데이터 (크기, 포맷, 색상 프로파일 등)
 * 
 * @example
 * const metadata = await getImageMetadata(imageBuffer);
 * console.log(metadata.width, metadata.height, metadata.format);
 */
export async function getImageMetadata(buffer: Buffer | ArrayBuffer) {
  try {
    const imageBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));
    return await sharp(imageBuffer).metadata();
  } catch (error) {
    throw new ImageProcessingError(
      error instanceof Error ? error.message : '이미지 메타데이터 추출 중 오류가 발생했습니다.'
    );
  }
} 