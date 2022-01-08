// create tile layers for the background of the map 

//set up url for json decided on 
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"

//set up map 
var map = L.map("map", {
    center: [37.0902, -95.7129],
    zoom: 5
  });

//set up street layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);


//retrieve geo-json and print to console
d3.json(url).then(function(data){
    console.log(data)

    //create markers for earthquakes
    for (var i = 0; i < data.features.length; i++){
        
        //collect all unique variables for each quake
        var quake = data.features[i];
        var location = [quake.geometry.coordinates[1], quake.geometry.coordinates[0]];
        var quake_depth = [quake.geometry.coordinates[2]];
        var color = '';
        var quake_date = new Date(quake.properties.time)
        
        //determine color based on depth
        if (quake_depth >= 90){
            color = "#ff5f65"
        }

        else if (quake_depth >= 70){
            color = "#fca35d"
        }

        else if (quake_depth >= 50){
            color = "#fdb72a"
        }

        else if (quake_depth >= 30){
            color = "#f7db11"
        }

        else if (quake_depth >= 10){
            color = "#dcf400"
        }

        else {
            color = "#a3f600"
        }


        L.circle(location, {
            opacity: .5,
            fillOpacity: 0.75,
            weight: .5,
            color: 'black',
            fillColor: color,
            radius: 10000 * quake.properties.mag
        }).bindPopup("<h4>Date and Time: " + quake_date + "</h4><h4>Magnitude: " + quake.properties.mag + "</h4><h4>Location: " + quake.properties.place + "</h4><h4>Depth: " + quake_depth + "</h4>").addTo(map)
    }

    function getColor(d) {
        return d > 90 ? '#ff5f65' :
               d > 70  ? '#fca35d' :
               d > 50  ? '#fdb72a' :
               d > 30  ? '#f7db11' :
               d > 10   ? '#dcf400' :
               d > -10   ? '#a3f600' :
                          '#a3f600';
    }
    //create legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
    };

    legend.addTo(map);

});