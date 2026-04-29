/* =========================================================
 * src/pages/Privacy.jsx
 * 개인정보 처리방침 페이지 (단독 페이지 - AppShell 없음)
 * - 인증 게이트 밖에 위치 (verification 검토자 / OAuth 동의 화면 링크 접근 가능)
 * - 모바일 native 톤 + 다크모드 대응
 * ========================================================= */
import { Link } from "react-router-dom";

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
          v0.1 (베타) ·{" "}
          <strong className="text-neutral-700 dark:text-neutral-200">
            시행일:
          </strong>{" "}
          2026-04-29 ·{" "}
          <strong className="text-neutral-700 dark:text-neutral-200">
            최종 수정일:
          </strong>{" "}
          2026-04-29
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
          </strong>
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
  );
}
