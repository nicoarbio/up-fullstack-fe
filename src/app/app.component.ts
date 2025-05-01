import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [ ButtonModule, RouterOutlet ],
  template: `
    <p>Congratulations! Your app {{ title }} is running. 🎉</p>
    <p-button label="Check" (click)="onClick()" />
    <router-outlet />
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'up-fullstack-fe';

  onClick() {
    console.log('Button clicked!');
  }

}
