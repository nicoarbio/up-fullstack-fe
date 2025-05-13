import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { NgIf } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    Button,
    NgIf,
    RouterLink
  ],
  template: `
    <h1>Desarrollo de componente de perfil en proceso</h1>
    <p-button *ngIf="showLogOutButton" label="Cerrar sesión" (click)="logout()" routerLink="/bookings"></p-button>
  `,
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  showLogOutButton = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.loginEvent.subscribe(isLoggedIn => {
      this.showLogOutButton = isLoggedIn;
    });
    this.showLogOutButton = this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    this.showLogOutButton = false;
  }

}
