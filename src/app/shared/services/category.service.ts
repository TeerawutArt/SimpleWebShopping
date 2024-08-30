import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { CategoriesListDto } from '../dtos/categories-list.dto';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}
  getCategories() {
    let url = environment.apiBaseUrl + '/Category';
    return this.http.get<CategoriesListDto[]>(url);
  }
}
