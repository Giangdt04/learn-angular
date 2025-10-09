import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { ProductItems } from '../types/productItem';
import { ProductService } from '../../services/product.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { sendViewEvent } from '../../services/event.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  imports: [CommonModule, NgIf, NgFor, NgClass, DecimalPipe]
})
export class DetailComponent implements OnInit {
  product?: ProductItems;
  private destroyRef = inject(DestroyRef);
  selectedImageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  private loadProduct(id: string): void {
  this.productService.getProductById(id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(async res => {
      this.product = res.result;

      // ✅ Gửi sự kiện "VIEW" lên backend khi xem chi tiết
      if (this.product?.id) {
        try {
          await sendViewEvent(this.product.id);
          console.log('✅ View event sent:', this.product.id);
        } catch (err) {
          console.error('❌ Error sending view event:', err);
        }
      }
    });
}

  ngOnInit(): void {
    // Lắng nghe thay đổi param id
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.loadProduct(id);
        }
      });
  }

  // private loadProduct(id: string): void {
  //   this.productService.getProductById(id)
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe(res => {
  //       this.product = res.result;
  //     });
  // }

  getMainImage(): string {
    const mainImg = this.product?.images?.find(img => img.imageMain);
    return mainImg?.imageUrl ?? 'assets/images/default.png';
  }

onThumbnailClick(url: string | undefined) {
  if (url) {
    this.selectedImageUrl = url;
  }
}


  get hasMultipleImages(): boolean {
    return (this.product?.images?.length ?? 0) > 1;
  }
}
