import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NotificationBannerComponent } from './components/shared/notification-banner/notification-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('EatOClock');
}
