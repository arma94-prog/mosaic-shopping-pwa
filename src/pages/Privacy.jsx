/* =========================================================
 * src/pages/Privacy.jsx
 * 개인정보 처리방침 페이지 (단독 페이지 - AppShell 없음)
 *
 * v2 (2026-05-01, SEO):
 *  - 🆕 react-helmet-async <Helmet> 추가. 페이지 진입 시 <title>,
 *    <meta description>, OG 태그를 Privacy 전용으로 override.
 *  - canonical: https://mosaicshopping.com/privacy
 *
 * v1 (원본):
 * - 인증 게이트 밖에 위치 (verification 검토자 / OAuth 동의 화면 링크 접근 가능)
 * - 모바일 native 톤 + 다크모드 대응
 * ========================================================= */
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

/* ---------- 표 헬퍼 컴포넌트 ---------- */
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

/* ---------- 주요 섹션 ---------- */
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

/* ---------- 메인 ---------- */
export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>개인정보 처리방침 - 모자이크 쇼핑</title>
        <meta
          name="description"
          content="모자이크 쇼핑 PWA 개인정보 처리방침. OAuth 인증 정보, 데이터 처리 항목, 사용자 권리 안내."
        />
        <link rel="canonical" href="https://mosaicshopping.com/privacy" />

        {/* Open Graph — Privacy 전용 */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content="개인정보 처리방침 - 모자이크 쇼핑" />
        <meta
          property="og:description"
          content="모자이크 쇼핑 개인정보 처리방침"
        />
        <meta
          property="og:url"
          content="https://mosaicshopping.com/privacy"
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

        <h1 className="mb-2 text-2xl font-bold">
          모자이크 쇼핑 PWA 개인정보 처리방침
        </h1>

        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          <strong className="text-neutral-700 dark:text-neutral-200">
            버전:
          </strong>{" "}
          v0.6 (베타) ·{" "}
          <strong className="text-neutral-700 dark:text-neutral-200">
            시행일:
          </strong>{" "}
          2026-04-29 ·{" "}
          <strong className="text-neutral-700 dark:text-neutral-200">
            최종 수정일:
          </strong>{" "}
          2026-06-28
        </p>

        <Quote>
          이 문서는 모자이크 쇼핑 PWA(Progressive Web App, 이하 "본 앱")가
          사용자의 개인정보를 어떻게 처리하는지 설명합니다. 본 앱은 모자이크
          쇼핑 Chrome 확장 프로그램(이하 "PC 확장")에서 사용자가 생성한 데이터를
          모바일에서 <strong>읽기 전용으로 조회</strong>하는 동반 앱입니다.
        </Quote>

        {/* 1. 개인정보 처리자 */}
        <H2>1. 개인정보 처리자</H2>
        <Table>
          <TR>
            <TH>항목</TH>
            <TH>내용</TH>
          </TR>
          <TR>
            <TD>
              <strong>처리자</strong>
            </TD>
            <TD>신우영 (개인 개발자)</TD>
          </TR>
          <TR>
            <TD>
              <strong>소재지</strong>
            </TD>
            <TD>대한민국 경기도 성남시</TD>
          </TR>
          <TR>
            <TD>
              <strong>연락처</strong>
            </TD>
            <TD>
              <A href="mailto:arma94@gmail.com">arma94@gmail.com</A>
            </TD>
          </TR>
          <TR>
            <TD>
              <strong>본 앱의 주소</strong>
            </TD>
            <TD>
              <A href="https://mosaicshopping.com">https://mosaicshopping.com</A>
            </TD>
          </TR>
        </Table>

        {/* 2. 본 앱의 동작 원리 및 처리 항목 */}
        <H2>2. 본 앱의 동작 원리 및 처리 항목</H2>
        <p>
          본 앱은 PC 확장과 동일한 Google 계정으로 로그인 시, 사용자가 PC
          확장에서 생성한 데이터를 클라우드(Supabase)에서 읽어와 모바일 화면에
          표시합니다.{" "}
          <strong>
            본 앱 자체는 데이터를 생성·수정·삭제하지 않습니다.
          </strong>{" "}
          단, 아래 <strong>§2.4(커뮤니티 핫딜 매칭)</strong>는 PC 확장에서 Google
          계정 연결 여부와 무관하게 동작하는 기능으로, 서비스 전체에 대한 안내를
          위해 본 처리방침에 함께 기술합니다.
        </p>

        <H3>2.1 Google 계정 정보 (OAuth)</H3>
        <Table>
          <TR>
            <TH>항목</TH>
            <TH>출처</TH>
            <TH>이용 목적</TH>
            <TH>보유 기간</TH>
          </TR>
          <TR>
            <TD>
              <strong>이메일 주소</strong>
            </TD>
            <TD>Google OAuth</TD>
            <TD>본인 식별</TD>
            <TD>로그아웃 시까지</TD>
          </TR>
          <TR>
            <TD>
              <strong>사용자 ID(sub)</strong>
            </TD>
            <TD>Google OAuth</TD>
            <TD>본인 데이터 식별 (내부 키)</TD>
            <TD>로그아웃 시까지</TD>
          </TR>
        </Table>
        <Quote>Google 프로필 사진과 이름은 수집하지 않습니다.</Quote>

        <H3>
          2.2 본 앱이 화면에 표시하는 데이터 (PC 확장이 저장한 데이터의
          read-only 조회)
        </H3>
        <p>
          본 항목은{" "}
          <strong>
            PC 확장이 클라우드에 저장한 데이터를 본 앱이 읽어 표시하는 것
          </strong>
          입니다. 본 앱이 신규로 수집하지 않습니다.
        </p>
        <Table>
          <TR>
            <TH>표시 데이터</TH>
            <TH>표시 화면</TH>
          </TR>
          <TR>
            <TD>
              북마크 그룹 (검색어, 핀고정, 목표가, 달성 여부)
            </TD>
            <TD>북마크</TD>
          </TR>
          <TR>
            <TD>
              북마크 항목 (제목, URL, 그룹, 썸네일, 현재가)
            </TD>
            <TD>북마크</TD>
          </TR>
          <TR>
            <TD>핀고정 키워드</TD>
            <TD>검색창</TD>
          </TR>
          <TR>
            <TD>검색 이력</TD>
            <TD>검색창</TD>
          </TR>
          <TR>
            <TD>
              사용자 환경설정 (사용자가 추가한 이벤트/검색 사이트, 카테고리·사이트
              ON/OFF, 카테고리 이름, 디폴트 검색몰)
            </TD>
            <TD>이벤트 / 검색결과</TD>
          </TR>
        </Table>
        <Quote>
          위 데이터의 원본 수집·저장에 대한 자세한 사항은{" "}
          <A href="https://arma94-prog.github.io/mosaic-shopping/privacy.html">
            PC 확장 개인정보 처리방침
          </A>
          을 참고하세요.
        </Quote>

        <H3>2.3 기술적 메타데이터</H3>
        <Table>
          <TR>
            <TH>항목</TH>
            <TH>이용 목적</TH>
            <TH>보유 기간</TH>
          </TR>
          <TR>
            <TD>브라우저 종류, OS, 본 앱 버전</TD>
            <TD>호환성 분석, 버그 디버깅</TD>
            <TD>로그아웃 시까지</TD>
          </TR>
        </Table>

        <H3>2.4 커뮤니티 핫딜 매칭 (서버측 매칭 처리)</H3>
        <p>
          PC 확장은 지원하는 커뮤니티 핫딜 게시판(뽐뿌·알구몬·퀘이사존·더쿠·루리웹)을
          방문할 때, 사용자의 북마크/핀고정/최근 검색어와 그 페이지의 핫딜 게시글을
          비교해 일치하는 상품을 알려줍니다. 이 매칭은{" "}
          <strong>동의어 사전을 서버에만 두기 위해</strong> PC 확장의 서버(Supabase
          Edge Function)에서 수행되며, 이를 위해 다음 데이터가{" "}
          <strong>일시적으로</strong> 서버로 전송됩니다.
        </p>
        <Table>
          <TR>
            <TH>항목</TH>
            <TH>처리 방식</TH>
          </TR>
          <TR>
            <TD>북마크/핀고정/최근 검색어 (최대 100개)</TD>
            <TD>매칭 입력</TD>
          </TR>
          <TR>
            <TD>방문한 핫딜 페이지의 게시글 제목 (공개 게시물)</TD>
            <TD>매칭 입력</TD>
          </TR>
        </Table>
        <Quote>
          <ul className="ml-4 list-disc space-y-2">
            <li>
              <strong>
                전송 목적은 매칭 결과 계산뿐이며, 위 데이터는 서버에 저장하지
                않습니다
              </strong>{" "}
              (처리 후 폐기). 서버는 일치한 게시글 목록만 반환합니다.
            </li>
            <li>
              이 기능은 <strong>Google 계정 연결 여부와 무관하게</strong>{" "}
              동작하므로, 비로그인 상태에서도 위 데이터가 전송됩니다. (이전에는 본
              매칭이 사용자 PC 내에서만 이뤄졌으나, 동의어 사전 보호를 위해 서버
              처리로 변경되었습니다.)
            </li>
            <li>
              게시글 제목은 공개된 커뮤니티 게시물의 텍스트이며, 검색어에는 사용자의
              이메일/이름 등 직접 식별자가 포함되지 않습니다.
            </li>
            <li>
              <strong>
                PC 확장의 환경설정에서 이 기능을 전역 또는 사이트별로 끌 수 있으며
              </strong>
              , 끄면 어떤 데이터도 전송되지 않습니다.
            </li>
          </ul>
        </Quote>

        {/* 3. 개인정보의 저장 위치 */}
        <H2>3. 개인정보의 저장 위치</H2>
        <Table>
          <TR>
            <TH>데이터</TH>
            <TH>저장 위치</TH>
            <TH>운영 주체</TH>
            <TH>데이터 센터</TH>
          </TR>
          <TR>
            <TD>클라우드 데이터 (2.2) — PC 확장과 공유</TD>
            <TD>Supabase</TD>
            <TD>Supabase Inc. (미국)</TD>
            <TD>일본 도쿄 리전</TD>
          </TR>
          <TR>
            <TD>인증 토큰 (사용자 디바이스 측)</TD>
            <TD>브라우저 localStorage</TD>
            <TD>사용자 본인</TD>
            <TD>사용자 디바이스</TD>
          </TR>
          <TR>
            <TD>핫딜 매칭 입력 (2.4) — PC 확장</TD>
            <TD>Supabase Edge Function — 일시 처리, 미저장</TD>
            <TD>Supabase Inc. (미국)</TD>
            <TD>일본 도쿄 리전</TD>
          </TR>
        </Table>
        <Quote>
          클라우드 데이터는 PostgreSQL Row Level Security를 통해 본인만 조회
          가능하도록 보호됩니다.
        </Quote>

        {/* 4. 사용자 권리 */}
        <H2>4. 사용자 권리와 행사 방법</H2>

        <H3>4.1 본 앱에서 로그아웃</H3>
        <p>
          본 앱의 로그아웃 기능을 사용하면 본 앱의 인증 토큰이 디바이스에서
          삭제되며, 더 이상 클라우드 데이터를 조회할 수 없습니다.{" "}
          <strong>
            다만 로그아웃은 클라우드의 데이터를 삭제하지 않습니다.
          </strong>
        </p>

        <H3>4.2 데이터 완전 삭제</H3>
        <p>
          전체 데이터 삭제는 <strong>PC 확장의 "연결 해제"</strong> 버튼에서만
          실행 가능합니다. 자세한 흐름은{" "}
          <A href="https://arma94-prog.github.io/mosaic-shopping/privacy.html">
            PC 확장 처리방침
          </A>
          의 §4.1을 참고하세요.
        </p>
        <Quote>
          PWA Phase 1에서는 본 앱에 별도의 데이터 삭제 UI를 제공하지 않습니다.
          Phase 2에서 추가 예정입니다.
        </Quote>

        <H3>4.3 데이터 열람</H3>
        <p>본 앱의 각 화면에서 본인 데이터를 열람할 수 있습니다.</p>

        {/* 5. 제3자 제공 / 위탁 */}
        <H2>5. 제3자 제공 / 위탁</H2>
        <p>
          본 앱은{" "}
          <strong>광고주를 포함한 어떤 제3자에게도</strong> 사용자의 개인정보를
          판매·제공·공유하지 않습니다.
        </p>
        <p>본 앱의 운영을 위해 다음 처리위탁이 발생합니다:</p>
        <Table>
          <TR>
            <TH>위탁업체</TH>
            <TH>위탁 업무</TH>
            <TH>처리 항목</TH>
          </TR>
          <TR>
            <TD>Supabase Inc.</TD>
            <TD>데이터 저장, 인증</TD>
            <TD>2.1, 2.2 항목</TD>
          </TR>
          <TR>
            <TD>Google LLC</TD>
            <TD>OAuth 인증</TD>
            <TD>이메일, 사용자 ID</TD>
          </TR>
          <TR>
            <TD>Vercel Inc.</TD>
            <TD>본 앱 호스팅 (정적 자산)</TD>
            <TD>개인정보 미저장</TD>
          </TR>
        </Table>

        {/* 6. 변경 이력 */}
        <H2>6. 변경 이력</H2>
        <Table>
          <TR>
            <TH>버전</TH>
            <TH>시행일</TH>
            <TH>주요 변경</TH>
          </TR>
          <TR>
            <TD>v0.1 (베타)</TD>
            <TD>2026-04-29</TD>
            <TD>최초 작성 — PWA Phase 1 (read-only)</TD>
          </TR>
          <TR>
            <TD>v0.6 (베타)</TD>
            <TD>2026-06-28</TD>
            <TD>
              §2.4 신설 — 커뮤니티 핫딜 매칭을 PC 확장 서버측에서 수행(동의어 사전
              보호 목적). 북마크/핀고정/최근 검색어 + 방문 페이지 게시글 제목을 매칭
              계산용으로 일시 전송(처리 후 미저장). 계정 연결 여부와 무관하게 동작.
              §3 저장 위치 표에 일시 처리 항목 추가.
            </TD>
          </TR>
        </Table>

        {/* 7. 문의 */}
        <H2>7. 문의</H2>
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

        {/* 부록 */}
        <H2>부록: PWA Phase 2 추가 예정</H2>
        <ul className="ml-5 list-disc space-y-1">
          <li>본 앱 내 로그아웃 + 클라우드 데이터 삭제 UI</li>
          <li>본 앱 내 사용자 데이터 수정 기능</li>
        </ul>

        {/* 하단 여백 */}
        <div className="h-12" />
      </article>
      </div>
    </>
  );
}
