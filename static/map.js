console.log ("load map.js");

// function to convert location to an array of lattidue and longitude
function lat_lon(location)
{
    var lat_lon = location.split(',');
    latitude = lat_lon[0].substring(1, lat_lon[0].length);
    longitude = lat_lon[1].substring(0, lat_lon[1].length-1 );
    return {lat: latitude, lon: longitude};
};

// Creating map object
var startLocation = [44.95, -93.09];
var stPaulMap = L.map("map", {
    center: startLocation,
    zoom: 13,
    layers: [baseMaps.Outdoors]
  });

var trafficdataPath = "/trafficdata"; //"/trafficdata100"

// Create a new marker cluster group
var markers = L.markerClusterGroup();
var pinLayer = L.layerGroup().addTo(stPaulMap);

var stopCountByGrid = {};
var geojson;

// Function to calculate stops by gridnum
function calculateStopsByGrid(data)
{
    for (i=0; i<data.length; i++)
    {
        // Convert to Int to remove .0 then back to string
        var currentGrid = parseInt(data[i].Grid).toString();
        if (currentGrid in stopCountByGrid)
            stopCountByGrid[currentGrid] += 1;
        else
            stopCountByGrid[currentGrid] = 1;
    }
    console.log(stopCountByGrid);
    // return stopCountByGrid;
}

// Grab the data with d3
d3.json(trafficdataPath).then(function(response, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;
    
    console.log("Processing traffic data");
    calculateStopsByGrid(response);

    // Loop through data
    for (var i = 0; i < response.length; i++) 
    {

        // Set the data location property to a variable
        var location = lat_lon(response[i].Location);

        // Check for location property
        if (location) 
        {
            // Add a new marker to the cluster group and bind a pop-up
            var icon = L.ExtraMarkers.icon(
                {
                    icon: "ion-settings-bicycle",
                    iconColor: "yellow",
                    markerColor: "green",
                    shape: "star"
                });
        
            // markers.addLayer(L.marker([location.lat, location.lon])
            markers.addLayer(L.marker([location.lat, location.lon], icon)
                .bindPopup("<p><b>" + "Reason: " +  response[i].Reason + "</b></p><hr>"
                    + "<p>Ticket Issued: " +  response[i].Citation + "</p>"
                    + "<div>Gender  " + response[i].Gender + "</div>"
                    + "<p>Driver Searched  " + response[i].DriverSearched + "</p>"
                    + "<p>Vehicle Searched  " + response[i].VehicleSearched + "</p>"
                    + "<p>Race  " + response[i].Race + "</p>"
                    + "<p>Date  " + response[i].Date + "</p>"
                ));
        }
    }

    // Add our marker cluster layer to the map   
    stPaulMap.addLayer(markers);
    markers.addTo(pinLayer);

    ///////////////////////////////////////////////////////////////////////////////////////
    // Grabbing our GeoJSON data..
    d3.json(stPaulPrecincts).then(function(data, err) 
    {
        // cut to error function if problem comes up in code
        if (err) throw err;

        console.log("St Paul Precincts data");
        console.log(data);

        for (c=0; c<data.features.length; c++)
        {
            if (data.features[c].properties.gridnum in stopCountByGrid)
                data.features[c].properties.stops = stopCountByGrid[data.features[c].properties.gridnum];
            else 
            data.features[c].properties.stops = 0;
            console.log(data.features[c].properties.stops);
        }

        // Create a new choropleth layer
        geojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "stops",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 6,

            // q for quartile, e for equidistant, k for k-means
            mode: "q",
            style: {
                // Border color
                color: "#fff",
                weight: 1,
                fillOpacity: 0.8
            },

            // Binding a pop-up to each layer
            onEachFeature: function(feature, layer) {
                layer.bindPopup("<h6>District: " + feature.properties.dist + "</h6><hr>Grid Number:  " 
                + feature.properties.gridnum + "<p>Total Stops:  " + feature.properties.stops + "</p>");
            }
        }).addTo(gridLayer);

        // Creating a geoJSON layer with the retrieved data
        L.geoJson(data, 
        {
            // Style each feature (in this case a neighborhood)
            style: function(feature) 
            {
            return {
                color: "orange",
                fillOpacity: 0.0,
                weight: 1.5
            };
            }
        }).addTo(precinctLayer);

        ////
        // Set up the legend
        var legend = L.control({ position: "bottomright" });
        console.log("geojson data");
        console.log(geojson);
        legend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var limits = geojson.options.limits;
            var colors = geojson.options.colors;
            var labels = [];

            // Add min & max
            console.log(`limits ${limits[0]} - ${limits[limits.length -1]}`);
            var legendInfo = "<h6>Traffic Stops</h6>";

            div.innerHTML = legendInfo;

            limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"orange\">" + limits[index] + "</font></li>");
            });

            div.innerHTML += "<ul>" + labels.join("") + "</ul>";
            return div;
        };

        // Adding legend to the map
        legend.addTo(stPaulMap);
        ////
    });
    //////////////////////////////////////////////////////////////////////////////////////

});

// Grab the grid line data
var stPaulPrecincts = "static/Saint_Paul_Police_Grid.geojson";

// Create a layer for grid line data
var precinctLayer = L.layerGroup().addTo(stPaulMap);
var gridLayer = L.layerGroup().addTo(stPaulMap);



// Create a dictionary of overlays
var overlayMaps = {
    "Precincts": precinctLayer,
    "Pins": pinLayer,
    "Choropleth": gridLayer
};

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(stPaulMap); 
