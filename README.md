# Vans Story API Route

이 프로젝트는 Next.js 기반의 API 서버로, 이미지 업로드 및 AWS S3 저장 기능을 제공합니다.  
글에서 크기를 정해서 보낸 이미지 파일을 받아 WebP로 변환한 후, AWS S3에 업로드하여 이미지 URL을 반환합니다.

## 파일 구조

- **app/api/upload/route.ts**  
 – POST /api/upload 엔드포인트 (multipart/form-data로 이미지 파일을 받아 WebP 변환 후 S3에 업로드)  
- **app/utils/webpConverter.ts**  
 – convertToWebP 함수 (이미지 버퍼를 WebP로 변환)  
 – getImageMetadata 함수 (이미지 메타데이터 추출)  
- **app/utils/s3Uploader.ts**  
 – uploadToS3 함수 (파일 버퍼를 AWS S3에 업로드)  
- **app/utils/errors.ts**  
 – ImageProcessingError, S3UploadError, APIError 등 에러 클래스 정의  
- **package.json, package-lock.json**  
 – npm 의존성 및 스크립트  
- **tsconfig.json**  
 – TypeScript 설정  
- **next.config.ts**  
 – Next.js 설정  
- **next-env.d.ts**  
 – Next.js 타입 선언  
- **eslint.config.mjs**  
 – ESLint 설정  
- **public/**  
 – 정적 파일 (예: favicon, 이미지 등)  
- **styles/**  
 – 스타일 파일 (CSS 등)  
- **node_modules/**  
 – npm 패키지 (의존성)  
- **.gitignore, .gitattributes, README.md**  
 – git 설정 및 문서

## API 엔드포인트

### POST /api/upload

- **Content-Type:** multipart/form-data  
- **Request Body:**  
 – image: (File) 업로드할 이미지 파일 (최대 5MB)  
- **Response (성공):**  
 – { "success": true, "imageUrl": "https://bucket-name.s3.ap-northeast-2.amazonaws.com/images/1234567890-example.webp" }  
- **Response (에러):**  
 – 400: { "error": "이미지 파일이 필요합니다." } 또는 { "error": "파일 크기는 5MB를 초과할 수 없습니다." }  
 – 500: { "error": "이미지 업로드 중 에러가 발생했습니다." } (또는 구체적인 에러 메시지)

## 사용법

1. 프로젝트를 클론한 후, 의존성을 설치합니다.  
  npm install  
2. 환경 변수 (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET 등)를 설정합니다.  
  (예: .env.local 파일에 추가)  
3. 개발 서버를 실행합니다.  
  npm run dev  
4. (예시) curl 또는 Postman 등으로 POST /api/upload에 multipart/form-data로 이미지 파일을 전송하여 테스트합니다.

## 의존성 및 설치

- Node.js (v14 이상)  
- npm (v6 이상)  
- Next.js (v12 이상)  
- TypeScript (v4 이상)  
- AWS SDK (S3)  
- sharp (이미지 처리)  
- ESLint (코드 린팅)  
- 기타 (package.json 참고)

## 기타 참고 사항

- 글에서 크기를 정해서 보낸 이미지 파일은, convertToWebP 함수에서 고정 크기(width, height) 옵션을 제거하여 원본 크기를 유지합니다.  
- AWS S3 업로드 시, 버킷 및 폴더(기본값: "images")는 환경 변수 또는 옵션으로 설정할 수 있습니다.  
- 에러 처리 및 로깅은 app/utils/errors.ts에 정의된 에러 클래스를 사용합니다.
