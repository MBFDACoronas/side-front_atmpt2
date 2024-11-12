import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Drawing} from "./drawing.model";

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  constructor(private http: HttpClient) { }

  fetchAllDrawing(): Observable<Drawing[]>{
    return this.http.get<Drawing[]>("/api/drawing/list");
  }

  saveDrawing(drawing: Drawing): Observable<Drawing>{
      console.log("saveDrawing", drawing);
      const formData: FormData = new FormData();
      formData.append('name', drawing.name);
      formData.append('drawingId', drawing.id ||    '' );
      formData.append('assignmentId', drawing.assignment.id);
      if (drawing.imageFile) {
          formData.append('imageFile', drawing.imageFile);
          formData.append('imageFileString', drawing.imageUrl);
      }

    return this.http.post<Drawing>("/api/drawing/save", formData);


  }
  deleteDrawing(id: string): Observable<void>{
    return this.http.delete<void>(`/api/drawing/${id}`);
  }

  fetchDrawingById(id: string): Observable<Drawing>{
    return this.http.get<Drawing>(`/api/drawing/${id}`);
  }

}
