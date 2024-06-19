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

@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.scss'
})
export class AssignmentsComponent implements OnInit{
    selectedFiles: { name: string, url: string }[] = [];
    drawingsList: Drawing[] = [];
    images: string[] = [];

    selectedImage: string;
    private assignmentId: any;
    private assignment: Assignment;

    constructor(
        private pdfService: PdfService,
        private route: ActivatedRoute,
        private assignmentService: AssignmentService,
        private drawingService: DrawingService,
        private drawingInteractionService: DrawingInteractionService,
        private http: HttpClient

    ) {}


    ngOnInit(): void {

        // Access the id parameter from the route
        this.assignmentId = this.route.snapshot.paramMap.get('id');
        console.log(this.assignmentId);
        this.assignmentService.fetchAssignmentById(this.assignmentId).subscribe(res=>{
            this.assignment =res;
        })

        // Alternatively, you can subscribe to the route parameters
        this.route.paramMap.subscribe(params => {
            this.assignmentId = params.get('id');
            console.log(this.assignmentId);
        });
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
                        imageUrl: string;
                        name: string;
                    }();
                    drawing.assignment = this.assignment;
                    drawing.name = file.name;
                    drawing.imageUrl = url;
                    drawing.drawingInteraction = [];
                    drawing.imageFile = file; // Set the file instead of URL, assuming imageUrls are the image files

                    this.drawingsList.push(drawing);
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
                d.drawingInteraction.map(item=>{
                    item.drawing = res.id;
                    this.drawingInteractionService.saveDrawingInteraction(item).subscribe(res=>{

                    })

                })
            });
        })

    }
}
