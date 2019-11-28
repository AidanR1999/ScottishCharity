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
                    $.getConstMSPs(obj.ID, obj);
                }
            });
        }
    })
}

$.getConstMSPs = function(constId, constituencyData) {
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
            $.getMSP(memberId, constituencyData, member);
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

$.getMSP = function(memberId, constituencyData, memConstituencyData) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/members/' + memberId,
        datatype: 'json',

        success: function(member) {
            displayMSP(member, constituencyData, memConstituencyData);
            $.getMemParty(member);
        }
    })
}

function displayMSP(member, constituencyData, memConstituencyData) {
    //display msp section
    document.getElementById("yourmsp").style.display="block";

    //display photo if one exists
    if(member.PhotoURL != "")
        $('#msp-image').attr("src", member.PhotoURL);
    
    //show name
    $('#msp-name').text(rearangeMspName(member.ParliamentaryName));

    //show gender
    var genderText = $('#msp-gender');
    if(member.GenderTypeID == 1) {
        genderText.text('Gender: Female');
    }
    else if(member.GenderTypeID == 2) {
        genderText.text('Gender: Male');
    }
    else {
        genderText.text('Gender: Other');
    }

    //display birthdate
    var birthdate = new Date(member.BirthDate);
    $('#msp-birthdate').text("Birthdate: " + formatDate(birthdate));

    //display constituency
    $('#msp-const').text("Constituency: " + constituencyData.Name);
}

function rearangeMspName(name) {
    var commaPos = name.indexOf(',');
    var surname = name.substring(0, commaPos);
    var forename = name.substring(commaPos + 2, name.length);

    return forename + " " + surname;
}

function formatDate(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
  }
  
  $.getMemParty = function(member) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/memberparties/',
        datatype: 'json',

        success: function(data) {
            data.forEach(obj => {
                if(obj.PersonID == member.PersonID) {
                    $.getParty(obj);
                }
            });
        }
    })
  }

  $.getParty = function(memParty) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/parties/' + memParty.PartyID,
        datatype: 'json',

        success: function(party) {
            displayPartyName(party);
        }
    })
  }

  function displayPartyName(party) {
    $('#msp-party').text("Party: " + party.ActualName);
  }