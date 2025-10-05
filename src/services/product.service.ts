import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponse, Page } from "../model/product.model";
import { ProductItems } from "../app/types/productItem";

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);

    getProducts(params?: any): Observable<ApiResponse<Page<ProductItems>>> {
        return this.http.get<ApiResponse<Page<ProductItems>>>(
            'http://localhost:8080/identity/product', 
            { params }
        );
    }

    getProductById(id: string): Observable<ApiResponse<ProductItems>> {
  return this.http.get<ApiResponse<ProductItems>>(
    `http://localhost:8080/identity/product/${id}`
  );
}

}
