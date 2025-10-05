import { HttpInterceptorFn } from "@angular/common/http";

export const customInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    token = localStorage.getItem("authToken");
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
