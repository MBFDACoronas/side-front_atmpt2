import {
    Component,
    ElementRef,
    Input,
    OnInit,
    ViewChild,
    OnChanges,
    SimpleChanges,
    AfterViewInit,
    Output, EventEmitter
} from '@angular/core';
import {DrawingInteraction} from "../drawing-interaction/drawing-interaction.model";

@Component({
    selector: 'app-image-dialog',
    templateUrl: './image-dialog.component.html',
    styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() imageUrl: any;
    @Input() type: string;
    dialogueVisible: boolean = false;

    @Output() imageLoaded = new EventEmitter<{ width: number, height: number }>();
    @ViewChild('imageCanvas', { static: true }) imageCanvas: ElementRef<HTMLCanvasElement>;
    private context: CanvasRenderingContext2D;
    private loadedImage: HTMLImageElement;
    zoom = 1;
    readonly minZoom = 0.02;
    readonly maxZoom = 6;
    private offsetX = 0;
    private offsetY = 0;
    isDragging = false;
    private pointerStartX = 0;
    private pointerStartY = 0;
    private dragStartOffsetX = 0;
    private dragStartOffsetY = 0;
    private hasDragged = false;
    @Input() drawingInteractions!: DrawingInteraction[];

    get canvasTransform(): string {
        return `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.zoom})`;
    }

    get zoomPercent(): number {
        return Math.round(this.zoom * 100);
    }

    ngOnInit(): void {
        console.log("drawingInteractions", this.drawingInteractions);

    }

    ngAfterViewInit(): void {
        this.initCanvas();
        this.loadImage();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['imageUrl']) {
            // console.log('imageUrl changed:', this.imageUrl);
            if (this.imageUrl) {
                this.loadImage();
            }
        }
    }

    initCanvas(): void {
        const canvas = this.imageCanvas.nativeElement;
        this.context = canvas.getContext('2d');
    }
    @ViewChild('pdfEmbed', { static: true }) pdfEmbed: ElementRef;

    loadImage(): void {
        const canvas = this.imageCanvas.nativeElement;
        const image = new Image();
        image.src = this.imageUrl;
        image.onload = () => {
            this.loadedImage = image;
            canvas.width = image.width;
            canvas.height = image.height;
            this.fitToView();
            this.redrawCanvas();
            this.imageLoaded.emit({ width: Math.min(image.width + 50, window.innerWidth * 0.9), height: Math.min(image.height + 50, window.innerHeight * 0.85) });

        };
        image.onerror = (error) => {
            console.error('Image failed to load:', error);
        };
    }




    loadCircles(): void {
        this.redrawCanvas();
    }

    onPointerDown(event: PointerEvent): void {
        if (!this.loadedImage) {
            return;
        }

        this.isDragging = true;
        this.hasDragged = false;
        this.pointerStartX = event.clientX;
        this.pointerStartY = event.clientY;
        this.dragStartOffsetX = this.offsetX;
        this.dragStartOffsetY = this.offsetY;
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    onPointerMove(event: PointerEvent): void {
        if (!this.isDragging) {
            return;
        }

        const deltaX = event.clientX - this.pointerStartX;
        const deltaY = event.clientY - this.pointerStartY;
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
            this.hasDragged = true;
        }

        this.offsetX = this.dragStartOffsetX + deltaX;
        this.offsetY = this.dragStartOffsetY + deltaY;
    }

    onPointerUp(event: PointerEvent): void {
        if (!this.isDragging) {
            return;
        }

        this.isDragging = false;
        const target = event.currentTarget as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
        }

        if (!this.hasDragged) {
            this.addMarkerFromPointer(event);
        }
    }

    onWheel(event: WheelEvent): void {
        if (!this.loadedImage) {
            return;
        }

        event.preventDefault();
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        this.setZoom(this.zoom * zoomFactor, event.clientX, event.clientY);
    }

    zoomIn(): void {
        const center = this.getViewportCenter();
        this.setZoom(this.zoom * 1.2, center.x, center.y);
    }

    zoomOut(): void {
        const center = this.getViewportCenter();
        this.setZoom(this.zoom / 1.2, center.x, center.y);
    }

    fitToView(): void {
        if (!this.loadedImage) {
            return;
        }

        const canvas = this.imageCanvas.nativeElement;
        const viewport = canvas.parentElement;
        const scaleToFit = Math.min(1, viewport.clientWidth / canvas.width, viewport.clientHeight / canvas.height);
        this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, scaleToFit));
        this.offsetX = (viewport.clientWidth - canvas.width * this.zoom) / 2;
        this.offsetY = (viewport.clientHeight - canvas.height * this.zoom) / 2;
    }

    resetView(): void {
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    private setZoom(nextZoom: number, originClientX?: number, originClientY?: number): void {
        const clampedZoom = Math.min(this.maxZoom, Math.max(this.minZoom, nextZoom));
        if (clampedZoom === this.zoom) {
            return;
        }

        if (originClientX === undefined || originClientY === undefined) {
            this.zoom = clampedZoom;
            return;
        }

        const rect = this.imageCanvas.nativeElement.getBoundingClientRect();
        const imageX = (originClientX - rect.left) / this.zoom;
        const imageY = (originClientY - rect.top) / this.zoom;
        this.zoom = clampedZoom;
        const viewportRect = this.imageCanvas.nativeElement.parentElement.getBoundingClientRect();
        this.offsetX = originClientX - viewportRect.left - imageX * this.zoom;
        this.offsetY = originClientY - viewportRect.top - imageY * this.zoom;
    }

    private getViewportCenter(): { x: number, y: number } {
        const viewportRect = this.imageCanvas.nativeElement.parentElement.getBoundingClientRect();
        return {
            x: viewportRect.left + viewportRect.width / 2,
            y: viewportRect.top + viewportRect.height / 2,
        };
    }

    private addMarkerFromPointer(event: PointerEvent): void {
        const rect = this.imageCanvas.nativeElement.getBoundingClientRect();
        const x = (event.clientX - rect.left) / this.zoom;
        const y = (event.clientY - rect.top) / this.zoom;
        const canvas = this.imageCanvas.nativeElement;

        if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
            return;
        }

        const index = this.getNextDrawingIndex();
        this.drawCircle(x, y, index);
    }


    drawCircle(x: number, y: number, index: number, addInteraction: boolean = true): void {
        this.drawCircleMarker(x, y, index);

        if (addInteraction) {
            if (!this.drawingInteractions) {
                this.drawingInteractions = [];
            }

            const drawingInteraction: DrawingInteraction = {
                coordX: x,
                coordY: y,
                drawingIndex: index,
                drawingType: this.type,
                drawing: "0", // Assuming you have the drawing ID available
                id: null, // Or generate a UUID if needed
            };
            this.dialogueVisible = true;
            this.drawingInteractions.push(drawingInteraction);
        }
    }

    private redrawCanvas(): void {
        const canvas = this.imageCanvas.nativeElement;
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        if (!this.loadedImage) {
            return;
        }

        this.context.drawImage(this.loadedImage, 0, 0);
        (this.drawingInteractions || []).forEach(item => {
            this.drawCircleMarker(item.coordX, item.coordY, item.drawingIndex);
        });
    }

    private drawCircleMarker(x: number, y: number, index: number): void {
        const text = this.type + index.toString();
        this.context.font = '12px bold Arial';
        const textWidth = this.context.measureText(text).width;
        const padding = 10; // Padding around the text
        const rectWidth = textWidth + padding * 2;
        const rectHeight = 20; // Fixed height for the rectangle

        // Draw the rounded rectangle
        const radius = 10; // Radius for the corners
        this.context.beginPath();
        this.context.moveTo(x - rectWidth / 2 + radius, y - rectHeight / 2);
        this.context.lineTo(x + rectWidth / 2 - radius, y - rectHeight / 2);
        this.context.quadraticCurveTo(x + rectWidth / 2, y - rectHeight / 2, x + rectWidth / 2, y - rectHeight / 2 + radius);
        this.context.lineTo(x + rectWidth / 2, y + rectHeight / 2 - radius);
        this.context.quadraticCurveTo(x + rectWidth / 2, y + rectHeight / 2, x + rectWidth / 2 - radius, y + rectHeight / 2);
        this.context.lineTo(x - rectWidth / 2 + radius, y + rectHeight / 2);
        this.context.quadraticCurveTo(x - rectWidth / 2, y + rectHeight / 2, x - rectWidth / 2, y + rectHeight / 2 - radius);
        this.context.lineTo(x - rectWidth / 2, y - rectHeight / 2 + radius);
        this.context.quadraticCurveTo(x - rectWidth / 2, y - rectHeight / 2, x - rectWidth / 2 + radius, y - rectHeight / 2);
        this.context.fillStyle = '#90EE90';
        this.context.fill();
        this.context.closePath();

        // Draw the text inside the rectangle
        this.context.fillStyle = 'black';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(text, x, y);
    }

    private getNextDrawingIndex(): number {
        const maxIndex = (this.drawingInteractions || []).reduce((max, item) => Math.max(max, item.drawingIndex || 0), 0);
        return maxIndex + 1;
    }


    onVisibleChange($event: boolean) {

    }

    saveAssignmentDetails() {

    }
}
