import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subscription } from 'rxjs';

const SUCCESS_MESSAGE_TITLE_KEY = 'MESSAGE.SUCCESS';
const INFO_MESSAGE_TITLE_KEY = 'MESSAGE.INFO';
const WARNING_MESSAGE_TITLE_KEY = 'MESSAGE.WARNING';
const ERROR_MESSAGE_TITLE_KEY = 'MESSAGE.ERROR';

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {

    subscriptions: Subscription[] = [];

    toasterOptions = {
        progressBar: true,
        preventDuplicates: true,
        enableHtml: true
    };

    constructor(
        private toastr: ToastrService,
        private translateServ: TranslateService
    ) { }

    /**
     * Displays a success message notification
     * @param labelOrText Label of translation text to use OR just the text to display
     * (that is, if Angular doesn't find a translation text with such label, it will just show the text itself)
     * @param parameterMap Object with parameters to use within the translation text
     */
    displaySuccessMessage(labelOrText: string, parameterMap: any = {}): void {
        // this.addSubscriptionToList(
            // this.translateServ.get([SUCCESS_MESSAGE_TITLE_KEY, labelOrText], parameterMap).subscribe((labels) => {
            //     const keys = Object.keys(labels);
                // const messageText = (keys.length === 2 ? ` ${labelOrText[keys[1]]}` : '');
                // const messageTitle = labels[keys[0]];
                this.toastr.success("messageText", "messageTitle", this.toasterOptions)
            // })
        // );
    }

    /**
     * Displays an info message notification
     * @param labelOrText Label of translation text to use OR just the text to display
     * (that is, if Angular doesn't find a translation text with such label, it will just show the text itself)
     * @param parameterMap Object with parameters to use within the translation text
     */
    displayInfoMessage(labelOrText: string, parameterMap: any = {}): void {
        this.addSubscriptionToList(
            this.translateServ.get([INFO_MESSAGE_TITLE_KEY, labelOrText], parameterMap).subscribe((labels) => {
                const keys = Object.keys(labels);
                const messageText = (keys.length === 2 ? ` ${labels[keys[1]]}` : '');
                const messageTitle = labels[keys[0]];
                this.toastr.info(messageText, messageTitle, this.toasterOptions);
            })
        );
    }

    /**
     * Displays a warning message notification
     * (that is, if Angular doesn't find a translation text with such label, it will just show the text itself)
     * @param labelText
     * @param parameterMap Object with parameters to use within the translation text
     */
    displayWarningMessage(labelText: string, parameterMap: any = {}): void {
        this.addSubscriptionToList(
            this.translateServ.get([WARNING_MESSAGE_TITLE_KEY, labelText], parameterMap).subscribe((labels) => {
                const keys = Object.keys(labels);
                const messageText = (keys.length === 2 ? ` ${labels[keys[1]]}` : '');
                const messageTitle = labels[keys[0]];
                this.toastr.warning(messageText, messageTitle, this.toasterOptions);
            })
        );
    }

    /**
     * Displays an error message notification. Allows multiple texts which will then be separated by a line break (useful for error details)
     * @param labelOrArrayOfLabels Labels of translation text to use OR just the texts to display. They can be mixed!
     * (for example, an array where first element is a label and second element raw text to display)
     * @param parameterMap Object with parameters to use within the translation text
     */
    displayErrorMessage(labelOrArrayOfLabels: string | string[], parameterMap: any = {}): void {
        const labelsOrTexts = Array.isArray(labelOrArrayOfLabels) ? [ERROR_MESSAGE_TITLE_KEY, ...labelOrArrayOfLabels] : [ERROR_MESSAGE_TITLE_KEY, labelOrArrayOfLabels];
        this.addSubscriptionToList(
            this.translateServ.get(labelsOrTexts, parameterMap).subscribe((labels) => {
                const keys = Object.keys(labels);
                let messageText = '';
                let titleIndex = 0;
                keys.forEach((key, i) => {
                    if (labelsOrTexts.indexOf(key) === 0) {
                        titleIndex = i;
                    } else {
                        messageText += `${labels[key]}</br> `;
                    }
                });
                const messageTitle = labels[keys[titleIndex]];
                this.toastr.error(messageText, messageTitle, this.toasterOptions);
            })
        );
    }

    /**
     * Handles deciding whether to show an error-specific or a generic error message
     * @param error
     * @param errorLabelPrefix If the backend has sent an error code, then the app will try to find an error text
     *   from translation service that's prefixed with this prefix and display that error message
     */
    handleErrorMessaging(error: HttpErrorResponse, errorLabelPrefix: string) {
        if (error.error && error.error.errorCode && error.error.errorCode !== 'UNKNOWN_ERROR') {
            this.displayErrorMessage(`${errorLabelPrefix}.${error.error.errorCode}`);
        } else {
            this.displayErrorMessage([`${errorLabelPrefix}.UNKNOWN_ERROR`, error.message]);
        }
    }

    handleRihakeError(label: string, data?: string) {
        const labels = [label];
        if (data) {
            labels[1] = data;
        }
        this.displayErrorMessage(labels);
    }

    async translate(label: string): Promise<any> {
        try {
            const translation = await firstValueFrom(this.translateServ.get([label]));
            return translation[label];
        } catch (error) {
            this.displayErrorMessage('ERROR.TRANSLATE_ERROR');
        }
    }

    ngOnDestroy(): void {
        this.unsubscribeAllFromList();
    }

    addSubscriptionToList(subscription: any): void {
        this.subscriptions.push(subscription);
    }

    unsubscribeAllFromList(): void {
        this.subscriptions.forEach((subscription) => {
            if (subscription !== undefined) {
                subscription.unsubscribe();
            }
        });
    }
}
