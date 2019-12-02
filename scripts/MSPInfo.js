//gets the postcode from the textbox, calls the find msp functions
function getPostcode() {
    //get postcode
    var postcode = document.getElementById('postcodeText').value;

    //if postcode is empty show error
    if(postcode === ""){
        showError();
        return null;
    }

    //gets the job data first as this is the slowest process
    getJobData();

    //start the find msp process
    $.getConstCode(postcode);
}

//changes class of textbox to indicate error
function showError() {
    var textbox = document.getElementById("postcodeText");
    textbox.className += " input-error";
}

//using the postcode, get the long constituency code from the api
$.getConstCode = function(postcode) {
    $.ajax({
        type: 'GET',
        url: 'https://api.postcodes.io/scotland/postcodes/' + postcode,
        datatype: 'json',

        success: function(data) {
            //reset textbox class in case it displayed error
            var textbox = document.getElementById("postcodeText");
            textbox.className = "postcode-input";

            //call the get constituency id function, pass in constituency code
            $.getConstId(data.result.codes.scottish_parliamentary_constituency)
        },
        error: function() {
            //show error if api returns fail
            showError();
        }
    });
}

//gets the small constituency number by iterating through constituencies
$.getConstId = function(constCode) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/constituencies',
        datatype: 'json',

        success: function(data) {
            //for every constituency
            data.forEach(obj => {
                
                //if codes match, call next function in process
                if(obj.ConstituencyCode == constCode) {
                    $.getConstMSPs(obj.ID, obj);
                }
            });
        }
    })
}

//gets the msp id for the postcode using the relational table between constituency and member
$.getConstMSPs = function(constId, constituencyData) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/MemberElectionConstituencyStatuses',
        datatype: 'json',

        success: function(data) {
            //instantiate array of members
            var members = [];

            //for every relationship
            data.forEach(obj => {

                //if constituency id's match
                if(obj.ConstituencyID == constId) {

                    //add relationship to array
                    members.push(obj);
                }
            });

            //find latest member
            var member = findLatestMember(members);

            //calls the get msp data function
            memberId = member.PersonID;
            $.getMSP(memberId, constituencyData, member);
        }
    })
}

//returns the latest member of a constituency in the given array of members
function findLatestMember(members) {
    //assign latest member
    latestMember = members[0];

    //for every member in array
    for(var i = 0; i < members.length; i++){
        if(members[i].ValidUntilDate == null) {
            //assume member is latest
            latestMember = members[i];
            break;
        }

        //set latest member in the current iteration
        else if(members[i].ValidUntilDate > latestMember) {
            latestMember = members[i];
        }
    }

    return latestMember;
}

//gets the msp data from the api using the member id
$.getMSP = function(memberId, constituencyData, memConstituencyData) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/members/' + memberId,
        datatype: 'json',

        success: function(member) {
            //display the member details
            displayMSP(member, constituencyData, memConstituencyData);

            //get msp party relationship
            $.getMemParty(member);
        }
    })
}

//prints the msp information to the page
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

//re-aranges the given msp name to the correct format
function rearangeMspName(name) {
    //position of comma
    var commaPos = name.indexOf(',');

    //get surname
    var surname = name.substring(0, commaPos);

    //get forename
    var forename = name.substring(commaPos + 2, name.length);

    //concat full name
    return forename + " " + surname;
}

//formats msp birthday to correct format to string
//code snippet from https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
function formatDate(date) {
    //all month names
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
  
    //get individual values from date
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    //return full string, using month index to get month name
    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}
  
//gets the relationship beteween member and party
$.getMemParty = function(member) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/memberparties/',
        datatype: 'json',

        success: function(data) {
            //for every relationship, match the person id
            data.forEach(obj => {
                if(obj.PersonID == member.PersonID) {

                    //get party details, pass in relationship
                    $.getParty(obj);
                }
            });
        }
    })
}

//gets the party information of the msp using party id
$.getParty = function(memParty) {
    $.ajax({
        type: 'GET',
        url: 'https://data.parliament.scot/api/parties/' + memParty.PartyID,
        datatype: 'json',

        success: function(party) {
            //display data
            displayPartyName(party);
        }
    })
}

//displays msp party name using party object
function displayPartyName(party) {
    //set label to party name
    $('#msp-party').text("Party: " + party.ActualName);
}