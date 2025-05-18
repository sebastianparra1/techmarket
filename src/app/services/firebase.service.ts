import { Injectable } from '@angular/core';
import { getDatabase, ref, set, push, get, child, update } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db = getDatabase();

  constructor() {}

  async registrarUsuario(nombre: string, correo: string, clave: string, rut: string, telefono: string, direccion: string, comuna:string, region: string): Promise<void> {
    const usuariosRef = ref(this.db, 'usuarios');
    const nuevoUsuarioRef = push(usuariosRef);
    await set(nuevoUsuarioRef, {
      nombreUsuario: nombre,
      correo: correo,
      clave: clave,
      rut: rut,
      telefono: telefono,
      direccion: direccion,
      comuna: comuna,
      region: region
    });
  }

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

async actualizarUsuario(id: string, datos: any): Promise<void> {
  const userRef = ref(this.db, `usuarios/${id}`);
  await update(userRef, datos);
}
async getUsuarioPorId(id: string): Promise<any> {
  const userRef = ref(this.db, `usuarios/${id}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return null;
  }
}
  async validarLogin(nombreUsuario: string, clave: string): Promise<any | null> {
    const usuarios = await this.getUsuarios();
    return usuarios.find(user => user.nombreUsuario === nombreUsuario && user.clave === clave) || null;
  }
}
