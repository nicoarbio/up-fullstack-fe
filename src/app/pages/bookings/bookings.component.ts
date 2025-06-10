import { Component, OnInit } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { CommonModule, Location, NgIf } from '@angular/common';
import { BackendService } from '@connectors/backend.service';
import { DateTime } from 'luxon';
import { OverlayComponent } from '@layouts/overlay/overlay.component';
import {
  Booking,
  BookingStatus,
  OrderBy,
  SortBy,
  sortByOptions
} from '@models/booking.dto';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { OrderStatus } from '@models/order.enum';
import { DatePickerModule } from 'primeng/datepicker';
import { NewBookingModalComponent } from '@components/new-booking/new-booking.component';

@Component({
  selector: 'app-bookings',
  imports: [
    NgIf,
    DatePickerModule,
    TableModule, ButtonModule, Tag, CommonModule, DropdownModule, Select, FormsModule, PaginatorModule, NewBookingModalComponent
  ],
  template: `
    <app-new-booking-modal [(visible)]="showNewBookingModal"></app-new-booking-modal>
    <h1 *ngIf="!isLoggedIn else showBookings">{{ notLoggedInMessage }}</h1>
    <ng-template #showBookings>
      <p-table stripedRows
               selectionMode="single"
               (onRowSelect)="onBookingSelect($event)"
               [value]="bookings" [paginator]="true"
               [showCurrentPageReport]="true"
               currentPageReportTemplate="Mostrando turnos {first} a {last} de {totalRecords} totales"
               [lazy]="true"
               [rows]="limit"
               [totalRecords]="total"
               [first]="limit * (page - 1)"
               (onPage)="onPageChange($event)"
      >
        <ng-template #caption>
          <div class="table-header">
            <div>
              <p-select
                styleClass="custom-sortBy-picker"
                [options]="sortByOptions"
                [(ngModel)]="sortBy"
                (onChange)="onSortChange($event)"
              />
              <p-button icon="pi pi-sort-amount-{{orderIcon}}" (click)="toggleOrder()" />
            </div>
            <div class="datepicker-container">
              <p-button icon="pi pi-angle-left" (click)="goToPreviousDate()" />
              <p-datepicker
                styleClass="custom-datepicker"
                [ngModel]="searchDateJs.dateForNgModel"
                (ngModelChange)="searchDateJs.onNgModelChange($event)"
                dateFormat="DD dd 'de' MM 'de' yy" />
              <p-button icon="pi pi-angle-right" (click)="goToNextDate()" />
            </div>
            <p-button (click)="newBooking()">Nuevo Turno</p-button>
          </div>
          <div *ngIf="bookings?.length === 0" class="empty-message">
            {{ emptyMessage }}
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th>Hora inicio</th>
            <th>Nombre Completo</th>
            <th>Pasajeros</th>
            <th>ID Turno</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Estado pago</th>
            <th>Cancelación</th>
          </tr>
        </ng-template>
        <ng-template #body let-booking>
          <tr [pSelectableRow]="booking">
            <td>{{ booking.startTime }}</td>
            <td>{{ booking.userFullName }}</td>
            <td>{{ booking.passengers?.length }}</td>
            <td>{{ booking._id }}</td>
            <td>{{ booking.price | currency:'$' }}</td>
            <td><p-tag [value]="statusSeverity[booking.status].label" [severity]="statusSeverity[booking.status].severity" /></td>
            <td><p-tag [value]="statusSeverity[booking.orderStatus].label" [severity]="statusSeverity[booking.orderStatus].severity" /></td>
            <td><p-button *ngIf="booking.stormInsurance" (click)="stormCancell(booking)">Tormenta</p-button></td>
          </tr>
        </ng-template>
      </p-table>
    </ng-template>
  `,
  styleUrl: './bookings.component.scss'
})
export class BookingsComponent implements OnInit {

  notLoggedInMessage: string = 'Inicie sesión para ver sus turnos';
  emptyMessage: string = 'No se han encontrado turnos para este día';

  isLoggedIn = false;

  page: number = 0;
  limit: number = 5;
  total: number = 0;
  totalPages: number = 0;
  sortBy: SortBy = 'startTime';
  order: OrderBy = 'desc';
  searchDate: DateTime = DateTime.now().startOf('day');
  bookings: Booking[] = [];

  searchDateJs = {
    dateForNgModel: this.searchDate.toJSDate(),
    onNgModelChange: (date: Date) => {
      this.searchDate = DateTime.fromJSDate(date);
      this.loadBookings();
    }
  }

  get orderIcon() {
    if (this.order === 'desc') return 'down';
    if (this.order === 'asc') return 'up';
    return 'down';
  }

  protected readonly sortByOptions = sortByOptions;

  showNewBookingModal = false;

  constructor(
    private authService: AuthService,
    private backendConnector: BackendService,
    private location: Location,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (this.isLoggedIn) {
        this.readParamsFromUrl();
        this.loadBookings();
      } else {
        this.location.replaceState('/bookings');
      }
    });
  }

  private loadBookings() {
    OverlayComponent.spinnerEvent.emit(true);
    this.backendConnector.getBookings({
      searchDate: this.formatDate(this.searchDate),
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

        this.bookings = this.bookings.map(booking => ({
          ...booking,
          startTime: this.formatTime(booking.startTime),
          endTime: this.formatTime(booking.endTime),
        }));

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
    });
  }

  private readParamsFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      const {
        searchDate,
        sortBy,
        order,
        limit,
        page
      } = params;
      if (searchDate && DateTime.fromISO(searchDate).isValid) {
        this.searchDate = DateTime.fromISO(searchDate).startOf('day');
        this.searchDateJs.dateForNgModel = this.searchDate.toJSDate();
      }
      if (sortBy) this.sortBy = sortBy as SortBy;
      if (order) this.order = order as OrderBy;
      if (limit) this.limit = limit;
      if (page) this.page = page;
    });
  }

  private formatDate(date: DateTime | string): string {
    if (typeof date === 'string') {
      date = DateTime.fromISO(date);
    }
    return date.toFormat('y-MM-dd');
  }

  private formatTime(date: DateTime | string): string {
    if (typeof date === 'string') {
      date = DateTime.fromISO(date);
    }
    return date.toFormat('HH:mm');
  }

  newBooking(): void {
    this.showNewBookingModal = true;
  }

  onBookingSelect(event: any): void {
    const booking = event.data as Booking;
    // TODO: abrir en una nueva ventana, la orden a la que pertenece este booking -> nueva página de orden
    alert(`Turno seleccionado: ${booking._id}`);
  }

  stormCancell(booking: Booking): void {

  }

  onSortChange(event: { value: SortBy }): void {
    this.sortBy = event.value;
    this.loadBookings();
  }

  toggleOrder(): void {
    if (this.order === 'asc') {
      this.order = 'desc'
    } else if (this.order === 'desc') {
      this.order = 'asc'
    }
    this.loadBookings();
  }

  onPageChange(event: { first: number, rows: number }): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.loadBookings();
  }

  goToPreviousDate(): void {
    this.searchDate = this.searchDate.minus({ days: 1 });
    this.searchDateJs.dateForNgModel = this.searchDate.toJSDate();
    this.loadBookings();
  }

  goToNextDate(): void {
    this.searchDate = this.searchDate.plus({ days: 1 });
    this.searchDateJs.dateForNgModel = this.searchDate.toJSDate();
    this.loadBookings();
  }

  readonly statusSeverity: Record<BookingStatus | OrderStatus | any, { label: string, severity: string }> = {
    [BookingStatus.ACTIVE]: {
      label: 'Activo',
      severity: 'success'
    },
    [BookingStatus.CANCELLED]: {
      label: 'Cancelado',
      severity: 'danger'
    },
    [OrderStatus.PENDING]: {
      label: 'Pendiente',
      severity: 'warn'
    },
    [OrderStatus.PAID]: {
      label: 'Completado',
      severity: 'success'
    }
  };

}
