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
            var member = findLatestMember(members);
            memberId = member.PersonID;
            $.getMSP(memberId);
        }
    })
}

function findLatestMember(members) {
    latestMember = members[0];

    for(var i = 0; i < members.length; i++){
        if(members[i].ValidUntilDate == null) {
            latestMember = members[i];
            break;
        }
        else if(members[i].ValidUntilDate > latestMember) {
            latestMember = members[i];
        }
    }

    return latestMember;
}

$.getMSP = function(memberId) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/members/' + memberId,
        datatype: 'json',

        success: function(member) {
            displayMSP(member);
        }
    })
}

function displayMSP(member) {
    console.log(member);
}