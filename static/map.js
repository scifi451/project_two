/******************************************************* */
// Start with setup variables
/******************************************************* */
// Grab the grid line data
const stPaulPrecincts = "static/Saint_Paul_Police_Grid.geojson";
const stPaulDistricts = "static/District_Council_Shapefile_Map.geojson";

// Grab the traffic data
const trafficdataPath = "/trafficdata";
const startLocation = [44.95, -93.09];

// Variable for tracking number of stops within a grid number
// will need to add this count to the geo json for the choropleth
var stopCountByGrid = {};
var geojson;

/******************************************************* */
// Define functions
/******************************************************** */

// function to convert location to an array of lattidue and longitude
function lat_lon(location)
{
    var lat_lon = location.split(',');
    latitude = lat_lon[0].substring(1, lat_lon[0].length);
    longitude = lat_lon[1].substring(0, lat_lon[1].length-1 );
    return {lat: latitude, lon: longitude};
};

// Function to calculate stops by gridnum
function calculateStopsByGrid(data)
{
    for (i=0; i<data.length; i++)
    {
        // Convert to Int to remove .0 then back to string
        // and increment or start count accordingly
        var currentGrid = parseInt(data[i].Grid).toString();
        if (currentGrid in stopCountByGrid)
            stopCountByGrid[currentGrid] += 1;
        else
            stopCountByGrid[currentGrid] = 1;
    }
}

/****************************************************** */
// Start Map Creation
/****************************************************** */

// Create a marker cluster group and pin layer
var markers = L.markerClusterGroup();
var pinLayer = L.layerGroup();

// Create a layer for grid line data
var precinctLayer = L.layerGroup();
var districtLayer = L.layerGroup();
var gridLayer = L.layerGroup();

// Create a dictionary of overlays
var overlayMaps = {
    "Precincts": precinctLayer,
    "Pins": pinLayer,
    "Choropleth": gridLayer,
    "Districts": districtLayer
};

// Create map object
var stPaulMap = L.map("map", {
    center: startLocation,
    zoom: 12,
    layers: [baseMaps.Outdoors, overlayMaps.Choropleth]
  });

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps).addTo(stPaulMap); 

/***************************************************************** */
// Use d3 to do the magic
/***************************************************************** */

// Grab the data with d3
d3.json(trafficdataPath).then(function(response, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;
    
    calculateStopsByGrid(response);

    // Loop through data
    for (var i = 0; i < response.length; i++) 
    {
        let searched = "No";

        // Set the data location property to a variable
        var location = lat_lon(response[i].Location);

        // Check for location property
        if (location) 
        {
            let selectedIcon, iconType, iconColor;

            // If there was a search, we will use an alert icon, otherwise male or female sign
            if (response[i].DriverSearched === "Yes" || response[i].VehicleSearched === "Yes")
            {
                iconType = "ion-alert";
                iconColor = "red";
                searched = "Yes";
            }
            else
            {
                iconType = response[i].Gender === "Female" ? "ion-female" : "ion-male";
                iconColor = "white";
                searched = "No";
            }

            switch (response[i].Race)
            {
                case ("White"): selectedIcon = L.ExtraMarkers.icon({
                    icon: iconType,
                    iconColor: iconColor,
                    markerColor: "pink",
                    shape: "square"
                }); 
                break;

                case ("Black"): selectedIcon = L.ExtraMarkers.icon({
                    icon: iconType,
                    iconColor: iconColor,
                    markerColor: "blue",
                    shape: "square"
                }); 
                break;

                case ("Latino"): selectedIcon = L.ExtraMarkers.icon({
                    icon: iconType,
                    iconColor: iconColor,
                    markerColor: "purple",
                    shape: "square"
                }); 
                break;

                case ("Native American"): selectedIcon = L.ExtraMarkers.icon({
                    icon: iconType,
                    iconColor: iconColor,
                    markerColor: "yellow",
                    shape: "square"
                }); 
                break;

                case ("Asian"): selectedIcon = L.ExtraMarkers.icon({
                    icon: iconType,
                    iconColor: iconColor,
                    markerColor: "green",
                    shape: "square"
                }); 
                break;

                default: selectedIcon = L.ExtraMarkers.icon({
                    icon: iconType,
                    iconColor: iconColor,
                    markerColor: "orange",
                    shape: "square"
                }); 
                break;
            }
 
            // Now add the marker at the proper location and create the popup
            markers.addLayer(L.marker([location.lat, location.lon], {icon: selectedIcon})
                .bindPopup("<div><b>" /*+ "Reason: "*/ +  response[i].Reason + "</b></div><hr>"
                    + "<div>" + response[i].Race + " " + response[i].Gender + "</div>"
                    + "<div>Ticket Issued: " +  response[i].Citation + "</div>"
                    + "<div>Driver and/or Vehicle Searched:  " + searched + "</div>"
                    + "<div>Date:  " + response[i].Date + "</div>"
                    + "<div>Grid Number:  " + response[i].Grid + "</div>"
            ));
        }
    }

    // Add our marker cluster layer to the map  
    markers.addTo(pinLayer);

    // Grabbing our GeoJSON data..
    d3.json(stPaulPrecincts).then(function(data, err) 
    {
        // cut to error function if problem comes up in code
        if (err) throw err;

        // Loop through the geojson file to add the property stop count
        for (c=0; c<data.features.length; c++)
        {
            // NOTE:  The geojson file has an error in gridnum that we are correcting here
            if (data.features[c].properties.gridnum === "367")
                data.features[c].properties.gridnum = "267";

            if (data.features[c].properties.gridnum in stopCountByGrid)
                data.features[c].properties.stops = stopCountByGrid[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.stops = 0;
        }

        // Create a new choropleth layer
        geojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "stops",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 4,

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
                + feature.properties.gridnum + "<div>Total Stops:  " + feature.properties.stops + "</div>");
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

        // Set up the Choropleth legend
        var legend = L.control({ position: "bottomright" });
        legend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var limits = geojson.options.limits;
            var colors = geojson.options.colors;
            var labels = [];

            // Add min & max
            var legendInfo = "<div></div>";

            div.innerHTML = legendInfo;

            labels.push("<li style=" 
            + "list-style-type:none"
            + ";text-align:center;"
            + "\">" + "<h5><font color=\"black\">" + "Choropleth" + "</font></h5></li>");

            limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
            });

            div.innerHTML += "<ul>" + labels.join("") + "</ul>";
            return div;
        };

        // Adding legend to the map
        legend.addTo(stPaulMap);

        // Set up the pin legend
        var pinLegend = L.control({ position: "bottomleft" });
        pinLegend.onAdd = function() {
            var div = L.DomUtil.create("div", "pin legend");
            var pinLabels = [];

            // Add min & max
            var legendInfoPin = "<div></div>";

            div.innerHTML = legendInfoPin;

            // Blue: 1371BA
            // Orange: F18C20
            // Pink: C0539E
            // Purple: 5C396D
            // Green: 06924A
            // yellow: F4BB39 

            pinLabels.push("<li style=" 
                + "list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<h5><font color=\"black\">" + "Icon Legend" + "</font></h5></li>");
            pinLabels.push("<li style=\"background-color: " + "#C0539E" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"white\">" + "White" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "#1371BA" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"white\">" + "Black" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "#5C396D" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"white\">" + "Latino" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "#06924A" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"white\">" + "Asian" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "#F18C20" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"white\">" + "Other" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "#F4BB39" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"black\">" + "Native American" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "white" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"black\">" + "<span class=\"ion-male\">  Male</span>" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "white" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"black\">" + "<span class=\"ion-female\">  Female</span>" + "</font></li>");
            pinLabels.push("<li style=\"background-color: " + "white" 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"black\">" + "<span class=\"ion-alert\">  Searched</span>" + "</font></li>");


            div.innerHTML += "<ul>" + pinLabels.join("") + "</ul>";
            return div;
        };

        // Adding legend to the map
        pinLegend.addTo(stPaulMap);
    });
});

d3.json(stPaulDistricts).then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    // Creating a geoJSON layer with the retrieved data
    L.geoJson(data, 
    {
        // Style each feature (in this case a neighborhood)
        style: function(feature) 
        {
        return {
            color: "green",
            fillOpacity: 0.0,
            weight: 2.0
        };
        }
    }).addTo(districtLayer);
});