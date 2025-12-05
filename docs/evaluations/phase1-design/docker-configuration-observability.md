# Design Observability Evaluation - Docker Configuration

**Evaluator**: design-observability-evaluator
**Design Document**: /Users/yujitsuchiya/catchup-feed-web/docs/designs/docker-configuration.md
**Evaluated**: 2025-11-29T00:00:00Z

---

## Overall Judgment

**Status**: Request Changes
**Overall Score**: 3.1 / 5.0

While the design includes basic observability features like health checks and structured logging configuration, it lacks comprehensive observability strategy including distributed tracing, detailed metrics collection, and proper log aggregation. The design needs improvements to ensure production systems can be effectively monitored and debugged.

---

## Detailed Scores

### 1. Logging Strategy: 2.5 / 5.0 (Weight: 35%)

**Findings**:
- Basic logging configuration present via Docker json-file driver
- Log rotation properly configured (10MB max, 3 files)
- No structured logging framework specified (only console.log mentioned in error handling)
- Missing log context fields (requestId, userId, trace ID)
- No centralized logging solution specified
- No log levels strategy defined

**Logging Framework**:
- Not specified for application code
- Docker json-file driver configured for container logs
- Console logging mentioned in error handling section (line 800, 857)

**Log Context**:
- Missing critical fields:
  - No requestId for request tracing
  - No userId for user action tracking
  - No trace ID for distributed tracing
  - No structured error logging with stack traces
- Timestamp only available from Docker driver, not application level

**Log Levels**:
- Not defined in application code
- No DEBUG, INFO, WARN, ERROR level strategy
- Only basic console logging mentioned

**Centralization**:
- Not specified
- Only Docker json-file driver (local files)
- No ELK, CloudWatch, Loki, or similar mentioned
- Future consideration mentions Prometheus but not for logs

**Issues**:
1. **No application-level structured logging**: Design relies on console.log which is not production-ready
2. **Missing log context**: Cannot trace requests across components or filter by user
3. **No centralized logging**: Logs remain on individual containers, difficult to aggregate and search
4. **Limited searchability**: json-file driver is not easily searchable across multiple instances

**Recommendation**:
Implement structured logging with a proper framework:

```typescript
// Use Winston or Pino for structured logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});

// Add request context middleware
export function withLogging(handler) {
  return async (req, res) => {
    const requestId = req.headers['x-request-id'] || generateId();
    const childLogger = logger.child({ requestId });
    req.log = childLogger;

    childLogger.info({
      event: 'request_start',
      method: req.method,
      path: req.url,
      userAgent: req.headers['user-agent'],
    });

    const startTime = Date.now();
    try {
      const result = await handler(req, res);
      childLogger.info({
        event: 'request_complete',
        duration: Date.now() - startTime,
        status: res.statusCode,
      });
      return result;
    } catch (error) {
      childLogger.error({
        event: 'request_error',
        duration: Date.now() - startTime,
        err: error,
      });
      throw error;
    }
  };
}
```

Add centralized logging:

```yaml
# compose.yml
logging:
  driver: loki
  options:
    loki-url: "http://loki:3100/loki/api/v1/push"
    loki-retries: "5"
    loki-batch-size: "400"
```

Or use log forwarding:

```yaml
# Deploy Promtail sidecar to forward logs to Loki
services:
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
```

### 2. Metrics & Monitoring: 3.0 / 5.0 (Weight: 30%)

**Findings**:
- Health check endpoint defined (/api/health)
- Resource monitoring via docker stats mentioned
- Basic metrics in health response (uptime, responseTime)
- Prometheus integration mentioned as "future consideration" (line 1738-1742, 1876-1894)
- No application-level metrics collection
- No SLI/SLO definitions
- No alert definitions beyond basic health checks

**Key Metrics**:
- Health check metrics:
  - uptime
  - responseTime
  - version
  - status (healthy/unhealthy)
- Container metrics (via docker stats):
  - Memory usage
  - CPU usage
- Missing metrics:
  - HTTP request duration by endpoint
  - Request count by status code
  - Error rate
  - Response time percentiles (p50, p95, p99)
  - API call latency to backend
  - Cache hit/miss rates
  - Page load times

**Monitoring System**:
- Docker health checks configured (15s interval, 5s timeout, 3 retries)
- Prometheus mentioned only as future enhancement
- No current monitoring system specified
- Basic resource monitoring via docker stats (manual)

**Alerts**:
- Health check failure (Docker will mark unhealthy)
- Future alert rules defined for Prometheus (lines 876-894):
  - FrontendDown (up == 0 for 1m)
  - HighMemoryUsage (> 450MB for 5m)
- No immediate alerting solution

**Dashboards**:
- Not mentioned
- No Grafana integration specified
- Only docker stats for manual monitoring

**Issues**:
1. **No application metrics**: Relying only on Docker health checks is insufficient
2. **No real-time monitoring**: docker stats is manual, not automated
3. **Limited alerting**: Only basic health check, no proactive monitoring
4. **No SLI/SLO definitions**: Cannot measure service quality objectively

**Recommendation**:
Implement application-level metrics collection:

```typescript
// src/lib/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

// HTTP metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
});

// Backend API metrics
export const backendApiDuration = new Histogram({
  name: 'backend_api_duration_seconds',
  help: 'Duration of backend API calls',
  labelNames: ['endpoint', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Application metrics
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Expose metrics endpoint
// src/app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { register } from 'prom-client';

export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}
```

Update Dockerfile to install prom-client:

```dockerfile
# In deps stage
RUN npm ci --only=production && \
    npm install prom-client
```

Add Prometheus scrape config:

```yaml
# prometheus.yml (in backend stack)
scrape_configs:
  - job_name: 'frontend'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

Define SLIs and SLOs:

```markdown
## Service Level Indicators (SLIs)
- **Availability**: Percentage of successful health checks
  - Target: 99.5% (SLO)
- **Latency**: p95 response time for page loads
  - Target: < 2 seconds (SLO)
- **Error Rate**: Percentage of 5xx responses
  - Target: < 1% (SLO)

## Alerts
- Page load p95 > 3s for 5 minutes
- Error rate > 5% for 2 minutes
- Backend API error rate > 10% for 1 minute
- Memory usage > 90% for 5 minutes
```

### 3. Distributed Tracing: 2.0 / 5.0 (Weight: 20%)

**Findings**:
- No distributed tracing framework mentioned
- No trace ID propagation between frontend and backend
- No OpenTelemetry, Jaeger, or Zipkin integration
- Health check includes backend connectivity check but no tracing
- Request flow documented but not instrumented

**Tracing Framework**:
- Not specified
- No OpenTelemetry mentioned
- No Jaeger or Zipkin mentioned

**Trace ID Propagation**:
- Not mentioned
- No x-trace-id or x-request-id headers in design
- Backend API calls (lines 506-539) do not include tracing headers

**Span Instrumentation**:
- Not mentioned
- No span creation for API calls, database queries, or external services

**Issues**:
1. **No end-to-end tracing**: Cannot trace requests from frontend → backend → database
2. **Missing trace context**: Cannot correlate logs across services
3. **No bottleneck identification**: Cannot identify slow components in request path
4. **Limited debugging**: Difficult to diagnose issues in distributed system

**Recommendation**:
Implement OpenTelemetry for distributed tracing:

```typescript
// src/lib/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger:4318/v1/traces',
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'catchup-feed-web',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();

// Middleware to propagate trace context
import { context, trace, propagation } from '@opentelemetry/api';

export function withTracing(handler) {
  return async (req, res) => {
    const tracer = trace.getTracer('catchup-feed-web');

    // Extract trace context from headers
    const ctx = propagation.extract(context.active(), req.headers);

    return await context.with(ctx, async () => {
      const span = tracer.startSpan(`${req.method} ${req.url}`, {
        attributes: {
          'http.method': req.method,
          'http.url': req.url,
          'http.user_agent': req.headers['user-agent'],
        },
      });

      try {
        // Inject trace context into outgoing requests
        req.traceContext = {};
        propagation.inject(context.active(), req.traceContext);

        const result = await handler(req, res);

        span.setAttributes({
          'http.status_code': res.statusCode,
        });
        span.end();

        return result;
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message });
        span.end();
        throw error;
      }
    });
  };
}

// API client with trace propagation
export async function fetchWithTracing(url, options = {}) {
  const headers = {
    ...options.headers,
    ...context.active().traceContext,
  };

  const span = trace.getTracer('catchup-feed-web').startSpan('fetch', {
    attributes: {
      'http.url': url,
    },
  });

  try {
    const response = await fetch(url, { ...options, headers });
    span.setAttributes({
      'http.status_code': response.status,
    });
    span.end();
    return response;
  } catch (error) {
    span.recordException(error);
    span.end();
    throw error;
  }
}
```

Add Jaeger to docker-compose:

```yaml
# In backend stack or add to frontend compose.yml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # UI
      - "4318:4318"    # OTLP HTTP
    networks:
      - backend
    environment:
      - COLLECTOR_OTLP_ENABLED=true
```

Update environment variables:

```bash
# .env
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces
OTEL_SERVICE_NAME=catchup-feed-web
```

### 4. Health Checks & Diagnostics: 5.0 / 5.0 (Weight: 15%)

**Findings**:
- Comprehensive health check endpoint implemented (/api/health)
- Health check includes backend connectivity verification
- Docker health check properly configured with retry logic
- Diagnostic endpoints defined (health, metrics future)
- Clear health check specifications with timeouts

**Health Check Endpoints**:
- GET /api/health (lines 456-488, 2204-2250)
  - Returns: status, timestamp, uptime, version
  - Checks backend connectivity (with 2s timeout)
  - Response time tracking
  - Proper error handling

**Docker Health Check Configuration**:
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  interval: 15s
  timeout: 5s
  retries: 3
  start_period: 10s
```

**Dependency Checks**:
- Backend API connectivity check (optional, with timeout)
- No database check (frontend doesn't directly access DB - correct)
- Future: Could add checks for external services if any

**Diagnostic Endpoints**:
- /api/health - Current status
- /api/metrics - Future Prometheus metrics (recommended)
- Docker stats for resource diagnostics

**Issues**:
None - this is well implemented

**Recommendation**:
Current health check implementation is excellent. Minor enhancements:

1. Add more detailed health information:

```typescript
// Enhanced health check
export async function GET(request: NextRequest) {
  const checks = {
    frontend: true,
    backend: false,
    memory: false,
  };

  // Backend check
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    checks.backend = response.ok;
  } catch {
    checks.backend = false;
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  checks.memory = heapUsedPercent < 90;

  const allHealthy = Object.values(checks).every(v => v);

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      heapUsedPercent: Math.round(heapUsedPercent),
    },
    version: process.env.npm_package_version,
  }, { status: allHealthy ? 200 : 503 });
}
```

2. Add readiness vs liveness endpoints:

```typescript
// /api/health/live - Liveness (is process running?)
export async function GET() {
  return NextResponse.json({ status: 'alive' }, { status: 200 });
}

// /api/health/ready - Readiness (can handle traffic?)
export async function GET() {
  // Check if can connect to backend
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return NextResponse.json({ status: 'ready' }, { status: 200 });
  } catch {
    return NextResponse.json({ status: 'not ready' }, { status: 503 });
  }
}
```

---

## Observability Gaps

### Critical Gaps

1. **No Distributed Tracing**: Cannot trace requests across frontend → backend → database. This makes debugging production issues very difficult in a distributed system.
   - **Impact**: When users report slow pages or errors, engineers cannot identify which component is causing the issue. Debugging requires manual log correlation across multiple services.
   - **Priority**: P0 - Critical for production debugging

2. **No Structured Application Logging**: Design only mentions console.log which is not production-ready. Cannot search logs by user, request, or trace ID.
   - **Impact**: When investigating user issues, cannot find relevant logs. Cannot trace a specific request through the system. Cannot filter by error type or severity.
   - **Priority**: P0 - Critical for production debugging

3. **No Application Metrics**: Only Docker health checks, no request rate, error rate, or latency tracking.
   - **Impact**: Cannot detect performance degradation until users complain. Cannot set meaningful SLOs or alerts. Cannot measure service quality.
   - **Priority**: P0 - Critical for production operations

### Minor Gaps

1. **No Log Aggregation**: Logs remain on individual containers, difficult to search across deployments.
   - **Impact**: When running multiple instances, engineers must check logs on each container individually. Time-consuming during incident response.
   - **Priority**: P1 - Important for operations

2. **No Real-time Monitoring Dashboard**: Only manual docker stats, no Grafana or similar.
   - **Impact**: Cannot quickly assess system health. Engineers must run manual commands to check status.
   - **Priority**: P2 - Nice to have

3. **No Alerting System**: Future Prometheus alerts defined but not implemented.
   - **Impact**: Team not notified of issues until users report them. Reactive rather than proactive operations.
   - **Priority**: P1 - Important for production

---

## Recommended Observability Stack

Based on design requirements and existing backend infrastructure:

- **Logging**: Pino or Winston (structured JSON logging)
  - Rationale: Lightweight, high-performance, excellent Next.js integration
  - Alternative: Morgan for HTTP logging + Pino for application logging

- **Log Aggregation**: Loki + Promtail
  - Rationale: Integrates with existing Prometheus (mentioned in backend stack), low resource usage for Raspberry Pi
  - Alternative: ELK stack (higher resource requirements)

- **Metrics**: Prometheus + prom-client
  - Rationale: Backend already uses Prometheus (line 181), consistent stack
  - Alternative: Datadog (cloud-based, higher cost)

- **Tracing**: Jaeger + OpenTelemetry
  - Rationale: CNCF standard, excellent Next.js support, works with Prometheus
  - Alternative: Zipkin (similar but less features)

- **Dashboards**: Grafana
  - Rationale: Works with Prometheus and Loki, mentioned in backend (line 1239)
  - Integration: Add frontend dashboards to existing Grafana instance

**Recommended Architecture**:

```
┌─────────────────────────────────────────────────┐
│ catchup-feed-web (Frontend)                     │
│ ┌─────────────────────────────────────────────┐ │
│ │ Application Code                            │ │
│ │ - Pino logger (structured JSON)             │ │
│ │ - prom-client (metrics)                     │ │
│ │ - OpenTelemetry (tracing)                   │ │
│ └─────────────────────────────────────────────┘ │
│          │              │              │         │
│          ▼              ▼              ▼         │
│      Logs          Metrics         Traces       │
└──────────┼──────────────┼──────────────┼─────────┘
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐   ┌───────────┐  ┌─────────┐
    │ Promtail │   │Prometheus │  │ Jaeger  │
    │  (log    │   │ (metrics) │  │(tracing)│
    │forwarder)│   └─────┬─────┘  └────┬────┘
    └────┬─────┘         │             │
         │               │             │
         ▼               ▼             ▼
    ┌─────────┐   ┌──────────────────────┐
    │  Loki   │   │      Grafana         │
    │  (log   │───│   (visualization)    │
    │ storage)│   │                      │
    └─────────┘   └──────────────────────┘
                   - Logs dashboard
                   - Metrics dashboard
                   - Traces view
                   - Alerts
```

---

## Action Items for Designer

To improve observability score from 3.1 to >= 7.0, address the following:

### Critical (Must Fix)

1. **Add Structured Logging Section**
   - Specify logging framework (Pino or Winston)
   - Define log structure with required fields (timestamp, level, requestId, userId, traceId, message, context)
   - Add example log entries for different scenarios (request, error, API call)
   - Update error handling section to use structured logger instead of console.log

2. **Add Distributed Tracing Section**
   - Specify OpenTelemetry integration
   - Define trace context propagation between frontend and backend
   - Add Jaeger deployment to compose.yml
   - Provide code examples for instrumentation
   - Update API client to propagate trace headers

3. **Add Application Metrics Section**
   - Specify metrics collection framework (prom-client)
   - Define key metrics to track:
     - HTTP request duration by endpoint
     - Request count by status code
     - Error rate and error types
     - Backend API call latency
     - Memory and CPU usage
   - Add /api/metrics endpoint specification
   - Update Prometheus configuration to scrape frontend

### Important (Should Fix)

4. **Add Log Aggregation Strategy**
   - Specify Loki + Promtail or equivalent
   - Add Promtail sidecar to compose.yml
   - Define log retention policy
   - Add log query examples for common debugging scenarios

5. **Add Monitoring Dashboard Requirements**
   - Specify Grafana dashboard for frontend
   - Define dashboard panels (request rate, error rate, latency, resource usage)
   - Add alerting rules beyond basic health checks
   - Define SLI/SLO metrics

6. **Enhance Health Check**
   - Separate liveness and readiness endpoints
   - Add more detailed health information (memory, backend status)
   - Document health check interpretation for operations team

---

## Structured Data

```yaml
evaluation_result:
  evaluator: "design-observability-evaluator"
  design_document: "/Users/yujitsuchiya/catchup-feed-web/docs/designs/docker-configuration.md"
  timestamp: "2025-11-29T00:00:00Z"
  overall_judgment:
    status: "Request Changes"
    overall_score: 3.1
  detailed_scores:
    logging_strategy:
      score: 2.5
      weight: 0.35
      issues:
        - "No structured logging framework specified"
        - "Missing log context fields (requestId, userId, traceId)"
        - "No centralized logging solution"
        - "Relies on console.log which is not production-ready"
    metrics_monitoring:
      score: 3.0
      weight: 0.30
      issues:
        - "No application-level metrics collection"
        - "Prometheus mentioned only as future consideration"
        - "No SLI/SLO definitions"
        - "Limited alerting beyond basic health checks"
    distributed_tracing:
      score: 2.0
      weight: 0.20
      issues:
        - "No tracing framework specified"
        - "No trace ID propagation"
        - "Cannot trace requests across services"
    health_checks:
      score: 5.0
      weight: 0.15
      strengths:
        - "Comprehensive health check endpoint"
        - "Backend connectivity verification"
        - "Proper Docker health check configuration"
        - "Good timeout and retry logic"
  observability_gaps:
    - severity: "critical"
      gap: "No distributed tracing"
      impact: "Cannot debug distributed system issues, cannot identify bottlenecks"
    - severity: "critical"
      gap: "No structured application logging"
      impact: "Cannot search logs by user/request/trace, difficult debugging"
    - severity: "critical"
      gap: "No application metrics"
      impact: "Cannot measure service quality, no proactive monitoring"
    - severity: "minor"
      gap: "No log aggregation"
      impact: "Manual log checking across containers"
    - severity: "minor"
      gap: "No monitoring dashboard"
      impact: "Cannot quickly assess system health"
    - severity: "minor"
      gap: "No alerting system"
      impact: "Reactive rather than proactive operations"
  observability_coverage: 40%
  recommended_stack:
    logging: "Pino or Winston"
    log_aggregation: "Loki + Promtail"
    metrics: "Prometheus + prom-client"
    tracing: "Jaeger + OpenTelemetry"
    dashboards: "Grafana"
```
