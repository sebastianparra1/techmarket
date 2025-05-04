import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'productos',
    loadComponent: () => import('./productos/productos.page').then( m => m.ProductosPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'carrito-de-compras',
    loadComponent: () => import('./carrito-de-compras/carrito-de-compras.page').then( m => m.CarritoDeComprasPage)
  },
  {
    path: 'pagina-vendedor',
    loadComponent: () => import('./pagina-vendedor/pagina-vendedor.page').then( m => m.PaginaVendedorPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'pago',
    loadComponent: () => import('./pago/pago.page').then(m => m.PagoComponent)
  },
  

];
