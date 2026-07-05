'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

/**
 * Props for FeatureErrorBoundary component
 */
interface FeatureErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Name of the feature for logging purposes */
  featureName: string;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
}

/**
 * State for error boundary
 */
interface FeatureErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error, if any */
  error: Error | null;
}

/**
 * Feature-specific error boundary component
 *
 * Wraps feature components to prevent their errors from crashing the entire application.
 * Logs errors to the console via the structured logger.
 *
 * @example
 * ```tsx
 * <FeatureErrorBoundary featureName="PWA Install Prompt">
 *   <PWAInstallPrompt />
 * </FeatureErrorBoundary>
 * ```
 */
export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when an error is caught
   * This is called during the render phase, so side effects are not allowed
   */
  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details when caught
   * This is called during the commit phase, so side effects are allowed
   */
  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { featureName } = this.props;

    // Log to console
    logger.error(`Feature error: ${featureName}`, error, {
      componentStack: errorInfo.componentStack,
      feature: featureName,
    });
  }

  /**
   * Reset error state to allow retry
   */
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Render custom fallback or null (hide the feature)
      if (fallback) {
        return fallback;
      }

      // Default: hide the feature silently
      // This prevents the feature from crashing the app while being non-intrusive
      return null;
    }

    return children;
  }
}
