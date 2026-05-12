import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MenuCategory, MenuItem } from '../models/menu.models';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly API_BASE = `${environment.apiUrl}/api/v1/menu`;

  constructor(private http: HttpClient) {}

  getCategories(restaurantId: string): Observable<MenuCategory[]> {
    return this.http.get<MenuCategory[]>(`${this.API_BASE}/category/${restaurantId}`);
  }

  createCategory(payload: any): Observable<MenuCategory> {
    return this.http.post<MenuCategory>(`${this.API_BASE}/category`, payload);
  }

  createItem(payload: any): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.API_BASE}/item`, payload);
  }

  updateItem(id: string, payload: any): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.API_BASE}/item/${id}`, payload);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.API_BASE}/item/${id}`);
  }

  toggleAvailability(id: string): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.API_BASE}/item/${id}/availability`, {});
  }
}
