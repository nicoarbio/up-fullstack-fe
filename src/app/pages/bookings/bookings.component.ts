import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { BackendService } from '@connectors/backend.service';
import { DateTime } from 'luxon';
import { OverlayComponent } from '@layouts/overlay/overlay.component';
import { Booking, OrderBy, SortBy } from '@models/booking.dto';

@Component({
  selector: 'app-bookings',
  imports: [
    NgIf,
    NgFor
  ],
  template: `
    <h1 *ngIf="!isLoggedIn">Inicie sesión para ver sus turnos</h1>
    Query params:
    <ul>
      <li>searchDate: {{ searchDate }}</li>
      <li>sortBy: {{ sortBy }}</li>
      <li>order: {{ order }}</li>
      <li>limit: {{ limit }}</li>
      <li>page: {{ page }}</li>
    </ul>
    <ng-container *ngIf="bookings.length else noBookings">
      Bookings:
      <ul>
        <li *ngFor="let booking of bookings">
          <p>Booking ID: {{ booking.id }}</p>
          <p>Product: {{ booking.product.type }}</p>
          <p>Start Time: {{ booking.startTime }}</p>
          <p>End Time: {{ booking.endTime }}</p>
          <p>Status: {{ booking.status }}</p>
          <p>Price: {{ booking.price }}</p>
        </li>
      </ul>
    </ng-container>
    <ng-template #noBookings>
      <p>No bookings found.</p>
    </ng-template>
  `,
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {

  isLoggedIn = false;

  searchDate: DateTime = DateTime.now();
  sortBy: SortBy = 'startTime';
  order: OrderBy = 'desc';
  limit: number = 5;
  page: number = 1;

  bookings: Booking[] = [];

  constructor(
    private authService: AuthService,
    private backendConnector: BackendService
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(loggedIn => this.isLoggedIn = loggedIn);

    // TODO Leer parámetros de la URL al iniciar
/*    this.route.queryParams.subscribe(params:any => {
      if (params['searchDate']) this.searchDate = DateTime.fromISO(params['searchDate']);
      if (params['sortBy']) this.sortBy = params['sortBy'] as SortBy;
      if (params['order']) this.order = params['order'] as OrderBy;
      if (params['limit']) this.limit = params['limit'];
      if (params['page']) this.page = params['page'];
    });*/

    if (this.isLoggedIn) {
      this.loadBookings();
    }
  }

  // TODO here
  // http://localhost:8081/api/v1/bookings?
  // searchDate=2025-04-13&sortBy=startTime&order=desc&limit=5&page=1
  /*
    {
      "page": 0,
      "limit": 5,
      "total": 0,
      "totalPages": 0,
      "sortBy": "startTime",
      "order": "desc",
      "date": "2025-04-13T00:00:00.000-03:00",
      "data": []
    }
  */
  loadBookings() {
    OverlayComponent.spinnerEvent.emit(true);
    this.backendConnector.getBookings({
      searchDate: this.searchDate.toISO() as string,
      sortBy: this.sortBy,
      order: this.order,
      limit: this.limit,
      page: this.page
    }).subscribe({
      next: (response) => {
        OverlayComponent.spinnerEvent.emit(false);
        this.sortBy = response.sortBy;
        this.order = response.order;
        this.limit = response.limit;
        this.page = response.page;
        this.bookings = response.data;
        // TODO put queryParams in browser url
      },
      error: (err) => {
        OverlayComponent.spinnerEvent.emit(false);
        OverlayComponent.toastEvent.emit({
          type: 'error',
          title: 'Error',
          message: err.error?.error || err.statusText || 'Error obteniendo los turnos',
        });
      }
    })
  }

}
