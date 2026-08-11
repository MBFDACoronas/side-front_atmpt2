import {Drawing} from "../drawing/drawing.model";
import {Project, ProjectAddress, ProjectSector} from "../project/project.model";
import {Type} from "../type/type.model";
import {User} from "../pages/services/user/user.model";

export interface Assignment {
    id: string;
    drawing: Drawing[];
    number?: string;
    name: string;
    type?: string;
    typeTemplate?: Type;
    status?: string;
    theme?: string;
    atv?: string;
    responsible?: string;
    responsibleUser?: User;
    description?: string;
    project: Project;
    address?: ProjectAddress;
    sector?: ProjectSector;
}
