# CLAUDE.md — AI Agent Instructions for YCN Blog

이 문서는 이 블로그 리포지토리를 작업하는 AI 에이전트를 위한 지시사항입니다.

## Project Overview

- **이름**: YCN (Youngchul Nam의 개인 블로그)
- **프레임워크**: Astro 5.x + Tailwind CSS v4 + `@tailwindcss/typography`
- **배포**: GitHub Pages via GitHub Actions
- **URL**: https://ycnam.github.io
- **기본 브랜치**: `master`
- **Remote**: `git@github.com-personal:ycnam/ycnam.github.io.git`

## Critical Rules

### 절대 하지 말 것

- `as any`, `@ts-ignore`, `@ts-expect-error` 사용 금지
- 사용자 요청 없이 커밋/push 금지
- `migration_from_tumblr/` 디렉토리를 복원하거나 참조하지 말 것 (이미 삭제됨)
- `.github/workflows/deploy.yml`에 `Upload artifact` 스텝 추가 금지 — `withastro/action@v3`이 내부적으로 처리하므로 409 Conflict 발생함
- 리포지토리를 private으로 전환하지 말 것 (GitHub Free 플랜에서 Pages 비활성화됨)

### 반드시 지킬 것

- 한국어 콘텐츠가 주를 이루므로 `word-break: keep-all`과 `overflow-wrap: break-word`를 유지할 것
- 날짜 포맷은 `ko-KR` 로케일 사용 (`formatKoreanDate` in `src/lib/format.ts`)
- 색상은 항상 CSS 변수 (`--color-*`)를 사용하고 하드코딩하지 말 것
- 폰트는 `global.css`에서만 설정하고, 개별 컴포넌트에서 `font-family`를 재정의하지 말 것

## Architecture

### 콘텐츠 구조

```
src/data/blog/{slug}/index.md    # 포스트 본문 + frontmatter
src/data/blog/{slug}/*.png|jpg   # 인라인 이미지 (같은 디렉토리)
```

Frontmatter 스키마:
```yaml
title: string       # 필수
date: Date          # 필수 (z.coerce.date)
draft: boolean      # 선택 (기본: false)
tags: string[]      # 선택 (기본: [])
```

`content.config.ts`에서 `glob({ pattern: '*/index.md', base: './src/data/blog' })` 로더를 사용합니다.

### 스타일링 규칙

- **전역 스타일의 단일 진실 공급원**: `src/styles/global.css`
  - 폰트 (`@font-face`, `body { font-family }`)
  - CSS 변수 (`:root`의 `--color-*`)
  - 다크 모드 (`prefers-color-scheme: dark`)
  - 타이포그래피 기본값 (`word-break`, `line-height` 등)
- **컴포넌트 스타일**: 각 `.astro` 파일의 `<style>` 블록 (Astro scoped)
- **포스트 본문**: Tailwind Typography (`prose` 클래스, `[...slug].astro`에서 적용)

### 라우팅

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `src/pages/[...page].astro` | 메인 (페이지네이션, 5개/페이지) |
| `/2/`, `/3/`, ... | 위와 동일 | 다음 페이지 |
| `/posts/{slug}/` | `src/pages/posts/[...slug].astro` | 개별 포스트 |
| `/{year}/{month}/` | `src/pages/[year]/[month]/index.astro` | 월별 아카이브 |
| `/rss.xml` | `src/pages/rss.xml.ts` | RSS 피드 (최근 20개) |

### 레이아웃 계층

```
BaseLayout.astro
├── global.css (import)
├── Sidebar.astro (아바타, 소개, 아카이브 네비)
├── <slot /> (각 페이지 콘텐츠)
└── Footer.astro (copyright)
```

모든 페이지는 `BaseLayout`을 사용합니다. 새 페이지를 만들 때도 반드시 `BaseLayout`으로 감쌀 것.

### 주요 유틸리티

- `src/lib/archives.ts` — `getArchiveData()`: 사이드바용 연/월별 집계, `getPostsByMonth()`: 아카이브 페이지용
- `src/lib/format.ts` — `formatKoreanDate()`: `Date` → "2024년 1월 15일" 변환

## Development Commands

```bash
npm run dev       # 개발 서버 (http://localhost:4321)
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
```

## Deployment

`master`에 push → GitHub Actions 자동 빌드/배포.

**deploy.yml 구조**: `withastro/action@v3`가 빌드 + artifact 업로드를 한번에 처리. 별도 artifact 업로드 스텝을 추가하면 **절대 안 됨** (409 Conflict).

## Common Tasks

### 새 포스트 추가

1. `src/data/blog/{slug}/index.md` 생성
2. Frontmatter 작성 (title, date 필수)
3. 이미지는 같은 디렉토리에 배치, `![alt](./filename.png)` 으로 참조
4. `npm run build`로 빌드 확인
5. 커밋 & push

### 스타일 수정

- 색상 변경: `src/styles/global.css`의 `:root` CSS 변수만 수정
- 레이아웃 변경: `src/layouts/BaseLayout.astro`
- 개별 컴포넌트 스타일: 해당 `.astro` 파일의 `<style>` 블록

### 새 페이지 추가

1. `src/pages/` 아래 `.astro` 파일 생성
2. `BaseLayout`으로 감싸기
3. 동적 라우트는 `getStaticPaths()` 구현

## Known Issues / Pre-existing Conditions

- `src/pages/rss.xml.ts` (line 15): `context.site`가 `URL | undefined` 타입이라 LSP에서 타입 에러가 나지만, `astro.config.mjs`에 `site`가 설정되어 있으므로 런타임에는 문제 없음 (Astro의 알려진 타입 한계)
- `scripts/migrate.mjs`: Tumblr 마이그레이션용 일회성 스크립트. 이미 사용 완료되었으므로 수정 불필요. 참고용으로만 보관.
- 블로그 포스트 약 288개는 Tumblr에서 마이그레이션된 것. 일부 포스트의 이미지가 깨져 있을 수 있음.

## Tailwind CSS v4 Notes

이 프로젝트는 Tailwind CSS **v4**를 사용합니다. v3와 주요 차이점:

- `tailwind.config.js` 파일 없음 — CSS-first 설정
- `@import "tailwindcss"` 방식 (v3의 `@tailwind base/components/utilities` 대신)
- `@plugin "@tailwindcss/typography"` 방식 (v3의 `plugins: [require('...')]` 대신)
- Vite 플러그인으로 통합: `@tailwindcss/vite` 사용 (`astro.config.mjs`에서 설정)

## Font Strategy

Pretendard 가변 웹폰트를 jsDelivr CDN에서 로드합니다.

```
src: url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.woff2')
```

- Dynamic subset: 한국어 글리프를 필요할 때만 로드 (성능 최적화)
- `font-display: swap`: 폰트 로딩 중 시스템 폰트로 먼저 표시
- Fallback 체인: `Pretendard → -apple-system → BlinkMacSystemFont → system-ui → Roboto → sans-serif`

폰트 설정은 `src/styles/global.css`에서만 관리합니다. 개별 컴포넌트에서 `font-family`를 재정의하지 마세요.
