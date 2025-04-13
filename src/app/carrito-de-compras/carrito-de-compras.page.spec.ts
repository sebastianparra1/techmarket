import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarritoDeComprasPage } from './carrito-de-compras.page';

describe('CarritoDeComprasPage', () => {
  let component: CarritoDeComprasPage;
  let fixture: ComponentFixture<CarritoDeComprasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarritoDeComprasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
