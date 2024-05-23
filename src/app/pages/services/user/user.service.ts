import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {User} from "./user.model";
import {Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  fetchAllUser(): Observable<User[]>{
    return this.http.get<User[]>("/api/user/list");
  }

  saveUser(user: User): Observable<User>{
    return this.http.post<User>("/api/user/save", user);
  }
  deleteUser(id: string): Observable<void>{
    return this.http.delete<void>(`/api/user/${id}`);
  }

  fetchUserById(id: string): Observable<User>{
    return this.http.get<User>(`/api/user/${id}`);
  }

}
