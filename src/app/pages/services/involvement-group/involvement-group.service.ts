import {HttpClient} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {InvolvementGroup} from "./involvement-group.model";

@Injectable({
  providedIn: 'root'
})
export class InvolvementGroupService {

  constructor(private http: HttpClient) { }

  fetchAllInvolvementGroup(): Observable<InvolvementGroup[]>{
    return this.http.get<InvolvementGroup[]>("/api/involvement-group/list");
  }

  saveInvolvementGroup(involvementGroup: InvolvementGroup): Observable<InvolvementGroup>{
    return this.http.post<InvolvementGroup>("/api/involvement-group/save", involvementGroup).pipe(catchError((e:any) =>{
        return throwError(e);
    }));
  }
  deleteInvolvementGroup(id: string): Observable<void>{
    return this.http.delete<void>(`/api/involvement-group/${id}`);
  }

  fetchInvolvementGroupById(id: string): Observable<InvolvementGroup>{
    return this.http.get<InvolvementGroup>(`/api/involvement-group/${id}`);
  }

}
