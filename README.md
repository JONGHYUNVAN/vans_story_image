# Vans DevBlog Image API Route

이 프로젝트는 Next.js 기반의 API 서버로, 이미지 업로드 및 AWS S3 저장 기능을 제공합니다.  
클라이언트에서 전송한 이미지 파일을 WebP 형식으로 변환한 후, AWS S3에 업로드하여 이미지 URL을 반환합니다.

## 프로젝트 구조

```
vans_devblog_image/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts           # POST /api/upload 엔드포인트
│   └── utils/
│       ├── errors.ts              # 커스텀 에러 클래스 정의
│       ├── s3Uploader.ts          # AWS S3 업로드 유틸리티
│       └── webpConverter.ts       # WebP 변환 및 메타데이터 추출
├── docs/                          # TypeDoc 생성 문서
├── public/                        # 정적 파일
├── styles/                        # 스타일 파일
├── eslint.config.mjs              # ESLint 설정
├── jsdoc.config.json              # JSDoc 설정 (미사용)
├── next.config.ts                 # Next.js 설정
├── next-env.d.ts                  # Next.js 타입 선언
├── package.json                   # npm 의존성 및 스크립트
├── tsconfig.json                  # TypeScript 설정
├── typedoc.json                   # TypeDoc 문서화 설정
└── README.md                      # 프로젝트 문서
```

## 주요 기능

### 이미지 처리
- **WebP 변환**: Sharp 라이브러리를 사용하여 이미지를 WebP 형식으로 변환
- **품질 설정**: 기본 80%, API 업로드 시 85% 품질 사용
- **크기 옵션**: 원본 크기 유지 또는 사용자 지정 크기로 리사이징
- **메타데이터 추출**: 이미지의 너비, 높이, 포맷, 색상 공간 정보 추출

### AWS S3 업로드
- **멀티파트 업로드**: 대용량 파일도 안정적으로 업로드
- **고유 파일명**: 타임스탬프 기반 중복 방지 파일명 생성
- **폴더 구조**: `images/` 폴더에 체계적으로 저장
- **Content-Type 자동 설정**: WebP MIME 타입 자동 적용

### 에러 처리
- **ImageProcessingError**: 이미지 변환 관련 에러 (26가지 세부 상황)
- **S3UploadError**: AWS S3 업로드 관련 에러 (9가지 세부 상황)  
- **ValidationError**: 입력값 검증 관련 에러 (9가지 세부 상황)

## API 엔드포인트

### POST /api/upload

이미지 파일을 WebP로 변환하여 S3에 업로드하고 URL을 반환합니다.

#### 요청
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `image`: 업로드할 이미지 파일 (최대 5MB)
  - 지원 형식: JPEG, PNG, GIF, WebP, TIFF, AVIF

#### 응답

**성공 (200)**
```json
{
  "success": true,
  "imageUrl": "https://bucket-name.s3.ap-northeast-2.amazonaws.com/images/1734567890123-example.webp"
}
```

**클라이언트 에러 (400)**
```json
{
  "error": "이미지 파일이 필요합니다."
}
```
```json
{
  "error": "파일 크기는 5MB를 초과할 수 없습니다."
}
```

**서버 에러 (500)**
```json
{
  "error": "이미지 처리 오류: 지원하지 않는 이미지 형식입니다."
}
```
```json
{
  "error": "S3 업로드 오류: AWS 인증에 실패했습니다."
}
```

## 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# AWS S3 설정
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your-bucket-name

# Next.js 설정 (선택사항)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 빌드
```bash
npm run build
npm start
```

### 4. 문서 생성
```bash
npm run docs
```

## 주요 의존성

### 프로덕션 의존성
- **Next.js 15.3.1**: React 기반 풀스택 프레임워크
- **React 19.0.0**: UI 라이브러리  
- **Sharp 0.34.1**: 고성능 이미지 처리 라이브러리
- **AWS SDK 3.803.0**: S3 클라이언트 및 요청 서명
- **Multer 1.4.5**: 멀티파트 파일 업로드 처리
- **Next-Connect 1.0.0**: Next.js 미들웨어 연결

### 개발 의존성
- **TypeScript 5**: 정적 타입 검사
- **ESLint 9**: 코드 품질 검사
- **TypeDoc 0.28.5**: API 문서 자동 생성
- **@types/*** : TypeScript 타입 정의

## 사용 예제

### cURL로 테스트
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@path/to/your/image.jpg" \
  -H "Content-Type: multipart/form-data"
```

### JavaScript (Fetch API)
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('업로드 성공:', result.imageUrl);
} else {
  console.error('업로드 실패:', result.error);
}
```

## WebP 변환 옵션

### 품질 설정 가이드
- **90-100%**: 최고 품질 (포트폴리오, 아트워크)
- **80-90%**: 고품질 (일반 웹사이트 이미지)  
- **70-80%**: 균형 (블로그, 상품 이미지)
- **50-70%**: 압축 우선 (썸네일, 아이콘)

### 지원하는 변환 옵션
- `quality`: 1-100 (기본값: 80)
- `width`: 출력 너비 (선택사항)
- `height`: 출력 높이 (선택사항)  
- `preserveMetadata`: 메타데이터 보존 여부 (기본값: false)

## 에러 처리

### 주요 에러 유형
1. **ImageProcessingError**: 이미지 변환 실패, 지원하지 않는 형식, 메모리 부족 등
2. **S3UploadError**: AWS 인증 실패, 네트워크 오류, 권한 부족 등
3. **ValidationError**: 필수 필드 누락, 파일 크기 초과, 잘못된 형식 등
