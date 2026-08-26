# Temple of Light — Cloudflare & Google Cloud Setup Guide

## 1. Cloudflare Pages 배포 (최초 1회)

```bash
# 1. @cloudflare/next-on-pages 설치
npm install -D @cloudflare/next-on-pages wrangler

# 2. 빌드 테스트 (로컬)
npx @cloudflare/next-on-pages

# 3. 배포
npx wrangler pages deploy .vercel/output/static
```

또는 **Cloudflare Dashboard** → Pages → Connect to Git → GitHub 저장소 연결 후 자동 배포 설정.

---

## 2. Cloudflare Dashboard — Environment Variables 등록

**Pages → temple-of-light → Settings → Environment Variables** 에서 아래 항목을 **Encrypted** 타입으로 등록:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google AI Studio에서 발급 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (⚠️ 절대 공개 금지) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 로 생성 |
| `GOOGLE_CLIENT_ID` | Google Cloud Console OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console OAuth 2.0 Client Secret |
| `ADMIN_EMAILS` | 관리자 이메일 (콤마 구분) |
| `NEXT_PUBLIC_ADMIN_EMAILS` | 동일 (클라이언트 노출 가능) |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Lemon Squeezy 대시보드의 Webhook Secret |
| `LEMONSQUEEZY_PRODUCT_ID_20` | 연꽃 20송이 상품 Product ID |
| `LEMONSQUEEZY_PRODUCT_ID_60` | 연꽃 60송이 상품 Product ID |
| `NEXT_PUBLIC_LEMONSQUEEZY_STORE_URL` | 결제 페이지 URL |

---

## 3. Cloudflare WAF Rate Limiting (⭐ 요금 폭탄 방지 핵심)

**Cloudflare Dashboard → Security → WAF → Rate Limiting Rules**

### Rule 1: Chat API 보호
- **이름**: Protect Chat API
- **Expression**: `http.request.uri.path eq "/api/chat"`
- **Rate**: 분당 10회 초과 시 차단
- **Action**: Block (429 반환)
- **Period**: 1 minute

### Rule 2: eBook API 보호
- **이름**: Protect eBook API
- **Expression**: `http.request.uri.path eq "/api/ebook"`
- **Rate**: 분당 3회 초과 시 차단
- **Action**: Block
- **Period**: 1 minute

### Rule 3: Webhook 엔드포인트 화이트리스트
- **이름**: Allow Lemon Squeezy Webhook
- **Expression**: `http.request.uri.path eq "/api/webhooks/lemonsqueezy" and ip.src in {141.193.213.0/24}`
- **Action**: Skip (WAF 우회 허용)

> Lemon Squeezy IP 대역은 공식 문서에서 확인: https://docs.lemonsqueezy.com/help/webhooks

---

## 4. Google Cloud Console — 월간 예산 한도 설정 (⭐ 필수)

1. **Google Cloud Console** → Billing → Budgets & Alerts
2. **서비스용 프로젝트** (Temple of Light 전용)에 예산 생성:
   - Budget amount: **$30/월**
   - Alert thresholds: 50%, 90%, 100%
   - Alert action: 이메일 알림 + **API 자동 비활성화** 체크

> 별도 개발용 프로젝트 (AntiGravity, 영상 생성 등)는 **$20 예산**으로 별도 설정.

---

## 5. Supabase — 신규 컬럼 추가 (최초 1회)

Supabase Dashboard → SQL Editor에서 실행:

```sql
-- 연꽃 크레딧 컬럼 추가 (이미 user_limits 테이블이 있는 경우)
ALTER TABLE user_limits ADD COLUMN IF NOT EXISTS lotus_count INTEGER DEFAULT 0;

-- 웹훅 중복 방지 테이블
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT,
  processed_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Lemon Squeezy 상품 등록

1. **Lemon Squeezy Dashboard** → Products → Add Product
2. 상품 정보:
   - 이름: `Temple Chat Credits — 🪷 20 Lotus Petals`
   - 설명: `Grants 20 lotus petals for conversations with the Guru or Wisdom Story creation.`
   - 가격: `$2.99`
   - 파일 첨부: **없음** (디지털 서비스 이용권)
3. Product ID를 복사해서 Cloudflare 환경변수 `LEMONSQUEEZY_PRODUCT_ID_20`에 등록
4. 동일하게 60송이 패키지도 등록

### Webhook 설정
- **Lemon Squeezy Dashboard** → Settings → Webhooks → Add webhook
- URL: `https://your-domain.pages.dev/api/webhooks/lemonsqueezy`
- Events: `order_created` 체크
- Secret: 임의 강력한 문자열 생성 후 Cloudflare 환경변수 `LEMONSQUEEZY_WEBHOOK_SECRET`에 동일하게 등록
