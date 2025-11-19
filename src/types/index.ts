export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    session_id: string;
  };
}

export interface LoginUrlResponse {
  auth_url: string;
}
// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Form types
export interface LoginFormData {
  email?: string;
}

export interface ProfileFormData {
  name: string;
  picture?: string;
}
