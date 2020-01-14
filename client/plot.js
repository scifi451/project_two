// NOTES: rendering using data from CSV in server folder

// use data in csv file to generate plot to tinker
d3.csv("Traffic_Stop_Cleaned_Data.csv").then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    // check if csv file loaded:
    console.log(data[0])

    // -------------------------------------------------
    // Source :https://stackoverflow.com/questions/44387647/group-and-count-values-in-an-array/44387859
        
        // // data is an array of dictionaries - WORKING CODE
        // var RaceCount = data.reduce((p, c) => {
        //   var race = c.Race;

        //   if (!p.hasOwnProperty(race)) {
        //     p[race] = 0;
        //   }
        //   p[race]++;
        //   return p;
        // }, {});
        
        // console.log(RaceCount);
        
        // var countsExtended = Object.keys(RaceCount).map(k => {
        //   return {Race: k, count: RaceCount[k]}; });
        
        // console.log(countsExtended);

    // filter data by "Equipment Violation"-----------------------------------------------------------
    let Equipement = data.filter(it => it.Reason.includes('Equipment Violation'));
    // console.log(Equipement);

    // count race of Equipment Violoation 
    var EquipementGroupbyRace = Equipement.reduce((p, c) => {
        var race = c.Race;
        var reason = c.Reason;
        if (!p.hasOwnProperty(race)) {
          p[race] = 0;
          p[race][reason]=0;
        }
        p[race]++;
        p[race][reason]++;
        return p;
      }, {});
      
      console.log(EquipementGroupbyRace);
      
      var EquipementGroupbyRaceExtended = Object.keys(EquipementGroupbyRace).map(k => {
        return {Race: k, count: EquipementGroupbyRace[k]}; });
      
      console.log(EquipementGroupbyRaceExtended);

    // filter data by "Investigative Stop"-----------------------------------------------------------
    let Investigate = data.filter(it => it.Reason.includes('Investigative Stop'));
    // console.log(Investigate);

    // count race of Investigative Stop 
    var InvestigateGroupbyRace = Investigate.reduce((p, c) => {
        var race = c.Race;
        var reason = c.Reason;
        if (!p.hasOwnProperty(race)) {
          p[race] = 0;
          p[race][reason]=0;
        }
        p[race]++;
        p[race][reason]++;
        return p;
      }, {});
      
      // console.log(InvestigateGroupbyRace);
      
      var InvestigateGroupbyRaceExtended = Object.keys(InvestigateGroupbyRace).map(k => {
        return {Race: k, count: InvestigateGroupbyRace[k]}; });
      
      console.log(InvestigateGroupbyRaceExtended);


    // filter data by "Moving Violation"-----------------------------------------------------------
    let Moving = data.filter(it => it.Reason.includes('Moving Violation'));
    // console.log(Moving);

    // count race of "Moving Violation" 
    var MovingGroupbyRace = Moving.reduce((p, c) => {
        var race = c.Race;
        var reason = c.Reason;
        if (!p.hasOwnProperty(race)) {
          p[race] = 0;
          p[race][reason]=0;
        }
        p[race]++;
        p[race][reason]++;
        return p;
      }, {});
      
      // console.log(MovingGroupbyRace);
      
      var MovingGroupbyRaceExtended = Object.keys(MovingGroupbyRace).map(k => {
        return {Race: k, count: MovingGroupbyRace[k]}; });
      
      console.log(MovingGroupbyRaceExtended);

    // filter data by 911 Call-----------------------------------------------------------
    let Call = data.filter(it => it.Reason.includes('911 Call / Citizen Reported'));
    // console.log(Moving);

    // count race of 911 Call 
    var CallGroupbyRace = Call.reduce((p, c) => {
        var race = c.Race;
        var reason = c.Reason;
        if (!p.hasOwnProperty(race)) {
          p[race] = 0;
          p[race][reason]=0;
        }
        p[race]++;
        p[race][reason]++;
        return p;
      }, {});
      
      // console.log(CallGroupbyRace);
      
      var CallGroupbyRaceExtended = Object.keys(CallGroupbyRace).map(k => {
        return {Race: k, count: CallGroupbyRace[k]}; });
      
      console.log(CallGroupbyRaceExtended);

      // reformat Groupby's into arrays for Bar Chart inputs
      categories = Object.keys(EquipementGroupbyRace);
      EquipmentArray = Object.values(EquipementGroupbyRace);
      console.log(categories);
      console.log(EquipmentArray);

      InvestigateArray = Object.values(InvestigateGroupbyRace);
      MovingArray = Object.values(MovingGroupbyRace);
      CallArray = Object.values(CallGroupbyRace);


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
        }, {
          name: '911 Call / Citizen Reported',
          data: CallArray
        }],
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