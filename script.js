document.addEventListener('DOMContentLoaded', function() {
    // Constante con la tasa mensual C/IVA exacta proporcionada
    const TASA_MENSUAL = 0.02269226; // 2.269226%
    
    // Plazos predefinidos para calcular por pago mensual
    const PLAZOS_PREDEFINIDOS = [12, 24, 36, 48, 60];
    
    // Elementos del DOM
    const modoMontoBtn = document.getElementById('modo-monto');
    const modoPagoBtn = document.getElementById('modo-pago');
    const seccionMonto = document.getElementById('seccion-monto');
    const seccionPago = document.getElementById('seccion-pago');
    const resultadosMonto = document.getElementById('resultados-monto');
    const resultadosPago = document.getElementById('resultados-pago');
    
    const montoInput = document.getElementById('monto');
    const plazoInput = document.getElementById('plazo');
    const pagoMensualInput = document.getElementById('pago-mensual-input');
    
    const calcularBtn = document.getElementById('calcular');
    
    const pagoMensualEl = document.getElementById('pago-mensual');
    const pagoTotalEl = document.getElementById('pago-total');
    const interesesTotalEl = document.getElementById('intereses-total');
    const pagoIngresadoEl = document.getElementById('pago-ingresado');
    
    const tablaAmortizacion = document.getElementById('tabla-amortizacion').getElementsByTagName('tbody')[0];
    const tablaResultadosPago = document.getElementById('tabla-resultados-pago').getElementsByTagName('tbody')[0];
    
    // Formateador de moneda
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });
    
    // Variables de estado
    let modoCalculo = 'monto'; // 'monto' o 'pago'
    
    // Función para calcular el pago mensual usando PMT (fórmula de Excel)
    function calcularPMT(tasa, periodos, monto) {
        // Fórmula PMT: PMT = (rate * PV) / (1 - (1 + rate)^(-nper))
        if (tasa === 0) {
            return monto / periodos;
        }
        
        const numerador = tasa * monto;
        const denominador = 1 - Math.pow(1 + tasa, -periodos);
        return numerador / denominador;
    }
    
    // Función para calcular el monto del préstamo a partir del pago mensual
    function calcularMonto(pagoMensual, tasa, periodos) {
        // Fórmula inversa: PV = PMT * (1 - (1 + rate)^(-nper)) / rate
        if (tasa === 0) {
            return pagoMensual * periodos;
        }
        
        const numerador = pagoMensual * (1 - Math.pow(1 + tasa, -periodos));
        return numerador / tasa;
    }
    
    // Función para calcular la tabla de amortización
    function calcularAmortizacion(monto, plazo, pagoMensual) {
        let saldo = monto;
        const tabla = [];
        
        for (let mes = 1; mes <= plazo; mes++) {
            const interes = saldo * TASA_MENSUAL;
            const capital = pagoMensual - interes;
            saldo -= capital;
            
            // Ajuste para el último pago
            if (mes === plazo) {
                const ajuste = saldo;
                saldo = 0;
                tabla.push({
                    mes: mes,
                    pago: pagoMensual - ajuste,
                    saldo: 0,
                    capital: capital + ajuste,
                    interes: interes
                });
            } else {
                tabla.push({
                    mes: mes,
                    pago: pagoMensual,
                    saldo: Math.max(0, saldo), // Evitar saldos negativos por redondeo
                    capital: capital,
                    interes: interes
                });
            }
        }
        
        return tabla;
    }
    
    // Función para mostrar la tabla de amortización
    function mostrarTabla(tabla) {
        // Limpiar tabla
        tablaAmortizacion.innerHTML = '';
        
        // Llenar tabla
        tabla.forEach(fila => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${fila.mes}</td>
                <td>${formatter.format(fila.pago)}</td>
                <td>${formatter.format(fila.saldo)}</td>
                <td>${formatter.format(fila.capital)}</td>
                <td>${formatter.format(fila.interes)}</td>
            `;
            tablaAmortizacion.appendChild(tr);
        });
    }
    
    // Función para mostrar los resultados del cálculo por pago mensual
    function mostrarResultadosPago(pagoMensual) {
        // Limpiar tabla
        tablaResultadosPago.innerHTML = '';
        
        // Llenar tabla con resultados para cada plazo
        PLAZOS_PREDEFINIDOS.forEach(plazo => {
            const monto = calcularMonto(pagoMensual, TASA_MENSUAL, plazo);
            const pagoTotal = pagoMensual * plazo;
            const interesesTotal = pagoTotal - monto;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${plazo}</td>
                <td>${formatter.format(monto)}</td>
            `;
            tablaResultadosPago.appendChild(tr);
        });
    }
    
    // Función para cambiar el modo de cálculo
    function cambiarModo(nuevoModo) {
        modoCalculo = nuevoModo;
        
        if (nuevoModo === 'monto') {
            seccionMonto.style.display = 'block';
            seccionPago.style.display = 'none';
            resultadosMonto.style.display = 'block';
            resultadosPago.style.display = 'none';
            modoMontoBtn.classList.add('active');
            modoPagoBtn.classList.remove('active');
        } else {
            seccionMonto.style.display = 'none';
            seccionPago.style.display = 'block';
            resultadosMonto.style.display = 'none';
            resultadosPago.style.display = 'block';
            modoMontoBtn.classList.remove('active');
            modoPagoBtn.classList.add('active');
        }
    }
    
    // Función principal de cálculo
    function calcular() {
        if (modoCalculo === 'monto') {
            // Calcular por monto
            const monto = parseFloat(montoInput.value);
            const plazo = parseInt(plazoInput.value);
            
            // Validación
            if (isNaN(monto) || isNaN(plazo) || monto <= 0 || plazo <= 0) {
                alert('Por favor, ingresa valores válidos para el monto y el plazo.');
                return;
            }
            
            // Calcular pago mensual
            const pagoMensual = calcularPMT(TASA_MENSUAL, plazo, monto);
            const pagoTotal = pagoMensual * plazo;
            const interesesTotal = pagoTotal - monto;
            
            // Mostrar resultados
            pagoMensualEl.textContent = formatter.format(pagoMensual);
            pagoTotalEl.textContent = formatter.format(pagoTotal);
            interesesTotalEl.textContent = formatter.format(interesesTotal);
            
            // Calcular y mostrar tabla de amortización
            const tabla = calcularAmortizacion(monto, plazo, pagoMensual);
            mostrarTabla(tabla);
        } else {
            // Calcular por pago mensual
            const pagoMensual = parseFloat(pagoMensualInput.value);
            
            // Validación
            if (isNaN(pagoMensual) || pagoMensual <= 0) {
                alert('Por favor, ingresa un valor válido para el pago mensual.');
                return;
            }
            
            // Mostrar pago ingresado
            pagoIngresadoEl.textContent = formatter.format(pagoMensual);
            
            // Mostrar resultados para los plazos predefinidos
            mostrarResultadosPago(pagoMensual);
        }
    }
    
    // Eventos para los botones de modo
    modoMontoBtn.addEventListener('click', () => cambiarModo('monto'));
    modoPagoBtn.addEventListener('click', () => cambiarModo('pago'));
    
    // Evento para el botón de calcular
    calcularBtn.addEventListener('click', calcular);
    
    // Ejemplo inicial
    montoInput.value = '50000';
    plazoInput.value = '24';
    calcular();
});