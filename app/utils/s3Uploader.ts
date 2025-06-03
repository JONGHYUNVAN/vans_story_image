import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3UploadError } from './errors';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * S3 업로드 옵션 인터페이스
 * @interface S3UploadOptions
 * @property {string} [bucket] - S3 버킷 이름 (기본값: 환경변수 AWS_S3_BUCKET)
 * @property {string} [folder='images'] - S3 내 저장될 폴더 경로
 * @property {string} [contentType='image/webp'] - 업로드할 파일의 MIME 타입
 */
export interface S3UploadOptions {
  bucket?: string;
  folder?: string;
  contentType?: string;
}

/**
 * 파일을 AWS S3에 업로드합니다.
 * 
 * @param {Buffer} buffer - 업로드할 파일 데이터
 * @param {string} fileName - 저장될 파일 이름
 * @param {S3UploadOptions} [options={}] - 업로드 옵션
 * @returns {Promise<string>} 업로드된 파일의 URL
 * 
 * @example
 * // 기본 옵션으로 업로드
 * const url = await uploadToS3(fileBuffer, 'example.webp');
 * 
 * @example
 * // 커스텀 옵션으로 업로드
 * const url = await uploadToS3(fileBuffer, 'example.webp', {
 *   bucket: 'my-custom-bucket',
 *   folder: 'custom-folder',
 *   contentType: 'image/png'
 * });
 */
export async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  options: S3UploadOptions = {}
): Promise<string> {
  try {
    const {
      bucket = process.env.AWS_S3_BUCKET || '',
      folder = 'images',
      contentType = 'image/webp'
    } = options;

    if (!bucket) {
      throw new S3UploadError('S3 버킷이 설정되지 않았습니다.');
    }

    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    throw new S3UploadError(
      error instanceof Error ? error.message : 'S3 업로드 중 오류가 발생했습니다.'
    );
  }
} 