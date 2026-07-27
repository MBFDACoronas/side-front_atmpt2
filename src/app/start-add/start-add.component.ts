import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {Assignment} from '../assignment/assignment.model';
import {AssignmentService} from '../assignment/assignment.service';
import {AuthService, ROLE_USER} from '../auth/auth.service';
import {User} from '../pages/services/user/user.model';
import {UserService} from '../pages/services/user/user.service';
import {Project, ProjectAddress, ProjectSector} from '../project/project.model';
import {ProjectService} from '../project/project.service';
import {Type} from '../type/type.model';
import {TypeService} from '../type/type.service';
import {PdfService} from './pdfService';

@Component({
    selector: 'app-start-add',
    templateUrl: './start-add.component.html',
    styleUrls: ['./start-add.component.scss']
})
export class StartAddComponent implements OnInit, OnChanges {
    @Input() embedded = false;
    @Input() project: Project;
    @Input() sector: ProjectSector;
    @Output() typeSelected = new EventEmitter<Type>();

    selectedFiles: { name: string, url: string }[] = [];
    displayCameraDialog = false;
    companyOptions: string[] = [];
    selectedCompany: string;
    projectOptions: Project[] = [];
    selectedProject: Project;
    addressOptions: ProjectAddress[] = [];
    selectedAddress: ProjectAddress;
    sectorOptions: ProjectSector[] = [];
    selectedSector: ProjectSector;
    typeOptions: any[] = [];
    selectedType: Type;
    allUsers: User[] = [];
    responsibleOptions: User[] = [];
    selectedResponsibleUser: User;
    theme = '';
    atv = '';
    description = '';
    images: string[] = [];
    selectedImage: string;
    displayImageDialog = false;
    dynamicWidth = '80vw';
    dynamicHeight = '80vh';

    constructor(
        private pdfService: PdfService,
        private http: HttpClient,
        private userService: UserService,
        private projectService: ProjectService,
        private typeService: TypeService,
        private assignmentService: AssignmentService,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        this.getCompanies();
        this.getUsers();
        this.getTypes();
        this.getProjects();
        this.applyInputProject();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['project'] || changes['sector']) {
            this.applyInputProject();
        }
    }

    buildAssignment(): Assignment | null {
        if (!this.selectedProject) {
            this.messageService.add({severity: 'warn', summary: 'Ülesanne', detail: 'Vali projekt'});
            return null;
        }

        if (!this.selectedType) {
            this.messageService.add({severity: 'warn', summary: 'Ülesanne', detail: 'Vali tüüp'});
            return null;
        }

        if (!this.selectedResponsibleUser) {
            this.messageService.add({severity: 'warn', summary: 'Ülesanne', detail: 'Vali vastutaja'});
            return null;
        }

        return {
            id: null,
            drawing: [],
            name: this.description || this.selectedType.name,
            project: this.selectedProject,
            address: this.selectedAddress,
            sector: this.selectedSector,
            typeTemplate: this.selectedType,
            type: this.selectedType.name,
            theme: this.theme,
            atv: this.atv,
            responsibleUser: this.selectedResponsibleUser,
            responsible: this.userLabel(this.selectedResponsibleUser),
            description: this.description
        } as Assignment;
    }

    saveStandaloneAssignment(): void {
        const assignment = this.buildAssignment();
        if (!assignment) {
            return;
        }

        this.assignmentService.saveAssignment(assignment).subscribe(saved => {
            this.router.navigate(['/assignment/' + saved.id]);
        });
    }

    onTypeChange(event: any): void {
        this.selectedType = event.value;
        this.typeSelected.emit(this.selectedType);
    }

    onProjectChange(event: any): void {
        this.selectedProject = event.value;
        this.configureProjectOptions();
    }

    onAddressChange(event: any): void {
        this.selectedAddress = event.value;
        this.sectorOptions = this.selectedAddress?.sectors || [];
        this.selectedSector = this.sectorOptions[0];
    }

    openCameraDialog(): void {
        this.displayCameraDialog = true;
    }

    closeCameraDialog(): void {
        this.displayCameraDialog = false;
    }

    onDialogShow(cameraDialog: any): void {
        const dialogElement = cameraDialog.containerViewChild.nativeElement;
        if (dialogElement.requestFullscreen) {
            dialogElement.requestFullscreen();
        }
    }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                if (file.type === 'application/pdf') {
                    this.handlePdf(file);
                } else if (file.type.startsWith('image/')) {
                    this.readImageFile(file);
                }
            }
        }
    }

    readImageFile(file: File): void {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.selectedFiles.push({name: file.name, url: e.target.result});
            this.images.push(e.target.result);
        };
        reader.readAsDataURL(file);
    }

    handlePdf(file: File): void {
        this.pdfService.extractImagesFromPdf(file).subscribe(
            imageUrls => this.images.push(...imageUrls),
            error => console.error('Error uploading PDF:', error)
        );
    }

    onImageClick(imageUrl: string): void {
        this.selectedImage = imageUrl;
        this.displayImageDialog = true;
    }

    onImageLoaded(event: { width: number, height: number }): void {
        this.dynamicWidth = `${event.width}px`;
        this.dynamicHeight = `${event.height}px`;
    }

    closeImageDialog(): void {
        this.displayImageDialog = false;
    }

    userLabel(user: User): string {
        return [user?.name, user?.lastName].filter(Boolean).join(' ') || user?.email || user?.code || '';
    }

    private getCompanies(): void {
        this.userService.fetchAllUser().subscribe(users => {
            this.companyOptions = Array.from(new Set((users || [])
                .map(user => user.company)
                .filter(company => !!company && !!company.trim())))
                .sort((a, b) => a.localeCompare(b));
        });
    }

    private getUsers(): void {
        this.userService.fetchAllUser().subscribe(users => {
            this.allUsers = users || [];
            this.configureResponsibleOptions();
        });
    }

    private getTypes(): void {
        this.typeService.fetchAllType().subscribe(types => {
            this.typeOptions = (types || []).map(type => ({
                ...type,
                displayName: `(${type.identifier || ''}) ${type.name || ''}`.trim()
            }));
            this.selectedType = this.typeOptions[0];
            if (this.selectedType) {
                this.typeSelected.emit(this.selectedType);
            }
        });
    }

    private getProjects(): void {
        const user = this.authService.currentUser;
        const request = user?.id
            ? this.projectService.fetchProjectsForUser(user.id)
            : this.projectService.fetchAllProject();

        request.subscribe(projects => {
            this.projectOptions = (projects || []).filter(project => project.valid !== false);
            if (!this.selectedProject && !this.project) {
                this.selectedProject = this.projectOptions[0];
                this.configureProjectOptions();
            }
        });
    }

    private applyInputProject(): void {
        if (!this.project) {
            return;
        }

        this.selectedProject = this.project;
        this.configureProjectOptions();
    }

    private configureProjectOptions(): void {
        this.addressOptions = this.selectedProject?.addresses || [];
        this.selectedAddress = this.sector
            ? this.addressOptions.find(address => (address.sectors || []).some(item => item.id === this.sector.id))
            : this.addressOptions[0];
        this.sectorOptions = this.selectedAddress?.sectors || [];
        this.selectedSector = this.sector || this.sectorOptions[0];
        this.configureResponsibleOptions();
    }

    private configureResponsibleOptions(): void {
        const projectUsers = (this.selectedProject?.users || []).filter(user => user.role === ROLE_USER);
        this.responsibleOptions = projectUsers.length
            ? projectUsers
            : this.allUsers.filter(user => user.role === ROLE_USER);
        this.selectedResponsibleUser = this.responsibleOptions[0];
    }
}
