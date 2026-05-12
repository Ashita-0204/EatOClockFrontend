import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant } from '../models/restaurant.models';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private readonly API_BASE = `${environment.apiUrl}/api/restaurant`;

  constructor(private http: HttpClient) {}

  getAllRestaurants(includeUnapproved: boolean = false): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.API_BASE}?includeUnapproved=${includeUnapproved}`);
  }

  getRestaurantById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.API_BASE}/${id}`);
  }

  searchRestaurants(params: any): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.API_BASE}/search`, { params });
  }

  getMyRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.API_BASE}/owner/my-restaurants`);
  }

  createRestaurant(payload: any): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.API_BASE, payload);
  }

  updateRestaurant(id: string, payload: any): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.API_BASE}/${id}`, payload);
  }

  approveRestaurant(id: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/${id}/approve`, {});
  }

  rejectRestaurant(id: string): Observable<any> {
    return this.http.post(`${this.API_BASE}/${id}/reject`, {});
  }
}
