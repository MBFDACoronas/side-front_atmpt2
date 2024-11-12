import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import {AppInjector} from "../app.injector.service";
import {NotificationService} from "./notification.service";

@Component({
  selector: 'app-notification',
  template: ''
})
export class NotificationComponent {
  // protected translateServ!: TranslateService;
  // protected notificationService!: NotificationService;

    constructor(
        protected translateServ: TranslateService,
        protected notificationService: NotificationService
    ) {}
  /**
   * Displays a success message notification
   * @param labelOrText Label of translation text to use OR just the text to display
   * (that is, if Angular doesn't find a translation text with such label, it will just show the text itself)
   * @param parameterMap Object with parameters to use within the translation text
   */
  displaySuccessMessage(labelOrText: string, parameterMap: any = {}): void {
    this.notificationService.displaySuccessMessage(labelOrText, parameterMap);
  }

  /**
   * Displays an info message notification
   * @param labelOrText Label of translation text to use OR just the text to display
   * (that is, if Angular doesn't find a translation text with such label, it will just show the text itself)
   * @param parameterMap Object with parameters to use within the translation text
   */
  displayInfoMessage(labelOrText: string, parameterMap: any = {}): void {
    this.notificationService.displayInfoMessage(labelOrText, parameterMap);
  }
  /**
   * Displays a warning message notification
   * (that is, if Angular doesn't find a translation text with such label, it will just show the text itself)
   * @param labelText
   * @param parameterMap Object with parameters to use within the translation text
   */
  displayWarningMessage(labelText: string, parameterMap: any = {}): void {
    this.notificationService.displayWarningMessage(labelText, parameterMap);
  }

  /**
   * Displays an error message notification. Allows multiple texts which will then be separated by a line break (useful for error details)
   * @param labelOrArrayOfLabels Labels of translation text to use OR just the texts to display. They can be mixed!
   * (for example, an array where first element is a label and second element raw text to display)
   * @param parameterMap Object with parameters to use within the translation text
   */
  displayErrorMessage(labelOrArrayOfLabels: string | string[], parameterMap: any = {}): void {
    this.notificationService.displayErrorMessage(labelOrArrayOfLabels, parameterMap);
  }

  /**
   * Handles deciding whether to show an error-specific or a generic error message
   * @param error
   * @param errorLabelPrefix If the backend has sent an error code, then the app will try to find an error text
   *   from translation service that's prefixed with this prefix and display that error message
   */
  handleErrorMessaging(error: HttpErrorResponse, errorLabelPrefix: string) {
    this.notificationService.handleErrorMessaging(error, errorLabelPrefix);
  }

  handleCustomErrorMessaging(label: string, data?: string) {
    this.notificationService.handleRihakeError(label, data);
  }

  toLocalDate(date: Date) {
    return moment(date).format('YYYY-MM-DD');
  }

  isEmptyObject(obj: any) {
    return (obj && (Object.keys(obj).length === 0));
  }

  fixTextToNull(value: string) {
    if (value === '') {
      return null;
    }
    return value;
  }

}
