import { NextRequest, NextResponse } from 'next/server';
import { convertToWebP } from '@/app/utils/webpConverter';
import { uploadToS3 } from '@/app/utils/s3Uploader';
import { APIError, ImageProcessingError, S3UploadError } from '@/app/utils/errors';

/**
 * 이미지 업로드 API 엔드포인트
 * 
 * @route POST /api/upload
 * 
 * @param {NextRequest} request - Next.js 요청 객체
 * @returns {Promise<NextResponse>} Next.js 응답 객체
 * 
 * @example
 * // 요청 데이터 예시
 * // Content-Type: multipart/form-data
 * // 
 * // image: [이미지 파일]
 * 
 * @example
 * // 성공 응답 예시
 * {
 *   "success": true,
 *   "imageUrl": "https://bucket-name.s3.ap-northeast-2.amazonaws.com/images/1234567890-example.webp"
 * }
 * 
 * @example
 * // 에러 응답 예시 (400)
 * {
 *   "error": "이미지 파일이 필요합니다."
 * }
 * 
 * @example
 * // 에러 응답 예시 (500)
 * {
 *   "error": "이미지 업로드 중 에러가 발생했습니다."
 * }
 * 
 * @throws {400} 이미지 파일이 없는 경우
 * @throws {400} 파일 크기가 5MB를 초과하는 경우
 * @throws {500} 이미지 처리 또는 업로드 중 오류 발생 시
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      throw new APIError('이미지 파일이 필요합니다.', 400);
    }

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new APIError('파일 크기는 5MB를 초과할 수 없습니다.', 400);
    }

    // File을 ArrayBuffer로 변환
    const buffer = await file.arrayBuffer();

    try {
      // 이미지를 WebP로 변환
      const webpBuffer = await convertToWebP(buffer);

      // S3에 업로드할 파일명 생성
      const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}.webp`;

      // S3에 업로드
      const imageUrl = await uploadToS3(webpBuffer, fileName);
      
      return NextResponse.json({ 
        success: true, 
        imageUrl 
      });
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw new APIError(`이미지 처리 오류: ${error.message}`, 500);
      }
      if (error instanceof S3UploadError) {
        throw new APIError(`S3 업로드 오류: ${error.message}`, 500);
      }
      throw error;
    }
  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: '이미지 업로드 중 에러가 발생했습니다.' },
      { status: 500 }
    );
  }
} 