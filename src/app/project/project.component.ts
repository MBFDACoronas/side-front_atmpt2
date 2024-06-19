import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {MenuItem, MessageService} from "primeng/api";
import {finalize} from "rxjs/operators";
import {Project} from "./project.model";
import {ProjectService} from "./project.service";



@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  breadcrumbItems: MenuItem[] = [
    {label: 'TODO'}
  ];

  projectList: Project[];
  project: Project;
  loading: boolean;
  dialogueVisible: boolean = false;
  selectedRow: any;

  public rowExpandable = (row: Project) => true;

  constructor(

    private projectService: ProjectService,

  ) {
    this.project = {} as Project;
  }


  ngOnInit(): void {
		this.fetchAll();
  }

  private fetchAll() {
    this.loading = true;
    this.projectService.fetchAllProject()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(data => {

		this.projectList = data;

      });
  }

  onVisibleChange(visible: boolean) {
    if (!visible) {
      this.selectedRow = null;
    }
    this.project = {} as Project;

  }

  openDialog(param) {
    this.project = {} as Project;
    if(param){
      this.project = param;
    }
    this.dialogueVisible = true;
  }

  valid() {

  }

  save() {
    this.projectService.saveProject(this.project).subscribe(r => {
      this.dialogueVisible = false;
	  this.fetchAll();

    });

  }

  rowEditInit(item: Project): void {
    this.project = item;
    this.dialogueVisible = true;
  }




  closeDialogue() {
    this.dialogueVisible = false;
  }


    setActive(test: any) {

    }
}
