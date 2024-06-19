import {Drawing} from "../drawing/drawing.model";

export interface DrawingInteraction {
    id: string;

    drawing: string;
    coordX: number;
    coordY: number;
    drawingType: string;
    drawingIndex: number;


}


