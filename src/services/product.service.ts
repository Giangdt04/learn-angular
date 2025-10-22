import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Page } from '../model/product.model';
import { ProductItems } from '../app/types/productItem';

/** ==========================
 * 🧠 DTO / Projection Interface
 * ========================== */
export interface ProductTrendingProjection {
  productId: number;
  currentViews: number;
  pastViews: number;
  growthPercent: number;
  categoryName?: string;
}

export interface CategoryTrendingProjection {
  categoryId: number;
  categoryName: string;
  totalViews: number;
  growthPercent?: number;
}

/** ==========================
 * 🧩 Product Service
 * ========================== */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'http://localhost:8080/identity/product';

  getProducts(params?: any): Observable<ApiResponse<Page<ProductItems>>> {
    return this.http.get<ApiResponse<Page<ProductItems>>>(this.BASE_URL, {
      params,
    });
  }

  getProductById(id: string): Observable<ApiResponse<ProductItems>> {
    return this.http.get<ApiResponse<ProductItems>>(`${this.BASE_URL}/${id}`);
  }

  // 🔎 API autocomplete (Elasticsearch)
  getAutoComplete(
    prefix: string,
    limit: number = 8
  ): Observable<ApiResponse<string[]>> {
    const params = new HttpParams().set('prefix', prefix).set('limit', limit);
    return this.http.get<ApiResponse<string[]>>(
      `${this.BASE_URL}/autocomplete`,
      { params }
    );
  }

  getRecentSearch(userId?: number): Observable<string[]> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId.toString());

    return this.http.get<string[]>(`${this.BASE_URL}/search/recent`, {
      params,
    });
  }

  /** Xóa một keyword trong history search */
  deleteRecentSearch(
    userId: number,
    keyword: string
  ): Observable<ApiResponse<boolean>> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('keyword', keyword);

    let headers = new HttpHeaders();
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.delete<ApiResponse<boolean>>(
      `${this.BASE_URL}/search-history`,
      {
        params,
        headers,
        responseType: 'json', // bắt buộc để Angular trả về JSON
      }
    );
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);
  private readonly BASE_URL = 'http://localhost:8080/identity/product';

  // 🔥 API: Lấy sản phẩm trending trong 7 ngày
  getProductTrending(): Observable<ApiResponse<ProductTrendingProjection[]>> {
    return this.http.get<ApiResponse<ProductTrendingProjection[]>>(
      `${this.BASE_URL}/trending`
    );
  }

  // 📈 API: Lấy chủ đề trending (tham số intervalDate mặc định là 7)
  getCategoryTrending(
    intervalDate: number = 7
  ): Observable<ApiResponse<CategoryTrendingProjection[]>> {
    const params = new HttpParams().set(
      'intervalDate',
      intervalDate.toString()
    );
    return this.http.get<ApiResponse<CategoryTrendingProjection[]>>(
      `${this.BASE_URL}/category_trending`,
      { params }
    );
  }
}
