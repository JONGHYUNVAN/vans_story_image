/**
 * @packageDocumentation
 * 
 * 애플리케이션에서 사용되는 커스텀 에러 클래스들을 정의합니다.
 * 
 * - 각 에러 클래스는 특정 도메인의 에러 상황을 표현합니다.
 * - 에러 메시지와 추가 정보를 포함할 수 있습니다.
 * 
 * ### 주요 에러 클래스:
 * - {@link ImageProcessingError} - 이미지 처리 관련 에러
 * - {@link S3UploadError} - S3 업로드 관련 에러
 * - {@link ValidationError} - 입력값 검증 관련 에러
 */

/**
 * 이미지 처리 관련 에러를 나타내는 클래스입니다.
 * 이미지 변환, 메타데이터 추출 등의 과정에서 발생하는 에러를 처리합니다.
 * 
 * @example Request
 * ```json
 * {
 *   "file": "<업로드할 이미지 파일>"
 * }
 * ```
 * 
 * @example Response
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "지원하지 않는 이미지 형식입니다.",
 *   "code": "UNSUPPORTED_FORMAT"
 * }
 * ```
 * 
 * ### 주요 에러 상황:
 * - 지원하지 않는 이미지 형식 (`UNSUPPORTED_FORMAT`)
 * - 손상된 이미지 파일 (`CORRUPTED_FILE`)
 * - 메모리 부족 (`OUT_OF_MEMORY`)
 * - Sharp 라이브러리 오류 (`SHARP_ERROR`)
 * - 이미지 크기 초과 (`IMAGE_TOO_LARGE`)
 * - 변환 시간 초과 (`CONVERSION_TIMEOUT`)
 * - 잘못된 이미지 크기 (`INVALID_DIMENSIONS`)
 * - 메타데이터 읽기 실패 (`METADATA_READ_FAILED`)
 * 
 * @example 지원하지 않는 이미지 형식
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "지원하지 않는 이미지 형식입니다.",
 *   "code": "UNSUPPORTED_FORMAT"
 * }
 * ```
 * 
 * @example 손상된 이미지 파일
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "이미지 파일이 손상되었습니다.",
 *   "code": "CORRUPTED_FILE"
 * }
 * ```
 * 
 * @example 메모리 부족
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "메모리 부족으로 이미지 처리에 실패했습니다.",
 *   "code": "OUT_OF_MEMORY"
 * }
 * ```
 * 
 * @example Sharp 라이브러리 오류
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "Sharp 라이브러리 오류: Unexpected end of data",
 *   "code": "SHARP_ERROR"
 * }
 * ```
 * 
 * @example 이미지 크기 초과
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "이미지 크기가 허용 범위를 초과했습니다. (최대: 10000x10000)",
 *   "code": "IMAGE_TOO_LARGE"
 * }
 * ```
 * 
 * @example 변환 시간 초과
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "이미지 변환 시간이 초과되었습니다.",
 *   "code": "CONVERSION_TIMEOUT"
 * }
 * ```
 * 
 * @example 잘못된 이미지 크기
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "이미지 크기가 유효하지 않습니다.",
 *   "code": "INVALID_DIMENSIONS"
 * }
 * ```
 * 
 * @example 메타데이터 읽기 실패
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "이미지 메타데이터를 읽을 수 없습니다.",
 *   "code": "METADATA_READ_FAILED"
 * }
 * ```
 * 
 * @since 1.0.0
 * @see {@link convertToWebP} - WebP 변환 함수
 * @see {@link getImageMetadata} - 이미지 메타데이터 추출 함수
 */
export class ImageProcessingError extends Error {
  /** 에러 코드 */
  public readonly code: string;

  /**
   * @param message - 에러 메시지
   * @param code - 에러 코드 (기본값: 'IMAGE_PROCESSING_ERROR')
   */
  constructor(message: string, code: string = 'IMAGE_PROCESSING_ERROR') {
    super(message);
    this.name = 'ImageProcessingError';
    this.code = code;
  }
}

/**
 * S3 업로드 관련 에러를 나타내는 클래스입니다.
 * AWS S3에 파일을 업로드하는 과정에서 발생하는 에러를 처리합니다.
 * 
 * @example Request
 * ```json
 * {
 *   "file": "<업로드할 이미지 파일>"
 * }
 * ```
 * 
 * @example Response
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "AWS 인증에 실패했습니다.",
 *   "code": "AUTH_FAILED"
 * }
 * ```
 * 
 * ### 주요 에러 상황:
 * - AWS 인증 실패 (`AUTH_FAILED`)
 * - 네트워크 오류 (`NETWORK_ERROR`)
 * - 권한 부족 (`PERMISSION_DENIED`)
 * - 버킷 접근 실패 (`BUCKET_ACCESS_FAILED`)
 * - 환경 변수 누락 (`ENV_MISSING`)
 * - 할당량 초과 (`QUOTA_EXCEEDED`)
 * - 업로드 시간 초과 (`UPLOAD_TIMEOUT`)
 * - 잘못된 버킷명 (`INVALID_BUCKET_NAME`)
 * - S3 파일 크기 제한 초과 (`FILE_TOO_LARGE_FOR_S3`)
 * 
 * @example AWS 인증 실패
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "AWS 인증에 실패했습니다.",
 *   "code": "AUTH_FAILED"
 * }
 * ```
 * 
 * @example 네트워크 오류
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "네트워크 오류가 발생했습니다.",
 *   "code": "NETWORK_ERROR"
 * }
 * ```
 * 
 * @example 권한 부족
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "버킷 접근 권한이 없습니다.",
 *   "code": "PERMISSION_DENIED"
 * }
 * ```
 * 
 * @example 버킷 접근 실패
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "S3 버킷에 접근할 수 없습니다.",
 *   "code": "BUCKET_ACCESS_FAILED"
 * }
 * ```
 * 
 * @example 환경 변수 누락
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "환경 변수 누락",
 *   "code": "ENV_MISSING"
 * }
 * ```
 * 
 * @example 할당량 초과
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "S3 스토리지 할당량을 초과했습니다.",
 *   "code": "QUOTA_EXCEEDED"
 * }
 * ```
 * 
 * @example 업로드 시간 초과
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "파일 업로드 시간이 초과되었습니다.",
 *   "code": "UPLOAD_TIMEOUT"
 * }
 * ```
 * 
 * @example 잘못된 버킷명
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "유효하지 않은 S3 버킷명입니다.",
 *   "code": "INVALID_BUCKET_NAME"
 * }
 * ```
 * 
 * @example S3 파일 크기 제한 초과
 * ```json
 * {
 *   "name": "S3UploadError",
 *   "message": "파일 크기가 S3 제한을 초과했습니다. (최대: 5TB)",
 *   "code": "FILE_TOO_LARGE_FOR_S3"
 * }
 * ```
 * 
 * @since 1.0.0
 * @see {@link uploadToS3} - S3 업로드 함수
 */
export class S3UploadError extends Error {
  /** 에러 코드 */
  public readonly code: string;

  /**
   * @param message - 에러 메시지
   * @param code - 에러 코드 (기본값: 'S3_UPLOAD_ERROR')
   */
  constructor(message: string, code: string = 'S3_UPLOAD_ERROR') {
    super(message);
    this.name = 'S3UploadError';
    this.code = code;
  }
}

/**
 * 입력값 검증 관련 에러를 나타내는 클래스입니다.
 * API 요청의 입력값 검증 과정에서 발생하는 에러를 처리합니다.
 * 
 * @example Request
 * ```json
 * {
 *   "file": "<업로드할 이미지 파일>"
 * }
 * ```
 * 
 * @example Response
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "파일 크기가 너무 큽니다.",
 *   "code": "FILE_TOO_LARGE"
 * }
 * ```
 * 
 * ### 주요 에러 상황:
 * - 필수 필드 누락 (`REQUIRED_FIELD_MISSING`)
 * - 잘못된 데이터 형식 (`INVALID_TYPE`)
 * - 유효하지 않은 값 (`INVALID_VALUE`)
 * - 파일 크기 초과 (`FILE_TOO_LARGE`)
 * - 허용되지 않는 파일 확장자 (`INVALID_FILE_EXTENSION`)
 * - 파일명 길이 초과 (`FILENAME_TOO_LONG`)
 * - 빈 파일 (`EMPTY_FILE`)
 * - 잘못된 Content-Type (`INVALID_CONTENT_TYPE`)
 * - 파일 개수 초과 (`TOO_MANY_FILES`)
 * 
 * @example 필수 필드 누락
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "필수 필드가 누락되었습니다.",
 *   "code": "REQUIRED_FIELD_MISSING"
 * }
 * ```
 * 
 * @example 잘못된 데이터 형식
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "잘못된 데이터 형식입니다.",
 *   "code": "INVALID_TYPE"
 * }
 * ```
 * 
 * @example 유효하지 않은 값
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "유효하지 않은 값입니다.",
 *   "code": "INVALID_VALUE"
 * }
 * ```
 * 
 * @example 파일 크기 초과
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "파일 크기가 너무 큽니다.",
 *   "code": "FILE_TOO_LARGE"
 * }
 * ```
 * 
 * @example 허용되지 않는 파일 확장자
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "허용되지 않는 파일 확장자입니다. (허용: jpg, jpeg, png, webp)",
 *   "code": "INVALID_FILE_EXTENSION"
 * }
 * ```
 * 
 * @example 파일명 길이 초과
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "파일명이 너무 깁니다. (최대: 255자)",
 *   "code": "FILENAME_TOO_LONG"
 * }
 * ```
 * 
 * @example 빈 파일
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "빈 파일은 업로드할 수 없습니다.",
 *   "code": "EMPTY_FILE"
 * }
 * ```
 * 
 * @example 잘못된 Content-Type
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "지원하지 않는 Content-Type입니다.",
 *   "code": "INVALID_CONTENT_TYPE"
 * }
 * ```
 * 
 * @example 파일 개수 초과
 * ```json
 * {
 *   "name": "ValidationError",
 *   "message": "업로드 가능한 파일 개수를 초과했습니다. (최대: 10개)",
 *   "code": "TOO_MANY_FILES"
 * }
 * ```
 * 
 * @since 1.0.0
 */
export class ValidationError extends Error {
  /** 에러 코드 */
  public readonly code: string;

  /**
   * @param message - 에러 메시지
   * @param code - 에러 코드 (기본값: 'VALIDATION_ERROR')
   */
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
  }
} 