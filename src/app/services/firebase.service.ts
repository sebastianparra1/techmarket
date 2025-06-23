import { Injectable } from '@angular/core';
import { getDatabase, ref, set, get, child, update } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private db = getDatabase();

  constructor() {}

  // ✅ REGISTRO en Auth y luego en Realtime DB
  async registrarUsuario(
    nombre: string,
    correo: string,
    clave: string,
    rut: string,
    telefono: string,
    direccion: string,
    rol: string,
    fotoPerfil: string
  ): Promise<void> {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, correo, clave);
    const uid = userCredential.user.uid;

    const usuariosRef = ref(this.db, `usuarios/${uid}`);
    await set(usuariosRef, {
      nombreUsuario: nombre,
      correo: correo,
      clave: clave, // lo sigues guardando
      rut: rut,
      telefono: telefono,
      direccion: direccion,
      rol: rol,
      fotoPerfil: fotoPerfil
    });
  }

  // ✅ Obtener lista de usuarios
  async getUsuarios(): Promise<any[]> {
    const dbRef = ref(this.db);
    const snapshot = await get(child(dbRef, 'usuarios'));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    } else {
      return [];
    }
  }

  // ✅ Actualizar datos del usuario (se usa en editar-usuario)
  async actualizarUsuario(id: string, datos: any): Promise<void> {
    const userRef = ref(this.db, `usuarios/${id}`);
    await update(userRef, datos);
  }

  // ✅ Login manual con correo y clave
  async validarLoginPorCorreo(correo: string, clave: string): Promise<any | null> {
    const usuarios = await this.getUsuarios();
    return usuarios.find(user => user.correo === correo && user.clave === clave) || null;
  }

  // ✅ Obtener usuario por su ID
  async getUsuarioPorId(id: string): Promise<any> {
    const userRef = ref(this.db, `usuarios/${id}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  }

  // ✅ Login manual con nombreUsuario y clave (si lo usas)
  async getProductosDeUsuario(uid: string): Promise<any[]> {
  const dbRef = ref(this.db);
  const snapshot = await get(child(dbRef, 'productos'));

  if (snapshot.exists()) {
    const productos = snapshot.val();

    const filtrados = Object.keys(productos)
      .filter(key => productos[key].creadoPor === uid)
      .map(key => ({ id: key, ...productos[key] }));

    console.log('Productos encontrados:', filtrados);  // ✅ ahora sí funciona
    return filtrados;
  } else {
    return [];
  }
}

async getIntercambios(uid: string): Promise<any[]> {
  const dbRef = ref(this.db);
  const snapshot = await get(child(dbRef, 'intercambios'));
  if (snapshot.exists()) {
    const intercambios = snapshot.val();
    return Object.keys(intercambios)
      .filter(key => intercambios[key].creadoPor === uid)
      .map(key => ({ id: key, ...intercambios[key] }));
  } else {
    return [];
  }
}

async getProductosAgrupadosPorMes(uid: string): Promise<{ [mes: string]: number }> {
  const productos = await this.getProductosDeUsuario(uid);
  const agrupados: { [mes: string]: number } = {};

  productos.forEach(producto => {
    if (!producto.creadoEn) return;
    const fecha = new Date(producto.creadoEn);
    const mes = fecha.toLocaleString('default', { month: 'short', year: 'numeric' }); // Ej: "Jun 2025"
    agrupados[mes] = (agrupados[mes] || 0) + 1;
  });

  return agrupados;
}


async getVentasDelUsuario(uid: string): Promise<any[]> {
  const dbRef = ref(this.db);
  const snapshot = await get(child(dbRef, 'ventas'));

  if (snapshot.exists()) {
    const ventas = snapshot.val();
    return Object.keys(ventas)
      .filter(key => ventas[key].vendedorId === uid)
      .map(key => ({ id: key, ...ventas[key] }));
  } else {
    return [];
  }
}

async getIngresosPorMes(uid: string): Promise<{ [mes: string]: number }> {
  const dbRef = ref(this.db);
  const snapshot = await get(child(dbRef, 'ventas'));

  const ingresos: { [mes: string]: number } = {};

  if (snapshot.exists()) {
    const ventas = snapshot.val();

    for (const key of Object.keys(ventas)) {
      const venta = ventas[key];
      if (venta.vendedorId !== uid) continue;

      const fechaStr = venta.fecha || venta.creadoEn;
      const precio = venta.precio || 0;

      if (!fechaStr || !precio) continue;

      const fecha = new Date(fechaStr);
      const mes = fecha.toLocaleString('default', { month: 'short', year: 'numeric' }); // Ej: "Jun 2025"

      ingresos[mes] = (ingresos[mes] || 0) + precio;
    }
  }

  return ingresos;
}


}


