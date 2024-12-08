// JavaScript Document
$(document).ready(function(){
    /**
     * Adds a 'fixed' class with animation to the inner header when the page is scrolled
     * beyond its original height. Removes the class when scrolled back to the top.
     */
	var	headerHeight = $("#innerHeader").outerHeight();
	$(window).scroll(function(){
		var window_top = $(window).scrollTop() + 1;
		if (window_top > headerHeight) {
			$('#innerHeader').addClass('fixed animated fadeInDown');
		} else {
			$('#innerHeader').removeClass('fixed animated fadeInDown');
		}
	});

    /**
     * Adds a 'homefixed' class with animation to the home header when the page is scrolled
     * beyond its original height. Removes the class when scrolled back to the top.
     */
    var	homeHeaderHeight = $("#header").outerHeight();
    $(window).scroll(function(){
        var window_top = $(window).scrollTop() + 1;
        if (window_top > homeHeaderHeight) {
            $('#header').addClass('homefixed animated fadeInDown');
        } else {
            $('#header').removeClass('homefixed animated fadeInDown');
        }
    });
});
