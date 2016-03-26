/**
 * Created by Aashish on 12/27/2015.
 */
Meteor.publish("game", function (gameId) {
    return Games.find({_id: gameId});
});

Meteor.publish("userStatus", function() {
    return Meteor.users.find({"status.online": true}, {profile: {username: 1}});
});