import {Component, OnInit} from '@angular/core';
import {TableColumn} from "../demo/shared/table-column.interface";
import {AssignmentService} from "../assignment/assignment.service";
import {Assignment} from "../assignment/assignment.model";
import {Router} from "@angular/router";
import {Drawing} from "../drawing/drawing.model";
import {Project} from "../project/project.model";


@Component({  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
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
                name: 'id',
                value: 'id',
                width: '80px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Nimi',
                value: 'name',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            }
        ];


        this.assignmentService.fetchAllAssignment().subscribe(res=>{
            this.projectList = res;
        });

        // Example data
        // this.projectList = [
        //     { column1Value: 'Value 1', column2Value: 'Value 2' },
        //     { column1Value: 'Value 3', column2Value: 'Value 4' }
        // ];


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
