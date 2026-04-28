# 모자이크 쇼핑 PWA (Phase 1)

PC Chrome 확장에서 저장한 북마크와 가격 알림을 **모바일에서 read-only로 확인**하기 위한 PWA.

- **기술 스택**: React 19 + Vite 6 + Tailwind 4 + react-router-dom 7 + @supabase/supabase-js v2
- **호스팅**: Vercel (자동 HTTPS, GitHub push 기반 자동 배포)
- **인증**: Supabase Auth + Google OAuth (PKCE flow)
- **데이터**: Supabase 직접 read (RLS로 사용자별 격리)

---

## 📁 디렉토리 구조

```
mosaic-shopping-pwa/
├── public/                       # 정적 자산 (PWA 아이콘 포함)
│   ├── favicon.svg
│   ├── icon-192.png             # PWA 표준 (대체 아이콘 권장)
│   └── icon-512.png             # PWA 표준 (대체 아이콘 권장)
├── src/
│   ├── components/
│   │   ├── AppShell.jsx         # 헤더 + 메인 + 하단 탭 레이아웃
│   │   ├── AuthGate.jsx         # 로그인 화면 / 인증 가드
│   │   ├── BottomNav.jsx        # 하단 탭바 (4개 화면)
│   │   └── LoadingScreen.jsx
│   ├── lib/
│   │   ├── auth.jsx             # AuthProvider, useAuth 훅
│   │   └── supabase.js          # Supabase 클라이언트 싱글톤
│   ├── pages/
│   │   ├── Events.jsx           # 이벤트 (+ RLS smoke test)
│   │   ├── Search.jsx           # 검색 (placeholder)
│   │   ├── Results.jsx          # 결과 (placeholder)
│   │   └── Bookmarks.jsx        # 북마크 (실데이터 첫 렌더)
│   ├── styles/
│   │   └── index.css            # Tailwind v4 + 디자인 토큰
│   ├── App.jsx                  # 라우터
│   └── main.jsx                 # React 진입점
├── .env.example                 # 환경변수 템플릿
├── .env.local                   # 실제 키 (git ignore)
├── .gitignore
├── index.html                   # HTML 진입점
├── package.json
├── vercel.json                  # SPA rewrites
└── vite.config.js               # Vite + Tailwind + PWA plugin
```

---

## 🚀 첫 세션 셋업 가이드 (Arma 단독 작업)

### Step 1. Node.js 설치 확인

이미 Chrome 확장 작업으로 설치되어 있을 가능성이 높습니다. 확인 방법:

1. **Win + R** → `cmd` 입력 → Enter
2. `node -v` 입력 → `v20.x` 또는 `v22.x` 출력되면 OK
3. 설치 안 되어 있으면 https://nodejs.org/ 에서 **LTS** 버전 다운로드 후 설치

### Step 2. 압축 풀기 + 의존성 설치

1. 받은 zip을 원하는 위치에 풀기. 권장 경로:
   ```
   C:\Users\신우영\GitHub\mosaic-shopping-pwa\
   ```
2. **GitHub Desktop**으로 이 폴더를 새 저장소로 추가:
   - File → **Add local repository...** → 위 경로 선택
   - "이 폴더는 git 저장소가 아닙니다" 경고 → **create a repository** 클릭
3. cmd에서 폴더 이동 + 설치:
   ```
   cd C:\Users\신우영\GitHub\mosaic-shopping-pwa
   npm install
   ```
   - 처음 한 번만 약 2~3분 걸림. `node_modules/` 폴더가 생김. (git에는 안 올라감)

### Step 3. 로컬 개발 서버 띄워서 확인

```
npm run dev
```

- 브라우저에서 http://localhost:5173 자동 열림 (또는 직접 입력)
- 처음 화면: **모자이크 쇼핑 로그인 화면**
- "Google로 계속하기" 클릭 → Google 로그인 → 자동으로 북마크 페이지로 이동
- 하단 탭에서 이벤트 / 검색 / 결과 / 북마크 전환 가능
- **이벤트 탭**에 "RLS read smoke test"가 표시되며, "N개 — 정상"이라고 뜨면 인증 + DB 연결 모두 OK
- 종료: cmd 창에서 **Ctrl+C** → Y

### Step 4. GitHub에 push

1. GitHub Desktop 열기 → 좌상단에 `mosaic-shopping-pwa` 저장소 선택되어 있는지 확인
2. **Publish repository** 버튼 클릭
   - 이름: `mosaic-shopping-pwa` (이미 만든 Public 저장소와 일치)
   - **"Keep this code private" 체크 해제** (Public이어야 함)
   - **Publish repository**
3. 좌하단 변경 파일 목록 → Summary 칸에 `Initial commit: PWA Phase 1 scaffold` 입력 → **Commit to main** → **Push origin**

> ⚠️ `.env.local` 파일은 .gitignore에 있어서 자동으로 제외됩니다. GitHub에 푸시되지 않으니 안심.

### Step 5. Vercel에 import + 배포

1. https://vercel.com/dashboard 접속 → **Add New...** → **Project**
2. `mosaic-shopping-pwa` 저장소 옆 **Import** 클릭
3. **Configure Project** 화면:
   - Framework Preset: **Vite** (자동 감지됨)
   - Build Command: `npm run build` (기본값 OK)
   - Output Directory: `dist` (기본값 OK)
4. **Environment Variables** 섹션 펼치기 → 아래 2개 추가:
   - Name: `VITE_SUPABASE_URL` / Value: `https://rzkcizrwqystcbikrnia.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY` / Value: (.env.local 파일의 값 복사)
   - Environments: **Production / Preview / Development 모두 체크**
5. **Deploy** 클릭 → 약 1~2분 후 배포 완료
6. 배포된 URL 확인 (예: `https://mosaic-shopping-pwa.vercel.app`)

### Step 6. Supabase + Google OAuth redirect URL 재확인

- Vercel 실제 배포 URL이 사전 작업에서 등록한 `https://mosaic-shopping-pwa.vercel.app/**` 와 일치하면 추가 작업 없음
- 다르게 나왔으면 (예: `-arma94-prog.vercel.app` suffix가 붙은 경우):
  1. **Supabase** → Authentication → URL Configuration → Redirect URLs에 실제 URL 추가
  2. Google Cloud Console에는 추가 작업 불필요 (Supabase callback URL만 등록되어 있으면 됨)

### Step 7. 모바일에서 PWA 테스트

1. 안드로이드 폰 Chrome에서 배포 URL 접속
2. 우측 상단 ⋮ → **앱 설치** 또는 **홈 화면에 추가**
3. 설치된 앱 아이콘 탭 → standalone 모드로 실행
4. Google 로그인 → 북마크 페이지 정상 렌더 확인

---

## 🔍 첫 세션 검증 체크리스트

Arma가 직접 확인할 항목:

- [ ] `npm install` 무사 통과
- [ ] `npm run dev` → http://localhost:5173 로그인 화면 정상
- [ ] Google 로그인 1회 성공 (PC Chrome 확장과 같은 계정)
- [ ] 이벤트 탭의 RLS smoke test "정상" 표시
- [ ] 북마크 탭에 PC에서 만든 그룹들이 나타남 (개수가 PC와 일치)
- [ ] 로그아웃 → 다시 로그인 사이클 정상
- [ ] GitHub Desktop으로 push 성공
- [ ] Vercel 배포 성공 + 배포 URL에서 동일 흐름 정상
- [ ] 모바일 Chrome에서 PWA 설치 성공 + standalone 실행 정상

---

## 🛠️ Phase 1 다음 단계 (다음 세션 이후)

- 이벤트 페이지: `events.json` fetch + 카드 리스트
- 검색 페이지: 검색 입력 + 핀 고정 키워드 + 최근 검색
- 결과 페이지: 쇼핑몰별 결과 + **북마크 항목만** 쿠팡 어필리에이트
- 북마크 페이지: 그룹 클릭 → 그룹 내 bookmarks 상세 + 가격 + last_synced 표시
- 가격 갱신 정책 안내 배너 ("PC에서 자동 갱신됩니다")

---

## ⚠️ 주의사항

- **`.env.local`은 절대 commit하지 말 것** (자동으로 gitignore되지만 한 번 더 확인)
- **Service Role Key는 PWA에 절대 두지 않음** (Edge Function 환경변수 전용)
- **Phase 1 = read-only** — 모바일에서 북마크 추가/수정/삭제 X. Phase 2에서 정합성 모델 정리 후.
- **PC 확장과 같은 Google 계정**으로 로그인해야 데이터가 보임
- **다중 디바이스 정합성**은 Phase 2 작업 — Phase 1은 PC → 모바일 단방향 mirror 그대로
