//gets the postcode from the textbox and calls the ajax function
function getJobData() {
    var postcode = document.getElementById('postcodeText').value;

    $.callJobsAPI(postcode);
}

//calls the api, pass in the postcode
$.callJobsAPI = function(postcode) {
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/census/jobs_breakdown?area=' + postcode,
        datatype: 'json',
        success: function(data) {
            //display the graph, pass in query results
            displayTopJobsGraph(data);

            //populate select list, pass in jobs
            populateOccupationSelectList(data.jobsBreakdown)
        }
    });
}

//prints the job graph to the page
function displayTopJobsGraph(data) {
    //display accordian menu
    document.getElementById("accordion-menu").style.display="block";

    //get canvas context
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
    
    //scroll the page down
    smoothScroll();
}

//returns the top 7 most popular jobs from the job list
function getTopJobs(jobsBreakdown) {
    var topJobs = [];

    //index
    var i = 0;

    //loop until array length is 7
    do {
        if(jobsBreakdown[i].description != 'Not available') {
            topJobs.push(jobsBreakdown[i]);
        }
        i++;
    } while (topJobs.length < 7);

    return topJobs;
}

//returns the labels for the top jobs
function getTopJobLabels(topJobs){
    var labels = [];
    topJobs.forEach(job => {
        labels.push(job.description);
    });
    return labels;
};

//returns the percentages for the top jobs
function getTopJobValues(topJobs) {
    var values = [];
    topJobs.forEach(job => {
        values.push(Math.round(job.percentage, 3));
    });
    return values;
}