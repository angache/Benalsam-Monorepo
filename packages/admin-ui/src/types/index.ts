// Re-export types from api service
export type {
  LoginRequest,
  LoginResponse,
  ApiResponse,
  Listing,
  GetListingsParams,
  User,
  AnalyticsData,
} from '../services/api';

// Additional types
export interface NavigationItem {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'temporary' | 'permanent';
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface DashboardStats {
  totalListings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingListings: number;
  activeListings: number;
  rejectedListings: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
} 