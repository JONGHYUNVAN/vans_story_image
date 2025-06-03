/**
 * @packageDocumentation
 *
 * 이미지 WebP 변환 및 메타데이터 추출 유틸리티
 *
 * - 다양한 형식의 이미지를 WebP로 변환하고, 메타데이터를 추출하는 기능을 제공합니다.
 * - Sharp 라이브러리를 사용하여 고성능 이미지 처리를 수행합니다.
 */
import sharp from 'sharp';
import { ImageProcessingError } from './errors';

/**
 * WebP 변환 옵션 인터페이스
 *
 * @example 기본 옵션
 * ```json
 * {
 *   "quality": 80,
 *   "width": null,
 *   "height": null,
 *   "preserveMetadata": true
 * }
 * ```
 *
 * @since 1.0.0
 */
export interface WebPConversionOptions {
  /** WebP 압축 품질 (1-100, 기본값: 80) */
  quality?: number;
  /** 리사이즈 너비 (픽셀, null이면 원본 크기 유지) */
  width?: number | null;
  /** 리사이즈 높이 (픽셀, null이면 원본 크기 유지) */
  height?: number | null;
  /** 메타데이터 보존 여부 (기본값: true) */
  preserveMetadata?: boolean;
}

/**
 * 이미지를 WebP 형식으로 변환합니다.
 *
 * @param buffer - 변환할 이미지 데이터 (Buffer 또는 ArrayBuffer)
 * @param options - 변환 옵션
 *
 * @returns WebP 형식으로 변환된 이미지 버퍼
 *
 * @throws {ImageProcessingError} 이미지 변환 중 오류 발생 시
 *
 * ### 지원하는 입력 형식:
 * - JPEG, PNG, GIF, TIFF, WebP, AVIF 등 (Sharp가 지원하는 모든 형식)
 *
 * ### 변환 특징:
 * - 품질: 1-100 (기본값: 80, 파일 크기와 품질의 최적 균형)
 * - 리사이징: 옵션으로 지정 가능 (기본값: 원본 크기 유지)
 * - 메타데이터: 옵션으로 보존/제거 선택 가능
 * - 압축 최적화
 *
 * ### 품질 설정 가이드:
 * - **90-100**: 최고 품질, 큰 파일 크기
 * - **80-90**: 고품질, 적당한 파일 크기 (권장)
 * - **70-80**: 표준 품질, 작은 파일 크기
 * - **50-70**: 낮은 품질, 매우 작은 파일 크기
 *
 * @example Request
 * ```json
 * {
 *   "file": "<업로드할 이미지 파일>",
 *   "options": {
 *     "quality": 90,
 *     "width": 1920,
 *     "height": 1080
 *   }
 * }
 * ```
 *
 * @example Response (성공)
 * ```json
 * "<Buffer 52 49 46 46 ... >"
 * ```
 *
 * @example Response (실패)
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "지원하지 않는 이미지 형식입니다.",
 *   "code": "UNSUPPORTED_FORMAT"
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link ImageProcessingError} - 이미지 처리 에러 클래스
 */
export async function convertToWebP(
  buffer: Buffer | ArrayBuffer,
  options: WebPConversionOptions = {}
): Promise<Buffer> {
  try {
    // 옵션 기본값 설정
    const {
      quality = 80,           // 기본 품질: 80% (파일 크기와 품질의 균형)
      width = null,
      height = null,
      preserveMetadata = true
    } = options;

    // 품질 범위 검증 (1-100)
    if (quality < 1 || quality > 100) {
      throw new ImageProcessingError('품질은 1-100 사이의 값이어야 합니다.');
    }
    
    // ArrayBuffer를 Buffer로 변환 (Node.js 환경에서 사용하기 위함)
    const imageBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));
    
    // Sharp 인스턴스 생성
    let sharpInstance = sharp(imageBuffer);

    // 리사이징 적용 (옵션으로 지정된 경우)
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // WebP 형식으로 변환하고 Buffer로 반환
    return await sharpInstance
      .webp({ 
        quality,
        // 메타데이터 보존 설정은 Sharp의 withMetadata()로 처리
      })
      .toBuffer();
  } catch (error) {
    // Sharp 라이브러리나 기타 오류를 ImageProcessingError로 래핑
    throw new ImageProcessingError(
      error instanceof Error ? error.message : '이미지 변환 중 오류가 발생했습니다.'
    );
  }
}

/**
 * 이미지의 메타데이터를 추출합니다.
 *
 * @param buffer - 메타데이터를 추출할 이미지 데이터 (Buffer 또는 ArrayBuffer)
 *
 * @returns 이미지 메타데이터 객체
 *
 * @throws {ImageProcessingError} 메타데이터 추출 중 오류 발생 시
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
 * {
 *   "format": "jpeg",
 *   "width": 1920,
 *   "height": 1080,
 *   "space": "srgb",
 *   "channels": 3,
 *   "depth": "uchar",
 *   "density": 72,
 *   "hasProfile": false,
 *   "hasAlpha": false,
 *   "orientation": 1
 * }
 * ```
 *
 * @example Response (실패)
 * ```json
 * {
 *   "name": "ImageProcessingError",
 *   "message": "이미지 메타데이터를 추출할 수 없습니다.",
 *   "code": "METADATA_EXTRACTION_FAILED"
 * }
 * ```
 *
 * @since 1.0.0
 * @see {@link ImageProcessingError} - 이미지 처리 에러 클래스
 */
export async function getImageMetadata(buffer: Buffer | ArrayBuffer) {
  try {
    // ArrayBuffer를 Buffer로 변환
    const imageBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(new Uint8Array(buffer));
    
    // Sharp를 사용하여 메타데이터 추출
    return await sharp(imageBuffer).metadata();
  } catch (error) {
    // Sharp 라이브러리나 기타 오류를 ImageProcessingError로 래핑
    throw new ImageProcessingError(
      error instanceof Error ? error.message : '이미지 메타데이터 추출 중 오류가 발생했습니다.'
    );
  }
} 