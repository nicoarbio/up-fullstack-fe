import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { CartComponent } from './pages/cart/cart.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { OrderComponent } from './pages/order/order.component';

export const routes: Routes = [
  { path: '', redirectTo: 'bookings', pathMatch: 'full' },
  { path: 'bookings', component: BookingsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cart', component: CartComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'order', component: OrderComponent },
  { path: '**', redirectTo: 'bookings' } // Fallback
];
