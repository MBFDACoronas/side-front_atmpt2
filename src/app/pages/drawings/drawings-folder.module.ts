import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RmkSharedModule } from '../shared/rmk-shared.module';

const routes: Routes = [
  {path: 'drawings-folder', component: DrawingsFolderComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes), RmkSharedModule,
  ],
    exports: [RouterModule, DrawingsFolderComponent],
  declarations: [
    DrawingsFolderComponent
  ]
})
export class DrawingsFolderModule {
}
