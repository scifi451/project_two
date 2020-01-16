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

// Grab the data with d3
d3.json(trafficdataPath).then(function(response, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;
    
    console.log("traffic data response in map.js");
    console.log(response);

    // Create a new marker cluster group
    var markers = L.markerClusterGroup();

    console.log("Response length:");
    console.log(response.length);


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
                    icon: "ion-settings",
                    iconColor: "yellow",
                    markerColor: "green",
                    shape: "circle"
                });
        
            // markers.addLayer(L.marker([location.lat, location.lon])
            markers.addLayer(L.marker([location.lat, location.lon],icon)
                .bindPopup("<p><b>" + "Reason: " +  response[i].Reason + "</b></p><hr>"
                    + "<p>Ticket Issued: " +  response[i].Citation + "</p>"
                    + "<p>Gender  " + response[i].Gender + "</p>"
                    + "<p>Race  " + response[i].Race + "</p>"
                    + "<p>Driver Searched  " + response[i].DriverSearched + "</p>"
                    + "<p>Vehicle Searched  " + response[i].VehicleSearched + "</p>"
                    + "<p>Race  " + response[i].Race + "</p>"
                    + "<p>Date  " + response[i].Date + "</p>"
                ));
        }
    }

    // Add our marker cluster layer to the map
    stPaulMap.addLayer(markers);

});

console.log("Did we get here?");

// Grab the fault line data
var stPaulPrecincts = "static/Saint_Paul_Police_Grid.geojson";

console.log(`St Paul Precincts ${stPaulPrecincts}`);

// Create a layer for fault line data
var precinctLayer = L.layerGroup().addTo(stPaulMap);

console.log("Precinct layer created");

// Grabbing our GeoJSON data..
d3.json(stPaulPrecincts).then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    console.log("St Paul Precincts data");
    console.log(data);
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
});

// Create a dictionary of overlays
var overlayMaps = {
    "Precincts": precinctLayer
};

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(stPaulMap); 
