import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RmkSharedModule } from '../shared/rmk-shared.module';

const routes: Routes = [
  {path: 'type', component: TypeComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes), RmkSharedModule,
  ],
    exports: [RouterModule, TypeComponent],
  declarations: [
    TypeComponent
  ]
})
export class TypeModule {
}
