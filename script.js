// Variables globales
let currentSection = '';
let infographics = {
    dian: [],
    contributor: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadInfographics();
    setupEventListeners();
    updateCounters();
});

// Configurar event listeners
function setupEventListeners() {
    // Modal form submission
    document.getElementById('infographic-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveInfographic();
    });

    // Modal close on outside click
    document.getElementById('infographic-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Abrir modal para agregar infografía
function addInfographic(section) {
    currentSection = section;
    document.getElementById('infographic-form').reset();
    document.getElementById('infographic-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focus en el primer campo
    setTimeout(() => {
        document.getElementById('infographic-title').focus();
    }, 100);
}

// Cerrar modal
function closeModal() {
    document.getElementById('infographic-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentSection = '';
}

// Guardar infografía
function saveInfographic() {
    const title = document.getElementById('infographic-title').value.trim();
    const description = document.getElementById('infographic-description').value.trim();
    const code = document.getElementById('infographic-code').value.trim();
    
    if (!title) {
        alert('Por favor ingresa un título para la infografía.');
        return;
    }
    
    const infographic = {
        id: Date.now(),
        title: title,
        description: description,
        code: code,
        createdAt: new Date().toISOString()
    };
    
    infographics[currentSection].push(infographic);
    saveToLocalStorage();
    renderInfographics(currentSection);
    updateCounters();
    closeModal();
    
    // Mostrar notificación de éxito
    showNotification('Infografía agregada exitosamente', 'success');
}

// Renderizar infografías de una sección
function renderInfographics(section) {
    const container = document.getElementById(`${section}-container`);
    const infographicsList = infographics[section];
    
    if (infographicsList.length === 0) {
        container.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-plus-circle"></i>
                <p>Agregar infografías ${section === 'dian' ? 'de la DIAN' : 'del Contribuyente'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = infographicsList.map(infographic => `
        <div class="infographic-card" data-id="${infographic.id}">
            <div class="infographic-header">
                <h4 class="infographic-title">${escapeHtml(infographic.title)}</h4>
                <div class="infographic-actions">
                    <button class="action-btn" onclick="viewInfographic(${infographic.id}, '${section}')" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="editInfographic(${infographic.id}, '${section}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>

                </div>
            </div>
            ${infographic.description ? `<p class="infographic-description">${escapeHtml(infographic.description)}</p>` : ''}
            <div class="infographic-preview-info">
                <div class="preview-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="preview-text">
                    <p><strong>Infografía Interactiva</strong></p>
                    <p class="preview-details">Haz clic en "Ver" para visualizar la infografía completa</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Ver infografía completa
function viewInfographic(id, section) {
    const infographic = infographics[section].find(inf => inf.id === id);
    if (!infographic) return;
    
    // Crear un blob con el contenido HTML
    const blob = new Blob([infographic.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${escapeHtml(infographic.title)}</h3>
                <div class="preview-actions">
                    <button class="preview-btn secondary" onclick="toggleFullscreen(this)">
                        <i class="fas fa-expand"></i> Pantalla Completa
                    </button>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="infographic-preview">
                <div class="preview-header">
                    <span>Vista Previa de la Infografía</span>
                    <div class="preview-actions">
                        <button class="preview-btn secondary" onclick="showCode('${id}', '${section}')">
                            <i class="fas fa-code"></i> Ver Código
                        </button>
                        <button class="preview-btn primary" onclick="openInNewTab('${url}')">
                            <i class="fas fa-external-link-alt"></i> Abrir en Nueva Pestaña
                        </button>
                    </div>
                </div>
                <iframe src="${url}" title="${escapeHtml(infographic.title)}"></iframe>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
            document.body.style.overflow = 'auto';
            URL.revokeObjectURL(url);
        }
    });
    
    // Limpiar URL cuando se cierre el modal
    modal.addEventListener('remove', function() {
        URL.revokeObjectURL(url);
    });
}

// Función para alternar pantalla completa
function toggleFullscreen(button) {
    const modalContent = button.closest('.modal-content');
    modalContent.classList.toggle('fullscreen');
    
    const icon = button.querySelector('i');
    if (modalContent.classList.contains('fullscreen')) {
        icon.className = 'fas fa-compress';
        button.innerHTML = '<i class="fas fa-compress"></i> Salir Pantalla Completa';
    } else {
        icon.className = 'fas fa-expand';
        button.innerHTML = '<i class="fas fa-expand"></i> Pantalla Completa';
    }
}

// Función para mostrar el código
function showCode(id, section) {
    const infographic = infographics[section].find(inf => inf.id === parseInt(id));
    if (!infographic) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 1000px;">
            <div class="modal-header">
                <h3>Código de la Infografía: ${escapeHtml(infographic.title)}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: 2rem; max-height: 70vh; overflow-y: auto;">
                <pre style="background: #2d3748; color: #e2e8f0; padding: 1.5rem; border-radius: 8px; overflow-x: auto; font-size: 0.9rem; line-height: 1.5;"><code>${escapeHtml(infographic.code)}</code></pre>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

// Función para abrir en nueva pestaña
function openInNewTab(url) {
    window.open(url, '_blank');
}

// Editar infografía
function editInfographic(id, section) {
    const infographic = infographics[section].find(inf => inf.id === id);
    if (!infographic) return;
    
    currentSection = section;
    document.getElementById('infographic-title').value = infographic.title;
    document.getElementById('infographic-description').value = infographic.description;
    document.getElementById('infographic-code').value = infographic.code;
    
    // Cambiar el comportamiento del formulario para actualizar en lugar de crear
    const form = document.getElementById('infographic-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateInfographic(id);
    };
    
    // Cambiar el texto del botón
    document.querySelector('.btn-primary').textContent = 'Actualizar Infografía';
    
    document.getElementById('infographic-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Actualizar infografía existente
function updateInfographic(id) {
    const title = document.getElementById('infographic-title').value.trim();
    const description = document.getElementById('infographic-description').value.trim();
    const code = document.getElementById('infographic-code').value.trim();
    
    if (!title) {
        alert('Por favor ingresa un título para la infografía.');
        return;
    }
    
    const index = infographics[currentSection].findIndex(inf => inf.id === id);
    if (index === -1) return;
    
    infographics[currentSection][index] = {
        ...infographics[currentSection][index],
        title: title,
        description: description,
        code: code,
        updatedAt: new Date().toISOString()
    };
    
    saveToLocalStorage();
    renderInfographics(currentSection);
    closeModal();
    
    // Restaurar el comportamiento original del formulario
    const form = document.getElementById('infographic-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        saveInfographic();
    };
    document.querySelector('.btn-primary').textContent = 'Guardar Infografía';
    
    showNotification('Infografía actualizada exitosamente', 'success');
}



// Actualizar contadores
function updateCounters() {
    document.getElementById('dian-count').textContent = infographics.dian.length;
    document.getElementById('contributor-count').textContent = infographics.contributor.length;
}

// Guardar en localStorage
function saveToLocalStorage() {
    localStorage.setItem('dian-vs-hmi-infographics', JSON.stringify(infographics));
}

// Cargar desde localStorage
function loadInfographics() {
    const saved = localStorage.getItem('dian-vs-hmi-infographics');
    if (saved) {
        infographics = JSON.parse(saved);
    } else {
        // Agregar infografías de ejemplo si no hay datos guardados
        
        // Infografía del Contribuyente - Art. 13 CDI
        infographics.contributor.push({
            id: Date.now(),
            title: "Análisis del Caso: Art. 13 CDI Colombia-UK",
            description: "Infografía completa sobre la controversia entre valor de activos vs valor de acciones en el caso del CDI Colombia-UK. Demuestra el error de interpretación de la DIAN al analizar activos en lugar del valor de las acciones.",
            code: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infografía del Caso: Art. 13 CDI Colombia-UK</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            scroll-behavior: smooth;
        }
        .chart-container {
            position: relative;
            width: 100%;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
            height: 350px;
            max-height: 400px;
        }
        .flow-step {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .flow-arrow::after {
            content: '➔';
            font-size: 2rem;
            color: #0094D1;
            margin: 0 1rem;
            display: block;
        }
        @media (max-width: 768px) {
            .chart-container {
                height: 300px;
            }
            .flow-arrow::after {
                 content: '⬇';
                 margin: 1rem 0;
            }
        }
    </style>
</head>
<body class="bg-[#F0F9FF]">
    <div class="container mx-auto p-4 md:p-8 max-w-6xl">
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-extrabold text-[#004AAD] mb-2">Análisis del Caso: Art. 13 CDI Colombia-UK</h1>
            <p class="text-lg md:text-xl font-medium text-[#0094D1]">Valor de Activos vs. Valor de Acciones: El Error de Interpretación</p>
        </header>
        <main class="space-y-16">
            <section id="controversy" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">La Controversia: Dos Visiones Opuestas</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                    <div class="border-2 border-red-500 rounded-lg p-6 bg-red-50">
                        <h3 class="text-2xl font-bold text-red-700 mb-4">La Tesis de la DIAN</h3>
                        <p class="text-5xl font-extrabold text-red-600 mb-4">67%</p>
                        <p class="text-gray-700">El 67% de los **activos** de la sociedad son bienes inmuebles. Como esto supera el 50%, Colombia tiene potestad para gravar.</p>
                        <p class="mt-4 font-semibold text-red-700">Enfoque: Análisis del balance de activos.</p>
                    </div>
                    <div class="border-2 border-green-600 rounded-lg p-6 bg-green-50">
                        <h3 class="text-2xl font-bold text-green-800 mb-4">La Tesis del Contribuyente</h3>
                         <p class="text-5xl font-extrabold text-green-700 mb-4">&lt;50%</p>
                        <p class="text-gray-700">El valor de las <span class="font-bold">acciones</span> se deriva de la operación y flujos futuros. La porción del valor accionario derivada de inmuebles es menor al 50%.</p>
                        <p class="mt-4 font-semibold text-green-800">Enfoque: Valoración financiera de las acciones.</p>
                    </div>
                </div>
            </section>
            
            <section id="interpretation" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">El Corazón del Asunto: ¿Qué Significa "Valor"?</h2>
                <div class="flex flex-col md:flex-row items-stretch justify-center flex-wrap">
                    <div class="flow-step p-4 m-2 flex-1 min-w-[200px] flow-arrow">
                        <div class="bg-[#B3E2F3] p-4 rounded-lg shadow-md h-full">
                            <p class="font-bold text-[#004AAD] text-lg">1. Término Indefinido</p>
                            <p class="text-sm text-gray-800">El CDI no define "valor". Se debe recurrir a la Convención de Viena.</p>
                        </div>
                    </div>
                    <div class="flow-step p-4 m-2 flex-1 min-w-[200px] flow-arrow">
                        <div class="bg-[#B3E2F3] p-4 rounded-lg shadow-md h-full">
                            <p class="font-bold text-[#004AAD] text-lg">2. Objeto y Fin</p>
                            <p class="text-sm text-gray-800">El fin de la norma es anti-abuso: evitar eludir impuestos sobre plusvalías de inmuebles.</p>
                        </div>
                    </div>
                    <div class="flow-step p-4 m-2 flex-1 min-w-[200px]">
                       <div class="bg-[#78C9E6] p-4 rounded-lg shadow-lg h-full">
                            <p class="font-bold text-[#004AAD] text-lg">3. Conclusión Lógica</p>
                            <p class="text-sm text-gray-800">"Valor" debe interpretarse como el valor económico real (valor justo) que captura la plusvalía, no un simple registro contable.</p>
                        </div>
                    </div>
                </div>
                 <p class="text-center text-gray-600 mt-6 italic">La finalidad anti-abuso es clara: "prevenir que la tributación (...) sobre la plusvalía de bienes inmuebles sea eludida mediante la interposición de una sociedad y la posterior enajenación de sus acciones en lugar del activo subyacente."</p>
            </section>
            
            <section id="oecd" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">La Guía de los Comentarios de la OCDE</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    Los Comentarios al Convenio Modelo, herramienta clave de interpretación, son consistentes y enfáticos en que el análisis se centra en el valor de las acciones, no de los activos.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-blue-50 border-l-4 border-[#0094D1] p-4">
                        <blockquote class="text-gray-800">"...el <span class="font-extrabold">valor de las acciones</span> debe proceder directa o indirectamente en más del 50% de bienes inmuebles..."</blockquote>
                        <cite class="block text-right mt-2 text-sm text-[#004AAD] font-semibold">Párrafo 28.3</cite>
                    </div>
                    <div class="bg-blue-50 border-l-4 border-[#0094D1] p-4">
                        <blockquote class="text-gray-800">"...se determinará siempre y cuando las acciones (...) obtengan (...) más del 50% de su <span class="font-extrabold">valor</span> directa o indirectamente de bienes inmuebles."</blockquote>
                         <cite class="block text-right mt-2 text-sm text-[#004AAD] font-semibold">Párrafo 28.4</cite>
                    </div>
                    <div class="bg-blue-50 border-l-4 border-[#0094D1] p-4">
                        <blockquote class="text-gray-800">"...el <span class="font-extrabold">valor de dichas acciones</span> o participaciones análogas procede en más del 50% de bienes inmuebles."</blockquote>
                         <cite class="block text-right mt-2 text-sm text-[#004AAD] font-semibold">Párrafo 28.9</cite>
                    </div>
                </div>
                <p class="text-center font-semibold text-[#004AAD] mt-8">La conclusión es ineludible: la prueba del CDI se realiza sobre el VALOR DE LAS ACCIONES, no sobre los activos de la sociedad.</p>
            </section>

            <section id="fallacy" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">Visualizando la Falacia: Activos vs. Valor de la Acción</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 class="text-xl font-bold text-center text-red-700 mb-4">La Visión de la DIAN: El Denominador Incorrecto</h3>
                        <div class="chart-container">
                            <canvas id="dianChart"></canvas>
                        </div>
                        <p class="text-center text-sm text-gray-600 mt-4">La DIAN compara el valor de los inmuebles contra el <span class="font-bold">total de activos</span>. Este es el error fundamental, ya que ignora el mandato de la OCDE de analizar el valor de la acción.</p>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-center text-green-800 mb-4">La Realidad Financiera: El Denominador Correcto</h3>
                        <div class="chart-container">
                            <canvas id="contributorChart"></canvas>
                        </div>
                         <p class="text-center text-sm text-gray-600 mt-4">La valoración correcta compara el valor de los inmuebles contra el <span class="font-bold">valor total de las acciones</span>, que incluye el negocio en marcha. Así, los inmuebles solo representan el 35% del valor real.</p>
                    </div>
                </div>
            </section>
            
            <section id="valuation_methods" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                 <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">Fundamento del Valor de la Acción</h2>
                 <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">El valor de una acción no es una foto del balance; es una película del futuro del negocio. Se determina por métodos financieros que capturan la capacidad de generar riqueza.</p>
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-gray-50 p-6 rounded-lg text-center h-full">
                        <p class="text-5xl mb-4">📈</p>
                        <h3 class="font-bold text-lg text-[#004AAD]">Flujos de Efectivo Descontados</h3>
                        <p class="text-gray-600">Se proyectan las ganancias futuras del negocio (los cultivos de aguacate) y se traen a valor presente. Este es el principal generador de valor.</p>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-lg text-center h-full">
                        <p class="text-5xl mb-4">📊</p>
                        <h3 class="font-bold text-lg text-[#004AAD]">Múltiplos de Mercado</h3>
                        <p class="text-gray-600">Se compara la rentabilidad de la empresa (ej. EBITDA) con la de compañías similares en el sector para determinar un valor de mercado justo.</p>
                    </div>
                    <div class="bg-red-100 border border-red-300 p-6 rounded-lg text-center h-full">
                        <p class="text-5xl mb-4">⚠️</p>
                        <h3 class="font-bold text-lg text-red-700">Rechazo al Valor Intrínseco</h3>
                        <p class="text-gray-600">El "valor intrínseco" (Activos - Pasivos) es incorrecto. No refleja el valor de mercado (fair market value) y es solo una visión del balance, ignorando el negocio en marcha.</p>
                    </div>
                 </div>
            </section>

            <section id="conclusion" class="bg-[#004AAD] text-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold mb-6 text-center">Conclusión para el Tribunal</h2>
                <ol class="space-y-4">
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>El análisis de la DIAN, basado en la composición de activos, es erróneo y no sigue la letra ni el espíritu del CDI.</p>
                    </li>
                    <li class="flex items-start">
                        <span class="text-text-2xl text-green-300 mr-4">✔</span>
                        <p>El CDI y los Comentarios OCDE exigen analizar el <span class="font-bold">"valor de la acción"</span>, un concepto financiero que refleja el valor justo y el potencial del negocio.</p>
                    </li>
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>El valor de las acciones de la compañía se deriva de su operación comercial (cultivos de aguacate) y sus flujos de caja futuros, no principalmente del valor de la tierra.</p>
                    </li>
                    <li class="flex items-start mt-4 border-t border-blue-400 pt-4">
                        <span class="text-2xl text-white mr-4">⚖️</span>
                        <p class="font-extrabold text-lg">Por lo tanto, al no superarse el umbral del 50% en el <span class="underline">valor de la acción</span>, Colombia carece de potestad tributaria sobre esta operación.</p>
                    </li>
                </ol>
            </section>
        </main>
        
        <footer class="text-center mt-12 py-4">
            <p class="text-xs text-gray-600">
                Esta infografía es una representación visual de los argumentos legales y tiene fines informativos. Creada el 19 de julio de 2025.
            </p>
        </footer>
    </div>

    <script>
        const tooltipTitleCallback = (tooltipItems) => {
            const item = tooltipItems[0];
            let label = item.chart.data.labels[item.dataIndex];
            if (Array.isArray(label)) {
                return label.join(' ');
            }
            return label;
        };
        
        const wrapLabel = (label, maxLength = 16) => {
            if (label.length <= maxLength) { return label; }
            const words = label.split(' ');
            const lines = [];
            let currentLine = '';
            for (const word of words) {
                if ((currentLine + ' ' + word).trim().length > maxLength) {
                    lines.push(currentLine.trim());
                    currentLine = word;
                } else {
                    currentLine = (currentLine + ' ' + word).trim();
                }
            }
            if (currentLine) { lines.push(currentLine.trim()); }
            return lines;
        };

        const dianCtx = document.getElementById('dianChart').getContext('2d');
        new Chart(dianCtx, {
            type: 'pie',
            data: {
                labels: ['Activos Inmuebles', 'Otros Activos'],
                datasets: [{
                    label: 'Composición de Activos',
                    data: [67, 33],
                    backgroundColor: ['#DC2626', '#FCA5A5'],
                    borderColor: '#FFFFFF',
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { title: tooltipTitleCallback } }
                }
            }
        });

        const contributorCtx = document.getElementById('contributorChart').getContext('2d');
        new Chart(contributorCtx, {
            type: 'bar',
            data: {
                labels: ["Origen del Valor de la Acción"],
                datasets: [
                    {
                        label: 'Valor Derivado de Inmuebles',
                        data: [35],
                        backgroundColor: '#16A34A',
                        stack: 'Stack 0',
                    },
                    {
                        label: 'Valor Derivado de la Operación (Flujos, Intangibles)',
                        data: [65],
                        backgroundColor: '#86EFAC',
                        stack: 'Stack 0',
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        max: 100,
                        ticks: {
                           callback: function(value) { return value + '%' }
                        }
                    },
                    y: { stacked: true, display: false }
                },
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { 
                        callbacks: { title: tooltipTitleCallback },
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    </script>
</body>
</html>`,
            createdAt: new Date().toISOString()
        });
        
        // Infografía del Contribuyente - Impuesto al Patrimonio
        infographics.contributor.push({
            id: Date.now() + 2,
            title: "Defensa del Contribuyente: Impuesto al Patrimonio",
            description: "Infografía que presenta los argumentos del contribuyente sobre la deducibilidad de pasivos del exterior en el impuesto al patrimonio. Demuestra dos pilares: la ley interna permisiva y la cláusula de no discriminación del CDI.",
            code: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Argumento Contribuyente: Impuesto al Patrimonio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            scroll-behavior: smooth;
        }
        .flow-step {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
        }
        .flow-arrow::after {
            content: '➔';
            font-size: 2.5rem;
            color: #0094D1;
            margin: 0 1rem;
        }
        @media (max-width: 768px) {
            .flow-arrow::after {
                 content: '⬇';
                 margin: 1rem 0;
            }
            .flow-step {
                flex-direction: column;
            }
        }
    </style>
</head>
<body class="bg-[#F0F9FF]">
    <div class="container mx-auto p-4 md:p-8 max-w-6xl">
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-extrabold text-[#004AAD] mb-2">Defensa del Contribuyente: Impuesto al Patrimonio</h1>
            <p class="text-lg md:text-xl font-medium text-[#0094D1]">Deducibilidad de Pasivos del Exterior y la Cláusula de No Discriminación</p>
        </header>
        <main class="space-y-16">
            <section id="core_question" class="bg-white rounded-lg shadow-xl p-6 md:p-8 text-center">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-4">La Pregunta Fundamental</h2>
                <p class="text-xl text-gray-700 max-w-3xl mx-auto">
                    ¿Puede un pasivo contraído en el exterior, por parte de un contribuyente extranjero, ser restado de la base gravable del impuesto al patrimonio en Colombia?
                </p>
                <p class="text-6xl font-extrabold text-green-600 mt-6">SÍ.</p>
                <p class="text-lg text-gray-600">(Y la respuesta se fundamenta en dos pilares independientes)</p>
            </section>
            
            <section id="internal_law" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">Pilar 1: La Ley Interna es Clara y Permisiva</h2>
                <p class="text-center text-gray-700 mb-10 max-w-3xl mx-auto">
                    La propia legislación tributaria colombiana, sin necesidad de recurrir a tratados, permite la deducción. Una interpretación restrictiva carece de sustento legal.
                </p>
                <div class="flex flex-col md:flex-row items-stretch justify-center flex-wrap">
                    <div class="flow-step p-4 m-2 flex-1 min-w-[220px] flow-arrow">
                        <div class="bg-[#B3E2F3] p-4 rounded-lg shadow-md h-full">
                            <p class="font-bold text-[#004AAD] text-lg">Art. 295-3 E.T.</p>
                            <p class="text-sm text-gray-800">La base gravable es el patrimonio bruto <span class="font-bold">menos las deudas</span> vigentes.</p>
                        </div>
                    </div>
                    <div class="flow-step p-4 m-2 flex-1 min-w-[220px] flow-arrow">
                        <div class="bg-[#B3E2F3] p-4 rounded-lg shadow-md h-full">
                            <p class="font-bold text-[#004AAD] text-lg">Remisión al Título II</p>
                            <p class="text-sm text-gray-800">La norma remite a las definiciones generales de deudas para efectos fiscales.</p>
                        </div>
                    </div>
                    <div class="flow-step p-4 m-2 flex-1 min-w-[220px]">
                       <div class="bg-[#78C9E6] p-4 rounded-lg shadow-lg h-full">
                            <p class="font-bold text-[#004AAD] text-lg">Art. 283 E.T.</p>
                            <p class="text-sm text-gray-800">Define las deudas como obligaciones presentes, <span class="font-bold">sin distinguir su origen</span> nacional o internacional.</p>
                        </div>
                    </div>
                </div>
                <div class="mt-10 text-center">
                    <p class="font-semibold text-red-600">Excluir pasivos del exterior vulnera los principios de <span class="font-bold">Legalidad</span> (la ley no lo prohíbe) y <span class="font-bold">Capacidad Contributiva</span> (grava un patrimonio irreal).</p>
                </div>
            </section>
            
            <section id="dta_argument" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-6 text-center">Pilar 2 (Subsidiario): El CDI Prohíbe la Discriminación</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    Incluso si, en gracia de discusión, la ley interna se interpretara de forma restrictiva, el Convenio con el Reino Unido actuaría como un escudo, impidiendo el cobro del impuesto.
                </p>
                <div class="bg-blue-50 border-l-8 border-[#0094D1] p-6 rounded-lg">
                    <h3 class="font-bold text-xl text-[#004AAD] mb-3">Artículo 23: No Discriminación</h3>
                    <blockquote class="text-lg text-gray-800 italic">
                        "Los nacionales de un Estado Contratante <span class="font-bold not-italic text-[#004AAD]">no estarán sometidos en el otro Estado Contratante a ninguna imposición u obligación [...] más gravosa</span> que aquellas a las que estén o puedan estar sometidos los nacionales de ese otro Estado que se encuentren en las mismas condiciones..."
                    </blockquote>
                </div>
            </section>

            <section id="discrimination_visual" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">Visualizando el Trato Discriminatorio</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    Exigir el impuesto al contribuyente del Reino Unido, cuando una sociedad colombiana en idénticas circunstancias no lo pagaría, es una clara violación del Artículo 23 del CDI.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-green-50 border border-green-300 p-6 rounded-lg text-center">
                        <h3 class="font-bold text-lg text-green-800 mb-3">Sociedad Nacional Colombiana</h3>
                        <p class="text-4xl mb-4">🇨🇴</p>
                        <p class="text-gray-700">No estaría sujeta al impuesto al patrimonio en las mismas condiciones.</p>
                        <p class="text-green-700 font-bold text-2xl mt-4">No Paga</p>
                    </div>
                     <div class="bg-red-50 border border-red-300 p-6 rounded-lg text-center">
                        <h3 class="font-bold text-lg text-red-700 mb-3">Residente Fiscal del Reino Unido</h3>
                        <p class="text-4xl mb-4">🇬🇧</p>
                        <p class="text-gray-700">Se le pretende exigir el impuesto, imponiendo una carga más gravosa.</p>
                        <p class="text-red-600 font-bold text-2xl mt-4">¿Obligado a Pagar?</p>
                    </div>
                </div>
            </section>

            <section id="conclusion" class="bg-[#004AAD] text-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold mb-6 text-center">Dos Caminos, Una Conclusión</h2>
                <div class="text-center">
                    <div class="flex flex-col md:flex-row justify-center items-center text-center">
                        <div class="p-4 m-2 rounded-lg bg-sky-700">
                            <p class="font-bold">Vía Ley Interna</p>
                            <p class="text-sm">(Art. 295-3 y 283 E.T.)</p>
                        </div>
                        <p class="text-4xl mx-4 font-thin hidden md:block">🤝</p>
                        <div class="p-4 m-2 rounded-lg bg-sky-700">
                            <p class="font-bold">Vía CDI UK-Colombia</p>
                            <p class="text-sm">(Art. 23 No Discriminación)</p>
                        </div>
                    </div>
                    <p class="text-4xl my-4">⬇</p>
                    <div class="p-6 rounded-lg bg-green-600 text-white">
                        <p class="font-extrabold text-2xl">El contribuyente NO está obligado al pago del impuesto al patrimonio.</p>
                    </div>
                </div>
                <div class="mt-8 border-t border-blue-400 pt-6">
                    <p class="text-center text-lg">Por tanto, ya sea con fundamento en la legislación interna o con base en el CDI, solicitamos se acoja la tesis aquí expuesta y se reconozca que no existe obligación tributaria.</p>
                </div>
            </section>
        </main>
        
        <footer class="text-center mt-12 py-4">
            <p class="text-xs text-gray-600">
                Esta infografía es una representación visual de los argumentos del contribuyente y tiene fines informativos. Creada el 19 de julio de 2025.
            </p>
        </footer>
    </div>

    <script>
        // No se requiere JS para esta infografía, ya que no utiliza gráficos de Chart.js.
    </script>
</body>
</html>`,
            createdAt: new Date().toISOString()
        });
        
        // Infografía de la DIAN - Art. 13 CDI
        infographics.dian.push({
            id: Date.now() + 1,
            title: "La Posición de la DIAN: Art. 13 CDI",
            description: "Infografía que presenta la posición oficial de la DIAN sobre el Artículo 13 del CDI Colombia-UK. Demuestra la aplicación directa y literal de los Comentarios de la OCDE, específicamente el Párrafo 28.4, que establece el método objetivo de cálculo.",
            code: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infografía Posición DIAN: Art. 13 CDI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            scroll-behavior: smooth;
        }
        .chart-container {
            position: relative;
            width: 100%;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
            height: 350px;
            max-height: 400px;
        }
        .formula-box {
            background-color: #E0F2FE;
            border: 2px dashed #0284C7;
            padding: 1.5rem;
            border-radius: 0.5rem;
            text-align: center;
            font-family: 'Courier New', Courier, monospace;
        }
         @media (max-width: 768px) {
            .chart-container {
                height: 300px;
            }
        }
    </style>
</head>
<body class="bg-[#F0F9FF]">
    <div class="container mx-auto p-4 md:p-8 max-w-6xl">
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-extrabold text-[#004AAD] mb-2">La Posición de la DIAN</h1>
            <p class="text-lg md:text-xl font-medium text-[#0094D1]">Una Aplicación Directa y Literal del Artículo 13 del CDI</p>
        </header>
        <main class="space-y-16">
            <section id="common_ground" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-6 text-center">1. El Punto de Partida Correcto</h2>
                <div class="flex justify-center items-center">
                    <p class="text-7xl mr-6">✔</p>
                    <p class="text-lg text-gray-700 max-w-2xl">
                        La DIAN concuerda en que la base para la valoración de los activos debe ser el <span class="font-bold">patrimonio contable (NIIF)</span>, y no el patrimonio fiscal. Este enfoque se alinea con el principio de realidad económica. La controversia no radica aquí, sino en el <span class="font-bold">método de cálculo</span> que debe aplicarse a continuación.
                    </p>
                </div>
            </section>
            
            <section id="golden_rule" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-6 text-center">2. La Regla de Cálculo Decisiva: Párrafo 28.4 OCDE</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    Los Comentarios de la OCDE no dejan lugar a dudas. El Párrafo 28.4 no solo menciona el "valor de las acciones", sino que <span class="font-bold">explícitamente instruye cómo se debe realizar la prueba</span> para determinar si dicho valor deriva de bienes inmuebles.
                </p>
                <div class="bg-blue-50 border-l-8 border-[#0094D1] p-6 rounded-lg">
                    <blockquote class="text-xl text-gray-800 italic">
                        "...se determinará [...] <span class="font-bold not-italic text-[#004AAD]">comparando el valor de dichos inmuebles con el de todos los activos propiedad de la sociedad</span> [...] sin tener en cuenta las deudas u otros pasivos..."
                    </blockquote>
                    <cite class="block text-right mt-4 text-lg text-[#004AAD] font-semibold">Comentarios al Art. 13, Párrafo 28.4</cite>
                </div>
            </section>
            
            <section id="formula" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">3. La Fórmula Objetiva de la OCDE</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    El Párrafo 28.4 se traduce en una fórmula matemática directa y objetiva, que no admite métodos de valoración alternativos ni subjetivos.
                </p>
                <div class="formula-box text-xl md:text-2xl">
                    <p class="font-bold text-[#004AAD]">(Valor de Inmuebles)</p>
                    <p class="font-bold text-2xl md:text-3xl my-2">/</p>
                    <p class="font-bold text-[#004AAD]">(Valor de TODOS los Activos de la Sociedad)</p>
                    <p class="font-bold text-2xl md:text-3xl my-2">&gt;</p>
                    <p class="font-bold text-[#004AAD]">50%</p>
                </div>
            </section>

            <section id="application" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">4. Aplicación al Caso Concreto</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    Aplicando la fórmula explícita de la OCDE a los estados financieros (contables) de la compañía, el resultado es inequívoco.
                </p>
                <div class="chart-container">
                    <canvas id="dianChart"></canvas>
                </div>
                <p class="text-center text-lg text-gray-800 mt-6">El cálculo arroja que el <span class="font-bold text-2xl text-red-600">67%</span> del valor de los activos totales de la compañía proviene de bienes inmuebles, superando claramente el umbral del 50%.</p>
            </section>
            
            <section id="fallacy" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">5. La Falacia del "Valor de la Acción"</h2>
                 <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">El contribuyente intenta desviar la atención hacia métodos de valoración financiera complejos. Sin embargo, estos son irrelevantes cuando el propio Comentario de la OCDE proporciona el método de prueba específico.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-red-50 border border-red-200 p-6 rounded-lg">
                        <h3 class="font-bold text-lg text-red-700 mb-3">Argumento del Contribuyente (Incorrecto)</h3>
                        <p class="text-gray-600">Se debe usar una valoración financiera subjetiva (flujos de caja, múltiplos) para determinar el "valor de la acción".</p>
                        <p class="text-red-600 font-semibold mt-4">Resultado: Ignora la instrucción explícita del Párrafo 28.4.</p>
                    </div>
                     <div class="bg-green-50 border border-green-300 p-6 rounded-lg">
                        <h3 class="font-bold text-lg text-green-800 mb-3">Posición de la DIAN (Correcta)</h3>
                        <p class="text-gray-600">Se debe aplicar la prueba objetiva que la propia OCDE establece: comparar el valor de los inmuebles con el de todos los activos.</p>
                        <p class="text-green-700 font-semibold mt-4">Resultado: Aplicación literal y directa de la norma.</p>
                    </div>
                </div>
            </section>

            <section id="conclusion" class="bg-[#004AAD] text-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold mb-6 text-center">Conclusión para el Tribunal</h2>
                <ol class="space-y-4">
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>La DIAN aplica la metodología de cálculo <span class="font-bold">explícitamente detallada</span> en los Comentarios de la OCDE (Párrafo 28.4).</p>
                    </li>
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>El método es <span class="font-bold">objetivo y verificable</span>: una simple comparación del valor de los activos, sin considerar deudas ni pasivos.</p>
                    </li>
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>La introducción de métodos de valoración financiera alternativos es una complicación innecesaria que <span class="font-bold">contradice la guía de interpretación</span> del Convenio.</p>
                    </li>
                    <li class="flex items-start mt-4 border-t border-blue-400 pt-4">
                        <span class="text-2xl text-white mr-4">⚖️</span>
                        <p class="font-extrabold text-lg">Por lo tanto, al seguir el procedimiento dictado por la OCDE, se confirma que Colombia tiene plena potestad tributaria sobre esta operación.</p>
                    </li>
                </ol>
            </section>
        </main>
        
        <footer class="text-center mt-12 py-4">
            <p class="text-xs text-gray-600">
                Esta infografía es una representación visual de los argumentos de la DIAN y tiene fines informativos. Creada el 19 de julio de 2025.
            </p>
        </footer>
    </div>

    <script>
        const tooltipTitleCallback = (tooltipItems) => {
            const item = tooltipItems[0];
            let label = item.chart.data.labels[item.dataIndex];
            if (Array.isArray(label)) {
                return label.join(' ');
            }
            return label;
        };
        
        const wrapLabel = (label, maxLength = 16) => {
            if (label.length <= maxLength) { return label; }
            const words = label.split(' ');
            const lines = [];
            let currentLine = '';
            for (const word of words) {
                if ((currentLine + ' ' + word).trim().length > maxLength) {
                    lines.push(currentLine.trim());
                    currentLine = word;
                } else {
                    currentLine = (currentLine + ' ' + word).trim();
                }
            }
            if (currentLine) { lines.push(currentLine.trim()); }
            return lines;
        };

        const dianCtx = document.getElementById('dianChart').getContext('2d');
        new Chart(dianCtx, {
            type: 'pie',
            data: {
                labels: ['Valor de Activos Inmuebles', 'Valor de Otros Activos'],
                datasets: [{
                    label: 'Composición de Activos Totales',
                    data: [67, 33],
                    backgroundColor: ['#004AAD', '#78C9E6'],
                    borderColor: '#FFFFFF',
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: { callbacks: { 
                        title: tooltipTitleCallback,
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed + '%';
                            }
                            return label;
                        }
                    }}
                }
            }
        });
    </script>
</body>
</html>`,
            createdAt: new Date().toISOString()
        });
        
        // Infografía de la DIAN - Impuesto al Patrimonio
        infographics.dian.push({
            id: Date.now() + 3,
            title: "Posición de la DIAN: Impuesto al Patrimonio",
            description: "Infografía que presenta la posición oficial de la DIAN sobre el impuesto al patrimonio. Demuestra la sujeción pasiva, el principio de territorialidad y por qué no aplica la cláusula de no discriminación del CDI.",
            code: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Posición DIAN: Impuesto al Patrimonio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            scroll-behavior: smooth;
        }
        .flow-step {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
        }
        .flow-arrow::after {
            content: '➔';
            font-size: 2.5rem;
            color: #0094D1;
            margin: 0 1rem;
        }
        @media (max-width: 768px) {
            .flow-arrow::after {
                 content: '⬇';
                 margin: 1rem 0;
            }
            .flow-step {
                flex-direction: column;
            }
        }
    </style>
</head>
<body class="bg-[#F0F9FF]">
    <div class="container mx-auto p-4 md:p-8 max-w-6xl">
        <header class="text-center mb-12">
            <h1 class="text-4xl md:text-5xl font-extrabold text-[#004AAD] mb-2">Posición de la DIAN: Impuesto al Patrimonio</h1>
            <p class="text-lg md:text-xl font-medium text-[#0094D1]">Sujeción Pasiva, Territorialidad y Aplicación del CDI</p>
        </header>
        <main class="space-y-16">
            <section id="legal_foundation" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">1. La Sujeción Pasiva es Incontrovertible</h2>
                <p class="text-center text-gray-700 mb-10 max-w-3xl mx-auto">
                    La Ley 2277 de 2022 establece con claridad los supuestos para que un no residente sea sujeto pasivo del impuesto al patrimonio. El contribuyente cumple todas las condiciones.
                </p>
                <div class="flex flex-col md:flex-row items-stretch justify-center flex-wrap">
                    <div class="flow-step p-4 m-2 flex-1 min-w-[220px] flow-arrow">
                        <div class="bg-[#B3E2F3] p-4 rounded-lg shadow-md h-full">
                            <p class="font-bold text-[#004AAD] text-lg">Sujeto No Residente</p>
                            <p class="text-sm text-gray-800">HMI es una entidad extranjera sin residencia fiscal en Colombia.</p>
                        </div>
                    </div>
                    <div class="flow-step p-4 m-2 flex-1 min-w-[220px] flow-arrow">
                        <div class="bg-[#B3E2F3] p-4 rounded-lg shadow-md h-full">
                            <p class="font-bold text-[#004AAD] text-lg">Patrimonio en Colombia</p>
                            <p class="text-sm text-gray-800">Posee activos ubicados en el país al 1° de enero de 2023.</p>
                        </div>
                    </div>
                    <div class="flow-step p-4 m-2 flex-1 min-w-[220px]">
                       <div class="bg-[#78C9E6] p-4 rounded-lg shadow-lg h-full">
                            <p class="font-bold text-[#004AAD] text-lg">Supera el Umbral</p>
                            <p class="text-sm text-gray-800">El valor de dicho patrimonio excede las 72.000 UVT.</p>
                        </div>
                    </div>
                </div>
                <div class="mt-10 text-center p-4 bg-green-100 border border-green-300 rounded-lg">
                    <p class="font-semibold text-green-800 text-xl">Conclusión: La sujeción pasiva de HMI al impuesto está plenamente configurada.</p>
                </div>
            </section>
            
            <section id="systematic_interpretation" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">2. El Principio de Territorialidad: El Vínculo Indivisible</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    La ley debe leerse de forma sistemática. Si la tributación se limita al patrimonio en Colombia, las deducciones deben seguir la misma lógica territorial.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
                    <div class="bg-blue-50 p-6 rounded-lg h-full">
                        <h3 class="font-bold text-lg text-[#004AAD]">Base Gravable (Art. 292-3)</h3>
                        <p class="text-gray-700 mt-2">Los no residentes tributan <span class="font-bold">únicamente sobre el patrimonio poseído en Colombia.</span></p>
                    </div>
                    <div class="text-6xl text-sky-500 font-bold">
                        🔗
                    </div>
                    <div class="bg-blue-50 p-6 rounded-lg h-full">
                        <h3 class="font-bold text-lg text-[#004AAD]">Deudas Deducibles (Art. 295-3)</h3>
                        <p class="text-gray-700 mt-2">Por tanto, solo pueden restarse las deudas <span class="font-bold">asociadas a dicho patrimonio</span> y operaciones locales.</p>
                    </div>
                </div>
                <div class="mt-10 text-center p-4 bg-red-100 border border-red-300 rounded-lg">
                    <p class="font-semibold text-red-700 text-lg">Permitir la deducción de un pasivo externo no vinculado erosiona la base gravable y viola el principio de territorialidad del impuesto.</p>
                </div>
            </section>
            
            <section id="dta_rejection" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-6 text-center">3. ¿Por qué no aplica la Cláusula de No Discriminación?</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    El argumento del contribuyente sobre el Artículo 23 del CDI es improcedente por dos razones fundamentales y autónomas.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-gray-100 p-6 rounded-lg text-center">
                        <p class="text-5xl mb-4">📄</p>
                        <h3 class="font-bold text-lg text-gray-800">Impuesto No Cubierto</h3>
                        <p class="text-gray-600">El impuesto al patrimonio <span class="font-bold">no está expresamente listado</span> en el Artículo 2 del Convenio. Su naturaleza es distinta a los impuestos sobre la renta, por lo que la cláusula de no discriminación no se extiende automáticamente.</p>
                    </div>
                     <div class="bg-gray-100 p-6 rounded-lg text-center">
                        <p class="text-5xl mb-4">➗</p>
                        <h3 class="font-bold text-lg text-gray-800">No Existe Discriminación</h3>
                        <p class="text-gray-600">No se cumplen los supuestos fácticos. La comparación relevante no es entre un residente del UK y un residente de Colombia, sino <span class="font-bold">entre no residentes</span>, quienes reciben el mismo trato.</p>
                    </div>
                </div>
            </section>

            <section id="correct_comparison" class="bg-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold text-[#004AAD] mb-8 text-center">La Comparación Correcta</h2>
                <p class="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                    La cláusula de no discriminación protege contra un trato desfavorable por razón de nacionalidad. Aquí, el tratamiento es idéntico para todos los no residentes, sin importar su origen.
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-bold text-lg text-blue-800">Residente UK 🇬🇧</h3>
                        <p class="mt-2">Tributa sobre patrimonio en CO.</p>
                        <p>No deduce pasivos externos.</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-bold text-lg text-blue-800">Residente USA 🇺🇸</h3>
                        <p class="mt-2">Tributa sobre patrimonio en CO.</p>
                        <p>No deduce pasivos externos.</p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h3 class="font-bold text-lg text-blue-800">Residente Japón 🇯🇵</h3>
                        <p class="mt-2">Tributa sobre patrimonio en CO.</p>
                        <p>No deduce pasivos externos.</p>
                    </div>
                </div>
                <p class="text-center text-xl font-bold text-green-700 mt-8">Resultado: Tratamiento Idéntico = No Hay Discriminación</p>
            </section>

            <section id="conclusion" class="bg-[#004AAD] text-white rounded-lg shadow-xl p-6 md:p-8">
                <h2 class="text-3xl font-bold mb-6 text-center">Solicitud al Tribunal</h2>
                <p class="text-center text-lg mb-8">Con base en los argumentos expuestos, la DIAN solicita respetuosamente que se confirme la legalidad del acto administrativo en disputa.</p>
                <ol class="space-y-4">
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>Se determinó correctamente la <span class="font-bold">sujeción pasiva</span> del contribuyente al impuesto al patrimonio.</p>
                    </li>
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>Es <span class="font-bold">improcedente restar un pasivo externo</span> no vinculado al patrimonio poseído en Colombia, en virtud del principio de territorialidad.</p>
                    </li>
                    <li class="flex items-start">
                        <span class="text-2xl text-green-300 mr-4">✔</span>
                        <p>El Convenio para evitar la doble imposición es <span class="font-bold">inaplicable</span>, al no existir una real situación de discriminación.</p>
                    </li>
                </ol>
            </section>
        </main>
        
        <footer class="text-center mt-12 py-4">
            <p class="text-xs text-gray-600">
                Esta infografía es una representación visual de los argumentos de la DIAN y tiene fines informativos. Creada el 19 de julio de 2025.
            </p>
        </footer>
    </div>

    <script>
        // No se requiere JS para esta infografía.
    </script>
</body>
</html>`,
            createdAt: new Date().toISOString()
        });
    }
    
    renderInfographics('dian');
    renderInfographics('contributor');
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Agregar estilos CSS para animaciones de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 