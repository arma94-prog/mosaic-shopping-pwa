# PWA seamless 단계 2 — 디자인 시스템 정의

## 산출물

| 파일 | 위치 | 역할 |
|---|---|---|
| `index.css` (전면 재정의) | `src/index.css` | 25개 canonical 토큰 + 9개 deprecated alias |
| `Pill.jsx` (신규) | `src/components/Pill.jsx` | 4가지 variant 공용 배지 |
| `DESIGN.md` (신규) | 저장소 root | 디자인 시스템 SOT 문서 |

## 적용

1. zip 풀어서 폴더 구조 그대로 덮어쓰기:
   - `src/index.css` → 덮어쓰기
   - `src/components/Pill.jsx` → 신규
   - `DESIGN.md` → 저장소 root에 신규 (PWA `mosaic-shopping-pwa` 저장소)
2. dev 서버는 그대로 (HMR로 CSS 자동 반영)
3. **시각 변화 없음** — 이전 토큰이 alias로 유지되어 기존 컴포넌트 그대로 작동

## 검증

| 검증 포인트 | 기대 결과 |
|---|---|
| dev 서버 빌드 에러 없음 | ✅ (alias 유지로 호환) |
| 기존 화면 시각 변화 없음 | ✅ (이전 토큰 그대로 작동) |
| 신규 토큰 사용 가능 | ✅ (예: `text-mosaic-text-label`) |
| Pill import 가능 | ✅ (`import Pill from "../components/Pill"`) |
| DESIGN.md 저장소 root에 존재 | ✅ |

dev 콘솔에 에러 없으면 단계 2 완료.

## 의미 정리

### Tier 1 (canonical 25개)
- **Surface**: bg / surface / surface-hover / surface-pill (4)
- **Text**: text / content / muted / soft / label / disabled (6)
- **Lines**: line / line-soft / line-strong / line-input / line-card (5)
- **Accent**: accent / accent-dark / accent-bg (3)
- **Success**: success / success-bg (2)
- **Danger**: danger / danger-bg (2)
- **NEW**: new / new-bg (2)
- (1 미만으로 묶음 차이로 일부 변동 가능)

### Tier 2 (deprecated alias 9개)
이전 토큰 이름 유지로 기존 코드 호환.
단계 4에서 컴포넌트 마이그레이션 후 제거 예정.

## Pill 사용 예시

```jsx
import Pill from "../components/Pill";

<Pill variant="lowest">최저가</Pill>
<Pill variant="target-achieved">달성</Pill>
<Pill variant="target-default">목표 40,000원</Pill>
<Pill variant="new">NEW</Pill>
```

## 다음 — 단계 3 (PWA Product 정체성 정의)

작업 후 곧바로 단계 3 진입. 짧음 (15분 정도, 한 문장 합의).

검증 결과 알려주세요.

> 💡 한 가지 짚어두기 — 단계 2는 "보이지 않는 토대 작업"이라 시각 변화 없는 게 정상이에요. 단계 4 (화면 재작성) 시점에 이 토대 위에서 모든 화면이 새 토큰 + Pill 컴포넌트 사용해서 시각 일관성이 한 번에 살아납니다.
