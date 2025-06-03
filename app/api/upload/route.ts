/**
 * @packageDocumentation 이미지 업로드 API 라우트
 *  - Next.js API Route: /api/upload
 */
import { NextRequest, NextResponse } from 'next/server';
import { convertToWebP } from '@/app/utils/webpConverter';
import { uploadToS3 } from '@/app/utils/s3Uploader';
import { ValidationError, ImageProcessingError, S3UploadError } from '@/app/utils/errors';



/**
 * 이미지 업로드 API 엔드포인트
 *
 * 1. 클라이언트로부터 multipart/form-data 형식으로 전송된 이미지 파일 수신
 * 2. WebP 형식으로 변환한 후 AWS S3에 업로드
 * 3. 업로드된 파일의 URL을 반환
 *
 * ### 주요 기능:
 * - 이미지 파일 검증 (존재 여부, 크기 제한)
 * - 이미지를 WebP 형식으로 변환 (원본 크기 유지, 품질 80%)
 * - AWS S3에 이미지 업로드
 * - 고유한 파일명 생성 (타임스탬프 + 원본 파일명)
 * - 에러 처리 및 적절한 HTTP 상태 코드 반환
 *
 * ### 처리 과정:
 * 1. FormData에서 'image' 필드를 추출
 * 2. 파일 존재 여부 및 크기 검증 (최대 5MB)
 * 3. File 객체를 ArrayBuffer로 변환
 * 4. convertToWebP()를 사용하여 WebP로 변환
 * 5. 고유한 파일명 생성 (현재시간 + 원본파일명.webp)
 * 6. uploadToS3()를 사용하여 S3에 업로드
 * 7. 성공 시 이미지 URL 반환, 실패 시 에러 응답
 *
 * @param request - Next.js 요청 객체
 *
 * @returns Next.js 응답 객체
 *
 * @throws {ValidationError} 400 - 클라이언트 요청 오류
 *   - 이미지 파일이 없는 경우: "이미지 파일이 필요합니다."
 *   - 파일 크기 초과: "파일 크기는 5MB를 초과할 수 없습니다."
 * @throws {ValidationError} 500 - 서버 내부 오류
 *   - 이미지 처리 오류: "이미지 처리 오류: {상세 메시지}"
 *   - S3 업로드 오류: "S3 업로드 오류: {상세 메시지}"
 *   - 기타 오류: "이미지 업로드 중 에러가 발생했습니다."
 *
 * @example Request
 * ```json
 * POST /api/upload
 * Content-Type: multipart/form-data
 *
 * ------WebKitFormBoundary7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="image"; filename="example.jpg"
 * Content-Type: image/jpeg
 *
 * [이미지 바이너리 데이터]
 * ------WebKitFormBoundary7MA4YWxkTrZu0gW--
 * ```
 *
 * @example Response (성공)
 * ```json
 * {
 *   "success": true,
 *   "imageUrl": "https://bucket.s3.ap-northeast-2.amazonaws.com/images/1234567890-example.webp"
 * }
 * ```
 *
 * @example Response (400 Bad Request)
 * ```json
 * {
 *   "error": "이미지 파일이 필요합니다."
 * }
 * ```
 *
 * @example Response (500 Internal Server Error)
 * ```json
 * {
 *   "error": "이미지 처리 오류: 지원하지 않는 이미지 형식입니다."
 * }
 * ```
 *
 * @since 1.0.0
 *
 * @see {@link convertToWebP} - 이미지 WebP 변환 함수
 * @see {@link uploadToS3} - S3 업로드 함수
 * @see {@link ValidationError} - API 에러 클래스
 * @see {@link ImageProcessingError} - 이미지 처리 에러 클래스
 * @see {@link S3UploadError} - S3 업로드 에러 클래스
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      throw new ValidationError('이미지 파일이 필요합니다.');
    }

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError('파일 크기는 5MB를 초과할 수 없습니다.');
    }

    // File을 ArrayBuffer로 변환
    const buffer = await file.arrayBuffer();

    try {
      // 이미지를 WebP로 변환
      const webpBuffer = await convertToWebP(buffer);

      // S3에 업로드할 파일명 생성
      const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}.webp`;

      // S3에 업로드
      const imageUrl = await uploadToS3(webpBuffer, {
        contentType: 'image/webp',
        prefix: 'images/'
      });
      
      return NextResponse.json({ 
        success: true, 
        imageUrl 
      });
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw new ValidationError(`이미지 처리 오류: ${error.message}`);
      }
      if (error instanceof S3UploadError) {
        throw new ValidationError(`S3 업로드 오류: ${error.message}`);
      }
      throw error;
    }
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '이미지 업로드 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
} 