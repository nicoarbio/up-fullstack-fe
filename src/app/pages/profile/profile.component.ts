import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { NgIf } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { RouterLink } from '@angular/router';
import { UserProfile } from '@models/user.dto';
import { Image } from 'primeng/image';
import { OverlayComponent } from '@layouts/overlay/overlay.component';

@Component({
  selector: 'app-profile',
  imports: [
    Button,
    NgIf,
    RouterLink,
    Image
  ],
  template: `
    <ng-container *ngIf="isLoggedIn && profile">
      <p *ngIf="profile.role?.toUpperCase() === 'ADMIN'">CUENTA ADMINISTRADOR</p>
      <p-image src="{{ profile.imageUrl }}" alt="Profile Image" width="96" />
      <p-button label="Cerrar sesión" (click)="logout()" routerLink="/bookings"></p-button>
      <p>Nombre: {{ profile.name }} {{ profile.lastname }}</p>
      <p>Email: {{ profile.email }}</p>
      <p>Teléfono: {{ profile.phoneNumber }}</p>
      <p>Último inicio de sesión: {{ profile.lastLogin }}</p>
      <p>Fecha de creación: {{ profile.createdAt }}</p>
      <p>Fecha de actualización: {{ profile.updatedAt }}</p>
    </ng-container>
  `,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  isLoggedIn = false;
  profile: UserProfile | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.loginEvent$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    this.authService.isLoggedIn().subscribe(loggedIn => this.isLoggedIn = loggedIn);
    OverlayComponent.spinnerEvent.emit(true);
    this.authService.getUserProfileInfo().subscribe(profile => {
      OverlayComponent.spinnerEvent.emit(false);
      if (profile && Object.keys(profile).length === 0) {
        this.profile = null;
      } else {
        this.profile = profile;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
  }

}
