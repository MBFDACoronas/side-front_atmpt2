import { Component } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    layout = 'steel';

    theme = 'steel';

    layoutMode = 'static';

    darkMenu = false;

    inputStyle = 'outlined';

    ripple: boolean;

    constructor(private primengConfig: PrimeNGConfig) {
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.ripple = true;
    }
}
