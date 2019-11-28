function getJobData() {
    var postcode = getElementById('postcodeText').value;

    $.callJobsAPI(postcode);
}

$.callJobsAPI = function(postcode) {
    $.ajax({
        type: 'GET',
        url: 'http://api.lmiforall.org.uk/api/v1/census/jobs_breakdown?area=' + postcode,
        datatype: 'json',
        success: function(data) {
            displayJobsGraph(data);
        }
    });
}

function displayJobsGraph(data) {
    
}