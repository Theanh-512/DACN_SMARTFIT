import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Lỗi máy khách: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập tài nguyên này.';
        } else if (error.status === 404) {
          errorMessage = 'Không tìm thấy tài nguyên yêu cầu.';
        } else if (error.status >= 500) {
          errorMessage = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
        }
      }

      console.error(`[API Error ${error.status}]:`, error.message, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
