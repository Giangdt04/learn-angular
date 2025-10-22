import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  Subject,
  forkJoin,
} from 'rxjs';
import { FormsModule } from '@angular/forms';

import { ProductItemComponent } from '../product-item/productItem.component';
import { ProductItems } from '../types/productItem';
import { ProductService } from '../../services/product.service';
import * as EventService from '../../services/event.service';
import { jwtDecode } from 'jwt-decode';

interface AutoCompleteResponse {
  result: string[];
}

interface RecentSearchResponse {
  result?: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductItemComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  products: ProductItems[] = [];
  suggestions: string[] = [];
  searchTerm: string = '';
  showSuggestions = false;

  private getProductApi?: Subscription;
  private autoCompleteSub?: Subscription;
  private searchSubject = new Subject<string>();

  private productService = inject(ProductService);
  private router = inject(Router);
  private el = inject(ElementRef);
  currentYear: number = new Date().getFullYear();

  private userId?: number;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.userId = this.getUserIdFromToken();
      this.loadProducts();
      this.initAutoComplete();
    }
  }

  ngOnDestroy(): void {
    this.getProductApi?.unsubscribe();
    this.autoCompleteSub?.unsubscribe();
  }

  private initAutoComplete(): void {
    this.autoCompleteSub = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((text) => {
        const keyword = text.trim();

        if (!keyword) {
          // Người dùng xóa hết text → không show autocomplete, hoặc có thể show recent search
          this.showSuggestions = false; // chỉ show khi click vào input
          return;
        }

        // Nếu có text → chỉ show autocomplete từ Elastic
        this.showSuggestions = true;
        this.productService.getAutoComplete(keyword).subscribe({
          next: (res: AutoCompleteResponse) => {
            const autoArray = Array.isArray(res?.result) ? res.result : [];
            this.suggestions = autoArray.slice(0, 8);
          },
          error: () => {
            this.suggestions = [];
            this.showSuggestions = false;
          },
        });
      });
  }

  /** Xóa 1 history */
removeHistory(keyword: string): void {
  if (!this.userId || !keyword?.trim()) return; 
  this.productService.deleteRecentSearch(this.userId, keyword.trim()).subscribe({
    next: () => {
      this.suggestions = this.suggestions.filter((s) => s !== keyword);
      this.showSuggestions = this.suggestions.length > 0;
    },
    error: (err) => console.error('❌ Xóa history thất bại', err),
  });
}


  /** Khi user focus vào input */
  onInputFocus(): void {
    const keyword = this.searchTerm.trim();

    if (!keyword && this.userId) {
      // Chỉ show history khi chưa gõ chữ
      this.productService.getRecentSearch(this.userId).subscribe({
        next: (res: string[] | RecentSearchResponse) => {
          const recentArray: string[] = Array.isArray(res)
            ? res
            : res.result ?? [];
          this.suggestions = recentArray;
          this.showSuggestions = recentArray.length > 0;
        },
        error: () => {
          this.suggestions = [];
          this.showSuggestions = false;
        },
      });
    }
  }

  private getUserIdFromToken(): number | undefined {
    if (typeof window === 'undefined') return undefined;
    const token = localStorage.getItem('access_token');
    if (!token) return undefined;

    try {
      const decoded: any = jwtDecode<any>(token);
      return decoded?.userID ?? undefined;
    } catch (e) {
      console.warn('Cannot decode token', e);
      return undefined;
    }
  }

  onInputChange(): void {
    this.showSuggestions = true;
    this.searchSubject.next(this.searchTerm);
  }

  selectSuggestion(s: string): void {
    this.searchTerm = s;
    this.showSuggestions = false;
    EventService.sendSearchEvent(s);
    this.loadProducts(s);
  }

  onSearch(event?: Event): void {
    const keyword = this.searchTerm.trim();
    if (!keyword) {
      this.loadProducts();
      this.showSuggestions = false;
      return;
    }

    EventService.sendSearchEvent(keyword);
    this.loadProducts(keyword);
    this.showSuggestions = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }

  getMainImage(product: ProductItems): string {
    const mainImg = product.images?.find((img) => img.imageMain);
    return mainImg ? mainImg.imageUrl! : 'assets/images/default.png';
  }

  private loadProducts(keyword?: string): void {
    const params: any = { pageIndex: 0, pageSize: 8 };
    if (keyword) params.keyword = keyword.toLowerCase();
    if (this.userId) params.userId = this.userId;

    this.getProductApi?.unsubscribe();
    this.getProductApi = this.productService.getProducts(params).subscribe({
      next: (res) => {
        this.products = res.result.content.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          images: item.images,
        }));
      },
      error: (err) => console.error('❌ Load products failed', err),
    });
  }

  viewDetail(productId: number): void {
    EventService.sendViewEvent(productId);
    this.router.navigate(['/product', productId]);
  }
}
