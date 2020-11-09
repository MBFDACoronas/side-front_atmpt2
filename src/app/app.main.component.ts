import {Component, AfterViewInit, Renderer2, OnDestroy, OnInit} from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';

@Component({
    selector: 'app-main',
    templateUrl: './app.main.component.html'
})
export class AppMainComponent implements AfterViewInit, OnDestroy, OnInit {

    activeTabIndex: number;

    sidebarActive: boolean;

    layoutMode = 'static';

    darkMenu = false;

    topbarMenuActive: boolean;

    sidebarClick: boolean;

    topbarItemClick: boolean;

    activeTopbarItem: any;

    documentClickListener: any;

    inputStyle = 'outlined';

    ripple: boolean;

    configActive: boolean;

    configClick: boolean;

    constructor(public renderer: Renderer2, private primengConfig: PrimeNGConfig) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
    }

    ngAfterViewInit() {
        this.documentClickListener = this.renderer.listen('body', 'click', (event) => {
            if (!this.topbarItemClick) {
                this.activeTopbarItem = null;
                this.topbarMenuActive = false;
            }

            if (!this.sidebarClick && (this.overlay || !this.isDesktop())) {
                this.sidebarActive = false;
            }

            if (this.configActive && !this.configClick) {
                this.configActive = false;
            }

            this.configClick = false;
            this.topbarItemClick = false;
            this.sidebarClick = false;
        });
    }

    onTabClick(event, index: number) {
        if (this.activeTabIndex === index) {
            this.sidebarActive = !this.sidebarActive;
        } else {
            this.activeTabIndex = index;
            this.sidebarActive = true;
        }

        event.preventDefault();
    }

    closeSidebar(event) {
        this.sidebarActive = false;
        event.preventDefault();
    }

    onSidebarClick(event) {
        this.sidebarClick = true;
    }

    onTopbarMenuButtonClick(event) {
        this.topbarItemClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;

        event.preventDefault();
    }

    onTopbarItemClick(event, item) {
        this.topbarItemClick = true;

        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null; } else {
            this.activeTopbarItem = item; }

        event.preventDefault();
    }

    onTopbarSubItemClick(event) {
        event.preventDefault();
    }

    onRippleChange(event) {
        this.ripple = event.checked;
    }

    onConfigClick(event) {
        this.configClick = true;
    }

    get overlay(): boolean {
        return this.layoutMode === 'overlay';
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }

}
