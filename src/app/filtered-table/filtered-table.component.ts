import {Component, Input, Output, EventEmitter, TemplateRef, OnInit, ViewChild} from '@angular/core';
import {TableColumn} from "../demo/shared/table-column.interface";
@Component({
    selector: 'app-filtered-table',
    templateUrl: './filtered-table.component.html',
    styleUrls: ['./filtered-table.component.scss']
})
export class FilteredTableComponent implements OnInit {
    @Input() value: any[];
    @Input() loading: boolean;
    @Input() paginator: boolean;
    @Input() columns: TableColumn[];
    @Input() selection: any;
    @Input() allowDeletion: boolean = false;
    @Input() editMode: string;
    @Input() fluid: boolean = false;
    @Input() selectionMode: 'single' | 'multiple' | null = 'single'; // Set type and default

    @Output() rowSelected = new EventEmitter<any>();
    @Output() rowEditInit = new EventEmitter<any>();
    @Output() rowDeleted = new EventEmitter<any>();

    @ViewChild('caption', { static: true }) caption: TemplateRef<any>;

    ngOnInit(): void {}

    onRowSelect(event: any): void {
        this.rowSelected.emit(event);
    }

    onRowEditInit(event: any): void {
        this.rowEditInit.emit(event);
    }

    onRowDelete(event: any): void {
        this.rowDeleted.emit(event);
    }

    clear(table: any): void {
        table.clear();
    }

    onGlobalFilter(table: any, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
