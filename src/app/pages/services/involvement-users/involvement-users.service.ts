import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {InvolvementUsers} from "./involvement-users.model";


@Injectable({
  providedIn: 'root'
})
export class InvolvementUsersService {

  constructor(private http: HttpClient) { }

  fetchAllInvolvementUsers(): Observable<InvolvementUsers[]>{
    return this.http.get<InvolvementUsers[]>("/api/involvement-users/list");
  }

  saveInvolvementUsers(involvementUsers: InvolvementUsers): Observable<InvolvementUsers>{
    return this.http.post<InvolvementUsers>("/api/involvement-users/save", involvementUsers);
  }
  deleteInvolvementUsers(id: string): Observable<void>{
    return this.http.delete<void>(`/api/involvement-users/${id}`);
  }

  fetchInvolvementUsersById(id: string): Observable<InvolvementUsers>{
    return this.http.get<InvolvementUsers>(`/api/involvement-users/${id}`);
  }

}
