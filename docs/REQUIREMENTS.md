# Catchup Feed Web - Requirements Document

## Overview

This document outlines the requirements for the frontend application of [catchup-feed](https://github.com/Tsuchiya2/catchup-feed), an automated RSS/Atom feed aggregation and AI summarization system.

### Purpose

- Provide a web interface for viewing aggregated articles and their AI-generated summaries
- Serve as a portfolio project demonstrating full-stack development capabilities
- Demonstrate microservices architecture by separating frontend and backend into independent repositories

### Target Users

- **Primary**: The developer (admin) for personal use
- **Secondary**: Recruiters and hiring managers viewing the portfolio via demo account
- **Future**: Registered users (invite-only system)

---

## Architecture

### Microservices Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│                    catchup-feed-web                              │
│                      (Next.js)                                   │
│                                                                  │
│  - Server-Side Rendering (SSR)                                   │
│  - Client-Side Interactivity                                     │
│  - JWT Authentication                                            │
│  - Deployment: Vercel / Cloudflare Pages                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (OpenAPI)
                              │ JWT Bearer Token
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
│                      catchup-feed                                │
│                        (Go API)                                  │
│                                                                  │
│  - Article & Source Management                                   │
│  - AI Summarization (Claude / OpenAI)                            │
│  - RSS/Atom Feed Crawling                                        │
│  - Notification System (Discord, Slack)                          │
│  - Deployment: Cloud Run / ECS                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    └─────────────────┘
```

### API Contract

The frontend communicates with the backend via REST API. API specification is available at:
- Swagger UI: `http://localhost:8080/swagger/index.html`
- OpenAPI JSON: `http://localhost:8080/swagger/doc.json`

Type-safe API client will be generated from OpenAPI specification using `openapi-typescript`.

---

## Technology Stack

| Category | Technology | Version | Notes |
|----------|------------|---------|-------|
| **Framework** | Next.js | 15.x | App Router |
| **Language** | TypeScript | 5.x | Strict mode |
| **Styling** | Tailwind CSS | 4.x | Utility-first |
| **UI Components** | shadcn/ui | Latest | Radix-based components |
| **Data Fetching** | TanStack Query | 5.x | Caching, revalidation |
| **Form Handling** | React Hook Form + Zod | Latest | Type-safe validation |
| **Authentication** | Custom JWT | - | Self-implemented |
| **Testing** | Vitest + Testing Library | Latest | Unit & integration tests |
| **E2E Testing** | Playwright | Latest | Future implementation |
| **Linting** | ESLint + Prettier | Latest | Code quality |
| **API Types** | openapi-typescript | Latest | Generated from OpenAPI |

---

## Functional Requirements

### Authentication System

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Users must log in to access any content (articles, sources) | Must |
| AUTH-02 | JWT token obtained from backend `/auth/token` endpoint | Must |
| AUTH-03 | Token stored securely (localStorage with proper handling) | Must |
| AUTH-04 | Automatic redirect to login page for unauthenticated users | Must |
| AUTH-05 | Logout functionality to clear token and session | Must |
| AUTH-06 | Token refresh mechanism | Should |

### Public Pages (No Authentication)

| ID | Requirement | Priority |
|----|-------------|----------|
| PUB-01 | Landing page explaining the service | Must |
| PUB-02 | Login page with username/password form | Must |
| PUB-03 | Technology stack showcase for portfolio | Should |

### Protected Pages (Authentication Required)

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-01 | Dashboard with statistics and recent articles | Must |
| ART-01 | Article list with pagination | Must |
| ART-02 | Article filtering by source | Should |
| ART-03 | Article search by title/content | Should |
| ART-04 | Article detail page with AI summary | Must |
| ART-05 | Link to original article | Must |
| SRC-01 | Source list (read-only) | Must |
| SRC-02 | Source detail with article count and status | Should |

### User Features (Future Implementation)

| ID | Requirement | Priority |
|----|-------------|----------|
| USER-01 | Bookmark articles | Future |
| USER-02 | Custom notification settings | Future |
| USER-03 | Personal feed subscriptions | Future |

### Explicitly Excluded Features

The following features are intentionally NOT included in the web UI for security reasons:

- Source management (add/edit/delete) - Admin only via API/CLI
- User management - Admin only via API/CLI
- System configuration - Admin only via API/CLI

---

## Non-Functional Requirements

### Performance

| ID | Requirement | Target |
|----|-------------|--------|
| PERF-01 | Initial page load (LCP) | < 2.5s |
| PERF-02 | Time to Interactive (TTI) | < 3.5s |
| PERF-03 | API response caching | 60s stale time |

### Security

| ID | Requirement |
|----|-------------|
| SEC-01 | All API calls must include Authorization header |
| SEC-02 | No sensitive data in URL parameters |
| SEC-03 | XSS protection via React's default escaping |
| SEC-04 | CSRF protection via SameSite cookies (future) |

### Accessibility

| ID | Requirement |
|----|-------------|
| A11Y-01 | WCAG 2.1 AA compliance |
| A11Y-02 | Keyboard navigation support |
| A11Y-03 | Screen reader compatibility |

### Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

---

## Page Structure

```
/                       # Landing page (public)
/login                  # Login page (public)
/dashboard              # Dashboard (protected)
/articles               # Article list (protected)
/articles/[id]          # Article detail (protected)
/sources                # Source list (protected)
/sources/[id]           # Source detail (protected) - Future
/settings               # User settings (protected) - Future
/bookmarks              # Bookmarked articles (protected) - Future
```

---

## UI/UX Guidelines

### Design Principles

1. **Clean and Minimal** - Focus on content readability
2. **Responsive** - Mobile-first approach
3. **Accessible** - Clear contrast, proper focus states
4. **Consistent** - Use shadcn/ui component library

### Color Scheme

- Support both light and dark modes
- Use system preference by default
- Allow user toggle

### Typography

- Use system font stack for performance
- Clear hierarchy with proper heading levels
- Readable line length (60-80 characters)

---

## Development Guidelines

### Project Structure

```
catchup-feed-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Public pages (no auth)
│   │   ├── (auth)/             # Auth pages (login)
│   │   └── (protected)/        # Protected pages
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── articles/           # Article-related components
│   │   ├── sources/            # Source-related components
│   │   ├── layout/             # Layout components
│   │   └── common/             # Shared components
│   ├── lib/
│   │   ├── api/                # API client
│   │   └── auth/               # Auth utilities
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # TypeScript types (generated)
│   └── providers/              # React context providers
├── tests/                      # Test files
├── public/                     # Static assets
└── docs/                       # Documentation
```

### Code Standards

- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Prettier for code formatting
- Conventional commits for version control

### Testing Strategy

| Type | Coverage Target | Tools |
|------|-----------------|-------|
| Unit Tests | 80% | Vitest, Testing Library |
| Integration Tests | Key flows | Vitest, MSW |
| E2E Tests | Critical paths | Playwright (future) |

---

## API Endpoints Used

Based on the backend OpenAPI specification:

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/token` | POST | Obtain JWT token | No |
| `/articles` | GET | List all articles | Yes |
| `/articles/{id}` | GET | Get article detail | Yes |
| `/sources` | GET | List all sources | Yes |
| `/sources/{id}` | GET | Get source detail | Yes |
| `/health` | GET | Health check | No |

---

## Deployment

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Development | localhost:3000 | Local development |
| Preview | Auto-generated | PR previews |
| Production | TBD | Live site |

### CI/CD Pipeline

1. **On Pull Request**
   - Lint check
   - Type check
   - Unit tests
   - Build verification
   - Preview deployment

2. **On Merge to Main**
   - All PR checks
   - Production deployment

---

## Success Metrics

### Portfolio Goals

- Demonstrate full-stack development capability
- Show understanding of microservices architecture
- Exhibit modern React/Next.js best practices
- Display clean, maintainable code

### Technical Goals

- Lighthouse score > 90 for all categories
- Test coverage > 80%
- Zero critical security vulnerabilities
- Accessible to WCAG 2.1 AA standards

---

## References

- [catchup-feed Backend Repository](https://github.com/Tsuchiya2/catchup-feed)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Documentation](https://tanstack.com/query)
