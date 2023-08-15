import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  IOrderByExpression,
  ImpartnerHttpError,
  ImpartnerObjectService,
} from '@impartner/angular-sdk';
import { Subject, catchError, debounceTime, takeUntil, throwError } from 'rxjs';

import { IAlertInfo, IDemoRequest } from '../../interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  public demoRequests: IDemoRequest[] = [];
  public pageAlerts: IAlertInfo[] = [];

  // Search
  public form = new FormGroup({
    searchText: new FormControl(null),
  });
  public loading = false;

  // Sort
  public sortField?: string;
  public sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  public resultsPage = 1;
  public resultsPerPage = 20;
  public totalResults = 0;

  private readonly _onDestroy$ = new Subject<void>();

  constructor(
    private readonly _impartnerObjectService: ImpartnerObjectService,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _router: Router
  ) {
    this.pageAlerts =
      this._router.getCurrentNavigation()?.extras?.state?.['navAlerts'] || [];
  }

  public ngOnInit(): void {
    this.getRecords();

    this.form.controls.searchText.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.getRecords();
      });
  }

  public ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  public getRecords(): void {
    const skip =
      this.resultsPage === 1 ? 0 : (this.resultsPage - 1) * this.resultsPerPage;
    const orderBy: IOrderByExpression[] = this.sortField
      ? [{ field: this.sortField, direction: this.sortDirection }]
      : [];

    this.loading = true;
    this._impartnerObjectService
      .getManyByCriteria<IDemoRequest>('Demo_Request__co', {
        fields: [
          'id',
          'name',
          'products__cf',
          'demo_Date__cf',
          'description__cf',
        ],
        searchText: this.form.controls.searchText.value || '',
        take: this.resultsPerPage,
        orderBy,
        skip,
      })
      .pipe(
        takeUntil(this._onDestroy$),
        catchError((e: ImpartnerHttpError) => {
          this.loading = false;
          return throwError(() => new Error(e.message));
        })
      )
      .subscribe((result) => {
        this.totalResults = result.data?.count || 0;
        this.demoRequests = result.data?.results
          ? [...result.data?.results]
          : [];
        this.loading = false;
        this._changeDetectorRef.detectChanges();
      });
  }

  public changePage(page: number) {
    this.resultsPage = page;

    this.getRecords();
  }

  public updateSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.getRecords();
  }
}
