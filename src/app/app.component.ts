import {Component, OnInit} from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

    menuMode = 'overlay';

    layout = 'steel';

    theme = 'steel';

    inputStyle = 'outlined';

    ripple: boolean;

    colorScheme = 'dark';

    constructor(private primengConfig: PrimeNGConfig) {
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.ripple = true;
    }
}
