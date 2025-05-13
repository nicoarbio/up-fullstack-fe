import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FloatLabelModule } from 'primeng/floatlabel';
import { environment } from '@environments/environment.development';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule, InputTextModule, FormsModule,
    ToastModule,
    RippleModule,
    ProgressSpinner
  ],
  providers: [ MessageService ],
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
    <p-toast position="center" />
    <p-progress-spinner *ngIf="showSpinner" ariaLabel="loading" />
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private static readonly DEFAULT_RETURN_URL: string = '/profile';

  email = '';
  password = '';
  showSpinner = false;

  // TODO: https://developerchandan.medium.com/integrating-google-login-in-angular-nodejs-4aaaa4c15351
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private messageService: MessageService
  ) {
    if (!environment.production) {
      this.email = 'nico@outlook.com';
      this.password = '123456';
    }
  }

  public emailPasswordLogin(): void {
    this.showSpinner = true;
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({ // TODO: validar. Ordernar el messageService y toastService
      error: (err) => {
        this.showSpinner = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El usuario o la contraseña son incorrectos', life: 5000 });
        this.toastService.showError(err.error?.message || 'An unexpected error occurred');
      },
      complete: () => {
        this.showSpinner = false;
        this.successfulLogin();
      }
    });
  }

  public successfulLogin(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || LoginComponent.DEFAULT_RETURN_URL;
      this.router.navigateByUrl(returnUrl);
    });
  }

}
