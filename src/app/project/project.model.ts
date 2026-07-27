import {User} from '../pages/services/user/user.model';

export interface Project {
    id?: string;
    projectName: string;
    valid: boolean;
    addresses?: ProjectAddress[];
    administrators?: User[];
    users?: User[];
}

export interface ProjectAddress {
    id?: string;
    name: string;
    address: string;
    sortOrder?: number;
    sectors?: ProjectSector[];
}

export interface ProjectSector {
    id?: string;
    name: string;
    code?: string;
    valid: boolean;
    sortOrder?: number;
}
