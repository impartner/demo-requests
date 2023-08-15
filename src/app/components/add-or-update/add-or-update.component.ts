import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { I18NextService } from 'angular-i18next';
import { Router } from '@angular/router';
import {
  IImpartnerRouter,
  IMPARTNER_ROUTER_TOKEN,
  IPrmFieldDefinition,
  ImpartnerConfigService,
  ImpartnerHttpError,
  ImpartnerMetadataService,
  ImpartnerObjectService,
} from '@impartner/angular-sdk';
import { Subject, catchError, takeUntil, throwError } from 'rxjs';

import { IDemoRequest } from '../../interfaces';

@Component({
  selector: 'app-add-or-update',
  templateUrl: './add-or-update.component.html',
  styleUrls: ['./add-or-update.component.scss'],
})
export class AddOrUpdateComponent implements OnInit, OnDestroy {
  public demoRequest?: IDemoRequest;
  public productOptions: Record<string, string> = {};
  public loading = false;

  public form = new FormGroup({
    id: new FormControl(0),
    name: new FormControl('', [Validators.required]),
    products__cf: new FormControl<string[]>([], [Validators.required]),
    demo_Date__cf: new FormControl('', [Validators.required]),
    description__cf: new FormControl('', [Validators.required]),
  });

  // Errors
  public errorMessage = '';

  // Success
  public successfulUpsert = false;

  public get isUpdate(): boolean {
    if (!this.demoRequest) {
      return false;
    }

    return !!this.demoRequest.id;
  }

  private readonly _onDestroy$ = new Subject<void>();

  constructor(
    @Inject(IMPARTNER_ROUTER_TOKEN) readonly _impartnerRouter: IImpartnerRouter,
    private readonly _impartnerMetadaService: ImpartnerMetadataService,
    private readonly _impartnerObjectService: ImpartnerObjectService,
    private readonly _impartnerConfigService: ImpartnerConfigService,
    private readonly _i18nextService: I18NextService,
    private readonly _router: Router,
    private readonly _changeDetectorRef: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    const demoRequestId = this._impartnerRouter.getState().params['id'];

    this._impartnerMetadaService
      .describeField('Demo_Request__co', 'products__cf')
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((fieldDefinition) => {
        this.productOptions = this._getProductOptions(fieldDefinition);
      });

    if (demoRequestId) {
      this.loading = true;
      this._impartnerObjectService
        .get<IDemoRequest>('Demo_Request__co', demoRequestId, [
          'id',
          'name',
          'products__cf',
          'demo_Date__cf',
          'description__cf',
        ])
        .pipe(
          takeUntil(this._onDestroy$),
          catchError((error: ImpartnerHttpError) => {
            this.errorMessage = this._i18nextService.t(
              'update.getError'
            ) as string;
            return throwError(() => new Error(error.message));
          })
        )
        .subscribe((result) => {
          this.demoRequest = result.data;

          if (this.demoRequest) {
            this.form.patchValue({
              id: this.demoRequest.id,
              name: this.demoRequest.name,
              products__cf: this.demoRequest.products__cf,
              demo_Date__cf: this.demoRequest.demo_Date__cf.split('T')[0],
              description__cf: this.demoRequest.description__cf,
            });
          }
          this.loading = false;
          this._changeDetectorRef.detectChanges();
        });
    }
  }

  public ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  public upsert(): void {
    this.loading = true;
    const payload: IDemoRequest = {
      name: this.form.controls.name.value || '',
      products__cf: this.form.controls.products__cf.value || [],
      demo_Date__cf: this.form.controls.demo_Date__cf.value || '',
      description__cf: this.form.controls.description__cf.value || '',
    };

    if (this.demoRequest?.id) {
      payload.id = this.demoRequest.id;
      this._impartnerObjectService
        .update('Demo_Request__co', this.demoRequest.id!, payload)
        .pipe(
          takeUntil(this._onDestroy$),
          catchError((error: ImpartnerHttpError) => {
            this.errorMessage = this._i18nextService.t(
              'update.error'
            ) as string;
            this.loading = false;
            return throwError(() => new Error(error.message));
          })
        )
        .subscribe((result) => {
          if (result.data) {
            this.demoRequest = result.data;
          }
          this.successfulUpsert = true;

          this.errorMessage = '';
          this.loading = false;
          this._changeDetectorRef.detectChanges();
        });
    } else {
      payload.id = undefined;
      this._impartnerObjectService
        .create('Demo_Request__co', payload)
        .pipe(
          takeUntil(this._onDestroy$),
          catchError((error: ImpartnerHttpError) => {
            this.errorMessage = this._i18nextService.t('add.error') as string;
            return throwError(() => new Error(error.message));
          })
        )
        .subscribe((result) => {
          this.demoRequest = result.data;
          this.errorMessage = '';
          this.loading = false;
          this._changeDetectorRef.detectChanges();
          this._router.navigate(['/list'], {
            state: {
              navAlerts: [
                {
                  theme: 'success',
                  headingText: this._i18nextService.t(
                    'addOrUpdate.successfulUpsert'
                  ) as string,
                },
              ],
            },
          });
        });
    }
  }

  public handleErrorDismiss(): void {
    this.errorMessage = '';
  }

  public handleSuccessfulUpsertDismiss(): void {
    this.successfulUpsert = false;
  }

  private _getProductOptions(
    fieldDefinition: IPrmFieldDefinition | null
  ): Record<string, string> {
    const options: Record<string, string> = {};

    if (!fieldDefinition || !fieldDefinition.values) {
      return options;
    }

    const currentLocale = this._impartnerConfigService.getConfig()
      .currentLanguage.locale;

    Object.values(fieldDefinition.values).forEach((value) => {
      const displayValue = value.translations[currentLocale] || value.display;
      options[value.name] = displayValue;
    });

    return options;
  }
}
