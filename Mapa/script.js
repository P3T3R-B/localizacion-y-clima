const API_KEY = '4dc7ca8cc5c421245dc6b496876d98d8';

function obtenerDatosClimaticos(latitude, longitude) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            return {
                temperatura: data.main.temp,
                humedad: data.main.humidity,
                radiacion: data.weather[0].description // OpenWeatherMap no proporciona radiación directa, así que usamos descripción del clima
            };
        });
}

function llenarTabla(datos) {
    $('#datos').empty();
    $('#datos').append(`
        <tr>
            <td>${datos.temperatura} °C</td>
            <td>${datos.humedad} %</td>
            <td>${datos.radiacion}</td>
        </tr>
    `);
}

function agregarMarcador(map, latitude, longitude) {
    return L.marker([latitude, longitude]).addTo(map).bindPopup('Coordenadas: ' + latitude.toFixed(4) + ', ' + longitude.toFixed(4)).openPopup();
}

function inicializarMapa(latitude, longitude) {
    const map = L.map("map").setView([latitude, longitude], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.marker([latitude, longitude]).addTo(map).bindPopup('Tu estas <b>AQUI</b>').openPopup();
    return map;
}

function obtenerUbicacion() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject("Geolocation no es soportada en este navegador");
        }
    });
}

$(document).ready(function() {
    var map;
    var markers = [];

    $('#buscar').click(async function() {
        var municipioSeleccionado = $('#municipios').val();
        if (municipioSeleccionado) {
            const posicion = await obtenerUbicacion();
            const latitude = posicion.coords.latitude;
            const longitude = posicion.coords.longitude;
            const datos = await obtenerDatosClimaticos(latitude, longitude);
            llenarTabla(datos);
        } else {
            alert('Por favor selecciona un municipio.');
        }
    });

    async function manejarClicEnMapa(e) {
        markers.forEach(marker => {
            map.removeLayer(marker);
        });
        markers = [];

        var latitude = e.latlng.lat;
        var longitude = e.latlng.lng;
        const datos = await obtenerDatosClimaticos(latitude, longitude);
        llenarTabla(datos);

        var marker = agregarMarcador(map, latitude, longitude);
        markers.push(marker);
    }

    async function iniciar() {
        try {
            const posicion = await obtenerUbicacion();
            const latitude = posicion.coords.latitude;
            const longitude = posicion.coords.longitude;
            map = inicializarMapa(latitude, longitude);
            map.on('click', manejarClicEnMapa);
        } catch (error) {
            alert("Error al obtener la ubicación: " + error);
        }
    }

    iniciar();
});
