# Temple of Light - 향후 개발 및 보안 고도화 계획 (Implementation Plan)

전달해주신 `웹개발절대유의할것.txt`와 `불교웹.docx`의 내용을 완벽히 숙지했습니다. 
현재 구현된 `temple-of-light` (Next.js + Supabase + Gemini RAG) 앱을 기반으로, **보안성을 극대화하고 과금 체계를 도입하며 이전에 발견한 치명적 버그를 수정**하기 위한 구체적인 진행 계획을 제안합니다.

## ⚠️ User Review Required (중요 논의 사항)

> [!TIP]
> **회원가입 기반(Auth) 토큰 및 소원 관리 방식 확정**
> 비회원이 원칙이 아니라는 점에 전적으로 동의합니다. 'Wish Roof(소원 지붕)'에 남긴 내 소원 관리, 결제 내역 추적, 토큰(대화권) 잔액 관리를 위해서는 **회원가입 시스템이 필수적이며 훨씬 안정적**입니다.
> 
> **진행 방식**:
> 1. 이미 `temple-of-light`에 기본 뼈대가 있는 **Next-Auth (또는 Supabase Auth)**를 활용하여 구글/이메일 소셜 로그인을 제공합니다.
> 2. 유저가 결제 시 레몬스퀴지/토스가 이메일(또는 유저 ID)을 백엔드로 보내주면, DB(`user_limits` 테이블)의 해당 회원 토큰을 충전해 줍니다.
> 3. 소원을 남길 때도 회원 ID와 연동되어 본인의 소원을 나중에 모아보거나 관리(수정/삭제)할 수 있습니다.

> [!WARNING]
> **Cloudflare Pages 호환성 (Edge Runtime)**
> Next.js 앱을 Cloudflare Pages로 배포하려면, 백엔드 API(App Router)가 Node.js 환경이 아닌 **Edge Runtime**에서 동작해야 합니다. 현재 사용 중인 라이브러리(Supabase 클라이언트 등)가 Edge 환경과 호환되도록 일부 코드 조정이 필수적입니다.

---

## 🛠️ Proposed Changes (단계별 진행 계획)

### 1단계: 크리티컬 버그 수정 및 AI 모델 최적화 (가장 먼저 진행)
이전에 발견된 검색 증강 생성(RAG) 버그를 고치고 AI 모델을 최적화하며, 치명적인 UI 버그를 함께 수정합니다.

*   **[MODIFY]** `supabase_schema.sql`
    *   `scriptures` 테이블의 `vector(1536)`을 `vector(768)`로 변경하여 Gemini 임베딩 차원수와 일치시킵니다.
*   **[MODIFY]** `lib/chat.ts` & `app/api/chat/route.ts`
    *   임베딩 모델을 구형(gemini-embedding-001)에서 최신 권장 모델인 `text-embedding-004`로 업그레이드합니다.
    *   채팅 모델 역시 `gemini-2.5-flash` (또는 2.0 flash)로 명시적으로 업데이트합니다.
*   **[MODIFY]** `app/globals.css` 및 Navigation 컴포넌트
    *   **모바일 네비게이션 단절 버그 수정**: 모바일 해상도에서 메뉴(`display: none`)가 사라지는 현상을 고치고 햄버거 메뉴를 적용합니다.

### 2단계: 회원 기반 인증(Auth) 및 Cloudflare Pages 배포 준비
소원 기록과 결제 관리를 위한 회원가입 연동 및 클라우드플레어 배포를 준비합니다.

*   **[MODIFY]** `auth.ts` 및 API Routes (`app/api/...`)
    *   Next-Auth(Auth.js) 소셜 로그인을 활성화하고, 회원가입 시 Supabase DB에 유저 정보를 자동 연동합니다.
    *   모든 민감한 로직(DB 접근, Gemini API 호출)이 Edge Runtime에서 안전하게 동작하도록 `export const runtime = 'edge';`를 적용합니다.
*   **[NEW]** Cloudflare 설정 (`wrangler.toml` 등)
    *   Cloudflare Pages 배포를 위한 `@cloudflare/next-on-pages` 세팅을 추가합니다.
    *   API Key 등은 로컬 소스에 남기지 않고, Cloudflare 대시보드의 Environment Secrets로 완전히 이관할 준비를 합니다.

### 3단계: 결제(레몬스퀴지/토스) 기반 토큰 차감 시스템 구축
무료 API 제공을 원천 차단하고 결제된 토큰만큼만 대화할 수 있는 과금 시스템을 만듭니다.

*   **[NEW]** `app/api/webhooks/lemonsqueezy/route.ts` (해외 결제)
*   **[NEW]** `app/api/webhooks/portone/route.ts` (국내 결제)
    *   결제 성공 시 Webhook을 받아 검증(Signature 검증)한 후, DB의 해당 회원 토큰(대화권)을 충전합니다.
*   **[MODIFY]** `app/api/chat/route.ts`
    *   **1차 방어**: 로그인된 회원의 토큰 잔액이 0보다 큰지 DB에서 먼저 확인합니다.
    *   **2차 방어**: 토큰이 충분할 때만 Gemini API를 호출합니다.
    *   **3차 방어**: 응답을 받은 후, Gemini의 `usageMetadata` (실제 소모된 토큰 수)를 기반으로 DB의 잔액을 정확히 차감합니다.

### 4단계: 법적 방어 장치 추가
문서에 기재된 AI 고지 의무를 프론트엔드에 적용하여 법적 분쟁을 미연에 방지합니다.

*   **[MODIFY]** `app/[locale]/chat/page.tsx` 등 채팅 UI
    *   **법적 분쟁 방지 고지**: "본 대화는 사람이 아닌 AI 에이전트와의 대화입니다."라는 문구를 채팅창 하단에 명확히 표기합니다.

### 5단계: 보안 방어막(WAF) 및 요금 폭탄 방지 설정 가이드
개발이 아닌 인프라 설정 단계입니다. 완벽한 가이드를 제공하여 직접 설정하시도록 돕습니다.

*   **Cloudflare WAF (Rate Limiting) 설정**: 동일 IP에서 1초에 여러 번 API를 치지 못하도록 방어벽을 세웁니다.
*   **Google Cloud 프로젝트 분리**: 
    1. 개발용 프로젝트 (예산 $20 - 구글 안티그래비티, 비디오 생성 테스트용)
    2. 서비스용 프로젝트 (예산 $30 - 템플 오브 라이트 유저 대화용, Pay-As-You-Go 및 Monthly limit 적용)
    위 두 가지를 분리하는 구체적인 설정 가이드를 문서화하여 제공합니다.

---

## 🧪 Verification Plan (검증 계획)

### Automated/Manual Tests
*   **DB 차원 테스트**: 768 차원 벡터가 정상적으로 Insert 되고, 유사도 검색(Vector Search)이 에러 없이 결과를 반환하는지 테스트.
*   **회원 인증 테스트**: 구글 소셜 로그인 성공 여부 및 로그인 시에만 소원 작성/채팅이 가능한지 검증.
*   **Edge Runtime 테스트**: 로컬에서 `wrangler pages dev` 명령어를 통해 Cloudflare 엣지 환경과 동일하게 API가 동작하는지 검증.
*   **Webhook & 토큰 차감 테스트**: 레몬스퀴지 테스트 모드를 활용하여 결제 시 회원의 토큰이 충전되고, 대화 1회 시 응답(`usageMetadata`)만큼 정확히 차감되는지 확인.
