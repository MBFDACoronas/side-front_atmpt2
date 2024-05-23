import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';

import {ConfirmationService, MessageService, TreeNode} from 'primeng/api';
import {Product} from "../../demo/domain/product";
import {ProductService} from "../../demo/service/productservice";
import {AppBreadcrumbService} from "../../app.breadcrumb.service";
import {NodeService} from "../../demo/service/nodeservice";
import {DrawingsFolderService} from "./drawings-folder.service";
import {DrawingsFolder} from "./drawings-folder.model";
import {TreeTable} from "primeng/treetable";
import {Tree} from "primeng/tree";
import {finalize} from "rxjs";
import {FileUploadService} from "../services/file-upload/file-upload.service";
import {DrawingsFileService} from "./drawings-file.service";
import {FileSaverModule, FileSaverService} from "ngx-filesaver";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    templateUrl: './drawings.component.html',
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
export class DrawingsComponent implements OnInit {

    drawingsFolder: DrawingsFolder;

    dialogVisible: boolean = false;
    selectedFolderId: string;
    files2: TreeNode[];

    selectedFiles2: TreeNode[];

    @ViewChild('treeTable', {static: false}) private treeTable: TreeTable;

    cols: any[];
    uploadedFiles: File[] = [];

    visible: boolean = true;
    submitted: boolean;
    fileUploadDialogVisible: boolean = false;

    constructor(private nodeService: NodeService,
                private breadcrumbService: AppBreadcrumbService,
                private changeDetectorRef: ChangeDetectorRef,
                private confirmationService: ConfirmationService,
                private messageService: MessageService,
                private fileUploadService: FileUploadService,
                private fileSaverService: FileSaverService,
                private drawingsFileService: DrawingsFileService,
                private router: Router,
                private route: ActivatedRoute,
                private drawingsFolderService: DrawingsFolderService
    ) {
        this.breadcrumbService.setItems([
            {label: 'UI Kit'},
            {label: 'Tree', routerLink: ['/uikit/tree']}
        ]);
    }

    ngOnInit() {
        this.getData();
        this.cols = [
            {field: 'name', header: 'Nimi'},
            {field: 'size', header: 'Suurus'},
            {field: 'type', header: 'Tüüp'},
            {field: 'action', header: 'Tegevused'}
        ];
    }

    getData() {
        let folderId = this.route.snapshot.paramMap.get('id');
        this.clearData();


        if (folderId !== null) {
            this.drawingsFolderService.fetchAllDrawingsFolder().subscribe(res => { // TODO saata folderId ja tagastada selle childElemendid
               // TODO ajutine lahendus:
                res = res.filter(r=> r.id=folderId);

                this.fillTableData(res);
            })
        } else {

            this.nodeService.getFilesystem().then(files => {
                console.log(files);
                // this.files2 = files
            });
            this.files2 = [];
            this.drawingsFolderService.fetchAllDrawingsFolder().subscribe(res => {
                this.fillTableData(res);
            })
        }
    }

    fillTableData(res){
        console.log(res);
        let treeNodes: TreeNode[];
        res.forEach(first => {
            if (first.parendId === null) {
                let treeNode: TreeNode = this.findChildren(first, res);

                treeNode.data.type = 'FOLDER';

                // INSERT FILE TO TREENODE IF EXISTS
                if (first.drawingsFile.length > 0) {
                    let fileNodes = {};
                    first.drawingsFile.forEach(f => {
                        let fNode: TreeNode = {data: {}, children: [], type: ''};
                        fNode.data.name = f.fileName;
                        fNode.data.size = f.fileSize;
                        fNode.data.type = 'FILE';
                        fNode.data.id = f.id;
                        // fileNodes.push(fNode);
                        treeNode.children.push(fNode);
                    });
                    // treeNode.children.push(fileNodes);
                }

                this.files2.push(treeNode);
            }
        })
        console.log("this.files2", this.files2);
        this.files2 = [...this.files2];
    }

    findChildren(parent: DrawingsFolder, list: DrawingsFolder[]): TreeNode {
        let treeNode: TreeNode = {data: {}, children: []};
        treeNode.data.name = parent.path;
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


    createNewFolder() {
        let drawingsFolder: DrawingsFolder = {drawingsFile: [], id: "", parendId: "", path: ""};
        drawingsFolder.path = "/"
        drawingsFolder.parendId = null;
        this.drawingsFolderService.saveDrawingsFolder(drawingsFolder).subscribe(res => {
            console.log(res);
        })
    }

    isRowSelected(rowNode: any): boolean {
        return this.files2.indexOf(rowNode.node) >= 0;
    }

    toggleRowSelection(rowNode: any): void {
        if (this.isRowSelected(rowNode)) {
            this.files2.splice(this.files2.indexOf(rowNode.node), 1);
        } else {
            this.files2.push(rowNode.node);
        }

        this.files2 = [...this.files2];
    }

    change($event: Event) {
        console.log("test");
    }


    hideFolderDialog() {
        this.visible = false;
    }

    validateFolder() {
        if (!this.drawingsFolder.path) {
            return false;
        }
        return true;
    }

    saveFolder() {
        this.submitted = true;
        if (!this.validateFolder()) {
            return;
        }
        this.drawingsFolder.parendId = this.selectedFolderId;
        // let drawingsFolder: DrawingsFolder = {id: "", parendId: "", path: ""};
        // drawingsFolder.path = ""
        // drawingsFolder.parendId = null;
        this.drawingsFolderService.saveDrawingsFolder(this.drawingsFolder).subscribe(res => {
            this.clearData();
            this.dialogVisible = false;
            this.getData();
        })
    }

    openAddFolderModal(id) {
        console.log(id);
        this.selectedFolderId = id;
        this.dialogVisible = true;
    }

    openAddFileModal(id) {
        this.getFolderIdFromPath();
        console.log(id);
        // this.selectedFolderId = id;
        this.fileUploadDialogVisible = true;
    }

    clearData() {
        this.drawingsFolder = {
            drawingsFile: [],
            id: "", parendId: "", path: ""
        }
    }

    confirmDelete(id) {
        this.drawingsFolderService.deleteDrawingsFolder(id).subscribe(res => {
            this.clearData();
            this.dialogVisible = false;
            this.getData();
        })
    }

    confirm1(id, type) {
        this.confirmationService.confirm({
            header: 'Kinnitamine',
            message: `Oled kindel?`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Jah',
            rejectLabel: 'Ei',
            rejectButtonStyleClass: 'p-button-text',
            acceptButtonStyleClass: 'p-button-text',
            accept: () => {

                if (type === "FOLDER") {
                    this.drawingsFolderService.deleteDrawingsFolder(id).pipe(
                        finalize(() => {
                        })
                    ).subscribe(() => this.getData());
                }

                if (type === "FILE") {
                    this.drawingsFileService.deleteDrawingsFile(id).pipe(
                        finalize(() => {
                        })
                    ).subscribe(() => this.getData());
                }


            }
        });
    }


    // FILE UPLOAD

    onUpload(event) {
        console.log("onUpload");
        for (const file of event.files) {

            this.uploadedFiles.push(file);


            console.log(this.uploadedFiles);
        }
    }

    saveFile() {
        this.uploadedFiles.forEach(f => {
            this.fileUploadService.upload(f, this.selectedFolderId);

        });
        this.fileUploadDialogVisible = false;
        this.uploadedFiles = [];
        this.getData();

    }

    hideFileUploadDialog() {
        this.fileUploadDialogVisible = false;
    }

    downloadFile(id, fileName) {
        this.drawingsFileService.fetchDrawingsFileById(id).subscribe(blob => {

            console.log(fileName);
            this.fileSaverService.save(blob, fileName);

        })
    }

    goToFolder(folderId) {
        this.router.navigate(['/sales-contracts/detail', {id: folderId}]);

    }

    getFolderIdFromPath(){
        let folderId = this.route.snapshot.paramMap.get('id');
        console.log(folderId);
        if(folderId === null){
            this.selectedFolderId="00000000-0000-0000-0000-000000000000";
        }else{
            this.selectedFolderId=folderId;

        }

    }


}
