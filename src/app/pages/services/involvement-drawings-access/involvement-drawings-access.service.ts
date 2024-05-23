import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {InvolvementDrawingsAccess} from "./involvement-drawings-access.model";

@Injectable({
  providedIn: 'root'
})
export class InvolvementDrawingsAccessService {

  constructor(private http: HttpClient) { }

  fetchAllInvolvementDrawingsAccess(): Observable<InvolvementDrawingsAccess[]>{
    return this.http.get<InvolvementDrawingsAccess[]>("/api/involvement-drawings-access/list");
  }

  saveInvolvementDrawingsAccess(involvementDrawingsAccess: InvolvementDrawingsAccess): Observable<InvolvementDrawingsAccess>{
    return this.http.post<InvolvementDrawingsAccess>("/api/involvement-drawings-access/save", involvementDrawingsAccess);
  }
  deleteInvolvementDrawingsAccess(id: string): Observable<void>{
    return this.http.delete<void>(`/api/involvement-drawings-access/${id}`);
  }

  fetchInvolvementDrawingsAccessById(id: string): Observable<InvolvementDrawingsAccess>{
    return this.http.get<InvolvementDrawingsAccess>(`/api/involvement-drawings-access/${id}`);
  }

}
