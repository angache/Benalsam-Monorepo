// ===========================
// RE-EXPORT SHARED TYPES
// ===========================

// Re-export all types from shared-types package
export * from '@benalsam/shared-types';

// ===========================
// MOBILE-SPECIFIC TYPES (if any)
// ===========================

// Add any mobile-specific types here that are not in shared-types
// For now, all types are shared between mobile and web

// Mobile-specific icon type
import type { LucideIcon } from 'lucide-react-native';

// Override Category icon type for mobile
export interface Category {
  code: string;
  name: string;
  icon: LucideIcon;
} 