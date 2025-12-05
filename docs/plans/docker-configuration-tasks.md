# Task Plan - Docker Configuration (Development Only)

**Feature ID**: FEAT-001
**Feature Name**: Docker Configuration for catchup-feed-web (Development Only)
**Design Document**: docs/designs/docker-configuration.md
**Created**: 2025-11-29
**Planner**: planner agent

---

## Metadata

```yaml
task_plan_metadata:
  feature_id: "FEAT-001"
  feature_name: "Docker Configuration (Development Only)"
  total_tasks: 6
  estimated_duration: "2-3 hours"
  critical_path: ["TASK-001", "TASK-002", "TASK-003", "TASK-004", "TASK-005", "TASK-006"]
  parallelizable_tasks: ["TASK-001", "TASK-002"] # Can work on these simultaneously
  worker_types: ["frontend-worker-v1-self-adapting", "test-worker-v1-self-adapting"]
```

---

## 1. Overview

### Feature Summary

Implement Docker configuration for **development environment only**, with production deployment handled by Vercel. This includes:
- Development Dockerfile (deps + dev stages)
- Docker Compose for local development
- Network integration with catchup-feed backend
- Health check endpoint for monitoring
- Environment variable templates
- Optional structured logging utility

### Total Tasks: 6

### Execution Phases
1. **Phase 1: Docker Infrastructure** (Tasks 1-3) - Core Docker setup
2. **Phase 2: API & Utilities** (Tasks 4-5) - Health check and logging
3. **Phase 3: Testing & Documentation** (Task 6) - Verification

### Critical Path
All tasks are sequential and critical:
```
TASK-001 → TASK-002 → TASK-003 → TASK-004 → TASK-005 → TASK-006
```

### Parallel Opportunities
- TASK-001 (.dockerignore) and TASK-002 (.env.example) can be worked on simultaneously
- TASK-004 (health check) and TASK-005 (logger) can be implemented in parallel

---

## 2. Task Breakdown

### TASK-001: Create .dockerignore File

**Description**: Create Docker build context exclusion file to optimize build performance and security

**Dependencies**: None

**Deliverables**:
- File: `/Users/yujitsuchiya/catchup-feed-web/.dockerignore`
- Excludes: node_modules, .next, .git, development files, test files, documentation
- Follows Next.js best practices

**Definition of Done**:
- .dockerignore file exists with all necessary exclusions
- File format follows Docker ignore pattern syntax
- Excludes at minimum: node_modules, .next, .git, .env, *.md, tests/, docs/

**Estimated Complexity**: Low

**Assigned To**: frontend-worker-v1-self-adapting

**Acceptance Criteria**:
- File excludes all unnecessary files from Docker build context
- Docker build does not copy excluded files
- Build context size reduced (verify with `docker compose build --progress=plain`)

**Implementation Notes**:
```
# Expected exclusions
node_modules
.next
.git
.env
.env.local
*.md
tests/
docs/
.vscode/
.idea/
coverage/
*.log
```

---

### TASK-002: Create .env.example File

**Description**: Create environment variable template for development configuration

**Dependencies**: None

**Deliverables**:
- File: `/Users/yujitsuchiya/catchup-feed-web/.env.example`
- Contains: NODE_ENV, NEXT_PUBLIC_API_URL, WATCHPACK_POLLING
- Includes comments explaining each variable

**Definition of Done**:
- .env.example file exists with all required variables
- Each variable has descriptive comment
- Developer can copy to .env and start immediately

**Estimated Complexity**: Low

**Assigned To**: frontend-worker-v1-self-adapting

**Acceptance Criteria**:
- File contains all environment variables needed for development
- Comments explain purpose and default values
- No sensitive values included (template only)
- Format follows KEY=VALUE convention

**Implementation Notes**:
```bash
# Example content:
# Node Environment
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_URL=http://app:8080
# For local backend in Docker network
# Alternative: http://localhost:8080 if backend runs outside Docker

# Development Options
WATCHPACK_POLLING=true
# Enable if hot reload doesn't work on macOS/Windows
```

---

### TASK-003: Create Dockerfile (Development Only)

**Description**: Create multi-stage Dockerfile with deps and dev stages for development environment

**Dependencies**: [TASK-001]

**Deliverables**:
- File: `/Users/yujitsuchiya/catchup-feed-web/Dockerfile`
- Stage 1 (deps): Install and cache dependencies
- Stage 2 (dev): Development environment with hot reload
- Base image: node:20-alpine
- Optimized for fast rebuild times

**Definition of Done**:
- Dockerfile builds successfully
- deps stage caches dependencies efficiently
- dev stage runs Next.js dev server
- Build time < 30 seconds (after initial cache)
- Image size reasonable (no production optimization needed)

**Estimated Complexity**: Medium

**Assigned To**: frontend-worker-v1-self-adapting

**Acceptance Criteria**:
- Dockerfile has 2 stages: deps, dev
- Uses node:20-alpine as base image
- Properly caches package.json and package-lock.json
- WORKDIR set to /app
- Exposes port 3000
- CMD runs "npm run dev"
- Follows Docker best practices for layer caching

**Implementation Notes**:
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Development
FROM node:20-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

---

### TASK-004: Create compose.yml (Development Docker Compose)

**Description**: Create Docker Compose configuration for local development environment with backend network integration

**Dependencies**: [TASK-003]

**Deliverables**:
- File: `/Users/yujitsuchiya/catchup-feed-web/compose.yml`
- Service: web (development)
- Network: backend (external, connects to catchup-feed)
- Volumes: Source code bind mounts for hot reload
- Environment: Development variables from .env

**Definition of Done**:
- compose.yml file is valid YAML
- Service builds from Dockerfile (dev stage)
- Container connects to external "catchup-feed_backend" network
- Volume mounts enable hot reload (src/, public/, config files)
- Port 3000 exposed to host
- Environment variables loaded from .env file
- Health check configured for /api/health endpoint

**Estimated Complexity**: Medium

**Assigned To**: frontend-worker-v1-self-adapting

**Acceptance Criteria**:
- `docker compose up -d` starts successfully
- Container named "catchup-web-dev"
- Connects to existing backend network (172.25.0.0/16)
- Hot reload works when editing src/ files
- Can access backend at http://app:8080 from container
- Health check passes after startup
- No resource limits (development mode)

**Implementation Notes**:
```yaml
services:
  web:
    build:
      context: .
      target: dev
    container_name: catchup-web-dev
    ports:
      - "3000:3000"
    volumes:
      # Source code (bind mounts for hot reload)
      - ./src:/app/src
      - ./public:/app/public
      - ./next.config.ts:/app/next.config.ts
      - ./tailwind.config.ts:/app/tailwind.config.ts
      - ./tsconfig.json:/app/tsconfig.json
      - ./package.json:/app/package.json
      - ./package-lock.json:/app/package-lock.json
      # Named volumes for performance
      - node_modules:/app/node_modules
      - nextjs_cache:/app/.next
    env_file:
      - .env
    networks:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  backend:
    external: true
    name: catchup-feed_backend

volumes:
  node_modules:
  nextjs_cache:
```

---

### TASK-005: Implement Health Check Endpoint

**Description**: Create Next.js API route for health monitoring in development and production

**Dependencies**: [TASK-003, TASK-004] (needs Dockerfile and compose.yml for testing)

**Deliverables**:
- File: `/Users/yujitsuchiya/catchup-feed-web/src/app/api/health/route.ts`
- GET endpoint returning health status
- Includes: status, timestamp, uptime, version, environment
- Optional: Backend connectivity check

**Definition of Done**:
- route.ts file exists and compiles without errors
- GET request to /api/health returns 200 status
- Response is valid JSON with all required fields
- Backend connectivity check is optional and non-blocking
- Works in both development and production environments

**Estimated Complexity**: Low

**Assigned To**: frontend-worker-v1-self-adapting

**Acceptance Criteria**:
- Endpoint returns 200 status when healthy
- JSON response includes: status, timestamp, version, environment
- Backend check uses 2-second timeout (AbortSignal.timeout)
- If backend unreachable, still returns 200 with backend: "unreachable"
- No TypeScript errors
- Follows Next.js 15 App Router conventions

**Implementation Notes**:
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
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

---

### TASK-006: Implement Structured Logger Utility (Optional)

**Description**: Create simple structured logging utility for development debugging and production observability

**Dependencies**: None (standalone utility)

**Deliverables**:
- File: `/Users/yujitsuchiya/catchup-feed-web/src/lib/logger.ts`
- Methods: info, error, warn
- Output: JSON-formatted console logs with timestamp

**Definition of Done**:
- logger.ts file exists and exports logger object
- Methods: info(), error(), warn() implemented
- Logs include: level, message, timestamp, optional context
- Error logs include stack traces
- No external dependencies (uses console)

**Estimated Complexity**: Low

**Assigned To**: frontend-worker-v1-self-adapting

**Priority**: P2 (Nice to have, not critical)

**Acceptance Criteria**:
- TypeScript types properly defined
- All methods output JSON to console
- Timestamp in ISO 8601 format
- Error method captures error.message and error.stack
- No runtime errors
- Can be imported and used in any component/API route

**Implementation Notes**:
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, context?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  },
  error: (message: string, error?: Error, context?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...context
    }));
  },
  warn: (message: string, context?: object) => {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }));
  },
};
```

---

### TASK-007: Integration Testing & Verification

**Description**: Test the complete Docker development setup end-to-end

**Dependencies**: [TASK-004, TASK-005] (TASK-006 is optional and not required for testing)

**Deliverables**:
- Test script or manual test checklist
- Verification that all components work together
- Documentation of test results

**Definition of Done**:
- Docker container starts successfully
- Health check endpoint returns 200
- Hot reload works when editing files
- Backend connectivity verified (if backend running)
- All acceptance criteria from previous tasks verified
- Test results documented

**Estimated Complexity**: Low

**Assigned To**: test-worker-v1-self-adapting

**Acceptance Criteria**:
- `docker compose up -d` starts without errors
- Container status is "healthy" within 40 seconds
- `curl http://localhost:3000/api/health` returns valid JSON
- Editing src/app/page.tsx triggers rebuild (check logs)
- Browser shows changes within 1 second
- Can ping backend: `docker compose exec web-dev ping app`
- No error logs in container output

**Test Plan**:

**Test 1: Container Startup**
```bash
# Start containers
cd /Users/yujitsuchiya/catchup-feed-web
docker compose up -d

# Verify running
docker compose ps
# Expected: web service "Up" and "healthy"

# Check logs
docker compose logs
# Expected: "ready started server on 0.0.0.0:3000"
```

**Test 2: Health Check**
```bash
# Test health endpoint
curl http://localhost:3000/api/health
# Expected: {"status":"healthy", "timestamp":"...", "version":"0.1.0", "environment":"development"}

# Check health status
docker compose ps
# Expected: "(healthy)" indicator
```

**Test 3: Hot Reload**
```bash
# Edit a file
echo 'export default function Test() { return <div>Test Change</div> }' > src/app/test-page.tsx

# Watch logs
docker compose logs -f web
# Expected: "Compiled /test-page in XXms"

# Verify in browser
curl http://localhost:3000/test-page
# Expected: HTML with "Test Change"
```

**Test 4: Backend Connectivity (requires catchup-feed running)**
```bash
# Test ping
docker compose exec web-dev ping -c 1 app
# Expected: 1 packet transmitted, 1 received

# Test HTTP
docker compose exec web-dev wget -O- http://app:8080/health
# Expected: Backend health response
```

**Test 5: Logger Utility (if implemented)**
```typescript
// Test in src/app/api/test/route.ts
import { logger } from '@/lib/logger';

export async function GET() {
  logger.info('Test log message', { test: true });
  logger.warn('Warning message');
  logger.error('Error message', new Error('Test error'));
  return new Response('Check logs');
}
```

**Test 6: Environment Variables**
```bash
# Test environment variables
docker compose exec web-dev env | grep NEXT_PUBLIC
# Expected: NEXT_PUBLIC_API_URL=http://app:8080

docker compose exec web-dev env | grep NODE_ENV
# Expected: NODE_ENV=development
```

**Cleanup**:
```bash
# Stop containers
docker compose down

# Remove volumes (if needed)
docker compose down -v
```

---

## 3. Execution Sequence

### Phase 1: Docker Infrastructure (Tasks 1-4)
**Duration**: 1-2 hours

```
TASK-001 (.dockerignore) ──┐
                           ├──> TASK-003 (Dockerfile) ──> TASK-004 (compose.yml)
TASK-002 (.env.example) ───┘
```

**Parallel Opportunities**:
- TASK-001 and TASK-002 can be done simultaneously
- Both are independent prerequisites for TASK-003

**Critical**: TASK-004 must complete before Phase 2 testing

---

### Phase 2: API & Utilities (Tasks 5-6)
**Duration**: 30 minutes - 1 hour

```
TASK-005 (health check) ──┐
                          ├──> TASK-007 (testing)
TASK-006 (logger) ────────┘
```

**Parallel Opportunities**:
- TASK-005 and TASK-006 can be implemented in parallel
- Both are independent utilities

**Note**: TASK-006 is optional (P2 priority) and can be skipped if time-constrained

---

### Phase 3: Testing & Documentation (Task 7)
**Duration**: 30 minutes

```
TASK-007 (integration testing)
```

**Sequential**: Must wait for TASK-004 and TASK-005 to complete

**Critical**: This is the final gate before marking feature complete

---

## 4. Dependency Graph (ASCII)

```
TASK-001 (.dockerignore)
    |
    v
TASK-003 (Dockerfile)
    |
    v
TASK-004 (compose.yml)
    |
    v
TASK-005 (health check)
    |
    v
TASK-007 (integration testing)

TASK-002 (.env.example) ──> (no dependencies, standalone)

TASK-006 (logger) ──> (no dependencies, optional)
```

**Critical Path**:
TASK-001 → TASK-003 → TASK-004 → TASK-005 → TASK-007

**Total Critical Path Time**: ~2-3 hours

---

## 5. Risk Assessment

### Technical Risks

**Risk 1: Backend Network Not Available**
- **Severity**: Medium
- **Probability**: Medium
- **Impact**: Cannot test backend connectivity
- **Mitigation**:
  - Document how to create network manually if needed
  - Make backend connectivity check optional in health endpoint
  - Provide clear error messages if network missing
- **Recovery**:
  ```bash
  # Create network manually
  docker network create --subnet=172.25.0.0/16 catchup-feed_backend
  ```

**Risk 2: Hot Reload Not Working on macOS/Windows**
- **Severity**: Low
- **Probability**: Medium (common issue with Docker on macOS/Windows)
- **Impact**: Slower development iteration
- **Mitigation**:
  - Include WATCHPACK_POLLING=true in .env.example
  - Document polling option prominently
- **Recovery**:
  - Enable polling in .env
  - Restart container

**Risk 3: Port 3000 Already in Use**
- **Severity**: Low
- **Probability**: Low
- **Impact**: Container fails to start
- **Mitigation**:
  - Document how to check port usage
  - Make port configurable in compose.yml
- **Recovery**:
  ```bash
  # Change port in compose.yml
  ports:
    - "3001:3000"
  ```

**Risk 4: Node Modules Volume Performance on macOS**
- **Severity**: Low
- **Probability**: Low (mitigated by named volumes)
- **Impact**: Slow dependency installation
- **Mitigation**:
  - Use named volumes for node_modules (already in design)
  - Document alternative: run npm install on host
- **Recovery**: N/A (already mitigated)

---

### Dependency Risks

**Risk 1: catchup-feed Backend Not Running**
- **Severity**: Low
- **Probability**: Medium
- **Impact**: Cannot test full integration
- **Mitigation**:
  - Frontend should work standalone
  - Health check should not fail if backend unavailable
  - Document requirement to start backend first
- **Recovery**:
  - Start backend: `cd catchup-feed && docker compose up -d`

**Risk 2: Next.js 15 Compatibility Issues**
- **Severity**: Low
- **Probability**: Low
- **Impact**: Build errors or runtime issues
- **Mitigation**:
  - Use Node.js 20 (recommended for Next.js 15)
  - Follow Next.js 15 App Router conventions
  - Test with existing Next.js setup
- **Recovery**:
  - Check Next.js 15 documentation
  - Update Dockerfile base image if needed

---

### Process Risks

**Risk 1: Unclear Task Scope**
- **Severity**: Low
- **Probability**: Low
- **Impact**: Implementation deviates from design
- **Mitigation**:
  - Clear deliverables in each task
  - Reference design document sections
  - Include code examples in task notes
- **Recovery**:
  - Review design document Section 11 (File Structure)
  - Ask planner-evaluators for clarification

**Risk 2: Missing Prerequisites**
- **Severity**: Low
- **Probability**: Low
- **Impact**: Cannot complete tasks
- **Mitigation**:
  - Document all prerequisites clearly
  - Check Docker and Docker Compose versions
  - Verify catchup-feed backend network exists
- **Recovery**:
  - Install missing tools
  - Create network manually if needed

---

## 6. Testing Requirements

### Unit Testing
**Not applicable for this feature** - Configuration files and infrastructure code don't require traditional unit tests.

### Integration Testing
**Required**: TASK-007 provides comprehensive integration testing

**Test Coverage**:
- Docker container startup
- Health check endpoint functionality
- Hot reload capability
- Backend network connectivity
- Environment variable loading
- Volume mounts working correctly

**Success Criteria**:
- All 6 tests in TASK-007 pass
- No errors in container logs
- Health check returns 200 status
- Hot reload works within 1 second

---

### Manual Testing Checklist

**Pre-deployment Verification**:
- [ ] Docker Desktop/Engine running
- [ ] Docker Compose v2 installed
- [ ] catchup-feed backend network exists
- [ ] Port 3000 available

**Post-deployment Verification**:
- [ ] `docker compose up -d` succeeds
- [ ] Container status is "healthy"
- [ ] http://localhost:3000 accessible
- [ ] http://localhost:3000/api/health returns 200
- [ ] Edit src/app/page.tsx triggers rebuild
- [ ] Changes appear in browser within 1 second
- [ ] Backend accessible at http://app:8080 (from container)
- [ ] No error logs in `docker compose logs`

---

### Performance Testing

**Development Performance Targets** (from NFR-1):
- Container startup time: < 30 seconds
- Hot reload latency: < 1 second
- Build time (after cache): < 10 seconds

**Test Procedure**:
```bash
# Test 1: Container startup time
time docker compose up -d
# Expected: < 30 seconds

# Test 2: Hot reload latency
# 1. Start timer
# 2. Edit src/app/page.tsx
# 3. Watch browser for change
# Expected: < 1 second

# Test 3: Build time (with cache)
docker compose build
# Expected: < 10 seconds (after initial build)
```

---

## 7. Definition of Done (Overall)

### All Tasks Completed
- [ ] TASK-001: .dockerignore created
- [ ] TASK-002: .env.example created
- [ ] TASK-003: Dockerfile created and builds successfully
- [ ] TASK-004: compose.yml created and runs successfully
- [ ] TASK-005: Health check endpoint implemented and working
- [ ] TASK-006: Logger utility implemented (optional)
- [ ] TASK-007: All integration tests passing

### Functional Requirements Met
- [ ] Development environment starts in < 30 seconds (FR-1)
- [ ] Hot reload works without manual restarts (FR-2)
- [ ] Frontend connects to backend via Docker network (FR-3)
- [ ] Health check endpoint returns 200 status

### Non-Functional Requirements Met
- [ ] Hot reload latency < 1 second (NFR-1)
- [ ] Single `docker compose up` command to start (NFR-2)
- [ ] Clear separation of dev configuration (NFR-4)

### Testing Complete
- [ ] Container startup test passed
- [ ] Health check test passed
- [ ] Hot reload test passed
- [ ] Backend connectivity test passed (if backend running)
- [ ] Environment variables test passed

### Documentation
- [ ] All files have appropriate comments
- [ ] .env.example has descriptive comments
- [ ] README.md updated with Docker setup instructions (if exists)

### Code Quality
- [ ] No TypeScript compilation errors
- [ ] No Docker build warnings
- [ ] No runtime errors in container logs
- [ ] Follows Docker and Next.js best practices

---

## 8. Worker Assignment Strategy

### Frontend Worker (frontend-worker-v1-self-adapting)
**Responsible for**: TASK-001, TASK-002, TASK-003, TASK-004, TASK-005, TASK-006

**Rationale**:
- All tasks involve frontend infrastructure and Next.js code
- Frontend worker understands Next.js 15 conventions
- Can create TypeScript files with proper types
- Familiar with Docker and Docker Compose

**Skills Required**:
- Docker and Dockerfile syntax
- Docker Compose v2 YAML format
- Next.js 15 App Router
- TypeScript
- Environment variable configuration

---

### Test Worker (test-worker-v1-self-adapting)
**Responsible for**: TASK-007

**Rationale**:
- Specializes in integration testing
- Can verify all acceptance criteria
- Can document test results
- Ensures quality before feature completion

**Skills Required**:
- Docker CLI commands
- curl and wget for endpoint testing
- Log analysis
- Test documentation

---

## 9. Implementation Order

**Recommended Sequence**:

1. **Start with TASK-001 and TASK-002 in parallel** (15-20 minutes)
   - Simple files, no dependencies
   - Can be done simultaneously
   - Quick wins to build momentum

2. **TASK-003: Dockerfile** (30-45 minutes)
   - Critical foundation
   - Requires TASK-001 (.dockerignore)
   - Test build immediately

3. **TASK-004: compose.yml** (30-45 minutes)
   - Requires TASK-003 (Dockerfile)
   - Test startup immediately
   - Verify network connectivity

4. **TASK-005: Health check endpoint** (15-20 minutes)
   - Simple API route
   - Can be done while compose is starting
   - Test with curl immediately

5. **TASK-006: Logger utility (optional)** (15-20 minutes)
   - Can be done in parallel with TASK-005
   - Low priority, skip if time-constrained
   - Nice to have for debugging

6. **TASK-007: Integration testing** (30 minutes)
   - Final verification
   - Run all tests systematically
   - Document any issues found

**Total Estimated Time**: 2-3 hours (excluding optional TASK-006)

---

## 10. Rollback Plan

### If Tasks Fail

**TASK-003 (Dockerfile) Fails**:
- Check Dockerfile syntax with `docker compose build`
- Review base image availability: `docker pull node:20-alpine`
- Compare with design document Section 3.2
- Ask for planner-evaluator review

**TASK-004 (compose.yml) Fails**:
- Verify YAML syntax with `docker compose config`
- Check network exists: `docker network ls | grep backend`
- Test simplified version (minimal volumes first)
- Add complexity incrementally

**TASK-005 (Health Check) Fails**:
- Check TypeScript compilation: `npx tsc --noEmit`
- Test route in isolation (without backend check)
- Verify Next.js 15 route handler syntax
- Check Node.js version compatibility

**TASK-007 (Testing) Fails**:
- Review logs: `docker compose logs -f`
- Check container status: `docker compose ps`
- Verify prerequisites (backend running, network exists)
- Test each component individually

### Emergency Rollback
```bash
# Stop all containers
docker compose down

# Remove volumes (if corrupted)
docker compose down -v

# Clean Docker cache (if needed)
docker system prune -f

# Start from scratch
git checkout .
docker compose build --no-cache
docker compose up -d
```

---

## 11. Success Metrics

### Quantitative Metrics
- Container startup time: < 30 seconds ✓
- Hot reload latency: < 1 second ✓
- Build time (cached): < 10 seconds ✓
- Health check response time: < 100ms ✓
- Test pass rate: 100% (6/6 tests) ✓

### Qualitative Metrics
- Developer can start development with one command: `docker compose up -d` ✓
- Clear documentation in .env.example ✓
- No manual configuration required ✓
- Error messages are helpful ✓
- Logs are readable and informative ✓

### Business Metrics
- Time to first development session: < 5 minutes ✓
- Developer satisfaction: Can iterate quickly ✓
- Onboarding new developers: < 10 minutes ✓

---

## 12. Post-Implementation Tasks

### After Feature Complete

**Documentation Updates**:
- Update main README.md with Docker setup instructions
- Add troubleshooting section for common issues
- Document how to connect to backend network

**Knowledge Transfer**:
- Share Docker setup with team
- Document any gotchas discovered during implementation
- Create quick start guide

**Future Improvements** (Not in this feature):
- Add Docker health check dashboard
- Implement request ID tracking middleware
- Add performance profiling tools
- Set up Vercel deployment (separate feature)

---

## 13. Notes for Evaluators

### Design Alignment
- All tasks directly implement requirements from design document
- File paths match Section 11 (File Structure) exactly
- Implementation follows architecture in Section 3

### Task Granularity
- Tasks are small enough to complete in < 1 hour each
- Each task has clear deliverables and acceptance criteria
- Dependencies are minimal and well-defined

### Quality Assurance
- TASK-007 provides comprehensive testing
- Each task has Definition of Done
- Acceptance criteria are measurable

### Flexibility
- TASK-006 (logger) is optional (P2 priority)
- Tasks can be parallelized where noted
- Rollback plan provided for each task

---

**This task plan is ready for evaluation by planner-evaluators.**

**Total Estimated Duration**: 2-3 hours
**Critical Path Length**: 6 tasks (5 required + 1 optional)
**Worker Allocation**: 1 frontend-worker, 1 test-worker
**Risk Level**: Low (simple development setup, no production complexity)
