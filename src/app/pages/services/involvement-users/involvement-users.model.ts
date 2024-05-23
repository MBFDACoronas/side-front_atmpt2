import {User} from "../user/user.model";
import {ClassifierElement} from "../elements/elements.model";

export interface InvolvementUsers {
    id:string;
    involvementGroupId:string ;
    rights: string;
    user:User ;
    userId:string ;
    drawingsRights: ClassifierElement
}


