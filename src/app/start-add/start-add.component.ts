import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {PdfService} from "./pdfService";

@Component({
    selector: 'app-start-add',
    templateUrl: './start-add.component.html',
    styleUrls: ['./start-add.component.scss']
})
export class StartAddComponent implements OnInit {
    selectedFiles: { name: string, url: string }[] = [];
    displayCameraDialog = false;
    selectedVastutavad: any[] = [];
    filteredVastutavad: any[] = [];
    vastutavadList: any[] = [];
    images: string[] = [];
    selectedImage: string;
    displayImageDialog = false;
    dynamicWidth: string = '80vw';
    dynamicHeight: string = '80vh';
    constructor(private pdfService: PdfService, private http: HttpClient) {}

    ngOnInit(): void {
        this.getVastutavad();
    }

    openCameraDialog() {
        this.displayCameraDialog = true;
    }

    closeCameraDialog() {
        this.displayCameraDialog = false;
    }

    onDialogShow(cameraDialog: any) {
        const dialogElement = cameraDialog.containerViewChild.nativeElement;
        if (dialogElement.requestFullscreen) {
            dialogElement.requestFullscreen();
        } else if (dialogElement.mozRequestFullScreen) {
            dialogElement.mozRequestFullScreen();
        } else if (dialogElement.webkitRequestFullscreen) {
            dialogElement.webkitRequestFullscreen();
        } else if (dialogElement.msRequestFullscreen) {
            dialogElement.msRequestFullscreen();
        }
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
        };
        reader.readAsDataURL(file);
    }

    handlePdf(file: File) {
        this.pdfService.extractImagesFromPdf(file).subscribe(
            (imageUrls) => {
                this.images.push(...imageUrls);
            },
            (error) => {
                console.error('Error uploading PDF:', error);
            }
        );
    }

    filteredVastutav(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.vastutavadList.length; i++) {
            const country = this.vastutavadList[i];
            if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(country);
            }
        }

        this.filteredVastutavad = filtered;
    }

    private getVastutavad() {
        // Implement the logic to fetch the list of vastutavad
    }

    onImageClick(imageUrl: string): void {
        this.selectedImage = imageUrl;
        console.log("onImageClick", imageUrl);
        this.displayImageDialog = true;
    }

    onImageLoaded(event: { width: number, height: number }): void {
        this.dynamicWidth = `${event.width}px`;
        this.dynamicHeight = `${event.height}px`;
    }
    closeImageDialog(): void {
        this.displayImageDialog = false;
    }
}
