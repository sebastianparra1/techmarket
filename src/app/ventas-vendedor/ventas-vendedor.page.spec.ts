import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasVendedorPage } from './ventas-vendedor.page';

describe('VentasVendedorPage', () => {
  let component: VentasVendedorPage;
  let fixture: ComponentFixture<VentasVendedorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VentasVendedorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
