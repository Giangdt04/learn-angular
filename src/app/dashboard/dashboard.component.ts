import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import {
  AnalyticsService,
  ProductTrendingProjection,
  CategoryTrendingProjection,
} from '../../services/product.service';
import { FormsModule } from '@angular/forms';

interface TopProduct {
  productId: number;
  viewCount: number;
}

interface TopKeyword {
  keyword: string;
  searchCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private socket!: Socket;
  private analyticsService = inject(AnalyticsService);

  periodOptions = [
    { label: '1 ngày', value: 1 },
    { label: '1 tuần', value: 7 },
    { label: '1 tháng', value: 30 },
    { label: '3 tháng', value: 90 },
    { label: '6 tháng', value: 180 },
    { label: '1 năm', value: 365 },
  ];

  selectedPeriod = 7;

  // ⚡ Realtime data
  topProducts: TopProduct[] = [];
  topKeywords: TopKeyword[] = [];
  isConnected = false;
  lastUpdate = '';

  // 📊 Trending data
  productTrending: ProductTrendingProjection[] = [];
  categoryTrending: CategoryTrendingProjection[] = [];

  last7DaysRange: string = '';
  prev7DaysRange: string = '';

  constructor() {
    this.last7DaysRange = this.getFormattedDateRange(0, 7);
    this.prev7DaysRange = this.getFormattedDateRange(7, 14);
  }


  getFormattedDateRange(startOffset: number, endOffset: number): string {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - endOffset);
    end.setDate(end.getDate() - startOffset);
    return `${start.toLocaleDateString('vi-VN')} – ${end.toLocaleDateString(
      'vi-VN'
    )}`;
  }

  // 🧭 Lifecycle
    ngOnInit(): void {
    this.initWebSocket();
    this.loadTrendingData();
  }

  ngOnDestroy(): void {
    if (this.socket) this.socket.disconnect();
  }

  /** ============================
   * 🔌 1️⃣ WebSocket realtime
   * ============================ */
  private initWebSocket() {
    this.socket = io('http://localhost:8099');

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.warn('❌ Disconnected from WebSocket');
    });

    this.socket.on('updateTop10Products', (data: TopProduct[]) => {
      this.topProducts = data;
      this.updateLastUpdateTime();
    });

    this.socket.on('updateTop10Keywords', (data: TopKeyword[]) => {
      this.topKeywords = data;
      this.updateLastUpdateTime();
    });
  }

  /** ============================
   * 📈 2️⃣ Load Trending Data
   * ============================ */
  private loadTrendingData() {
    this.analyticsService.getProductTrending().subscribe({
      next: (res) => {
        this.productTrending = res.result || [];
        console.log('🔥 Product Trending:', this.productTrending);
      },
      error: (err) => console.error('Error loading product trending:', err),
    });

    this.loadCategoryTrending(this.selectedPeriod);
  }

  private loadCategoryTrending(days: number) {
    this.analyticsService.getCategoryTrending(days).subscribe({
      next: (res) => {
        this.categoryTrending = res.result || [];
        console.log(`🔥 Category Trending (${days} ngày):`, this.categoryTrending);
      },
      error: (err) => console.error('Error loading category trending:', err),
    });
  }

  /** ============================
   * 🧩 3️⃣ Combobox handler
   * ============================ */
  onPeriodChange() {
    console.log('📅 Thay đổi khoảng thời gian:', this.selectedPeriod);
    this.loadCategoryTrending(this.selectedPeriod);
  }

  /** ============================
   * ⏰ 3️⃣ Helper
   * ============================ */
 updateLastUpdateTime() {
    this.lastUpdate = new Date().toLocaleString('vi-VN');
  }
}
