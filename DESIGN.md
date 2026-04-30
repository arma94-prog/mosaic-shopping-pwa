# 모자이크 쇼핑 PWA — 디자인 시스템 가이드

> **Single Source of Truth (SOT)**.  
> 이 문서가 PWA 시각/UX의 기준. 새 화면/컴포넌트 추가 시 반드시 참조.  
> PC `sidepanel.css`와 1:1 정합성을 우선으로 함 — "PC와 동일한 서비스 경험".

---

## 1. 핵심 원칙

1. **Seamless** — PC와 PWA는 같은 product. 시각/UX/정책이 1:1 정합성을 가짐.
2. **Single SOT** — 색은 토큰, 패턴은 컴포넌트. 임의값(ad-hoc) 사용 금지.
3. **PC가 capture, PWA가 view** — PWA Phase 1은 PC 데이터의 모바일 친화적 조회 앱.
4. **PC가 진실 소스** — 데이터, 정렬, 정책 결정은 PC 행동을 미러링.

---

## 2. 색상 토큰

PC `sidepanel.css` 사용 빈도 + 의미 분류 결과.

### 2.1 Surfaces (배경)

| 토큰 | 색 | 용도 |
|---|---|---|
| `bg-mosaic-bg` | `#FAFAF7` | 본문 배경 (warm off-white) |
| `bg-mosaic-surface` | `#FFFFFF` | 카드, 헤더, 입력창 배경 |
| `bg-mosaic-surface-hover` | `#F1EFE8` | hover/active 시 배경 |
| `bg-mosaic-surface-pill` | `#F0EFEA` | 회색 배지(default Pill) 배경 |

### 2.2 Text

| 토큰 | 색 | 용도 |
|---|---|---|
| `text-mosaic-text` | `#1A1A1A` | 본문 primary 텍스트 |
| `text-mosaic-text-content` | `#555555` | 상품 제목 등 콘텐츠 텍스트 |
| `text-mosaic-text-muted` | `#6B6B6B` | 부가 정보 (가격, 시간 등) |
| `text-mosaic-text-soft` | `#A8A699` | caption, placeholder, 마지막 확인 시간 |
| `text-mosaic-text-label` | `#9F9F9F` | **카테고리 레이블 전용** (PC `.lbl` 매핑) |
| `text-mosaic-text-disabled` | `#C8C4B5` | 핀 비활성, 미설정 등 |

### 2.3 Lines

| 토큰 | 색 | 용도 |
|---|---|---|
| `border-mosaic-line` | `#EFECE3` | 기본 구분선 (헤더/하단) |
| `border-mosaic-line-soft` | `#F5F3EC` | 약한 구분선 (mall 행 사이) |
| `border-mosaic-line-strong` | `#E5E1D3` | input border, hover border |
| `border-mosaic-line-input` | `#D4D0C4` | 강조 input border |
| `border-mosaic-line-card` | `#E0DCCE` | 그룹 카드 border |

### 2.4 Accent (오렌지)

| 토큰 | 색 | 용도 |
|---|---|---|
| `text-mosaic-accent` | `#E8762B` | 액센트 텍스트 (활성 아이콘, 핀 on) |
| `bg-mosaic-accent` | `#E8762B` | 액센트 배경 (드물게) |
| `text-mosaic-accent-dark` | `#D66521` | hover 시 |
| `bg-mosaic-accent-bg` | `#FBE8D9` | 최저가 배지 배경 |

### 2.5 Success (목표가 달성)

| 토큰 | 색 | 용도 |
|---|---|---|
| `text-mosaic-success` | `#0F6E56` | 달성 배지 텍스트 |
| `bg-mosaic-success-bg` | `#E1F5EE` | 달성 배지 배경 |

### 2.6 Danger

| 토큰 | 색 | 용도 |
|---|---|---|
| `text-mosaic-danger` | `#E74C3C` | 삭제 버튼 등 |
| `bg-mosaic-danger-bg` | `#FCEBEB` | danger hover 배경 |

### 2.7 NEW 배지 (PWA 신규)

| 토큰 | 색 | 용도 |
|---|---|---|
| `text-mosaic-new` | `#D06820` | NEW 배지 텍스트 |
| `bg-mosaic-new-bg` | `#FFE8CC` | NEW 배지 배경 |

> **NEW 정책**: `bookmark.created_at`이 24시간 이내면 NEW.

---

## 3. 공용 컴포넌트

### 3.1 `<Pill>` — 배지

PC `.bm-g-lowest` / `.bm-g-target` / `.bm-m-lowest` / `.bm-m-target` 매핑.

**Variants:**
| variant | 의미 | 예 |
|---|---|---|
| `lowest` | 최저가 | `<Pill variant="lowest">최저가</Pill>` |
| `target-achieved` | 목표 달성 | `<Pill variant="target-achieved">달성</Pill>` |
| `target-default` | 목표 미달성 | `<Pill variant="target-default">목표 40,000원</Pill>` |
| `new` | 24시간 이내 추가 | `<Pill variant="new">NEW</Pill>` |

**스타일 (PC 매핑)**:
- font-size: 9px
- font-weight: 700
- padding: 2px 6px
- border-radius: 999px (full pill)
- letter-spacing: 0.3px

---

## 4. 자주 쓰는 패턴

### 4.1 그룹 카드 (Bookmark Group)

```jsx
<article className="border border-mosaic-line-card rounded-lg bg-mosaic-surface overflow-hidden">
  <header className="flex items-center gap-1 px-2 py-2">
    {/* 핀 + 제목 + 배지 */}
  </header>
  <div className="border-t border-mosaic-line">
    {/* 상품 행들 */}
  </div>
</article>
```

PC `.bm-group` 매핑:
- border-radius: 8px (`rounded-lg`)
- bg: `#FFFFFF` (`bg-mosaic-surface`)
- border: `#E0DCCE` (`border-mosaic-line-card`)

### 4.2 카테고리 헤더 (검색 결과)

```jsx
<div className="flex items-center gap-3 px-4 pb-1">
  <span className="shrink-0 text-[11px] font-normal text-mosaic-text-label tracking-[0.2px]">
    {label}
  </span>
  <div className="flex-1 h-px bg-mosaic-line" />
</div>
```

PC `.lbl` + `.line` 매핑.

### 4.3 검색바

```jsx
<div className="
  flex items-center gap-2 h-9 px-3
  bg-mosaic-surface
  border border-mosaic-line-strong
  rounded-full
  focus-within:border-mosaic-accent
  focus-within:shadow-[0_0_0_2px_rgba(232,118,43,0.12)]
  transition-all duration-150
">
  {/* search icon + input + clear */}
</div>
```

PC `.sb` 매핑 (모서리는 모바일 친화로 full).

---

## 5. 폰트

PC `sidepanel.css` body font 패턴:

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Pretendard",
  "Apple SD Gothic Neo",
  "Malgun Gothic",
  "Noto Sans KR",
  sans-serif;
```

`index.css` body에 동일 적용.

### 폰트 크기 가이드

| 용도 | PC | PWA |
|---|---|---|
| 본문 일반 | 12px | text-xs (12px) 또는 text-sm (14px) |
| 상품 제목 | 11.5px | `text-[11.5px]` |
| mall 이름 (강조) | 11px / weight 800 | `text-[11px] font-extrabold` |
| 가격 | 11px / weight 400 | `text-[11px]` |
| 배지 (Pill) | 9px / weight 700 | (Pill 컴포넌트 내장) |
| 카테고리 레이블 | 11px / weight 400 | `text-[11px] font-normal` |
| 캡션 (시간 등) | 10px | `text-[10px]` |

---

## 6. 정책 (UX 룰)

### 6.1 외부 링크 처리
- 모든 mall/검색 결과 클릭 → `useExternalNavigate` 호출
- 첫 회: 외부 링크 안내 모달 → 확인 시 flag 저장 + 새 탭
- 이후: 즉시 새 탭

### 6.2 펼치기 정책 (북마크 그룹)
- **기본 표시**: 최저가 mall 1개 + NEW mall (있으면)
- **펼치기**: "+N개 더보기" 버튼 → 그룹 안 모든 mall
- 그룹 안 mall 1~2개면 펼치기 불필요

### 6.3 정렬
- **그룹**: is_pinned 우선 → target_achieved 우선 → updated_at 최신
- **그룹 안 mall**: current_price 오름차순 (최저가 1위) — 좌측 rank 1, 2, 3...

### 6.4 NEW 표시
- `bookmark.created_at`이 24시간 이내면 `<Pill variant="new">NEW</Pill>`

---

## 7. 마이그레이션 노트

### 7.1 이전 토큰 → 새 토큰 매핑

| 이전 (deprecated) | 새 토큰 |
|---|---|
| `mosaic-muted` | `mosaic-text-muted` |
| `mosaic-muted-2` | `mosaic-text-label` |
| `mosaic-muted-3` | `mosaic-text-soft` |
| `mosaic-line-2` | `mosaic-line-strong` |
| `mosaic-hover-bg` | `mosaic-surface-hover` |
| `mosaic-min-bg` | `mosaic-accent-bg` |
| `mosaic-min-text` | `mosaic-accent` |
| `mosaic-target-bg` | `mosaic-success-bg` |
| `mosaic-target-text` | `mosaic-success` |

### 7.2 단계 4에서 컴포넌트 마이그레이션 후 deprecated 토큰 제거 예정.

---

## 8. 변경 이력

- **v3 (2026-04-30)**: 단계 2 — 25개 canonical 토큰 + Pill 컴포넌트 + 본 문서 작성
- v2 (2026-04-29): muted-2 색 정정 (#8A8A8A → #9F9F9F), 신규 토큰 일부 추가
- v1 (2026-04-28): 초기 토큰 정의 (메모리 추정 기반)
