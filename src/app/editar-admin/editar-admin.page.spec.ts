import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarAdminPage } from './editar-admin.page';

describe('EditarAdminPage', () => {
  let component: EditarAdminPage;
  let fixture: ComponentFixture<EditarAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
