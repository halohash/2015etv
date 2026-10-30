function errorshow() {
document.body.innerHTML = `<h1>Error while loading this instance.</h1><div>Contact the owner of this instance if this persists.</div>`;
document.body.style.color = "black";
document.body.style.backgroundColor = "white";
document.body.style.background = "white";
document.body.style.fontFamily = "sans-serif";
}
    window.labels = {
        'default': ''
    };
    (function() {
        var a = window.labels;
        window.jstiming && window.jstiming.load && window.jstiming.load.tick("ld_s");
        var b = window.devjs
          , d = /[?&]debugjs=1/.exec(window.location.href)
          , e = /[?&]localPlayer=1/.exec(window.location.href)
          , f = /[?&]mediaDiagnostics=1/.exec(window.location.href)
          , h = window.local_label
          , k = /[?&]reversePairingCode=/.exec(window.location.href)
          , l = /[?&]launch=preload/.exec(window.location.href)
          , m = /[?&]v=[\w\+\/\-_=]+/.exec(window.location.href)
          , n = "Steel" == window.environment.browser && !d && !b;
        window.label = h ? h : a && a["default"] ? a["default"] : "";
        var p = window.appRoot + window.label, q, r = !1;
        window.resetTimeout = function() {
            window.clearTimeout(q);
            r || (q = window.setTimeout(function() {
                window.location.replace("local:///web.archive.org/web/20150624063811/https://network_failure.html")
            }, 2E4))
        }
        ;
        n && (window.resetTimeout(),
        window.applicationLoaded = function() {
            r = !0;
            window.clearTimeout(q)
        }
        );
        function t(c) {
            document.write('<script src="' + c + '">\x3c/script>');
            n && u("resetTimeout();")
        }
        function u(c) {
            document.write("<script>" + c + "\x3c/script>")
        }
        function v(c) {
            var g = document.createElement("link");
            g.setAttribute("rel", "stylesheet");
            g.setAttribute("type", "text/css");
            g.setAttribute("href", c);
            document.head.appendChild(g)
        }
        window.initializeOrRedirect = function(c) {
            window.jstiming.load.tick("js_r");
            if (yt && yt.tv && yt.tv.initializer) {
                yt.tv.initializer(c);
                window.document.title = window.etvconfig.appname || "2015ETV";
            } else {
                console.error("Error Occured while loading, Contact the owner of this instance if this persists.");
                errorshow();
                window.document.title = window.etvconfig.appname || "2015ETV";
            }
        }
        ;
        e && (window.environment.player_url = d || b ? "/video/youtube/src/web/javascript/debug-tv-player-en_US.js" : "/video/youtube/src/web/javascript/tv-player-en_US.js");
        if (b) {
            window.CLOSURE_BASE_PATH = "/javascript/closure/";
            var w = window.environment
              , x = "Google" == w.brand && "Eureka" == w.model;
            window.loadStylesheets = function() {
                window.h5CssList.forEach(v)
            }
            ;
            t(p + "/lasagna-parse.js");
            t(CLOSURE_BASE_PATH + "base.js");
            t("/i18n/input/javascript/closure_deps.js");
            t("/video/youtube/src/web/javascript/deps-runfiles.js");
            t(p + "/deps.js");
            t(p + "/js/base_initializer.js");
            x ? t(p + "/js/chromecast_initializer.js") : t(p + "/js/initializer.js");
            t(p + "/css-list.js");
            u("loadStylesheets()")
        } else
            d ? (window.CLOSURE_NO_DEPS = !0,
            v("app-prod.css"),
            t(p + "/app-concat-bundle.js")) : (v("app-prod.css"),
            t(p + window.environment.tv_binary),
            (k || l || m) && t(window.environment.player_url));
        window.checkBrokenLabel = function() {
            "undefined" == typeof yt && h && (window.location.href = window.location.href.replace(/([?&])label=[^&]+&?/, "$1stick=0&"))
        }
        ;
        u("checkBrokenLabel()");
        f && (d || b ? t(p + "/modules/media-diagnostics-debug.js") : t(p + "/modules/media-diagnostics.js"));
        u("initializeOrRedirect('" + p + "');");
    }
    )();


/*
     FILE ARCHIVED ON 06:38:11 Jun 24, 2015 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 00:21:35 May 19, 2026.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  capture_cache.get: 0.454
  load_resource: 61.108
  PetaboxLoader3.resolve: 49.486
  PetaboxLoader3.datanode: 10.958
*/
