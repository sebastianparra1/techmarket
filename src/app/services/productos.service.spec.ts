import { TestBed } from '@angular/core/testing';
import { ProductosService } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return list of products', () => {
    const products = service.getProducts();
    expect(products.length).toBeGreaterThan(0);
  });
});
