import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@layouts/header/header.component';
import { FooterComponent } from '@layouts/footer/footer.component';
import { OverlayComponent } from '@layouts/overlay/overlay.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    OverlayComponent
  ],
  template: `
    <header>
        <app-header [isMobile]="isMobile"></app-header>
    </header>
    <main>
      <router-outlet/>
    </main>
    <footer>
        <app-footer [isMobile]="isMobile"></app-footer>
    </footer>
    <app-overlay></app-overlay>
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  isMobile = window.innerWidth < 768;

  ngOnInit() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

}
