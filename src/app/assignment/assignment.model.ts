import {Drawing} from "../drawing/drawing.model";
import {Project} from "../project/project.model";

export interface Assignment {
    id: string;
    drawing: Drawing[];
	name: string;
    project: Project;
}


