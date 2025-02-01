/*const temps = [];
 
function updateTemperatureTable() {
    const tempBody = document.getElementById('temp-body');
    tempBody.innerHTML = '';

    state.temps.forEach(temp => {
        const row = document.createElement('tr');
        const timestampCell = document.createElement('td');
        const temperatureCell = document.createElement('td');

        timestampCell.textContent = temp.timestamp.toLocaleString();
        temperatureCell.textContent = temp.temperature;

        row.appendChild(timestampCell);
        row.appendChild(temperatureCell);
        tempBody.appendChild(row);
    });
}

setInterval(getTemperature,  1000);

// Initial call to populate the table immediately
getTemperature();*/