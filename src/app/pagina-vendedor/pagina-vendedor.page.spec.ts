import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginaVendedorPage } from './pagina-vendedor.page';

describe('PaginaVendedorPage', () => {
  let component: PaginaVendedorPage;
  let fixture: ComponentFixture<PaginaVendedorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginaVendedorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
