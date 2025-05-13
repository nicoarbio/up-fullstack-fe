import { Component, input } from '@angular/core';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-footer',
  imports: [
    NgIf,
    ButtonModule,
    RouterLink,
    RouterLinkActive
  ],
  template: `
    <ng-container *ngIf="isMobile(); else desktopFooter">
      <nav>
        <button routerLink="/cart" routerLinkActive="active">
          <i class="pi pi-shopping-cart"></i>
          <span>{{ cartLbl }}</span>
        </button>

        <button routerLink="/bookings" routerLinkActive="active">
          <i class="pi pi-calendar"></i>
          <span>{{ bookingsLbl }}</span>
        </button>

        <button routerLink="/{{ userRoute }}" routerLinkActive="active">
          <i class="pi {{ userIcon }}"></i>
          <span>{{ userLbl }}</span>
        </button>
      </nav>
    </ng-container>

    <ng-template #desktopFooter>
      <div class="desktop-footer">
        <a href="https://github.com/nicoarbio/up-fullstack-be" target="_blank" aria-label="GitHub">
          <i class="pi pi-github"></i>
        </a>
        <span>{{ titleLbl }}</span>
        <a href="https://github.com/nicoarbio/up-fullstack-fe" target="_blank" aria-label="GitHub">
          <i class="pi pi-github"></i>
        </a>
      </div>
    </ng-template>
  `,
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  isMobile = input<boolean>();

  static FOOTER_LABELS = {
    title: 'TropicalHub © 2025',
    nav: {
      bookings: 'Turnos',
      userAuth: 'Perfil',
      userNoAuth: 'Iniciar Sesión',
      cart: 'Carrito'
    }
  };

  userRoute = '/login';
  userIcon = 'pi-sign-in';

  titleLbl = FooterComponent.FOOTER_LABELS.title;
  bookingsLbl = FooterComponent.FOOTER_LABELS.nav.bookings;
  userLbl = FooterComponent.FOOTER_LABELS.nav.userNoAuth;
  cartLbl = FooterComponent.FOOTER_LABELS.nav.cart;

  constructor(private router: Router,
              private authService: AuthService) {
    this.setLoggedIn(authService.isLoggedIn());
    authService.loginEvent.subscribe(isLoggedIn => {
      this.setLoggedIn(isLoggedIn);
    });
  }

  private setLoggedIn(isLoggedIn: boolean): void {
    if (isLoggedIn) {
      this.userLbl = FooterComponent.FOOTER_LABELS.nav.userAuth;
      this.userRoute = '/profile';
      this.userIcon = 'pi-user';
    } else {
      this.userLbl = FooterComponent.FOOTER_LABELS.nav.userNoAuth;
      this.userRoute = '/login';
      this.userIcon = 'pi-sign-in';
    }
  }

}
