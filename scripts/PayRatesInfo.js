$.getPayRate = function(socGroup) {
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/ashe/estimatePay?soc=' + socGroup + '&coarse=true',
        datatype: 'json',
        success: function(data) {
            displayPayRateData(data.series);
        }
    });
}

function getSocValue(option) {
    $.getPayRate(option.value);
}

function displayPayRateData(payRates) {
    //sort pay rates by year
    payRates = payRates.sort(compare);
    
    //get canvas
    var ctx = document.getElementById('payRateChart').getContext('2d');

    //define graph data
    var graphLabels = getPayRateLabels(payRates);
    var graphValues = getPayRateValues(payRates);
    var graphData = {
        labels: graphLabels,
        datasets: [{
            data: graphValues,
            labels: graphLabels,
            backgroundColor: 'rgba(255, 99, 132, 1)'
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

function populateOccupationSelectList(allJobs) {
    var selectBox = document.getElementById("occupationSelect");
    
    for(var i = 0; i < allJobs.length; i++) {
        if(allJobs[i].description != 'Not available') {
            var option = document.createElement('option');  
            option.setAttribute('value', allJobs[i].socGroup);
            option.appendChild(document.createTextNode(allJobs[i].description));
            selectBox.appendChild(option)
        }
    }
}

function compare( a, b ) {
    if ( a.year < b.year ){
      return -1;
    }
    if ( a.year > b.year ){
      return 1;
    }
    return 0;
  }

function getPayRateLabels(payRates) {
    var labels = []
    payRates.forEach(obj => {
        labels.push(obj.year);
    });

    return labels
}

function getPayRateValues(payRates) {
    var values = []
    payRates.forEach(obj => {
        values.push(obj.estpay);
    });

    return values
}