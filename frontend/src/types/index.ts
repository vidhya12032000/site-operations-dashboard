export interface Site {
  id: number;
  name: string;
  location: string;
  status: string;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
}

export interface Installation {
  id: number;
  site_id: number;
  site_name?: string;
  assigned_to: number | null;
  assigned_to_name?: string;
  installation_type: string;
  status: string;
  start_date: string | null;
  completion_date: string | null;
  created_at: string;
}

export interface Summary {
  totalSites: string;
  activeSites: string;
  plannedSites: string;
  completedSites: string;
  totalInstallations: string;
  pendingInstallations: string;
  inProgressInstallations: string;
  completedInstallations: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}