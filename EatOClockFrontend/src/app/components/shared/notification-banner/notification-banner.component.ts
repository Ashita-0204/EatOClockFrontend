import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMsg } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div *ngFor="let notif of notifications" class="notification-toast" [ngClass]="(notif.type || 'info').toLowerCase()">
        <div class="notif-body">
          <div class="notif-icon">
            <i *ngIf="notif.type === 'SUCCESS'" class="fas fa-check-circle"></i>
            <i *ngIf="notif.type === 'ERROR'" class="fas fa-exclamation-circle"></i>
            <i *ngIf="notif.type === 'INFO' || notif.type === 'SYSTEM' || notif.type === 'ORDER'" class="fas fa-info-circle"></i>
          </div>
          <div class="notif-content">
            <h4>{{ notif.title }}</h4>
            <p>{{ notif.message }}</p>
          </div>
          <button class="close-btn" (click)="remove(notif.id!)">&times;</button>
        </div>
        
        <div *ngIf="notif.actions && notif.actions.length > 0" class="notif-actions">
          <button *ngFor="let action of notif.actions" 
                  class="action-btn" 
                  [class.primary]="action.primary"
                  (click)="handleAction(notif, action)">
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }
    .notification-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      padding: 16px;
      min-width: 320px;
      max-width: 420px;
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
    }
    .notification-toast::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 6px;
      background: #6c5ce7;
    }
    .notification-toast.success::before { background: #00b894; }
    .notification-toast.error::before { background: #d63031; }
    .notification-toast.info::before { background: #0984e3; }
    .notification-toast.order::before { background: #fdcb6e; }
    
    .notif-body {
      display: flex;
      align-items: flex-start;
      width: 100%;
    }
    
    .notif-icon {
      font-size: 1.4rem;
      margin-right: 14px;
      margin-top: 2px;
    }
    .success .notif-icon { color: #00b894; }
    .error .notif-icon { color: #d63031; }
    .info .notif-icon, .system .notif-icon { color: #0984e3; }
    .order .notif-icon { color: #fdcb6e; }
    
    .notif-content { flex: 1; }
    .notif-content h4 { margin: 0 0 4px 0; font-size: 0.95rem; color: #2d3436; font-weight: 700; }
    .notif-content p { margin: 0; font-size: 0.85rem; color: #636e72; line-height: 1.4; }
    
    .notif-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0,0,0,0.05);
      justify-content: flex-end;
    }
    
    .action-btn {
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid #ddd;
      background: white;
      color: #2d3436;
    }
    .action-btn:hover { background: #f5f5f5; }
    .action-btn.primary {
      background: #6c5ce7;
      color: white;
      border-color: #6c5ce7;
    }
    .action-btn.primary:hover { background: #5b4bc4; opacity: 0.9; }
    
    .close-btn {
      background: rgba(0,0,0,0.05);
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      color: #636e72;
      cursor: pointer;
      margin-left: 10px;
      transition: all 0.2s;
    }
    .close-btn:hover { background: rgba(0,0,0,0.1); color: #2d3436; }
    
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NotificationBannerComponent {
  notifications: NotificationMsg[] = [];

  constructor(private notificationService: NotificationService) {
    this.notificationService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
    });
  }

  remove(id: string) {
    this.notificationService.removeNotification(id);
  }

  handleAction(notif: NotificationMsg, action: any) {
    action.callback();
    this.remove(notif.id!);
  }
}
