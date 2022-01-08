// adding map layers 
var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, 
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var CyclOSM = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
	maxZoom: 20,
	attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let basemaps = {
    "Base Map": defaultMap,
    "Topo1": topoMap,
    "Top2": CyclOSM,
    Default: defaultMap
};

var myMap = L.map("map", {
    center: [36.7783, -119.4179], 
    zoom: 5,
    layers: [defaultMap, topoMap, CyclOSM]
});

defaultMap.addTo(myMap); 

// L.control.layers(basemaps).addTo(myMap); 

// adding data 

let tectonicPlates = new L.layerGroup(); 

d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
.then(function(plateData){
    // console.log(plateData);
    L.geoJson(plateData,{
        color: "red",
        weight: 1
    }).addTo(tectonicPlates); 
});
tectonicPlates.addTo(myMap); 



let earthquakes = new L.layerGroup(); 

d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
.then(function(earthquakeData){
        // console.log(earthquakeData);
        function dataColor(depth){
            if (depth > 90)
                return 'red';
            else if (depth > 70)
                return '#f59042';
            else if (depth > 50)
                return '#f5c542';
            else if (depth > 30)
                return '#e0f542';
            else if (depth > 10)
                return '#abeb23';
            else 
                return '#52eb23'; 
        }
        function radiusSize(mag){
            if (mag == 0 )
                return 1;
            else 
                return mag * 5;  
        }
        function dataStyle(feature)
        {
            return{
                opacity: .5,
                fillOpacity: .5,
                fillColor: dataColor(feature.geometry.coordinates[2]),
                color: '000000',
                radius: radiusSize(feature.properties.mag),
                weight: 0.5,
                stroke: true  
            }
        }
        L.geoJson(earthquakeData, {
            pointToLayer: function(_feature, latLng){
                return L.circleMarker(latLng); 
            },
            style: dataStyle,
            onEachFeature: function(feature, layer){
                layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                Depth (km): <b>${feature.geometry.coordinates[2]}</b><br>
                Location: <b>${feature.properties.place}</b>`);
            }
        }).addTo(earthquakes); 
    }
); 
earthquakes.addTo(myMap); 

// nooooodling heatmap layer
let heatmap = new L.layerGroup(); 
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
.then(function(heatmapData){
    console.log(heatmapData); 
    
    var heatArray = []; 

    for (var i = 0; i < heatmapData.features.length; i++) 
    {
        var location = heatmapData.features[i].geometry; 
        // console.log(location[0]);     
   
        if (location) {
            heatArray.push([location.coordinates[1], location.coordinates[0]]); 
        }
    }
    console.log(heatArray); 
    
    L.heatLayer(heatArray, {
        radius: 1000,
        blur: 35, 
        Default: 'off'
    }).addTo(heatmap); 
});



let overLays = { 
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes,
    "Heat Map": heatmap
}; 

L.control.layers(basemaps, overLays).addTo(myMap); 

// add the legend 

let legend = L.control({
    position: "bottomright"
});

legend.onAdd = function(){
    let div = L.DomUtil.create("div", "info legend");

    let intervals = [-10, 10, 30, 50, 70, 90]; 
    
    let colors = [
        '#52eb23',
        '#abeb23',
        '#e0f542',
        '#f5c542',
        '#f59042',
        'red'
    ]; 
    // loop through the intervals and color to generate the layer with a colored sq for each interval 
    for(var i=0; i< intervals.length; i++)
    {
        //inner html that sets the color sq for each interval in key
        div.innerHTML += '<i style="background: '
            + colors[i]
            + '"></i>'
            + intervals[i]
            + (intervals [i + 1] ? "&dash;" + intervals[i + 1] + "<br>" : "+"); 
    }

    return div; 
};

legend.addTo(myMap); 
