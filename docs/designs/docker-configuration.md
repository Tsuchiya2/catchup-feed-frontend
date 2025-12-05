# Design Document - Docker Configuration (Development Only)

**Feature ID**: FEAT-001
**Created**: 2025-11-29
**Last Updated**: 2025-11-29
**Designer**: designer agent

---

## Metadata

```yaml
design_metadata:
  feature_id: "FEAT-001"
  feature_name: "Docker Configuration for catchup-feed-web (Development Only)"
  created: "2025-11-29"
  updated: "2025-11-29"
  iteration: 2
  target_platform: "Next.js 15, React 19, Docker (Dev), Vercel (Production)"
```

---

## 1. Overview

### 1.1 Summary

This design document outlines the Docker configuration for catchup-feed-web, a Next.js 15 frontend application that integrates with the catchup-feed Go backend. **Docker is used exclusively for local development**, while **production deployment is handled by Vercel**.

The Docker setup includes:
- Development-focused Dockerfile with hot reload
- Docker Compose for local development environment
- Network integration with catchup-feed backend (local development)
- Health checks for container monitoring

Production deployment leverages Vercel's platform:
- Automatic builds from Git repository
- Edge network deployment
- Environment variable management via Vercel dashboard
- API integration with backend via Cloudflare Tunnel public URL

### 1.2 Goals and Objectives

**Primary Goals:**
1. Provide containerized development environment with hot reload
2. Seamlessly integrate with local catchup-feed backend network
3. Ensure fast development iteration cycles
4. Support production deployment to Vercel
5. Maintain clear separation between dev and production environments

**Success Criteria:**
- Development environment starts in < 30 seconds
- Hot reload works without manual restarts
- Frontend can communicate with backend API via shared Docker network
- Production deployment to Vercel completes in < 5 minutes
- Environment variables properly configured for both environments

### 1.3 Non-Goals

- Production Docker deployment (handled by Vercel)
- Raspberry Pi 5 deployment (production is on Vercel)
- Multi-architecture builds (development only, no ARM64 needed)
- Production-level security hardening in Docker (not needed for dev)
- CI/CD pipeline configuration (Vercel handles this automatically)

---

## 2. Requirements Analysis

### 2.1 Functional Requirements

**FR-1: Development Dockerfile**
- **Priority**: P0 (Critical)
- **Description**: Create Dockerfile with deps and dev stages for development
- **Acceptance Criteria**:
  - deps stage: Install and cache dependencies
  - dev stage: Development environment with hot reload support
  - Fast startup time (< 30 seconds)
  - Volume mounts for source code changes

**FR-2: Development Docker Compose**
- **Priority**: P0 (Critical)
- **Description**: Docker Compose configuration for local development
- **Acceptance Criteria**:
  - Hot reload support via volume mounts
  - Connect to catchup-feed backend network
  - Environment variables from .env file
  - Easy to start/stop with simple commands

**FR-3: Backend Network Integration**
- **Priority**: P0 (Critical)
- **Description**: Connect to existing catchup-feed backend network
- **Acceptance Criteria**:
  - Use external network "backend" (172.25.0.0/16)
  - Access backend API at http://app:8080
  - Environment variable NEXT_PUBLIC_API_URL configurable

**FR-4: Vercel Production Configuration**
- **Priority**: P0 (Critical)
- **Description**: Environment variables and build configuration for Vercel
- **Acceptance Criteria**:
  - Environment variables configured in Vercel dashboard
  - Build settings optimized for Next.js 15
  - API URL points to production backend (via Cloudflare Tunnel)
  - Automatic deployments from main branch

### 2.2 Non-Functional Requirements

**NFR-1: Development Performance**
- Hot reload latency: < 1 second
- Container startup time: < 30 seconds
- No resource limits (development machine can handle it)

**NFR-2: Simplicity**
- Single docker compose up command to start
- Clear documentation for developers
- Minimal configuration required
- No complex multi-stage builds

**NFR-3: Production Performance (Vercel)**
- Build time: < 5 minutes
- Global CDN edge deployment
- Automatic HTTPS
- Zero-downtime deployments

**NFR-4: Maintainability**
- Clear separation of dev and prod configurations
- Well-documented environment variables
- Consistent naming with backend services

### 2.3 Constraints

**Development Constraints:**
- Must run on macOS/Linux development machines
- Must integrate with existing catchup-feed network architecture
- Next.js 15 requires Node.js 18.18.0 or higher
- Docker Compose v2 required

**Production Constraints:**
- Vercel platform requirements (Node.js 18.x)
- Backend API accessible via Cloudflare Tunnel public URL
- Environment variables managed via Vercel dashboard
- No Docker involved in production

---

## 3. Architecture Design

### 3.1 System Architecture Diagram

```
Development Environment (Local Machine):
┌─────────────────────────────────────────────────────────────────────────┐
│  Docker Desktop / Docker Engine                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Docker Compose Stack                                             │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │  catchup-feed Backend (existing)                            │ │  │
│  │  │  ┌──────────┐  ┌──────┐  ┌────────┐                        │ │  │
│  │  │  │PostgreSQL│  │  API │  │ Worker │                        │ │  │
│  │  │  │  :5432   │  │ :8080│  │ :9091  │                        │ │  │
│  │  │  └──────────┘  └──────┘  └────────┘                        │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │  catchup-feed-web Frontend (new)                            │ │  │
│  │  │  ┌──────────────────────────────────────────────┐           │ │  │
│  │  │  │  web-dev (development)                       │           │ │  │
│  │  │  │  - Port: 3000                                │           │ │  │
│  │  │  │  - Hot Reload: Enabled                       │           │ │  │
│  │  │  │  - Volume: ./src:/app/src (bind mount)       │           │ │  │
│  │  │  │  - Volume: ./public:/app/public              │           │ │  │
│  │  │  │  - Volume: node_modules (named volume)       │           │ │  │
│  │  │  │                                              │           │ │  │
│  │  │  │  Environment:                                │           │ │  │
│  │  │  │  - NEXT_PUBLIC_API_URL=http://app:8080      │           │ │  │
│  │  │  │  - NODE_ENV=development                      │           │ │  │
│  │  │  └──────────────────────────────────────────────┘           │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  │                                                                   │  │
│  │  Network: backend (bridge) - 172.25.0.0/16                       │  │
│  │  ┌─────────────────────────────────────────────────────────────┐ │  │
│  │  │  postgres:5432 ◄──► app:8080 ◄──► web-dev:3000             │ │  │
│  │  │                                    │                         │ │  │
│  │  │                       API Requests │                         │ │  │
│  │  │     (http://app:8080/api/*)        ▼                         │ │  │
│  │  └─────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Developer Access:                                                      │
│  - http://localhost:3000 (Frontend)                                    │
│  - http://localhost:8080 (Backend API)                                 │
└─────────────────────────────────────────────────────────────────────────┘

Production Environment (Vercel + Cloudflare):
┌─────────────────────────────────────────────────────────────────────────┐
│                         Internet                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  User Browser (HTTPS)                                             │  │
│  │  https://your-app.vercel.app                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Vercel Edge Network                                              │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Next.js Frontend (catchup-feed-web)                        │  │  │
│  │  │  - Auto-deployed from Git                                   │  │  │
│  │  │  - Global CDN                                               │  │  │
│  │  │  - Automatic HTTPS                                          │  │  │
│  │  │  - Environment: NEXT_PUBLIC_API_URL=https://api.domain.com  │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                    │
│                                    │ API Requests                       │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Cloudflare Tunnel                                                │  │
│  │  https://api.your-domain.com                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                    │
│                                    ▼                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Raspberry Pi 5 (Backend)                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  catchup-feed Backend                                       │  │  │
│  │  │  - PostgreSQL, API, Worker                                  │  │  │
│  │  │  - Exposed via Cloudflare Tunnel                            │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Breakdown

**1. Dockerfile (Development Only)**

**Stage 1: deps (Dependencies)**
- Base: node:20-alpine
- Purpose: Install and cache npm dependencies
- Outputs: node_modules directory
- Cache Strategy: Copy package*.json first, then install

**Stage 2: dev (Development)**
- Base: deps stage
- Purpose: Development environment with hot reload
- Features: Dev dependencies, debugging tools, fast refresh
- Command: npm run dev
- Volume Mounts: Source code, public assets

**2. compose.yml (Development Only)**

**Service: web**
- Build: dev stage from Dockerfile
- Container Name: catchup-web-dev
- Network: backend (external, shared with catchup-feed)
- Port: 3000
- Volumes: Bind mounts for hot reload
- Environment: Development variables
- No resource limits (local development)

**3. Network Configuration**

**External Network: backend**
- Driver: bridge
- Subnet: 172.25.0.0/16 (existing from catchup-feed)
- Purpose: Inter-container communication during development
- Access: web-dev → app (API), app → postgres (DB)

**4. Vercel Configuration**

**Build Settings:**
- Framework Preset: Next.js
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)
- Node.js Version: 18.x

**Environment Variables (Vercel Dashboard):**
- `NEXT_PUBLIC_API_URL`: Production backend URL (via Cloudflare Tunnel)
- `NODE_ENV`: production (automatic)

### 3.3 Data Flow

**Development Request Flow:**
```
Browser (localhost:3000)
    ↓ (HTTP)
Next.js Dev Server (web-dev:3000)
    ↓ (API Request via NEXT_PUBLIC_API_URL)
Backend API (app:8080) [Docker network]
    ↓
PostgreSQL (postgres:5432)
```

**Production Request Flow:**
```
User Browser (HTTPS)
    ↓
Vercel Edge Network (CDN)
    ↓
Next.js Server (Vercel serverless)
    ↓ (API Request via NEXT_PUBLIC_API_URL)
Backend API (https://api.your-domain.com) [Cloudflare Tunnel]
    ↓
Raspberry Pi 5 - catchup-feed Backend
    ↓
PostgreSQL (postgres:5432)
```

---

## 4. Data Model

### 4.1 Environment Variables

**Development Environment Variables (.env):**

```bash
# Node Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://app:8080
# For local backend in Docker network

# Alternative: If running backend outside Docker
# NEXT_PUBLIC_API_URL=http://localhost:8080

# Development Options
WATCHPACK_POLLING=true
# Enable if hot reload doesn't work on macOS/Windows
```

**Production Environment Variables (Vercel Dashboard):**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com
# Production backend via Cloudflare Tunnel

# Node Environment (automatic by Vercel)
NODE_ENV=production

# Optional: Disable telemetry
NEXT_TELEMETRY_DISABLED=1
```

### 4.2 Volume Structure

**Development Volumes (compose.yml):**

```yaml
volumes:
  # Source code (bind mount for hot reload)
  - type: bind
    source: ./src
    target: /app/src

  # Public assets (bind mount)
  - type: bind
    source: ./public
    target: /app/public

  # Configuration files (bind mount)
  - type: bind
    source: ./next.config.ts
    target: /app/next.config.ts
  - type: bind
    source: ./tailwind.config.ts
    target: /app/tailwind.config.ts
  - type: bind
    source: ./tsconfig.json
    target: /app/tsconfig.json
  - type: bind
    source: ./package.json
    target: /app/package.json
  - type: bind
    source: ./package-lock.json
    target: /app/package-lock.json

  # Dependency cache (named volume - faster on macOS/Windows)
  - type: volume
    source: node_modules
    target: /app/node_modules

  # Next.js cache (named volume)
  - type: volume
    source: nextjs_cache
    target: /app/.next
```

**Production Volumes (Vercel):**
- No volumes required
- Vercel handles build artifacts and caching automatically

### 4.3 Network Configuration

**Development Network:**
```yaml
networks:
  backend:
    external: true
    name: catchup-feed_backend
    # References existing network created by catchup-feed
```

**Network Details:**
- Driver: bridge
- Subnet: 172.25.0.0/16
- Gateway: 172.25.0.1
- DNS: Docker embedded DNS server
- Service Discovery: Via container names (app, postgres, web-dev)

**Production Network:**
- No Docker network
- Internet-based communication via HTTPS
- Backend accessed via Cloudflare Tunnel public URL

---

## 5. API Design

### 5.1 Health Check Endpoint

**Endpoint:** `GET /api/health`

**Purpose:** Container health verification (development) and deployment verification (production)

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:3000
```

**Response (Healthy):**
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "healthy",
  "timestamp": "2025-11-29T12:00:00Z",
  "uptime": 3600,
  "version": "0.1.0",
  "environment": "development"
}
```

**Response (Unhealthy):**
```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json

{
  "status": "unhealthy",
  "error": "Backend API unreachable"
}
```

**Implementation:**
- Location: `src/app/api/health/route.ts`
- Check: Basic health status
- Optional: Backend API connectivity check
- Used by: Docker health check (dev), monitoring (prod)

### 5.2 Backend API Integration

**Environment Variable:** `NEXT_PUBLIC_API_URL`

**Values:**
- Development: `http://app:8080` (Docker network)
- Production: `https://api.your-domain.com` (Cloudflare Tunnel)

**API Client Configuration:**

```typescript
// src/lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

**Usage in Components:**

```typescript
// Server Component
async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feeds`);
  return res.json();
}

// Client Component
import { useQuery } from '@tanstack/react-query';

function useFeeds() {
  return useQuery({
    queryKey: ['feeds'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feeds`);
      return res.json();
    },
  });
}
```

---

## 6. Security Considerations

### 6.1 Development Security

**Development is not production-hardened** - security focus is minimal since it's local only.

**Basic Security Practices:**
- Don't commit .env files (use .env.example)
- Don't expose development ports to public network
- Use HTTPS in production (handled by Vercel automatically)

### 6.2 Production Security (Vercel)

**Automatic Security Features:**
- HTTPS by default (automatic SSL certificates)
- DDoS protection
- Edge network security
- Automatic security updates

**Environment Variables:**
- Stored securely in Vercel dashboard
- Never committed to Git
- `NEXT_PUBLIC_*` variables are exposed to browser (by design)
- Non-public secrets should NOT use `NEXT_PUBLIC_` prefix

**Backend Communication:**
- Backend API protected by Cloudflare Tunnel
- No direct exposure to internet
- Only accessible via Cloudflare's secure tunnel

### 6.3 Best Practices

**Development:**
- Keep Docker images updated
- Don't run development containers as root (already non-root in Node.js image)
- Use .gitignore to prevent committing secrets

**Production:**
- Use Vercel's environment variable encryption
- Rotate API keys periodically
- Monitor Vercel security advisories
- Enable Vercel's security headers

---

## 7. Error Handling

### 7.1 Development Container Errors

**Error 1: Port Already in Use**

```
Error: bind: address already in use
```

**Cause:** Port 3000 already bound by another process

**Recovery:**
```bash
# Check what's using port 3000
lsof -i :3000

# Stop conflicting process or change port in compose.yml
ports:
  - "3001:3000"
```

**Error 2: Network Not Found**

```
Error: network catchup-feed_backend not found
```

**Cause:** Backend stack not running

**Recovery:**
```bash
# Start backend first
cd /Users/yujitsuchiya/catchup-feed
docker compose up -d

# Verify network exists
docker network ls | grep backend

# Then start frontend
cd /Users/yujitsuchiya/catchup-feed-web
docker compose up -d
```

**Error 3: Hot Reload Not Working**

**Cause:** File system watching issues on macOS/Windows

**Recovery:**
```bash
# Enable polling in .env
WATCHPACK_POLLING=true

# Restart container
docker compose restart
```

### 7.2 Production Errors (Vercel)

**Error 1: Build Failed**

**Cause:** TypeScript errors, missing dependencies, configuration issues

**Recovery:**
1. Check Vercel build logs
2. Test build locally: `npm run build`
3. Fix errors and push to Git
4. Vercel will automatically retry

**Error 2: Environment Variables Not Set**

**Cause:** Missing environment variables in Vercel dashboard

**Recovery:**
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL=https://api.your-domain.com`
3. Redeploy from dashboard

**Error 3: API Connection Failed**

**Cause:** Backend not accessible or Cloudflare Tunnel down

**Recovery:**
1. Verify backend is running on Raspberry Pi
2. Check Cloudflare Tunnel status
3. Test API URL directly: `curl https://api.your-domain.com/health`
4. Update API URL in Vercel if changed

### 7.3 Monitoring

**Development Monitoring:**
```bash
# Watch logs
docker compose logs -f

# Check container status
docker compose ps

# View resource usage
docker stats catchup-web-dev
```

**Production Monitoring (Vercel):**
- Vercel Analytics (automatic)
- Real-time logs in Vercel dashboard
- Performance metrics in Vercel dashboard
- Error tracking via Vercel integration

---

## 7.5 Observability & Monitoring

### Development Observability

**Docker Container Health Check:**

```yaml
# compose.yml
services:
  web:
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Structured Logging (Console):**

Development uses console logging for simplicity. Logs include:
- Request method and URL
- Response status and timing
- Error stack traces

```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, context?: object) => {
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...context }));
  },
  error: (message: string, error?: Error, context?: object) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.message, stack: error?.stack, timestamp: new Date().toISOString(), ...context }));
  },
  warn: (message: string, context?: object) => {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...context }));
  },
};
```

**Request Tracking:**

```typescript
// Middleware for request tracking
export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  return response;
}
```

### Production Observability (Vercel)

**Built-in Vercel Features:**
- **Vercel Analytics**: Automatic page views, Web Vitals (LCP, FID, CLS)
- **Real-time Logs**: Function execution logs with filtering
- **Error Tracking**: Automatic error capture with stack traces
- **Performance Insights**: Response times, cold start analysis

**Recommended Integrations (Optional):**
- **Sentry**: Error tracking with detailed context (free tier available)
- **LogRocket**: Session replay and error tracking
- **Datadog**: Full observability (enterprise)

**Health Check Endpoint:**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV,
  };

  // Optional: Check backend connectivity
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      const response = await fetch(`${backendUrl}/health`, {
        signal: AbortSignal.timeout(2000)
      });
      health.backend = response.ok ? 'connected' : 'error';
    }
  } catch (error) {
    health.backend = 'unreachable';
  }

  return NextResponse.json(health);
}
```

**Alerting Strategy:**
- **Development**: Manual log monitoring via `docker compose logs -f`
- **Production**: Vercel deployment notifications via Slack/Email integration
- **Backend Failures**: Health check endpoint returns 503, Vercel shows in logs

### Metrics Summary

| Metric | Development | Production (Vercel) |
|--------|-------------|---------------------|
| Logs | `docker compose logs` | Vercel Dashboard |
| Errors | Console output | Vercel Error Tracking |
| Performance | Browser DevTools | Vercel Analytics |
| Health | `/api/health` endpoint | `/api/health` endpoint |
| Uptime | Manual check | Vercel Status |

---

## 8. Testing Strategy

### 8.1 Development Docker Testing

**Test 1: Container Startup**

```bash
# Start container
docker compose up -d

# Verify running
docker compose ps

# Check logs
docker compose logs

# Test health endpoint
curl http://localhost:3000/api/health
```

**Expected:** Container starts within 30 seconds, health check returns 200.

**Test 2: Hot Reload**

```bash
# Edit source file
echo "export default function Test() { return <div>Test</div> }" > src/app/test/page.tsx

# Check logs for rebuild
docker compose logs -f
```

**Expected:** Changes detected within 1 second, page auto-reloads.

**Test 3: Backend Connectivity**

```bash
# Test from container
docker compose exec web-dev ping app
docker compose exec web-dev wget -O- http://app:8080/health

# Test from browser
curl http://localhost:3000/api/feeds
```

**Expected:** Backend accessible, API calls work.

### 8.2 Production Testing (Vercel)

**Test 1: Deployment**

1. Push code to Git repository
2. Check Vercel dashboard for automatic build
3. Verify deployment preview URL
4. Test deployment: `curl https://your-deployment.vercel.app/api/health`

**Expected:** Deployment completes in < 5 minutes, health check returns 200.

**Test 2: Environment Variables**

```bash
# Test API URL in production
curl https://your-app.vercel.app
# View source, check for NEXT_PUBLIC_API_URL

# Test API connection
curl https://your-app.vercel.app/api/feeds
```

**Expected:** API URL correctly configured, backend accessible.

**Test 3: Edge Cases**

1. Test with broken backend URL
2. Test with missing environment variables
3. Test rollback to previous deployment

**Expected:** Graceful error handling, easy rollback via Vercel dashboard.

---

## 9. Development Workflow

### 9.1 Initial Setup

**Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/catchup-feed-web.git
cd catchup-feed-web
```

**Step 2: Create Environment File**
```bash
cp .env.example .env
```

Edit `.env`:
```bash
NEXT_PUBLIC_API_URL=http://app:8080
NODE_ENV=development
WATCHPACK_POLLING=true
```

**Step 3: Start Backend**
```bash
cd /Users/yujitsuchiya/catchup-feed
docker compose up -d
```

**Step 4: Start Frontend**
```bash
cd /Users/yujitsuchiya/catchup-feed-web
docker compose up -d
```

**Step 5: Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### 9.2 Daily Development

**Start Development:**
```bash
# Start all services
docker compose up -d

# Watch logs
docker compose logs -f
```

**Make Changes:**
```bash
# Edit files in src/
vim src/app/page.tsx

# Hot reload applies changes automatically
# Check browser - changes appear immediately
```

**Run Tests:**
```bash
# Inside container
docker compose exec web-dev npm test

# Or on host (if Node.js installed)
npm test
```

**Stop Development:**
```bash
# Stop containers
docker compose down

# Or keep running for next session
docker compose stop
```

### 9.3 Troubleshooting

**Issue 1: Hot Reload Not Working**

**Solution:**
```bash
# Enable polling
WATCHPACK_POLLING=true

# Restart
docker compose restart
```

**Issue 2: Backend Not Accessible**

**Solution:**
```bash
# Verify backend running
cd /Users/yujitsuchiya/catchup-feed
docker compose ps

# Check network
docker network ls | grep backend
```

**Issue 3: Port Conflict**

**Solution:**
```bash
# Change port in compose.yml
ports:
  - "3001:3000"

# Restart
docker compose down && docker compose up -d
```

---

## 10. Production Deployment Workflow (Vercel)

### 10.1 Initial Vercel Setup

**Step 1: Install Vercel CLI (Optional)**
```bash
npm install -g vercel
```

**Step 2: Connect Repository to Vercel**

1. Go to https://vercel.com
2. Click "New Project"
3. Import Git repository
4. Select `catchup-feed-web` repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: (default)
   - Output Directory: (default)

**Step 3: Configure Environment Variables**

In Vercel Dashboard → Project → Settings → Environment Variables:

```
Name: NEXT_PUBLIC_API_URL
Value: https://api.your-domain.com
Environment: Production, Preview, Development
```

**Step 4: Deploy**

1. Click "Deploy"
2. Wait for build to complete (~3-5 minutes)
3. Access deployment URL: `https://your-app.vercel.app`

**Step 5: Configure Custom Domain (Optional)**

1. Vercel Dashboard → Project → Settings → Domains
2. Add domain: `your-app.com`
3. Configure DNS (follow Vercel instructions)
4. Wait for SSL certificate (automatic)

### 10.2 Continuous Deployment

**Automatic Deployments:**
- Push to `main` branch → Automatic production deployment
- Push to other branches → Automatic preview deployment
- Pull requests → Automatic preview deployment with unique URL

**Manual Deployment:**
```bash
# From local machine
vercel --prod

# Or via Git
git push origin main
# Vercel automatically deploys
```

### 10.3 Rollback

**Via Vercel Dashboard:**
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

**Via Vercel CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### 10.4 Monitoring Production

**Vercel Analytics:**
- Real-time visitor analytics
- Web Vitals metrics
- Performance insights

**Vercel Logs:**
- Function logs in real-time
- Error tracking
- Request/response logs

**Health Monitoring:**
```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test API integration
curl https://your-app.vercel.app/api/feeds
```

---

## 11. File Structure

### 11.1 Deliverables

**Primary Files:**

```
catchup-feed-web/
├── Dockerfile                    # Development-only Dockerfile (deps + dev stages)
├── .dockerignore                 # Docker build exclusions
├── compose.yml                   # Development Docker Compose
├── .env.example                  # Environment variable template
├── vercel.json                   # Vercel configuration (optional)
└── docs/
    └── designs/
        └── docker-configuration.md   # This document
```

**Supporting Files:**

```
catchup-feed-web/
├── src/
│   └── app/
│       └── api/
│           └── health/
│               └── route.ts      # Health check endpoint
├── next.config.ts                # Next.js configuration
└── package.json                  # Dependencies and scripts
```

### 11.2 File Specifications

**Dockerfile:**
- Location: `/Users/yujitsuchiya/catchup-feed-web/Dockerfile`
- Stages: deps, dev (no build/runtime stages)
- Base Image: node:20-alpine
- Purpose: Development only

**compose.yml:**
- Location: `/Users/yujitsuchiya/catchup-feed-web/compose.yml`
- Format: Docker Compose v2 (YAML)
- Services: web (development only)
- Network: backend (external)
- No resource limits

**.env.example:**
- Location: `/Users/yujitsuchiya/catchup-feed-web/.env.example`
- Format: KEY=VALUE
- Contents: Development environment variables only

**vercel.json (Optional):**
- Location: `/Users/yujitsuchiya/catchup-feed-web/vercel.json`
- Format: JSON
- Purpose: Vercel-specific configuration (if needed)

---

## 12. Vercel-Specific Configuration

### 12.1 vercel.json

**Optional Configuration File:**

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.your-domain.com"
  }
}
```

**Note:** Most settings are auto-detected by Vercel, this file is only needed for customization.

### 12.2 Build Settings

**Recommended Vercel Settings:**

- **Framework Preset:** Next.js
- **Node.js Version:** 18.x (auto-detected from package.json)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Development Command:** `npm run dev` (default)

### 12.3 Environment Variables

**Production Variables (Vercel Dashboard):**

```
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

**Preview Variables (Optional):**

```
NEXT_PUBLIC_API_URL=https://staging-api.your-domain.com
```

**Development Variables (Vercel CLI):**

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 13. Summary

This design document provides a simplified Docker configuration for **development-only** use, with **production deployment handled by Vercel**.

**Key Differences from Original Design:**

1. **Removed:**
   - Production Docker stages (build, runtime)
   - Raspberry Pi 5 deployment configuration
   - Multi-architecture builds (ARM64)
   - Production resource limits
   - Production security hardening
   - Production Docker Compose

2. **Simplified:**
   - Dockerfile: Only deps + dev stages
   - Docker Compose: Development only
   - No complex multi-stage builds
   - No production deployment workflow

3. **Added:**
   - Vercel deployment configuration
   - Vercel environment variable setup
   - Vercel continuous deployment workflow
   - Production architecture via Vercel

**Development vs Production:**

| Aspect | Development | Production |
|--------|-------------|------------|
| Platform | Docker | Vercel |
| Backend URL | http://app:8080 (Docker network) | https://api.your-domain.com (Cloudflare Tunnel) |
| Deployment | `docker compose up` | `git push` (automatic) |
| Hot Reload | Yes | No (not needed) |
| Security | Minimal | Automatic (Vercel) |
| SSL | No | Automatic (Vercel) |
| CDN | No | Yes (Vercel Edge) |

**Next Steps:**

1. Implementation by frontend-worker
2. Testing on local development machine
3. Vercel account setup and repository connection
4. Environment variable configuration in Vercel
5. First production deployment

---

**Design Complete. Ready for Evaluation.**
