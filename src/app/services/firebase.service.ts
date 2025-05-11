import { Injectable } from '@angular/core';
import { getDatabase, ref, get, child } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db = getDatabase();

  constructor() {}

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
