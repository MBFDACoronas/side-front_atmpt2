import {DrawingsFile} from "./drawings-file.model";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class DrawingsFileService {

  constructor(private http: HttpClient) { }

  fetchAllDrawingsFile(): Observable<DrawingsFile[]>{
    return this.http.get<DrawingsFile[]>("/api/drawings-file/list");
  }

  saveDrawingsFile(drawingsFile: DrawingsFile): Observable<DrawingsFile>{
    return this.http.post<DrawingsFile>("/api/drawings-file/save", drawingsFile);
  }
  deleteDrawingsFile(id: string): Observable<void>{
    return this.http.delete<void>(`/api/drawings-file/${id}`);
  }

  fetchDrawingsFileById(id: string): Observable<Blob>{

      return  this.http.get(`/api/drawings-file/get-file/${id}`, {withCredentials: true, responseType: "blob"});

  }

}
