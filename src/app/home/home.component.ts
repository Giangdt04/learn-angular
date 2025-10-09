import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subscription, map } from 'rxjs';
import { ProductItemComponent } from '../product-item/productItem.component';
import { ProductItems } from '../types/productItem';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { sendViewEvent } from '../../services/event.service';
import { sendSearchEvent } from '../../services/event.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductItemComponent, NgIf, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  products: ProductItems[] = [];
  getProductApi!: Subscription;

  router = inject(Router);

  currentYear: number = new Date().getFullYear();

  constructor(private productService: ProductService) {}

ngOnInit(): void {
    this.loadProducts(); // load mặc định khi chưa tìm
  }
  getMainImage(product: ProductItems): string {
    const mainImg = product.images?.find((img) => img.imageMain);
    return mainImg ? mainImg.imageUrl! : '/src/assets/images/default.png';
  }

  ngOnDestroy(): void {
    if (this.getProductApi) {
      this.getProductApi.unsubscribe();
    }
  }

  viewDetail(productId: number) {
    sendViewEvent(productId);
    this.router.navigate(['/product', productId]);
  }
  
   private loadProducts(keyword?: string): void {
  // Backend có thể yêu cầu: { page: 0, size: 10, search: keyword }
  const params: any = { page: 0, size: 10 };
  if (keyword) params.keyword = keyword;

  this.getProductApi?.unsubscribe(); // huỷ subscription cũ nếu có

  this.getProductApi = this.productService
    .getProducts(params)
    .pipe(map((res) => res.result.content)) // chắc chắn là đúng path data
    .subscribe({
      next: (data) => {
        this.products = data.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          images: item.images,
        }));
      },
      error: (err) => {
        console.error('Load products failed', err);
      },
    });
  }

onSearch(event: Event) {
  const input = event.target as HTMLInputElement;
  const keyword = input.value.trim();

  // Nếu muốn reset khi trống
  if (!keyword) {
    this.loadProducts();
    return;
  }

  sendSearchEvent(keyword);
  this.loadProducts(keyword);
}


}
