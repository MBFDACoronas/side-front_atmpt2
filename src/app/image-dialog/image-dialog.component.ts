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
import {DrawingInteractionService} from "../drawing-interaction/drawing-interaction.service";
import {MessageService} from "primeng/api";
import {Drawing} from "../drawing/drawing.model";
import {DrawingService} from "../drawing/drawing.service";
import {StartAddComponent} from "../start-add/start-add.component";
import {Type} from "../type/type.model";
import {AssignmentService} from "../assignment/assignment.service";

@Component({
    selector: 'app-image-dialog',
    templateUrl: './image-dialog.component.html',
    styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit, OnChanges, AfterViewInit {
    @Input() imageUrl: any;
    @Input() type: string;
    @Input() drawingId: string;
    @Input() drawing: Drawing;
    @Input() readOnly = false;
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
    private dragMode: 'pan' | 'marker' | null = null;
    private markerDragOffsetX = 0;
    private markerDragOffsetY = 0;
    selectedInteraction: DrawingInteraction | null = null;
    interactionDialogMode: 'create' | 'edit' = 'create';
    isSavingInteraction = false;
    private selectedInteractionSnapshot: DrawingInteraction | null = null;
    @Input() drawingInteractions!: DrawingInteraction[];
    @Input() assignmentStatusById: {[id: string]: string} = {};
    @ViewChild('assignmentForm') assignmentForm?: StartAddComponent;

    constructor(
        private drawingInteractionService: DrawingInteractionService,
        private drawingService: DrawingService,
        private assignmentService: AssignmentService,
        private messageService: MessageService,
    ) {
    }

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
        if (changes['assignmentStatusById'] && this.loadedImage) {
            this.redrawCanvas();
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
        if (!this.loadedImage || event.button !== 0) {
            return;
        }

        this.isDragging = true;
        this.hasDragged = false;
        this.pointerStartX = event.clientX;
        this.pointerStartY = event.clientY;

        if (this.readOnly) {
            this.dragMode = 'pan';
            this.dragStartOffsetX = this.offsetX;
            this.dragStartOffsetY = this.offsetY;
            (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
            return;
        }

        const imagePoint = this.getImagePoint(event);
        const hitInteraction = this.findInteractionAtPoint(imagePoint.x, imagePoint.y);

        if (hitInteraction) {
            this.dragMode = 'marker';
            this.selectedInteraction = hitInteraction;
            this.selectedInteractionSnapshot = this.cloneInteraction(hitInteraction);
            this.interactionDialogMode = 'edit';
            this.markerDragOffsetX = imagePoint.x - hitInteraction.coordX;
            this.markerDragOffsetY = imagePoint.y - hitInteraction.coordY;
        } else {
            this.dragMode = 'pan';
            this.dragStartOffsetX = this.offsetX;
            this.dragStartOffsetY = this.offsetY;
        }

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

        if (this.dragMode === 'marker' && this.selectedInteraction) {
            const imagePoint = this.getImagePoint(event);
            const canvas = this.imageCanvas.nativeElement;
            this.selectedInteraction.coordX = this.clamp(imagePoint.x - this.markerDragOffsetX, 0, canvas.width);
            this.selectedInteraction.coordY = this.clamp(imagePoint.y - this.markerDragOffsetY, 0, canvas.height);
            this.redrawCanvas();
            return;
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

        if (this.dragMode === 'marker') {
            this.dialogueVisible = true;
            this.dragMode = null;
            return;
        }

        if (this.dragMode === 'pan' && !this.hasDragged && !this.readOnly) {
            this.addMarkerFromPointer(event);
        }

        this.dragMode = null;
    }

    onPointerCancel(event: PointerEvent): void {
        if (!this.isDragging) {
            return;
        }

        this.isDragging = false;
        const target = event.currentTarget as HTMLElement;
        if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
        }

        if (this.dragMode === 'marker') {
            this.restoreSelectedInteraction();
            this.clearInteractionSelection();
            this.redrawCanvas();
        }

        this.dragMode = null;
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
        if (this.readOnly) {
            return;
        }

        if (!this.drawingInteractions) {
            this.drawingInteractions = [];
        }

        const point = this.getImagePoint(event);
        const x = point.x;
        const y = point.y;
        const canvas = this.imageCanvas.nativeElement;

        if (x < 0 || y < 0 || x > canvas.width || y > canvas.height) {
            return;
        }

        const index = this.getNextDrawingIndex(this.type);
        const drawingInteraction = this.createInteraction(x, y, index);
        this.drawingInteractions.push(drawingInteraction);
        this.selectedInteraction = drawingInteraction;
        this.selectedInteractionSnapshot = this.cloneInteraction(drawingInteraction);
        this.interactionDialogMode = 'create';
        this.dialogueVisible = true;
        this.redrawCanvas();
    }


    drawCircle(x: number, y: number, index: number, addInteraction: boolean = true): void {
        if (this.readOnly) {
            return;
        }

        if (addInteraction) {
            if (!this.drawingInteractions) {
                this.drawingInteractions = [];
            }

            const drawingInteraction = this.createInteraction(x, y, index);
            this.drawingInteractions.push(drawingInteraction);
        }

        this.redrawCanvas();
    }

    private redrawCanvas(): void {
        const canvas = this.imageCanvas.nativeElement;
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        if (!this.loadedImage) {
            return;
        }

        this.context.drawImage(this.loadedImage, 0, 0);
        (this.drawingInteractions || []).forEach(item => {
            this.drawCircleMarker(item);
        });
    }

    redrawInteractions(): void {
        this.redrawCanvas();
    }

    private drawCircleMarker(interaction: DrawingInteraction): void {
        const x = interaction.coordX;
        const y = interaction.coordY;
        const index = interaction.drawingIndex;
        const drawingType = interaction.drawingType || this.type;
        const text = `${drawingType || this.type}-${index}`;
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
        this.context.fillStyle = this.getMarkerColor(interaction);
        this.context.fill();
        this.context.closePath();

        // Draw the text inside the rectangle
        this.context.fillStyle = 'black';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(text, x, y);
    }

    private getNextDrawingIndex(drawingType: string = this.type, exclude?: DrawingInteraction): number {
        const maxIndex = (this.drawingInteractions || [])
            .filter(item => item !== exclude && (item.drawingType || this.type) === drawingType)
            .reduce((max, item) => Math.max(max, item.drawingIndex || 0), 0);
        return maxIndex + 1;
    }

    private getMarkerColor(interaction: DrawingInteraction): string {
        const assignmentId = this.getInteractionAssignmentId(interaction);
        const status = assignmentId ? this.assignmentStatusById?.[assignmentId] : null;
        if (status === 'APPROVED') {
            return '#22c55e';
        }
        if (status === 'WAITING_APPROVAL' || status === 'FINISHED') {
            return '#f97316';
        }
        return '#ef4444';
    }

    private getInteractionAssignmentId(interaction: DrawingInteraction): string {
        const assignment = interaction.assignment as any;
        return typeof assignment === 'string' ? assignment : assignment?.id;
    }

    private createInteraction(x: number, y: number, index: number): DrawingInteraction {
        return {
            coordX: x,
            coordY: y,
            drawingIndex: index,
            drawingType: this.type,
            drawing: this.getCurrentDrawingId() || "0",
            id: null,
        };
    }

    private getImagePoint(event: PointerEvent): { x: number, y: number } {
        const rect = this.imageCanvas.nativeElement.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) / this.zoom,
            y: (event.clientY - rect.top) / this.zoom,
        };
    }

    private findInteractionAtPoint(x: number, y: number): DrawingInteraction | null {
        const interactions = this.drawingInteractions || [];
        for (let i = interactions.length - 1; i >= 0; i--) {
            const bounds = this.getMarkerBounds(interactions[i]);
            if (x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom) {
                return interactions[i];
            }
        }

        return null;
    }

    private getMarkerBounds(interaction: DrawingInteraction): { left: number, right: number, top: number, bottom: number } {
        this.context.font = '12px bold Arial';
        const text = `${interaction.drawingType || this.type}-${interaction.drawingIndex}`;
        const padding = 10;
        const rectWidth = this.context.measureText(text).width + padding * 2;
        const rectHeight = 20;

        return {
            left: interaction.coordX - rectWidth / 2,
            right: interaction.coordX + rectWidth / 2,
            top: interaction.coordY - rectHeight / 2,
            bottom: interaction.coordY + rectHeight / 2,
        };
    }

    private cloneInteraction(interaction: DrawingInteraction): DrawingInteraction {
        return {...interaction};
    }

    private restoreSelectedInteraction(): void {
        if (this.selectedInteraction && this.selectedInteractionSnapshot) {
            Object.assign(this.selectedInteraction, this.selectedInteractionSnapshot);
        }
    }

    private clearInteractionSelection(): void {
        this.selectedInteraction = null;
        this.selectedInteractionSnapshot = null;
        this.interactionDialogMode = 'create';
        this.isSavingInteraction = false;
    }

    private removeSelectedInteraction(): void {
        if (!this.selectedInteraction || !this.drawingInteractions) {
            return;
        }

        const index = this.drawingInteractions.indexOf(this.selectedInteraction);
        if (index >= 0) {
            this.drawingInteractions.splice(index, 1);
        }
    }

    private normalizeInteraction(interaction: DrawingInteraction): void {
        const canvas = this.imageCanvas.nativeElement;
        interaction.coordX = this.clamp(Number(interaction.coordX) || 0, 0, canvas.width);
        interaction.coordY = this.clamp(Number(interaction.coordY) || 0, 0, canvas.height);
        interaction.drawingType = interaction.drawingType || this.type;
        interaction.drawingIndex = Math.max(1, Math.round(Number(interaction.drawingIndex) || this.getNextDrawingIndex(interaction.drawingType, interaction)));
        interaction.drawing = this.getInteractionDrawingId(interaction) || this.getCurrentDrawingId() || "0";
    }

    private getInteractionDrawingId(interaction: DrawingInteraction): string {
        const drawing = interaction.drawing as any;
        return this.getCurrentDrawingId() || (typeof drawing === 'string' ? drawing : drawing?.id);
    }

    private getCurrentDrawingId(): string {
        return this.drawingId || this.drawing?.id;
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(max, Math.max(min, value));
    }


    onVisibleChange($event: boolean) {
        if ($event) {
            this.dialogueVisible = true;
            return;
        }

        if (this.selectedInteraction) {
            this.cancelInteractionEdit();
            return;
        }

        this.dialogueVisible = false;
    }

    saveAssignmentDetails() {
        if (this.readOnly) {
            this.dialogueVisible = false;
            this.clearInteractionSelection();
            return;
        }

        if (!this.selectedInteraction) {
            this.dialogueVisible = false;
            return;
        }

        const interaction = this.selectedInteraction;
        this.normalizeInteraction(interaction);
        this.redrawCanvas();

        this.isSavingInteraction = true;
        if (this.interactionDialogMode === 'create' && this.assignmentForm) {
            const assignment = this.assignmentForm.buildAssignment();
            if (!assignment) {
                this.isSavingInteraction = false;
                return;
            }

            this.assignmentService.saveAssignment(assignment).subscribe({
                next: savedAssignment => {
                    interaction.assignment = savedAssignment.id;
                    this.assignmentStatusById[savedAssignment.id] = savedAssignment.status || 'UNFINISHED';
                    this.applyAssignmentNumberToInteraction(savedAssignment.number, interaction);
                    this.saveInteractionWithDrawing(interaction);
                },
                error: error => {
                    console.error('Error saving assignment:', error);
                    this.messageService.add({severity: 'error', summary: 'Salvestamine', detail: 'Ülesande salvestamine ebaõnnestus'});
                    this.isSavingInteraction = false;
                }
            });
            return;
        }

        this.saveInteractionWithDrawing(interaction);
    }

    private saveInteractionWithDrawing(interaction: DrawingInteraction): void {
        const drawingId = this.getInteractionDrawingId(interaction);
        if (!drawingId || drawingId === "0") {
            this.saveDrawingBeforeInteraction(interaction);
            return;
        }

        this.saveInteraction(interaction, drawingId);
    }

    onAssignmentTypeSelected(type: Type): void {
        if (!type || !this.selectedInteraction) {
            return;
        }

        const identifier = type.identifier || type.name || this.type;
        this.type = identifier;
        this.selectedInteraction.drawingType = identifier;
        if (this.interactionDialogMode === 'create') {
            this.selectedInteraction.drawingIndex = this.getNextDrawingIndex(identifier, this.selectedInteraction);
        }
        this.redrawCanvas();
    }

    private applyAssignmentNumberToInteraction(number: string, interaction: DrawingInteraction): void {
        const match = /^(.+)-(\d+)$/.exec(number || '');
        if (!match) {
            return;
        }

        interaction.drawingType = match[1];
        interaction.drawingIndex = Number(match[2]);
        this.redrawCanvas();
    }

    private saveDrawingBeforeInteraction(interaction: DrawingInteraction): void {
        if (!this.drawing) {
            this.dialogueVisible = false;
            this.clearInteractionSelection();
            return;
        }

        this.drawingService.saveDrawing(this.drawing).subscribe({
            next: (savedDrawing) => {
                this.drawing.id = savedDrawing.id;
                this.drawingId = savedDrawing.id;
                this.saveInteraction(interaction, savedDrawing.id);
            },
            error: (error) => {
                console.error('Error saving drawing before interaction:', error);
                this.messageService.add({severity: 'error', summary: 'Salvestamine', detail: 'Joonise salvestamine ebaonnestus'});
                this.isSavingInteraction = false;
            }
        });
    }

    private saveInteraction(interaction: DrawingInteraction, drawingId: string): void {
        interaction.drawing = drawingId;
        this.drawingInteractionService.saveDrawingInteraction(interaction).subscribe({
            next: (savedInteraction) => {
                Object.assign(interaction, savedInteraction);
                interaction.drawing = drawingId;
                this.messageService.add({severity: 'success', summary: 'Salvestamine', detail: 'Marker salvestatud'});
                this.dialogueVisible = false;
                this.clearInteractionSelection();
                this.redrawCanvas();
            },
            error: (error) => {
                console.error('Error saving drawing interaction:', error);
                this.messageService.add({severity: 'error', summary: 'Salvestamine', detail: 'Markeri salvestamine ebaonnestus'});
                this.isSavingInteraction = false;
            }
        });
    }

    cancelInteractionEdit(): void {
        if (this.interactionDialogMode === 'create') {
            this.removeSelectedInteraction();
        } else {
            this.restoreSelectedInteraction();
        }

        this.dialogueVisible = false;
        this.clearInteractionSelection();
        this.redrawCanvas();
    }
}
