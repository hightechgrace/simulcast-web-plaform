
if (Meteor.isClient) {
  autoPullMarkerUpdates();
  Deps.autorun(function() {
    Meteor.subscribe('events');
  });
  Template.map.greeting = function () {
    return "Welcome to TEDxSimulcast.";
  };
  var tempvar;
  Template.map.events({
    'click .add-event' : function () {
      var name = $("#eventName").val();
      var contact = $("#eventContact").val();
      var fee = $("#eventFee").val();
      var password = $("#eventPassword").val();

      if(validateEventDetails(name, contact, fee)) {
        var eventLocationSelector = $("#selected_location");
        var eventLocation = new google.maps.LatLng(eventLocationSelector.attr("eventlat"),eventLocationSelector.attr("eventlong"));
        var marker = new google.maps.Marker({
          map: map,
          position: eventLocation,
          title: ''
        });
        map.setCenter(eventLocation);
        Events.insert({
          position: eventLocation,
          name: name,
          contact: contact,
          fee: fee,
          password: password
        }); 
        $('#eventForm').modal('toggle');
        if (infowindow) {
            infowindow.close();
        }
        updateMarkers();
      }
    },
    'click .event-address' : function () {
      var eventAddressSelector = $("#event_address");
      var geo = new google.maps.Geocoder;
      var eventLocation;

      geo.geocode({'address':eventAddressSelector.val()},function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
          eventLocation = results[0].geometry.location;
           if (infowindow) {
                infowindow.close();
            }
           infowindow = new google.maps.InfoWindow({
            map: map,
            position: eventLocation,
            content: '<p class="lead">Your Viewing Location</p>Is this the place where you will be viewing live stream?<p><a class="btn btn-info" id="selected_location" href="#eventForm" data-toggle="modal" eventlat="' + eventLocation.jb + '" eventlong="' + eventLocation.kb + '">Yup, this is it!</a></p>'
          });
          map.setCenter(eventLocation);
          map.setZoom(13);
        }
        else {
          alert("Sorry, cannot find you!");
        }
      });
    },
    'click .find-location-nogeo' : function () {
      console.log("Attempting to locate street address");
      var eventAddressSelector = $("#event_address_nogeo");
      var geo = new google.maps.Geocoder;
      var eventLocation;

      geo.geocode({'address':eventAddressSelector.val()},function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
          eventLocation = results[0].geometry.location;
           if (infowindow) {
                infowindow.close();
            }
           infowindow = new google.maps.InfoWindow({
            map: map,
            position: eventLocation,
            content: '<p class="lead">Your Viewing Location</p>Is this the place where you will be viewing live stream?<p><a class="btn btn-info" id="selected_location" href="#eventForm" data-toggle="modal" eventlat="' + eventLocation.jb + '" eventlong="' + eventLocation.kb + '">Yup, this is it!</a></p>'
          });
          map.setCenter(eventLocation);
          map.setZoom(13);
        }
        else {
          alert("Sorry, cannot find you!");
        }
      });
    },
    'click .update-event' : function () {
      // edit the event if password is correct
      var eventToUpdate = Events.findOne({"_id":$("#eventId").val()});
      $("#updateEventName").val();
      $('#editEventForm').modal('toggle');
      $("#updateEventName").val(eventToUpdate.name);
      $("#updateEventContact").val(eventToUpdate.contact);
      $("#updateEventFee").val(eventToUpdate.fee);

    },
    'click .save-event-update' : function() {
      Meteor.call('updateEventSecurely',$("#updateEventPassword").val(), $("#eventId").val(), $("#updateEventName").val(), $("#updateEventContact").val(), $("#updateEventFee").val(), 
        function (error, result) { 
          console.log(error); 
          if(result==true) {
            $('#editEventForm').modal('toggle');
          }
          else {
            if(result) {
              $("#result").html(result);
            }
            else {
              $("#result").html("We're sorry. Something went wrong. #fail");
            }
          }
        });
    },
    'click .delete-event' : function() {
      Meteor.call('deleteEventSecurely',$("#updateEventPassword").val(), $("#eventId").val(), 
        function (error, result) { 
          console.log(error); 
          if(result==true) {
            $('#editEventForm').modal('toggle');
          }
          else {
            if(result) {
              $("#result").html(result);
            }
            else {
              $("#result").html("We're sorry. Something went wrong. #fail");
            }
          }
        });
    },
    'click .update-map' : function () {
      updateMarkers();
    },
    'click .my-location' : function() {
      // Try HTML5 geolocation
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = new google.maps.LatLng(position.coords.latitude,
                                           position.coords.longitude);
           if (infowindow) {
              infowindow.close();
          }
          infowindow = new google.maps.InfoWindow({
            map: map,
            position: pos,
            content: '<p><strong>Your Viewing Location</strong></p><p>Is this the place where you will be viewing live stream?</p><a class="btn btn-info" id="selected_location"  href="#eventForm" data-toggle="modal" eventlat="' + pos.jb + '" eventlong="' + pos.kb + '">Yup, this is it!</a>'
          });

          map.setCenter(pos);
          map.setZoom(13);

        }, function() {
          handleNoGeolocation(true);
        });
      } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
      }
    }
  });

function autoPullMarkerUpdates() {
  console.log("Updating markers");
  setInterval(updateMarkers, 3000);
}

function validateEventDetails(name, contact, fee) {
  console.log("validating");
  if(name) {
    if (contact) {
      if (fee) {
        return true;
      }
    }
  }
  $("#event_details_errors").html("Please fill in all the information before saving.");
  return false;
}
function updateMarkers() {
    Events.find({}).forEach(function(event) {
      if(event.position) {
        var eventLocation = new google.maps.LatLng(event.position.jb,event.position.kb);

        var marker = new google.maps.Marker({
          position: eventLocation,
          map: map,
          title:"Hello World!"
        });
        var infoWindow1 = new google.maps.InfoWindow({
            content: '<p class="lead">' + event.name + '</p><p><strong>Entrance:</strong> ' + event.fee + '</p><p><strong>Contact:</strong> ' + event.contact + '</p><a href="#" class="update-event" onclick="$('+ "'#eventId'" + ').val(' + "'" + event._id + "'" + ')"><small>Is this your event? Update it here</small></a>'
        });
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow1.open(map, marker);
        });
      }
    });
  }
}

if (Meteor.isServer) {
  
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.publish("events", function () {
    return Events.find({}, {fields: {password: 0}});
  });

}
