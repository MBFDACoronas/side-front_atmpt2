import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DrawingsFolder} from "./drawings-folder.model";


@Injectable({
  providedIn: 'root'
})
export class DrawingsFolderService {

  constructor(private http: HttpClient) { }

  fetchAllDrawingsFolder(): Observable<DrawingsFolder[]>{
    return this.http.get<DrawingsFolder[]>("/api/drawings-folder/list");
  }

  saveDrawingsFolder(drawingsFolder: DrawingsFolder): Observable<DrawingsFolder>{
    return this.http.post<DrawingsFolder>("/api/drawings-folder/save", drawingsFolder);
  }
  deleteDrawingsFolder(id: string): Observable<void>{
    return this.http.delete<void>(`/api/drawings-folder/${id}`);
  }

  fetchDrawingsFolderById(id: string): Observable<DrawingsFolder>{
    return this.http.get<DrawingsFolder>(`/api/drawings-folder/${id}`);
  }

}
