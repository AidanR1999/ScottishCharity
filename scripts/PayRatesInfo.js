//calls the api using the socGroup recieved from select box
$.getPayRate = function(socGroup) {
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc=' + socGroup + '&coarse=true',
        datatype: 'json',
        success: function(data) {
            //pass through the data
            displayPayRateData(data.series);
        }
    });
}

//allows for the html to call the ajax function
function getSocValue(option) {
    //pass in the soc group
    $.getPayRate(option.value);
}

//prints the pay rate data to the screen
function displayPayRateData(payRates) {
    //sort pay rates by year
    payRates = payRates.sort(compare);
    
    //get canvas context
    var ctx = document.getElementById('payRateChart').getContext('2d');

    //define graph data
    var graphLabels = getPayRateLabels(payRates);
    var graphValues = getPayRateValues(payRates);
    var graphData = {
        labels: graphLabels,
        datasets: [{
            data: graphValues,
            labels: graphLabels,
            backgroundColor: 'rgba(255, 99, 132, 1)',
            lineTension: 0
        }]
        
    };

    //draw graph
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: graphData,
        options: {
            legend: {
                display: false
            }
        }
    });
}

//populates the select list with all the jobs available
function populateOccupationSelectList(allJobs) {
    //get the select box context
    var selectBox = document.getElementById("occupationSelect");
    
    //for every job in the array
    for(var i = 0; i < allJobs.length; i++) {
        //checks if job has description
        if(allJobs[i].description != 'Not available') {

            //add the option to the select list
            var option = document.createElement('option');  
            option.setAttribute('value', allJobs[i].socGroup);
            option.appendChild(document.createTextNode(allJobs[i].description));
            selectBox.appendChild(option)
        }
    }
}

//comparison function between 2 values for the sort function
//code snippet derived from https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value
function compare( a, b ) {
    if ( a.year < b.year ){
      return -1;
    }
    if ( a.year > b.year ){
      return 1;
    }
    return 0;
  }

//returns an array of the years of payrates
function getPayRateLabels(payRates) {
    var labels = []
    payRates.forEach(obj => {
        labels.push(obj.year);
    });

    return labels
}

//returns an array of the estimated weekly pay of payrates
function getPayRateValues(payRates) {
    var values = []
    payRates.forEach(obj => {
        values.push(obj.estpay);
    });

    return values
}