import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProductItems } from '../app/types/productItem';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartKey = 'cart_items';
  private cartSubject = new BehaviorSubject<(ProductItems & { quantity?: number })[]>(this.getCart());
  cart$ = this.cartSubject.asObservable();

  constructor() {}

  /** Lấy danh sách sản phẩm trong giỏ */
  getCart(): (ProductItems & { quantity?: number })[] {
    return JSON.parse(localStorage.getItem(this.cartKey) || '[]');
  }

  /** Lưu giỏ hàng vào localStorage và cập nhật Subject */
  private saveCart(cart: (ProductItems & { quantity?: number })[]) {
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.cartSubject.next(cart); // 👈 phát sự kiện cho component biết
  }

  /** Thêm sản phẩm vào giỏ */
  addToCart(product: ProductItems) {
    const cart = this.getCart();
    const existing = cart.find((p) => p.id === product.id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    this.saveCart(cart);
  }

  /** Xóa 1 sản phẩm theo ID */
  removeItem(id: number) {
    const cart = this.getCart().filter((p) => p.id !== id);
    this.saveCart(cart);
  }

  /** Xóa toàn bộ giỏ hàng */
  clearCart() {
    localStorage.removeItem(this.cartKey);
    this.cartSubject.next([]); // 👈 phát ra giỏ hàng trống
  }

  /** Xóa các sản phẩm đã thanh toán */
  removePaidItems(paidItems: (ProductItems & { quantity?: number })[]) {
    const cart = this.getCart();
    const remaining = cart.filter(
      (item) => !paidItems.some((paid) => paid.id === item.id)
    );
    this.saveCart(remaining);
  }

  /** Tăng số lượng sản phẩm */
  increaseQuantity(product: ProductItems) {
    const cart = this.getCart();
    const item = cart.find((p) => p.id === product.id);
    if (item) item.quantity = (item.quantity || 1) + 1;
    this.saveCart(cart);
  }

  /** Giảm số lượng sản phẩm */
  decreaseQuantity(product: ProductItems) {
    const cart = this.getCart();
    const item = cart.find((p) => p.id === product.id);
    if (item && item.quantity && item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(product.id);
      return;
    }
    this.saveCart(cart);
  }
}
