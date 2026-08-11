import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Assignment} from '../assignment/assignment.model';
import {AssignmentService} from '../assignment/assignment.service';
import {AuthService, ROLE_ADMIN, ROLE_PEAADMIN, ROLE_USER} from '../auth/auth.service';
import {Drawing} from '../drawing/drawing.model';
import {DrawingService} from '../drawing/drawing.service';
import {DrawingInteraction} from '../drawing-interaction/drawing-interaction.model';
import {DrawingInteractionService} from '../drawing-interaction/drawing-interaction.service';
import {MessageService} from 'primeng/api';
import {ProjectAddress, ProjectSector} from '../project/project.model';
import {PdfService} from '../start-add/pdfService';
import {Type} from '../type/type.model';
import {TypeService} from '../type/type.service';

@Component({
    selector: 'app-assignments',
    templateUrl: './assignments.component.html',
    styleUrls: ['./assignments.component.scss']
})
export class AssignmentsComponent implements OnInit {
    selectedFiles: { name: string, url: string }[] = [];
    drawingsList: Drawing[] = [];
    images: string[] = [];
    selectedImage: string;
    assignment: Assignment = {name: '', id: '', drawing: []} as Assignment;
    selectedType: Type;
    typeList: Type[] = [];
    addressOptions: ProjectAddress[] = [];
    sectorOptions: ProjectSector[] = [];
    selectedAddress: ProjectAddress;
    selectedSector: ProjectSector;
    assignmentStatusById: {[id: string]: string} = {};
    isRegularUser = false;
    canApproveAssignments = false;
    dialogueVisible = false;
    private assignmentId: string;

    constructor(
        private pdfService: PdfService,
        private route: ActivatedRoute,
        private assignmentService: AssignmentService,
        private messageService: MessageService,
        private drawingService: DrawingService,
        private drawingInteractionService: DrawingInteractionService,
        private typeService: TypeService,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.dialogueVisible = true;
        this.isRegularUser = this.authService.currentUser?.role === ROLE_USER;
        this.canApproveAssignments = this.authService.currentUser?.role === ROLE_ADMIN || this.authService.currentUser?.role === ROLE_PEAADMIN;
        this.assignmentId = this.route.snapshot.paramMap.get('id');
        this.typeService.fetchAllType().subscribe(types => this.typeList = types || []);
        this.loadAssignment();
        this.route.paramMap.subscribe(params => {
            const nextId = params.get('id');
            if (nextId && nextId !== this.assignmentId) {
                this.assignmentId = nextId;
                this.loadAssignment();
            }
        });
    }

    get statusLabel(): string {
        if (this.assignment?.status === 'APPROVED') {
            return 'Kinnitatud';
        }
        if (this.assignment?.status === 'WAITING_APPROVAL' || this.assignment?.status === 'FINISHED') {
            return 'Ootab kinnitamist';
        }
        return 'Lõpetamata';
    }

    get canMarkFinished(): boolean {
        return this.isRegularUser
            && this.assignment?.status !== 'WAITING_APPROVAL'
            && this.assignment?.status !== 'APPROVED'
            && this.assignment?.status !== 'FINISHED';
    }

    get canApproveAssignment(): boolean {
        return this.canApproveAssignments
            && (this.assignment?.status === 'WAITING_APPROVAL' || this.assignment?.status === 'FINISHED');
    }

    typeChange(event: any): void {
        if (this.isRegularUser) {
            return;
        }

        this.selectedType = event.value || event;
        this.assignment.typeTemplate = this.selectedType;
        this.assignment.type = this.selectedType?.name;
    }

    configureProjectHierarchy(): void {
        this.addressOptions = this.assignment.project?.addresses || [];
        this.selectedSector = this.assignment.sector;
        this.selectedAddress = this.assignment.address || (this.selectedSector
            ? this.addressOptions.find(address => (address.sectors || []).some(sector => sector.id === this.selectedSector.id))
            : this.addressOptions[0]);
        this.sectorOptions = this.selectedAddress?.sectors || [];
    }

    onAddressChange(event: any): void {
        if (this.isRegularUser) {
            return;
        }

        this.selectedAddress = event.value;
        this.sectorOptions = this.selectedAddress?.sectors || [];
        this.selectedSector = null;
        this.assignment.address = this.selectedAddress;
        this.assignment.sector = null;
    }

    onSectorChange(event: any): void {
        if (this.isRegularUser) {
            return;
        }

        this.selectedSector = event.value;
        this.assignment.sector = this.selectedSector;
    }

    byteArrayToFile(byteArray: any, fileName: string): File {
        const blob = new Blob([new Uint8Array(byteArray)], {type: 'application/octet-stream'});
        return new File([blob], fileName, {type: 'application/octet-stream'});
    }

    async onFileSelected(event: Event): Promise<void> {
        if (this.isRegularUser) {
            return;
        }

        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                if (file.type === 'application/pdf') {
                    this.handlePdf(file);
                } else if (file.type.startsWith('image/')) {
                    this.readImageFile(file);
                }
            }
        }
    }

    readImageFile(file: File): void {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.selectedFiles.push({name: file.name, url: e.target.result});
            this.images.push(e.target.result);
            this.drawingsList.push({
                assignment: this.assignment,
                name: file.name,
                imageFile: e.target.result as any,
                imageFileRequestData: '',
                drawingInteraction: [],
                id: null,
            });
        };
        reader.readAsDataURL(file);
    }

    handlePdf(file: File): void {
        this.pdfService.extractImagesFromPdf(file).subscribe(
            imageUrls => {
                this.images.push(...imageUrls);
                imageUrls.forEach(url => {
                    this.drawingsList.push({
                        assignment: this.assignment,
                        name: file.name,
                        imageUrl: url,
                        drawingInteraction: [],
                        imageFile: file,
                        imageFileRequestData: '',
                        id: null,
                    });
                });
            },
            error => console.error('Error uploading PDF:', error)
        );
    }

    onImageClick(imageUrl: string): void {
        this.selectedImage = imageUrl;
    }

    saveDrawing(): void {
        if (this.isRegularUser) {
            return;
        }

        this.drawingsList.forEach(drawing => {
            this.drawingService.saveDrawing(drawing).subscribe(savedDrawing => {
                drawing.id = savedDrawing.id;
                (drawing.drawingInteraction || []).forEach(interaction => {
                    interaction.drawing = savedDrawing.id;
                    this.drawingInteractionService.saveDrawingInteraction(interaction).subscribe();
                });
            });
        });
    }

    saveAssignment(): void {
        if (this.isRegularUser) {
            return;
        }

        const assignment = {
            ...this.assignment,
            id: this.assignmentId,
            name: this.assignment.name,
            address: this.selectedAddress,
            sector: this.selectedSector,
            drawing: null
        } as Assignment;

        this.assignmentService.saveAssignment(assignment).subscribe(res => {
            this.assignment = res;
            this.messageService.add({severity: 'success', summary: 'Salvestamine', detail: 'Salvestamine õnnestus'});
            this.saveDrawing();
        });
    }

    markFinished(): void {
        if (!this.assignment?.id) {
            return;
        }

        this.assignmentService.markAssignmentFinished(this.assignment.id).subscribe(res => {
            this.assignment = res;
            this.assignmentStatusById[res.id] = res.status || 'WAITING_APPROVAL';
            this.messageService.add({severity: 'success', summary: 'Staatus', detail: 'Ülesanne saadeti kinnitamisele'});
        });
    }

    approveAssignment(): void {
        if (!this.assignment?.id || !this.canApproveAssignment) {
            return;
        }

        this.assignmentService.approveAssignment(this.assignment.id).subscribe(res => {
            this.assignment = res;
            this.assignmentStatusById[res.id] = res.status || 'APPROVED';
            this.messageService.add({severity: 'success', summary: 'Staatus', detail: 'Ülesanne kinnitatud'});
        });
    }

    openDialogue(): void {
        this.dialogueVisible = true;
    }

    onVisibleChange(visible: boolean): void {
        if (!visible) {
            this.assignment = {} as Assignment;
        }
    }

    saveAssignmentDetails(): void {
    }

    private loadAssignment(): void {
        this.drawingsList = [];
        this.assignmentService.fetchAssignmentById(this.assignmentId).subscribe(res => {
            this.assignment = res;
            this.selectedType = res.typeTemplate;
            this.configureProjectHierarchy();
            this.loadProjectAssignmentStatuses();
            (res.drawing || []).forEach(item => {
                item.imageFile = this.byteArrayToFile(item.imageFileRequestData, item.name);
                item.assignment = this.assignment;
                this.drawingsList.push(item);
            });
        });
    }

    private loadProjectAssignmentStatuses(): void {
        if (!this.assignment?.project?.id) {
            return;
        }

        this.assignmentService.fetchAllAssignmentsByProjectId(this.assignment.project.id).subscribe(assignments => {
            this.assignmentStatusById = (assignments || []).reduce((map, assignment) => {
                map[assignment.id] = assignment.status || 'UNFINISHED';
                return map;
            }, {} as {[id: string]: string});
        });
    }
}
