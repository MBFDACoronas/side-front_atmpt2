import {Component} from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
        <div class="footer clearfix">
            <img src="../assets/layout/images/logo-white.png"/>
            <span>PrimeFaces ATLANTIS</span>
            <a href="https://github.com/primefaces"><i class="fa fa-github"></i></a>
            <a href="https://www.facebook.com/groups/primefaces"><i class="fa fa-facebook"></i></a>
            <a href="http://twitter.com/primefaces"><i class="fa fa-twitter"></i></a>
        </div>
    `
})
export class AppFooter {

}