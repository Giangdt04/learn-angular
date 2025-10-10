import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ProductItems } from '../types/productItem';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  cartItems: (ProductItems & { selected?: boolean })[] = [];
  selectedTotal = 0;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    // 👇 Lắng nghe thay đổi từ service
    this.cartService.cart$.subscribe((cart) => {
      this.cartItems = cart;
      this.updateSelectedItems();
    });
  }

  increase(item: ProductItems) {
    this.cartService.increaseQuantity(item);
  }

  decrease(item: ProductItems) {
    this.cartService.decreaseQuantity(item);
  }

  remove(id: number) {
    this.cartService.removeItem(id);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  updateSelectedItems() {
    this.selectedTotal = this.cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }

  hasSelected() {
    return this.cartItems.some((item) => item.selected);
  }

  checkout() {
    const selectedItems = this.cartItems.filter((item) => item.selected);
    if (!selectedItems.length) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }

    this.router.navigate(['/checkout'], {
      state: { items: selectedItems },
    });
  }
}
