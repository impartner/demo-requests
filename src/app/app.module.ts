import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { StyleType } from '@impartner/angular-apps';
import { ImpartnerI18NextModule } from '@impartner/angular-apps/i18n';
import { LocalImpartnerMicroFrontEndModule } from '@impartner/angular-apps/local-dev';
import {
  AbstractImpartnerMicroFrontEndAppModule,
  ImpartnerMicroFrontEndModule,
} from '@impartner/angular-apps/mfe';
import { ImpartnerSdkModule } from '@impartner/angular-sdk';
import {
  DesignComponentsModule,
  PaginationModule,
  SpinnerModule,
} from '@impartner/design-components';
import { Resource } from 'i18next';

import * as translations from '../translations.json';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AddOrUpdateComponent, ColumnSortComponent, ListComponent } from './components';

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    AddOrUpdateComponent,
    ColumnSortComponent,
  ],
  imports: [
    BrowserModule,
    ImpartnerSdkModule.forRoot({ ...environment }),
    ImpartnerMicroFrontEndModule.forRoot(environment, {
      mfeComponentType: AppComponent,
      mfeElementTag: 'um-demo-requests',
      style: StyleType.ImpartnerHex,
      isCustom: true,
    }),
    environment.production
      ? []
      : LocalImpartnerMicroFrontEndModule.forRoot(environment, {
          defaultTenantId: 40,
        }),
    ImpartnerI18NextModule.forRoot({
      resources: translations as Resource,
      defaultNS: 'demoRequests'
    }),
    AppRoutingModule,
    DesignComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    SpinnerModule
  ],
  providers: [],
})
export class AppModule extends AbstractImpartnerMicroFrontEndAppModule {}
