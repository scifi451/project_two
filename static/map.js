/******************************************************* */
// Start with setup variables
/******************************************************* */
// Grab the grid line data
const stPaulPrecincts = "static/Saint_Paul_Police_Grid.geojson";
const stPaulDistricts = "static/District_Council_Shapefile_Map.geojson";

// Grab the traffic data
const trafficdataPath = "/trafficdata";
const startLocation = [44.95, -93.09];
var choroLegend, whiteLegend, blackLegend, asianLegend,
 latinoLegend, nativeAmericanLegend, otherLegend,
 maleLegend, femaleLegend, searchedLegend;
 var choroGeojson, whiteGeojson, blackGeojson, asianGeojson,
 latinoGeojson, nativeAmericanGeojson, otherGeojson,
 maleGeojson, femaleGeojson, searchedGeojson;

// Variable for tracking number of stops within a grid number
// will need to add this count to the geo json for the choropleth
var countsByGrid = {
    "Stops": {},
    "White": {},
    "Black": {},
    "Asian": {},
    "Latino": {},
    "NativeAmerican": {},
    "Other": {},
    "Male": {},
    "Female": {},
    "Searched": {}
};
var geojson;

/******************************************************* */
// Define functions
/******************************************************** */

// funtion to get choropleth color
// adapted from:  https://leafletjs.com/examples/choropleth/
function getColor(count) 
{
    return count > 1000 ? '#800026' :
           count > 500  ? '#BD0026' :
           count > 200  ? '#E31A1C' :
           count > 100  ? '#FC4E2A' :
           count > 50   ? '#FD8D3C' :
           count > 20   ? '#FEB24C' :
           count > 10   ? '#FED976' :
                          '#FFEDA0';
}

// function to set style for choropleth
// adapted from: https://leafletjs.com/examples/choropleth/
function style(feature) {
    return {
        fillColor: getColor(feature.properties.stops),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

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
        if (currentGrid in countsByGrid.Stops)
            countsByGrid.Stops[currentGrid] += 1;
        else
            countsByGrid.Stops[currentGrid] = 1;

        // increment for race
        switch (data[i].Race)
        {
            case ("White"):
            {
                if (currentGrid in countsByGrid.White)
                    countsByGrid.White[currentGrid] += 1;
                else
                    countsByGrid.White [currentGrid] = 1;
                break;
            }
            case ("Black"):
            {
                if (currentGrid in countsByGrid.Black)
                    countsByGrid.Black[currentGrid] += 1;
                else
                    countsByGrid.Black[currentGrid] = 1;
                break;
            }
            case ("Asian"):
            {
                if (currentGrid in countsByGrid.Asian)
                    countsByGrid.Asian[currentGrid] += 1;
                else
                    countsByGrid.Asian[currentGrid] = 1;
                break;
            }
            case ("Latino"):
            {
                if (currentGrid in countsByGrid.Latino)
                    countsByGrid.Latino[currentGrid] += 1;
                else
                    countsByGrid.Latino[currentGrid] = 1;
                break;
            }
            case ("Native American"):
            {
                if (currentGrid in countsByGrid.NativeAmerican)
                    countsByGrid.NativeAmerican[currentGrid] += 1;
                else
                    countsByGrid.NativeAmerican[currentGrid] = 1;
                break;
            }
            default: // Other
            {
                if (currentGrid in countsByGrid.Other)
                    countsByGrid.Other[currentGrid] += 1;
                else
                    countsByGrid.Other[currentGrid] = 1;
                break;
            }
        }

        // increment for gender
        switch (data[i].Gender)
        {
            case ("Female"):
            {
                if (currentGrid in countsByGrid.Female)
                    countsByGrid.Female[currentGrid] += 1;
                else
                    countsByGrid.Female[currentGrid] = 1;
                break;
            }
            default: // Male
            {
                if (currentGrid in countsByGrid.Male)
                    countsByGrid.Male[currentGrid] += 1;
                else
                    countsByGrid.Male[currentGrid] = 1;
                break;
            }
        }

        if (data[i].VehicleSearched === "Yes" || data[i].DriverSearched === "Yes")
        {
            if (currentGrid in countsByGrid.Searched)
                countsByGrid.Searched[currentGrid] += 1;
            else
                countsByGrid.Searched[currentGrid] = 1;

        }
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
var whiteLayer = L.layerGroup();
var blackLayer = L.layerGroup();
var asianLayer = L.layerGroup();
var latinoLayer = L.layerGroup();
var nativeAmericanLayer = L.layerGroup();
var otherLayer = L.layerGroup();
var femaleLayer = L.layerGroup();
var maleLayer = L.layerGroup();
var searchedLayer = L.layerGroup();

// Create a dictionary of overlays
var overlayMaps = {
    "Precincts": precinctLayer,
    "Pins": pinLayer,
    "Choropleth": gridLayer,
    "Districts": districtLayer,
    "White": whiteLayer,
    "Black": blackLayer,
    "Asian": asianLayer,
    "Latino": latinoLayer,
    "Native American": nativeAmericanLayer,
    "Other": otherLayer,
    "Female": femaleLayer,
    "Male": maleLayer,
    "Searched": searchedLayer
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

            if (data.features[c].properties.gridnum in countsByGrid.Stops)
                data.features[c].properties.stops = countsByGrid.Stops[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.stops = 0;
            
            if (data.features[c].properties.gridnum in countsByGrid.White)
                data.features[c].properties.white = countsByGrid.White[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.white = 0;

            if (data.features[c].properties.gridnum in countsByGrid.Black)
                data.features[c].properties.black = countsByGrid.Black[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.black = 0;

            if (data.features[c].properties.gridnum in countsByGrid.Asian)
                data.features[c].properties.asian = countsByGrid.Asian[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.asian = 0;

            if (data.features[c].properties.gridnum in countsByGrid.Latino)
                data.features[c].properties.latino = countsByGrid.Latino[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.latino = 0;

            if (data.features[c].properties.gridnum in countsByGrid.NativeAmerican)
                data.features[c].properties.nativeAmerican = countsByGrid.NativeAmerican[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.nativeAmerican = 0;

            if (data.features[c].properties.gridnum in countsByGrid.Other)
                data.features[c].properties.other = countsByGrid.Other[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.other = 0;

            if (data.features[c].properties.gridnum in countsByGrid.Female)
                data.features[c].properties.female = countsByGrid.Female[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.female = 0;

            if (data.features[c].properties.gridnum in countsByGrid.Male)
                data.features[c].properties.male = countsByGrid.Male[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.male = 0;

            if (data.features[c].properties.gridnum in countsByGrid.Searched)
                data.features[c].properties.searched = countsByGrid.Searched[data.features[c].properties.gridnum];
            else 
                data.features[c].properties.searched = 0;
        }

        // Create a new choropleth layer
        // L.geoJson(data, {style: style(data.features)}).addTo(gridLayer);
        choroGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "stops",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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

        whiteGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "white",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for White:  " + feature.properties.white + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.white / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(whiteLayer);

        blackGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "black",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Black:  " + feature.properties.black + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.black / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(blackLayer);

        asianGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "asian",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Asian:  " + feature.properties.asian + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.asian / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(asianLayer);

        latinoGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "latino",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Latino:  " + feature.properties.latino + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.latino / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(latinoLayer);

        nativeAmericanGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "nativeAmerican",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Native American:  " + feature.properties.nativeAmerican + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.nativeAmerican / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(nativeAmericanLayer);

        otherGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "other",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Other:  " + feature.properties.other + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.other / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(otherLayer);


        femaleGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "female",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Female:  " + feature.properties.female + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.female / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(femaleLayer);

        maleGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "male",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Male:  " + feature.properties.male + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.male / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(maleLayer);

        searchedGeojson = L.choropleth(data, 
        {
            // Define what  property in the features to use
            valueProperty: "searched",

            // Set color scale
            scale: ["#E2E7F5", "#071696"],

            // Number of breaks in step range
            steps: 10,

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
                + feature.properties.gridnum + "<div>Total Stops for Searched:  " + feature.properties.searched + "</div>"
                + "<div>Percent of Grid = " + (100 * feature.properties.searched / feature.properties.stops).toFixed(0) + "\%</div>");
            }
        }).addTo(searchedLayer);

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
        choroLegend = L.control({ position: "topleft" });
        choroLegend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var limits = choroGeojson.options.limits;
            var colors = choroGeojson.options.colors;
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
        // Adding legend to the map - this is the default
        choroLegend.addTo(stPaulMap);

        // Set up the Choropleth legend
        whiteLegend = L.control({ position: "topleft" });
        whiteLegend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var limits = whiteGeojson.options.limits;
            var colors = whiteGeojson.options.colors;
            var labels = [];

            // Add min & max
            var legendInfo = "<div></div>";

            div.innerHTML = legendInfo;

            labels.push("<li style=" 
            + "list-style-type:none"
            + ";text-align:center;"
            + "\">" + "<h5><font color=\"black\">" + "White" + "</font></h5></li>");

            limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
            });

            div.innerHTML += "<ul>" + labels.join("") + "</ul>";
            return div;
        };

        // Set up the Choropleth legend
        blackLegend = L.control({ position: "topleft" });
        blackLegend.onAdd = function() {
            var div = L.DomUtil.create("div", "info legend");
            var limits = blackGeojson.options.limits;
            var colors = blackGeojson.options.colors;
            var labels = [];

            // Add min & max
            var legendInfo = "<div></div>";

            div.innerHTML = legendInfo;

            labels.push("<li style=" 
            + "list-style-type:none"
            + ";text-align:center;"
            + "\">" + "<h5><font color=\"black\">" + "Black" + "</font></h5></li>");

            limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] 
                + ";list-style-type:none"
                + ";text-align:center;"
                + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
            });

            div.innerHTML += "<ul>" + labels.join("") + "</ul>";
            return div;
        };

       // Set up the Choropleth legend
       asianLegend = L.control({ position: "topleft" });
       asianLegend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend");
           var limits = asianGeojson.options.limits;
           var colors = asianGeojson.options.colors;
           var labels = [];

           // Add min & max
           var legendInfo = "<div></div>";

           div.innerHTML = legendInfo;

           labels.push("<li style=" 
           + "list-style-type:none"
           + ";text-align:center;"
           + "\">" + "<h5><font color=\"black\">" + "Asian" + "</font></h5></li>");

           limits.forEach(function(limit, index) {
           labels.push("<li style=\"background-color: " + colors[index] 
               + ";list-style-type:none"
               + ";text-align:center;"
               + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
           });

           div.innerHTML += "<ul>" + labels.join("") + "</ul>";
           return div;
       };

       // Set up the Choropleth legend
       latinoLegend = L.control({ position: "topleft" });
       latinoLegend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend");
           var limits = latinoGeojson.options.limits;
           var colors = latinoGeojson.options.colors;
           var labels = [];

           // Add min & max
           var legendInfo = "<div></div>";

           div.innerHTML = legendInfo;

           labels.push("<li style=" 
           + "list-style-type:none"
           + ";text-align:center;"
           + "\">" + "<h5><font color=\"black\">" + "Latino" + "</font></h5></li>");

           limits.forEach(function(limit, index) {
           labels.push("<li style=\"background-color: " + colors[index] 
               + ";list-style-type:none"
               + ";text-align:center;"
               + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
           });

           div.innerHTML += "<ul>" + labels.join("") + "</ul>";
           return div;
       };       

       // Set up the Choropleth legend
       nativeAmericanLegend = L.control({ position: "topleft" });
       nativeAmericanLegend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend");
           var limits = nativeAmericanGeojson.options.limits;
           var colors = nativeAmericanGeojson.options.colors;
           var labels = [];

           // Add min & max
           var legendInfo = "<div></div>";

           div.innerHTML = legendInfo;

           labels.push("<li style=" 
           + "list-style-type:none"
           + ";text-align:center;"
           + "\">" + "<h5><font color=\"black\">" + "Native American" + "</font></h5></li>");

           limits.forEach(function(limit, index) {
           labels.push("<li style=\"background-color: " + colors[index] 
               + ";list-style-type:none"
               + ";text-align:center;"
               + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
           });

           div.innerHTML += "<ul>" + labels.join("") + "</ul>";
           return div;
       };

       // Set up the Choropleth legend
       otherLegend = L.control({ position: "topleft" });
       otherLegend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend");
           var limits = otherGeojson.options.limits;
           var colors = otherGeojson.options.colors;
           var labels = [];

           // Add min & max
           var legendInfo = "<div></div>";

           div.innerHTML = legendInfo;

           labels.push("<li style=" 
           + "list-style-type:none"
           + ";text-align:center;"
           + "\">" + "<h5><font color=\"black\">" + "Other" + "</font></h5></li>");

           limits.forEach(function(limit, index) {
           labels.push("<li style=\"background-color: " + colors[index] 
               + ";list-style-type:none"
               + ";text-align:center;"
               + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
           });

           div.innerHTML += "<ul>" + labels.join("") + "</ul>";
           return div;
       };

       // Set up the Choropleth legend
       femaleLegend = L.control({ position: "topleft" });
       femaleLegend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend");
           var limits = femaleGeojson.options.limits;
           var colors = femaleGeojson.options.colors;
           var labels = [];

           // Add min & max
           var legendInfo = "<div></div>";

           div.innerHTML = legendInfo;

           labels.push("<li style=" 
           + "list-style-type:none"
           + ";text-align:center;"
           + "\">" + "<h5><font color=\"black\">" + "Female" + "</font></h5></li>");

           limits.forEach(function(limit, index) {
           labels.push("<li style=\"background-color: " + colors[index] 
               + ";list-style-type:none"
               + ";text-align:center;"
               + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
           });

           div.innerHTML += "<ul>" + labels.join("") + "</ul>";
           return div;
       };

       // Set up the Choropleth legend
       maleLegend = L.control({ position: "topleft" });
       maleLegend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend");
           var limits = maleGeojson.options.limits;
           var colors = maleGeojson.options.colors;
           var labels = [];

           // Add min & max
           var legendInfo = "<div></div>";

           div.innerHTML = legendInfo;

           labels.push("<li style=" 
           + "list-style-type:none"
           + ";text-align:center;"
           + "\">" + "<h5><font color=\"black\">" + "Male" + "</font></h5></li>");

           limits.forEach(function(limit, index) {
           labels.push("<li style=\"background-color: " + colors[index] 
               + ";list-style-type:none"
               + ";text-align:center;"
               + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
           });

           div.innerHTML += "<ul>" + labels.join("") + "</ul>";
           return div;
       };

       // Set up the Choropleth legend
       searchedLegend = L.control({ position: "topleft" });
       searchedLegend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend");
           var limits = searchedGeojson.options.limits;
           var colors = searchedGeojson.options.colors;
           var labels = [];

           // Add min & max
           var legendInfo = "<div></div>";

           div.innerHTML = legendInfo;

           labels.push("<li style=" 
           + "list-style-type:none"
           + ";text-align:center;"
           + "\">" + "<h5><font color=\"black\">" + "Searched" + "</font></h5></li>");

           limits.forEach(function(limit, index) {
           labels.push("<li style=\"background-color: " + colors[index] 
               + ";list-style-type:none"
               + ";text-align:center;"
               + "\">" + "<font color=\"orange\">" + limits[index].toFixed(0) + "</font></li>");
           });

           div.innerHTML += "<ul>" + labels.join("") + "</ul>";
           return div;
       };

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

stPaulMap.on('overlayadd', function (eventLayer) 
{
    switch(eventLayer.name)
    {
        case ("Choropleth"): choroLegend.addTo(stPaulMap); break;
        case ("White"): whiteLegend.addTo(stPaulMap); break;
        case ("Black"): blackLegend.addTo(stPaulMap); break;
        case ("Asian"): asianLegend.addTo(stPaulMap); break;
        case ("Latino"): latinoLegend.addTo(stPaulMap); break;
        case ("Native American"): nativeAmericanLegend.addTo(stPaulMap); break;
        case ("Other"): otherLegend.addTo(stPaulMap); break;
        case ("Female"): femaleLegend.addTo(stPaulMap); break;
        case ("Male"): maleLegend.addTo(stPaulMap); break;
        case ("Searched"): searchedLegend.addTo(stPaulMap); break;
        default: break;
    }
});

stPaulMap.on('overlayremove', function (eventLayer) 
{
    switch(eventLayer.name)
    {
        case ("Choropleth"): stPaulMap.removeControl(choroLegend); break;
        case ("White"): stPaulMap.removeControl(whiteLegend); break;
        case ("Black"): stPaulMap.removeControl(blackLegend); break;
        case ("Asian"): stPaulMap.removeControl(asianLegend); break;
        case ("Latino"): stPaulMap.removeControl(latinoLegend); break;
        case ("Native American"): stPaulMap.removeControl(nativeAmericanLegend); break;
        case ("Other"): stPaulMap.removeControl(otherLegend); break;
        case ("Female"): stPaulMap.removeControl(femaleLegend); break;
        case ("Male"): stPaulMap.removeControl(maleLegend); break;
        case ("Searched"): stPaulMap.removeControl(searchedLegend); break;
        default: break;
    }
});




