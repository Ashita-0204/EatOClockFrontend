import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, Role, UserDTO } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_BASE = '/api/auth';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly ROLE_KEY = 'role';
  private readonly USER_KEY = 'user';

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_BASE}/register`, payload)
      .pipe(tap((res) => this.storeTokens(res)));
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_BASE}/login`, payload)
      .pipe(tap((res) => this.storeTokens(res)));
  }

  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.API_BASE}/user/${userId}`);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getRole(): Role | null {
    return localStorage.getItem(this.ROLE_KEY) as Role | null;
  }

  getUser(): UserDTO | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  redirectByRole(): void {
    const role = this.getRole();
    switch (role) {
      case Role.Customer:        this.router.navigate(['/customer']);   break;
      case Role.RestaurantOwner: this.router.navigate(['/restaurant']); break;
      case Role.DeliveryAgent:   this.router.navigate(['/delivery']);   break;
      case Role.Admin:           this.router.navigate(['/admin']);      break;
      default:                   this.router.navigate(['/auth/login']);
    }
  }

  // Role is stored as a string from res.user.role (e.g. "Customer")
  private storeTokens(res: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(this.ROLE_KEY, res.user.role);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
  }
}