import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import {ConfirmationService, MessageService, TreeNode} from 'primeng/api';
import {Product} from "../../demo/domain/product";
import {ProductService} from "../../demo/service/productservice";
import {AppBreadcrumbService} from "../../app.breadcrumb.service";
import {InvolvementGroup} from "../services/involvement-group/involvement-group.model";
import {Table} from "primeng/table";
import {CustomerService} from "../../demo/service/customerservice";
import {Customer, Representative} from "../../demo/domain/customer";
import {InvolvementGroupService} from "../services/involvement-group/involvement-group.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DrawingsFolder} from "../drawings/drawings-folder.model";
import {DrawingsFolderService} from "../drawings/drawings-folder.service";
import {InvolvementUsers} from "../services/involvement-users/involvement-users.model";
import {User} from "../services/user/user.model";
import {UserService} from "../services/user/user.service";
import {InvolvementUsersService} from "../services/involvement-users/involvement-users.service";
import {
    InvolvementDrawingsAccessService
} from "../services/involvement-drawings-access/involvement-drawings-access.service";
import {InvolvementDrawingsAccess} from "../services/involvement-drawings-access/involvement-drawings-access.model";
import {catchError} from "rxjs";
import {ElementsService} from "../services/elements/elements.service";
import {ClassifierElement} from "../services/elements/elements.model";

@Component({
    templateUrl: './involvement-detail.component.html',
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
export class InvolvementDetailComponent implements OnInit {
    rightsList: ClassifierElement[];

    involvementGroups: InvolvementGroup[];
    involvementUsers: InvolvementUsers[];
    users: User[];
    newUser: User;

    involvementGroupModel: InvolvementGroup;

    loading: boolean = false;
    selectedRole: any;
    roleSelection: any[];
    dialogVisible: boolean = false;
    drawingFoldersList: TreeNode[];
    dialogueHeader: string;
    drawingModelItems: any;
    selectedDrawingFolders: TreeNode;
    involvementGroupId;
    insert: boolean;

    constructor(private customerService: CustomerService, private productService: ProductService,
                private breadcrumbService: AppBreadcrumbService,
                private messageService: MessageService,
                private router: Router,
                private route: ActivatedRoute,
                private drawingsFolderService: DrawingsFolderService,
                private userService: UserService,
                private elementsService: ElementsService,
                private involvementUserService: InvolvementUsersService,
                private involvementDrawingsAccessService: InvolvementDrawingsAccessService,
                private involvementGroupService: InvolvementGroupService
    ) {
        this.users = [];
        this.newUser = new class implements User {
            code: string;
            email: string;
            id: string;
            lastName: string;
            name: string;
            role: string;
        };

        this.breadcrumbService.setItems([
            {label: 'UI Kit'},
            {label: 'Table', routerLink: ['/uikit/table']}
        ]);
    }

    loadContractStatus(){
        this.elementsService.fetchElementsByGroupType("rights").subscribe(value => {
            this.rightsList = value;
            console.log(this.rightsList);
        })
    }

    ngOnInit() {
        this.involvementGroupId = this.route.snapshot.paramMap.get('id');


        if (this.involvementGroupId)
            this.getData();

        this.users = [];
        this.involvementGroupModel = new class implements InvolvementGroup {
            id: string;
            name: string;
            involvementUsers: InvolvementUsers[];
        };

        this.roleSelection = [];
        this.roleSelection.push("Peakasutaja");
        this.roleSelection.push("test1");
        this.roleSelection.push("test2");
        this.loadContractStatus();
    }

    saveRights() {
        console.log(this.selectedDrawingFolders);
        this.closeDialogue();
    }

    getData() {
        this.involvementGroupService.fetchInvolvementGroupById(this.involvementGroupId).subscribe(res => {
            console.log("res", res);
            this.involvementGroupModel = res;
            this.insert = false;
            res.involvementUsers.forEach(user=>{
                this.users.push(user.user);
            })
        })
    }

    openDialogue1(type) {
        this.loading = true;
        this.dialogVisible = true;
        if (type === 1) {
            this.dialogueHeader = "Joonised"
            if (this.drawingFoldersList === undefined) {
                this.drawingsFolderService.fetchAllDrawingsFolder().subscribe(res => {
                    this.getDrawingFolderData(res);
                    this.loading = false;
                });
            }
        } else if (type === 2) {
            //TODO DOKUMENDID
        } else if (type === 3) {
            //TODO TÖÖLAUD
        }
    }

    closeDialogue() {
        this.dialogVisible = false;

    }


    getDrawingFolderData(res) {
        this.drawingFoldersList = [];
        let treeNodes: TreeNode[];
        res.forEach(first => {
            if (first.parendId === null) {
                let treeNode: TreeNode = this.findChildren(first, res);


                this.drawingFoldersList.push(treeNode);
            }
        })
    }

    findChildren(parent: DrawingsFolder, list: DrawingsFolder[]): TreeNode {
        let treeNode: TreeNode = {
            data: {}, children: [], label: "",
            "expandedIcon": "pi pi-folder-open",
            "collapsedIcon": "pi pi-folder",
        };
        treeNode.label = parent.path;
        treeNode.data.id = parent.id;
        list.forEach(item => {
            if (item.parendId === parent.id) {
                let childTreeNode: TreeNode = {data: {}, children: []};
                childTreeNode.data.name = item.path;
                childTreeNode = this.findChildren(item, list);
                childTreeNode.data.type = 'FOLDER';
                treeNode.children.push(childTreeNode);
            }
        })
        return treeNode;
    }

    nodeSelect($event: any) {

    }

    nodeUnselect($event: any) {

    }

    save() {
        this.involvementGroupService.saveInvolvementGroup(this.involvementGroupModel).subscribe(res => {
            this.drawingFoldersList.forEach(folder => {


                let df: InvolvementDrawingsAccess = new class implements InvolvementDrawingsAccess {
                    drawingsFolderId: string;
                    involvementGroupId: string;
                    rights: string;
                }
                df.drawingsFolderId = folder.data.id;
                df.involvementGroupId = res.id;
                df.rights = null;
                // this.involvementDrawingsAccessService.saveInvolvementDrawingsAccess()
                this.involvementDrawingsAccessService.saveInvolvementDrawingsAccess(df).subscribe(res3 => {

                });
            })

            this.users.forEach(u => {
                let newUser: User = new class implements User {
                    code: string;
                    email: string;
                    id: string;
                    lastName: string;
                    name: string;
                    role: string;
                }
                newUser.email = u.email;
                this.userService.saveUser(newUser).subscribe(r1 => {
                    let involvementUser: InvolvementUsers = new class implements InvolvementUsers {
                        id: string;
                        involvementGroupId: string;
                        rights: string;
                        userId: string;
                        user: User;
                        drawingsRights:ClassifierElement;
                    }
                    involvementUser.userId = r1.id;
                    involvementUser.user = r1;
                    involvementUser.involvementGroupId = res.id;
                    this.involvementUserService.saveInvolvementUsers(involvementUser).subscribe(res2 => {
                        this.router.navigate(['/involvement']);

                    });
                })
            });

            console.log(res);
            this.messageService.add({severity: 'success', summary: 'Successful', detail: 'Salvestatud', life: 3000});
        }, catchError(err => {
            console.log(err);
            this.messageService.add({severity: 'error', summary: 'error', detail: 'Salvestatud', life: 3000});

            return err;
        }))
    }

    cancel() {
        this.router.navigate(['/involvement']);
    }

    addUser() {
        let user: User = new class implements User {
            code: string;
            email: string;
            id: string;
            lastName: string;
            name: string;
            role: string;
        }
        user.email = this.newUser.email;
        this.users.push(user);

        if (!this.insert) {

            let newInvolvementGroupUser = new class implements InvolvementUsers {
                id: string;
                involvementGroupId: string;
                rights: string;
                user: User;
                userId: string;
                drawingsRights:ClassifierElement;

            };
            newInvolvementGroupUser.user = user;
            newInvolvementGroupUser.involvementGroupId = this.involvementGroupModel.id;


            this.involvementGroupModel.involvementUsers.push(newInvolvementGroupUser);
        } else {

        }


    }

    save2() {
        // if(true){
        //     console.log(this.involvementGroupModel);
        //     return;
        // }

        this.involvementGroupService.saveInvolvementGroup(this.involvementGroupModel).subscribe(res => {
            this.router.navigate(['/involvement']);
        })

    }

    change($event: any) {

    }
}
