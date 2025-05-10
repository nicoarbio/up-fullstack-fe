import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopHeaderComponent } from './layout/desktop/header/desktop-header.component';
import { MobileHeaderComponent } from './layout/mobile/header/mobile-header.component';
import { DesktopFooterComponent } from './layout/desktop/footer/desktop-footer.component';
import { MobileFooterComponent } from './layout/mobile/footer/mobile-footer.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DesktopHeaderComponent, DesktopHeaderComponent, MobileFooterComponent, MobileFooterComponent, DesktopHeaderComponent, MobileHeaderComponent, MobileHeaderComponent, DesktopFooterComponent, NgIf],
  template: `
    <app-header-mobile *ngIf="isMobile"></app-header-mobile>
    <app-header-desktop *ngIf="!isMobile"></app-header-desktop>
    <main>
      <router-outlet />
    </main>
    <app-footer-mobile *ngIf="isMobile"></app-footer-mobile>
    <app-footer-desktop *ngIf="!isMobile"></app-footer-desktop>
  `
})
export class AppComponent implements OnInit {

  isMobile = window.innerWidth < 768;

  ngOnInit() {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

}
