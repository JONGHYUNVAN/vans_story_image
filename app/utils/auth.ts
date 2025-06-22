/**
 * @packageDocumentation API 인증 관련 유틸리티 함수들
 */

/**
 * API 키 검증 결과 타입
 */
export interface AuthResult {
  /** 인증 성공 여부 */
  success: boolean;
  /** 에러 메시지 (실패시) */
  error?: string;
}

/**
 * 요청에서 API 키를 추출하고 검증합니다.
 * 
 * API 키는 다음 중 하나의 방식으로 전달될 수 있습니다:
 * 1. Authorization 헤더: `Bearer {API_KEY}`
 * 2. X-API-Key 헤더: `{API_KEY}`
 * 3. 쿼리 파라미터: `?api_key={API_KEY}`
 * 
 * @param request - Next.js 요청 객체
 * @returns 인증 결과
 * 
 * @example
 * ```typescript
 * const authResult = validateApiKey(request);
 * if (!authResult.success) {
 *   return NextResponse.json(
 *     { error: authResult.error },
 *     { status: 401 }
 *   );
 * }
 * ```
 */
export function validateApiKey(request: Request): AuthResult {
  const apiSecretKey = process.env.IMAGE_ROUTE_API_KEY;
  
  // 환경 변수에 API 키가 설정되지 않은 경우
  if (!apiSecretKey) {
    console.error('IMAGE_ROUTE_API_KEY가 설정되지 않았습니다. 환경 변수를 확인하세요.');
    return {
      success: false,
      error: 'API 키가 설정되지 않았습니다.'
    };
  }

  // API 키 추출 (여러 방식 지원)
  let providedApiKey: string | null = null;

  // 1. Authorization 헤더에서 Bearer 토큰으로 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedApiKey = authHeader.substring(7);
  }

  // 2. X-API-Key 헤더에서 확인
  if (!providedApiKey) {
    providedApiKey = request.headers.get('x-api-key');
  }

  // 3. 쿼리 파라미터에서 확인
  if (!providedApiKey) {
    const url = new URL(request.url);
    providedApiKey = url.searchParams.get('api_key');
  }

  // API 키가 제공되지 않은 경우
  if (!providedApiKey) {
    return {
      success: false,
      error: 'API 키가 필요합니다. Authorization 헤더, X-API-Key 헤더, 또는 api_key 쿼리 파라미터로 제공해주세요.'
    };
  }

  // API 키 검증
  if (providedApiKey !== apiSecretKey) {
    return {
      success: false,
      error: '유효하지 않은 API 키입니다.'
    };
  }

  return {
    success: true
  };
}

/**
 * API 키 검증을 위한 미들웨어 함수
 * 
 * @param request - Next.js 요청 객체
 * @param handler - 인증 성공 시 실행할 핸들러 함수
 * @returns 인증 실패 시 에러 응답, 성공 시 핸들러 결과
 * 
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   return withApiKeyAuth(request, async (request) => {
 *     // 인증된 사용자만 실행되는 로직
 *     return NextResponse.json({ message: 'Success' });
 *   });
 * }
 * ```
 */
export async function withApiKeyAuth<T>(
  request: Request,
  handler: (request: Request) => Promise<T>
): Promise<T | Response> {
  const authResult = validateApiKey(request);
  
  if (!authResult.success) {
    return new Response(
      JSON.stringify({ error: authResult.error }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return handler(request);
} 