import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
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
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'chat/:vendedorId',
    loadComponent: () => import('./chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'editar-usuario/:id',
    loadComponent: () => import('./editar-usuario/editar-usuario.page').then(m => m.EditarUsuarioPage)
  },
  {
    path: 'recuperar-clave',
    loadComponent: () => import('./recuperar-clave/recuperar-clave.page').then( m => m.RecuperarClavePage)
  },
  {
    path: 'ver-chats',
    loadComponent: () => import('./ver-chats/ver-chats.page').then( m => m.VerChatsPage)
  },
  {
    path: 'producto-detalle',
    loadComponent: () => import('./producto-detalle/producto-detalle.page').then( m => m.ProductoDetallePage)
  },
  {
  path: 'producto-detalle/:id',
  loadComponent: () => import('./producto-detalle/producto-detalle.page').then(m => m.ProductoDetallePage)
  },  {
    path: 'ventas-vendedor',
    loadComponent: () => import('./ventas-vendedor/ventas-vendedor.page').then( m => m.VentasVendedorPage)
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./mis-compras/mis-compras.page').then( m => m.MisComprasPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  }


];
