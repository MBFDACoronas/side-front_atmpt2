import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Assignment} from "./assignment.model";


@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  constructor(private http: HttpClient) { }

  fetchAllAssignment(): Observable<Assignment[]>{
    return this.http.get<Assignment[]>("/api/assignment/list");
  }

  fetchAllAssignmentsByProjectId(projectId: string): Observable<Assignment[]>{
    return this.http.get<Assignment[]>(`/api/assignment/list-project/${projectId}`);
  }

  saveAssignment(assignment: Assignment): Observable<Assignment>{
    return this.http.post<Assignment>("/api/assignment/save", assignment);
  }
  deleteAssignment(id: string): Observable<void>{
    return this.http.delete<void>(`/api/assignment/${id}`);
  }

  fetchAssignmentById(id: string): Observable<Assignment>{
    return this.http.get<Assignment>(`/api/assignment/${id}`);
  }
    getImage(drawingId: string): Observable<string> {
        return this.http.get(`api/drawing/${drawingId}/image`, { responseType: 'text' });
    }
}
