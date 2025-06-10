import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, timer, switchMap } from 'rxjs';
import { BusinessRulesDto } from '@models/business-rules.dto';
import { BackendService } from '@connectors/backend.service';

@Injectable({ providedIn: 'root' })
export class BusinessRulesService {

  private readonly refreshTimer = 300 * 1000;

  private businessRules: BusinessRulesDto = {} as BusinessRulesDto;

  constructor(private backendService: BackendService) {
    timer(0, this.refreshTimer).pipe(
      switchMap(() => this.backendService.getBusinessRules())
    ).subscribe(data => {
      this.businessRules = data
    });
  }

  getBusinessRules(): BusinessRulesDto {
    return this.businessRules;
  }

}
