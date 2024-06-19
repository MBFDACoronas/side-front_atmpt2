import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-camera-capture',
    templateUrl: './camera-capture.component.html',
    styleUrls: ['./camera-capture.component.scss']
})
export class CameraCaptureComponent implements OnInit {
    @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement: ElementRef<HTMLCanvasElement>;
    videoWidth: number = 0;
    videoHeight: number = 0;
    display: boolean = false;
    initCapture: boolean = true;
    capturedImage: string | null = null;
    cameraError;

    ngOnInit() {
        this.startCamera();
    }

    startCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
                this.videoElement.nativeElement.srcObject = stream;
                this.videoElement.nativeElement.play();
            });
        }
    }

    capture() {
        this.videoWidth = this.videoElement.nativeElement.videoWidth;
        this.videoHeight = this.videoElement.nativeElement.videoHeight;
        this.canvasElement.nativeElement.width = this.videoWidth;
        this.canvasElement.nativeElement.height = this.videoHeight;
        const context = this.canvasElement.nativeElement.getContext('2d');
        context.drawImage(this.videoElement.nativeElement, 0, 0, this.videoWidth, this.videoHeight);

        this.capturedImage = this.canvasElement.nativeElement.toDataURL('image/png');
        this.display = true;
    }

    onCancel(): void {
        this.display = false;
        this.capturedImage = null;
        this.startCamera();
    }
    retake() {
        this.capturedImage = null;
        this.startCamera();
    }
    onConfirm(): void {

        this.display = false;
        // Handle the confirmed image data
    }
}
