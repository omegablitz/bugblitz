/**
 * Created by Aashish on 3/25/2016.
 */
Template.players.helpers({
    online: function() {
        return JSON.stringify(Meteor.users.find({"status": {online: true}}).fetch());
    }
});