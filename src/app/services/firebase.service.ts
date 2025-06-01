import { Injectable } from '@angular/core';
import { getDatabase, ref, set, get, child, update } from 'firebase/database';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
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
    comuna: string,
    region: string,
    rol: string // nuevo cambio añadir Rol al vendedor
  ): Promise<void> {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, correo, clave);
    const uid = userCredential.user.uid;

    const usuariosRef = ref(this.db, `usuarios/${uid}`);
    await set(usuariosRef, {
      nombreUsuario: nombre,
      correo: correo,
      rut: rut,
      telefono: telefono,
      direccion: direccion,
      comuna: comuna,
      region: region,
      rol: rol
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

  async validarLoginPorCorreo(correo: string, clave: string): Promise<any | null> {
    const usuarios = await this.getUsuarios();
    return usuarios.find(user => user.correo === correo && user.clave === clave) || null;
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
