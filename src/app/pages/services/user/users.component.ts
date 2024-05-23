import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {ConfirmationService, MessageService} from 'primeng/api';
import {CustomerService} from "../../../demo/service/customerservice";
import {AppBreadcrumbService} from "../../../app.breadcrumb.service";
import {Router} from "@angular/router";
import {User} from "./user.model";
import {UserService} from "./user.service";
import {Table} from "primeng/table";


@Component({
    templateUrl: './users.component.html',
    styles: [`
        :host ::ng-deep .p-dialog .product-image {
            width: 150px;
            margin: 0 auto 2rem auto;
            display: block;
        }

        @media screen and (max-width: 960px) {
            :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:last-child {
                text-align: center;
            }

            :host ::ng-deep .p-datatable.p-datatable-customers .p-datatable-tbody > tr > td:nth-child(6) {
                display: flex;
            }
        }

    `],
    providers: [MessageService, ConfirmationService]
})
export class UsersComponent implements OnInit {

    @ViewChild('filter') filter: ElementRef;
    loading: any;

    users: User[];
    @ViewChild('dt') table: Table;
    userModel: User;
    dialogVisible: boolean = false;

    constructor(
        private breadcrumbService: AppBreadcrumbService,
        private messageService: MessageService,
        private router: Router,
        private usersService: UserService
    ) {
        this.breadcrumbService.setItems([
            {label: 'UI Kit'},
            {label: 'Table', routerLink: ['/uikit/table']}
        ]);
    }

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.usersService.fetchAllUser().subscribe(users => {
            this.users = users;
            console.log("groups", users);
            this.loading = false;
        });

    }

    onSort() {
        // this.updateRowGroupMetaData();
    }

    openDetails() {
        // this.router.navigate(['/involvement-detail', {id: null}]);
    }

    clear(dt1: Table) {

    }

    getInitials(user: any) {
        return undefined;
    }

    openModal(user: any) {
        this.userModel = user;
        this.dialogVisible = true;
    }

    save() {
        this.usersService.saveUser(this.userModel).subscribe(res => {
            this.dialogVisible = false;
            this.getData();
        });
    }
}
