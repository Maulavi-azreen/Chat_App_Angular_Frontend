import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token'); // Retrieve the token from localStorage
  // console.log("Token in interceptor:", token);

  // If a token exists, clone the request with the Authorization header
  const clonedRequest = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedRequest); // Pass the (possibly modified) request to the next handler
};
