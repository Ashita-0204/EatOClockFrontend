import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RestaurantDashboardComponent } from './restaurant-dashboard.component';

const routes: Routes = [{ path: '', component: RestaurantDashboardComponent }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), RestaurantDashboardComponent],
})
export class RestaurantModule {}
