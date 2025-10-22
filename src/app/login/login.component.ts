
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jwtDecode } from 'jwt-decode';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // Đảm bảo FormsModule và CommonModule được import
  templateUrl: './login.component.html',

  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  user = {
    username: '',
    pass: '',

  };

  showForgotPasswordModal = false;
  showOtpModal = false;
  showResetPasswordModal = false;
  isSending = false;

  forgotEmail: string = '';
  forgotUsername: string = '';
  forgotMessage: string = '';

  otpCode: string = '';
  otpMessage: string = '';

  newPassword: string = '';
  resetMessage: string = '';

  // Các biến cần thiết cho template HTML
  errorMessage: string = '';
  rememberMe: boolean = false;

  http = inject(HttpClient);
  router = inject(Router);

  onLogin() {
    // Xóa thông báo lỗi cũ
    this.errorMessage = '';

    // Kiểm tra đầu vào rỗng trước khi gửi request
    if (!this.user.username || !this.user.pass) {
        this.errorMessage = 'Vui lòng nhập đầy đủ tên người dùng và mật khẩu.';
        return;
    }


    this.http
      .post('http://localhost:8080/identity/auth/token', this.user, {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe({
        next: (res: any) => {
          console.log('Login response:', res);
          if (res?.result?.authenticated && res?.result?.token) {
            // ✅ Lưu token mới
            const token = res.result.token;
            localStorage.setItem('access_token', token);
            alert('🎉 Đăng nhập thành công!');

            const decoded: any = jwtDecode<any>(token);
            console.log('Decoded token:', decoded);

            const scope: string = decoded?.scope || '';
            const roles = scope.split(' ');
            
            if (roles.includes('ROLE_ADMIN')) {
              this.router.navigateByUrl('/dashboard');
            } else {
              this.router.navigateByUrl('/');
            }
          } else {
            this.errorMessage =
              res?.message ||
              'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            alert(this.errorMessage);
          }
        },
        error: (err) => {
          console.error('Lỗi đăng nhập:', err);
          this.errorMessage =
            err?.error?.message ||
            'Yêu cầu đăng nhập thất bại. Vui lòng thử lại sau.';
          alert(this.errorMessage);
        },
      });

  }
  
  // Thêm lại các hàm điều hướng để template HTML không báo lỗi
  goToRegister(): void {
    console.log('Chuyển đến trang đăng ký');
    this.router.navigate(['/register']);
  }

  openForgotPasswordModal(event: Event) {
    event.preventDefault();
    console.log("👉 Mở modal quên mật khẩu");
    this.showForgotPasswordModal = true;
  }

  // Đóng modal
  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }

  closeOtpModal() {
    this.showOtpModal = false;
  }

   onForgotPassword() {
    if (!this.forgotUsername) {
      this.forgotMessage = 'Vui lòng nhập username.';
      return;
    }
    if (!this.forgotEmail) {
      this.forgotMessage = 'Vui lòng nhập email.';
      return;
    }

    if (this.isSending) return;
    this.isSending = true;

    this.forgotMessage = '';

    this.http
      .post(
        `http://localhost:8080/identity/auth/forgot-password?email=${encodeURIComponent(
          this.forgotEmail
        )}&username=${encodeURIComponent(this.forgotUsername)}`,
        {}
      )
      .subscribe({
        next: () => {
          this.isSending = false;
          this.showForgotPasswordModal = false;
          this.showOtpModal = true;
        },
        error: (err) => {
          this.isSending = false;
          this.forgotMessage =
            err?.error?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
        },

      });
  }

   onVerifyOtp() {
    if (!this.otpCode) {
      this.otpMessage = 'Vui lòng nhập mã OTP.';
      return;
    }


    this.http
      .post(
        `http://localhost:8080/identity/auth/verify-code?email=${encodeURIComponent(
          this.forgotEmail
        )}&token=${encodeURIComponent(this.otpCode)}`,
        {}
      )
      .subscribe({
        next: () => {
          this.otpMessage =
            '✅ Xác nhận thành công! Giờ bạn có thể đặt lại mật khẩu.';
          this.showOtpModal = false;
          this.showResetPasswordModal = true;
        },
        error: (err) => {
          this.otpMessage = err?.error?.message || 'Mã OTP không hợp lệ.';
        },
      });

  }

   onResetPassword() {
    if (!this.newPassword) {
      this.resetMessage = 'Vui lòng nhập mật khẩu mới.';
      return;
    }


    this.http
      .post(
        `http://localhost:8080/identity/auth/reset-password?email=${encodeURIComponent(
          this.forgotEmail
        )}&newPassword=${encodeURIComponent(this.newPassword)}`,
        {}
      )
      .subscribe({
        next: () => {
          this.resetMessage = '✅ Đặt lại mật khẩu thành công!';
          setTimeout(() => {
            this.showResetPasswordModal = false;
            this.newPassword = '';
          }, 1500);
        },
        error: (err) => {
          this.resetMessage =
            err?.error?.message || 'Đặt lại mật khẩu thất bại.';
        },
      });

  }
  
}
