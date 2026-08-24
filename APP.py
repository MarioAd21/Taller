from flask import Flask, render_template, jsonify, request
import sqlite3
import os
import sys

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('taller.db')
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Clientes (
        rut TEXT PRIMARY KEY, nombre TEXT, domicilio TEXT, numero TEXT,
        depto TEXT, block TEXT, villa TEXT, comuna TEXT, ciudad TEXT,
        sector TEXT, celular TEXT, telefono TEXT, email TEXT
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Tecnicos (
        id_tecnico TEXT PRIMARY KEY, nombre TEXT
    )''')

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Ordenes_Reparacion (
        numero_orden INTEGER PRIMARY KEY AUTOINCREMENT, rut_cliente TEXT, fecha_solicitud TEXT,
        status TEXT, id_tecnico TEXT, boleta_factura TEXT, producto TEXT,
        nombre_artefacto TEXT, numero_serie TEXT, reclamo_cliente TEXT,
        diagnostico_tecnico TEXT, solucion TEXT, estado_artefacto TEXT,
        subtotal REAL, abono REAL, total REAL,
        FOREIGN KEY (rut_cliente) REFERENCES Clientes(rut)
    )''')

    cursor.execute("INSERT OR IGNORE INTO Tecnicos VALUES ('01', 'Nestor'), ('02', 'Edison')")
    conn.commit()
    conn.close()

init_db()

def get_db():
    conn = sqlite3.connect('taller.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('Index.html')

@app.route('/api/cliente/<rut>')
def get_cliente(rut):
    db = get_db()
    cliente = db.execute('SELECT * FROM Clientes WHERE rut = ?', (rut,)).fetchone()
    if cliente:
        return jsonify(dict(cliente))
    return jsonify({"error": "No encontrado"}), 404

@app.route('/api/guardar', methods=['POST'])
def guardar():
    data = request.json
    db = get_db()
    
    # 1. Guarda o actualiza los datos del cliente
    db.execute('''
        INSERT INTO Clientes (rut, nombre, domicilio, numero, depto, block, comuna, ciudad, sector, celular, telefono)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(rut) DO UPDATE SET 
        nombre=excluded.nombre, domicilio=excluded.domicilio, numero=excluded.numero,
        depto=excluded.depto, block=excluded.block, comuna=excluded.comuna, 
        ciudad=excluded.ciudad, sector=excluded.sector, celular=excluded.celular, telefono=excluded.telefono
    ''', (
        data.get('rut'), data.get('nombre'), data.get('domicilio'), data.get('numero'),
        data.get('depto'), data.get('block'), data.get('comuna'), data.get('ciudad'),
        data.get('sector'), data.get('celular'), data.get('telefono')
    ))
    
    # 2. Inserta la orden de reparación y captura el ID generado automáticamente
    cursor = db.execute('''
        INSERT INTO Ordenes_Reparacion (rut_cliente, fecha_solicitud, producto, nombre_artefacto, numero_serie, reclamo_cliente)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data.get('rut'), data.get('fecha_solicitud'), data.get('producto'), 
        data.get('nombre_artefacto'), data.get('numero_serie'), data.get('reclamo_cliente')
    ))
    
    nuevo_numero_orden = cursor.lastrowid
    db.commit()
    
    return jsonify({
        "mensaje": "¡Orden y cliente guardados con éxito en la base de datos!",
        "numero_orden": nuevo_numero_orden
    })

@app.route('/api/apagar', methods=['POST'])
def apagar():
    os._exit(0)
    return jsonify({"mensaje": "Servidor apagado."})

@app.route('/api/reiniciar', methods=['POST'])
def reiniciar():
    os.execv(sys.executable, [sys.executable] + sys.argv)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)