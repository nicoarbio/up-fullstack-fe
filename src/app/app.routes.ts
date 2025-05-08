import { Routes } from '@angular/router';
import { LoginComponent } from '@pages/login/login.component';
import { BookingsComponent } from '@pages/bookings/bookings.component';
import { CartComponent } from '@pages/cart/cart.component';
import { ProfileComponent } from '@pages/profile/profile.component';
import { OrderComponent } from '@pages/order/order.component';
import { authGuard } from '@guards/auth.guard';

export const routes: Routes = [
  { path: 'bookings', component: BookingsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cart', component: CartComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'order', component: OrderComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'bookings' } // Fallback
];
