Events = new Meteor.Collection("Events");

Events.allow({
  update: function () {
   return false;
  },
  remove: function (userId, doc) {
    return false;
  },
  insert: function() {
  	return true;
  }
});