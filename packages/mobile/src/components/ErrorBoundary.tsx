import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useThemeColors } from '../stores';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ErrorInfo {
  componentStack: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableLogging?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// Error logging service
class ErrorLogService {
  static async logError(error: Error, errorInfo: ErrorInfo, additionalData?: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: 'React Native',
      ...additionalData,
    };

    try {
      // In a real app, you would send this to your logging service
      console.error('Error Boundary Caught Error:', errorLog);
      
      // You can integrate with services like Sentry, Bugsnag, etc.
      // Example: Sentry.captureException(error, { extra: errorLog });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }
}

// Custom Error Display Component
const ErrorDisplay: React.FC<{
  error: Error;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  onGoHome: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}> = ({ error, errorInfo, onRetry, onGoHome, showDetails, onToggleDetails }) => {
  const colors = {
    background: '#1a1a1a',
    surface: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#a0a0a0',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    primary: '#3b82f6',
    border: '#404040',
    white: '#ffffff',
  };

  const copyErrorToClipboard = async () => {
    const errorText = `Error: ${error.message}\n\nStack Trace:\n${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`;
    await Clipboard.setStringAsync(errorText);
    Alert.alert('Kopyalandı', 'Hata detayları panoya kopyalandı.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Icon and Title */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[colors.error, '#dc2626']}
            style={styles.errorIcon}
          >
            <AlertTriangle size={48} color={colors.white} />
          </LinearGradient>
          
          <Text style={[styles.title, { color: colors.text }]}>
            Bir Hata Oluştu
          </Text>
          
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Uygulama beklenmedik bir hatayla karşılaştı. Lütfen tekrar deneyin.
          </Text>
        </View>

        {/* Error Message */}
        <View style={[styles.messageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.messageHeader}>
            <Bug size={20} color={colors.error} />
            <Text style={[styles.messageTitle, { color: colors.text }]}>
              Hata Mesajı
            </Text>
          </View>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {error.message}
          </Text>
        </View>

        {/* Error Details Toggle */}
        <TouchableOpacity
          style={[styles.detailsToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={onToggleDetails}
          activeOpacity={0.7}
        >
          <Text style={[styles.detailsToggleText, { color: colors.text }]}>
            Teknik Detaylar
          </Text>
          {showDetails ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        {/* Error Details */}
        {showDetails && (
          <View style={[styles.detailsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.detailsHeader}>
              <Text style={[styles.detailsTitle, { color: colors.text }]}>
                Stack Trace
              </Text>
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: colors.primary }]}
                onPress={copyErrorToClipboard}
                activeOpacity={0.7}
              >
                <Copy size={16} color={colors.white} />
                <Text style={[styles.copyButtonText, { color: colors.white }]}>
                  Kopyala
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.stackScrollView} nestedScrollEnabled>
              <Text style={[styles.stackTrace, { color: colors.textSecondary }]}>
                {error.stack}
              </Text>
              
              {errorInfo.componentStack && (
                <>
                  <Text style={[styles.componentStackTitle, { color: colors.text }]}>
                    Component Stack:
                  </Text>
                  <Text style={[styles.componentStack, { color: colors.textSecondary }]}>
                    {errorInfo.componentStack}
                  </Text>
                </>
              )}
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <LinearGradient
            colors={[colors.primary, '#2563eb']}
            style={styles.actionButton}
          >
            <TouchableOpacity
              style={styles.actionButtonContent}
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Tekrar Dene
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onGoHome}
            activeOpacity={0.7}
          >
            <Home size={20} color={colors.textSecondary} />
            <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
              Ana Sayfaya Dön
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error if logging is enabled
    if (this.props.enableLogging !== false) {
      ErrorLogService.logError(error, errorInfo, {
        resetKeys: this.props.resetKeys,
      });
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      if (resetKeys.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary();
      }
    }

    // Reset error boundary when props change (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    // Clear any existing timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    // Reset state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleGoHome = () => {
    this.resetErrorBoundary();
    // In a real app, you might want to navigate to home screen
    // navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Use default error display
      return (
        <ErrorDisplay
          error={this.state.error!}
          errorInfo={this.state.errorInfo!}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showDetails={this.state.showDetails}
          onToggleDetails={this.toggleDetails}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: screenHeight - 100,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  messageContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsToggle: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  detailsToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 30,
    maxHeight: 300,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stackScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stackTrace: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  componentStackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  componentStack: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary; 