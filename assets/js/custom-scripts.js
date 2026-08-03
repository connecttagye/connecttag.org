$(document).ready(function(){
   $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
			scrollTop: ($($anchor.attr('href')).offset().top) 
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});

$('body').scrollspy({
    target: '.navbar-fixed-top'
})

$('.navbar-collapse ul li a').click(function() {
    $('.navbar-toggle:visible').click();
});

// Sidebar Overlay Logic
$(document).ready(function() {
    $('.navbar-toggle').click(function() {
        if (!$('.nav-overlay').length) {
            $('body').append('<div class="nav-overlay"></div>');
        }
        $('.nav-overlay').fadeToggle(300);
    });

    $(document).on('click', '.nav-overlay', function() {
        $('.navbar-toggle').click();
    });
});