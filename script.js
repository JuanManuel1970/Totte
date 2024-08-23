// Obtener los elementos del DOM
const dataForm = document.getElementById('dataForm');
const fechaInput = document.getElementById('fechaInput');
const clienteInput = document.getElementById('clienteInput');
const ddtInput = document.getElementById('ddtInput');
const importeInput = document.getElementById('importeInput');
const dataTableBody = document.querySelector('#dataTable tbody');
const clearAllBtn = document.getElementById('clearAllBtn');

let editingRow = null;
let sortDirection = 'asc'; // Estado de ordenamiento por defecto

// Cargar los datos desde LocalStorage al iniciar la página
document.addEventListener('DOMContentLoaded', loadData);

// Agregar nuevo dato o editar dato existente cuando se envíe el formulario
dataForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fecha = fechaInput.value.trim();
    const cliente = clienteInput.value.trim();
    const ddt = ddtInput.value.trim();
    const importe = importeInput.value.trim();

    // Validar que el número de DDT tenga exactamente 9 dígitos
    if (!/^\d{9}$/.test(ddt)) {
        alert('El número de DDT debe tener exactamente 9 dígitos.');
        return;
    }

    if (fecha && cliente && ddt && importe) {
        const newData = { fecha, cliente, ddt, importe };

        if (editingRow !== null) {
            updateDataInTable(newData);
            updateDataInLocalStorage(newData);
        } else {
            addDataToTable(newData);
            saveDataToLocalStorage(newData);
        }

        clearForm();
        editingRow = null;
    }
});

// Borrar todos los datos
clearAllBtn.addEventListener('click', function () {
    localStorage.removeItem('data');
    dataTableBody.innerHTML = ''; // Limpiar la tabla en el DOM
});

// Función para cargar los datos desde LocalStorage al DOM
function loadData() {
    const storedData = JSON.parse(localStorage.getItem('data')) || [];
    const savedDate = localStorage.getItem('savedDate');
    if (savedDate) fechaInput.value = savedDate;
    storedData.forEach(item => addDataToTable(item));
}

// Función para agregar un dato a la tabla en el DOM
function addDataToTable(data) {
    const row = document.createElement('tr');

    const fechaCell = document.createElement('td');
    fechaCell.textContent = data.fecha;
    row.appendChild(fechaCell);

    const clienteCell = document.createElement('td');
    clienteCell.textContent = data.cliente;
    row.appendChild(clienteCell);

    const ddtCell = document.createElement('td');
    ddtCell.textContent = data.ddt;
    row.appendChild(ddtCell);

    const importeCell = document.createElement('td');
    importeCell.textContent = data.importe;
    row.appendChild(importeCell);

    const actionsCell = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.classList.add('edit');
    editBtn.addEventListener('click', () => {
        editDataInForm(data, row);
    });
    actionsCell.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.classList.add('delete');
    deleteBtn.addEventListener('click', () => {
        deleteDataFromLocalStorage(data);
        dataTableBody.removeChild(row);
    });
    actionsCell.appendChild(deleteBtn);

    row.appendChild(actionsCell);

    dataTableBody.appendChild(row);
}

// Función para guardar un dato en LocalStorage
function saveDataToLocalStorage(data) {
    let storedData = JSON.parse(localStorage.getItem('data')) || [];
    storedData.push(data);
    localStorage.setItem('data', JSON.stringify(storedData));
    localStorage.setItem('savedDate', fechaInput.value);
}

// Función para eliminar un dato de LocalStorage
function deleteDataFromLocalStorage(data) {
    let storedData = JSON.parse(localStorage.getItem('data')) || [];
    storedData = storedData.filter(item => 
        item.fecha !== data.fecha ||
        item.cliente !== data.cliente || 
        item.ddt !== data.ddt || 
        item.importe !== data.importe
    );
    localStorage.setItem('data', JSON.stringify(storedData));
}

// Función para cargar los datos en el formulario para su edición
function editDataInForm(data, row) {
    clienteInput.value = data.cliente;
    ddtInput.value = data.ddt;
    importeInput.value = data.importe;
    editingRow = row;
}

// Función para actualizar un dato en la tabla en el DOM
function updateDataInTable(data) {
    editingRow.children[0].textContent = data.fecha;
    editingRow.children[1].textContent = data.cliente;
    editingRow.children[2].textContent = data.ddt;
    editingRow.children[3].textContent = data.importe;
}

// Función para actualizar un dato en LocalStorage
function updateDataInLocalStorage(updatedData) {
    let storedData = JSON.parse(localStorage.getItem('data')) || [];
    storedData = storedData.map(item => 
        item.fecha === editingRow.children[0].textContent &&
        item.cliente === editingRow.children[1].textContent &&
        item.ddt === editingRow.children[2].textContent &&
        item.importe === editingRow.children[3].textContent
        ? updatedData
        : item
    );
    localStorage.setItem('data', JSON.stringify(storedData));
}

// Función para limpiar el formulario
function clearForm() {
    clienteInput.value = '';
    ddtInput.value = '';
    importeInput.value = '';
}

// Función para ordenar la tabla por columna
function sortTable(column) {
    const rowsArray = Array.from(dataTableBody.rows);
    let sortedRows;

    if (column === 'fecha') {
        sortedRows = rowsArray.sort((a, b) => {
            const dateA = new Date(a.cells[0].textContent);
            const dateB = new Date(b.cells[0].textContent);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
    } else if (column === 'cliente') {
        sortedRows = rowsArray.sort((a, b) => {
            const textA = a.cells[1].textContent.toLowerCase();
            const textB = b.cells[1].textContent.toLowerCase();
            return sortDirection === 'asc' ? textA.localeCompare(textB) : textB.localeCompare(textA);
        });
    } else if (column === 'ddt') {
        sortedRows = rowsArray.sort((a, b) => {
            const numA = parseInt(a.cells[2].textContent, 10);
            const numB = parseInt(b.cells[2].textContent, 10);
            return sortDirection === 'asc' ? numA - numB : numB - numA;
        });
    } else if (column === 'importe') {
        sortedRows = rowsArray.sort((a, b) => {
            const numA = parseFloat(a.cells[3].textContent);
            const numB = parseFloat(b.cells[3].textContent);
            return sortDirection === 'asc' ? numA - numB : numB - numA;
        });
    }

    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'; // Cambiar dirección de ordenamiento

    dataTableBody.innerHTML = ''; // Limpiar tabla
    sortedRows.forEach(row => dataTableBody.appendChild(row)); // Reagregar filas ordenadas
}
