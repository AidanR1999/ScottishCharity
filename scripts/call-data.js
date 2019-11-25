function getPostcode() {
    var postcode = document.getElementById('postcodeText').value;

    if(postcode === ""){
        return null;
    }

    $.findMSPInfo(postcode);
}

$.findMSPInfo = function(postcode) {
    $.getConstCode(postcode);
}

$.getConstCode = function(postcode) {

    $.ajax({
        type: 'GET',
        url: 'https://api.postcodes.io/scotland/postcodes/' + postcode,
        datatype: 'json',
        success: function(data) {
            $.getConstId(data.result.codes.scottish_parliamentary_constituency)
        }
    });
}

$.getConstId = function(constCode) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/constituencies',
        datatype: 'json',

        success: function(data) {
            data.forEach(obj => {
                if(obj.ConstituencyCode == constCode) {
                    $.getConstMSPs(obj.ID);
                    continue;
                }
            });
        }
    })
}

$.getConstMSPs = function(constId) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/MemberElectionConstituencyStatuses',
        datatype: 'json',

        success: function(data) {
            var members = [];
            data.forEach(obj => {
                if(obj.ConstituencyID == constId) {
                    members.push(obj);
                }
            });
            findLatestMember(members);
        }
    })
}

function findLatestMember(members) {
    console.log(members);
}