# 모자이크 쇼핑 PWA - TECH_DEBT.md

**저장소**: `mosaic-shopping-pwa` (Public)
**최종 갱신**: 2026-05-01 (트랙 SEO + Brand Verification 완료)
**관련 문서**:
- PC TECH_DEBT.md — 공통 자원 (Supabase 스키마, supabase-sync.js, sidepanel.js 등)
- TRACK_C_RETROSPECT.md — 트랙 C 12 catch 회고 (영구 보존)

---

## 우선순위 표시
- 🔴 심각 — verification 영향 / 즉시 처리
- 🟠 높음 — Phase 2 진입 시 첫 작업
- 🟡 중간 — Phase 2 진행 중 처리
- 🟢 낮음 — 후순위 / 사용 패턴 보고 결정

---

## 🟠 높음

### 푸시 알림 클라이언트 구현 ⭐⭐
**참조**: PC TECH_DEBT.md의 동일 항목 (백엔드 측). 양쪽 같이 작업.

**클라이언트 작업**:
1. **Service Worker** (`public/sw.js` 또는 vite-plugin-pwa 활용):
   - `push` 이벤트 핸들러
   - 알림 표시 (제목 + 본문 + 아이콘)
2. **알림 권한 UI** (settings 화면 또는 onboarding):
   - "목표가 달성 시 알림 받기" 토글
   - `Notification.requestPermission()` 호출
   - PushSubscription을 Supabase user_settings 또는 별도 테이블에 저장
3. **푸시 클릭 핸들링**:
   - 해당 북마크 그룹으로 navigate
   - URL: `/bookmarks?group=GROUP_ID`
4. **Capacitor 통합** (Phase 2 native 빌드):
   - `@capacitor/push-notifications` 플러그인
   - APNs/FCM token 등록 → Supabase
   - native 앱 백그라운드/종료 상태에서도 푸시

**시나리오 가치**:
- 목표가 달성 ⭐⭐ (사용자 모르는 사이 발생)
- 최저가 갱신 ⭐⭐
- 솔드아웃 감지 ⭐

**우선순위 메모**: Phase 2 진입 후 양방향 sync 작업과 묶어서 첫 작업.

---

## 🟡 중간

### deprecated 디자인 토큰 정리
**위치**: `src/index.css` `@theme` 블록

v0 시대 alias 9개 잔존:
- `--color-mosaic-muted` → `text-muted`
- `--color-mosaic-muted-2` → `text-label`
- `--color-mosaic-muted-3` → `text-soft`
- `--color-mosaic-line-2` → `line-strong`
- `--color-mosaic-hover-bg` → `surface-hover`
- `--color-mosaic-min-bg` → `accent-bg`
- `--color-mosaic-min-text` → `accent`
- `--color-mosaic-target-bg` → `success-bg`
- `--color-mosaic-target-text` → `success`

**현재**: 컴포넌트는 이미 canonical 토큰 사용 중. deprecated alias 미사용 가능성 높음.

**작업**:
1. 전체 src grep으로 deprecated alias 사용처 검색
2. 미사용 확인 시 `@theme` 블록에서 제거
3. 사용처 있으면 canonical 토큰으로 마이그레이션

---

### PWA에 BookmarkContext 미존재 — meta에서 bmCount/mode 생략
PC와 분석 데이터 차이. Phase 2 또는 BookmarkContext 도입 시 정합.

---

### iOS Tailwind purge 가설 미검증
- safe-top class 정상 정의되어 있어 purge 사실 의심
- inline fallback이 working인 진짜 원인 = box-sizing 또는 다른 부수효과 가능성
- Phase 2 디버그: iOS prod 빌드 inspect 시 검증

---

### PWA SEO 인덱싱 효과 측정
sitemap.xml Search Console 제출 후 1주 시점에 노출/클릭 통계 확인. 효과 미미하면 페이지 콘텐츠 보강 또는 외부 백링크 전략 검토.

---

## 🟢 낮음

### visibilitychange 백그라운드 invalidate
**위치**: `src/lib/mallFilters.js`, `src/lib/eventMalls.js`, `src/lib/searchMalls.js`

**현재**: 페이지 진입 (탭 클릭) 시점만 fresh fetch trigger. in-flight Promise 공유.

**한계 시나리오**:
1. PWA 같은 페이지 (예: 검색) 열어둔 상태로 백그라운드
2. PC에서 mall 추가 또는 mall 토글
3. PWA 다시 포그라운드 (앱 스위처에서 복귀)
4. 같은 페이지 안에 머물면 stale 가능 (탭 클릭 안 했으니 trigger X)

**해결**: `document.visibilitychange` `visible` 전환 시 mall data + user_settings 재fetch.

**우선순위 메모**: 실제 사용 패턴 보고 결정.

---

### PWA_VERSION 하드코딩
**위치**: `src/lib/feedback.js`
**현재 값**: `"0.4.0"` (실제 배포는 v0.5.0)

Phase 2: `vite.config.js`의 `define`으로 빌드 시 자동 주입.

---

### alert로 toast 대체
**위치**: `FeedbackModal`

단순 native alert. Phase 2: 표준 toast component 도입 (mosaic 디자인 톤).

---

### ExternalLinkModal.jsx dead component
트리거 없이 살아있음. 향후 외부 링크 안내 필요 시 1줄로 복원 가능. 제거 vs 보존 결정 필요.

---

### canonical redirect 검증 미완
`www.mosaicshopping.com` → apex(`mosaicshopping.com`) 자동 리다이렉트 동작 미검증. Vercel 도메인 설정에서 확인 필요.

---

### OG 이미지 Twitter Card 미리보기 미검증
카카오톡 미리보기는 검증 완료. X(트위터) 활용 시 별도 검증 필요 (Twitter Card Validator).

---

### Authorized domains의 `chromiumapp.org` 정리
GCP OAuth 브랜딩의 승인된 도메인에 등록되어 있음. 현재 brand verification에 무해이지만, 향후 검토 라운드에서 "본인 소유 아님"으로 잡힐 가능성. 검토 통과 확정 후 정리 결정.

---

## 부채 관리 정책

**감사 주기**: 트랙 마무리 시 + Phase 2 진입 시 + 6개월 1회.

**우선순위 재평가**: Phase 1 → Phase 2 전환 + verification 통과 후 사용자 피드백 반영.

**해소 처리 절차**:
1. 해소된 항목은 우선 "✅ 해소 완료 (날짜)" 표시
2. 해당 트랙의 CHANGELOG 항목 추가
3. 1~2개월 후 본 파일에서 제거 (이력은 git history + CHANGELOG로 보존)

**트랙 회고 이관**: 트랙 종료 시점의 작업 정리/회고는 별도 `.md` 파일로 분리 (예: `TRACK_C_RETROSPECT.md`). 본 TECH_DEBT는 미해소 부채만 유지.
