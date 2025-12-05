import { NextResponse } from 'next/server';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  backend?: 'connected' | 'error' | 'unreachable';
}

/**
 * Health check endpoint for container monitoring and deployment verification
 *
 * @route GET /api/health
 * @returns Health status with optional backend connectivity check
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
  };

  // Optional: Check backend API connectivity
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  if (backendUrl) {
    try {
      const response = await fetch(`${backendUrl}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      health.backend = response.ok ? 'connected' : 'error';
    } catch {
      health.backend = 'unreachable';
    }
  }

  return NextResponse.json(health);
}
