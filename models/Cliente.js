class Cliente {
  constructor(nombre, telefono, direccion) {
    this.id = Date.now();
    this.nombre = nombre;
    this.telefono = telefono;
    this.direccion = direccion;
  }
 
  // Método para actualizar datos de contacto
  actualizarDatos(nuevosDatos) {
    const { nombre, telefono, direccion } = nuevosDatos;
 
    if (nombre) this.nombre = nombre;
    if (telefono) this.telefono = telefono;
    if (direccion) this.direccion = direccion;
  }
}
 
module.exports = Cliente;
 