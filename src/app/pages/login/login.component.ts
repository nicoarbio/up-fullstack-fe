import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { FloatLabelModule } from 'primeng/floatlabel';
import { environment } from '@environments/environment';
import { OverlayComponent } from '@layouts/overlay/overlay.component';
import { PasswordModule } from 'primeng/password';
import { Observer } from 'rxjs';
import { LoginResponseDto } from '@models/user.dto';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    FloatLabelModule, InputTextModule, FormsModule,
    RippleModule
  ],
  template: `
    <div class="login-form">
      <h2>Iniciar sesión</h2>

      <form class="p-fluid">
        <p-floatlabel variant="on">
          <input pInputText id="email" [(ngModel)]="email" name="email" autocomplete="username" />
          <label for="email">Email</label>
        </p-floatlabel>

        <p-floatlabel variant="on">
          <p-password id="password" [(ngModel)]="password" [feedback]="false" [toggleMask]="true" name="password" autocomplete="current-password" />
          <label for="password">Contraseña</label>
        </p-floatlabel>
      </form>

      <p-button label="Ingresar" (click)="emailPasswordLogin()" [disabled]="!email || !password"></p-button>

      <div class="divider">¿Usuario nuevo?</div>

      <p-button label="Registrarme" (click)="functionNotAvailable()"></p-button>

      <div class="divider">O continuar con</div>

      <div id="googleButton" allow="identity-credentials-get"></div>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  private static readonly DEFAULT_RETURN_URL: string = '/bookings';

  email = '';
  password = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  public ngOnInit(): void {
    if (environment.mockCredentials) {
      this.email = 'nico@tropicalhub.com';
      this.password = '123456';
    }
    this.initializeGoogleLogin();
  }

  public emailPasswordLogin(): void {
    OverlayComponent.spinnerEvent.emit(true);
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe(this.manageLoginEvent);
  }

  public googleOauthLogin(googleResponse: any): void {
    OverlayComponent.spinnerEvent.emit(true);
    this.authService.oauthGoogle(googleResponse.credential).subscribe(this.manageLoginEvent);
  }

  public initializeGoogleLogin(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.googleOauthLogin.bind(this)
      });
      google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large" }
      );
      google.accounts.id.prompt();
    } catch (e) {
      console.error(e);
      OverlayComponent.toastEvent.emit({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar el botón de Google',
      })
    }
  }

  private manageLoginEvent: Partial<Observer<LoginResponseDto>> = {
    next: () => {
      OverlayComponent.spinnerEvent.emit(false);
      this.successfulLogin();
    },
    error: err => {
      OverlayComponent.spinnerEvent.emit(false);
      this.failureLogin(err);
    }
  }

  private successfulLogin(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || LoginComponent.DEFAULT_RETURN_URL;
      this.router.navigateByUrl(returnUrl);
    });
  }

  private failureLogin(err: any): void {
    OverlayComponent.toastEvent.emit({
      type: 'error',
      title: 'Error',
      message: err.error?.error || err.statusText || 'Error al iniciar sesión',
    });
  }

  functionNotAvailable() {
    OverlayComponent.toastEvent.emit({
      type: 'warn',
      title: 'Atención',
      message: 'Esta funcionalidad estará disponible pronto',
    });
  }
}
