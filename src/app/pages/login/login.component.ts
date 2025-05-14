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

      <ng-container class="p-fluid">
        <p-floatlabel variant="on">
          <input pInputText id="email" [(ngModel)]="email" />
          <label for="email">Email</label>
        </p-floatlabel>

        <p-floatlabel variant="on">
          <p-password id="password" [(ngModel)]="password" [feedback]="false" [toggleMask]="true" />
          <label for="password">Contraseña</label>
        </p-floatlabel>

        <p-button label="Ingresar" (click)="emailPasswordLogin()" [disabled]="!email || !password"></p-button>
        <p>linea-divisoria</p>

        <p>Usuario nuevo?</p>
        <p-button label="Registrarme"></p-button>

        <p>linea-divisoria</p>
        <p>También podes iniciar sesión o registrarte con Google</p>

        <div id="googleButton" allow="identity-credentials-get"></div>
      </ng-container>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  private static readonly DEFAULT_RETURN_URL: string = '/profile';

  email = '';
  password = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  public ngOnInit(): void {
    if (!environment.production) {
      this.email = 'nico@outlook.com';
      this.password = '123456';
    }
    this.initializeGoogleLogin();
  }

  public emailPasswordLogin(): void {
    OverlayComponent.spinnerEvent.emit(true);
    this.authService.login({
      email: this.email,
      password: this.password
    })
      .then(() =>{
        OverlayComponent.spinnerEvent.emit(false);
        this.successfulLogin();
      })
      .catch((err) => {
        OverlayComponent.spinnerEvent.emit(false);
        OverlayComponent.toastEvent.emit({
          type: 'error',
          title: 'Error',
          message: err.error?.error || err.statusText || 'Error al iniciar sesión',
        });
      })
  }

  public googleOauthLogin(response: any): void {
    OverlayComponent.spinnerEvent.emit(true);
    this.authService.oauthGoogle(response.credential)
      .then(() =>{
        OverlayComponent.spinnerEvent.emit(false);
        this.successfulLogin();
      })
      .catch((err) => {
        OverlayComponent.spinnerEvent.emit(false);
        OverlayComponent.toastEvent.emit({
          type: 'error',
          title: 'Error',
          message: err.error?.error || err.statusText || 'Error al iniciar sesión',
        });
      })
  }

  public initializeGoogleLogin(): void {
    try {
      google.accounts.id.initialize({
        client_id: "205278716679-sas68d5f4trinhumfutpc6i1jdu6ed7a.apps.googleusercontent.com",
        callback: this.googleOauthLogin.bind(this)
      });
      google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large" }
      );
      google.accounts.id.prompt();
    } catch (e) {
      console.error(e);
    }
  }

  public successfulLogin(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || LoginComponent.DEFAULT_RETURN_URL;
      this.router.navigateByUrl(returnUrl);
    });
  }

}
