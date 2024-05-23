import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {InvolvementDocumentAccess} from "./involvement-document-access.model";
import {Injectable} from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class InvolvementDocumentAccessService {

  constructor(private http: HttpClient) { }

  fetchAllInvolvementDocumentAccess(): Observable<InvolvementDocumentAccess[]>{
    return this.http.get<InvolvementDocumentAccess[]>("/api/involvement-document-access/list");
  }

  saveInvolvementDocumentAccess(involvementDocumentAccess: InvolvementDocumentAccess): Observable<InvolvementDocumentAccess>{
    return this.http.post<InvolvementDocumentAccess>("/api/involvement-document-access/save", involvementDocumentAccess);
  }
  deleteInvolvementDocumentAccess(id: string): Observable<void>{
    return this.http.delete<void>(`/api/involvement-document-access/${id}`);
  }

  fetchInvolvementDocumentAccessById(id: string): Observable<InvolvementDocumentAccess>{
    return this.http.get<InvolvementDocumentAccess>(`/api/involvement-document-access/${id}`);
  }

}
