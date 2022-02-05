/*
Nota importante:
La API de OpenWeather tarda BASTANTE en cargar, y se "sobrecarga" (da error al realizar "demasiadas" peticiones) de forma muy fácil.
No creo que se de el caso, pero si se recarga la web "index" de forma muy seguida, la API llega al límite de peticiones por día y "banea" la key durante 1 día.
Lo dejo escrito por si a caso pasa, pero ya digo que dudo que suceda.
*/
'use strict'
console.log('Empieza el programa');

//Función para obtener la latitud y altitud de una ciudad, con una API especializada, ya que la API gratuita de OpenWeather
//me obliga a realizar la búsqueda a partir de éstos datos si quiero los datos de toda la semana.
async function calcLatLon (nombreCiudad) {
    try{
        const res = await fetch("https://api.opencagedata.com/geocode/v1/json?q=" + nombreCiudad + "&key=00dc7116fdfc40b793d1cd1ebdd3f5bb");
        const data = await res.json();
        let result = [data.results[0].geometry.lat, data.results[0].geometry.lng];
        return result;
    }catch (error) {
        console.log("Error encontrado");
        console.log(error);
    }
}

//Función que consulta el tiempo con los valores conseguidos mediante la función calcLatLon.
async function consultaTiempo (lat, lng) {
    try{
        const res = await fetch("https://api.openweathermap.org/data/2.5/onecall?appid=ee8c0de3abcfbb1f8e57988119cc5ffb&exclude=hourly,minutely&units=metric&lat=" + lat + "&lon=" + lng);
        const data = await res.json();
        return data;
    }catch (error) {
        console.log("Error encontrado");
        console.log(error);
    }
}

//Busca los datos del tiempo de las capitales Españolas y los manda a la función pintarTiempoInicial.
async function tiempoInicial () {
    let arrayTiempo = [];
    let arrayNombreCiudades = [];
    try{
        const res = await fetch("https://github.com/algutierrezsm/DWEC04/blob/38ea7a3a117d9e65fc60dc61de0a958b54c3e4b4/ajax/capitales.json");
        const data = await res.json();

        //Bucle para crear un array con todos los datos del tiempo de las ciudades iniciales seleccionadas (capitales Españolas).
        for(var i = 0; i<data.length; i++) {
            let nombreCiudad = data[i].nombre;
            let latLonCiudad = await calcLatLon (nombreCiudad);
            arrayNombreCiudades.push(nombreCiudad);
            arrayTiempo.push(await consultaTiempo(latLonCiudad[0], latLonCiudad[1]));
        }
        pintarTiempoInicial(arrayNombreCiudades, arrayTiempo);
    }catch (error) {
        console.log("Error encontrado");
        console.log(error);
    }
}

//Función que pinta en pantalla los datos del tiempo de las capitales Españolas.
function pintarTiempoInicial($arrayNombreCiudades, $arrayTiempo) {
    let contenedorCapitales = document.getElementById("tablaCapitales");
    for(var i = 0; i < $arrayTiempo.length; i++) {
        let row = contenedorCapitales.insertRow();
        row.className = "weatherCardWrapper";

        //Primero inserta el nombre de la ciudad.
        let tdNombreCiudad = row.insertCell(0);

        //El anchor creado redirigirá a la página de búsqueda y mostrará el valor elegido en la url.
        let anchorCiudad = document.createElement("a");
        let linkText = document.createTextNode($arrayNombreCiudades[i]);
        anchorCiudad.appendChild(linkText);
        anchorCiudad.setAttribute("href", "pagBusqueda.html?name=" + anchorCiudad.innerHTML);
        tdNombreCiudad.appendChild(anchorCiudad);
        
        //Captura el contenedor de la tabla y crea los diferentes div, td, tr y p que formarán la "carta" de "el tiempo".
        //Valores de "ahora".
        let cell0 = row.insertCell(1);
        let contenedorWrapperCard0 = document.createElement("div");
        
        //Crea el icono correspondiente al tiempo y lo añade al div
        let icono0 = document.createElement("img");
        icono0.className = "iconoWeatherCard";
        icono0.src = "http://openweathermap.org/img/wn/"+$arrayTiempo[i].current.weather[0].icon+"@2x.png";
        contenedorWrapperCard0.appendChild(icono0);

        //Consigue y redondea la temperatura máxima y mínima, y la añade al div
        let temp0 = Math.round($arrayTiempo[i].current.temp);
        let temperatura0 = document.createElement("p");
        temperatura0.className = "temperaturaWeatherCard";
        temperatura0.innerHTML = temp0 + "º";
        contenedorWrapperCard0.appendChild(temperatura0);

        cell0.appendChild(contenedorWrapperCard0);

        //For que repite 3 veces el mismo código con los datos de los 3 próximos días.
        //Está separado del tiempo actual ya que los datos son diferentes y la consulta también.
        for(var j = 2; j <= 4; j++){
            let cell = row.insertCell(j);
            let contenedorWrapperCard = document.createElement("div");
            cell.appendChild(contenedorWrapperCard);

            let icono = document.createElement("img");
            icono.className = "iconoWeatherCard";
            icono.src = "http://openweathermap.org/img/wn/"+$arrayTiempo[i].daily[j].weather[0].icon+"@2x.png";
            contenedorWrapperCard.appendChild(icono);
            
            let tempMax = Math.round($arrayTiempo[i].daily[j].temp.max);
            let tempMin = Math.round($arrayTiempo[i].daily[j].temp.min);
            let temperatura = document.createElement("p");
            temperatura.className = "temperaturaWeatherCard";
            temperatura.innerHTML = tempMax + "º " + tempMin + "º";
            contenedorWrapperCard.appendChild(temperatura);

            cell.appendChild(contenedorWrapperCard);
        }
        //Esconde la pantalla de carga de la web y muestra el contenido de la api.
        document.getElementById('contenedorPantallaCarga').style.display = "none";
        document.getElementById('contenedorTablaEstilo').style.display = "unset";
    }
}

//Redirige a la página de resultado de la búsqueda guardando en el localstorage
function redirigir() {

    //Validación para comprobar que el navegador es compatible con localStorage y sessionStorage.
    if (typeof(Storage) !== 'undefined') {
        // Código cuando Storage es compatible
        let userInput = document.querySelector('#busquedaTiempo').value;
        let nombreCiudad = userInput;
        sessionStorage.setItem("nombreCiudad", nombreCiudad);
        location.href='pagBusqueda.html';
      } else {
       // Código cuando Storage NO es compatible
       window.alert("Navegador no compatible. Actualización necesaria para el correcto funcionamiento de la aplicación web.");
      }
}

let nombreCiudadStorage;
//Comprueba si se encuentra en la web principal o de búsqueda.
//En caso de ser la principal, genera los datos del tiempo de las capitales de España.
//En caso de no encontrarse en la principal, detecta si se ha accedido mediante búsqueda o click en uno de los anchor.
function comprobarPaginaActual(){
    let titulo = document.getElementsByTagName("title")[0];
    if(titulo.innerHTML == "El Tiempo"){
        tiempoInicial();
    }else if(window.location.href.indexOf("?") != -1){
        let nombreCiudad = window.location.search.slice(6);
        obtenerDatosTiempoBuscado(nombreCiudad);
    }else{
        //En caso de no estar en la página principal, obtiene la variable de sesión "nombreCiudadStorage".
        nombreCiudadStorage = sessionStorage.getItem("nombreCiudad");
        obtenerDatosTiempoBuscado(nombreCiudadStorage);
    }
}

//Función asíncrona para obtener los datos del tiempo de la ciudad buscada por el usuario.
async function obtenerDatosTiempoBuscado($nombreCiudadStorage) {
    let datosTiempo = [];
    let latLonCiudad = await calcLatLon ($nombreCiudadStorage);
    initMap(latLonCiudad[0], latLonCiudad[1]);
    datosTiempo.push(await consultaTiempo(latLonCiudad[0], latLonCiudad[1]));
    pintarTiempoBuscado(datosTiempo, $nombreCiudadStorage);
}

function pintarTiempoBuscado($datosTiempo, $nombreCiudadStorage){
    let datosTiempo = $datosTiempo;
    let nombreCiudad = $nombreCiudadStorage;

    let tituloBusqueda = document.querySelector("#tituloBusqueda");
    tituloBusqueda.innerHTML = "El tiempo en " + nombreCiudad;
    tituloBusqueda.style.textDecoration = "underline";

    //Temperatura actual
    //Variables
    let temperaturaActual = Math.round(datosTiempo[0].current.temp) + "º";
    let iconoActual = datosTiempo[0].current.weather[0].icon;
    let humedadActual = datosTiempo[0].current.humidity; //Porcentual
    let velocidadVientoActual = datosTiempo[0].current.wind_speed; //Km/h
    let presionActual = datosTiempo[0].current.humidity;
    let sensacionTermActual = datosTiempo[0].current.feels_like + "º";

    //Captura el contenedor de la tabla y crea los diferentes div, td, tr y p que formarán la "carta" de "el tiempo".
    let contenedorTablaBusqueda = document.getElementById("tablaBusqueda");
    let row0 = contenedorTablaBusqueda.insertRow();
    row0.className = "weatherCardWrapper";

    let cell0 = row0.insertCell(0);
    cell0.setAttribute("colspan", "5");
    let contenedorWrapperCard0 = document.createElement("div");
    
    //Titulo de el tiempo actual
    let tituloActual = document.createElement("h1");
    tituloActual.style.textDecoration = "underline";
    tituloActual.innerHTML = "Temperatura Actual";
    contenedorWrapperCard0.appendChild(tituloActual);

    //Crea el icono correspondiente al tiempo y lo añade al div
    let icono0 = document.createElement("img");
    icono0.className = "iconoWeatherCard";
    icono0.src = "http://openweathermap.org/img/wn/"+iconoActual+"@2x.png";
    contenedorWrapperCard0.appendChild(icono0);

    //Temperatura actual
    let temperatura0 = document.createElement("p");
    temperatura0.className = "temperaturaWeatherCard";
    temperatura0.innerHTML = temperaturaActual;
    contenedorWrapperCard0.appendChild(temperatura0);

    //Sensación Térmica
    let sensacion0 = document.createElement("p");
    sensacion0.className = "temperaturaWeatherCard";
    sensacion0.innerHTML = "Sensación Térmica: " + sensacionTermActual;
    sensacion0.style.display = "inline";
    sensacion0.style.marginRight = "10px";
    contenedorWrapperCard0.appendChild(sensacion0);

    //Humedad Actual
    let humedad0 = document.createElement("p");
    humedad0.className = "temperaturaWeatherCard";
    humedad0.innerHTML = "Humedad: " + humedadActual + "%";
    humedad0.style.display = "inline";
    humedad0.style.marginRight = "10px";
    contenedorWrapperCard0.appendChild(humedad0);

    //Velocidad Viento Actual
    let velocidadViento0 = document.createElement("p");
    velocidadViento0.className = "temperaturaWeatherCard";
    velocidadViento0.innerHTML = "Velocidad Viento: " + velocidadVientoActual + " Km/h";
    velocidadViento0.style.display = "inline";
    velocidadViento0.style.marginRight = "10px";
    contenedorWrapperCard0.appendChild(velocidadViento0);

    //Presión Atmosférica hPa
    let presion0 = document.createElement("p");
    presion0.className = "temperaturaWeatherCard";
    presion0.innerHTML = "Presión Atmosférica: " + presionActual + " hPa";
    presion0.style.display = "inline";
    contenedorWrapperCard0.appendChild(presion0);
    cell0.appendChild(contenedorWrapperCard0);
    
    let row = contenedorTablaBusqueda.insertRow();
    row.className = "weatherCardWrapper";

    //Proximos 5 dias
    for(var i=0; i<5; i++){

        //Variables
        let tempMax = Math.round(datosTiempo[0].daily[i].temp.max);
        let tempMin = Math.round(datosTiempo[0].daily[i].temp.min);
        let temperaturaDato = tempMax + "º " + tempMin + "º";
        let iconoDato = datosTiempo[0].daily[i].weather[0].icon;
        let tituloDato = titulosTiempoBusqueda(i);

        let cell = row.insertCell(i);
        let contenedorWrapperCard = document.createElement("div");

        //Crea el título correspondiente a cada día.
        let titulo = document.createElement("h3");
        titulo.innerHTML = tituloDato;
        titulo.style.textDecoration = "underline";
        contenedorWrapperCard.appendChild(titulo);

        //Crea el icono correspondiente al tiempo y lo añade al div
        let icono = document.createElement("img");
        icono.className = "iconoWeatherCard";
        icono.src = "http://openweathermap.org/img/wn/"+ iconoDato +"@2x.png";
        contenedorWrapperCard.appendChild(icono);

        //Temperatura Máxima y Mínima
        let temperatura = document.createElement("p");
        temperatura.className = "temperaturaWeatherCard";
        temperatura.innerHTML = temperaturaDato;
        contenedorWrapperCard.appendChild(temperatura);
        cell.appendChild(contenedorWrapperCard);
    }
    //Esconde la pantalla de carga de la web y muestra el contenido de la api.
    document.getElementById('contenedorPantallaCarga').style.display = "none";
    document.getElementById('contenedorTablaBusqueda').style.display = "unset";

    //Muestra el mapa de google maps de la localización seleccionada.
    document.getElementById('map').style.display = "block";
}

//Función encargada de devolver el título correspondiente a cada carta de tiempo.
function titulosTiempoBusqueda($i) {
    if($i == 0){
        return "Temperatura Mañana";
    }else if($i == 1){
        return "Temperatura Pasado Mañana";
    }else if($i == 2){
        return "Temperatura en Tres Días";
    }else if($i == 3){
        return "Temperatura en Cuatro Días";
    }else{
        return "Temperatura en Cinco Días";
    }
}

// Función encargada de crear un mapa de google maps dependiendo de el lugar escogido.
function initMap($lat, $lng) {
    const location = { lat: $lat, lng: $lng };
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: location,
    });
    const marker = new google.maps.Marker({
      position: location,
      map: map,
    });
}

// |------------------- MAIN ------------------------|
comprobarPaginaActual();
console.log('Acaba el programa');
