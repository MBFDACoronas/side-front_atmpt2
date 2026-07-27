import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {Assignment} from '../assignment/assignment.model';
import {AssignmentService} from '../assignment/assignment.service';
import {AuthService, ROLE_USER} from '../auth/auth.service';
import {TableColumn} from '../demo/shared/table-column.interface';
import {Project} from '../project/project.model';

const ASSIGNMENT_COLUMNS: TableColumn[] = [
    {name: 'Nr.', value: 'number', width: '110px', sort: true, filter: {type: 'contains'}},
    {name: 'Tüüp', value: 'type', width: '160px', sort: true, filter: {type: 'contains'}},
    {name: 'Modifitseerimise kuupäev', value: 'updstamp', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Loomise kuupäev', value: 'created', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Tööpakett', value: 'workPackage', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Katse-/kontrollkava', value: 'name', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Teema', value: 'theme', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Tähtaeg', value: 'deadline', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Vastutav', value: 'responsible', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'ATV', value: 'atv', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'joonis', value: 'drawingName', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Tase', value: 'level', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Ruum', value: 'ruum', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Ruudustiku jooned', value: 'lines', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: 'Ehitis', value: 'building', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: '3D objekti kategooria', value: '3dCategory', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: '3D objekt', value: '3dObject', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: '2D objekti kategooria', value: '2dCategory', width: '180px', sort: true, filter: {type: 'contains'}},
    {name: '2D-objekt', value: '2dObject', width: '180px', sort: true, filter: {type: 'contains'}}
];

@Component({
    selector: 'app-all-assignments',
    templateUrl: './all-assignments.component.html',
    styleUrl: './all-assignments.component.scss'
})
export class AllAssignmentsComponent implements OnInit, OnDestroy {
    projectList: any[] = [];
    selectedTableColumns: TableColumn[] = ASSIGNMENT_COLUMNS;
    loading = false;
    selectedRow: any;
    selectedProjectId: string;
    selectedProject: Project;
    isRegularUser = false;
    private authSubscription?: Subscription;

    constructor(
        private assignmentService: AssignmentService,
        private router: Router,
        private authService: AuthService
    ) {
    }

    ngOnInit(): void {
        this.authSubscription = this.authService.currentUser$.subscribe(user => {
            this.isRegularUser = user?.role === ROLE_USER;
            this.loadAssignments();
        });
    }

    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }

    loadAssignments(): void {
        const user = this.authService.currentUser;
        const request = user?.id
            ? this.assignmentService.fetchVisibleAssignmentsForUser(user.id)
            : this.assignmentService.fetchAllAssignment();

        request.subscribe(assignments => this.projectList = this.mapAssignmentRows(assignments));
    }

    openDialog(data: any): void {
        this.selectedRow = data;
    }

    rowEditInit(event: any): void {
    }

    delete(event: any): void {
    }

    createAssignment(projectId: string): void {
        if (!this.selectedProject) {
            return;
        }

        const assignment = {
            project: this.selectedProject
        } as Assignment;

        this.assignmentService.saveAssignment(assignment).subscribe(res => {
            this.router.navigate(['/assignment/' + res.id]);
        });
    }

    modifyAssignment(): void {
        if (!this.selectedRow) {
            return;
        }

        this.router.navigate(['/assignment/' + this.selectedRow.id]);
    }

    projectSelected(project: Project): void {
        this.selectedProject = project;
        if (!this.selectedProject?.id) {
            return;
        }

        this.assignmentService.fetchAllAssignmentsByProjectId(this.selectedProject.id).subscribe(assignments => {
            this.projectList = this.mapAssignmentRows(assignments);
        });
    }

    private mapAssignmentRows(assignments: Assignment[]): any[] {
        return (assignments || []).map(assignment => ({
            ...assignment,
            number: assignment.number || assignment.id,
            type: assignment.type || assignment.typeTemplate?.name || '',
            responsible: assignment.responsible || this.userLabel(assignment.responsibleUser),
            building: assignment.project?.projectName || '',
            level: assignment.sector?.name || '',
            ruum: assignment.address?.name || ''
        }));
    }

    private userLabel(user: any): string {
        return user ? [user.name, user.lastName].filter(Boolean).join(' ') || user.email || user.code || '' : '';
    }
}
