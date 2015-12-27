/**
 * Created by Aashish on 12/27/2015.
 */
if(Meteor.isServer) {
    Meteor.publish("games", function (gameId) {
        return Games.find({_id: gameId});
    });
}