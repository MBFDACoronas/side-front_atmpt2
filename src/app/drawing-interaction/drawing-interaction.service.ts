import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DrawingInteraction} from "./drawing-interaction.model";
@Injectable({
  providedIn: 'root'
})
export class DrawingInteractionService {

  constructor(private http: HttpClient) { }

  fetchAllDrawingInteraction(): Observable<DrawingInteraction[]>{
    return this.http.get<DrawingInteraction[]>("/api/drawing-interaction/list");
  }

  saveDrawingInteraction(drawingInteraction: DrawingInteraction): Observable<DrawingInteraction>{
    return this.http.post<DrawingInteraction>("/api/drawing-interaction/save", drawingInteraction);
  }
  deleteDrawingInteraction(id: string): Observable<void>{
    return this.http.delete<void>(`/api/drawing-interaction/${id}`);
  }

  fetchDrawingInteractionById(id: string): Observable<DrawingInteraction>{
    return this.http.get<DrawingInteraction>(`/api/drawing-interaction/${id}`);
  }

}
