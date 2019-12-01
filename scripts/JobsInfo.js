function getJobData() {
    var postcode = document.getElementById('postcodeText').value;

    $.callJobsAPI(postcode);
}

$.callJobsAPI = function(postcode) {
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/census/jobs_breakdown?area=' + postcode,
        datatype: 'json',
        success: function(data) {
            displayTopJobsGraph(data);
            populateOccupationSelectList(data.jobsBreakdown)
        }
    });
}

function displayTopJobsGraph(data) {
    //display accordian menu
    document.getElementById("accordion-menu").style.display="block";

    //get chart canvas
    var ctx = document.getElementById('topJobsChart').getContext('2d');

    //define graph data
    var topJobs = getTopJobs(data.jobsBreakdown);
    var topJobsLabels = getTopJobLabels(topJobs);
    var topJobsValues = getTopJobValues(topJobs);
    var graphData = {
        labels: topJobsLabels,
        datasets: [{
            data: topJobsValues,
            labels: topJobsLabels,
            backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)', 
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(54, 162, 100, 1)',
            ]
        }]
    };

    //display graph
    var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: graphData,
        options: {
            tooltips: {
                mode: 'label',
                callbacks: {
                    afterLabel: function(tooltipItem, data) {
                        return '%';
                    }   
                }
            }
        }
    });

    //defaults to most populous pay rate
    $.getPayRate(topJobs[0].socGroup);
}

function getTopJobs(jobsBreakdown) {
    var topJobs = [];

    var i = 0;
    do {
        if(jobsBreakdown[i].description != 'Not available') {
            topJobs.push(jobsBreakdown[i]);
        }
        i++;
    } while (topJobs.length < 7);

    return topJobs;
}

function getTopJobLabels(topJobs){
    var labels = [];
    topJobs.forEach(job => {
        labels.push(job.description);
    });
    return labels;
};

function getTopJobValues(topJobs) {
    var values = [];
    topJobs.forEach(job => {
        values.push(Math.round(job.percentage, 3));
    });
    return values;
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}