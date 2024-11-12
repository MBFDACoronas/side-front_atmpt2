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
import {MessageService, SharedModule} from "primeng/api";
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
import {InputSwitchModule} from "primeng/inputswitch";
import {ListboxModule} from "primeng/listbox";
import {MultiSelectModule} from "primeng/multiselect";
import {RadioButtonModule} from "primeng/radiobutton";
import {SelectButtonModule} from "primeng/selectbutton";
import {ToggleButtonModule} from "primeng/togglebutton";
import {CalendarModule} from "primeng/calendar";
import {ChipsModule} from "primeng/chips";
import {ColorPickerModule} from "primeng/colorpicker";
import {InputNumberModule} from "primeng/inputnumber";
import {KnobModule} from "primeng/knob";
import {RatingModule} from "primeng/rating";
import {SliderModule} from "primeng/slider";
import {NotificationComponent} from "./notification/notification.component";
import {NotificationService} from "./notification/notification.service";
import {ToastrModule} from "ngx-toastr";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {ToastModule} from "primeng/toast";

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
        NotificationComponent,
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
        TableModule,
        InputSwitchModule,
        ListboxModule,
        MultiSelectModule,
        RadioButtonModule,
        SelectButtonModule,
        ToggleButtonModule,
        CalendarModule,
        ChipsModule,
        ColorPickerModule,
        InputNumberModule,
        KnobModule,
        RatingModule,
        ToastrModule.forRoot(), // Add this line
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        SliderModule,
        ToastModule
    ],

    providers: [MessageService,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: NotificationComponent, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http);
}
