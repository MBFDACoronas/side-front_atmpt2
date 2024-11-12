import { NgModule } from '@angular/core';
import {CommonModule, HashLocationStrategy, LocationStrategy} from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppLayoutModule } from './layout/app.layout.module';
import {CameraCaptureComponent} from "./camera-capture/camera-capture.component";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {DropdownModule} from "primeng/dropdown";
import {FileUploadModule} from "primeng/fileupload";
import {InputGroupAddonModule} from "primeng/inputgroupaddon";
import {InputGroupModule} from "primeng/inputgroup";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {RippleModule} from "primeng/ripple";
import {SharedModule} from "primeng/api";
import {StartAddComponent} from "./start-add/start-add.component";
import {FormsModule} from "@angular/forms";
import {AutoCompleteModule} from "primeng/autocomplete";
import {ImageDialogComponent} from "./image-dialog/image-dialog.component";
import {AssignmentsComponent} from "./assignments/assignments.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ProjectComponent} from "./project/project.component";
import {CheckboxModule} from "primeng/checkbox";
import {FilteredTableComponent} from "./filtered-table/filtered-table.component";
import {TableModule} from "primeng/table";
import {ContactAddComponent} from "./contact-add/contact-add.component";
import {ContactsComponent} from "./contacts/contacts.component";
import {GroupsComponent} from "./groups/groups.component";

@NgModule({
    declarations: [
        AppComponent,
        CameraCaptureComponent,
        AssignmentsComponent,
        DashboardComponent,
        ContactAddComponent,
        ContactsComponent,
        GroupsComponent,
        FilteredTableComponent,
        ProjectComponent,
        ImageDialogComponent,
        StartAddComponent
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        DialogModule,
        CommonModule,
        ButtonModule,
        DropdownModule,
        FileUploadModule,
        InputGroupAddonModule,
        InputGroupModule,
        InputTextModule,
        InputTextareaModule,
        RippleModule,
        SharedModule,
        DialogModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        TableModule
    ],

    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
