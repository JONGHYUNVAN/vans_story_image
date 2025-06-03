/**
 * 이미지 처리 관련 에러 클래스
 */
export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

/**
 * S3 업로드 관련 에러 클래스
 */
export class S3UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'S3UploadError';
  }
}

/**
 * API 요청 관련 에러 클래스
 */
export class APIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
  }
} 