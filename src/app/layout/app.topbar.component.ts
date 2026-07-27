import { Component, ElementRef, ViewChild } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { AppSidebarComponent } from './app.sidebar.component';
import {AuthService} from '../auth/auth.service';
import {User} from '../pages/services/user/user.model';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent {

    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('searchinput') searchInput!: ElementRef;
    @ViewChild(AppSidebarComponent) appSidebar!: AppSidebarComponent;
    searchActive: boolean = false;
    loginDialogVisible = false;
    users: User[] = [];
    personalCode = '';
    loginError = '';
    currentUser$ = this.authService.currentUser$;

    constructor(public layoutService: LayoutService, public el: ElementRef, public authService: AuthService) { }
    activateSearch() {
        this.searchActive = true;
        setTimeout(() => {
            this.searchInput.nativeElement.focus();
        }, 100);
    }

    deactivateSearch() {
        this.searchActive = false;
    }
    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }
    
    onSidebarButtonClick() {
        this.layoutService.showSidebar();
    }

    openLoginDialog() {
        this.loginError = '';
        this.personalCode = '';
        this.authService.fetchUsers().subscribe(users => this.users = users || []);
        this.loginDialogVisible = true;
    }

    loginByPersonalCode() {
        this.loginError = '';
        this.authService.loginByCode(this.personalCode).subscribe(user => {
            if (!user) {
                this.loginError = 'Sellise isikukoodiga kasutajat ei leitud';
                return;
            }

            this.loginDialogVisible = false;
        });
    }

    loginAs(user: User) {
        this.authService.loginAs(user);
        this.loginDialogVisible = false;
    }

    logout() {
        this.authService.logout();
    }

    getUserDisplayName(user: User): string {
        return [user?.name, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Kasutaja';
    }

    getInitials(user: User | null): string {
        if (!user) {
            return '?';
        }

        return this.getUserDisplayName(user)
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }
}
