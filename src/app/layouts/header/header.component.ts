import { Component, input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    NgIf, ButtonModule, RouterLink
  ],
  template: `
    <h1 >{{ titleLbl }}</h1>
    <nav *ngIf="!isMobile()">
      <p-button variant="outlined" styleClass="nav-bar-button" [raised]="true" label="{{ bookingsLbl }}" routerLink="/bookings" />
      <p-button variant="outlined" styleClass="nav-bar-button" [raised]="true" label="{{ userLbl }}" routerLink="{{ userRoute }}" />
      <p-button variant="outlined" styleClass="nav-bar-button" [raised]="true" label="{{ cartLbl }}" routerLink="/cart" />
    </nav>
  `,
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  isMobile = input.required<boolean>();

  static HEADER_LABELS = {
    title: 'TropicalHub',
    nav: {
      bookings: 'Turnos',
      userAuth: 'Perfil',
      userNoAuth: 'Iniciar Sesión',
      cart: 'Carrito'
    }
  };

  userRoute = '/login';

  titleLbl = HeaderComponent.HEADER_LABELS.title;
  bookingsLbl = HeaderComponent.HEADER_LABELS.nav.bookings;
  userLbl = HeaderComponent.HEADER_LABELS.nav.userNoAuth;
  cartLbl = HeaderComponent.HEADER_LABELS.nav.cart;

  constructor(private router: Router,
              private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(loggedIn => this.setLoggedIn(loggedIn));
    this.authService.loginEvent$.subscribe(isLoggedIn => {
      this.setLoggedIn(isLoggedIn);
    });
  }

  private setLoggedIn(isLoggedIn: boolean): void {
    if (isLoggedIn) {
      this.userLbl = HeaderComponent.HEADER_LABELS.nav.userAuth;
      this.userRoute = '/profile';
    } else {
      this.userLbl = HeaderComponent.HEADER_LABELS.nav.userNoAuth;
      this.userRoute = '/login';
    }
  }

}
