Meteor.methods({ 
  updateEventSecurely: function (password, eventId, eventName, eventContact, eventFee) {
    var eventToUpdate = Events.findOne({"_id":eventId});
    if(password) {
      if(password==eventToUpdate.password) {
        Events.update({
            _id:eventId
          }, 
          {
            $set: {
              name: eventName,
              contact: eventContact,
              fee: eventFee,
            }
          }
        );
        return true;
      }
      else {
        return "Incorrect password";
      }
    }
    else return "No password entered, you need to authenticate yourself before making changes to events."
  },
  deleteEventSecurely: function(password, eventId) {
    var eventToUpdate = Events.findOne({"_id":eventId});
    if(password) {
      if(password==eventToUpdate.password) {
        Events.remove({"_id":eventId});
        return true;
      }
      else {
        return "Incorrect password";
      }
    }
    else return "No password entered, you need to authenticate yourself before making changes to events."
  }
});

