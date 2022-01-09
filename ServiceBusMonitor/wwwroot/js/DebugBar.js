$(".debug-bar-button").on("click", function (event) {
    event.preventDefault();
    $(this)
        .parents(".debug-bar-holder")
        .toggleClass("shown");
});