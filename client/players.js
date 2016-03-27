/**
 * Created by Aashish on 3/25/2016.
 */
Template.players.helpers({
    online: function() {
        return Meteor.users.find({}).fetch();
    }
});