/* =========================================================
 * src/pages/Privacy.jsx
 * 모자이크 쇼핑 PWA 개인정보 처리방침 v0.1
 * - AuthGate 바깥의 공개 라우트
 * - 모바일 우선 + 다크모드 자동 대응(prefers-color-scheme)
 * - 외부 의존성 없음 (마크다운 라이브러리 미사용)
 * ========================================================= */
import { Link } from "react-router-dom";

const PC_PRIVACY_URL =
  "https://arma94-prog.github.io/mosaic-shopping/privacy.html";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* 헤더 영역 */}
        <nav className="mb-6">
          <Link
            to="/"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            ← 홈으로
          </Link>
        </nav>

        <header className="mb-6">
          <h1 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
            모자이크 쇼핑 PWA 개인정보 처리방침
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Meta>버전</Meta> v0.1 (베타) · <Meta>시행일</Meta> 2026-04-29 ·{" "}
            <Meta>최종 수정일</Meta> 2026-04-29
          </p>
        </header>

        <Note>
          이 문서는 모자이크 쇼핑 PWA(Progressive Web App, 이하 "본 앱")가
          사용자의 개인정보를 어떻게 처리하는지 설명합니다. 본 앱은 모자이크
          쇼핑 Chrome 확장 프로그램(이하 "PC 확장")에서 사용자가 생성한
          데이터를 모바일에서 <strong>읽기 전용으로 조회</strong>하는 동반
          앱입니다.
        </Note>

        {/* 1. 처리자 */}
        <Section title="1. 개인정보 처리자">
          <Table
            headers={["항목", "내용"]}
            rows={[
              ["처리자", "신우영 (개인 개발자)"],
              ["소재지", "대한민국 경기도 성남시"],
              [
                "연락처",
                <Email key="email">arma94@gmail.com</Email>,
              ],
              [
                "본 앱의 주소",
                <ExternalLink key="url" href="https://mosaicshopping.com">
                  https://mosaicshopping.com
                </ExternalLink>,
              ],
            ]}
          />
        </Section>

        {/* 2. 동작 원리 및 처리 항목 */}
        <Section title="2. 본 앱의 동작 원리 및 처리 항목">
          <p className="mb-3 text-sm leading-relaxed sm:text-base">
            본 앱은 PC 확장과 동일한 Google 계정으로 로그인 시, 사용자가 PC
            확장에서 생성한 데이터를 클라우드(Supabase)에서 읽어와 모바일
            화면에 표시합니다. <strong>본 앱 자체는 데이터를 생성·수정·삭제하지
            않습니다.</strong>
          </p>

          <SubSection title="2.1 Google 계정 정보 (OAuth)">
            <Table
              headers={["항목", "출처", "이용 목적", "보유 기간"]}
              rows={[
                [
                  "이메일 주소",
                  "Google OAuth",
                  "본인 식별",
                  "로그아웃 시까지",
                ],
                [
                  "사용자 ID(sub)",
                  "Google OAuth",
                  "본인 데이터 식별 (내부 키)",
                  "로그아웃 시까지",
                ],
              ]}
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Google 프로필 사진과 이름은 수집하지 않습니다.
            </p>
          </SubSection>

          <SubSection title="2.2 본 앱이 화면에 표시하는 데이터">
            <p className="mb-3 text-sm leading-relaxed">
              본 항목은{" "}
              <strong>
                PC 확장이 클라우드에 저장한 데이터를 본 앱이 읽어 표시하는 것
              </strong>
              입니다. 본 앱이 신규로 수집하지 않습니다.
            </p>
            <Table
              headers={["표시 데이터", "표시 화면"]}
              rows={[
                [
                  "북마크 그룹 (검색어, 핀고정, 목표가, 달성 여부)",
                  "북마크",
                ],
                [
                  "북마크 항목 (제목, URL, 그룹, 썸네일, 현재가)",
                  "북마크",
                ],
                ["핀고정 키워드", "검색창"],
                ["검색 이력", "검색창"],
                [
                  "사용자 환경설정 (사용자가 추가한 이벤트/검색 사이트, 카테고리·사이트 ON/OFF, 카테고리 이름, 디폴트 검색몰)",
                  "이벤트 / 검색결과",
                ],
              ]}
            />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              위 데이터의 원본 수집·저장에 대한 자세한 사항은{" "}
              <ExternalLink href={PC_PRIVACY_URL}>
                PC 확장 개인정보 처리방침
              </ExternalLink>
              을 참고하세요.
            </p>
          </SubSection>

          <SubSection title="2.3 기술적 메타데이터">
            <Table
              headers={["항목", "이용 목적", "보유 기간"]}
              rows={[
                [
                  "브라우저 종류, OS, 본 앱 버전",
                  "호환성 분석, 버그 디버깅",
                  "로그아웃 시까지",
                ],
              ]}
            />
          </SubSection>
        </Section>

        {/* 3. 저장 위치 */}
        <Section title="3. 개인정보의 저장 위치">
          <Table
            headers={["데이터", "저장 위치", "운영 주체", "데이터 센터"]}
            rows={[
              [
                "클라우드 데이터 (2.2) — PC 확장과 공유",
                "Supabase",
                "Supabase Inc. (미국)",
                "일본 도쿄 리전",
              ],
              [
                "인증 토큰 (사용자 디바이스 측)",
                "브라우저 localStorage",
                "사용자 본인",
                "사용자 디바이스",
              ],
            ]}
          />
          <Note>
            클라우드 데이터는 PostgreSQL Row Level Security를 통해 본인만 조회
            가능하도록 보호됩니다.
          </Note>
        </Section>

        {/* 4. 사용자 권리 */}
        <Section title="4. 사용자 권리와 행사 방법">
          <SubSection title="4.1 본 앱에서 로그아웃">
            <p className="text-sm leading-relaxed sm:text-base">
              본 앱의 로그아웃 기능을 사용하면 본 앱의 인증 토큰이 디바이스에서
              삭제되며, 더 이상 클라우드 데이터를 조회할 수 없습니다.{" "}
              <strong>다만 로그아웃은 클라우드의 데이터를 삭제하지 않습니다.</strong>
            </p>
          </SubSection>

          <SubSection title="4.2 데이터 완전 삭제">
            <p className="text-sm leading-relaxed sm:text-base">
              전체 데이터 삭제는 <strong>PC 확장의 "연결 해제"</strong> 버튼에서만
              실행 가능합니다. 자세한 흐름은{" "}
              <ExternalLink href={PC_PRIVACY_URL}>
                PC 확장 처리방침
              </ExternalLink>
              의 §4.1을 참고하세요.
            </p>
            <Note>
              PWA Phase 1에서는 본 앱에 별도의 데이터 삭제 UI를 제공하지
              않습니다. Phase 2에서 추가 예정입니다.
            </Note>
          </SubSection>

          <SubSection title="4.3 데이터 열람">
            <p className="text-sm leading-relaxed sm:text-base">
              본 앱의 각 화면에서 본인 데이터를 열람할 수 있습니다.
            </p>
          </SubSection>
        </Section>

        {/* 5. 제3자 제공 */}
        <Section title="5. 제3자 제공 / 위탁">
          <p className="mb-3 text-sm leading-relaxed sm:text-base">
            본 앱은 <strong>광고주를 포함한 어떤 제3자에게도</strong> 사용자의
            개인정보를 판매·제공·공유하지 않습니다.
          </p>
          <p className="mb-3 text-sm leading-relaxed sm:text-base">
            본 앱의 운영을 위해 다음 처리위탁이 발생합니다:
          </p>
          <Table
            headers={["위탁업체", "위탁 업무", "처리 항목"]}
            rows={[
              ["Supabase Inc.", "데이터 저장, 인증", "2.1, 2.2 항목"],
              ["Google LLC", "OAuth 인증", "이메일, 사용자 ID"],
              [
                "Vercel Inc.",
                "본 앱 호스팅 (정적 자산)",
                "개인정보 미저장",
              ],
            ]}
          />
        </Section>

        {/* 6. 변경 이력 */}
        <Section title="6. 변경 이력">
          <Table
            headers={["버전", "시행일", "주요 변경"]}
            rows={[
              [
                "v0.1 (베타)",
                "2026-04-29",
                "최초 작성 — PWA Phase 1 (read-only)",
              ],
            ]}
          />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            처리방침이 변경되는 경우 본 앱 내에서 최소 7일 전에 공지합니다.
            사용자에게 불리한 변경의 경우 별도 동의를 받습니다.
          </p>
        </Section>

        {/* 7. 문의 */}
        <Section title="7. 문의">
          <Table
            headers={["채널", "연락처"]}
            rows={[
              [
                "이메일",
                <Email key="contact">arma94@gmail.com</Email>,
              ],
              ["응답 목표", "영업일 기준 3일 이내"],
            ]}
          />
        </Section>

        {/* 부록 */}
        <Section title="부록: PWA Phase 2 추가 예정">
          <ul className="list-disc space-y-1 pl-6 text-sm leading-relaxed sm:text-base">
            <li>본 앱 내 로그아웃 + 클라우드 데이터 삭제 UI</li>
            <li>본 앱 내 사용자 데이터 수정 기능</li>
          </ul>
        </Section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500">
          <p>
            본 처리방침은 <strong>모자이크 쇼핑 PWA</strong> 전용입니다. PC
            확장(Chrome) 사용자는{" "}
            <ExternalLink href={PC_PRIVACY_URL}>
              PC 확장 처리방침
            </ExternalLink>
            을 참고해 주세요.
          </p>
        </footer>
      </div>
    </div>
  );
}

/* ---------- 보조 컴포넌트들 ---------- */

function Section({ title, children }) {
  return (
    <section className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
      <h2 className="mb-4 text-lg font-semibold sm:text-xl">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Note({ children }) {
  return (
    <blockquote className="my-4 rounded border-l-4 border-gray-300 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
      {children}
    </blockquote>
  );
}

function Meta({ children }) {
  return (
    <strong className="text-gray-700 dark:text-gray-300">{children}:</strong>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="-mx-4 my-3 overflow-x-auto sm:mx-0">
      <table className="min-w-full border border-gray-200 text-sm dark:border-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-gray-200 px-3 py-2 text-left font-semibold dark:border-gray-800"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-gray-200 last:border-0 dark:border-gray-800"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-blue-600 hover:underline dark:text-blue-400"
    >
      {children}
    </a>
  );
}

function Email({ children }) {
  return (
    <a
      href={`mailto:${children}`}
      className="text-blue-600 hover:underline dark:text-blue-400"
    >
      {children}
    </a>
  );
}
