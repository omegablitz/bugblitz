/**
 * Created by Aashish on 12/27/2015.
 */
Meteor.publish("game", function (gameId) {
    return Games.find({_id: gameId});
});

Meteor.publish("onlineUsers", function() {
    return Meteor.users.find({"status.online": true}, {fields: {profile: 1}});
});