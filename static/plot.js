// NOTES: rendering using data from CSV in server folder

// use data in csv file to generate plot to tinker

function Init(){

  console.log("Enter Intilization function:");

  
  var selectOption = d3.select("#selDataset").property('value');

  graphChange();
}

// On change to the DOM, call graphChange
d3.selectAll("#selDataset").on("change", graphChange);

function graphChange(){

  var plotArea = d3.select('#plot')
  if (!plotArea.empty()) {
    plotArea.remove();
    console.log ('Removed plot')
  }
  var selectOption = d3.select("#selDataset").property('value');
  console.log('selectOption ', selectOption);
  

      // Call the data set in json format
      d3.json("/trafficdata100").then(function(data, err)
      {

          // cut to error function if problem comes up in code
        if (err) throw err;
      
        console.log("Entered graphChange function:")
        // console.log(selectOption.property("value"))
        // convert the id taken from the select option event handler to corresponding key in the dataset
        // option is how the data will be filtered for the graph
        if (selectOption == "race"){
          var option = "Race";
        //  console.log("Race selected")
        } else if (selectOption =="gender"){
          var option = "Gender";
        //  console.log("Gender selected")
        } else if (selectOption =="DriverSearched"){
          var option = "DriverSearched";
         // console.log("Driver searched selected")
        } else if (selectOption =="VehicleSearched"){
          var option ="VehicleSearched";
        //  console.log("Vehicle searched selected")
        }
        // -------------------------------------------------
        // leveraged code to do groupby of traffic crime data by reason of traffic stop
        // Source :https://stackoverflow.com/questions/44387647/group-and-count-values-in-an-array/44387859

        // filter data by "Equipment Violation"-----------------------------------------------------------
        let Equipement = data.filter(it => it.Reason.includes('Equipment Violation'));
        // console.log(Equipement);

        // count of Equipment Violoation by filter
        var EquipementGroupby = Equipement.reduce((p, c) => {
            var filter = c[option];
            var reason = c.Reason;
            if (!p.hasOwnProperty(filter)) {
              p[filter] = 0;
              p[filter][reason]=0;
            }
            p[filter]++;
            p[filter][reason]++;
            return p;
          }, {});
          
          // var EquipementGroupbyExtended = Object.keys(EquipementGroupby).map(k => {
          //   return {Filter: k, count: EquipementGroupby[k]}; });

        // filter data by "Investigative Stop"-----------------------------------------------------------
        let Investigate = data.filter(it => it.Reason.includes('Investigative Stop'));

        // count race of Investigative Stop 
        var InvestigateGroupby = Investigate.reduce((p, c) => {
            var filter = c[option];
            var reason = c.Reason;
            if (!p.hasOwnProperty(filter)) {
              p[filter] = 0;
              p[filter][reason]=0;
            }
            p[filter]++;
            p[filter][reason]++;
            return p;
          }, {});

        // filter data by "Moving Violation"-----------------------------------------------------------
        let Moving = data.filter(it => it.Reason.includes('Moving Violation'));

        // count race of "Moving Violation" 
        var MovingGroupby = Moving.reduce((p, c) => {
            var filter = c[option];
            var reason = c.Reason;
            if (!p.hasOwnProperty(filter)) {
              p[filter] = 0;
              p[filter][reason]=0;
            }
            p[filter]++;
            p[filter][reason]++;
            return p;
          }, {});

        // filter data by 911 Call-----------------------------------------------------------
        let Call = data.filter(it => it.Reason.includes('911 Call / Citizen Reported'));

        // count race of 911 Call 
        var CallGroupby = Call.reduce((p, c) => {
            var filter = c[option];
            var reason = c.Reason;
            if (!p.hasOwnProperty(filter)) {
              p[filter] = 0;
              p[filter][reason]=0;
            }
            p[filter]++;
            p[filter][reason]++;
            return p;
          }, {});
        

          // reformat Groupby's into arrays for Bar Chart inputs
          categories = Object.keys(EquipementGroupby);
          EquipmentArray = Object.values(EquipementGroupby);
          console.log(categories);
          console.log('equip', EquipmentArray);

          InvestigateArray = Object.values(InvestigateGroupby);
          MovingArray = Object.values(MovingGroupby);
          CallArray = Object.values(CallGroupby);

          console.log('Inv', InvestigateArray); 
          console.log('Moving', MovingArray);
          console.log('Call', CallArray);
      // APEX code for bar graph
      var options = {
        series: [{
          name: 'Equipment Violation',
          data: EquipmentArray
        }, {
          name: 'Investigative Stop',
          data: InvestigateArray
        }, {
          name: 'Moving Violation',
          data: MovingArray
        }],
        // }, {
        //  name: '911 Call / Citizen Reported',
        //  data: CallArray
        // }],
        chart: {
          type: 'bar',
          // height: 450,
          // width: 500,
          stacked: true,
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }],
        dataLabels: {
          enabled: false
        },
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        xaxis: {
          categories: categories,
        },
        legend: {
          position: 'right',
          offsetY: 20
        },
        fill: {
          opacity: 1
        },
        yaxis: {
          title: {
            text: 'Count'
          }
        }
      };
 
          var chart = new ApexCharts(document.querySelector("#plot"), options);
          chart.render();

      }).catch(function(error) {
        console.log(error);
      });
    }
   Init();
  