// Role as a string enum — works as both a type AND a value (no TS2693 errors)
export enum Role {
  Customer        = 'Customer',
  RestaurantOwner = 'RestaurantOwner',
  DeliveryAgent   = 'DeliveryAgent',
  Admin           = 'Admin',
}

// Numeric enum matching backend AllowedRegistrationRole (Customer=1, etc.)
// Used only in the register form — Admin excluded intentionally
export enum RegistrationRole {
  Customer        = 1,
  RestaurantOwner = 2,
  DeliveryAgent   = 3,
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;   // matches backend RegisterDTO.FullName (camelCase: fullName)
  email: string;
  password: string;
  role: number;       // RegistrationRole enum value sent to backend
}

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: Role;         // string role name returned from backend e.g. "Customer"
  phoneNumber?: string;
  isActive: boolean;
}

// Actual API response shape: { success, message, accessToken, refreshToken, user }
export interface AuthResponse {
  success?: boolean;
  message?: string;
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}