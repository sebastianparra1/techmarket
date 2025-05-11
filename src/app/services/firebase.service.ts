import { Injectable } from '@angular/core';
import { getDatabase, ref, set, push, get, child } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db = getDatabase();

  constructor() {}

  async registrarUsuario(nombre: string, correo: string, clave: string, rut: string, telefono: string): Promise<void> {
    const usuariosRef = ref(this.db, 'usuarios');
    const nuevoUsuarioRef = push(usuariosRef);
    await set(nuevoUsuarioRef, {
      nombreUsuario: nombre,
      correo: correo,
      clave: clave,
      rut: rut,
      telefono: telefono
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

  async validarLogin(nombreUsuario: string, clave: string): Promise<any | null> {
    const usuarios = await this.getUsuarios();
    return usuarios.find(user => user.nombreUsuario === nombreUsuario && user.clave === clave) || null;
  }
}
