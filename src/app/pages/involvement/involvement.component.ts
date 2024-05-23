import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {ConfirmationService, MessageService} from 'primeng/api';
import {Product} from "../../demo/domain/product";
import {ProductService} from "../../demo/service/productservice";
import {AppBreadcrumbService} from "../../app.breadcrumb.service";
import {InvolvementGroup} from "../services/involvement-group/involvement-group.model";
import {Table} from "primeng/table";
import {CustomerService} from "../../demo/service/customerservice";
import {Customer, Representative} from "../../demo/domain/customer";
import {InvolvementGroupService} from "../services/involvement-group/involvement-group.service";
import {Router} from "@angular/router";
import {InvolvementUsers} from "../services/involvement-users/involvement-users.model";

@Component({
    templateUrl: './involvement.component.html',
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
export class InvolvementComponent implements OnInit {
    customers1: Customer[];

    customers2: Customer[];

    customers3: Customer[];

    selectedCustomers1: Customer[];

    selectedCustomer: Customer;

    representatives: Representative[];

    rowGroupMetadata: any;

    expandedRows = {};

    activityValues: number[] = [0, 100];

    isExpanded: boolean = false;

    idFrozen: boolean = false;

    productDialog: boolean;

    deleteProductDialog: boolean = false;

    deleteProductsDialog: boolean = false;


    product: Product;

    selectedProducts: Product[];

    submitted: boolean;

    cols: any[];

    statuses: any[];

    rowsPerPageOptions = [5, 10, 20];
    loading: any;
    involvementGroups: InvolvementGroup[];

    @ViewChild('dt') table: Table;

    @ViewChild('filter') filter: ElementRef;

    constructor(private customerService: CustomerService, private productService: ProductService,
                private breadcrumbService: AppBreadcrumbService,
                private messageService: MessageService,
                private router: Router,
                private involvementGroupService: InvolvementGroupService
    ) {
        this.breadcrumbService.setItems([
            {label: 'UI Kit'},
            {label: 'Table', routerLink: ['/uikit/table']}
        ]);
    }

    ngOnInit() {
        this.involvementGroupService.fetchAllInvolvementGroup().subscribe(groups => {
            this.involvementGroups = groups;
            console.log("groups", groups);
            this.loading = false;


        });

        this.statuses = [
            {label: 'Unqualified', value: 'unqualified'},
            {label: 'Qualified', value: 'qualified'},
            {label: 'New', value: 'new'},
            {label: 'Negotiation', value: 'negotiation'},
            {label: 'Renewal', value: 'renewal'},
            {label: 'Proposal', value: 'proposal'}
        ];
    }

    onSort() {
        this.updateRowGroupMetaData();
    }

    updateRowGroupMetaData() {
        this.rowGroupMetadata = {};

        if (this.customers3) {
            for (let i = 0; i < this.customers3.length; i++) {
                const rowData = this.customers3[i];
                const representativeName = rowData.representative.name;

                if (i === 0) {
                    this.rowGroupMetadata[representativeName] = {index: 0, size: 1};
                } else {
                    const previousRowData = this.customers3[i - 1];
                    const previousRowGroup = previousRowData.representative.name;
                    if (representativeName === previousRowGroup) {
                        this.rowGroupMetadata[representativeName].size++;
                    } else {
                        this.rowGroupMetadata[representativeName] = {index: i, size: 1};
                    }
                }
            }
        }
    }

    expandAll() {
        if (!this.isExpanded) {
            // this.products.forEach(product => this.expandedRows[product.name] = true);

        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }

    formatCurrency(value) {
        return value.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }


    openDetails() {
        this.router.navigate(['/involvement-detail', {id: null}]);
    }

    getInitials(user: InvolvementUsers) {
        if(user.user !== null){

        // TODO votta ees ja perenimi
        let res = "";

        if(user.user && user.user.lastName){
            res = user.user.name[0] + user.user.lastName[0];
        }else{
            res = user.user.email[0];
        }
        // user.userId

        return res;
        }else{
            return "";
        }

    }
}
