// Auto-completar la fecha actual al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    
    const campoFecha = document.getElementById('fecha_solicitud');
    if (campoFecha) {
        campoFecha.value = `${año}-${mes}-${dia}`;
    }
});

// Buscador automático de RUT
document.getElementById('buscar_rut').addEventListener('blur', async (e) => {
    const rut = e.target.value.trim();
    if (!rut) return;

    const res = await fetch(`/api/cliente/${rut}`);
    if (res.ok) {
        const data = await res.json();
        document.getElementById('rut').value = data.rut || '';
        document.getElementById('c_rut').value = data.rut || '';
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('telefono').value = data.telefono || '';
        document.getElementById('celular').value = data.celular || '';
        document.getElementById('domicilio').value = data.domicilio || '';
        document.getElementById('numero').value = data.numero || '';
        document.getElementById('depto').value = data.depto || '';
        document.getElementById('block').value = data.block || '';
        document.getElementById('comuna').value = data.comuna || '';
        document.getElementById('ciudad').value = data.ciudad || '';
        document.getElementById('sector').value = data.sector || '';
    } else {
        alert('Cliente nuevo: Ingrese los datos manualmente para registrarlos al guardar.');
        document.getElementById('rut').value = rut;
        document.getElementById('c_rut').value = rut;
    }
});

// Guardar datos con validación previa
document.getElementById('btn_guardar').addEventListener('click', async () => {
    const datos = {
        rut: document.getElementById('c_rut').value,
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        celular: document.getElementById('celular').value,
        domicilio: document.getElementById('domicilio').value,
        numero: document.getElementById('numero').value,
        depto: document.getElementById('depto').value,
        block: document.getElementById('block').value,
        comuna: document.getElementById('comuna').value,
        ciudad: document.getElementById('ciudad').value,
        sector: document.getElementById('sector').value,
        fecha_solicitud: document.getElementById('fecha_solicitud').value,
        producto: document.getElementById('producto').value,
        nombre_artefacto: document.getElementById('nombre_artefacto').value,
        numero_serie: document.getElementById('numero_serie').value,
        reclamo_cliente: document.getElementById('reclamo_cliente').value
    };

    if (!datos.rut) {
        alert("⚠️ ATENCIÓN: El RUT es obligatorio para guardar.");
        return;
    }

    const mensajeValidacion = 
        `¿Confirma que los siguientes datos son correctos?\n\n` +
        `👤 CLIENTE: ${datos.nombre || 'Sin nombre'} (RUT: ${datos.rut})\n` +
        `📞 FONO/CEL: ${datos.telefono || '-'} / ${datos.celular || '-'}\n` +
        `🛠️ EQUIPO: ${datos.producto || 'No especificado'} (${datos.nombre_artefacto || ''})\n\n` +
        `Presione ACEPTAR para guardar los datos y habilitar la impresión.`;

    if (confirm(mensajeValidacion)) {
        const res = await fetch('/api/guardar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        const respuesta = await res.json();
        alert(respuesta.mensaje);

        // Mostrar el número de orden en rojo formateado (ej: 06282)
        if (respuesta.numero_orden) {
            const nFormat = String(respuesta.numero_orden).padStart(5, '0');
            document.getElementById('numero_orden_display').textContent = nFormat;
        }
        
        // Habilitar y mostrar botones de impresión
        document.getElementById('btn_imprimir').classList.remove('btn-oculto');
        document.getElementById('btn_pdf').classList.remove('btn-oculto');
        document.getElementById('btn_imprimir').style.display = 'inline-block';
        document.getElementById('btn_pdf').style.display = 'inline-block';
    }
});

document.getElementById('btn_imprimir').addEventListener('click', () => {
    window.print();
});

document.getElementById('btn_pdf').addEventListener('click', () => {
    const elemento = document.getElementById('boleta_pdf'); 
    elemento.classList.add('modo-impresion'); 
    
    const opt = {
        margin:       0.3,
        filename:     `Orden_Reparacion_${document.getElementById('c_rut').value || 'Nueva'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(elemento).save().then(() => {
        elemento.classList.remove('modo-impresion');
    });
});

document.getElementById('btn_apagar').addEventListener('click', async () => {
    if (confirm("¿Seguro que deseas apagar el servidor?")) {
        await fetch('/api/apagar', { method: 'POST' });
        alert("Servidor apagado. Puedes cerrar esta ventana.");
    }
});

document.getElementById('btn_reiniciar').addEventListener('click', async () => {
    if (confirm("¿Deseas reiniciar el sistema?")) {
        await fetch('/api/reiniciar', { method: 'POST' });
        alert("Sistema reiniciado. Recarga la página.");
    }
}); 