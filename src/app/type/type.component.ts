import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmationService, MenuItem} from 'primeng/api';
import {finalize} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {AuthService, ROLE_ADMIN, ROLE_PEAADMIN} from '../auth/auth.service';
import {TableColumn} from '../demo/shared/table-column.interface';
import {Type} from './type.model';
import {TypeService} from './type.service';

const TABLE_COLUMNS: TableColumn[] = [
    {name: 'Ülesanne', value: 'displayName', width: '260px', sort: true, filter: {type: 'contains'}},
    {name: 'Identifikaator', value: 'identifier', width: '160px', sort: true, filter: {type: 'contains'}},
    {name: 'Versioon', value: 'version', width: '120px', sort: true, filter: {type: 'contains'}}
];

@Component({
    selector: 'app-type',
    templateUrl: './type.component.html',
    styleUrls: ['./type.component.scss']
})
export class TypeComponent implements OnInit, OnDestroy {
    breadcrumbItems: MenuItem[] = [{label: 'Ülesande mallid'}];
    typeList: any[] = [];
    type: Type = {} as Type;
    loading = false;
    dialogueVisible = false;
    selectedRow: any;
    canManage = false;
    selectedTableColumns = TABLE_COLUMNS;
    private authSubscription?: Subscription;

    constructor(
        private typeService: TypeService,
        private confirmationService: ConfirmationService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.authSubscription = this.authService.currentUser$.subscribe(user => {
            this.canManage = user?.role === ROLE_PEAADMIN || user?.role === ROLE_ADMIN;
        });
        this.fetchAll();
    }

    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }

    openDialog(type?: Type): void {
        if (!this.canManage) {
            return;
        }

        this.type = type ? {...type} : {version: '0.1'} as Type;
        this.dialogueVisible = true;
    }

    save(): void {
        if (!this.canManage) {
            return;
        }

        const typeToSave = {
            id: this.type.id,
            name: this.type.name,
            identifier: this.type.identifier,
            version: this.type.version
        } as Type;

        this.typeService.saveType(typeToSave).subscribe(() => {
            this.dialogueVisible = false;
            this.fetchAll();
        });
    }

    rowEditInit(item: Type): void {
        this.openDialog(item);
    }

    delete(item: Type): void {
        if (!this.canManage || !item?.id) {
            return;
        }

        this.confirmationService.confirm({
            header: 'Kinnitamine',
            message: 'Oled kindel?',
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

    onVisibleChange(visible: boolean): void {
        if (!visible) {
            this.selectedRow = null;
            this.type = {} as Type;
        }
    }

    closeDialogue(): void {
        this.dialogueVisible = false;
    }

    private fetchAll(): void {
        this.loading = true;
        this.typeService.fetchAllType()
            .pipe(finalize(() => this.loading = false))
            .subscribe(data => {
                this.typeList = (data || []).map(type => ({
                    ...type,
                    displayName: `(${type.identifier || ''}) ${type.name || ''}`.trim()
                }));
            });
    }
}
