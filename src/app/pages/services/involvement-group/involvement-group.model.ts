import {InvolvementUsers} from "../involvement-users/involvement-users.model";

export interface InvolvementGroup {
    id:string;
	name: string;
    involvementUsers: InvolvementUsers[];
}


