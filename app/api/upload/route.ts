/**
 * @packageDocumentation 이미지 업로드 API 라우트
 *  - Next.js API Route: /api/upload
 */
import { NextRequest, NextResponse } from 'next/server';
import { convertToWebP } from '@/app/utils/webpConverter';
import { uploadToS3 } from '@/app/utils/s3Uploader';
import { ImageProcessingError, S3UploadError } from '@/app/utils/errors';
import { validateApiKey } from '../../utils/auth'

// 허용된 도메인 목록
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://vansdevblog.online'
];

// CORS 헤더 생성 함수
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Max-Age': '86400',
  };

  // origin이 허용된 목록에 있으면 해당 origin을 사용
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// OPTIONS 요청 처리
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) });
}

/**
 * 이미지 업로드 API 엔드포인트
 * 
 * 클라이언트로부터 이미지를 받아 WebP로 변환하고 S3에 업로드한 후 CloudFront URL을 반환합니다.
 * 
 * ### 처리 과정
 * 1. multipart/form-data에서 이미지 파일 추출 및 검증
 *    - 필수 필드 'image' 존재 확인
 *    - 파일 크기 제한 (5MB) 확인
 * 2. 이미지를 WebP 형식으로 변환
 *    - 품질: 85% (고품질과 파일 크기의 균형)
 *    - 원본 크기 유지
 * 3. S3에 업로드
 *    - 고유한 파일명 생성 (타임스탬프 + 랜덤문자열.webp)
 *    - 메타데이터에 원본 파일명과 타입 저장
 * 4. CloudFront URL 반환
 *    - 형식: https://d2hb7sssthofyk.cloudfront.net/images/[파일명]
 * 
 * ### 보안
 * - **API 키 인증**: 모든 요청에 유효한 API 키 필요
 *   - Authorization 헤더: `Bearer {API_KEY}`
 *   - X-API-Key 헤더: `{API_KEY}`
 *   - 쿼리 파라미터: `?api_key={API_KEY}`
 * - CORS: 허용된 도메인에서만 접근 가능
 *   - http://localhost:3000
 *   - http://localhost:3002
 *   - https://vansdevblog.online
 * - 파일 크기 제한: 5MB
 * - 허용 파일 형식: 이미지 파일 (MIME 타입 검증)
 * 
 * @route POST /api/upload
 * @param {NextRequest} request - multipart/form-data 형식의 요청
 *   - Content-Type: multipart/form-data
 *   - 필수 필드: image (이미지 파일)
 * @returns {Promise<NextResponse>} JSON 응답
 *   - 성공: { success: true, fileName: string }
 *   - 실패: { error: string }
 * 
 * @example 요청
 * ```http
 * POST /api/upload
 * Content-Type: multipart/form-data
 * Origin: https://vansdevblog.online
 * Authorization: Bearer YOUR_API_KEY_HERE
 * # 또는 X-API-Key: YOUR_API_KEY_HERE
 * # 또는 쿼리 파라미터: /api/upload?api_key=YOUR_API_KEY_HERE
 * 
 * ------WebKitFormBoundary7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="image"; filename="example.jpg"
 * Content-Type: image/jpeg
 * 
 * [이미지 바이너리 데이터]
 * ------WebKitFormBoundary7MA4YWxkTrZu0gW--
 * ```
 * 
 * @example 성공 응답 (200)
 * ```json
 * {
 *   "success": true,
 *   "fileName": "https://d2hb7sssthofyk.cloudfront.net/images/20240315_143022_a1b2c3d4.webp"
 * }
 * ```
 * 
 * @example 에러 응답 (401) - API 키 누락/무효
 * ```json
 * {
 *   "error": "API 키가 필요합니다. Authorization 헤더, X-API-Key 헤더, 또는 api_key 쿼리 파라미터로 제공해주세요."
 * }
 * ```
 * 
 * @example 에러 응답 (400) - 이미지 파일 누락
 * ```json
 * {
 *   "error": "이미지 파일이 필요합니다."
 * }
 * ```
 * 
 * @example 에러 응답 (400) - 파일 크기 초과
 * ```json
 * {
 *   "error": "파일 크기는 5MB를 초과할 수 없습니다."
 * }
 * ```
 * 
 * @example 에러 응답 (400) - 이미지 처리 실패
 * ```json
 * {
 *   "error": "이미지 처리 오류: 지원하지 않는 이미지 형식입니다."
 * }
 * ```
 * 
 * @example 에러 응답 (400) - S3 업로드 실패
 * ```json
 * {
 *   "error": "S3 업로드 오류: 접근 권한이 없습니다."
 * }
 * ```
 * 
 * @example 에러 응답 (500) - 서버 내부 오류
 * ```json
 * {
 *   "error": "이미지 업로드 중 에러가 발생했습니다."
 * }
 * ```
 * 
 * @throws {Error} 401 - API 키 인증 실패
 * @throws {Error} 400 - 클라이언트 요청 오류
 * @throws {Error} 500 - 서버 내부 오류
 * 
 * @see {@link convertToWebP} - 이미지 WebP 변환
 * @see {@link uploadToS3} - S3 업로드 및 CloudFront URL 생성
 */
export async function POST(request: NextRequest) {
  const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const startTime = Date.now();
  const corsHeaders = getCorsHeaders(request);

  console.log(`[${requestId}] 업로드 요청 시작 - ${new Date().toISOString()}`);
  console.log(`[${requestId}] 요청 헤더:`, {
    'content-type': request.headers.get('content-type'),
    'content-length': request.headers.get('content-length'),
    'origin': request.headers.get('origin'),
    'user-agent': request.headers.get('user-agent')
  });

  // API 키 검증
  const authResult = validateApiKey(request);
  if (!authResult.success) {
    console.log(`[${requestId}] 인증 실패: ${authResult.error}`);
    return NextResponse.json(
      { error: authResult.error },
      { status: 401, headers: corsHeaders }
    );
  }
  console.log(`[${requestId}] API 키 인증 성공`);

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    console.log(`[${requestId}] 파일 정보:`, {
      name: file?.name,
      type: file?.type,
      size: file?.size ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : '없음'
    });

    if (!file) {
      console.log(`[${requestId}] 에러: 이미지 파일 없음`);
      return NextResponse.json(
        { error: '이미지 파일이 필요합니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log(`[${requestId}] 에러: 파일 크기 초과 (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return NextResponse.json(
        { error: '파일 크기는 5MB를 초과할 수 없습니다.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // File을 ArrayBuffer로 변환
    const buffer = await file.arrayBuffer();

    try {
      console.log(`[${requestId}] WebP 변환 시작`);
      // 이미지를 WebP로 변환 (품질 85% - 고품질과 파일 크기의 균형)
      const webpBuffer = await convertToWebP(buffer, {
        quality: 85  // S3 업로드용으로 약간 높은 품질 사용
      });
      console.log(`[${requestId}] WebP 변환 완료 (${(webpBuffer.length / 1024 / 1024).toFixed(2)}MB)`);

      // 원본 파일명에서 확장자 제거
      const originalName = file.name.replace(/\.[^/.]+$/, '');

      console.log(`[${requestId}] S3 업로드 시작`);
      // S3에 업로드 (metadata에 원본 파일명 포함)
      const fileName = await uploadToS3(webpBuffer, {
        contentType: 'image/webp',
        prefix: 'images/',
        metadata: {
          originalName: originalName,
          originalType: file.type
        }
      });
      console.log(`[${requestId}] S3 업로드 완료: ${fileName}`);
      
      const endTime = Date.now();
      console.log(`[${requestId}] 요청 처리 완료 - 소요시간: ${endTime - startTime}ms`);
      
      return NextResponse.json({ 
        success: true, 
        fileName 
      }, { headers: corsHeaders });

    } catch (error) {
      console.error(`[${requestId}] 처리 중 에러 발생:`, error);
      if (error instanceof ImageProcessingError) {
        return NextResponse.json(
          { error: `이미지 처리 오류: ${error.message}` },
          { status: 400, headers: corsHeaders }
        );
      }
      if (error instanceof S3UploadError) {
        return NextResponse.json(
          { error: `S3 업로드 오류: ${error.message}` },
          { status: 400, headers: corsHeaders }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error(`[${requestId}] 예상치 못한 에러:`, error);
    
    return NextResponse.json(
      { error: '이미지 업로드 중 에러가 발생했습니다.' },
      { status: 500, headers: corsHeaders }
    );
  }
} 