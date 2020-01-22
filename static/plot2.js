
// function that returns an array of occurances by a catetory
function rateByCategory(data, item) {
    
  var rate = {};

  for (i=0; i < data.length; i++) {
      var category = data[i][item];
      if (category in rate) {
          
          rate[category] +=1;
      }
      else {
          rate[category] =1;
      }
  }
  return rate;
}
// Initializes the page with a default plot
function init() {
  
    newPlotly();
  };


  // function to create a new Plotly 
function newPlotly() {
     // Function called by DOM changes
     var SelectedOption = d3.select("#selDataset").property("value");
     // Assign the value of the dropdown menu option to a variable
     console.log('SelectedOption ',SelectedOption );
 
 
     // access the json data from the FLASK route
     d3.json("/trafficdata").then(function(data){
 
           // set the option variable
           if (SelectedOption == "race"){
             var option = "Race";
            console.log("Race selected")
           } else if (SelectedOption =="gender"){
             var option = "Gender";
            console.log("Gender selected")
          //  } else if (SelectedOption =="DriverSearched"){
          //    var option = "DriverSearched";
          //   console.log("Driver searched selected")
          //  } else if (SelectedOption =="VehicleSearched"){
          //    var option ="VehicleSearched";
          //   console.log("Vehicle searched selected")
           }
        
           // Subset the date by Reason, DriverSearched, Vehicle Searched
          var Equipment = data.filter(it => it.Reason.includes('Equipment Violation'));
          var Investigate = data.filter(it => it.Reason.includes('Investigative Stop'));
          var Moving = data.filter(it => it.Reason.includes('Moving Violation'));
          var Call = data.filter(it => it.Reason.includes('911 Call / Citizen Reported'));

          var DriverSearched = data.filter(it => it.DriverSearched.includes('Yes'));
          var VehicleSearched = data.filter(it => it.VehicleSearched.includes ('Yes'));

          // Get counts of Reason, DriverSearced, VehicleSearced by Gender
          var countbyEquipment= rateByCategory(Equipment, option);
          var countbyInvestigate = rateByCategory(Investigate,option);
          var countbyMoving = rateByCategory(Moving,option);
          var countbyCall = rateByCategory(Call,option);
          var countbyDriverSearched = rateByCategory(DriverSearched, option);
          var countbyVehicleSearched = rateByCategory(VehicleSearched, option);


            
          //set up plotly
          var trace1 ={
              x: Object.keys(countbyEquipment),
              y: Object.values(countbyEquipment),
              name: 'Stop reason: Equipment Vilolation',
              type: 'bar',
              xaxis: 'x1'
          };

          var trace2 = {
              x: Object.keys(countbyInvestigate),
              y: Object.values(countbyInvestigate),
              name: 'Stop reason: Investigative Stop',
              type: 'bar',
              xaxis: 'x1'
          };
          var trace3 = {
              x: Object.keys(countbyMoving),
              y: Object.values(countbyMoving),
              name: 'Stop reason: Moving Violation',
              type: 'bar',
              xaxis: 'x1'
          };
          var trace4 = {
              x: Object.keys(countbyCall),
              y: Object.values(countbyCall),
              name: 'Stop reason: 911 Call/Citizen Reported',
              type: 'bar',
              xaxis: 'x1'
          };

          var trace5 = {
              x: Object.keys(countbyDriverSearched),
              y: Object.values(countbyDriverSearched),
              name: 'Driver Searched',
              type: 'bar',
              xaxis:'x2'
          };
          var trace6 = {
              x: Object.keys(countbyVehicleSearched),
              y: Object.values(countbyVehicleSearched),
              name: 'Vehicle Searched',
              type: 'bar',
              xaxis: 'x2'
          };

          var plotData =[trace1, trace2, trace3, trace4, trace5, trace6];

          var layout = {
                //  height: 600,
                //  width: 800,
                  barmode: 'stack',
                    xaxis: {
                      domain: [0, 0.50],
                      anchor: 'x1', 
                      title: 'Reason for Stops'
                    },
                    xaxis2: {
                      domain: [0.50, 1.0],
                      anchor: 'x2', title: 'Driver/Vehicle Searched'
                    }
            };

          // Call function to update the chart
          Plotly.newPlot("plot", plotData, layout,{responsive:true});
        
 
     });
   
  };

//function to update plotly
function updatePlotly() {

        // Function called by DOM changes
        var SelectedOption = d3.select("#selDataset").property("value");
        // Assign the value of the dropdown menu option to a variable
        console.log('SelectedOption ',SelectedOption );
        
        var plotlydata = plot.data;
        console.log('plotly data', plotlydata);
    
        // access the json data from the FLASK route
        d3.json("/trafficdata").then(function(data){
    
              // set the option variable
              if (SelectedOption == "race"){
                var option = "Race";
               console.log("Race selected")
              } else if (SelectedOption =="gender"){
                var option = "Gender";
               console.log("Gender selected")
              // } else if (SelectedOption =="DriverSearched"){
              //   var option = "DriverSearched";
              //  console.log("Driver searched selected")
              // } else if (SelectedOption =="VehicleSearched"){
              //   var option ="VehicleSearched";
              //  console.log("Vehicle searched selected")
              }
           
              // Subset the date by Reason, DriverSearched, Vehicle Searched
             var Equipment = data.filter(it => it.Reason.includes('Equipment Violation'));
             var Investigate = data.filter(it => it.Reason.includes('Investigative Stop'));
             var Moving = data.filter(it => it.Reason.includes('Moving Violation'));
             var Call = data.filter(it => it.Reason.includes('911 Call / Citizen Reported'));
   
             var DriverSearched = data.filter(it => it.DriverSearched.includes('Yes'));
             var VehicleSearched = data.filter(it => it.VehicleSearched.includes ('Yes'));
   
             // Get counts of Reason, DriverSearced, VehicleSearced by Gender
             var countbyEquipment= rateByCategory(Equipment, option);
             var countbyInvestigate = rateByCategory(Investigate,option);
             var countbyMoving = rateByCategory(Moving,option);
             var countbyCall = rateByCategory(Call,option);
             var countbyDriverSearched = rateByCategory(DriverSearched, option);
             var countbyVehicleSearched = rateByCategory(VehicleSearched, option);
   
   
               
             //set up plotly
             var trace1 ={
                x: Object.keys(countbyEquipment),
                y: Object.values(countbyEquipment),
                name: 'Stop reason: Equipment Vilolation',
                type: 'bar',
                xaxis: 'x1'
            };
  
            var trace2 = {
                x: Object.keys(countbyInvestigate),
                y: Object.values(countbyInvestigate),
                name: 'Stop reason: Investigative Stop',
                type: 'bar',
                xaxis: 'x1'
            };
            var trace3 = {
                x: Object.keys(countbyMoving),
                y: Object.values(countbyMoving),
                name: 'Stop reason: Moving Violation',
                type: 'bar',
                xaxis: 'x1'
            };
            var trace4 = {
                x: Object.keys(countbyCall),
                y: Object.values(countbyCall),
                name: 'Stop reason: 911 Call/Citizen Reported',
                type: 'bar',
                xaxis: 'x1'
            };
  
            var trace5 = {
                x: Object.keys(countbyDriverSearched),
                y: Object.values(countbyDriverSearched),
                name: 'Driver Searched',
                type: 'bar',
                xaxis:'x2'
            };
            var trace6 = {
                x: Object.keys(countbyVehicleSearched),
                y: Object.values(countbyVehicleSearched),
                name: 'Vehicle Searched',
                type: 'bar',
                xaxis: 'x2'
            };
  
             plotData =[trace1, trace2, trace3, trace4, trace5, trace6];
   
             var layout = {
                //  height: 600,
                //  width: 800,
                  barmode: 'stack',
                    xaxis: {
                      domain: [0, 0.50],
                      anchor: 'x1', 
                      title: 'Reason for Stops'
                    },
                    xaxis2: {
                      domain: [0.50, 1.0],
                      anchor: 'x2', title: 'Driver/Vehicle Searched'
                    }
            };
            // Call function to update the chart
            Plotly.newPlot("plot", plotData, layout,{responsive:true});
              

    }).catch( function(error){
      console.log(error);
    });
  };
  
init();
d3.select("#selDataset").on("change", updatePlotly);
