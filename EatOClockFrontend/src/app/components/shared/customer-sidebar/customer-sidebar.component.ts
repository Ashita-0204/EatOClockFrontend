import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">🍴</div>
        <span class="brand-name">EatOClock</span>
      </div>
      
      <nav class="nav-menu">
        <a routerLink="/customer" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <i class="fas fa-search"></i>
          Browse
        </a>
        <a routerLink="/customer/orders" class="nav-item" routerLinkActive="active">
          <i class="fas fa-history"></i>
          History
        </a>
        <a routerLink="/customer/wallet" class="nav-item" routerLinkActive="active">
          <i class="fas fa-wallet"></i>
          Wallet
        </a>
        <a routerLink="/customer/profile" class="nav-item" routerLinkActive="active">
          <i class="fas fa-user"></i>
          Profile
        </a>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-logout" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i>
          Log out
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      min-width: 280px;
      background: linear-gradient(180deg,
          #f3d5b5 0%,
          #d4a276 35%,
          #8b5e34 70%,
          #583101 100%);
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(96, 56, 8, 0.18);
      box-shadow: 8px 0 22px rgba(96, 56, 8, 0.12);
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      margin-bottom: 2.8rem;
    }

    .brand-icon {
      font-size: 2rem;
      color: #ffedd8;
    }

    .brand-name {
      font-size: 1.8rem;
      font-weight: 700;
      color: #432a0d;
    }

    .nav-menu {
      flex: 1;
      margin-top: 1rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.9rem 1.1rem;
      margin-bottom: 0.6rem;
      text-decoration: none;
      color: #ffedd8;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .nav-item i {
      width: 24px;
      font-size: 1.15rem;
    }

    .nav-item:hover {
      background: rgba(255, 237, 216, 0.18);
      color: #ffedd8;
      transform: translateX(4px);
    }

    .nav-item.active {
      background: #ffedd8;
      color: #603808;
    }

    .sidebar-footer {
      margin-top: auto;
      padding-top: 1.2rem;
      border-top: 1px solid rgba(255, 237, 216, 0.15);
    }

    .btn-logout {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.9rem;
      padding: 0.95rem 1rem;
      border: none;
      background: rgba(255, 237, 216, 0.18);
      color: #ffedd8;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      font-family: 'Montserrat', sans-serif;
      transition: all 0.3s ease;
    }

    .btn-logout:hover {
      background: rgba(255, 237, 216, 0.28);
    }
  `]
})
export class CustomerSidebarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
