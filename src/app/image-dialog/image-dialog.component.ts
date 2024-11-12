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
import {Drawing} from "../drawing/drawing.model";

@Component({
    selector: 'app-image-dialog',
    templateUrl: './image-dialog.component.html',
    styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() imageUrl: any;
    @Input() type: string;
    @Output() imageLoaded = new EventEmitter<{ width: number, height: number }>();
    @ViewChild('imageCanvas', { static: true }) imageCanvas: ElementRef<HTMLCanvasElement>;
    private context: CanvasRenderingContext2D;
    private circles: { x: number, y: number, index: number }[] = [];
    @Input() drawingInteractions!: DrawingInteraction[];
    ngOnInit(): void {
        console.log("drawingInteractions", this.drawingInteractions);

    }

    ngAfterViewInit(): void {
        this.initCanvas();
        this.loadImage();
        // Use a setTimeout to ensure the image is loaded before drawing circles
        setTimeout(() => {
            this.drawingInteractions.forEach(item => {
                this.drawCircle(item.coordX, item.coordY, item.drawingIndex, false);
            });
        }, 100);
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
            // console.log('Image loaded:', image);
            canvas.width = image.width;
            canvas.height = image.height;
            this.context.clearRect(0, 0, canvas.width, canvas.height);
            this.context.drawImage(image, 0, 0);
            this.loadCircles();
            this.imageLoaded.emit({ width: image.width + 50, height: image.height + 50 });

        };
        image.onerror = (error) => {
            console.error('Image failed to load:', error);
        };
    }




    loadCircles(): void {
        // this.circles.forEach(circle => this.drawCircle(circle.x, circle.y, circle.index));
    }

    onCanvasClick(event: MouseEvent): void {
        const rect = this.imageCanvas.nativeElement.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const index = this.circles.length + 1;
        this.circles.push({ x, y, index });
        this.drawCircle(x, y, index);
    }


    drawCircle(x: number, y: number, index: number, addInteraction: boolean = true): void {
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

        // Only add a new DrawingInteraction if addInteraction is true
        if (addInteraction) {
            const drawingInteraction: DrawingInteraction = {
                coordX: x,
                coordY: y,
                drawingIndex: index,
                drawingType: this.type,
                drawing: "0", // Assuming you have the drawing ID available
                id: null, // Or generate a UUID if needed
            };
            this.drawingInteractions.push(drawingInteraction);
        }
    }


}
