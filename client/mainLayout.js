/**
 * Created by Aashish on 3/2/2016.
 */
Template.mainLayout.events({
    "click .navbar-toggle": function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    }
});