import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DeliveryDashboardComponent } from './delivery-dashboard.component';

const routes: Routes = [{ path: '', component: DeliveryDashboardComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), DeliveryDashboardComponent],
})
export class DeliveryModule {}
