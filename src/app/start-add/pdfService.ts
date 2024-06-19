import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    private apiUrl = '/api/pdf';

    constructor(private http: HttpClient) {}

    extractImagesFromPdf(file: File): Observable<string[]> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<string[]>(`${this.apiUrl}/extract-images`, formData);
    }
}
