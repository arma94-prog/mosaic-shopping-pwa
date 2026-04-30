# fallback 셀 시각 fix — PWA + PC 동시 적용

## 사용자 catch (캡쳐 기반) — 정확

### 캡쳐 분석
"테스트" 카테고리 "당삼" 셀:
1. 🐛 다른 셀보다 시각적으로 큼 (100% 채움 vs 70%)
2. 🐛 베이지 배경 #EAE6D9 + 흰색 굵은 글씨 → 페이지 톤 어긋남
3. 🐛 사용자 정확 의도: "기존 아이콘 사이즈 + 페이지 타이틀 색 + 볼드 제거 + 테두리 보더라인"

## CTO 결정 — 사용자 의도 정확 매핑

| 항목 | v1 (이전) | v2 (이번) | 근거 |
|---|---|---|---|
| **크기** | 100% (셀 채움) | **70%** | 정상 아이콘과 동일 사이즈 |
| **배경** | `#EAE6D9` 베이지 | **transparent** | 페이지 톤 정합 |
| **테두리** | 없음 | **1px solid #E6E6E6** | 시각 경계 (배경 대신) |
| **색** | `#FFFFFF` 흰색 | **`#1A1A1A`** | 페이지 타이틀 정합 |
| **weight** | 700 (볼드) | **500** | 사용자 catch (볼드 제거) |
| **테두리 둥글기** | 6px | 6px (유지) | |

## 변경 (2파일)

### PWA: `src/components/MallCell.jsx` v2
- fallback `<div>` width/height 100% → 70%
- background #EAE6D9 → transparent
- border 추가: `1px solid #E6E6E6`
- color #FFFFFF → #1A1A1A
- font-weight 700 → 500

### PC: `sidepanel.css` `.chip-fb` 한 줄 변경
v1.24.3-fix12: `.chip-fb` 같은 변경 적용:
```css
/* v1 */ .chip-fb{width:100%;height:100%;background:#EAE6D9;...font-weight:700;color:#fff;...}

/* v2 */ .chip-fb{width:70%;height:70%;background:transparent;border:1px solid #E6E6E6;...font-weight:500;color:#1A1A1A;...}
```

## 적용

zip 풀어서 2파일 각 저장소에 덮어쓰기:

| 파일 | 저장소 | 위치 |
|---|---|---|
| `src/components/MallCell.jsx` | mosaic-shopping-pwa | src/components/ |
| `sidepanel.css` | mosaic-shopping-extension | root |

## 검증 시나리오

### PWA
1. PWA 핫딜 모음 → "테스트" 카테고리 사용자 추가 mall 확인
2. **셀 70% 크기, 회색 테두리, 검정 글자, 노볼드** 표시 ✅
3. 정상 mall 셀과 시각적 일관성

### PC
1. PC 사이드패널 → 사용자 추가 mall (PNG 없는 케이스) 확인
2. **PWA와 동일한 fallback 시각** ✅
3. 셀 자체 35px이 작아도 70% 크기 fallback이 정상 아이콘 비율과 일관

## 트랙 C 학습 — 사용자 표현 정밀 catch

이전 라운드 ("테두리 보더라인") 해석 회고:
- v1: PC `.chip-fb`의 베이지 배경을 "테두리"로 해석 → ❌ 사용자 의도 X
- v2: 명시적 회색 테두리 + 페이지 톤 정합 → ✅ 정확 의도

= **사용자 표현 그대로 매핑이 정답일 때도 있음**. PC 코드 검증을 거치되, 사용자 직관 우선 검토.

메모리 #18 강화 (15번째 catch 학습):
> **사용자 시각 표현은 PC 코드 검증과 사용자 직관 둘 다 검토.** PC 정합이 항상 정답이 아님 — PC 디자인 자체가 페이지 톤과 안 맞을 수도 있음. 사용자가 "페이지 톤과 안 맞아 보여"라 표현하면 PC 디자인 자체 의심 trigger.

## 트랙 C 진행

| 단계 | 상태 |
|---|---|
| PWA seamless ~ realtime ~ customicon | ✅ |
| TECH_DEBT 정리 + 메모리 통합 (b) | ✅ |
| PWA catnames + PC fix12-A (옵션 stale UI) | ✅ |
| **fallback 셀 시각 (PWA + PC)** | ⏳ 적용 중 |
| 11번가 urlMobile JSON | ⏳ 사용자 작업 |
| 커밋 (PC + PWA) + 태그 | ⏳ 사용자 작업 |
| YouTube + verification | ⏳ 다음 세션 |

## CTO 짚어두기

이번 catch는 **사용자 product 직관**의 좋은 사례:
- 캡쳐 한 장으로 시각 문제 정확히 표현
- 4가지 변경 (크기/색/볼드/테두리) 모두 명확 명시
- PWA + PC 양쪽 같은 패턴 catch

= **5초 fix가 가능한 catch**. 사용자 직관이 코드 분석보다 빠르고 정확.

verification 영상 진입 직전 마지막 시각 fix. 이제 PWA + PC가 시각/데이터/정책 100% 정합.
