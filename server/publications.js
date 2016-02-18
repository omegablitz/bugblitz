/**
 * Created by Aashish on 12/27/2015.
 */
Meteor.publish("game", function (gameId) {
    return Games.find({_id: gameId});
});