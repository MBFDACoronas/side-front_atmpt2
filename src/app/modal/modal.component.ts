import {
  Component, TemplateRef, ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import {NotificationComponent} from "../notification/notification.component";
import {AppInjector} from "../app.injector.service";


@Component({
  selector: 'app-modal',
  template: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent extends NotificationComponent {
  // dialogConfig!: MatDialogConfig;
  // dialog!: MatDialog;
  // dialogRef!: MatDialogRef<any>;
  // @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>; // , { static: true, read: ViewContainerRef }

  dialogHeaderTemplate!: TemplateRef<any>;
  dialogContentTemplate!: TemplateRef<any>;
  dialogActionsTemplate!: TemplateRef<any>;

  popover: any;
  selectedPopoverItem: any;

  subject!: Subject<boolean>;

  constructor() {
    super();
    try {
      const injector = AppInjector.getInjector();
      // this.dialog = injector.get(MatDialog);
    } catch (e) {
    }
  }

  action(value: boolean) {
    // this.dialogRef.close();
    this.subject.next(value);
    this.subject.complete();
  }

  // getModalConfig(cssClass = '', data = {}): MatDialogConfig {
  //   const dialogConfig = new MatDialogConfig();
  //   // dialogConfig.position = DialogPosition.top;
  //   dialogConfig.disableClose = API_DIALOG_CONF.disableClose;
  //   dialogConfig.autoFocus = API_DIALOG_CONF.autoFocus;
  //   dialogConfig.width = API_DIALOG_CONF.width;
  //   dialogConfig.panelClass = cssClass;
  //
  //   dialogConfig.data = data;
  //
  //   this.dialogConfig = dialogConfig;
  //   return this.dialogConfig;
  // }

  // getFixedModalConfig(data = {}): MatDialogConfig {
  //   const dialogConfig = new MatDialogConfig();
  //   // dialogConfig.position = DialogPosition.top;
  //   dialogConfig.disableClose = API_DIALOG_CONF.disableClose;
  //   dialogConfig.autoFocus = API_DIALOG_CONF.autoFocus;
  //   dialogConfig.width = API_DIALOG_CONF.width;
  //   dialogConfig.panelClass = 'fixed-dialog-modalbox';
  //
  //   dialogConfig.data = data;
  //
  //   this.dialogConfig = dialogConfig;
  //   return this.dialogConfig;
  // }

  openPopover(pop: any) {
    this.popover = pop;
  }

  closePopover() {
    this.popover.hide();
  }

  openPopoverByItem(pop: any, item: any) {
    this.popover = pop;
    this.selectedPopoverItem = item;
  }

  openLeaveFormModal() {
    // const modalConfig = this.getModalConfig();
    // modalConfig.width = 'fit-content';
    // modalConfig.closeOnNavigation = false;
    // const dialogRef = this.dialog.open(LeaveFormModalComponentComponent, modalConfig);
    // this.dialogRef = dialogRef;
    // return dialogRef.afterClosed();
  }
}
