import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Project} from "./project.model";
import {Injectable} from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient) { }

  fetchAllProject(): Observable<Project[]>{
    return this.http.get<Project[]>("/api/project/list");
  }

  saveProject(project: Project): Observable<Project>{
    return this.http.post<Project>("/api/project/save", project);
  }
  deleteProject(id: string): Observable<void>{
    return this.http.delete<void>(`/api/project/${id}`);
  }

  fetchProjectById(id: string): Observable<Project>{
    return this.http.get<Project>(`/api/project/${id}`);
  }

}
