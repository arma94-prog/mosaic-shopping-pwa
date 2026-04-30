# PWA fix v6 — PC sidepanel.css 톤 매칭 + UI 다듬기

## 변경 4가지

### 1. PC 색상 정확 매칭 (사용자 요청)

PC `sidepanel.css` 직접 검증으로 발견한 차이 정정:

| 토큰/컴포넌트 | PC 실제 | PWA 이전 | PWA 변경 후 |
|---|---|---|---|
| 카테고리 레이블 색 (.lbl) | `#9F9F9F` | `#8A8A8A` | `#9F9F9F` ✅ |
| 검색바 border (.sb) | `#E5E1D3` | `#EFECE3` | `#E5E1D3` ✅ |
| 검색바 placeholder | `#A8A699` | `#8A8A8A` | `#A8A699` ✅ |
| 검색바 focus 그림자 | 있음 | 없음 | `0 0 0 2px rgba(232,118,43,0.12)` ✅ |
| body bg / text / line / accent | 동일 | 동일 | 변경 없음 ✅ |

신규 토큰 (향후 hover 효과용):
- `--color-mosaic-accent-dark` (#D66521)
- `--color-mosaic-hover-bg` (#F1EFE8)

### 2. 카테고리 레이블 위아래 여백 4px씩 축소

| 위치 | 이전 | 이후 |
|---|---|---|
| section margin-top (위) | `mt-2.5` (10px) | `mt-1.5` (6px) — 4px 감소 |
| CategoryHeader padding-bottom (아래) | `pb-2` (8px) | `pb-1` (4px) — 4px 감소 |

### 3. 맨 위 "검색어" 카운트 타이틀 제거

검색바와 정보 중복이라 제거. 대신 `pt-3`으로 헤더와 첫 카테고리 간 적정 여백 유지.

### 4. 모자이크 쇼핑 로고 실제 PNG로 교체

- 4분할 placeholder 제거
- `src/assets/icon128.png` (사용자 첨부) 사용
- Vite 빌드 시 hashing되어 캐싱 효율적

## 변경 파일 (4개 + 1 asset)

| 파일 | 변경 |
|---|---|
| `src/index.css` | 토큰 색상 정정 + 신규 토큰 |
| `src/components/Header.jsx` | 4분할 placeholder → PNG 로고 |
| `src/components/SearchBar.jsx` | border/placeholder/focus 그림자 PC 매칭 |
| `src/components/SearchResults.jsx` | 타이틀 제거 + 카테고리 여백 축소 |
| `src/assets/icon128.png` (신규) | 사용자 첨부 로고 |

## 적용

1. zip 풀어서 폴더 구조 그대로 덮어쓰기 (assets 폴더가 없으면 자동 생성됨)
2. **dev 서버 재시작 권장** — 신규 import (icon128.png) + 신규 디자인 토큰이라 HMR로 반영 안 될 수 있음

```
Ctrl+C → npm run dev
```

3. 검증:
   - 헤더 좌측에 실제 모자이크 로고 (3x3 오렌지톤) 표시
   - 검색바 입력창 border가 살짝 더 진해진 톤
   - 검색바 클릭 시 오렌지 그림자 ring 표시
   - 검색 결과 화면이 더 컴팩트
   - 검색어 카운트 타이틀 사라짐
   - 카테고리 헤더 색이 살짝 더 연해진 (#9F9F9F)

## 가드 룰 #3 적용 사례

이번 fix는 **PC sidepanel.css를 직접 보고** 정확한 색상 추출 후 적용했습니다. 이전처럼 메모리 추정으로 가는 게 아니라.

발견 — 메모리 등록된 색상 일부가 부정확했음:
- `--color-mosaic-muted-2: #8A8A8A` (메모리) → 실제 `#9F9F9F`
- 검색바 border 톤도 line vs line-2 잘못 매핑
- focus 그림자 누락

이걸 메모리 #18 ("코드 fix 회고 룰")의 보강 사례로 등록할 가치 있음. 커밋 시점에 정리.

## 다음 단계

검증 완료되면 알려주세요. **세션 3 (북마크) 진입** 합니다.

> 💡 추가 미세조정 후보 (사용자 보고 결정):
> - 카테고리 헤더 색이 너무 연해 보이면 → muted-2를 다시 진하게 또는 muted (#6B6B6B)로 변경
> - 검색바 focus 그림자가 너무 강하면 → opacity 0.12 → 0.08
> - 로고 크기 7x7이 작아 보이면 → 8x8 또는 9x9로 확대
