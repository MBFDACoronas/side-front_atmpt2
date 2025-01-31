import {DrawingInteraction} from "../drawing-interaction/drawing-interaction.model";
import {Assignment} from "../assignment/assignment.model";

export interface Drawing {
    id: string;
    imageFile?: File;
    imageFileRequestData: string;
    imageUrl?: string;
    name: string;
    drawingInteraction: DrawingInteraction[];
    assignment: Assignment;
}


