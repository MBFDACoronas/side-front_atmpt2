import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {ConfirmationService, MenuItem, MessageService} from "primeng/api";
import {finalize} from "rxjs/operators";
import {FormControl, FormGroup} from "@angular/forms";
import {Type} from "./type.model";
import {TypeService} from "./type.service";
import {TableColumn} from "../demo/shared/table-column.interface";
const TABLE_COLUMNS: TableColumn[] = [


            {
            name: 'Nimi',
            value: 'name',
            width: '180px',
            sort: true,
            filter: {type: 'contains'},
          },

            {
            name: 'Identifikaator',
            value: 'identifier',
            width: '180px',
            sort: true,
            filter: {type: 'contains'},
          },


];


@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.scss']
})
export class TypeComponent implements OnInit {

  breadcrumbItems: MenuItem[] = [
    {label: 'TODO'}
  ];

  typeList: Type[];
  type: Type;
  loading: boolean;
  dialogueVisible: boolean = false;
  selectedRow: any;

  private tableColumns = TABLE_COLUMNS;
  public selectedTableColumns = this.tableColumns.map(col => col);
  public rowExpandable = (row: Type) => true;

  constructor(

    private typeService: TypeService,
    private confirmationService: ConfirmationService,

  ) {
    this.type = {} as Type;
  }


  ngOnInit(): void {
		this.fetchAll();
  }

  private fetchAll() {
    this.loading = true;
    this.typeService.fetchAllType()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(data => {

		this.typeList = data;

      });
  }

  onVisibleChange(visible: boolean) {
    if (!visible) {
      this.selectedRow = null;
    }
    this.type = {} as Type;

  }

  openDialog(param) {
    this.type = {} as Type;
    if(param){
      this.type = param;
    }
    this.dialogueVisible = true;
  }

  valid() {

  }

  save() {
    this.typeService.saveType(this.type).subscribe(r => {
      this.dialogueVisible = false;
	  this.fetchAll();

    });

  }

  rowEditInit(item: Type): void {
    this.type = item;
    this.dialogueVisible = true;
  }


  delete($event: any) {
      console.log($event);
      let item = $event as Type;

    this.confirmationService.confirm({
      header: 'Kinnitamine',
      message: `Oled kindel?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Jah',
      rejectLabel: 'Ei',
      rejectButtonStyleClass: 'p-button p-button-danger',
      acceptButtonStyleClass: 'p-button p-button-success',
      accept: () => {

        this.typeService.deleteType(item.id).pipe(
          finalize(() => {
              this.dialogueVisible = false;
              this.selectedRow = null;
          })
        ).subscribe(() => this.fetchAll());

      }
    });
  }

  closeDialogue() {
    this.dialogueVisible = false;
  }
    typeChange(event: any) {
       // this.typeSelected.emit(event.value);
    }

}
