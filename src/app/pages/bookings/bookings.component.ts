import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { Location, NgFor, NgIf } from '@angular/common';
import { BackendService } from '@connectors/backend.service';
import { DateTime } from 'luxon';
import { OverlayComponent } from '@layouts/overlay/overlay.component';
import { Booking, OrderBy, SortBy } from '@models/booking.dto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bookings',
  imports: [
    NgIf,
    NgFor
  ],
  template: `
    <h1 *ngIf="!isLoggedIn else showBookings">Inicie sesión para ver sus turnos</h1>
    <ng-template #showBookings>
      Query params:
      <ul>
        <li>page: {{ page }}</li>
        <li>limit: {{ limit }}</li>
        <li>total: {{ total }}</li>
        <li>totalPages: {{ totalPages }}</li>
        <li>sortBy: {{ sortBy }}</li>
        <li>order: {{ order }}</li>
        <li>searchDate: {{ searchDate.toFormat('y-MM-dd') }}</li>
      </ul>
      <ng-container *ngIf="!!total else noBookings">
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
    </ng-template>
  `,
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {

  isLoggedIn = false;

  page: number = 0;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 0;
  sortBy: SortBy = 'startTime';
  order: OrderBy = 'desc';
  searchDate: DateTime = DateTime.now().startOf('day');
  bookings: Booking[] = [];

  constructor(
    private authService: AuthService,
    private backendConnector: BackendService,
    private location: Location,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(loggedIn => this.isLoggedIn = loggedIn);

    if (this.isLoggedIn) {
      this.readParamsFromUrl();
      this.loadBookings();
    } else {
      this.location.replaceState('/bookings');
    }
  }

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
        this.page = response.page;
        this.limit = response.limit;
        this.total = response.total;
        this.totalPages = response.totalPages;
        this.sortBy = response.sortBy;
        this.order = response.order;
        this.searchDate = DateTime.fromISO(response.date as string);
        this.bookings = response.data;

        const params = new URLSearchParams({
            searchDate: this.formatDate(this.searchDate),
            sortBy: this.sortBy,
            order: this.order,
            limit: this.limit.toString(),
            page: this.page.toString()
        } as Record<string, string>);
        this.location.replaceState('/bookings', params.toString());
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

  readParamsFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      const {
        searchDate,
        sortBy,
        order,
        limit,
        page
      } = params;
      if (searchDate && DateTime.fromISO(searchDate).isValid) this.searchDate = DateTime.fromISO(searchDate).startOf('day');
      if (sortBy) this.sortBy = sortBy as SortBy;
      if (order) this.order = order as OrderBy;
      if (limit) this.limit = limit;
      if (page) this.page = page;
    });
  }

  private formatDate(date: DateTime): string {
    return date.toFormat('y-MM-dd');
  }

}
