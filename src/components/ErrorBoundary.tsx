import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { CrashlyticsService } from '@/services/crashlytics';
import { cStyle, useTheme } from '@/theme';

interface ErrorBoundaryProps extends PropsWithChildren {
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Reports unexpected render errors to Crashlytics and shows a recovery UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    CrashlyticsService.log(`ErrorBoundary: ${info.componentStack ?? 'no-stack'}`);
    CrashlyticsService.recordError(error, 'ReactErrorBoundary');
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  public override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback != null) {
      return this.props.fallback;
    }

    return <ErrorBoundaryFallback onRetry={this.handleRetry} />;
  }
}

function ErrorBoundaryFallback({ onRetry }: { onRetry: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={[cStyle.flex1, { backgroundColor: theme.colors.background }]}>
      <EmptyState
        title="Something went wrong"
        description="The app hit an unexpected error. You can try again."
        primaryAction={{ label: 'Try again', onPress: onRetry }}
      />
    </View>
  );
}
