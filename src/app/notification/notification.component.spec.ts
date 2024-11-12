import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalModule } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { Injector } from '@angular/core';
import { AppInjector } from '../../app.injector.service';
import { SharedModule } from '../shared.module';
import { NotificationComponent } from './notification.component';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;

  const mockTranslateService: Partial<TranslateService> = {
    get: () => of('translatedString')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationComponent],
      providers: [
        TranslatePipe,
        TranslateLoader,
        { provide: TranslateService, useValue: mockTranslateService },
        ToastrModule],
      imports: [
        SharedModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ToastrModule.forRoot({
          positionClass: 'toast-top-full-width'
        }),
        ModalModule.forRoot()
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    AppInjector.setInjector(TestBed.inject(Injector));
    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isEmptyObject', () => {
    expect(component.isEmptyObject('')).toEqual('');
  });

});
