import {Injectable} from "@angular/core";
import {HttpClient, HttpEvent} from "@angular/common/http";
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) {
  }

  upload(file: File, id:string): Observable<HttpEvent<any>> {

    let endpoint = "/api/drawings-file/get-file/save-file";
    const formData: FormData = new FormData();
    formData.set('file',file);
    formData.set('tableId',id);
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = (e) => {

      if (xhr.status === 200) {
        console.log('SUCCESS', xhr.responseText);
      } else {
        console.warn('request_error');
      }
    };

    xhr.open('POST', endpoint, true);
    xhr.send(formData);
    return null
  }
}
