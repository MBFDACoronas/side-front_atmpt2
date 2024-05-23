import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {ClassifierElement} from "./elements.model";

@Injectable({
  providedIn: 'root'
})
export class ElementsService {

  constructor(private http: HttpClient) {
  }

  fetchAllElements(): Observable<ClassifierElement[]> {
    return this.http.get<ClassifierElement[]>('/api/elements-all');
  }

  fetchElementsByGroupType(groupType: string): Observable<ClassifierElement[]> {
    return this.http.get<ClassifierElement[]>('/api/elements/'+groupType);
  }
}
