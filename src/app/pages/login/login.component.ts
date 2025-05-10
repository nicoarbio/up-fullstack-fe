import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    IftaLabelModule,
    ToastModule,
    RippleModule,
    ProgressSpinner
  ],
  providers: [ MessageService ],
  template: `
    <div class="login-form">
      <h2>Iniciar sesión</h2>

      <div class="p-fluid">
        <p-iftalabel>
          <input pInputText id="email" [(ngModel)]="email" autocomplete="off" />
          <label for="email">Email</label>
        </p-iftalabel>

        <p-iftalabel>
          <input pInputText id="password" [(ngModel)]="password" autocomplete="off" />
          <label for="password">Contraseña</label>
        </p-iftalabel>

        <p-button label="Ingresar" (click)="emailPasswordLogin()" class="mt-4" [disabled]="!email || !password"></p-button>

        <p-toast position="center" />
        <p-progress-spinner *ngIf="showSpinner" ariaLabel="loading" />
      </div>
    </div>
  `,
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private static readonly DEFAULT_RETURN_URL: string = '/profile';

  email = '';
  password = '';
  showSpinner = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastService: ToastService,
    private messageService: MessageService
  ) { }

  public emailPasswordLogin(): void {
    this.showSpinner = true;
    setTimeout(() => {
      this.showSpinner = false;
      // this.toastService.showError('Error de inicio de sesión', 'El usuario o la contraseña son incorrectos');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El usuario o la contraseña son incorrectos', life: 5000 });
    }, 5000)

    return;
    this.messageService.add({ severity: 'contrast', summary: 'Info', detail: 'Iniciando sesión...', life: 5000 });

    this.authService.login({
      email: this.email,
      password: this.password }
    ).subscribe({
      next: () => {
        this.successfulLogin();
      },
      error: (err) => {
        this.toastService.showError(err.error?.message || 'An unexpected error occurred');
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
