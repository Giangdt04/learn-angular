import { HttpClient } from "@angular/common/http";
import { Component, inject } from "@angular/core";
import { FormsModule, NgModel } from "@angular/forms";
import { Router } from "@angular/router";
import { CommonModule } from '@angular/common'; // Thêm CommonModule cho *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // Đảm bảo FormsModule và CommonModule được import
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
 // Đã đổi styleUrl thành styleUrls nếu bạn sử dụng nhiều file CSS
})
export class LoginComponent {
  user: any = {
    "username": "",
    "pass": ""
  };

  showForgotPasswordModal = false;
  showOtpModal = false;
  showResetPasswordModal = false;

  forgotEmail: string = '';
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

    this.http.post("http://localhost:8080/identity/auth/token", this.user, {
        headers: { 'Content-Type': 'application/json' }
    })
    .subscribe((res: any) => {
        if (res?.result?.authenticated) {
            alert("Đăng nhập thành công!"); // Có thể thay thế bằng modal đẹp hơn
            console.log("Token:", res.result.token);
            // Lưu token vào localStorage nếu cần
            localStorage.setItem("authToken", res.result.token);
            this.router.navigateByUrl('') // Điều hướng về trang chủ
        } else {
            this.errorMessage = res?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
            alert(this.errorMessage); // Hiển thị thông báo thất bại
        }
    }, error => {
        console.error("Lỗi đăng nhập:", error);
        if (error?.error?.message) {
            this.errorMessage = error.error.message; // Hiển thị lỗi từ backend
            alert(this.errorMessage);
        } else {
            this.errorMessage = "Yêu cầu đăng nhập thất bại. Vui lòng thử lại sau.";
            alert(this.errorMessage);
        }
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
    if (!this.forgotEmail) {
      this.forgotMessage = "Vui lòng nhập email.";
      return;
    }

    this.http.post(`http://localhost:8080/identity/auth/forgot-password?email=${encodeURIComponent(this.forgotEmail)}`,{})
      .subscribe({
        next: () => {
          this.forgotMessage = "";
          this.showForgotPasswordModal = false; // đóng modal nhập email
          this.showOtpModal = true; // mở modal OTP
        },
        error: (err) => {
          this.forgotMessage = err?.error?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.";
        }
      });
  }

   onVerifyOtp() {
    if (!this.otpCode) {
      this.otpMessage = "Vui lòng nhập mã OTP.";
      return;
    }

    this.http.post(`http://localhost:8080/identity/auth/verify-code?email=${encodeURIComponent(this.forgotEmail)}&token=${encodeURIComponent(this.otpCode)}`, {}
  ).subscribe({
      next: () => {
        this.otpMessage = "✅ Xác nhận thành công! Giờ bạn có thể đặt lại mật khẩu.";
        this.otpCode = "";
        this.showOtpModal = false;
        this.showResetPasswordModal = true;
      },
      error: (err) => {
        this.otpMessage = err?.error?.message || "Mã OTP không hợp lệ.";
      }
    });
  }

   onResetPassword() {
    if (!this.newPassword) {
      this.resetMessage = "Vui lòng nhập mật khẩu mới.";
      return;
    }

    this.http.post<any>(
      `http://localhost:8080/identity/auth/reset-password?email=${this.forgotEmail}&newPassword=${this.newPassword}`,
      {}
    ).subscribe({
      next: () => {
        this.resetMessage = '✅ Đặt lại mật khẩu thành công!';
        setTimeout(() => {
          this.showResetPasswordModal = false;
          this.newPassword="";
        }, 1500);
      },
      error: (err) => {
        this.resetMessage = err.error?.message || 'Đặt lại mật khẩu thất bại';
      }
    });
  }
  
}
