/**
 * Created by Aashish on 2/21/2016.
 */
Meteor.methods({
    getServerTime: function() {
        return Date.now();
    }
});