import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { FloatLabelModule } from 'primeng/floatlabel';
import { environment } from '@environments/environment.development';
import { OverlayComponent } from '@layouts/overlay/overlay.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule, InputTextModule, FormsModule,
    RippleModule
  ],
  template: `
    <div class="login-form">
      <h2>Iniciar sesión</h2>

      <div class="p-fluid">
        <p-floatlabel variant="on">
          <input pInputText id="email" [(ngModel)]="email" />
          <label for="email">Email</label>
        </p-floatlabel>

        <p-floatlabel variant="on">
          <input pInputText id="password" [(ngModel)]="password" />
          <label for="password">Contraseña</label>
        </p-floatlabel>

        <p-button label="Ingresar" (click)="emailPasswordLogin()" class="mt-4" [disabled]="!email || !password"></p-button>

      </div>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private static readonly DEFAULT_RETURN_URL: string = '/profile';

  email = '';
  password = '';

  // TODO: https://developerchandan.medium.com/integrating-google-login-in-angular-nodejs-4aaaa4c15351
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    if (!environment.production) {
      this.email = 'nico@outlook.com';
      this.password = '123456';
    }
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
        console.log(err);
        OverlayComponent.spinnerEvent.emit(false);
        OverlayComponent.toastEvent.emit({
          type: 'error',
          title: 'Error',
          message: err.error?.error || err.statusText || 'Error al iniciar sesión',
        });
      })
  }

  public successfulLogin(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || LoginComponent.DEFAULT_RETURN_URL;
      this.router.navigateByUrl(returnUrl);
    });
  }

}
