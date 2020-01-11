// Creating map object
var myMap = L.map("map", {
    center: [44.95, -93.09],
    zoom: 13
  });
  
  // Adding tile layer to the map
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap);
  
  // Store API query variables
  var baseURL = "https://information.stpaul.gov/resource/kkd6-vvns.json?";
  // var year = "year_of_stop=2018";
  // // var complaint = "&complaint_type=Rodent";
  // var limit = "&$limit=500";
  
  // Assemble API query URL
  var url = baseURL; //+ year + limit ;
  
  // Grab the data with d3
  d3.json(url, function(response) {
    console.log(response)
  
    // Create a new marker cluster group
    var markers = L.markerClusterGroup();
  
    // Loop through data
    for (var i = 0; i < response.length; i++) {
  
      // Set the data location property to a variable
      var location = response[i].location_of_stop_by_police_grid;
  
      // Check for location property
      if (location) {
  
        // Add a new marker to the cluster group and bind a pop-up
        markers.addLayer(L.marker([location.latitude, location.longitude])
          .bindPopup("<h3>" + "Reason: " +  response[i].reason_for_stop + "</h3> <hr> <h3>" + "Ticket Issued: " +  response[i].race_of_driver));
      }
  
    }
  
    // Add our marker cluster layer to the map
    myMap.addLayer(markers);
  
  });
  