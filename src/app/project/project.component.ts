import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {MenuItem, MessageService, SelectItem} from "primeng/api";
import {finalize} from "rxjs/operators";
import {Project} from "./project.model";
import {ProjectService} from "./project.service";
import {CountryService} from "../demo/service/country.service";
import {Subscription} from "rxjs";
import {AuthService, ROLE_PEAADMIN} from "../auth/auth.service";



@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  breadcrumbItems: MenuItem[] = [
    {label: 'TODO'}
  ];

  projectList: Project[];
  project: Project;
  loading: boolean;
  dialogueVisible: boolean = false;
  selectedRow: any;
  @Output() projectSelected = new EventEmitter<Project>();
  private authSubscription?: Subscription;
  canCreateProject = false;

    // other methods...


  public rowExpandable = (row: Project) => true;

  constructor(
      private countryService: CountryService,
    private projectService: ProjectService,
      private authService: AuthService,

  ) {
    this.project = {} as Project;
  }


  ngOnInit(): void {
      this.authSubscription = this.authService.currentUser$.subscribe(user => {
          this.canCreateProject = user?.role === ROLE_PEAADMIN;
          this.fetchAll();
      });
  }

  ngOnDestroy(): void {
      this.authSubscription?.unsubscribe();
  }

  private fetchAll() {
    this.loading = true;
      const request = this.authService.currentUser?.id
          ? this.projectService.fetchProjectsForUser(this.authService.currentUser.id)
          : this.projectService.fetchAllProject();

      request
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
      if (!this.canCreateProject) {
          return;
      }
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

    onProjectChange(event: any) {
        this.projectSelected.emit(event.value);
    }






















    //DEÖETE


    countries: any[] = [];

    filteredCountries: any[] = [];

    selectedCountryAdvanced: any[] = [];

    valSlider = 50;

    valColor = '#424242';

    valRadio: string = '';

    valCheck: string[] = [];

    valCheck2: boolean = false;

    valSwitch: boolean = false;

    cities: SelectItem[] = [];

    selectedList: SelectItem = { value: '' };

    selectedDrop: SelectItem = { value: '' };

    selectedMulti: any[] = [];

    valToggle = false;

    paymentOptions: any[] = [];

    valSelect1: string = '';

    valSelect2: string = '';

    valueKnob = 20;




    filterCountry(event: any) {
        const filtered: any[] = [];
        const query = event.query;
        for (let i = 0; i < this.countries.length; i++) {
            const country = this.countries[i];
            if (country.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(country);
            }
        }

        this.filteredCountries = filtered;
    }

}
