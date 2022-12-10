// remap jQuery to $
(function ($) {
  $(document).ready(function () {
    /* scroll to named anchor for any link that has an anchor set. Source: https://css-tricks.com/snippets/jquery/smooth-scrolling/ */
    $(function () {
      $('a[href*="#"]:not([href="#"])').click(function () {
        if (
          location.pathname.replace(/^\//, "") ==
            this.pathname.replace(/^\//, "") &&
          location.hostname == this.hostname
        ) {
          var target = $(this.hash);
          target = target.length
            ? target
            : $("[name=" + this.hash.slice(1) + "]");
          if (target.length) {
            $("html, body").animate(
              {
                scrollTop: target.offset().top - 90,
              },
              1000
            );

            /* Close mobile nav */
            var navMain = $(".navbar-collapse");
            navMain.collapse("hide");

            return false;
          }
        }
      });
    });

    $(".about-carousel").slick({
      dots: true,
      centerMode: true,
      centerPadding: "60px",
      slidesToShow: 3,
      responsive: [
        {
          breakpoint: 800,
          settings: {
            dots: true,
            centerMode: true,
            centerPadding: "40px",
            slidesToShow: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            dots: true,
            arrows: false,
            centerMode: true,
            centerPadding: "40px",
            slidesToShow: 1,
          },
        },
      ],
    });

    $(".sidmouth-carousel").slick({
      dots: true,
      centerMode: true,
      centerPadding: "60px",
      slidesToShow: 3,
      responsive: [
        {
          breakpoint: 800,
          settings: {
            dots: true,
            centerMode: true,
            centerPadding: "40px",
            slidesToShow: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            arrows: false,
            dots: true,
            centerMode: true,
            centerPadding: "40px",
            slidesToShow: 1,
          },
        },
      ],
    });

    // Date picker

    // get posts
    $.getJSON(
      "https://goldiescottagesidmouth.co.uk/wp-json/wp/v2/posts/?per_page=100&orderby=title&order=asc",
      function (data) {}
    ).done(function (data) {
      var apiData = "";
      var bookedDates = [];

      apiData = data;

      // build array of booked dates
      for (var i = 0; i < apiData.length; i++) {
        // conversion to lowercase to avoid legacy issues where avaialaility options were capitalised
        if (
          apiData[i]["acf"]["availability"].toLowerCase() == "reserved" ||
          apiData[i]["acf"]["availability"].toLowerCase() == "booked"
        ) {
          bookedDates.push(apiData[i]["title"]["rendered"]);
        }
      }

      if (bookedDates.length) {
        // expand array to include other days in booked weeks
        bookedDates.forEach(function (entry, index) {
          var tomorrow = new Date(entry);

          for (var i = 0; i < 6; i++) {
            tomorrow.setDate(tomorrow.getDate() + 1);
            var formattedDate = $.datepicker.formatDate("yy-mm-dd", tomorrow);
            bookedDates.push(formattedDate);
          }
        });
      }

      var startDate;
      var endDate;
      var departureDate;
      var dateToday = new Date();

      var selectCurrentWeek = function () {
        window.setTimeout(function () {
          $(".week-picker")
            .find(".ui-datepicker-current-day a")
            .addClass("ui-state-active");
        }, 1);
      };

      // remove loader
      $(".week-picker").html("");

      $(".week-picker").datepicker({
        showWeek: false,
        firstDay: 6,
        dateFormat: "DD, dd M yy",
        showOtherMonths: true,
        selectOtherMonths: true,
        minDate: dateToday,
        onSelect: function (dateText, inst) {
          var date = $(this).datepicker("getDate");
          var dayOfWeek = $.datepicker.formatDate("DD", date);

          // if user selects Saturday
          if (dayOfWeek == "Saturday") {
            startDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() - date.getDay() + 6
            );
            endDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() - date.getDay() + 12
            );
            departureDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() - date.getDay() + 13
            );
          } else {
            startDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() - date.getDay() - 1
            );
            endDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() - date.getDay() + 5
            );
            departureDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() - date.getDay() + 6
            );
          }

          var dateFormat =
            inst.settings.dateFormat || $.datepicker._defaults.dateFormat;

          $("#start-date").text(
            $.datepicker.formatDate(dateFormat, startDate, inst.settings)
          );
          $("#end-date").text(
            $.datepicker.formatDate(dateFormat, departureDate, inst.settings)
          );

          selectCurrentWeek();

          // Show the form
          $("#booking-summary").slideDown();
          // enable rest of the form
          $("#booking-form input").prop("disabled", false);

          // update hidden form field with start date
          var start = $.datepicker.formatDate(
            "yy-mm-dd",
            startDate,
            inst.settings
          );
          $("#form_start").attr("value", start);

          // set default price
          $("#price").text("tbc");

          // update prices
          for (var i = 0; i < apiData.length; i++) {
            if (apiData[i]["title"]["rendered"] == start) {
              var price = apiData[i]["acf"]["price"];
              if (price) {
                $("#price").text(price);
              } else {
                $("#price").text("tbc");
              }
            }
          }

          // console.log(apiData);
        },
        beforeShowDay: function (date) {
          // disable booked dates
          var cssClass = "";
          if (date >= startDate && date <= endDate) {
            cssClass = "ui-datepicker-current-day";
            return [true, cssClass];
          } else {
            var string = jQuery.datepicker.formatDate("yy-mm-dd", date);
            return [bookedDates.indexOf(string) == -1];
          }
        },
        onChangeMonthYear: function (year, month, inst) {
          selectCurrentWeek();
        },
      });
    });

    $(document).on(
      "mousemove",
      ".week-picker .ui-datepicker-calendar tr",
      function () {
        $(this).find("td a").addClass("ui-state-hover");
      }
    );
    $(document).on(
      "mouseleave",
      ".week-picker .ui-datepicker-calendar tr",
      function () {
        $(this).find("td a").removeClass("ui-state-hover");
      }
    );
  });

  $(window).on("load", function () {});
})(window.jQuery);
