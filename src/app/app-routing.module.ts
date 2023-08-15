import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AddOrUpdateComponent, ListComponent } from './components';

const routes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: 'add-or-update',
    component: AddOrUpdateComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
