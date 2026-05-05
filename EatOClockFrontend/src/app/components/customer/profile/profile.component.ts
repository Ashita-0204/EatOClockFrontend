import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UserDTO } from '../../../models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="profile-page-wrapper">
      <div class="profile-card-container">
        <!-- Header -->
        <header class="profile-page-header">
          <a routerLink="/customer" class="back-link">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            <span>Back to Dashboard</span>
          </a>
        </header>

        <div class="profile-layout" *ngIf="user; else staleSession">
          <!-- Left: User Hero -->
          <div class="user-hero-card">
            <div class="avatar-wrapper">
              <div class="avatar-large">{{ user.fullName.charAt(0).toUpperCase() }}</div>
              <button class="edit-avatar-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
            </div>
            <h2 class="user-name">{{ user.fullName }}</h2>
            <p class="user-role-label">{{ user.role }}</p>
            
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-value">12</span>
                <span class="stat-label">Orders</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-value">4.8</span>
                <span class="stat-label">Rating</span>
              </div>
            </div>

            <button class="btn-logout-premium" (click)="logout()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"></path>
              </svg>
              Log Out
            </button>
          </div>

          <!-- Right: Details -->
          <div class="details-sections">
            <div class="section-card">
              <h3 class="section-title">Account Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Full Name</label>
                  <div class="value-container">
                    <input type="text" [value]="user.fullName" readonly>
                  </div>
                </div>
                <div class="info-item">
                  <label>Email Address</label>
                  <div class="value-container">
                    <input type="text" [value]="user.email" readonly>
                  </div>
                </div>
                <div class="info-item">
                  <label>Phone Number</label>
                  <div class="value-container">
                    <input type="text" [value]="user.phoneNumber || 'Not provided'" readonly>
                  </div>
                </div>
                <div class="info-item">
                  <label>Account Status</label>
                  <div class="value-container">
                    <span class="status-pill" [class.active]="user.isActive">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>
              <button class="btn-edit-profile">Edit Profile</button>
            </div>

            <div class="section-card">
              <h3 class="section-title">Security & Preferences</h3>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-name">Email Notifications</span>
                    <span class="setting-desc">Receive updates about your orders</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-name">SMS Alerts</span>
                    <span class="setting-desc">Get real-time delivery tracking</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stale Session Fallback -->
        <ng-template #staleSession>
          <div class="stale-session-card">
            <div class="stale-icon">🔐</div>
            <h2>Session Update Required</h2>
            <p>Your profile information is not available in the current session. Please log out and sign in again to refresh your data.</p>
            <button class="btn-logout-premium stale-logout" (click)="logout()">
              Log Out & Refresh
            </button>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .profile-page-wrapper {
      min-height: 100vh;
      background: #ffedd8;
      padding: 40px 20px;
      font-family: 'Outfit', sans-serif;
    }
    .profile-card-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .profile-page-header {
      margin-bottom: 32px;
    }
    .back-link {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #6f4e37;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .back-link:hover {
      color: #a67c52;
      transform: translateX(-5px);
    }

    /* Stale Session */
    .stale-session-card {
      background: white;
      border-radius: 24px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(96, 56, 8, 0.05);
      max-width: 500px;
      margin: 40px auto;
      border: 1px solid rgba(111, 78, 55, 0.1);
    }
    .stale-icon {
      font-size: 4rem;
      margin-bottom: 24px;
    }
    .stale-session-card h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #4b3621;
      margin-bottom: 12px;
    }
    .stale-session-card p {
      color: rgba(59, 36, 19, 0.7);
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 32px;
    }

    /* Left Card */
    .user-hero-card {
      background: white;
      border-radius: 24px;
      padding: 40px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 20px rgba(96, 56, 8, 0.05);
      border: 1px solid rgba(111, 78, 55, 0.1);
      height: fit-content;
    }
    .avatar-wrapper {
      position: relative;
      margin-bottom: 24px;
    }
    .avatar-large {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #4b3621 0%, #6f4e37 100%);
      border-radius: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ede0d4;
      font-size: 3.5rem;
      font-weight: 800;
      box-shadow: 0 10px 25px rgba(75, 54, 33, 0.2);
    }
    .edit-avatar-btn {
      position: absolute;
      bottom: -6px;
      right: -6px;
      width: 40px;
      height: 40px;
      background: white;
      border: 2px solid #ede0d4;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6f4e37;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    .edit-avatar-btn:hover {
      background: #6f4e37;
      color: white;
    }
    .user-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: #4b3621;
      margin: 0 0 4px 0;
    }
    .user-role-label {
      color: #a67c52;
      font-weight: 700;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 32px;
    }
    .hero-stats {
      display: flex;
      width: 100%;
      justify-content: space-around;
      margin-bottom: 32px;
      padding: 20px 0;
      border-top: 1px solid rgba(111, 78, 55, 0.1);
      border-bottom: 1px solid rgba(111, 78, 55, 0.1);
    }
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #4b3621;
    }
    .stat-label {
      font-size: 0.8rem;
      color: rgba(59, 36, 19, 0.5);
      font-weight: 600;
      text-transform: uppercase;
    }
    .stat-divider {
      width: 1px;
      background: rgba(111, 78, 55, 0.1);
    }
    .btn-logout-premium {
      width: 100%;
      padding: 14px;
      background: #fdfaf7;
      color: #d64550;
      border: 1px solid rgba(214, 69, 80, 0.1);
      border-radius: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-logout-premium:hover {
      background: #d64550;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(214, 69, 80, 0.2);
    }

    /* Right Sections */
    .details-sections {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .section-card {
      background: white;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(96, 56, 8, 0.04);
      border: 1px solid rgba(111, 78, 55, 0.08);
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #4b3621;
      margin: 0 0 24px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .info-item label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      color: #a67c52;
      margin-bottom: 10px;
    }
    .value-container input {
      width: 100%;
      padding: 14px 18px;
      background: #fdfaf7;
      border: 1px solid rgba(111, 78, 55, 0.05);
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      color: #3b2413;
      outline: none;
    }
    .status-pill {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      background: #ede0d4;
      color: #6f4e37;
    }
    .status-pill.active {
      background: #556b2f;
      color: white;
    }
    .btn-edit-profile {
      padding: 12px 28px;
      background: #6f4e37;
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 15px rgba(111, 78, 55, 0.2);
    }
    .btn-edit-profile:hover {
      background: #4b3621;
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(75, 54, 33, 0.3);
    }

    /* Settings List */
    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(111, 78, 55, 0.05);
    }
    .setting-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .setting-name {
      display: block;
      font-weight: 800;
      color: #4b3621;
      margin-bottom: 4px;
      font-size: 1.1rem;
    }
    .setting-desc {
      font-size: 0.95rem;
      color: rgba(59, 36, 19, 0.6);
      font-weight: 500;
    }

    /* Switch Component */
    .switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #ede0d4;
      transition: .4s;
      border-radius: 28px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 22px; width: 22px;
      left: 3px; bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider { background-color: #6f4e37; }
    input:checked + .slider:before { transform: translateX(24px); }

    @media (max-width: 850px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
      .user-hero-card {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: UserDTO | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
