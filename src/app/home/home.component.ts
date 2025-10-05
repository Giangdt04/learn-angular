import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subscription, map } from 'rxjs';
import { ProductItemComponent } from '../product-item/productItem.component';
import { ProductItems } from '../types/productItem';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { Router } from "@angular/router";

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
    this.getProductApi = this.productService
      .getProducts({ page: 0, size: 10 })
      .pipe(map((res) => res.result.content)) 
      .subscribe({
        next: (data) => {
          this.products = data.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            images: item.images
          }));
        },
        error: (err) => {
          console.error('Load products failed', err);
        },
      });
  }

  getMainImage(product: ProductItems): string {
    const mainImg = product.images?.find((img) => img.imageMain);
    return mainImg ? mainImg.imageUrl! : 'assets/images/default.png';
  }


  ngOnDestroy(): void {
    if (this.getProductApi) {
      this.getProductApi.unsubscribe();
    }
  }

    viewDetail(productId: number) {
    this.router.navigate(['/product', productId]);
  }
}
