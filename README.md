# YCN

Youngchul Nam의 개인 블로그. UX, Design, IT, 조직에 대한 글을 기록합니다.

**Live:** https://ycnam.github.io

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | [Astro](https://astro.build) | 5.x |
| CSS | [Tailwind CSS](https://tailwindcss.com) v4 + `@tailwindcss/typography` | 4.x |
| Font | [Pretendard](https://github.com/orioncactus/pretendard) Variable (jsDelivr CDN) | 1.3.9 |
| Hosting | GitHub Pages | - |
| CI/CD | GitHub Actions (`withastro/action@v3`) | - |
| Language | TypeScript (strict mode) | - |

## Project Structure

```
.
├── src/
│   ├── components/        # Astro 컴포넌트
│   │   ├── Footer.astro
│   │   ├── Pagination.astro
│   │   ├── PostCard.astro
│   │   └── Sidebar.astro
│   ├── content.config.ts  # 콘텐츠 컬렉션 스키마 정의
│   ├── data/
│   │   └── blog/          # 블로그 포스트 (288개)
│   │       └── {slug}/
│   │           ├── index.md
│   │           └── *.png|jpg  (인라인 이미지)
│   ├── layouts/
│   │   └── BaseLayout.astro   # 모든 페이지의 기본 레이아웃
│   ├── lib/
│   │   ├── archives.ts    # 아카이브 데이터 집계 (연/월별)
│   │   └── format.ts      # 날짜 포맷 유틸리티 (한국어)
│   ├── pages/
│   │   ├── [...page].astro        # 메인 페이지 (페이지네이션, 5개/페이지)
│   │   ├── posts/[...slug].astro  # 개별 포스트 페이지
│   │   ├── [year]/[month]/index.astro  # 월별 아카이브
│   │   └── rss.xml.ts            # RSS 피드 (최근 20개)
│   └── styles/
│       └── global.css     # 전역 스타일 (폰트, 색상, 타이포그래피)
├── public/
│   ├── avatar.png
│   └── favicon.svg
├── scripts/
│   └── migrate.mjs        # Tumblr 마이그레이션 스크립트 (일회성, 사용 완료)
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## Architecture Decisions

### Content Collection (Astro Content Layer)

블로그 포스트는 `src/data/blog/` 아래 디렉토리 기반 구조를 사용합니다.

```
src/data/blog/{slug}/index.md    # 포스트 본문 + frontmatter
src/data/blog/{slug}/*.png       # 해당 포스트의 인라인 이미지
```

Frontmatter 스키마 (`content.config.ts`):

```yaml
title: string       # 필수
date: Date          # 필수 (자동 coerce)
draft: boolean      # 선택 (기본: false)
tags: string[]      # 선택 (기본: [])
```

`glob` 로더를 사용하며, 패턴은 `*/index.md`입니다.

### 스타일링 전략

- **전역 스타일**: `src/styles/global.css` — 폰트, CSS 변수(색상), word-break 등
- **컴포넌트 스타일**: 각 `.astro` 파일의 `<style>` 블록 (Astro scoped CSS)
- **포스트 본문**: Tailwind Typography 플러그인 (`prose` 클래스)
- **다크 모드**: `prefers-color-scheme: dark` 미디어 쿼리 (CSS 변수 자동 전환)

색상 변수는 `global.css`의 `:root`에서 정의합니다:

| 변수 | 용도 |
|------|------|
| `--color-accent` | 링크, hover 색상 (#dd3333) |
| `--color-muted` | 부가 텍스트, 날짜 (#555) |
| `--color-border` | 구분선 (#ccc) |
| `--color-sidebar-bg` | 사이드바 배경 (#eee) |
| `--color-bg` | 페이지 배경 (#fff) |
| `--color-text` | 본문 텍스트 (#222) |

### 한국어 최적화

- `word-break: keep-all` — 한국어 어절 단위 줄바꿈
- `overflow-wrap: break-word` — 긴 URL이 레이아웃을 깨지 않도록 보호
- 날짜 포맷은 `ko-KR` 로케일 사용 (`2024년 1월 15일`)

### 레이아웃 구조

```
┌─────────────────────────┐
│  site-title (YCN)       │  ← header
├──────────┬──────────────┤
│ Sidebar  │ Main Content │  ← grid: 160px | 1fr
│ (About)  │ (Posts)      │
│ (Archive)│ (Footer)     │
└──────────┴──────────────┘
          max-width: 720px

모바일 (≤768px): 단일 컬럼 (Sidebar 위, Content 아래)
```

## Local Development

### 사전 요구사항

- Node.js 18+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 새 포스트 작성

```bash
# 1. 디렉토리 생성
mkdir -p src/data/blog/my-new-post

# 2. index.md 작성
cat > src/data/blog/my-new-post/index.md << 'EOF'
---
title: "포스트 제목"
date: 2026-02-22
tags: ["design", "ux"]
---

본문 내용 (Markdown)
EOF

# 3. 이미지가 필요한 경우, 같은 디렉토리에 배치
cp photo.png src/data/blog/my-new-post/
# Markdown에서 참조: ![alt](./photo.png)
```

### Draft 포스트

Frontmatter에 `draft: true`를 설정하면 빌드에서 제외됩니다.

## Deployment

`master` 브랜치에 push하면 GitHub Actions가 자동으로 빌드 및 배포합니다.

### 워크플로우: `.github/workflows/deploy.yml`

```
push to master → Checkout → Setup Pages → Build with Astro → Deploy to GitHub Pages
```

### 주의사항

- `withastro/action@v3`이 내부적으로 `actions/upload-pages-artifact@v3`를 실행합니다. 별도의 Upload artifact 스텝을 추가하면 **409 Conflict**가 발생합니다.
- `concurrency.cancel-in-progress: true`로 설정되어 있어, 이전 배포가 진행 중이면 자동 취소됩니다.
- 리포지토리는 **public**이어야 합니다 (GitHub Free 플랜에서 Pages 사용 조건).

### 수동 배포

GitHub Actions 탭에서 "Run workflow" 버튼으로 수동 트리거도 가능합니다 (`workflow_dispatch`).

## RSS

RSS 피드: https://ycnam.github.io/rss.xml (최근 20개 포스트)

## Git Remote

```
origin → git@github.com-personal:ycnam/ycnam.github.io.git
```

기본 브랜치: `master`
