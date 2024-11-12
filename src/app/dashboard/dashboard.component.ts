import {Component, OnInit} from '@angular/core';
import {TableColumn} from "../demo/shared/table-column.interface";
import {AssignmentService} from "../assignment/assignment.service";
import {Assignment} from "../assignment/assignment.model";
import {Router} from "@angular/router";
import {Drawing} from "../drawing/drawing.model";


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
    projectList: any[] = [];
    selectedTableColumns: TableColumn[] = [];
    loading: boolean = false;
    selectedRow: any;
    constructor(
        private assignmentService:AssignmentService,
        private router:Router,

    ) {
    }
    ngOnInit(): void {
        this.selectedTableColumns = [
            {
                name: 'Projekt',
                value: 'column1Value',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            },
            {
                name: 'Nimi',
                value: 'column2Value',
                width: '180px',
                sort: true,
                filter: { type: 'contains' }
            }
        ];

        // Example data
        this.projectList = [
            { column1Value: 'Value 1', column2Value: 'Value 2' },
            { column1Value: 'Value 3', column2Value: 'Value 4' }
        ];
    }
    openDialog(data: any): void {
        // Open dialog logic
    }

    rowEditInit(event: any): void {
        // Row edit init logic
    }

    delete(event: any): void {
        // Delete logic
    }

    createAssignment() {
        let assignment = new class implements Assignment {
            id: string;
            drawing: Drawing[];
            name: string;
        }
        assignment.name = "test"
        this.assignmentService.saveAssignment(assignment).subscribe(res=>{
            this.router.navigate(['/assignment/'+res.id]);

        })
    }
}
