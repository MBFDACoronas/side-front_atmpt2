import {Component, OnInit} from '@angular/core';

import {ConfirmationService, MessageService} from 'primeng/api';
import {Product} from "../../demo/domain/product";
import {ProductService} from "../../demo/service/productservice";
import {AppBreadcrumbService} from "../../app.breadcrumb.service";

@Component({
    templateUrl: './inspection.component.html',
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
export class InspectionComponent implements OnInit {

    productDialog: boolean;

    deleteProductDialog: boolean = false;

    deleteProductsDialog: boolean = false;

    products: Product[];

    product: Product;

    selectedProducts: Product[];

    submitted: boolean;

    cols: any[];

    statuses: any[];

    rowsPerPageOptions = [5, 10, 20];

    constructor(private messageService: MessageService,
                private confirmationService: ConfirmationService, private breadcrumbService: AppBreadcrumbService) {
        this.breadcrumbService.setItems([
            { label: 'Esileht', routerLink: ['/dashboard/dashboard'] }
        ]);
    }

    ngOnInit() {

    }


}
