import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductItems } from '../types/productItem';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  selectedItems: (ProductItems & { quantity?: number })[] = [];
  total = 0;

  customer = {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    ward: '',
    address: '',
  };

  cities: any[] = [];
  wards: any[] = [];

  constructor(
    private cartService: CartService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const nav = history.state as any;
    this.selectedItems = nav.items || [];

    if (!this.selectedItems.length) {
      alert('Chưa có sản phẩm nào được chọn để thanh toán!');
      this.router.navigate(['/cart']);
      return;
    }

    this.total = this.selectedItems.reduce(
      (sum, item) => sum + (item.price * (item.quantity || 1)),
      0
    );

    this.loadCities();
  }

  loadCities() {
    this.http
      .get<any[]>('assets/data/full_json_generated_data_vn_units.json')
      .subscribe((data) => {
        // Lọc chỉ những object là province
        this.cities = data.filter((x) => x.Type === 'province');
      });
  }

  onCityChange() {
    const city = this.cities.find((c) => c.Name === this.customer.city);
    this.wards = city ? city.Wards : [];
    this.customer.ward = '';
  }

  confirmOrder() {
    if (
      !this.customer.fullName ||
      !this.customer.email ||
      !this.customer.phone ||
      !this.customer.city ||
      !this.customer.ward ||
      !this.customer.address
    ) {
      alert('Vui lòng điền đầy đủ thông tin nhận hàng!');
      return;
    }

    alert('Thanh toán thành công! Cảm ơn bạn đã mua hàng');

    this.selectedItems.forEach((item) => {
      this.cartService.removeItem(item.id);
    });

    this.router.navigate(['/home']);
  }
}
