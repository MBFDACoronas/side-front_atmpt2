import {Component, OnInit} from '@angular/core';
import {PdfService} from "../start-add/pdfService";
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {Drawing} from "../drawing/drawing.model";
import {Assignment} from "../assignment/assignment.model";
import {DrawingInteraction} from "../drawing-interaction/drawing-interaction.model";
import {AssignmentService} from "../assignment/assignment.service";
import {DrawingService} from "../drawing/drawing.service";
import {DrawingInteractionService} from "../drawing-interaction/drawing-interaction.service";
import {NotificationService} from "../notification/notification.service";
import {MessageService} from "primeng/api";
import {Project, ProjectAddress, ProjectSector} from "../project/project.model";
import {OPS} from "pdfjs-dist";
import {Type} from "../type/type.model";
import {TypeService} from "../type/type.service";

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
    styleUrls: ['./assignments.component.scss']
})export class AssignmentsComponent implements OnInit{

    messages: any[] = [];
    selectedFiles: { name: string, url: string }[] = [];
    drawingsList: Drawing[] = [];
    images: string[] = [];

    selectedImage: string;
    private assignmentId: any;
    assignment: Assignment;
    selectedType: Type;
    typeList: Type[];
    addressOptions: ProjectAddress[] = [];
    sectorOptions: ProjectSector[] = [];
    selectedAddress: ProjectAddress;
    selectedSector: ProjectSector;
    dialogueVisible: boolean;
    typeChange(event: any) {
        this.selectedType = event;
    }
    constructor(
        private pdfService: PdfService,
        private route: ActivatedRoute,
        private assignmentService: AssignmentService,
        private notificationService: NotificationService,
        private messageService: MessageService,
        private drawingService: DrawingService,
        private drawingInteractionService: DrawingInteractionService,
        private typeService: TypeService,
        private http: HttpClient

    ) {
        this.assignment = {
            name: '',
            id: '',
            drawing: [],
        } as Assignment;
    }


    ngOnInit(): void {
        this.dialogueVisible=true;
        this.assignmentId = this.route.snapshot.paramMap.get('id');
        this.typeService.fetchAllType().subscribe(
            res=>{
                this.typeList = res;
            }
        )
        this.assignmentService.fetchAssignmentById(this.assignmentId).subscribe(res=>{
            this.assignment =res;
            this.configureProjectHierarchy();
            res.drawing.map(item =>{
                    item.imageFile = this.byteArrayToFile(item.imageFileRequestData, item.name);
                    item.assignment = this.assignment;
                    this.drawingsList.push(item);
            })

        })

        this.route.paramMap.subscribe(params => {
            this.assignmentId = params.get('id');
        });
    }

    configureProjectHierarchy() {
        this.addressOptions = this.assignment.project?.addresses || [];
        this.selectedSector = this.assignment.sector;
        this.selectedAddress = this.selectedSector
            ? this.addressOptions.find(address => (address.sectors || []).some(sector => sector.id === this.selectedSector.id))
            : this.addressOptions[0];
        this.sectorOptions = this.selectedAddress?.sectors || [];
    }

    onAddressChange(event: any) {
        this.selectedAddress = event.value;
        this.sectorOptions = this.selectedAddress?.sectors || [];
        this.selectedSector = null;
        this.assignment.sector = null;
    }

    onSectorChange(event: any) {
        this.selectedSector = event.value;
        this.assignment.sector = this.selectedSector;
    }


    byteArrayToFile(byteArray: any, fileName: string): File {
        const blob = new Blob([new Uint8Array(byteArray)], { type: 'application/octet-stream' });
        return new File([blob], fileName, { type: 'application/octet-stream' });
    }

    async onFileSelected(event: Event) {
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

    readImageFile(file: File) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.selectedFiles.push({ name: file.name, url: e.target.result });
            this.images.push(e.target.result);
            let drawing:Drawing = new class implements Drawing {
                imageFile?: File;
                imageFileRequestData: string;
                imageUrl?: string;
                assignment: Assignment;
                drawingInteraction: DrawingInteraction[];
                id: string;
                name: string;
            }
            drawing.assignment = this.assignment;
            drawing.name = file.name;
            drawing.imageFile = e.target.result;

            this.drawingsList.push(drawing)
        };
        reader.readAsDataURL(file);
    }



    handlePdf(file: File): void {
        this.pdfService.extractImagesFromPdf(file).subscribe(
            (imageUrls) => {
                this.images.push(...imageUrls);

                imageUrls.forEach(url => {
                    const drawing:Drawing = new class implements Drawing {
                        assignment: Assignment;
                        drawingInteraction: DrawingInteraction[];
                        id: string;
                        imageFile: File;
                        imageFileRequestData: string;
                        imageUrl: string;
                        name: string;
                    }();
                    drawing.assignment = this.assignment;
                    drawing.name = file.name;
                    drawing.imageUrl = url;
                    drawing.drawingInteraction = [];
                    drawing.imageFile = file; // Set the file instead of URL, assuming imageUrls are the image files

                    this.drawingsList.push(drawing);
                    console.log(this.drawingsList);
                });
            },
            (error) => {
                console.error('Error uploading PDF:', error);
            }
        );
    }


    onImageClick(imageUrl: string): void {
        this.selectedImage = imageUrl;
    }

    saveDrawing() {
        this.drawingsList.forEach(d=>{
            this.drawingService.saveDrawing(d).subscribe(res=>{

                console.log(res);
                d.id = res.id;
                d.drawingInteraction.map(item=>{
                    item.drawing = res.id;
                    this.drawingInteractionService.saveDrawingInteraction(item).subscribe(res=>{

                    })

                })
            });
        })

    }

    saveAssignment() {

        let assignment = new class implements Assignment {
            drawing: null;
            id: string;
            project: Project;
            address?: ProjectAddress;
            sector?: ProjectSector;
            name: string;
        }
        assignment.id = this.assignmentId;
        assignment.name = this.assignment.name;
        assignment.project = this.assignment.project;
        assignment.address = this.selectedAddress;
        assignment.sector = this.selectedSector;
        this.assignmentService.saveAssignment(assignment).subscribe(res=>{
            this.messageService.add({severity:'success', summary:'Salvestamine', detail:'Salvestamine õnnestus'});

            this.saveDrawing();
        })
    }

    openDialogue() {
            this.dialogueVisible = true;

    }
    onVisibleChange($event: boolean) {
        if(!$event){
                this.assignment = {} as Assignment;
        }

    }

    protected readonly OPS = OPS;

    saveAssignmentDetails() {


    }
    //
    // filteredVastutav(event: any) {
    //     const filtered: any[] = [];
    //     const query = event.query;
    //     for (let i = 0; i < this.vastutavadList.length; i++) {
    //         const country = this.vastutavadList[i];
    //         if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
    //             filtered.push(country);
    //         }
    //     }
    //
    //     this.filteredVastutavad = filtered;
    // }
}
