import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NotificationBannerComponent } from './components/shared/notification-banner/notification-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationBannerComponent],
  template: '<router-outlet></router-outlet><app-notification-banner></app-notification-banner>',
})
export class AppComponent {}
