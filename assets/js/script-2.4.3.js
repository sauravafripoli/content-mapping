function setAjaxData(object = null) {
    var data = {
        'sysLangId': VrConfig.sysLangId,
    };
    data[VrConfig.csrfTokenName] = $('meta[name="X-CSRF-TOKEN"]').attr('content');
    if (object != null) {
        Object.assign(data, object);
    }
    return data;
}

function setSerializedData(serializedData) {
    serializedData.push({name: 'sysLangId', value: VrConfig.sysLangId});
    serializedData.push({name: VrConfig.csrfTokenName, value: $('meta[name="X-CSRF-TOKEN"]').attr('content')});
    return serializedData;
}

// Passive event listeners
jQuery.event.special.touchstart = {
    setup: function (_, ns, handle) {
        this.addEventListener("touchstart", handle, {passive: !ns.includes("noPreventDefault")});
    }
};
jQuery.event.special.touchmove = {
    setup: function (_, ns, handle) {
        this.addEventListener("touchmove", handle, {passive: !ns.includes("noPreventDefault")});
    }
};
//validation
(function () {
    'use strict'
    var forms = document.querySelectorAll('.needs-validation')
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
})();

//tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
});


//Popover Intialisation
document.addEventListener('DOMContentLoaded', function () {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl, {
        sanitize: false // Required if your data-bs-content has HTML that you trust
      })
    })
});

//lazyload background images
document.addEventListener('lazybeforeunveil', function (e) {
    var bg = e.target.getAttribute('data-bg');
    if (bg) {
        e.target.style.backgroundImage = 'url(' + bg + ')';
    }
});

//run on page load
$(document).ready(function () {
    var $postPage = $('#postDetailsPage');
    var postId = parseInt($postPage.attr('data-id') || '0', 10);
    if ($postPage.length < 1 || $postPage.attr('data-apri-runonload') == '0' || !postId || $('#postNextPrevContainer').length < 1) {
        return;
    }
    $.ajax({
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/runOnPageLoad',
        data: setAjaxData({'isPostPage': true, 'postId': postId}),
        success: function (response) {
            var obj = JSON.parse(response);
            if (obj.result == 1) {
                if (obj.isPostPage) {
                    var container = document.getElementById("postNextPrevContainer");
                    if (container) {
                        container.innerHTML = obj.htmlContent;
                    }
                }
            }
        }
    });
});

//mobile memu
$(document).on('click', '.mobile-menu-button', function () {
    if ($("#navMobile").hasClass('nav-mobile-open')) {
        $("#navMobile").removeClass('nav-mobile-open');
        $('#overlay_bg').hide();
    } else {
        $("#navMobile").addClass('nav-mobile-open');
        $('#overlay_bg').show();
    }
});
$(document).on('click', '#overlay_bg', function () {
    $("#navMobile").removeClass('nav-mobile-open');
    $('#overlay_bg').hide();
});
//close menu
$('.close-menu-click').click(function () {
    $('#navMobile').removeClass('nav-mobile-open');
    $('#overlay_bg').hide();
});

$(document).ready(function () {
    $('form.needs-validation').attr('novalidate', 'novalidate');
    $(".show-on-page-load").css("visibility", "visible");

    $('.nav-main .nav-item-category').hover(function () {
        var categoryId = $(this).attr('data-category-id');
        $('.mega-menu').css('display', 'none');
        $('.mega-menu .link-sub-category').removeClass('active');
        $('.mega-menu .menu-category-items').removeClass('active');
        $('.mega-menu .link-sub-category-all').addClass('active');
        $('.mega-menu .menu-right .filter-all').addClass('active');
        $('.mega-menu-' + categoryId).css('display', 'flex');
    }, function () {
        $('.mega-menu').css('display', 'none');
    });
    $('.mega-menu').hover(function () {
        $(this).css('display', 'flex');
        var categoryId = $(this).attr('data-category-id');
        $('.nav-main .nav-item-category-' + categoryId).addClass('active');
    }, function () {
        $('.mega-menu').css('display', 'none');
        $('.nav-main .nav-item-category').removeClass('active');
    });
    $('.mega-menu .link-sub-category').hover(function () {
        var filter = $(this).attr('data-category-filter');
        $('.mega-menu .link-sub-category').removeClass('active');
        $(this).addClass('active');
        $('.mega-menu .menu-category-items').removeClass('active');
        $('.mega-menu .menu-right .filter-' + filter).addClass('active');
    }, function () {
    });

    $('.mobile-search-button').click(function () {
        $('.mobile-search-form').slideToggle(300);
    });

    //main slider
    $('#main-slider').slick({
        autoplay: true,
        autoplaySpeed: 4900,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        speed: 200,
        rtl: VrConfig.rtl,
        cssEase: 'linear',
        lazyLoad: 'progressive',
        prevArrow: $('#main-slider-nav .prev'),
        nextArrow: $('#main-slider-nav .next'),
    });

    $('#post-detail-slider').slick({
        autoplay: false,
        autoplaySpeed: 4900,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: false,
        speed: 200,
        rtl: VrConfig.rtl,
        adaptiveHeight: true,
        lazyLoad: 'progressive',
        prevArrow: $('#post-detail-slider-nav .prev'),
        nextArrow: $('#post-detail-slider-nav .next'),
    });

/*    $('.newsticker li').delay(500).fadeIn(100);
    $('.newsticker').newsTicker({
        row_height: 30,
        max_rows: 1,
        speed: 400,
        direction: 'up',
        duration: 4000,
        autostart: 1,
        pauseOnHover: 0,
        prevButton: $('#nav_newsticker .prev'),
        nextButton: $('#nav_newsticker .next')
    });
*/
    if (VrConfig.categorySliderIds.length > 0) {
        for (var i = 0; i < VrConfig.categorySliderIds.length; i++) {
            var sliderId = VrConfig.categorySliderIds[i];
            $('#category_slider_' + sliderId).slick({
                autoplay: true,
                autoplaySpeed: 4900,
                infinite: true,
                speed: 200,
                rtl: VrConfig.rtl,
                cssEase: 'linear',
                prevArrow: $('#category_slider_nav_' + sliderId + ' .prev'),
                nextArrow: $('#category_slider_nav_' + sliderId + ' .next'),
                slidesToShow: 4,
                slidesToScroll: 1,
                responsive: [
                    {breakpoint: 992, settings: {slidesToShow: 3, slidesToScroll: 1}},
                    {breakpoint: 768, settings: {slidesToShow: 2, slidesToScroll: 1}},
                    {breakpoint: 576, settings: {slidesToShow: 1, slidesToScroll: 1}}
                ]
            });
        }
    }
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.scrollup').fadeIn()
        } else {
            $('.scrollup').fadeOut()
        }
    });
    $(".scrollup").click(function () {
        $('html, body').animate({scrollTop: 0}, 700);
        return false
    });
});

//search
$(".search-icon").click(function () {
    if ($(".search-form").hasClass("open")) {
        $(".search-form").removeClass("open");
    } else {
        $(".search-form").addClass("open");
    }
});
//login
$(document).ready(function () {
    $("#form-login").submit(function (event) {
        event.preventDefault();
        var form = $(this);
        var serializedData = form.serializeArray();
        serializedData = setSerializedData(serializedData);
        $.ajax({
            url: VrConfig.baseURL + '/Auth/loginPost',
            type: 'POST',
            data: serializedData,
            success: function (response) {
                var obj = JSON.parse(response);
                if (obj.result == 1) {
                    location.reload();
                } else if (obj.result == 0) {
                    document.getElementById("result-login").innerHTML = obj.error_message;
                }
            }
        });
    });

    $(".form-newsletter").submit(function (event) {
        event.preventDefault();
        var formId = $(this).attr('id');
        var input = '#' + formId + " .newsletter-input";
        var email = $(input).val().trim();
        if (email == '') {
            $(input).addClass('is-invalid');
            return false;
        } else {
            $(input).removeClass('is-invalid');
        }
        var serializedData = $(this).serializeArray();
        serializedData = setSerializedData(serializedData);
        $.ajax({
            type: 'POST',
            url: VrConfig.baseURL + '/add-newsletter-post',
            data: serializedData,
            success: function (response) {
                var obj = JSON.parse(response);
                if (obj.result == 1) {
                    if (obj.isSuccess) {
                        Swal.fire({text: obj.message, icon: 'success', confirmButtonText: VrConfig.textOk});
                        $(input).val('');
                    } else {
                        Swal.fire({text: obj.message, icon: 'warning', confirmButtonText: VrConfig.textOk});
                    }
                }
            }
        });
    });
});

//load more posts
var pageNumLoadMorePosts = 1;

function loadMorePosts(langId, type) {
    pageNumLoadMorePosts++;
    var data = {
        'lang_id': langId,
        'page': pageNumLoadMorePosts,
        'type': type,
        'view': '_post_item',
        'q': getUrlParameter('q')
    };
    $(".btn-load-more").prop("disabled", true);
    $('.btn-load-more svg').hide();
    $('.btn-load-more .spinner-load-more').show();
    $.ajax({
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/loadMorePosts',
        data: setAjaxData(data),
        success: function (response) {
            var obj = JSON.parse(response);
            if (obj.result == 1) {
                setTimeout(function () {
                    $("#postsLoadMoreContent").append(obj.htmlContent);
                    $(".btn-load-more").prop("disabled", false);
                    $('.btn-load-more svg').show();
                    $('.btn-load-more .spinner-load-more').hide();
                    if (!obj.hasMore) {
                        $(".btn-load-more").hide();
                    }
                }, 200);
            } else {
                setTimeout(function () {
                    $(".btn-load-more").hide();
                    $('.btn-load-more svg').show();
                    $('.btn-load-more .spinner-load-more').hide();
                }, 200);
            }
        }
    });
}

function getUrlParameter(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get(param);
}

//view poll results
function viewPollResults(a) {
    $("#poll_" + a + " .question").hide();
    $("#poll_" + a + " .result").show()
}

//view poll option
function viewPollOptions(a) {
    $("#poll_" + a + " .result").hide();
    $("#poll_" + a + " .question").show()
}

//add reaction
let reactionAjaxRequest = false;

function addReaction(postId, reaction) {
    if (reactionAjaxRequest) {
        return false;
    }
    reactionAjaxRequest = true;
    var data = {
        'post_id': postId,
        'reaction': reaction
    };
    $.ajax({
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/addReaction',
        data: setAjaxData(data),
        success: function (response) {
            var obj = JSON.parse(response);
            if (obj.result == 1) {
                document.getElementById("reactions_result").innerHTML = obj.htmlContent
            }
        },
        complete: function () {
            reactionAjaxRequest = false;
        }
    });
}

//vote poll
$(document).ready(function () {
    $(".poll-form").submit(function (event) {
        event.preventDefault();
        var formId = $(this).attr("data-form-id");
        var form = $(this);
        var serializedData = form.serializeArray();
        serializedData = setSerializedData(serializedData);
        $.ajax({
            url: VrConfig.baseURL + '/Ajax/addPollVote',
            type: 'POST',
            data: serializedData,
            success: function (response) {
                var obj = JSON.parse(response);
                if (obj.result == 1) {
                    if (obj.htmlContent == 'required') {
                        $("#poll-required-message-" + formId).show();
                        $("#poll-error-message-" + formId).hide();
                    } else if (obj.htmlContent == 'voted') {
                        $("#poll-required-message-" + formId).hide();
                        $("#poll-error-message-" + formId).show();
                    } else {
                        document.getElementById("poll-results-" + formId).innerHTML = obj.htmlContent;
                        $("#poll_" + formId + " .result").show();
                        $("#poll_" + formId + " .question").hide()
                    }
                }
            }
        });
    });

    $("#add_comment").submit(function (event) {
        event.preventDefault();
        var formValues = $(this).serializeArray();
        var data = {};
        var submit = true;
        $(formValues).each(function (i, field) {
            if ($.trim(field.value).length < 1) {
                $("#add_comment [name='" + field.name + "']").addClass("is-invalid");
                submit = false;
            } else {
                $("#add_comment [name='" + field.name + "']").removeClass("is-invalid");
                data[field.name] = field.value;
            }
        });
        data['limit'] = $('#post_comment_limit').val();
        if (VrConfig.isRecaptchaEnabled == true) {
            if (typeof data['g-recaptcha-response'] === 'undefined') {
                $('.g-recaptcha').addClass("is-recaptcha-invalid");
                submit = false;
            } else {
                $('.g-recaptcha').removeClass("is-recaptcha-invalid");
            }
        }
        if (submit == true) {
            $('.g-recaptcha').removeClass("is-recaptcha-invalid");
            $.ajax({
                type: 'POST',
                url: VrConfig.baseURL + '/Ajax/addCommentPost',
                data: setAjaxData(data),
                success: function (response) {
                    var obj = JSON.parse(response);
                    if (obj.type == 'message') {
                        document.getElementById("message-comment-result").innerHTML = obj.htmlContent;
                    } else {
                        document.getElementById("comment-result").innerHTML = obj.htmlContent;
                    }
                    if (VrConfig.isRecaptchaEnabled == true) {
                        grecaptcha.reset();
                    }
                    $("#add_comment")[0].reset();
                }
            });
        }
    });

    $("#add_comment_registered").submit(function (event) {
        event.preventDefault();
        var formValues = $(this).serializeArray();
        var data = {
            'limit': $('#post_comment_limit').val()
        };
        var submit = true;
        $(formValues).each(function (i, field) {
            if ($.trim(field.value).length < 1) {
                $("#add_comment_registered [name='" + field.name + "']").addClass("is-invalid");
                submit = false;
            } else {
                $("#add_comment_registered [name='" + field.name + "']").removeClass("is-invalid");
                data[field.name] = field.value;
            }
        });
        data['limit'] = $('#post_comment_limit').val();
        if (submit == true) {
            $.ajax({
                type: 'POST',
                url: VrConfig.baseURL + '/Ajax/addCommentPost',
                data: setAjaxData(data),
                success: function (response) {
                    var obj = JSON.parse(response);
                    if (obj.type == 'message') {
                        document.getElementById("message-comment-result").innerHTML = obj.htmlContent;
                    } else {
                        document.getElementById("comment-result").innerHTML = obj.htmlContent;
                    }
                    $("#add_comment_registered")[0].reset();
                }
            });
        }
    });
});

//add subcomment
$(document).on('click', '.btn-subcomment', function () {
    var commentId = $(this).attr("data-comment-id");
    var data = {};
    data['limit'] = $('#post_comment_limit').val();
    var formId = "#add_subcomment_" + commentId;
    $(formId).ajaxSubmit({
        beforeSubmit: function () {
            var formValues = $("#add_subcomment_" + commentId).serializeArray();
            var submit = true;
            $(formValues).each(function (i, field) {
                if ($.trim(field.value).length < 1) {
                    $(formId + " [name='" + field.name + "']").addClass("is-invalid");
                    submit = false;
                } else {
                    $(formId + " [name='" + field.name + "']").removeClass("is-invalid");
                    data[field.name] = field.value;
                }
            });
            if (VrConfig.isRecaptchaEnabled == true) {
                if (typeof data['g-recaptcha-response'] === 'undefined') {
                    $(formId + ' .g-recaptcha').addClass("is-recaptcha-invalid");
                    submit = false;
                } else {
                    $(formId + ' .g-recaptcha').removeClass("is-recaptcha-invalid");
                }
            }
            if (submit == false) {
                return false;
            }
        },
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/addCommentPost',
        data: setAjaxData(data),
        success: function (response) {
            if (VrConfig.isRecaptchaEnabled == true) {
                grecaptcha.reset();
            }
            var obj = JSON.parse(response);
            if (obj.type == 'message') {
                document.getElementById("message-subcomment-result-" + commentId).innerHTML = obj.htmlContent;
            } else {
                document.getElementById("comment-result").innerHTML = obj.htmlContent;
            }
            $('.visible-sub-comment form').empty();
        }
    })
});

//add registered subcomment
$(document).on('click', '.btn-subcomment-registered', function () {
    var commentId = $(this).attr("data-comment-id");
    var data = {};
    $("#add_subcomment_registered_" + commentId).ajaxSubmit({
        beforeSubmit: function () {
            var form = $("#add_subcomment_registered_" + commentId).serializeArray();
            var comment = $.trim(form[0].value);
            if (comment.length < 1) {
                $(".form-comment-text").addClass("is-invalid");
                return false;
            } else {
                $(".form-comment-text").removeClass("is-invalid");
            }
        },
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/addCommentPost',
        data: setAjaxData(data),
        success: function (response) {
            var obj = JSON.parse(response);
            if (obj.type == 'message') {
                document.getElementById("message-subcomment-result-" + commentId).innerHTML = obj.htmlContent;
            } else {
                document.getElementById("comment-result").innerHTML = obj.htmlContent;
            }
            $('.visible-sub-comment form').empty();
        }
    })
});


//show comment box
$(document).on('click', '.comment-meta .btn-reply', function () {
    $('.comment-meta .btn-reply').prop('disabled', true);
    var commentId = $(this).attr('data-parent');
    if ($('#sub_comment_form_' + commentId).html().length > 0) {
        $('#sub_comment_form_' + commentId).empty();
        $('.comment-meta .btn-reply').prop('disabled', false);
    } else {
        $('.visible-sub-comment').empty();
        var limit = parseInt($("#post_comment_limit").val());
        var data = {
            'comment_id': commentId,
            'limit': limit
        };
        $.ajax({
            type: 'POST',
            url: VrConfig.baseURL + '/Ajax/loadSubcommentBox',
            data: setAjaxData(data),
            success: function (response) {
                var obj = JSON.parse(response);
                if (obj.result == 1) {
                    $('#sub_comment_form_' + commentId).append(obj.htmlContent);
                }
                $('.comment-meta .btn-reply').prop('disabled', false);
            }
        });
    }
});

//like comment
$(document).on('click', '.btn-comment-like', function () {
    if ($(this).hasClass('comment-liked')) {
        $(this).removeClass('comment-liked');
    } else {
        $(this).addClass('comment-liked');
    }
    var commentId = $(this).attr("data-comment-id");
    var data = {
        'comment_id': commentId
    };
    $.ajax({
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/likeCommentPost',
        data: setAjaxData(data),
        success: function (response) {
            var obj = JSON.parse(response);
            if (obj.result == 1) {
                document.getElementById("lbl_comment_like_count_" + commentId).innerHTML = obj.likeCount;
            }
        }
    });
});

//load more comments
function loadMoreComments(postId) {
    var limit = parseInt($("#post_comment_limit").val());
    var data = {
        'post_id': postId,
        'limit': limit
    };
    $.ajax({
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/loadMoreComments',
        data: setAjaxData(data),
        success: function (response) {
            var obj = JSON.parse(response);
            if (obj.result == 1) {
                setTimeout(function () {
                    $("#post_comment_limit").val(limit + 5);
                    document.getElementById("comment-result").innerHTML = obj.htmlContent
                }, 500);
            }
        }
    });
}

//add remove reading list
function addRemoveReadingListItem(postId) {
    $(".tooltip").hide();
    var data = {
        'post_id': postId,
    };
    $.ajax({
        type: 'POST',
        url: VrConfig.baseURL + '/Ajax/addRemoveReadingListItem',
        data: setAjaxData(data),
        success: function (response) {
            location.reload();
        }
    });
}

$(document).on('click', '.btn-load-more', function () {
    $('.btn-load-more svg').hide();
    $('.btn-load-more .spinner-load-more').show();
});

//delete comment
function deleteComment(commentId, postId, message) {
    Swal.fire({
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: VrConfig.textYes,
        cancelButtonText: VrConfig.textCancel,
    }).then((result) => {
        if (result.isConfirmed) {
            var limit = parseInt($("#post_comment_limit").val());
            var data = {
                'id': commentId,
                'post_id': postId,
                'limit': limit
            };
            $.ajax({
                type: 'POST',
                url: VrConfig.baseURL + '/Ajax/deleteCommentPost',
                data: setAjaxData(data),
                success: function (response) {
                    var obj = JSON.parse(response);
                    if (obj.result == 1) {
                        document.getElementById("comment-result").innerHTML = obj.htmlContent;
                    }
                }
            });
        }
    });
}

//close cookies warning
function closeCookiesWarning() {
    $('.cookies-warning').hide();
    $.ajax({
        type: 'POST',
        url: VrConfig.baseURL + '/close-cookies-warning-post',
        data: setAjaxData({}),
        success: function (response) {
        }
    });
}

//show image preview
function showImagePreview(input, showAsBackground) {
    var divId = $(input).attr('data-img-id');
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            if (showAsBackground) {
                $('#' + divId).css('background-image', 'url(' + e.target.result + ')');
            } else {
                $('#' + divId).attr('src', e.target.result);
            }
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$(document).on('click', '.table-of-contents .ul-main li a', function (event) {
    if (this.hash !== "") {
        event.preventDefault();
        var hash = this.hash;
        $('html, body').animate({
            scrollTop: $(hash).offset().top
        }, 500, function () {
            window.location.hash = hash;
        });
    }
});

//print
$("#print_post").on("click", function () {
    $(".post-content .post-title, .post-content .post-image, .post-content .post-text").printThis({importCSS: true,})
});

// NEW CODE BLOCK FOR TOC SCROLLSPY AND OFFCANVAS HANDLING
document.addEventListener('DOMContentLoaded', function () {
    const tocNavList = document.getElementById('tocNavList');
    const tocOffcanvasElement = document.getElementById('tocOffcanvas'); // From your provided HTML
    const bsTocOffcanvas = tocOffcanvasElement ? bootstrap.Offcanvas.getOrCreateInstance(tocOffcanvasElement) : null;

    // Submenu collapse/expand logic (from previous setup, ensure it's compatible)
    const mainTocLinksWithSubmenus = [];
    if (tocNavList) {
        tocNavList.querySelectorAll(':scope > li.nav-item').forEach(mainLiElement => {
            const mainLink = mainLiElement.querySelector('a.nav-link[data-bs-toggle="collapse"]');
            const subTocUl = mainLiElement.querySelector('ul.collapse');
            if (mainLink && subTocUl) {
                // Ensure collapse is initialized for ScrollSpy handling
                if (!bootstrap.Collapse.getInstance(subTocUl)) {
                    new bootstrap.Collapse(subTocUl, { toggle: false });
                }
                mainTocLinksWithSubmenus.push(mainLink);
            }
        });
    }

    // ScrollSpy activation listener for expanding parent submenus
    const mainScrollableContent = document.querySelector('.main-content-wrapper'); // Your main scrollable area
    if (mainScrollableContent) {
        mainScrollableContent.addEventListener('activate.bs.scrollspy', function (event) {
            const activeLink = event.relatedTarget; // The newly activated link by ScrollSpy

            if (!activeLink || !tocNavList || !tocNavList.contains(activeLink)) return;

            let currentParentMainLinkForActive = null;

            if (activeLink.matches('#tocNavList > .nav-item > a.nav-link[data-bs-toggle="collapse"]')) {
                currentParentMainLinkForActive = activeLink;
            } else {
                const parentCollapseUL = activeLink.closest('ul.collapse');
                if (parentCollapseUL) {
                    const mainLinkSelector = `a.nav-link[data-bs-target="#${parentCollapseUL.id}"]`;
                    currentParentMainLinkForActive = tocNavList.querySelector(mainLinkSelector);
                }
            }
            
            mainTocLinksWithSubmenus.forEach(mainLink => {
                const subMenuUl = document.getElementById(mainLink.getAttribute('data-bs-target').substring(1));
                if (subMenuUl) {
                    const collapseInstance = bootstrap.Collapse.getInstance(subMenuUl);
                    if (collapseInstance) {
                        if (mainLink === currentParentMainLinkForActive) {
                            if (!subMenuUl.classList.contains('show')) {
                                collapseInstance.show();
                            }
                        } else {
                            if (subMenuUl.classList.contains('show')) {
                                collapseInstance.hide();
                            }
                        }
                    }
                }
            });
        });
    }

    // NEW/MODIFIED: Handle TOC link clicks to scroll without updating URL hash
    if (tocNavList) {
        tocNavList.querySelectorAll('a.nav-link').forEach(function(link) {
            link.addEventListener('click', function(event) {
                const href = this.getAttribute('href');

                // Check if it's an internal anchor link for a section
                if (href && href.startsWith('#') && href.length > 1) {
                    const targetElement = document.querySelector(href);

                    if (targetElement) {
                        event.preventDefault(); // Stop default link behavior

                        // This function will perform the scroll. We'll call it at the right time.
                        const performScroll = () => {
                            targetElement.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        };

                        // Check if the offcanvas is currently open (mobile view)
                        if (bsTocOffcanvas && tocOffcanvasElement.classList.contains('show')) {
                            
                            // Listen for the 'hidden.bs.offcanvas' event, which fires AFTER the offcanvas is closed.
                            // The '{ once: true }' option automatically removes this event listener after it runs once.
                            tocOffcanvasElement.addEventListener('hidden.bs.offcanvas', performScroll, { once: true });
                            
                            // Now, start the process of closing the offcanvas.
                            bsTocOffcanvas.hide();

                        } else {
                            // If the offcanvas is not open (i.e., we are on desktop), scroll immediately.
                            performScroll();
                        }
                    }
                }
            });
        });
    }
});
// END OF NEW CODE BLOCK


//on ajax stop
$(document).ajaxStop(function () {
    function b(c) {
        $("#poll_" + c + " .question").hide();
        $("#poll_" + c + " .result").show()
    }

    function a(c) {
        $("#poll_" + c + " .result").hide();
        $("#poll_" + c + " .question").show()
    }
});

(function ($) {
    "use strict";

    /*===============================
    =         Wow Active            =
    ================================*/

    new WOW().init();

  

 /*=============================================
    =       Menu sticky & Scroll to top          =
    =============================================*/
    var windows = $(window);
    var screenSize = windows.width();
    var sticky = $('.header-sticky');
    var $html = $('html');
    var $body = $('body');

    windows.on('scroll', function () {
        var scroll = windows.scrollTop();
        var headerHeight = sticky.height();

        if (screenSize >= 320) {
            if (scroll < headerHeight) {
                sticky.removeClass('is-sticky');
            } else {
                sticky.addClass('is-sticky');
            }
        }

    });
    /*----------  Scroll to top  ----------*/
    function scrollToTop() {
        var $scrollUp = $('#scroll-top'),
            $lastScrollTop = 0,
            $window = $(window);

        $window.on('scroll', function () {
            var st = $(this).scrollTop();
            if (st > $lastScrollTop) {
                $scrollUp.removeClass('show');
            } else {
                if ($window.scrollTop() > 200) {
                    $scrollUp.addClass('show');
                } else {
                    $scrollUp.removeClass('show');
                }
            }
            $lastScrollTop = st;
        });

        $scrollUp.on('click', function (evt) {
            $('html, body').animate({scrollTop: 0}, 600);
            evt.preventDefault();
        });
    }
    scrollToTop();

    /*=========================================
    =            Preloader active            =
    ===========================================*/

    windows.on('load', function(){
        $(".preloader-activate").removeClass('preloader-active');
    });
    
    
    jQuery(window).on('load', function(){
        setTimeout(function(){
        jQuery('.open_tm_preloader').addClass('loaded');
        }, 500);
    });



    /*=========================================
    =            One page nav active          =
    ===========================================*/
    
    var top_offset = $('.navigation-menu--onepage').height() - 60;
    $('.navigation-menu--onepage ul').onePageNav({
        currentClass: 'active',
        scrollOffset: top_offset,
    });
    
    var top_offset_mobile = $('.header-area').height();
    $('.offcanvas-navigation--onepage ul').onePageNav({
        currentClass: 'active',
        scrollOffset: top_offset_mobile,
    });


    /*===========================================
    =            Submenu viewport position      =
    =============================================*/
    
    if ($(".has-children--multilevel-submenu").find('.submenu').length) {
        var elm = $(".has-children--multilevel-submenu").find('.submenu');
        
        elm.each(function(){
            var off = $(this).offset();
            var l = off.left;
            var w = $(this).width();
            var docH = windows.height();
            var docW = windows.width() - 10;
            var isEntirelyVisible = (l + w <= docW);

            if (!isEntirelyVisible) {
                $(this).addClass('left');
            }
        });
    }
    
       /*==========================================
    =            mobile menu active            =
    ============================================*/
    
    $("#mobile-menu-trigger").on('click', function(){
        $("#mobile-menu-overlay").addClass("active");
        $body.addClass('no-overflow');
    });
    
    $("#mobile-menu-close-trigger").on('click', function(){
        $("#mobile-menu-overlay").removeClass("active");
        $body.removeClass('no-overflow');
    });
    
    $(".offcanvas-navigation--onepage ul li a").on('click', function(){
        $("#mobile-menu-overlay").removeClass("active");
        $body.removeClass('no-overflow');
    });
    
    /*Close When Click Outside*/
    $body.on('click', function(e){
        var $target = e.target;
        if (!$($target).is('.mobile-menu-overlay__inner') && !$($target).parents().is('.mobile-menu-overlay__inner') && !$($target).is('#mobile-menu-trigger') && !$($target).is('#mobile-menu-trigger i')){
            $("#mobile-menu-overlay").removeClass("active");
            $body.removeClass('no-overflow');
        }
        if (!$($target).is('.search-overlay__inner') && !$($target).parents().is('.search-overlay__inner') && !$($target).is('#search-overlay-trigger') && !$($target).is('#search-overlay-trigger i')){
            $("#search-overlay").removeClass("active");
            $body.removeClass('no-overflow');
        }
    });
    
      /*===================================
    =           Menu Activeion          =
    ===================================*/
    var cururl = window.location.pathname;
    var curpage = cururl.substr(cururl.lastIndexOf('/') + 1);
    var hash = window.location.hash.substr(1);
    if((curpage == "/" || curpage == "de" || curpage == "") && hash=="")
        {
        //$("nav .navbar-nav > li:first-child").addClass("active");
        } else {
            $(".navigation-menu li").each(function()
        {
            $(this).removeClass("active");
        });
        if(hash != "")
            $(".navigation-menu li a[href*='"+hash+"']").parents("li").addClass("active");
        else
        $(".navigation-menu li a[href*='"+curpage+"']").parents("li").addClass("active");
    }
    
    //var l = window.location.pathname,
        //r = l.substr(l.lastIndexOf("/") + 1),
        //p = window.location.hash.substr(1);
    //("" != r && "/" != r && "de" != r || "" != p) && (e(".navigation-menu li").each((function() {
        //e(this).removeClass("active")
    //})), "" != p ? e(".navigation-menu li a[href*='" + p + "']").parents("li").addClass("active") : e(".navigation-menu li a[href*='" + r + "']").parents("li").addClass("active")), 

/*=========================================
    =             open menu Active            =
    ===========================================*/
     $('.openmenu-trigger').on('click', function (e) {
        e.preventDefault();
        $('.open-menuberger-wrapper').addClass('is-visiable');
    });

    $('.page-close').on('click', function (e) {
        e.preventDefault();
        $('.open-menuberger-wrapper').removeClass('is-visiable');
    });
    
      
    /*=========================================
    =             open menu Active            =
    ===========================================*/
    $("#open-off-sidebar-trigger").on('click', function(){
        $("#page-oppen-off-sidebar-overlay").addClass("active");
        $body.addClass('no-overflow');
    });
    
    $("#menu-close-trigger").on('click', function(){
        $("#page-oppen-off-sidebar-overlay").removeClass("active");
        $body.removeClass('no-overflow');
    });
    

     /*=============================================
    =            search overlay active            =
    =============================================*/
    
    $("#search-overlay-trigger").on('click', function(){
        $("#search-overlay").addClass("active");
        $body.addClass('no-overflow');
    });
    
    $("#search-close-trigger").on('click', function(){
        $("#search-overlay").removeClass("active");
        $body.removeClass('no-overflow');
    });
    

    /*=============================================
    =            hidden icon active            =
    =============================================*/
    
    $("#hidden-icon-trigger").on('click', function(){
        $("#hidden-icon-wrapper").toggleClass("active");
    });

    /*=============================================
    =            newsletter popup active            =
    =============================================*/
    
    $("#newsletter-popup-close-trigger").on('click', function(){
        $("#newsletter-popup").removeClass("active");
    });
    
    /*=========================================
    =             open menu Active            =
    ===========================================*/
    var nodeList = document.querySelectorAll('.share-icon');
    nodeList.forEach((el, i)=>{
        el.addEventListener("click", function(e){
            e.target.parentElement.parentElement.classList.toggle("opened")
            e.stopPropagation();
        })
    })

    /*=============================================
    =            offcanvas mobile menu            =
    =============================================*/
    var $offCanvasNav = $('.offcanvas-navigation'),
        $offCanvasNavSubMenu = $offCanvasNav.find('.sub-menu');
    
    /*Add Toggle Button With Off Canvas Sub Menu*/
    $offCanvasNavSubMenu.parent().prepend('<span class="menu-expand"><i></i></span>');
    
    /*Close Off Canvas Sub Menu*/
    $offCanvasNavSubMenu.slideUp();
    
    /*Category Sub Menu Toggle*/
    $offCanvasNav.on('click', 'li a, li .menu-expand', function(e) {
        var $this = $(this);
        if ( ($this.parent().attr('class').match(/\b(menu-item-has-children|has-children|has-sub-menu)\b/)) && ($this.attr('href') === '#' || $this.hasClass('menu-expand')) ) {
            e.preventDefault();
            if ($this.siblings('ul:visible').length){
                $this.parent('li').removeClass('active');
                $this.siblings('ul').slideUp();
            } else {
                $this.parent('li').addClass('active');
                $this.closest('li').siblings('li').removeClass('active').find('li').removeClass('active');
                $this.closest('li').siblings('li').find('ul:visible').slideUp();
                $this.siblings('ul').slideDown();
            }
        }
    });

    /*=======================================
    =       Portfolio Masonry Activation    =
    =========================================*/

        $('.projects-masonary-wrapper').imagesLoaded(function () {

            // filter items on button click
            $('.messonry-button').on('click', 'button', function () {
                var filterValue = $(this).attr('data-filter');
                $(this).siblings('.is-checked').removeClass('is-checked');
                $(this).addClass('is-checked');
                $grid.isotope({
                    filter: filterValue
                });
            });

            // init Isotope
            var $grid = $('.mesonry-list').isotope({
                percentPosition: true,
                transitionDuration: '0.7s',
                layoutMode: 'masonry',/*
                masonry: {
                    columnWidth: '.resizer',
                }*/
            });
        });

        /*==================================
    =         Mesonry Activation       =
    ===================================*/

    $('.masonry-activation').imagesLoaded(function () {
        // init Isotope
        var $grid = $('.masonry-wrap').isotope({
            itemSelector: '.masonary-item',
            percentPosition: true,
            transitionDuration: '0.7s',
            masonry: {
                // use outer width of grid-sizer for columnWidth
                columnWidth: 2,
                percentPosition: true
            }
        });

    });
    
    /*=============================================
    =            background image            =
    =============================================*/

    var bgSelector = $(".bg-img");
    bgSelector.each(function (index, elem) {
        var element = $(elem),
            bgSource = element.data('bg');
        element.css('background-image', 'url(' + bgSource + ')');
    });


    /*=============================================
    =            wavify activation            =
    =============================================*/

    if($('#feel-the-wave , .feel-the-wave').length) {
        $('#feel-the-wave , .feel-the-wave').wavify({
            height: 80,
            bones: 5,
            amplitude: 100,
            color: 'rgba(224,238,255,0.5)',
            //color: 'url(#gradient1)',
            speed: .15
        });
    }

    if($('#feel-the-wave-two , .feel-the-wave-two').length) {
        $('#feel-the-wave-two , .feel-the-wave-two').wavify({
            height: 120,
            bones: 4,
            amplitude: 60,
            color: 'rgba(224,238,255,0.4)',
            //color: 'url(#gradient2)',
            speed: .25
        });
    }

    /*=====  End of wavify activation  ======*/


    $(document).ready(function(){

    /*=============================================
    =            swiper slider activation            =
    =============================================*/
    var carouselSlider = new Swiper('.hero-slider__container', {
        slidesPerView : 1,
        slidesPerGroup: 1,
        loop: true,
        speed: 150,
        effect: 'fade',
        spaceBetween : 0,
        autoplay: {
            delay: 4000,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-t01',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 1
            },

            991:{
                slidesPerView : 1
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });
    $(".hero-slider__container").hover(function() {
        (this).swiper.autoplay.stop();
    }, function() {
        (this).swiper.autoplay.start();
    });


 
    var brandLogoSlider = new Swiper('.brand-logo-slider__container', {
        slidesPerView : 6,
        loop: true,
        speed: 1000,
        spaceBetween : 30,
        autoplay: {
            delay: 3000,
        },

        breakpoints: {
            1499:{
                slidesPerView : 6
            },

            991:{
                slidesPerView : 4
            },

            767:{
                slidesPerView : 3

            },

            575:{
                slidesPerView : 2
            }
        }
    });
    
    var carouselSlider = new Swiper('.top-info-slider__container', {
        slidesPerView : 3,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        autoplay: true,
        spaceBetween : 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-1',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },
            1200:{
                slidesPerView : 2
            },

            991:{
                slidesPerView : 1
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });
        
    var carouselSlider = new Swiper('.single-flexible__container', {
        slidesPerView : 1,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-1',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },
            1200:{
                slidesPerView : 2
            },

            991:{
                slidesPerView : 1
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });

        
    var carouselSlider = new Swiper('.service-slider__container', {
        slidesPerView : 4,
        slidesPerGroup: 4,
        loop: true,
        speed: 1000,
        autoplay: true,
        spaceBetween : 0,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-service',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3,
                slidesPerGroup: 3
            },
            1200:{
                slidesPerView : 3,
                slidesPerGroup: 3
            },

            991:{
                slidesPerView : 2,
                slidesPerGroup: 2
            },

            767:{
                slidesPerView : 1,
                slidesPerGroup: 1

            },

            575:{
                slidesPerView : 1,
                slidesPerGroup: 1
            }
        }
    });
  
    var carouselSlider = new Swiper('.service-slider__project-active', {
        slidesPerView : 1,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        autoplay: false,
        spaceBetween : 0,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-service',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 1
            },
            1200:{
                slidesPerView : 1
            },

            991:{
                slidesPerView : 1
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });

    
    var carouselSlider = new Swiper('.three-flexible__container', {
        slidesPerView : 3,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        autoplay: true,
        spaceBetween : 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-3',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },

            991:{
                slidesPerView : 2
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });


    var carouselSlider = new Swiper('.auto--center-flexible__container', {
        slidesPerView: 'auto',
        centeredSlides: true,
        freeMode: false,    
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-auto',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },

            991:{
                slidesPerView : 2
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });

    var carouselSlider = new Swiper('.auto--per-flexible__container', {
        slidesPerView: 'auto',
        centeredSlides: false,
        freeMode: true,    
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-5',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },

            991:{
                slidesPerView : 2
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });

    var mySwiper = new Swiper('.auto--pree-mode-flexible__container', {
        spaceBetween : 30,
        loop: true,
        freeMode: true,
        slidesPerView: 'auto',
        pagination: {
            el: '.swiper-pagination-6',
            type: 'bullets',
            clickable: true
        },
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        speed: 7000
    });
        
    var carouselSlider = new Swiper('.carousel-slider__container', {
        slidesPerView : 3,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-9',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },

            991:{
                slidesPerView : 2
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });
        
    var carouselSlider = new Swiper('.projects-slider__container', {
        slidesPerView : 3,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 0,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-project',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },

            1200:{
                slidesPerView : 2
            },
            
            991:{
                slidesPerView : 2
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });    
    
    var carouselSlider = new Swiper('.projects-slider__three', {
        slidesPerView : 3,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 40,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-project',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 3
            },

            1200:{
                slidesPerView : 2
            },
            
            991:{
                slidesPerView : 2
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    }); 
        
    var carouselSlider = new Swiper('.testimonial-slider__container', {
        slidesPerView : 2,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 30,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-t01',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 2
            },

            991:{
                slidesPerView : 1
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });
        
    var carouselSlider = new Swiper('.testimonial-slider__container-two', {
        slidesPerView : 3,
        slidesPerGroup: 1,
        centeredSlides: true,
        loop: true,
        speed: 1000,
        spaceBetween : 50,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-t0',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 2
            },

            991:{
                slidesPerView : 1
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });
        
    var carouselSlider = new Swiper('.testimonial-slider-machine', {
        slidesPerView : 1,
        slidesPerGroup: 1,
        loop: true,
        speed: 1000,
        spaceBetween : 0,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination-machine',
            type: 'bullets',
            clickable: true
        },
        breakpoints: {
            1499:{
                slidesPerView : 1
            },

            1200:{
                slidesPerView : 1 
            },
            
            991:{
                slidesPerView : 1
            },

            767:{
                slidesPerView : 1

            },

            575:{
                slidesPerView : 1
            }
        }
    });    
    
    /*=====  End of swiper slider activation  ======*/
    });
    
    
    /* =====================================
        Fullpage Scroll Animation   
    ======================================*/
    if ($('#fullpage').length) {
        $('#fullpage').fullpage({
            scrollBar: false,
            navigation: true,
            loopBottom: false,
            sectionSelector: 'section',
            scrollingSpeed: 1000,
            autoScrolling: true,
            fitToSection: true,
            fitToSectionDelay: 1000,
            afterLoad: function () {
                var activeSetion = $('.fp-viewing-' + 3);
                activeSetion.addClass('tm-one-page-footer-expanded');
            },
        });
    }

    /*=============================================
    =            circle progress active            =
    =============================================*/
    $('.chart-progress , .chart-progress__box').appear(function () {
        $('.chart-progress, .chart-progress__box').circleProgress({
            startAngle: -Math.PI / 4 * 2,
        });

    });

   
    /* ==================================
    =          Option Demo              =
    =====================================*/
    var $demoOption = $('.demo-option-container')


    $('.quick-option').on('click', function (e) {
        e.preventDefault(),
        function () {
            $demoOption.toggleClass('open')
        }()
    });


    /*=============================================
    =            counter up active            =
    =============================================*/
    
    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });

    /*===================================
        Svg Icon Draw
    ====================================*/ 
    var $svgIconBox = $('.single-svg-icon-box');
    $svgIconBox.each(function() {
        var $this = $(this),
            $svgIcon = $this.find('.svg-icon'),
            $id = $svgIcon.attr('id'),
            $icon = $svgIcon.data('svg-icon');
        var $vivus = new Vivus($id, { duration: 100, file: $icon });
        $this.on('mouseenter', function () {
            $vivus.reset().play();
        });
    });
    

    /*=================================- 
    =        Scroll Up Color Change    =
    ==================================-*/

    $('.slide-scroll-bg').height('.slide-scroll-bg').scrollie({
        scrollOffset: 0,
        scrollingInView: function (elem) {
            console.log(elem);
            var bgColor = elem.data('background');
            $('.bg-body-color').css('background-color', bgColor);

        }
    });

    /*=============================================
    =            light gallery active            =
    =============================================*/
    
    $('.popup-images').lightGallery(); 

    $('.video-popup').lightGallery(); 


    
    /*=============================================
        showcoupon toggle function
   =============================================*/
    $( '#showcoupon' ).on('click', function() {
        $('#checkout-coupon' ).slideToggle(500);
    });
    $("#chekout-box-2").on("change",function(){
        $(".ship-box-info").slideToggle("100");
    }); 
    

    /*=============================================
    =            reveal footer active            =
    =============================================*/
    
    var revealId = $(".reveal-footer"),
        $mainWrapper = revealId.closest("#main-wrapper"),
        $window = $(window);
    function footerFixed(){
        var heightFooter = revealId.outerHeight(),
            windowWidth = $window.width();
        if (windowWidth > 991) {
            $mainWrapper.css({
                'padding-bottom': heightFooter + 'px'
            });
        } else if(windowWidth <= 991) {
            $mainWrapper.css({
                'padding-bottom': '0px'
            });
        }
    }
    footerFixed();
    $(window).on('resize', function(){
        footerFixed();
    });


    /* particles JS */
    if($('#particles-js').length){
        particlesJS('particles-js',{"particles": {"number": {"value": 80,"density": {"enable": true,"value_area": 1000}},"color": {"value": "#ffffff"},"shape": {"type": "circle","stroke": {"width": 0,"color": "#000000"},"polygon": {"nb_sides": 5},"image": {"src": "img/github.svg","width": 100,"height": 100}},"opacity": {"value": 0.5,"random": false,"anim": {"enable": false,"speed": 1,"opacity_min": 0.1,"sync": false}},"size": {"value": 5,"random": true,"anim": {"enable": false,"speed": 40,"size_min": 0.1,"sync": false}},"line_linked": {"enable": true,"distance": 150,"color": "#ffffff","opacity": 0.4,"width": 1},"move": {"enable": true,"speed": 6,"direction": "none","random": false,"straight": false,"out_mode": "out","attract": {"enable": false,"rotateX": 600,"rotateY": 1200}}},"interactivity": {"detect_on": "canvas","events": {"onhover": {"enable": true,"mode": "grab"},"onclick": {"enable": true,"mode": "repulse"},"resize": true},"modes": {"grab": {"distance": 400,"line_linked": {"opacity": 1}},"bubble": {"distance": 400,"size": 40,"duration": 2,"opacity": 8,"speed": 3},"repulse": {"distance": 200},"push": {"particles_nb": 4},"remove": {"particles_nb": 2}}},"retina_detect": true,"config_demo": {"hide_card": false,"background_color": "#b61924","background_image": "","background_position": "50% 50%","background_repeat": "no-repeat","background_size": "cover"}});
    }
    /* nasa JS */
    if($('#nasa-js').length){
        particlesJS("nasa-js", {"particles": {"number": {"value": 120,"density": {"enable": true,"value_area": 800}},"color": {"value": "#008000"},"shape": {"type": "circle","stroke": {"width": 0,"color": "#000000"},"polygon": {"nb_sides": 5},"image": {"src": "img/github.svg","width": 100,"height": 100}},"opacity": {"value": 1,"random": true,"anim": {"enable": true,"speed": 1,"opacity_min": 0,"sync": false}},"size": {"value": 3,"random": true,"anim": {"enable": false,"speed": 4,"size_min": 0.3,"sync": false}},"line_linked": {"enable": false,"distance": 150,"color": "#ffffff","opacity": 0.4,"width": 1},"move": {"enable": true,"speed": 1,"direction": "right","random": true,"straight": false,"out_mode": "out","bounce": false,"attract": {"enable": false,"rotateX": 600,"rotateY": 600}}},"interactivity": {"detect_on": "canvas","events": {"onhover": {"enable": false,"mode": "repulse"},"onclick": {"enable": true,"mode": "remove"},"resize": true},"modes": {"grab": {"distance": 400,"line_linked": {"opacity": 1}},"bubble": {"distance": 250,"size": 0,"duration": 2,"opacity": 0,"speed": 3},"repulse": {"distance": 400,"duration": 0.4},"push": {"particles_nb": 4},"remove": {"particles_nb": 2}}},"retina_detect": true});
    }

})(jQuery);

(() => {
    if (window.__apriDesktopScrollBound) {
        return;
    }
    window.__apriDesktopScrollBound = 1;
    const getStep = (row) => {
        const items = row ? row.querySelectorAll(':scope>.col,:scope>[class*=col-]') : null;
        if (!items || !items.length) {
            return 320;
        }
        if (items[1]) {
            const gap = Math.abs(items[1].offsetLeft - items[0].offsetLeft);
            if (gap) {
                return gap;
            }
        }
        return Math.max(Math.round(items[0].getBoundingClientRect().width), 260);
    };
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.apri-title-scroll-btn');
        if (!btn || window.innerWidth < 992) {
            return;
        }
        e.preventDefault();
        const scope = btn.closest('section,.section,.section-category,.container-xl');
        const pane = scope ? scope.querySelector('.tab-pane.show.active,.tab-pane.active') : null;
        const target = btn.getAttribute('data-scroll-target');
        const row = (target ? document.querySelector(target) : null) || (pane ? pane.querySelector('.apri-home-desktop-scroll') : null) || (scope ? scope.querySelector('.apri-home-desktop-scroll') : null);
        if (!row) {
            return;
        }
        row.scrollBy({left: ((btn.getAttribute('data-scroll-dir') || 'next').toLowerCase() === 'prev' ? -1 : 1) * getStep(row), behavior: 'smooth'});
    }, {passive: false});
})();

function initAutoExternalLinks(isEnabled) {
    if (!isEnabled) {
        return;
    }
    function getRootDomain(host) {
        if (!host) {
            return '';
        }
        var parts = host.split('.');
        if (parts.length < 2) {
            return host;
        }
        return parts.slice(-2).join('.');
    }
    function isInternalHost(host) {
        if (!host) {
            return true;
        }
        var currentHost = (window.location.hostname || '').toLowerCase();
        var currentRoot = getRootDomain(currentHost);
        host = host.toLowerCase();
        return host === currentHost || host.endsWith('.' + currentHost) || host === currentRoot || host.endsWith('.' + currentRoot);
    }
    function ensureRel(el) {
        var rel = (el.getAttribute('rel') || '').trim();
        var relItems = rel ? rel.split(/\s+/) : [];
        if (relItems.indexOf('noopener') === -1) relItems.push('noopener');
        if (relItems.indexOf('noreferrer') === -1) relItems.push('noreferrer');
        el.setAttribute('rel', relItems.join(' ').trim());
    }
    function patchLinks(root) {
        var links = (root || document).querySelectorAll('a[href]');
        links.forEach(function (el) {
            if (el.hasAttribute('target')) return;
            var href = (el.getAttribute('href') || '').trim();
            if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
            var url;
            try {
                url = new URL(href, window.location.href);
            } catch (e) {
                return;
            }
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
            if (!isInternalHost(url.hostname)) {
                el.setAttribute('target', '_blank');
                ensureRel(el);
            }
        });
    }
    patchLinks(document);
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (!node || node.nodeType !== 1) return;
                if (node.matches && node.matches('a[href]')) {
                    patchLinks(node.parentNode || document);
                } else if (node.querySelectorAll) {
                    patchLinks(node);
                }
            });
        });
    });
    observer.observe(document.body, {childList: true, subtree: true});
}

function initCategoryTabs(config) {
    var options = config || {};
    var section = options.section || document.querySelector('[data-apri-category-tabs="1"]');
    if (!section || section.getAttribute('data-apri-category-tabs-init') === '1') {
        return;
    }
    section.setAttribute('data-apri-category-tabs-init', '1');

    var noRecordsText = options.noRecordsText || section.getAttribute('data-no-records-text') || 'No records found.';
    var errorText = options.errorText || section.getAttribute('data-error-text') || 'Error';
    var eventsContent = section.querySelector('#category-events-content');
    var isEventsLoading = false;

    function appendHashToPaginationLinks(scope) {
        if (!scope) {
            return;
        }
        scope.querySelectorAll('.pagination a').forEach(function (link) {
            var pane = link.closest('.tab-pane');
            if (!pane || !pane.id) {
                return;
            }
            link.href = link.href.split('#')[0] + '#' + pane.id;
        });
    }

    function normalizePage(value) {
        var page = parseInt(value || '1', 10);
        return Number.isFinite(page) && page > 0 ? page : 1;
    }

    function getPastEventsPage() {
        return normalizePage(new URLSearchParams(window.location.search).get('page_category_events_past'));
    }

    function renderFallbackMessage(messageText) {
        if (!eventsContent) {
            return;
        }
        eventsContent.innerHTML = '<div class="container-xl"><div class="section-space--mt_40 py-5"><div class="ht-message-box style-warning align-items-center d-flex" role="alert"><span class="icon"><i class="fas fa-info-circle"></i></span> ' + messageText + '</div></div></div>';
    }

    function loadEventsTab(force, pagePast) {
        if (!eventsContent || typeof $ === 'undefined' || typeof setAjaxData !== 'function') {
            return;
        }
        if (!force && eventsContent.getAttribute('data-loaded') === '1') {
            return;
        }
        if (isEventsLoading) {
            return;
        }
        isEventsLoading = true;
        $.ajax({
            type: 'POST',
            url: VrConfig.baseURL + '/Ajax/loadCategoryEventsTab',
            data: setAjaxData({
                categorySlug: eventsContent.getAttribute('data-category-slug'),
                pagePast: normalizePage(pagePast || getPastEventsPage())
            }),
            success: function (response) {
                var data = response;
                if (typeof response === 'string') {
                    try {
                        data = JSON.parse(response);
                    } catch (e) {
                        data = {result: 0};
                    }
                }
                if (data && Number(data.result) === 1 && data.htmlContent) {
                    eventsContent.innerHTML = data.htmlContent;
                    eventsContent.setAttribute('data-loaded', '1');
                    appendHashToPaginationLinks(eventsContent);
                } else {
                    renderFallbackMessage(noRecordsText);
                }
            },
            error: function () {
                renderFallbackMessage(errorText);
            },
            complete: function () {
                isEventsLoading = false;
            }
        });
    }

    if (eventsContent) {
        eventsContent.addEventListener('click', function (event) {
            var target = event.target.closest('.pagination a');
            if (!target) {
                return;
            }
            event.preventDefault();
            var targetUrl = new URL(target.href, window.location.origin);
            var pagePast = normalizePage(targetUrl.searchParams.get('page_category_events_past'));
            var params = new URLSearchParams(window.location.search);
            params.set('page_category_events_past', pagePast);
            if (history.replaceState) {
                history.replaceState(null, '', window.location.pathname + '?' + params.toString() + '#nav-events');
            }
            loadEventsTab(true, pagePast);
        });
    }

    appendHashToPaginationLinks(section);

    if (!window.bootstrap) {
        return;
    }

    var hash = window.location.hash;
    if (!hash) {
        var params = new URLSearchParams(window.location.search);
        if (params.has('page_category_events_past')) {
            hash = '#nav-events';
        } else if (params.has('page')) {
            hash = '#nav-home';
        }
    }

    var tabBtn = hash ? section.querySelector('#nav-tab [data-bs-target="' + hash + '"]') : null;
    if (tabBtn) {
        window.bootstrap.Tab.getOrCreateInstance(tabBtn).show();
    }

    section.querySelectorAll('#nav-tab [data-bs-toggle="tab"]').forEach(function (tabToggle) {
        tabToggle.addEventListener('shown.bs.tab', function (event) {
            var target = event.target.getAttribute('data-bs-target');
            if (history.replaceState && target) {
                history.replaceState(null, '', window.location.pathname + window.location.search + target);
            }
            if (target === '#nav-events') {
                loadEventsTab(false);
            }
        });
    });

    if (hash === '#nav-events') {
        loadEventsTab(true);
    }
}

function initCookieConsent(config) {
    if (window.__apriCookieConsentInitDone) {
        return;
    }
    window.__apriCookieConsentInitDone = true;

    var options = config || {};
    var consentEnabled = !!options.enabled;
    var storageKey = options.storageKey || 'apri_cookie_consent_v1';
    var payloadElementId = options.payloadElementId || 'apriConsentPayload';
    var cookieWarnName = options.cookieWarnName || 'cks_warning';

    var payloadNode = document.getElementById(payloadElementId);
    var payload = {};
    if (payloadNode) {
        try {
            payload = JSON.parse(payloadNode.textContent || '{}');
        } catch (e) {
            payload = {};
        }
    }

    var serverCookieClosed = false;
    var injected = {analytics: false, marketing: false};

    function closeServerCookieBanner() {
        if (!cookieWarnName || serverCookieClosed || document.cookie.indexOf(cookieWarnName + '=1') > -1) {
            return;
        }
        serverCookieClosed = true;
        document.cookie = cookieWarnName + '=1;path=/;max-age=2592000;SameSite=Lax';
    }

    function injectHtml(html) {
        if (!html || !html.trim()) {
            return;
        }
        var frag = document.createRange().createContextualFragment(html);
        var scripts = frag.querySelectorAll('script');
        scripts.forEach(function (oldScript) {
            var script = document.createElement('script');
            Array.prototype.slice.call(oldScript.attributes).forEach(function (attr) {
                script.setAttribute(attr.name, attr.value);
            });
            script.text = oldScript.textContent || '';
            oldScript.parentNode.replaceChild(script, oldScript);
        });
        document.body.appendChild(frag);
    }

    function getConsent() {
        try {
            var raw = localStorage.getItem(storageKey);
            if (!raw) {
                return null;
            }
            var state = JSON.parse(raw);
            return (state && state.v === 1) ? state : null;
        } catch (e) {
            return null;
        }
    }

    function setConsent(state) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (e) {
        }
    }

    function hasConsent(group) {
        if (!consentEnabled) {
            return true;
        }
        var state = getConsent();
        if (!state) {
            return false;
        }
        return !!state[group];
    }

    window.apriHasConsent = hasConsent;

    function applyConsentScripts() {
        if (hasConsent('analytics') && !injected.analytics) {
            injected.analytics = true;
            injectHtml(payload.analytics || '');
        }
        if (hasConsent('marketing') && !injected.marketing) {
            injected.marketing = true;
            injectHtml(payload.marketing || '');
        }
    }

    function hideBanner() {
        var banner = document.getElementById('apriCookieBanner');
        if (banner) {
            banner.classList.add('d-none');
        }
    }

    function showBanner() {
        var banner = document.getElementById('apriCookieBanner');
        if (banner) {
            banner.classList.remove('d-none');
        }
    }

    function saveSelection(analytics, marketing) {
        setConsent({v: 1, analytics: !!analytics, marketing: !!marketing, ts: Date.now()});
        closeServerCookieBanner();
        hideBanner();
        applyConsentScripts();
    }

    function bindBanner() {
        var banner = document.getElementById('apriCookieBanner');
        if (!banner || banner.getAttribute('data-cookie-bound') === '1') {
            return;
        }
        banner.setAttribute('data-cookie-bound', '1');
        var prefs = document.getElementById('apriCookiePrefs');
        var analytics = document.getElementById('apriCookieAnalytics');
        var marketing = document.getElementById('apriCookieMarketing');
        var manageBtn = document.getElementById('apriCookieManage');
        var saveBtn = document.getElementById('apriCookieSave');
        var acceptBtn = document.getElementById('apriCookieAccept');
        var rejectBtn = document.getElementById('apriCookieReject');
        if (!prefs || !analytics || !marketing || !manageBtn || !saveBtn || !acceptBtn || !rejectBtn) {
            return;
        }
        manageBtn.addEventListener('click', function () {
            prefs.classList.toggle('d-none');
            saveBtn.classList.toggle('d-none');
        });
        saveBtn.addEventListener('click', function () {
            saveSelection(analytics.checked, marketing.checked);
        });
        acceptBtn.addEventListener('click', function () {
            analytics.checked = true;
            marketing.checked = true;
            saveSelection(true, true);
        });
        rejectBtn.addEventListener('click', function () {
            analytics.checked = false;
            marketing.checked = false;
            saveSelection(false, false);
        });
    }

    var existing = getConsent();
    if (existing) {
        closeServerCookieBanner();
        applyConsentScripts();
        hideBanner();
    } else if (consentEnabled) {
        showBanner();
    } else {
        applyConsentScripts();
    }
    bindBanner();
}

document.addEventListener('DOMContentLoaded', function () {
    initCategoryTabs();
});

/* BEGIN Editorial Scripts (merged from editorial.js) */
document.addEventListener('DOMContentLoaded', function () {
        const tocNav = document.getElementById('tocPdfNav');
        const tocCard = document.getElementById('tocPdfCard');
        const tocRail = document.querySelector('.toc-pdf-rail');
        const tocToggle = document.getElementById('tocPdfToggle');
        const tocContent = document.getElementById('tocPdfContent');
        const postDetailsPage = document.getElementById('postDetailsPage');
        const copyToClipboard = (value) => {
            if (!value) {
                return Promise.resolve(false);
            }
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(value).then(() => true).catch(() => false);
            }
            const textArea = document.createElement('textarea');
            textArea.value = value;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            let ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (e) {
                ok = false;
            }
            document.body.removeChild(textArea);
            return Promise.resolve(ok);
        };
        const heroShareBtn = document.getElementById('tocHeroShare');
        const heroCopyBtn = document.getElementById('tocHeroCopy');
        const heroPrintBtn = document.getElementById('tocHeroPrint');
        const heroDoiBtn = document.getElementById('tocHeroDoi');
        const heroUrl = (heroShareBtn && heroShareBtn.dataset.url) || (heroCopyBtn && heroCopyBtn.dataset.url) || window.location.href;
        const showCopyFeedback = (btn, ok, fallbackLabel) => {
            if (!btn) {
                return;
            }
            const base = btn.dataset.tooltipBase || btn.dataset.tooltip || fallbackLabel || '';
            btn.dataset.tooltip = ok ? 'Copied' : 'Copy failed';
            btn.classList.add(ok ? 'is-copied' : 'is-copy-failed');
            window.setTimeout(() => {
                btn.dataset.tooltip = base;
                btn.classList.remove('is-copied', 'is-copy-failed');
            }, 1400);
        };
        const markPillarCardsBand = (root) => {
            if (!root || !root.querySelectorAll) {
                return [];
            }
            const tagged = new Set();
            // Manual hook: add this class/id/attr to any content block you want widened.
            const manualTargets = root.querySelectorAll('.toc-stretch, #tocStretch, [data-toc-stretch]');
            manualTargets.forEach((target) => {
                target.classList.add('toc-pillar-band');
                tagged.add(target);
            });

            // Fallback auto-detection for the known 8-pillar cards pattern.
            const candidates = Array.from(root.querySelectorAll('.container.my-5'));
            candidates.forEach((container) => {
                const cards = container.querySelectorAll('.card');
                const modalBtns = container.querySelectorAll('[data-bs-toggle="modal"][data-bs-target$="Modal"]');
                const pillarTitles = Array.from(container.querySelectorAll('.card-title')).filter((title) => /pillar\s+\d+/i.test((title.textContent || '').trim()));
                if (cards.length >= 6 && modalBtns.length >= 6 && pillarTitles.length >= 6) {
                    container.classList.add('toc-pillar-band');
                    tagged.add(container);
                }
            });
            return Array.from(tagged);
        };
        const stretchBands = markPillarCardsBand(tocContent);
        const hoistTocContentModals = (root) => {
            if (!root || !root.querySelectorAll) {
                return;
            }
            const modals = Array.from(root.querySelectorAll('.modal[id]'));
            modals.forEach((modal) => {
                if (modal.dataset.tocHoisted === '1') {
                    return;
                }
                modal.dataset.tocHoisted = '1';
                document.body.appendChild(modal);
            });
        };
        hoistTocContentModals(tocContent);
        if (heroShareBtn) {
            heroShareBtn.addEventListener('click', async function () {
                if (navigator.share) {
                    try {
                        await navigator.share({ title: document.title, url: heroUrl });
                    } catch (e) {
                    }
                    return;
                }
                await copyToClipboard(heroUrl);
            });
        }
        if (heroCopyBtn) {
            heroCopyBtn.addEventListener('click', async function () {
                const ok = await copyToClipboard(heroUrl);
                showCopyFeedback(heroCopyBtn, ok, 'Copy link');
            });
        }
        if (heroPrintBtn) {
            heroPrintBtn.addEventListener('click', function () {
                window.print();
            });
        }
        if (heroDoiBtn) {
            heroDoiBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                const value = this.dataset.copy || this.getAttribute('href') || '';
                const ok = await copyToClipboard(value);
                showCopyFeedback(heroDoiBtn, ok, 'Copy DOI');
            });
        }
        const headingSelector = 'h1, h2, h3, h4, h5, h6';
        const isTocTopId = (id) => /^item-\d+$/.test(id);
        const isTocAnyId = (id) => /^item-\d+(?:-\d+)*$/.test(id);
        const topIdFrom = (id) => {
            const match = (id || '').match(/^item-(\d+)/);
            return match ? 'item-' + match[1] : null;
        };
        if (!tocNav || !tocCard || !tocToggle) {
            return;
        }

        const visibleStretchBands = new Set();
        const setTocSuspended = () => {
            if (!tocRail) {
                return;
            }
            if (window.innerWidth < 992) {
                tocRail.classList.remove('toc-suspend');
                return;
            }
            tocRail.classList.toggle('toc-suspend', visibleStretchBands.size > 0);
        };
        if (stretchBands.length) {
            const stretchObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0) {
                        visibleStretchBands.add(entry.target);
                    } else {
                        visibleStretchBands.delete(entry.target);
                    }
                });
                setTocSuspended();
            }, {
                threshold: [0, 0.08, 0.2],
                rootMargin: '-18% 0px -18% 0px'
            });
            stretchBands.forEach((band) => stretchObserver.observe(band));
        }

        const collectHeadings = (root) => {
            if (!root || !root.querySelectorAll) {
                return [];
            }
            return Array.from(root.querySelectorAll(`${headingSelector}[id^="item-"]`))
                .filter((heading) => isTocAnyId(heading.getAttribute('id') || ''));
        };

        // First scan the post content container, fallback to document for malformed editor HTML.
        let headings = collectHeadings(tocContent);
        if (!headings.length) {
            headings = collectHeadings(document);
        }

        const seen = new Set();
        const uniqueHeadings = headings.filter((heading) => {
            const id = heading.getAttribute('id') || '';
            if (!id || seen.has(id)) {
                return false;
            }
            seen.add(id);
            return true;
        });

        if (!uniqueHeadings.length) {
            tocCard.classList.add('toc-pdf-hidden');
            return;
        }

        const topMap = new Map();
        const topOrder = [];
        const getOrCreateTop = (topId) => {
            if (!topMap.has(topId)) {
                topMap.set(topId, { heading: null, subs: [] });
                topOrder.push(topId);
            }
            return topMap.get(topId);
        };

        uniqueHeadings.forEach((heading) => {
            const id = heading.getAttribute('id') || '';
            if (!isTocAnyId(id)) {
                return;
            }
            const topId = topIdFrom(id);
            if (!topId) {
                return;
            }
            const topMeta = getOrCreateTop(topId);
            if (isTocTopId(id)) {
                topMeta.heading = heading;
            } else {
                topMeta.subs.push(heading);
            }
        });

        const tocItems = topOrder
            .map((topId) => ({ topId, meta: topMap.get(topId) }))
            .filter((item) => item.meta && item.meta.heading);

        if (!tocItems.length) {
            tocCard.classList.add('toc-pdf-hidden');
            return;
        }

        const ul = document.createElement('ul');
        const getStickyHeaderBottom = () => {
            const selectors = 'header, .header, .main-header, .sticky-header, .header-sticky, .site-header, .header-area, .navbar, .top-bar';
            let maxBottom = 0;
            document.querySelectorAll(selectors).forEach((el) => {
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    return;
                }
                const isFixedLike = style.position === 'fixed' || style.position === 'sticky';
                const isAbsoluteTopBar = style.position === 'absolute';
                if (!isFixedLike && !isAbsoluteTopBar) {
                    return;
                }
                const rect = el.getBoundingClientRect();
                // Only count bars currently attached to the top viewport area.
                if (rect.height > 20 && rect.bottom > 0 && rect.top < 200) {
                    maxBottom = Math.max(maxBottom, rect.bottom);
                }
            });
            return Math.ceil(maxBottom);
        };
        const getStickyTopOffset = () => {
            const minOffset = window.innerWidth < 992 ? 105 : 185;
            return Math.max(minOffset, getStickyHeaderBottom() + 18);
        };
        const syncHeroMediaOffset = () => {
            if (!postDetailsPage || !postDetailsPage.classList.contains('toc-hero-page')) {
                return;
            }
            const safeGap = window.innerWidth < 992 ? 10 : 14;
            const headerBottom = getStickyHeaderBottom();
            // Use document-space top so the computed offset is stable while scrolling.
            const sectionTop = Math.ceil(postDetailsPage.getBoundingClientRect().top + window.scrollY);
            const overlap = Math.max(0, headerBottom - sectionTop);
            const offset = overlap > 0 ? overlap + safeGap : 0;
            postDetailsPage.style.setProperty('--editorial-header-offset', offset + 'px');
        };
        const scrollToTarget = (id) => {
            const target = document.getElementById(id);
            if (target) {
                const targetY = window.scrollY + target.getBoundingClientRect().top - getStickyTopOffset();
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
                // Some sticky headers animate in; run a few corrective passes.
                [220, 420, 680].forEach((delay) => {
                    window.setTimeout(() => {
                        const minTop = getStickyTopOffset();
                        const rect = target.getBoundingClientRect();
                        if (rect.top < minTop) {
                            window.scrollBy({ top: rect.top - minTop - 8, behavior: 'auto' });
                        }
                    }, delay);
                });
            }
            if (window.innerWidth < 992) {
                tocCard.classList.remove('is-expanded');
            }
        };
        const createLink = (id, text) => {
            const link = document.createElement('a');
            link.textContent = text;
            link.href = '#' + id;
            link.dataset.target = id;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToTarget(id);
            });
            return link;
        };

        tocItems.forEach((item) => {
            const topId = item.topId;
            const topHeading = item.meta.heading;
            const topLi = document.createElement('li');
            topLi.dataset.topId = topId;
            topLi.appendChild(createLink(topId, topHeading.textContent.trim()));

            if (item.meta.subs.length) {
                const subUl = document.createElement('ul');
                item.meta.subs.forEach((subHeading) => {
                    const subId = subHeading.getAttribute('id') || '';
                    if (!subId) {
                        return;
                    }
                    const subLi = document.createElement('li');
                    subLi.appendChild(createLink(subId, subHeading.textContent.trim()));
                    subUl.appendChild(subLi);
                });
                if (subUl.childElementCount > 0) {
                    topLi.appendChild(subUl);
                }
            }
            ul.appendChild(topLi);
        });
        tocNav.innerHTML = '';
        tocNav.appendChild(ul);

        const tocLinks = Array.from(tocNav.querySelectorAll('a'));
        const topItems = Array.from(tocNav.querySelectorAll('li[data-top-id]'));
        const firstTopHeading = tocItems[0].meta.heading || null;
        const setActiveById = (id) => {
            if (!id) {
                return;
            }
            const topId = topIdFrom(id);
            if (!topId) {
                return;
            }
            topItems.forEach((li) => {
                li.classList.toggle('active-section', li.dataset.topId === topId);
            });
            tocLinks.forEach((link) => link.classList.remove('active'));
            const targetLink = tocNav.querySelector('a[data-target="' + id + '"]')
                || tocNav.querySelector('li[data-top-id="' + topId + '"] > a[data-target="' + topId + '"]');
            if (targetLink) {
                targetLink.classList.add('active');
            }
        };

        setActiveById(tocItems[0].topId);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveById(entry.target.id);
                }
            });
        }, { rootMargin: '-10% 0px -70% 0px' });

        uniqueHeadings.forEach(h => observer.observe(h));

        const hasPassedFirstHeadingMidpoint = () => {
            if (!firstTopHeading) {
                return false;
            }
            const rect = firstTopHeading.getBoundingClientRect();
            const firstMidpointY = window.scrollY + rect.top + (rect.height / 2);
            return window.scrollY >= firstMidpointY;
        };

        const syncDesktopExpandState = () => {
            if (window.innerWidth < 992) {
                tocCard.classList.remove('is-expanded');
                return;
            }
            tocCard.classList.toggle('is-expanded', hasPassedFirstHeadingMidpoint());
        };

        const syncDesktopStickyTop = () => {
            if (window.innerWidth < 992) {
                tocCard.style.removeProperty('top');
                return;
            }
            const stickyTop = Math.max(110, getStickyHeaderBottom() + 12);
            tocCard.style.top = stickyTop + 'px';
        };

        const handleViewportSync = () => {
            syncDesktopStickyTop();
            syncDesktopExpandState();
            syncHeroMediaOffset();
            setTocSuspended();
        };

        handleViewportSync();
        [120, 360, 700].forEach((delay) => {
            window.setTimeout(handleViewportSync, delay);
        });
        window.addEventListener('scroll', handleViewportSync, { passive: true });
        window.addEventListener('resize', handleViewportSync);

        tocToggle.addEventListener('click', () => {
            if (window.innerWidth >= 992 && !hasPassedFirstHeadingMidpoint()) {
                tocCard.classList.remove('is-expanded');
                return;
            }
            tocCard.classList.toggle('is-expanded');
        });
    });
/* END Editorial Scripts */
