(function (window, document, $) {
    "use strict";
  
    if (!$) {
      return;
    }
  
    window.VrConfig = window.VrConfig || {};
  
    // No-op shims for legacy inline handlers used by magazine templates.
    window.setAjaxData = function (payload) {
      return payload || {};
    };
    window.setSerializedData = function (formData) {
      return formData || [];
    };
    window.loadMorePosts = function () {};
    window.getUrlParameter = function (name) {
      return new URLSearchParams(window.location.search).get(name);
    };
    window.viewPollResults = function (id) {
      $("#poll_" + id + " .question").hide();
      $("#poll_" + id + " .result").show();
    };
    window.viewPollOptions = function (id) {
      $("#poll_" + id + " .result").hide();
      $("#poll_" + id + " .question").show();
    };
    window.addReaction = function () {};
    window.loadMoreComments = function () {};
    window.addRemoveReadingListItem = function () {};
    window.deleteComment = function () {};
    window.closeCookiesWarning = function () {
      $(".cookies-warning").hide();
    };
    window.showImagePreview = function (input, isBackground) {
      var targetId = $(input).attr("data-img-id");
      if (!targetId || !input.files || !input.files[0]) return;
      var reader = new FileReader();
      reader.onload = function (event) {
        if (isBackground) {
          $("#" + targetId).css("background-image", "url(" + event.target.result + ")");
        } else {
          $("#" + targetId).attr("src", event.target.result);
        }
      };
      reader.readAsDataURL(input.files[0]);
    };
  
    if (!$.fn.slick) {
      $.fn.slick = function () {
        return this;
      };
    }
  
    $(function () {
      $("form.needs-validation").attr("novalidate", "novalidate");
      $(".show-on-page-load").css("visibility", "visible");
  
      $(document).on("click", ".mobile-menu-button", function () {
        var $nav = $("#navMobile");
        var $overlay = $("#overlay_bg");
        $nav.toggleClass("nav-mobile-open");
        $overlay.toggle($nav.hasClass("nav-mobile-open"));
      });
  
      $(document).on("click", "#overlay_bg, .close-menu-click", function () {
        $("#navMobile").removeClass("nav-mobile-open");
        $("#overlay_bg").hide();
      });
  
      $(".mobile-search-button").on("click", function () {
        $(".mobile-search-form").slideToggle(300);
      });
  
      $(".search-icon").on("click", function () {
        $(".search-form").toggleClass("open");
      });
  
      $("#mobile-menu-trigger").on("click", function () {
        $("#mobile-menu-overlay").addClass("active");
        $("body").addClass("no-overflow");
      });
  
      $("#mobile-menu-close-trigger, .offcanvas-navigation--onepage ul li a").on("click", function () {
        $("#mobile-menu-overlay").removeClass("active");
        $("body").removeClass("no-overflow");
      });
  
      $("#open-off-sidebar-trigger").on("click", function () {
        $("#page-oppen-off-sidebar-overlay").addClass("active");
        $("body").addClass("no-overflow");
      });
  
      $("#menu-close-trigger").on("click", function () {
        $("#page-oppen-off-sidebar-overlay").removeClass("active");
        $("body").removeClass("no-overflow");
      });
  
      $("#search-overlay-trigger").on("click", function () {
        $("#search-overlay").addClass("active");
        $("body").addClass("no-overflow");
      });
  
      $("#search-close-trigger").on("click", function () {
        $("#search-overlay").removeClass("active");
        $("body").removeClass("no-overflow");
      });
  
      $("#hidden-icon-trigger").on("click", function () {
        $("#hidden-icon-wrapper").toggleClass("active");
      });
  
      var $window = $(window);
      var $sticky = $(".header-sticky");
      var stickyHeight = $sticky.length ? $sticky.outerHeight() : 100;
  
      $window.on("scroll", function () {
        var top = $window.scrollTop();
        if (top > stickyHeight) {
          $sticky.addClass("is-sticky");
        } else {
          $sticky.removeClass("is-sticky");
        }
  
        if (top > 100) {
          $(".scrollup, #scroll-top").fadeIn();
        } else {
          $(".scrollup, #scroll-top").fadeOut();
        }
      });
  
      $(".scrollup, #scroll-top").on("click", function (event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, 600);
      });
  
      var $offcanvas = $(".offcanvas-navigation");
      var $subMenus = $offcanvas.find(".sub-menu");
      $subMenus.parent().prepend('<span class="menu-expand"><i></i></span>');
      $subMenus.hide();
  
      $offcanvas.on("click", "li a, li .menu-expand", function (event) {
        var $trigger = $(this);
        if ($trigger.hasClass("menu-expand")) {
          event.preventDefault();
        }
  
        if (
          $trigger.siblings("ul:visible").length &&
          $trigger.attr("href") === "#"
        ) {
          event.preventDefault();
          $trigger.parent("li").toggleClass("active");
          $trigger.siblings("ul").slideToggle();
        } else if (
          ($trigger.attr("href") === "#" && $trigger.siblings("ul").length) ||
          $trigger.hasClass("menu-expand")
        ) {
          event.preventDefault();
          $trigger.parent("li").siblings("li").removeClass("active");
          $trigger
            .closest("li")
            .siblings("li")
            .find("li")
            .removeClass("active");
          $trigger
            .closest("li")
            .siblings("li")
            .find("ul:visible")
            .slideUp();
          $trigger.parent("li").toggleClass("active");
          $trigger.siblings("ul").slideToggle();
        }
      });
    });
  })(window, document, window.jQuery);