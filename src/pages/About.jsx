/* =========================================================
 * src/pages/About.jsx
 * 모자이크 쇼핑 서비스 소개 페이지 (단독 페이지 - AppShell 없음)
 *
 * v2 (2026-05-01, SEO):
 *  - 🆕 react-helmet-async <Helmet> 추가. 페이지 진입 시 <title>,
 *    <meta description>, OG 태그를 About 전용으로 override.
 *  - canonical: https://mosaicshopping.com/about
 *  - SEO 인덱싱 허용 (자연 인덱싱 — h1/h2 키워드 분포 좋음).
 *
 * v1 (2026-05-01): 신규.
 * - 인증 게이트 밖에 위치 (검색봇 / OAuth 검토봇 / 미인증 사용자 접근 가능).
 * - GitHub Pages 기존 랜딩 (arma94-prog.github.io/mosaic-shopping)을
 *   모바일 PWA 환경에 맞게 각색 + PC ↔ 모바일 통합 강조.
 * - 디자인 톤: Privacy.jsx와 동일 (모바일 native + 다크모드).
 *
 * 콘텐츠 정책:
 * - 기존 GitHub 페이지의 "스마트폰 미지원" FAQ 삭제 (PWA 출시로 거짓이 됨).
 * - "PC + 모바일 통합" 섹션 신규 추가 — 본 페이지의 핵심 차별점.
 * - 이미지/스크린샷 미포함 (검토봇 안전성 + 향후 추가 가능).
 *
 * SEO 시드:
 * - h1, h2 키워드: "모자이크 쇼핑", "쇼핑몰 통합 검색", "가격 추적"
 * - 자연스러운 키워드 분포 (스팸 X)
 * - 인덱스 가능한 정적 콘텐츠 다수
 * ========================================================= */
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/* ---------- 표 헬퍼 (Privacy.jsx와 동일 패턴) ---------- */
function Table({ children }) {
  return (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TR({ children }) {
  return <tr>{children}</tr>;
}

function TH({ children }) {
  return (
    <th className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-left align-top font-semibold dark:border-neutral-700 dark:bg-neutral-800">
      {children}
    </th>
  );
}

function TD({ children }) {
  return (
    <td className="border border-neutral-200 px-3 py-2 align-top dark:border-neutral-700">
      {children}
    </td>
  );
}

/* ---------- 섹션 헬퍼 ---------- */
function H2({ children }) {
  return (
    <h2 className="mt-8 border-t border-neutral-200 pt-6 text-lg font-bold dark:border-neutral-700">
      {children}
    </h2>
  );
}

function H3({ children }) {
  return <h3 className="mt-5 mb-2 text-base font-semibold">{children}</h3>;
}

function Quote({ children }) {
  return (
    <blockquote className="my-3 rounded border-l-4 border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
      {children}
    </blockquote>
  );
}

function A({ href, children }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-blue-600 hover:underline dark:text-blue-400"
    >
      {children}
    </a>
  );
}

/* ---------- About 전용 — 기능 카드 ---------- */
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 rounded border border-neutral-200 p-3 dark:border-neutral-700">
      <div className="flex-shrink-0 text-xl leading-none" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {desc}
        </div>
      </div>
    </div>
  );
}

/* ---------- About 전용 — PC/모바일 박스 ---------- */
function PlatformBox({ icon, label, lines }) {
  return (
    <div className="rounded border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex items-center gap-2 text-sm font-bold">
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="flex-shrink-0">·</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 메인 ---------- */
export default function About() {
  return (
    <>
      <Helmet>
        <title>모자이크 쇼핑 소개 - 쿠팡 네이버 등 통합 쇼핑 검색 도우미</title>
        <meta
          name="description"
          content="PC와 모바일에서 사용하는 한국 쇼핑몰 통합 검색 도우미. 쿠팡, 네이버, G마켓, 11번가 등 40개 이상 쇼핑몰 지원. 북마크 가격 추적과 목표가 알림 기능 제공."
        />
        <link rel="canonical" href="https://mosaicshopping.com/about" />

        {/* Open Graph — About 전용 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="모자이크 쇼핑 소개" />
        <meta
          property="og:description"
          content="한국 쇼핑몰 통합 검색 도우미 - PC와 모바일에서 모두 사용. 40개+ 쇼핑몰 지원, 가격 추적, 목표가 알림."
        />
        <meta
          property="og:url"
          content="https://mosaicshopping.com/about"
        />
        <meta
          property="og:image"
          content="https://mosaicshopping.com/og-image.png"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="모자이크 쇼핑 소개" />
        <meta
          name="twitter:description"
          content="한국 쇼핑몰 통합 검색 도우미 - PC와 모바일에서 모두 사용."
        />
      </Helmet>

      <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <article className="mx-auto max-w-2xl px-5 py-8 leading-relaxed">
        {/* 상단 네비게이션 */}
        <nav className="mb-6">
          <Link
            to="/"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← 모자이크 쇼핑
          </Link>
        </nav>

        {/* 히어로 */}
        <h1 className="mb-3 text-2xl font-bold">모자이크 쇼핑 소개</h1>
        <p className="mb-4 text-base text-neutral-700 dark:text-neutral-300">
          여러 쇼핑몰을 한 번에 검색하고, 북마크한 상품의 가격이 떨어지면
          알려주는 통합 쇼핑 도우미입니다.
        </p>

        <Quote>
          <strong>PC와 모바일을 자유롭게 오가며</strong> 쇼핑할 수 있는
          크로스 플랫폼 서비스입니다. PC에서 저장한 북마크와 가격 알림을
          모바일에서도 그대로 확인할 수 있습니다.
        </Quote>

        {/* 1. 핵심 기능 */}
        <H2>1. 핵심 기능</H2>
        <div className="my-4 space-y-2">
          <FeatureCard
            icon="🔍"
            title="통합 쇼핑 검색"
            desc="하나의 검색어로 40개 이상의 쇼핑몰을 동시에 검색. 탭을 오가며 비교할 필요가 없습니다."
          />
          <FeatureCard
            icon="📌"
            title="상품 북마크"
            desc="관심 상품을 검색 키워드별로 자동 정리. 쇼핑몰별 최저가를 한눈에 비교."
          />
          <FeatureCard
            icon="🔄"
            title="가격 자동 갱신"
            desc="하루 최대 4번 자동 가격 갱신. 쇼핑몰 로그인 시 회원 할인가까지 반영."
          />
          <FeatureCard
            icon="🔔"
            title="목표가 알림"
            desc="설정한 목표 가격 이하로 떨어지면 알림으로 알려드립니다."
          />
          <FeatureCard
            icon="📱"
            title="PC ↔ 모바일 동기화"
            desc="Google 계정으로 로그인하면 PC와 모바일에서 같은 데이터로 쇼핑할 수 있습니다."
          />
        </div>

        {/* 2. PC + 모바일 통합 — 본 페이지의 핵심 차별점 */}
        <H2>2. PC와 모바일에서 모두 사용</H2>
        <p>
          모자이크 쇼핑은 두 가지 환경에서 사용할 수 있으며, 같은 Google
          계정으로 로그인하면 데이터가 자동으로 동기화됩니다.
        </p>
        <div className="my-4 grid gap-3 sm:grid-cols-2">
          <PlatformBox
            icon="💻"
            label="PC: Chrome 익스텐션"
            lines={[
              "주요 사용 환경",
              "통합 검색 + 북마크 + 가격 추적",
              "목표가 알림 (Chrome 알림)",
              "Chrome 웹스토어에서 무료 설치",
            ]}
          />
          <PlatformBox
            icon="📱"
            label="모바일: PWA"
            lines={[
              "외출 중 빠르게 확인",
              "PC에서 저장한 북마크 즉시 조회",
              "현재가 / 목표가 달성 여부 표시",
              "mosaicshopping.com에서 바로 사용",
            ]}
          />
        </div>
        <Quote>
          PC에서 천천히 비교 검색해 북마크 → 외출 중 모바일에서 가격 확인
          → 목표가 도달 시 PC로 돌아와 구매. 끊김 없는 쇼핑 경험을
          제공합니다.
        </Quote>

        {/* 3. 지원 쇼핑몰 */}
        <H2>3. 지원 쇼핑몰 (40개+)</H2>
        <p className="text-sm">
          네이버쇼핑, 쿠팡, G마켓, SSG, 11번가, 롯데ON, 무신사, 29CM,
          에이블리, 올리브영, 오늘의집, IKEA, 마켓컬리, CJ더마켓, iHerb,
          알리익스프레스, Amazon, 다나와, 에누리, 하이마트, 삼성, LG전자
          외 다수.
        </p>
        <Quote>
          지원 쇼핑몰은 지속 추가됩니다. 추가를 원하시면{" "}
          <A href="mailto:arma94@gmail.com">arma94@gmail.com</A>으로 알려주세요.
        </Quote>

        {/* 4. 시작하기 */}
        <H2>4. 시작하기</H2>

        <H3>PC에서 시작</H3>
        <ol className="ml-5 list-decimal space-y-1.5 text-sm">
          <li>
            Chrome 웹스토어에서{" "}
            <strong>"모자이크 쇼핑"</strong> 익스텐션 설치
          </li>
          <li>익스텐션 아이콘 클릭 → Google 계정으로 로그인</li>
          <li>통합 검색 / 북마크 / 가격 추적 시작</li>
        </ol>

        <H3>모바일에서 시작</H3>
        <ol className="ml-5 list-decimal space-y-1.5 text-sm">
          <li>
            모바일 브라우저에서{" "}
            <A href="https://mosaicshopping.com">mosaicshopping.com</A> 접속
          </li>
          <li>PC에서 사용 중인 Google 계정으로 로그인</li>
          <li>PC에서 저장한 북마크 자동 동기화</li>
        </ol>

        {/* 5. 자주 묻는 질문 */}
        <H2>5. 자주 묻는 질문</H2>

        <H3>무료인가요?</H3>
        <p className="text-sm">
          네, 모자이크 쇼핑은 완전 무료입니다. 별도의 회원가입은 없으며,
          Google 계정 로그인만으로 이용 가능합니다.
        </p>

        <H3>어떤 환경에서 사용 가능한가요?</H3>
        <p className="text-sm">
          PC는 Chrome 또는 Chromium 기반 브라우저(Edge, Whale 등)에서 익스텐션을
          설치하여 사용합니다. 모바일은 모든 모바일 브라우저에서{" "}
          <A href="https://mosaicshopping.com">mosaicshopping.com</A>에 접속하여
          사용할 수 있습니다.
        </p>

        <H3>개인정보는 안전한가요?</H3>
        <p className="text-sm">
          네. 본 서비스는 검색 이력과 북마크만 사용자 본인 계정에 저장하며,
          제3자에게 제공하지 않습니다. 자세한 사항은{" "}
          <Link
            to="/privacy"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            개인정보처리방침
          </Link>
          을 확인해주세요.
        </p>

        <H3>회원 할인가도 반영되나요?</H3>
        <p className="text-sm">
          네, 쇼핑몰에 로그인된 상태에서 가격이 갱신되면 회원 할인가가
          반영됩니다.
        </p>

        {/* 6. 문의 */}
        <H2>6. 문의</H2>
        <Table>
          <TR>
            <TH>채널</TH>
            <TH>연락처</TH>
          </TR>
          <TR>
            <TD>이메일</TD>
            <TD>
              <A href="mailto:arma94@gmail.com">arma94@gmail.com</A>
            </TD>
          </TR>
          <TR>
            <TD>응답 목표</TD>
            <TD>영업일 기준 3일 이내</TD>
          </TR>
        </Table>

        {/* 푸터 */}
        <H2>고지사항</H2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          모자이크 쇼핑을 거쳐 쿠팡에서 구매가 발생할 경우, 쿠팡 파트너스
          활동을 통해 일정 수수료를 지급받습니다. 사용자에게 추가 비용이
          발생하지 않습니다.
        </p>
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
          특허출원 10-2024-0079467
        </p>
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
          Copyright © 모자이크 쇼핑. All Rights Reserved.
        </p>

        {/* 하단 여백 */}
        <div className="h-12" />
      </article>
      </div>
    </>
  );
}
