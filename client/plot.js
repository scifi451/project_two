// NOTES: rendering using data from CSV in server folder

// use data in csv file to generate plot to tinker
d3.csv("traffic_stop_TEST.csv").then(function(data, err) 
{
    // cut to error function if problem comes up in code
    if (err) throw err;

    // check if csv file loaded:
    console.log(data[0])

    // -------------------------------------------------
    // Source: Week Javascript, Day 3, Activity 3
    // // cycle through each traffic stop dictionary in the list to graph and count occurences
    // Object.entries(data).forEach(function([key, value]) {
        
    //     // console.log(key, value);
    //     // displays each dictionary corresponding to the traffic stop
    // });


    // -------------------------------------------------
    // Source : https://gist.github.com/JamieMason/0566f8412af9fe6a1d470aa1e089a752

    // const groupBy = key => array =>
    // array.reduce((objectsByKeyValue, obj) => {
    //     const value = obj[key];
    //     objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    //     return objectsByKeyValue;
    // }, {});

    // const groupByGender = groupBy('GENDER OF DRIVER');
    // const groupByRace = groupBy('RACE OF DRIVER');

    // console.log(
    // JSON.stringify({
    //     groupByRace: groupByRace(data),
    // }, null, 2)
    // );


    // -------------------------------------------------
    // Source :https://stackoverflow.com/questions/44387647/group-and-count-values-in-an-array/44387859

    var counts = data.issues.reduce((p, c) => {
        var name = c.fields.status.name;
        if (!p.hasOwnProperty(name)) {
          p[name] = 0;
        }
        p[name]++;
        return p;
      }, {});
      
      console.log(counts);
      
      var countsExtended = Object.keys(counts).map(k => {
        return {name: k, count: counts[k]}; });
      
      console.log(countsExtended);

    // load apex javascript library
    var options = {
        series: [{
          name: 'PRODUCT A',
          data: [44, 55, 41, 67, 22, 43]
        }, {
          name: 'PRODUCT B',
          data: [13, 23, 20, 8, 13, 27]
        }, {
          name: 'PRODUCT C',
          data: [11, 17, 15, 15, 21, 14]
        }, {
          name: 'PRODUCT D',
          data: [21, 7, 25, 13, 22, 8]
        }],
        chart: {
          type: 'bar',
          height: 350,
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
        plotOptions: {
          bar: {
            horizontal: false,
          },
        },
        xaxis: {
          type: 'datetime',
          categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
            '01/05/2011 GMT', '01/06/2011 GMT'
          ],
        },
        legend: {
          position: 'right',
          offsetY: 40
        },
        fill: {
          opacity: 1
        }
      };

      var chart = new ApexCharts(document.querySelector("#plot"), options);
      chart.render();

}).catch(function(error) {
	console.log(error);
});