import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { CategoriesListDto } from '../dtos/categories-list.dto';
import { CategoryCreateDto } from '../dtos/category-create.dto';
import { CategoryUpdateDto } from '../dtos/category-update.dto';
import { PagingDto } from '../dtos/paging.dto';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}
  getCategories() {
    let url = environment.apiBaseUrl + '/Category';
    return this.http.get<CategoriesListDto[]>(url);
  }
  getCategoriesWithKeyword(
    keyword: string,
    pageIndex: number,
    pagesize: number
  ) {
    let reqUrl = environment.apiBaseUrl + '/Category';
    reqUrl += '?keyword=' + encodeURIComponent(keyword); //encode เพราะจะได้ส่งอักษรพิเศษไปได้ เช่น spacebar
    reqUrl = reqUrl + '&PageIndex=' + pageIndex;
    reqUrl = reqUrl + '&PageSize=' + pagesize;
    return this.http.get<PagingDto<CategoriesListDto>>(reqUrl);
  }
  createCategory(req: CategoryCreateDto) {
    let url = environment.apiBaseUrl + '/Category';
    return this.http.post<unknown>(url, req);
  }
  deleteCategory(id: string) {
    let url = environment.apiBaseUrl + '/Category/' + id;
    return this.http.delete<unknown>(url);
  }
  updateCategory(id: string, req: CategoryUpdateDto) {
    let url = environment.apiBaseUrl + '/Category/' + id;
    return this.http.put<unknown>(url, req);
  }
  deleteSelectedCategory(selectedCategoryId: string[]) {
    let url = environment.apiBaseUrl + '/Category/Selected';
    return this.http.delete<unknown>(url, {
      body: { categoryId: selectedCategoryId },
    });
  }
}
