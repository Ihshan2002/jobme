// features/users/types.ts

export type UserRole   = 'admin' | 'recruiter' | 'seeker';
export type UserStatus = 'active' | 'banned' | 'deleted';

export interface AdminUser {
  id:           string;
  full_name:    string | null;
  email:        string;
  role:         UserRole;
  status:       UserStatus;
  deleted_at:   string | null;
  banned_until: string | null;
  created_at:   string;
  updated_at:   string;
}

export interface ActionResult {
  success: boolean;
  error?:  string;
}