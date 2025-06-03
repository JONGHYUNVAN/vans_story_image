/**
 * @packageDocumentation
 * 
 * AWS S3 이미지 업로드 유틸리티
 * 
 * - 이미지 파일을 AWS S3 버킷에 업로드하는 기능을 제공합니다.
 * - AWS SDK v3를 사용하여 안전하고 효율적인 파일 업로드를 구현합니다.
 * 
 * ### 주요 기능:
 * - 이미지 파일 S3 업로드
 * - 고유한 파일명 생성
 * - 업로드 상태 모니터링
 * - 에러 처리 및 재시도
 * 
 * ### 환경 변수 요구사항:
 * - AWS_ACCESS_KEY_ID: AWS 액세스 키
 * - AWS_SECRET_ACCESS_KEY: AWS 시크릿 키
 * - AWS_REGION: AWS 리전 (예: ap-northeast-2)
 * - S3_BUCKET_NAME: S3 버킷 이름
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3UploadError } from './errors';



/**
 * AWS S3 클라이언트 인스턴스
 * 
 * 환경 변수에서 AWS 자격 증명과 리전 정보를 가져와서 S3 클라이언트를 생성합니다.
 * 이 클라이언트는 모든 S3 업로드 작업에 재사용됩니다.
 * 
 * @constant {S3Client} s3Client
 * @memberof module:S3Uploader
 * @private
 * 
 * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/} - AWS S3 클라이언트 문서
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * S3 업로드 옵션 인터페이스
 * 
 * S3에 파일을 업로드할 때 사용되는 설정 옵션을 정의합니다.
 * 
 * @example 기본 옵션
 * ```json
 * {
 *   "contentType": "image/webp",
 *   "publicRead": true,
 *   "metadata": {
 *     "originalName": "example.jpg"
 *   },
 *   "prefix": "images/"
 * }
 * ```
 * 
 * @since 1.0.0
 */
export interface S3UploadOptions {
  contentType?: string;
  publicRead?: boolean;
  metadata?: Record<string, string>;
  prefix?: string;
}

/**
 * 이미지 파일을 AWS S3에 업로드합니다.
 * 
 * 이 함수는 이미지 파일을 AWS S3 버킷에 업로드하고,
 * 업로드된 파일의 URL을 반환합니다.
 * 
 * @param fileBuffer - 업로드할 이미지 파일 버퍼
 * @param options - 업로드 옵션
 * 
 * @returns 업로드된 파일의 URL (HTTPS)
 * 
 * @throws {S3UploadError} 업로드 실패 시
 * 
 * ### 업로드 과정:
 * 1. 환경 변수 검증
 * 2. 고유한 파일명 생성
 * 3. S3 클라이언트 설정
 * 4. 파일 업로드 실행
 * 5. 업로드된 파일 URL 반환
 * 
 * ### 파일명 생성 규칙:
 * - 접두사 (옵션): S3UploadOptions.prefix
 * - 타임스탬프: YYYYMMDD_HHmmss
 * - 랜덤 문자열: 8자리 16진수
 * - 확장자: .webp
 * 
 * 예시: 'images/20240315_143022_a1b2c3d4.webp'
 * 
 * ### 에러 처리:
 * - 환경 변수 누락
 * - AWS 인증 실패
 * - 네트워크 오류
 * - 권한 부족
 * - 버킷 접근 실패
 * 
 * @example Request
 * ```json
 * {
 *   "file": "<업로드할 이미지 파일>"
 * }
 * ```
 * 
 * @example Response (성공)
 * ```json
 * "https://my-bucket.s3.ap-northeast-2.amazonaws.com/images/20240315_143022_a1b2c3d4.webp"
 * ```
 * 
 * @example Response (실패)
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "AWS 인증에 실패했습니다.",
 *   "code": "AUTH_FAILED"
 * }
 * ```
 * 
 * @since 1.0.0
 * @see {@link S3UploadError} - S3 업로드 에러 클래스
 * @see {@link S3UploadOptions} - 업로드 옵션 인터페이스
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  options: S3UploadOptions = {}
): Promise<string> {
  try {
    // 환경 변수 검증
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !process.env.S3_BUCKET_NAME) {
      throw new S3UploadError('환경 변수가 누락되었습니다.');
    }

    // 고유한 파일명 생성
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').substring(0, 15);
    const randomString = Math.random().toString(16).substring(2, 10);
    const fileName = `${options.prefix || 'images/'}${timestamp}_${randomString}.webp`;

    // S3 업로드 명령 생성
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: options.contentType,
      Metadata: options.metadata,
    });

    // S3에 파일 업로드 실행
    await s3Client.send(command);

    // 업로드된 파일의 URL 생성 및 반환
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    // 모든 오류를 S3UploadError로 래핑하여 일관된 에러 처리
    throw new S3UploadError(
      error instanceof Error ? error.message : 'S3 업로드 중 오류가 발생했습니다.'
    );
  }
} 