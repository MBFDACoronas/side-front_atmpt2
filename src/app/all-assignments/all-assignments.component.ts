import {Component, OnInit} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {TableColumn} from "../demo/shared/table-column.interface";
import {Project} from "../project/project.model";
import {AssignmentService} from "../assignment/assignment.service";
import {Router} from "@angular/router";
import {Assignment} from "../assignment/assignment.model";
import {Drawing} from "../drawing/drawing.model";

@Component({
  selector: 'app-all-assignments',
  templateUrl: './all-assignments.component.html',
  styleUrl: './all-assignments.component.scss'
})
export class AllAssignmentsComponent implements OnInit{
    projectList: any[] = [];
    selectedTableColumns: TableColumn[] = [];
    loading: boolean = false;
    selectedRow: any;
    selectedProjectId: string;
    selectedProject: Project;
    constructor(
        private assignmentService:AssignmentService,
        private router:Router,

    ) {
    }
    ngOnInit(): void {
        this.selectedTableColumns = [
            {
                name: 'Nr.',
                value: 'number',
                width: '80px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Tüüp',
                value: 'type',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Modifitseerimise kuupäev',
                value: 'updstamp',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Loomise kuupäev',
                value: 'created',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Tööpakett',
                value: 'workPackage',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Katse-/kontrollkava',
                value: 'name',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Teema',
                value: 'theme',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Tähtaeg',
                value: 'deadline',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Vastutav',
                value: 'responsible',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'ATV',
                value: 'atv',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'joonis',
                value: 'drawingName',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Tase',
                value: 'level',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Ruum',
                value: 'ruum',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Ruudustiku jooned',
                value: 'lines',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Ehitis',
                value: 'building',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: '3D objekti kategooria',
                value: '3dCategory',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: '3D objekt',
                value: '3dObject',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: '2D objekti kategooria',
                value: 'name',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: '2D-objekt',
                value: 'name',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            }
        ];


        this.assignmentService.fetchAllAssignment().subscribe(res=>{
            this.projectList = res;
        });

    }
    openDialog(data: any): void {
        // Open dialog logic
        this.selectedRow = data;
    }

    rowEditInit(event: any): void {
        // Row edit init logic
    }

    delete(event: any): void {
        // Delete logic
    }

    createAssignment(projectId: string) {
        let project = new class implements Project {
            id: string;
            projectName: string;
            valid: boolean;
        }
        project = this.selectedProject;
        let assignment = new class implements Assignment {
            id: string;
            drawing: Drawing[];
            project: Project;
            name: string;
        }
        assignment.project=project;
        this.assignmentService.saveAssignment(assignment).subscribe(res=>{
            this.router.navigate(['/assignment/'+res.id]);
        })
    }
    modifyAssignment() {
        this.router.navigate(['/assignment/'+this.selectedRow.id]);
    }

    projectSelected($event: Project) {
        this.selectedProject = $event;
        this.assignmentService.fetchAllAssignmentsByProjectId(this.selectedProject.id).subscribe(res=>{
            this.projectList = res;
        });
    }
}
