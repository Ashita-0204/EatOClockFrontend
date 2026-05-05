import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';

export interface NotificationAction {
  label: string;
  callback: () => void;
  primary?: boolean;
}

export interface NotificationMsg {
  id?: string;
  title: string;
  message: string;
  type: string;
  playSound?: boolean;
  createdAt?: string;
  actions?: NotificationAction[];
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection: signalR.HubConnection | null = null;
  private notificationsSubject = new BehaviorSubject<NotificationMsg[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private authService: AuthService,
    private zone: NgZone
  ) {
    this.startConnection();
  }

  private startConnection() {
    const token = this.authService.getAccessToken();
    if (!token) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Hub connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));

    this.hubConnection.on('ReceiveNotification', (notification: NotificationMsg) => {
      // Zone.js requires us to run UI updates inside Angular's zone when coming from external events like SignalR
      this.zone.run(() => {
        this.addNotification(notification);
      });
    });
  }

  public showLocalNotification(title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO' = 'SUCCESS') {
    this.addNotification({ title, message, type });
  }

  public showActionNotification(title: string, message: string, type: 'INFO' | 'SYSTEM' = 'INFO', actions: NotificationAction[]) {
    this.addNotification({ title, message, type, actions, persistent: true });
  }

  private addNotification(notification: NotificationMsg) {
    const current = this.notificationsSubject.value;
    const newNotif = { ...notification, id: Math.random().toString(36).substring(2, 9) };
    this.notificationsSubject.next([...current, newNotif]);

    if (notification.playSound) {
      this.playAudio();
    }

    // Auto-remove after 5 seconds if not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        this.removeNotification(newNotif.id!);
      }, 5000);
    }
  }

  public removeNotification(id: string) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter(n => n.id !== id));
  }

  private playAudio() {
    const audio = new Audio('/assets/notification.mp3');
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        // Automatic playback started!
      }).catch(error => {
        // Auto-play was prevented
        console.log('Audio play failed or was interrupted:', error);
      });
    }
  }
}
