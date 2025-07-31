import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Type} from "./type.model";



@Injectable({
  providedIn: 'root'
})
export class TypeService {

  constructor(private http: HttpClient) { }

  fetchAllType(): Observable<Type[]>{
    return this.http.get<Type[]>("/api/type/list");
  }

  saveType(type: Type): Observable<Type>{
    return this.http.post<Type>("/api/type/save", type);
  }
  deleteType(id: string): Observable<void>{
    return this.http.delete<void>(`/api/type/${id}`);
  }
  
  fetchTypeById(id: string): Observable<Type>{
    return this.http.get<Type>(`/api/type/${id}`);
  }
  
}
