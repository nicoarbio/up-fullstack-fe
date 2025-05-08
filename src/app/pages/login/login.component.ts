import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [],
  template: ``,
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private static readonly DEFAULT_RETURN_URL: string = '/profile';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  public successfulLogin(): void {
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'] || LoginComponent.DEFAULT_RETURN_URL;
      this.router.navigateByUrl(returnUrl);
    });
  }

}
