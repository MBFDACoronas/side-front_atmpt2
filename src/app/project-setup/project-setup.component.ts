import {Component, OnDestroy, OnInit} from '@angular/core';
import {MessageService} from 'primeng/api';
import {Subscription, finalize} from 'rxjs';
import {AuthService, ROLE_ADMIN, ROLE_PEAADMIN, ROLE_USER} from '../auth/auth.service';
import {Project, ProjectAddress, ProjectSector} from '../project/project.model';
import {ProjectService} from '../project/project.service';
import {User} from '../pages/services/user/user.model';
import {UserService} from '../pages/services/user/user.service';

@Component({
    selector: 'app-project-setup',
    templateUrl: './project-setup.component.html',
    styleUrls: ['./project-setup.component.scss']
})
export class ProjectSetupComponent implements OnInit, OnDestroy {
    projects: Project[] = [];
    filteredProjects: Project[] = [];
    selectedProject: Project | null = null;
    selectedAddress: ProjectAddress | null = null;
    adminOptions: User[] = [];
    userOptions: User[] = [];
    selectedAdministratorIds: string[] = [];
    selectedUserIds: string[] = [];
    searchTerm = '';
    loading = false;
    saving = false;
    currentUser: User | null = null;

    addressDialogVisible = false;
    addressDraft: ProjectAddress = this.createAddress();
    editingAddressIndex: number | null = null;

    sectorDialogVisible = false;
    sectorDraft: ProjectSector = this.createSector();
    editingSectorIndex: number | null = null;

    private authSubscription?: Subscription;

    constructor(
        private projectService: ProjectService,
        private userService: UserService,
        private authService: AuthService,
        private messageService: MessageService
    ) {
    }

    ngOnInit(): void {
        this.authSubscription = this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.fetchProjects();
        });
        this.fetchAdmins();
    }

    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }

    get canManageProjects(): boolean {
        return this.currentUser?.role === ROLE_PEAADMIN;
    }

    get canManageSelectedProject(): boolean {
        return this.currentUser?.role === ROLE_PEAADMIN
            || (this.currentUser?.role === ROLE_ADMIN && !!this.selectedProject);
    }

    get canAssignUsers(): boolean {
        return this.currentUser?.role === ROLE_PEAADMIN || this.currentUser?.role === ROLE_ADMIN;
    }

    fetchProjects(selectProjectId?: string): void {
        this.loading = true;
        const request = this.currentUser?.id
            ? this.projectService.fetchProjectsForUser(this.currentUser.id)
            : this.projectService.fetchAllProject();

        request
            .pipe(finalize(() => this.loading = false))
            .subscribe(projects => {
                this.projects = (projects || []).map(project => this.normalizeProject(project));
                this.filterProjects();
                const selected = selectProjectId
                    ? this.projects.find(project => project.id === selectProjectId)
                    : this.filteredProjects[0];
                this.selectProject(selected || null);
            });
    }

    filterProjects(): void {
        const query = this.searchTerm.trim().toLowerCase();
        this.filteredProjects = query
            ? this.projects.filter(project => (project.projectName || '').toLowerCase().includes(query))
            : [...this.projects];
    }

    selectProject(project: Project | null): void {
        this.selectedProject = project ? this.cloneProject(project) : null;
        this.selectedAddress = this.selectedProject?.addresses?.[0] || null;
        this.selectedAdministratorIds = this.selectedProject?.administrators?.map(user => user.id).filter(Boolean) || [];
        this.selectedUserIds = this.selectedProject?.users?.map(user => user.id).filter(Boolean) || [];
    }

    createNewProject(): void {
        if (!this.canManageProjects) {
            return;
        }

        this.selectedProject = {
            projectName: '',
            valid: true,
            addresses: [],
            administrators: []
        };
        this.selectedAddress = null;
        this.selectedAdministratorIds = [];
    }

    saveProject(): void {
        if (!this.selectedProject || !this.canManageSelectedProject) {
            return;
        }

        const projectName = (this.selectedProject.projectName || '').trim();
        if (!projectName) {
            this.messageService.add({severity: 'warn', summary: 'Projekt', detail: 'Sisesta projekti nimi'});
            return;
        }

        const projectToSave: Project = {
            ...this.selectedProject,
            projectName,
            administrators: this.selectedAdministratorIds
                .map(id => this.adminOptions.find(user => user.id === id))
                .filter(Boolean) as User[],
            users: this.selectedUserIds
                .map(id => this.userOptions.find(user => user.id === id))
                .filter(Boolean) as User[]
        };

        this.saving = true;
        this.projectService.saveProject(projectToSave)
            .pipe(finalize(() => this.saving = false))
            .subscribe(savedProject => {
                this.messageService.add({severity: 'success', summary: 'Projekt', detail: 'Projekt salvestatud'});
                this.fetchProjects(savedProject.id);
            });
    }

    deleteSelectedProject(): void {
        if (!this.selectedProject?.id || !this.canManageProjects) {
            return;
        }

        if (!window.confirm('Kas kustutada valitud projekt?')) {
            return;
        }

        this.projectService.deleteProject(this.selectedProject.id).subscribe(() => {
            this.messageService.add({severity: 'success', summary: 'Projekt', detail: 'Projekt kustutatud'});
            this.fetchProjects();
        });
    }

    openAddressDialog(address?: ProjectAddress): void {
        if (!this.selectedProject || !this.canManageSelectedProject) {
            return;
        }

        this.editingAddressIndex = address ? this.selectedProject.addresses!.indexOf(address) : null;
        this.addressDraft = address ? {...address, sectors: [...(address.sectors || [])]} : this.createAddress();
        this.addressDialogVisible = true;
    }

    saveAddress(): void {
        if (!this.selectedProject) {
            return;
        }

        const addresses = this.selectedProject.addresses || [];
        const address = {
            ...this.addressDraft,
            name: (this.addressDraft.name || '').trim(),
            address: (this.addressDraft.address || '').trim(),
            sectors: this.addressDraft.sectors || []
        };

        if (!address.name) {
            this.messageService.add({severity: 'warn', summary: 'Aadress', detail: 'Sisesta aadressi nimetus'});
            return;
        }

        if (this.editingAddressIndex === null) {
            addresses.push({...address, sortOrder: addresses.length + 1});
        } else {
            addresses[this.editingAddressIndex] = address;
        }

        this.selectedProject.addresses = addresses;
        this.selectedAddress = this.editingAddressIndex === null ? addresses[addresses.length - 1] : addresses[this.editingAddressIndex];
        this.addressDialogVisible = false;
    }

    removeAddress(address: ProjectAddress): void {
        if (!this.selectedProject || !this.canManageSelectedProject || !window.confirm('Kas kustutada valitud aadress?')) {
            return;
        }

        this.selectedProject.addresses = (this.selectedProject.addresses || []).filter(item => item !== address);
        this.selectedAddress = this.selectedProject.addresses[0] || null;
    }

    openSectorDialog(sector?: ProjectSector): void {
        if (!this.selectedAddress || !this.canManageSelectedProject) {
            return;
        }

        this.editingSectorIndex = sector ? this.selectedAddress.sectors!.indexOf(sector) : null;
        this.sectorDraft = sector ? {...sector} : this.createSector();
        this.sectorDialogVisible = true;
    }

    saveSector(): void {
        if (!this.selectedAddress) {
            return;
        }

        const sectors = this.selectedAddress.sectors || [];
        const sector = {
            ...this.sectorDraft,
            name: (this.sectorDraft.name || '').trim(),
            code: (this.sectorDraft.code || '').trim()
        };

        if (!sector.name) {
            this.messageService.add({severity: 'warn', summary: 'Sektor', detail: 'Sisesta sektori nimetus'});
            return;
        }

        if (this.editingSectorIndex === null) {
            sectors.push({...sector, sortOrder: sectors.length + 1});
        } else {
            sectors[this.editingSectorIndex] = sector;
        }

        this.selectedAddress.sectors = sectors;
        this.sectorDialogVisible = false;
    }

    removeSector(sector: ProjectSector): void {
        if (!this.selectedAddress || !this.canManageSelectedProject || !window.confirm('Kas kustutada valitud sektor?')) {
            return;
        }

        this.selectedAddress.sectors = (this.selectedAddress.sectors || []).filter(item => item !== sector);
    }

    userLabel(user: User): string {
        return [user.name, user.lastName].filter(Boolean).join(' ') || user.email || user.code;
    }

    private fetchAdmins(): void {
        this.userService.fetchAllUser().subscribe(users => {
            this.adminOptions = (users || []).filter(user => user.role === ROLE_ADMIN);
            this.userOptions = (users || []).filter(user => user.role === ROLE_USER);
        });
    }

    private normalizeProject(project: Project): Project {
        return {
            ...project,
            valid: project.valid !== false,
            addresses: (project.addresses || []).map(address => ({
                ...address,
                sectors: address.sectors || []
            })),
            administrators: project.administrators || [],
            users: project.users || []
        };
    }

    private cloneProject(project: Project): Project {
        return JSON.parse(JSON.stringify(project));
    }

    private createAddress(): ProjectAddress {
        return {
            name: '',
            address: '',
            sectors: []
        };
    }

    private createSector(): ProjectSector {
        return {
            name: '',
            code: '',
            valid: true
        };
    }
}
