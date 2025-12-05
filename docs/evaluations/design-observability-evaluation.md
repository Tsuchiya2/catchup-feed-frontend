# Design Observability Evaluation - Initial Setup, Authentication & Dashboard

**Evaluator**: design-observability-evaluator
**Design Document**: /Users/yujitsuchiya/catchup-feed-web/docs/designs/initial-setup-auth-dashboard.md
**Evaluated**: 2025-11-29T00:00:00Z

---

## Overall Judgment

**Status**: Request Changes
**Overall Score**: 2.05 / 5.0

---

## Detailed Scores

### 1. Logging Strategy: 1.5 / 5.0 (Weight: 35%)

**Findings**:
- Only basic console logging mentioned in error handling section
- No structured logging framework specified
- No log context fields (userId, requestId, timestamp, etc.)
- No centralization strategy defined
- Minimal observability for debugging production issues

**Logging Framework**:
- Not specified (only `console.error()` mentioned in error boundary)

**Log Context**:
- None specified
- No userId for user action tracking
- No requestId for request correlation
- No timestamp standardization
- No action/event identifiers

**Log Levels**:
- Not specified
- Only ERROR level implicitly used in error boundary
- No DEBUG, INFO, WARN level usage defined

**Centralization**:
- Not specified
- No log aggregation service mentioned (e.g., CloudWatch, Datadog, LogRocket)
- Each client instance would have separate logs with no correlation

**Issues**:
1. **Console logging is not production-ready**: Logs are not collected, making debugging impossible after users encounter issues
2. **No user action tracking**: Cannot trace what a user did before encountering an error
3. **No request correlation**: Cannot correlate frontend actions with backend API calls
4. **No searchability**: Cannot search logs by user, action, or timeframe
5. **No structured data**: Logs are human-readable only, not machine-parseable

**Recommendation**:

Implement structured logging with a proper framework:

```typescript
// src/lib/logger/client.ts
import { LogLevel } from './types';

interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  componentName?: string;
  route?: string;
  duration?: number;
  error?: Error;
  metadata?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private send(level: LogLevel, message: string, context: LogContext) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      userId: context.userId || this.getUserId(),
      requestId: context.requestId || this.generateRequestId(),
      action: context.action,
      component: context.componentName,
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      ...context.metadata
    };

    // Send to logging service (e.g., CloudWatch, Datadog)
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    }
  }

  info(message: string, context: LogContext = {}) {
    this.send('INFO', message, context);
  }

  warn(message: string, context: LogContext = {}) {
    this.send('WARN', message, context);
  }

  error(message: string, error: Error, context: LogContext = {}) {
    this.send('ERROR', message, { ...context, error });
  }

  debug(message: string, context: LogContext = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.send('DEBUG', message, context);
    }
  }

  private getUserId(): string | undefined {
    // Get from auth context
    return undefined;
  }

  private generateRequestId(): string {
    return crypto.randomUUID();
  }

  private sendToLoggingService(entry: unknown) {
    // Implement integration with logging service
    // e.g., CloudWatch, Datadog, LogRocket
  }
}

export const logger = Logger.getInstance();
```

**Usage Example**:

```typescript
// Login action
logger.info('User login attempt', {
  action: 'login_attempt',
  componentName: 'LoginForm'
});

// API call
logger.info('Fetching articles', {
  action: 'fetch_articles',
  componentName: 'Dashboard',
  metadata: { page: 1, limit: 10 }
});

// Error
logger.error('Failed to load articles', error, {
  action: 'fetch_articles_error',
  componentName: 'Dashboard',
  metadata: { statusCode: 500 }
});
```

**Observability Benefit**:
- Search logs by userId: "Show me all actions for user abc-123"
- Search logs by action: "Show all login attempts in the last hour"
- Correlate frontend errors with backend API responses
- Track user journey before encountering an error
- Identify patterns in error occurrences

---

### 2. Metrics & Monitoring: 2.0 / 5.0 (Weight: 30%)

**Findings**:
- Performance metrics mentioned in Section 12 (Success Metrics) but not as operational monitoring
- Metrics are defined as development/testing targets, not production monitoring
- No real-time monitoring system specified
- No alerting mechanism defined
- No dashboard for operational visibility

**Key Metrics**:
From Section 12 (Success Metrics):
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1
- TTI (Time to Interactive) < 3.5s

However, these are performance audit targets, not operational metrics.

**Missing Operational Metrics**:
- API request success/failure rate
- Authentication success/failure rate
- Page view counts
- User session duration
- Error counts by type
- API response times
- Client-side error rate

**Monitoring System**:
- Not specified
- No mention of Real User Monitoring (RUM)
- No mention of Application Performance Monitoring (APM)
- No integration with monitoring services (Datadog, New Relic, CloudWatch RUM)

**Alerts**:
- Not defined
- No alerting thresholds specified
- No on-call notification strategy

**Dashboards**:
- Not mentioned
- No operational visibility into production system health

**Issues**:
1. **No real-time visibility**: Cannot see current system health in production
2. **No alerting**: Team won't know when users encounter errors
3. **Reactive debugging**: Only discover issues after user reports them
4. **No SLI/SLO tracking**: Cannot measure service reliability
5. **Performance metrics are targets, not monitoring**: Lighthouse audits don't provide continuous monitoring

**Recommendation**:

Implement operational monitoring with Real User Monitoring (RUM):

```typescript
// src/lib/monitoring/metrics.ts

interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

class MetricsCollector {
  private static instance: MetricsCollector;

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  // API call metrics
  recordApiCall(endpoint: string, method: string, duration: number, status: number) {
    this.send({
      name: 'api.request.duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags: {
        endpoint,
        method,
        status: String(status),
        success: status >= 200 && status < 300 ? 'true' : 'false'
      }
    });
  }

  // Authentication metrics
  recordLoginAttempt(success: boolean, duration: number) {
    this.send({
      name: 'auth.login.attempt',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        success: String(success)
      }
    });

    this.send({
      name: 'auth.login.duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date()
    });
  }

  // Page performance metrics
  recordPageLoad(route: string, lcp: number, fid: number, cls: number) {
    this.send({
      name: 'page.lcp',
      value: lcp,
      unit: 'ms',
      timestamp: new Date(),
      tags: { route }
    });

    this.send({
      name: 'page.fid',
      value: fid,
      unit: 'ms',
      timestamp: new Date(),
      tags: { route }
    });

    this.send({
      name: 'page.cls',
      value: cls,
      unit: 'score',
      timestamp: new Date(),
      tags: { route }
    });
  }

  // Error rate metrics
  recordError(errorType: string, componentName: string) {
    this.send({
      name: 'error.count',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      tags: {
        errorType,
        componentName
      }
    });
  }

  private send(metric: Metric) {
    // Send to monitoring service (CloudWatch, Datadog, New Relic)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(metric);
    }
  }

  private sendToMonitoringService(metric: Metric) {
    // Implement integration with monitoring service
  }
}

export const metrics = MetricsCollector.getInstance();
```

**Alert Definitions**:

```yaml
# Example alert configuration
alerts:
  - name: high_error_rate
    condition: error.count > 10 per minute
    severity: critical
    notification: slack, pagerduty

  - name: slow_api_response
    condition: api.request.duration p95 > 2000ms
    severity: warning
    notification: slack

  - name: authentication_failure_spike
    condition: auth.login.attempt (success=false) > 5 per minute
    severity: warning
    notification: slack

  - name: poor_page_performance
    condition: page.lcp p95 > 3000ms
    severity: warning
    notification: slack
```

**Dashboard Widgets**:
- API request success rate (last 1h, 24h)
- API response time percentiles (p50, p95, p99)
- Authentication success rate
- Error count by type (last 1h)
- Page performance metrics (LCP, FID, CLS)
- Active user sessions
- Page views by route

**Observability Benefit**:
- Real-time visibility into production health
- Proactive alerting before users report issues
- Trend analysis to identify degradation
- SLI/SLO tracking for reliability targets
- Data-driven performance optimization

---

### 3. Distributed Tracing: 1.0 / 5.0 (Weight: 20%)

**Findings**:
- No distributed tracing framework mentioned
- No trace ID propagation between frontend and backend
- Cannot correlate frontend actions with backend API calls
- Request flow visibility is limited to individual API calls
- No span instrumentation for performance bottleneck identification

**Tracing Framework**:
- Not specified
- No mention of OpenTelemetry, Sentry Performance, Datadog APM, or similar

**Trace ID Propagation**:
- Not mentioned
- No `X-Trace-Id` or similar header propagation to backend
- Frontend and backend logs cannot be correlated

**Span Instrumentation**:
- Not mentioned
- Cannot identify which part of request flow is slow
- No visibility into render time, API call time, data processing time

**Issues**:
1. **Cannot trace user actions end-to-end**: If a user reports "slow dashboard", cannot identify which part is slow (frontend render, API call, backend processing, database query)
2. **No request correlation**: Frontend error cannot be correlated with backend logs
3. **No performance bottleneck identification**: Cannot identify if slowness is due to API latency, render time, or data processing
4. **Debugging is difficult**: Have to manually correlate timestamps between frontend and backend logs

**Recommendation**:

Implement distributed tracing with trace ID propagation:

```typescript
// src/lib/tracing/client.ts

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  tags?: Record<string, string>;
}

class Tracer {
  private static instance: Tracer;
  private activeSpans: Map<string, Span> = new Map();

  static getInstance(): Tracer {
    if (!Tracer.instance) {
      Tracer.instance = new Tracer();
    }
    return Tracer.instance;
  }

  // Start a new trace (e.g., page load, user action)
  startTrace(name: string, tags?: Record<string, string>): string {
    const traceId = crypto.randomUUID();
    const spanId = crypto.randomUUID();

    const span: Span = {
      traceId,
      spanId,
      name,
      startTime: Date.now(),
      tags
    };

    this.activeSpans.set(spanId, span);

    // Store in session for propagation
    sessionStorage.setItem('currentTraceId', traceId);

    return spanId;
  }

  // Start a child span (e.g., API call, render)
  startSpan(name: string, parentSpanId: string, tags?: Record<string, string>): string {
    const parentSpan = this.activeSpans.get(parentSpanId);
    if (!parentSpan) {
      console.warn(`Parent span ${parentSpanId} not found`);
      return this.startTrace(name, tags);
    }

    const spanId = crypto.randomUUID();
    const span: Span = {
      traceId: parentSpan.traceId,
      spanId,
      parentSpanId,
      name,
      startTime: Date.now(),
      tags
    };

    this.activeSpans.set(spanId, span);
    return spanId;
  }

  // End a span and send to tracing service
  endSpan(spanId: string) {
    const span = this.activeSpans.get(spanId);
    if (!span) {
      console.warn(`Span ${spanId} not found`);
      return;
    }

    span.endTime = Date.now();

    // Send to tracing service
    if (process.env.NODE_ENV === 'production') {
      this.sendToTracingService(span);
    }

    this.activeSpans.delete(spanId);
  }

  // Get current trace ID for API header propagation
  getCurrentTraceId(): string | null {
    return sessionStorage.getItem('currentTraceId');
  }

  private sendToTracingService(span: Span) {
    // Send to OpenTelemetry collector, Datadog APM, etc.
  }
}

export const tracer = Tracer.getInstance();
```

**API Client Integration**:

```typescript
// src/lib/api/client.ts

async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const traceId = tracer.getCurrentTraceId();

  // Start span for API call
  const spanId = tracer.startSpan(`API ${options?.method || 'GET'} ${endpoint}`, 'root', {
    endpoint,
    method: options?.method || 'GET'
  });

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(traceId && { 'X-Trace-Id': traceId }), // Propagate to backend
    ...options?.headers
  };

  try {
    const response = await fetch(`${this.config.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return await response.json();
  } catch (error) {
    throw error;
  } finally {
    // End span
    tracer.endSpan(spanId);
  }
}
```

**Usage Example**:

```typescript
// Dashboard page load
const traceSpanId = tracer.startTrace('DashboardPageLoad', {
  userId: user.id,
  route: '/dashboard'
});

// Render span
const renderSpanId = tracer.startSpan('DashboardRender', traceSpanId);
// ... render logic
tracer.endSpan(renderSpanId);

// API call span (automatically created in API client)
const data = await getArticles(); // API client creates span with same traceId

tracer.endSpan(traceSpanId);
```

**Observability Benefit**:
- End-to-end request tracing from user action to backend response
- Identify performance bottlenecks in request flow
- Correlate frontend and backend logs by trace ID
- Visualize request flow in distributed tracing UI
- Debug slow requests by examining span durations

---

### 4. Health Checks & Diagnostics: 2.5 / 5.0 (Weight: 15%)

**Findings**:
- Backend `/health` endpoint mentioned in API endpoints section
- No frontend health check implementation
- No dependency health verification (API availability, localStorage availability)
- No diagnostic endpoints for troubleshooting
- No automated health monitoring

**Health Check Endpoints**:
- Backend `/health` endpoint mentioned but not utilized
- No frontend `/health` endpoint for load balancer health checks
- No periodic health check polling

**Dependency Checks**:
- No API connectivity check
- No localStorage availability check
- No critical resource verification

**Diagnostic Endpoints**:
- Not mentioned
- No `/debug` or `/status` endpoints
- No client-side diagnostic information endpoint

**Issues**:
1. **Cannot verify system health proactively**: No automated health checks to detect issues before users encounter them
2. **No dependency verification**: If backend API is down, frontend doesn't detect it until user tries to access
3. **No diagnostic information**: When user reports an issue, cannot easily collect diagnostic info
4. **No load balancer integration**: If deployed behind load balancer, no health endpoint for traffic routing

**Recommendation**:

Implement health checks and diagnostic endpoints:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    dependencies: {
      api: await checkApiHealth(),
      localStorage: checkLocalStorageHealth()
    }
  };

  const isHealthy = health.dependencies.api.status === 'ok' &&
                    health.dependencies.localStorage.status === 'ok';

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503
  });
}

async function checkApiHealth() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      signal: AbortSignal.timeout(5000)
    });

    return {
      status: response.ok ? 'ok' : 'degraded',
      latency: response.headers.get('X-Response-Time') || 'unknown'
    };
  } catch (error) {
    return {
      status: 'down',
      error: String(error)
    };
  }
}

function checkLocalStorageHealth() {
  try {
    const testKey = '__health_check__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'down',
      error: 'localStorage not available'
    };
  }
}
```

**Client-side Health Monitor**:

```typescript
// src/lib/health/monitor.ts

class HealthMonitor {
  private static instance: HealthMonitor;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  start() {
    // Check health every 60 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000);

    // Initial check
    this.performHealthCheck();
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  private async performHealthCheck() {
    try {
      const response = await fetch('/api/health');
      const health = await response.json();

      if (!response.ok) {
        // Health check failed - notify monitoring service
        logger.error('Health check failed', new Error('Unhealthy'), {
          action: 'health_check_failed',
          metadata: health
        });

        metrics.recordError('health_check_failed', 'HealthMonitor');
      }
    } catch (error) {
      logger.error('Health check error', error as Error, {
        action: 'health_check_error'
      });
    }
  }
}

export const healthMonitor = HealthMonitor.getInstance();
```

**Diagnostic Information Collector**:

```typescript
// src/lib/diagnostics/collector.ts

export function collectDiagnosticInfo() {
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink
    } : 'unknown',
    memory: (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize
    } : 'unknown',
    performance: {
      navigation: performance.getEntriesByType('navigation')[0],
      resources: performance.getEntriesByType('resource').length
    },
    localStorage: {
      available: isLocalStorageAvailable(),
      tokenExists: !!getAuthToken()
    },
    url: window.location.href,
    referrer: document.referrer
  };
}

// Attach to error reports
logger.error('User encountered error', error, {
  action: 'user_error',
  metadata: collectDiagnosticInfo()
});
```

**Observability Benefit**:
- Proactive health monitoring detects issues before users report them
- Load balancer can route traffic away from unhealthy instances
- Diagnostic information accelerates troubleshooting
- Dependency health visibility (API, localStorage)
- Automated alerting on health degradation

---

## Observability Gaps

### Critical Gaps

1. **No structured logging framework**: Impossible to debug production issues without searchable, contextualized logs. Impact: High - Cannot diagnose user-reported errors.

2. **No distributed tracing**: Cannot correlate frontend actions with backend API calls. Impact: High - Cannot identify root cause of slow requests or errors.

3. **No operational monitoring**: No real-time visibility into production system health. Impact: High - Reactive debugging only, no proactive issue detection.

### Minor Gaps

1. **No log aggregation service**: Even with structured logging, logs need to be centralized. Impact: Medium - Logs exist but are scattered.

2. **No alerting mechanism**: Team won't know when errors spike. Impact: Medium - Delayed response to incidents.

3. **No health check automation**: Manual verification of system health. Impact: Low - Operational burden but not critical for MVP.

4. **No diagnostic endpoints**: Troubleshooting requires manual information collection. Impact: Low - Slows down debugging but not critical.

---

## Recommended Observability Stack

Based on the design and Next.js architecture, recommend:

- **Logging**:
  - Development: Console with structured JSON format
  - Production: Vercel Analytics + CloudWatch Logs (if deployed to AWS) or Datadog Logs
  - Library: Custom logger wrapper (as shown above) or `pino` for Node.js environments

- **Metrics**:
  - **Vercel Analytics** (built-in, free tier available) for Web Vitals
  - **Datadog RUM** or **New Relic Browser** for comprehensive monitoring
  - Custom metrics integration with CloudWatch or Datadog

- **Tracing**:
  - **OpenTelemetry** for vendor-neutral instrumentation
  - **Datadog APM** or **New Relic APM** for visualization
  - **Sentry Performance** for error-first tracing approach

- **Dashboards**:
  - **Vercel Dashboard** for deployment and basic Web Vitals
  - **Datadog Dashboards** or **Grafana** for operational metrics
  - **Sentry** for error tracking and performance

---

## Action Items for Designer

Since status is "Request Changes", the designer must:

1. **Add structured logging strategy to Section 7 (Error Handling)**:
   - Specify logging framework (custom wrapper or library like `pino`)
   - Define log context fields (userId, requestId, timestamp, action, componentName, route)
   - Define log levels (DEBUG, INFO, WARN, ERROR) and usage guidelines
   - Specify log aggregation service (CloudWatch Logs, Datadog Logs, LogRocket)
   - Add logger utility implementation to file structure

2. **Add operational monitoring to Section 12 (Success Metrics)**:
   - Define operational metrics (API success rate, error rate, authentication rate, etc.)
   - Specify monitoring service (Vercel Analytics, Datadog RUM, New Relic Browser)
   - Define alerting thresholds and notification channels
   - Add dashboard requirements (widgets for API health, error rates, performance)
   - Add metrics collector implementation to file structure

3. **Add distributed tracing section**:
   - Specify tracing framework (OpenTelemetry, Datadog APM, Sentry Performance)
   - Define trace ID generation and propagation strategy
   - Specify trace header for backend correlation (e.g., `X-Trace-Id`)
   - Add span instrumentation for key operations (page load, API calls, rendering)
   - Add tracer utility implementation to file structure

4. **Enhance health checks in Section 10 (File Structure)**:
   - Add `/api/health` endpoint to API routes
   - Implement dependency health checks (API connectivity, localStorage)
   - Add client-side health monitoring
   - Define health check frequency and failure handling
   - Add diagnostic information collector

5. **Update Architecture Diagram (Section 3)**:
   - Add observability components (logging, metrics, tracing)
   - Show log/metric/trace flow to external services
   - Indicate trace ID propagation from frontend to backend

6. **Update Dependencies (Section 13)**:
   - Add observability service dependencies (Datadog, New Relic, etc.)
   - Document integration requirements
   - Define environment variables for observability services

---

## Structured Data

```yaml
evaluation_result:
  evaluator: "design-observability-evaluator"
  design_document: "/Users/yujitsuchiya/catchup-feed-web/docs/designs/initial-setup-auth-dashboard.md"
  timestamp: "2025-11-29T00:00:00Z"
  overall_judgment:
    status: "Request Changes"
    overall_score: 2.05
  detailed_scores:
    logging_strategy:
      score: 1.5
      weight: 0.35
      weighted_score: 0.525
    metrics_monitoring:
      score: 2.0
      weight: 0.30
      weighted_score: 0.60
    distributed_tracing:
      score: 1.0
      weight: 0.20
      weighted_score: 0.20
    health_checks:
      score: 2.5
      weight: 0.15
      weighted_score: 0.375
  observability_gaps:
    - severity: "critical"
      gap: "No structured logging framework"
      impact: "Cannot debug production issues without searchable, contextualized logs"
    - severity: "critical"
      gap: "No distributed tracing"
      impact: "Cannot correlate frontend actions with backend API calls for root cause analysis"
    - severity: "critical"
      gap: "No operational monitoring"
      impact: "No real-time visibility into production system health, reactive debugging only"
    - severity: "minor"
      gap: "No log aggregation service"
      impact: "Logs exist but are scattered across instances"
    - severity: "minor"
      gap: "No alerting mechanism"
      impact: "Delayed response to incidents"
    - severity: "minor"
      gap: "No health check automation"
      impact: "Operational burden for manual health verification"
    - severity: "minor"
      gap: "No diagnostic endpoints"
      impact: "Slows down debugging process"
  observability_coverage: 41
  recommended_stack:
    logging: "Custom logger wrapper or pino + Vercel Analytics / CloudWatch Logs / Datadog Logs"
    metrics: "Vercel Analytics (Web Vitals) + Datadog RUM / New Relic Browser"
    tracing: "OpenTelemetry + Datadog APM / New Relic APM / Sentry Performance"
    dashboards: "Vercel Dashboard + Datadog Dashboards / Grafana + Sentry"
```
