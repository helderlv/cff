"use strict";
// getCoordinates()
// Demande au navigateur de détecter la position actuelle de l'utilisateur et retourne une Promise
const getCoordinates = ()=>{
    return new Promise((res, rej)=>navigator.geolocation.getCurrentPosition(res, rej));
};
// getPosition()
// Résout la promesse de getCoordinates et retourne un objet {lat: x, long: y}
const getPosition = async ()=>{
    const position = await getCoordinates();
    return {
        lat: position.coords.latitude,
        long: position.coords.longitude
    };
};
// renderWeather(min, max)
// Affiche la valeur des deux paramêtres dans le widget de météo
const renderWeather = (min, max)=>{
    document.querySelector(".min").textContent = `${min}\xb0C`;
    document.querySelector(".max").textContent = `${max}\xb0C`;
    return;
};
// parseStationData(rawData)
// Reçoit la réponse JSON de l'API Transport/stationboard et recrache un objet
// ne contenant que les informations pertinentes.
const parseStationData = (rawData)=>{
    const { stationboard } = rawData;
    const departures = stationboard.map((el)=>{
        const date = new Date(el.stop.departure);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedHours = date.getHours() < 10 ? "0" + hours : hours;
        const formattedMinutes = date.getMinutes() < 10 ? "0" + minutes : minutes;
        return {
            departure: `${formattedHours}:${formattedMinutes}`,
            destination: el.to,
            category: el.category
        };
    });
    return {
        station: rawData.station.name,
        departures
    };
};
// renderTrain(train)
// Affiche une ligne de départ dans le widget CFF.
const renderTrain = (train)=>{
    const board = document.querySelector(".departures");
    const html = `
    <article>
        <div class="time">${train.departure}</div>
        <div class="category" data-category="${train.category}">${train.category}</div>
        <div class="destination">${train.destination}</div>
    </article>
    `;
    board.insertAdjacentHTML("beforeend", html);
    return;
};
// renderStationName(station)
// Affiche le mot passé en paramettre dans le widget CFF. 
const renderStationName = (station)=>{
    const stationElement = document.querySelector(".departures header p");
    stationElement.textContent = station;
};
// Votre code peut se trouver dans cette fonction. L'appel vers getPosition est
// déjà implémenté. Si vous jetez un coup d'oeil à votre console vous verrez un objet
// contenant votre position.
const getDashboardInformation = ()=>{
    getPosition().then((res)=>{
        console.log(res);
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${res.lat}&longitude=${res.long}&daily=apparent_temperature_max,apparent_temperature_min&timezone=auto`).then((rep)=>rep.json()).then((data)=>{
            console.log(data);
            renderWeather(data.daily.apparent_temperature_min[0], data.daily.apparent_temperature_max[0]);
        });
        fetch(`http://transport.opendata.ch/v1/locations?x=${res.lat}&y=${res.long}&type=station`).then((rep)=>rep.json()).then((data)=>{
            const result = data.stations.filter((element)=>element.icon === "train")[0];
            console.log(result);
            if (!result) throw new Error("\uD83E\uDD72 No TRAIN STATIONS NEARBY");
            console.log(result.name);
            renderStationName(result.name);
            return fetch(`https://transport.opendata.ch/v1/stationboard?station=${result.name}&limit=5`);
        }).then((rep)=>rep.json()).then((data)=>{
            console.log(parseStationData(data));
            for(let i = 0; i < parseStationData(data).departures.length; i++)renderTrain(parseStationData(data).departures[i]);
        })//console.log(data);
        .catch((err)=>{
            //console.error(err);
            renderStationName(err.message);
        });
    });
};
getDashboardInformation();

//# sourceMappingURL=index.7c0ccee6.js.map
