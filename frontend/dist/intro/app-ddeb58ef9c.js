"use strict";
function getBrainIpFrom(n) {
  var e = n.data,
    t = n.config;
  return "127.0.0.1" === e.ip ? getDevelopmentIpFrom(t) : e.ip;
}
function getDevelopmentIpFrom(n) {
  var e = n.url;
  return e.split("/")[2].split(":")[0];
}
(angular
  .module("introApp", [
    "ngAnimate",
    "ngSanitize",
    "ui.router",
    "ionic",
    "ngCordova",
    "gettext",
    "commonService",
    "commonController",
    "common.health",
    "common.directives",
    "common.exception",
    "introApp.ftue",
    "introApp.lookup",
  ])
  .config([
    "$ionicConfigProvider",
    "$httpProvider",
    "$compileProvider",
    function (n, e, t) {
      (n.views.maxCache(0),
        n.views.swipeBackEnabled(!1),
        n.views.transition("ios"),
        n.form.checkbox("circle"),
        n.form.toggle("large"),
        n.templates.maxPrefetch(0),
        n.navBar.alignTitle("center"),
        n.navBar.positionPrimaryButtons("left"),
        n.navBar.positionSecondaryButtons("right"),
        e.useApplyAsync(!0),
        t.debugInfoEnabled(!1));
    },
  ])
  .constant("CONFIG_KEYS", {
    healthTestUrl: "/systeminfo",
    brainFrontendPort: 3200,
    brainBackendPort: "3000",
    protocol: "http://",
    projectConfigured: "project.configured",
    HTTP_REQUEST_TIMEOUT: 1e4,
    ENABLE_HEALTH_MONITOR: "true",
    DEBUG: "false",
    API_URL: "",
    API_VERSION: "v1",
    bonjourName: "_neeo._tcp.local.",
    cloudDiscoveryUrl: "https://brain.neeo.io/api/Brain",
    localhostLivereload: "http://localhost:9000",
    APP_IDENTIFIER: "intro",
  })
  .constant("$ionicLoadingConfig", {
    template: "<neeo-loading></neeo-loading>",
  })
  .run([
    "IonicService",
    "Health",
    "Config",
    function (n, e, t) {
      (n.init(), e.init({ disableBackendHealth: !0 }), t.init());
    },
  ])
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    function (n, e) {
      (n
        .state("start", {
          url: "/start",
          controller: "StartCtrl",
          templateUrl: "views/start.html",
        })
        .state("infobrainnotconfigured", {
          url: "/infobrainnotconfigured",
          controller: "InfoScreenCtrl",
          controllerAs: "$ctrl",
          templateUrl: "views/info/brainnotconfigured.html",
        }),
        e.otherwise("/start"));
    },
  ]),
  angular.module("introApp").run([
    "$templateCache",
    function (n) {
      (n.put(
        "ftue/setup.html",
        '<ion-view title="{{\'Welcome\' | translate}}"\n class="staged-screen ftue-setup"\n hide-nav-bar="true">\n\n<ion-slide-box show-pager="true"\n on-slide-changed="$ctrl.slideChanged($index)"\n class="setup {{$ctrl.slideNumberClass}}">\n<ion-slide class="setup-slide-1">\n<div class="row text-center">\n<div class="col">\n<h1 class="hero" translate>Welcome.</h1>\n<p class="below-brain" translate>Let\'s get your NEEO Brain up and running.\n Swipe left to continue!</p>\n</div>\n</div>\n</ion-slide>\n<ion-slide class="setup-slide-2">\n<div class="row text-center">\n<div class="col">\n<h1 class="hero" translate>Connect.</h1>\n<p class="above-brain" translate>Power the Brain using the included power cable.</p>\n<p class="below-brain invert-colors" translate>\n BRAIN SETUP REQUIRES ETHERNET CONNECTION.</br></br>\n Plug in the Ethernet cable and connect\n the Brain to the Wifi Router or Switch\n being used by your mobile device.\n</p>\n</div>\n</div>\n</ion-slide>\n<ion-slide class="setup-slide-3">\n<div class="blinking-brain"></div>\n<div class="header">\n <button class="button"\n ng-click="$ctrl.next()"\n translate>NEXT</button>\n</div>\n<div class="row text-center">\n<div class="col">\n<h1 class="hero" translate>Wait a minute.</h1>\n<p class="below-brain" translate>Allow 1 minute for the Brain to wake up.\n When the light stops blinking, tap NEXT to continue.\n</p>\n</div>\n</div>\n</ion-slide>\n</ion-slide-box>\n\n</ion-view>\n',
      ),
        n.put(
          "ftue/welcome.html",
          '<ion-view title="{{\'Welcome\' | translate}}"\n class="staged-screen ftue-welcome"\n hide-nav-bar="true">\n<ion-content has-bouncing="false"\n scroll="false">\n\n<div class="row row-header text-center">\n<div class="col">\n<h1 class="hero" translate>Hi! Nice to meet you</h1>\n</div>\n</div>\n<div class="footer">\n <button class="button button-block"\n ui-sref="infosetup"\n translate>SET UP YOUR NEEO</span></button>\n <button class="button button-block"\n ng-click="$ctrl.openStore()"\n translate>ORDER NEEO</button>\n</div>\n</div>\n\n</ion-content>\n</ion-view>\n',
        ),
        n.put(
          "lookup/lookup.html",
          '<ion-view hide-nav-bar="true">\n<ion-content has-bouncing="false">\n<div class="row text-center row-header">\n<div class="col">\n<h1 translate>Finding NEEO</h1>\n</div>\n</div>\n\n<div class="row text-center row-header searching">\n<div ng-show="searching" class="col">\n<neeo-loading></neeo-loading>\n<p ng-show="!ipScanSearch && services.length <1"\n translate>Searching{{::networkName}}…</p>\n<p ng-show="ipScanSearch && services.length <1"\n translate>Desperately searching{{::networkName}}…</p>\n<p ng-show="services.length> 0"\n translate>Looking for more…</p>\n</div>\n<div ng-hide="searching" class="col">\n<i class="icon icon-header icon-neeo-brain"></i> \n<p></p>\n</div>\n</div>\n\n<div class="row text-center">\n<div class="col">\n \n<h2 ng-show="connecting"\n translate>Connecting…</h2>\n<h2 ng-show="!connecting && services.length===1"\n translate>NEEO Brain found!</h2>\n<h2 ng-show="!connecting && services.length> 1"\n translate>Multiple NEEO Brains have been found{{::onNetworkName}}.</h2>\n<div ng-show="!connecting && notfound && services.length === 0 && scanCount < MIN_SCAN_BEFORE_HINT">\n<h2 translate>Sorry, no NEEO Brain found.</h2>\n<p translate>\n If you just powered on a NEEO Brain, wait until it stops blinking.\n Connect the NEEO Brain to the same network this phone is using\n with the provided network cable.\n</p>\n</div>\n<div ng-show="!connecting && notfound && services.length === 0 && scanCount >= MIN_SCAN_BEFORE_HINT">\n<h2 translate>Still no NEEO Brain found.</h2>\n<p translate>\n Make sure the NEEO Brain stopped blinking and\n that the ethernet cable is plugged into the back of the NEEO Brain\n and to your router.\n</p>\n<p translate>\n If you\'re still having trouble we\'re here to help,\n <a ng-click="$ctrl.support()">contact us</a>.\n</p>\n</div>\n</div>\n</div>\n\n<div class="list" ng-show="services.length > 1 && !autoConnect">\n<div class="item item-icon-right"\n ng-click="connectToBrain(brain)"\n ng-repeat="brain in services track by brain.hostname">\n {{ brain.name }}\n<div class="item__details">{{ brain.hostname }}</div>\n<i class="icon icon-navright"></i> \n</div>\n<div ng-show="!searching" class="item item-icon-right" ng-click="searchForBrains()">\n Refresh list\n<i class="icon icon-refresh"></i> \n</div>\n</div>\n\n<div class="row">\n<div class="col">\n <button ng-show="services.length===1 && !autoConnect"\n class="button button-block"\n ng-click="connectToBrain(service)"\n ng-repeat="service in services">\n <span translate>Connect</span>\n</button>\n\n <button ng-show="!searching && services.length===1"\n class="button button-block button-stable"\n ng-click="searchForBrains()">\n <span translate>Search again</span>\n</button>\n\n <button ng-show="notfound && services.length===0"\n class="button button-block"\n ng-click="searchForBrains()">\n <span translate>Try again</span>\n</button>\n\n <button ng-show="enterstatic"\n class="button button-block button-stable"\n ng-click="enterIpAddress()">\n <span translate>Connect to IP address</span>\n</button>\n</div>\n</div>\n\n</ion-content>\n</ion-view>\n',
        ),
        n.put(
          "lookup/rescue.html",
          '<ion-view title="{{\'Rescue mode\'|translate}}">\n<ion-content has-bouncing="false" overflow-scroll="true">\n <iframe class="rescue" ng-src="{{$ctrl.trustSrc($ctrl.url)}}"></iframe>\n</ion-content>\n</ion-view>\n',
        ),
        n.put(
          "views/start.html",
          '<ion-view title="{{\'Initializing\'|translate}}" hide-nav-bar="true">\n<ion-content has-bouncing="false">\n</ion-content>\n</ion-view>\n',
        ),
        n.put(
          "views/common/iconselector.html",
          '<ion-view title="{{\'Icon\'|translate}}">\n<ion-content>\n \n \n<form novalidate name="form">\n<div class="row grid-icons text-center">\n<div class="col col-25" ng-repeat="icon in icons">\n<div class="item-radio"><input type="radio" name="group"/>\n<i class="icon {{icon.class}} icon-streamline-original"></i><i class="radio-icon icon-check-mark-2"></i> \n</div>\n</div>\n</div>\n</form>\n</ion-content>\n</ion-view>\n',
        ),
        n.put(
          "views/common/overlay-loader.html",
          '<div style="position: absolute; background: white; top: 0; right: 0; bottom: 0; left: 0; z-index: 999;" ng-show="showLoader" fadeout class="launch-overlay">\n<div style="position: absolute;width: 100%;height: 100%;display: table;">\n<div style="position: relative;height: 10vw;width: 10vw;display: table-cell;vertical-align: middle;text-align: center;">\n <img class="spinner" src="../images/loading.svg">\n</div>\n</div>\n</div>\n',
        ),
        n.put(
          "views/info/brainnotconfigured.html",
          '<ion-view hide-nav-bar="true">\n<ion-content has-bouncing="false">\n<div class="row row-header text-center">\n<div class="col">\n<i class="icon icon-header icon-error"></i> \n<h1 translate>NEEO Brain not configured</h1>\n</div>\n</div>\n<div class="row text-center">\n<div class="col">\n<p translate>This NEEO Brain is not fully configured yet.</p>\n <button class="button button-block" nav-transition="none" ng-click="$ctrl.setup()" translate>Configure now</button>\n <button class="button button-block button-stable" ui-sref="brainlookup" translate>Change Brain</button>\n</div>\n</div>\n<div class="row text-center">\n<div class="col">\n <button class="button button-block button-stable" ng-click="$ctrl.web()" translate>Visit the NEEO website</button>\n <button class="button button-block button-stable" ng-click="$ctrl.support()" translate>Contact support</button>\n</div>\n</div>\n</ion-content>\n</ion-view>\n',
        ),
        n.put(
          "directives/triggerRemoteButton.html",
          '<button class="button button-remote"\n ng-class="[$ctrl.cssclass, $ctrl.icon, {\'button-multiline\': $ctrl.breakBeforeLabel}]"\n ng-transclude>\n {{$ctrl.label}}\n</button>\n',
        ),
        n.put(
          "health/health.notification.backend.modal.html",
          '<ion-modal-view class="connection-error-modal"\n ng-controller="HealthNotificationCtrl as $ctrl">\n<ion-content scroll="none" has-bouncing="false">\n<div class="row text-center">\n<div class="col">&nbsp;</div>\n</div>\n<div class="row row-header text-center">\n<div class="col">\n<i class="icon icon-error icon-header"></i> \n<h2 translate ng-if="!$ctrl.firmwareUpdateRunning">Can\'t connect to Brain</h2>\n<h1 translate ng-if="$ctrl.firmwareUpdateRunning">Upgrading NEEO Brain</h1>\n<neeo-loading></neeo-loading>\n<p translate ng-if="!$ctrl.firmwareUpdateRunning">Searching{{$ctrl.SSID}}…</p>\n</div>\n</div>\n\n<div class="row text-center" ng-if="!$ctrl.firmwareUpdateRunning">\n<div class="col">\n<p translate>Trying to reestablish connection to the NEEO Brain for a few seconds.\n If all fails, we\'ll try to find it again by other means.</p>\n</div>\n</div>\n\n<div class="row text-center" ng-if="$ctrl.firmwareUpdateRunning">\n<div class="col">\n<p translate>Your NEEO Brain is upgrading the firmware. We are trying to reestablish\n the connection once it is done upgrading.</p>\n</div>\n</div>\n\n<div class="row text-center">\n<div class="col text-negative">\n <button ng-if="!$ctrl.firmwareUpdateRunning"\n class="button button-block"\n ng-click="$ctrl.brainLookup()"\n translate>\n Cancel &amp; find my Brain!\n</button>\n\n <button ng-if="$ctrl.firmwareUpdateRunning"\n class="button button-block button-assertive"\n ng-click="$ctrl.confirmBrainLookup()"\n translate>\n Change Brain\n</button>\n</div>\n</div>\n\n</ion-content>\n</ion-modal-view>\n',
        ),
        n.put(
          "health/health.notification.connection.modal.html",
          '<ion-modal-view class="connection-error-modal"\n ng-controller="HealthNotificationCtrl as $ctrl">\n<ion-content scroll="none" has-bouncing="false">\n<div class="row text-center">\n<div class="col">&nbsp;</div>\n</div>\n<div class="row row-header text-center">\n<div class="col">\n<i class="icon icon-error icon-header"></i> \n<h2 translate>Waiting for Wifi</h2>\n<neeo-loading></neeo-loading>\n</div>\n</div>\n\n<div class="row text-center">\n<div class="col">\n<p translate>This mobile phone is currently not connected to any Wifi network. Waiting for Wifi connection to become available.</p>\n</div>\n</div>\n\n<div class="row text-center"\n ng-if="$ctrl.isInIntro">\n<div class="col">\n <button class="button button-block button-stable"\n ng-click="$ctrl.web()"\n translate>Visit the NEEO website</button>\n <button class="button button-block button-stable"\n ng-click="$ctrl.support()"\n translate>Contact support</button>\n</div>\n</div>\n\n</ion-content>\n</ion-modal-view>\n',
        ),
        n.put(
          "loading/loading.modal.html",
          '<ion-modal-view\n class="loading-screen-view"\n ng-controller="LoadingCtrl as $ctrl"\n title="none"\n hide-nav-bar="true">\n<div class="loading-screen-wrapper">\n<div class="loading-screen">\n<div class="loading__title"\n ng-if="$ctrl.showRecipeName">\n<h2>{{ $ctrl.recipeHeader }}</h2>\n<h1>{{ $ctrl.recipeName }}</h1>\n</div>\n<div class="loading-circle no-transition" ng-show="$ctrl.loadingScreenVisible"></div>\n</div>\n</div>\n</ion-modal-view>\n',
        ));
    },
  ]),
  angular.module("gettext").run(["gettextCatalog", function (n) {}]),
  angular.module("introApp.ftue", [
    "ui.router",
    "ionic",
    "commonService",
    "common.directives",
  ]),
  angular.module("introApp.ftue").config([
    "$stateProvider",
    function (n) {
      n.state("welcome", {
        url: "/welcome",
        controller: "WelcomeCtrl",
        controllerAs: "$ctrl",
        templateUrl: "ftue/welcome.html",
      }).state("infosetup", {
        url: "/infosetup",
        controller: "InfoSetupCtrl",
        controllerAs: "$ctrl",
        templateUrl: "ftue/setup.html",
      });
    },
  ]),
  angular.module("introApp.ftue").controller("InfoSetupCtrl", [
    "$state",
    "Transit",
    function (n, e) {
      var t = this;
      (e.hideNext(),
        e.hideBack(),
        (t.next = function () {
          n.go("brainlookup");
        }),
        (t.slideNumberClass = "slide-1"),
        (t.slideChanged = function (n) {
          t.slideNumberClass = "slide-" + (n + 1);
        }));
    },
  ]),
  angular.module("introApp.ftue").controller("WelcomeCtrl", [
    "$state",
    "Transit",
    function (n, e) {
      var t = this;
      (e.hideNext(), e.hideBack(), (t.openStore = e.neeoStore));
    },
  ]),
  angular.module("introApp.lookup", [
    "ngAnimate",
    "ui.router",
    "commonService",
    "common.directives",
  ]),
  angular.module("introApp.lookup").config([
    "$stateProvider",
    function (n) {
      n.state("brainlookup", {
        url: "/brainlookup?autoconnect",
        controller: "LookupCtrl",
        templateUrl: "lookup/lookup.html",
      }).state("rescue", {
        url: "/rescue/:rescueUrl",
        controller: "RescueCtrl",
        controllerAs: "$ctrl",
        templateUrl: "lookup/rescue.html",
      });
    },
  ]),
  angular.module("introApp.lookup").factory("BrainService", [
    "$q",
    "$http",
    "Config",
    "Bonjour",
    "IpScan",
    "CloudDiscovery",
    "BrainChecker",
    function (n, e, t, o, r, i, a) {
      function c(n) {
        return t.setBrainUrls(n);
      }
      function s(e) {
        return a
          .sortWorkingIpFirst(e.addresses)
          .then(function (n) {
            return ((e.addresses = n), e);
          })
          ["catch"](function (t) {
            return n.reject(e);
          });
      }
      return { saveBrain: c, validateBrain: s };
    },
  ]),
  angular.module("introApp.lookup").factory("Bonjour", [
    "ZeroConf",
    "Rx",
    function (n, e) {
      function t() {
        var t =
          arguments.length > 0 && void 0 !== arguments[0]
            ? arguments[0]
            : e.Scheduler.async;
        return n
          .getEventStream()
          .filter(o)
          ["let"](r)
          .timeout(a, t)
          ["catch"](function () {
            return (i(), e.Observable.empty());
          });
      }
      function o(n) {
        var e = n.action,
          t = n.service;
        return e === c || t.ipv4Addresses.length > 0;
      }
      function r(n) {
        return n.map(function (n) {
          return {
            brain: {
              name: n.service.name,
              type: n.service.type,
              domain: n.service.domain,
              hostname: n.service.txtRecord.hon,
              port: n.service.port,
              addresses: n.service.ipv4Addresses,
            },
            action: n.action,
          };
        });
      }
      function i() {
        n.stopWatching();
      }
      var a = 1e4,
        c = "removed";
      return { getBrainStream: t, cutBrainStream: i };
    },
  ]),
  angular.module("introApp.lookup").factory("CloudDiscovery", [
    "$http",
    "$q",
    "Config",
    "Rx",
    "CONFIG_KEYS",
    "BrainChecker",
    function (n, e, t, o, r, i) {
      function a() {
        var n = c()
          .then(s)
          ["catch"](function (n) {
            return [];
          });
        return o.Observable.fromPromise(n);
      }
      function c() {
        return n.get(f).then(function (n) {
          return n.data;
        });
      }
      function s(n) {
        var t = n.map(u);
        return e
          .all(t)
          .then(d)
          .then(function (n) {
            return n;
          });
      }
      function u(n) {
        return l(n.ips[0])
          ["catch"](function () {
            return 2 === n.ips.length ? l(n.ips[1]) : e.reject();
          })
          .then(function (e) {
            if (e.hostname === n.hostname)
              return {
                name: e.name,
                type: "_neeo._tcp.",
                domain: "local.",
                hostname: e.hostname,
                port: r.brainBackendPort,
                addresses: [e.lanip, e.wlanip],
              };
          })
          ["catch"](function () {});
      }
      function l(n) {
        return e.all([i.getSystemInfo(n), i.getName(n)]).then(function (n) {
          var e = n[0].data;
          return ((e.name = n[1]), e);
        });
      }
      function d(n) {
        return n.filter(function (n) {
          return angular.isObject(n);
        });
      }
      var f = t.getDiscoveryUrl();
      return { getBrainsStream: a };
    },
  ]),
  angular.module("introApp.lookup").controller("LookupCtrl", [
    "$state",
    "$scope",
    "$timeout",
    "Config",
    "CONFIG_KEYS",
    "Transit",
    "BrainService",
    "Bonjour",
    "CloudDiscovery",
    "IpScan",
    "ErrorInterceptor",
    "$ionicScrollDelegate",
    "$ionicPopup",
    "gettextCatalog",
    "$ionicLoading",
    "Rx",
    function (n, e, t, o, r, i, a, c, s, u, l, d, f, p, h, m) {
      function g() {
        (o
          .getDeviceSSID()
          .then(function (n) {
            ((e.networkName = " " + n),
              (e.onNetworkName = p.getString(" on {{deviceSsid}}", {
                deviceSsid: n,
              })));
          })
          ["catch"](function () {}),
          e.$on("$cordovaNetwork:offline", C),
          e.$on("$cordovaNetwork:online", S),
          e.$on("app:resume", S),
          v());
      }
      function v() {
        (N(),
          e.scanCount++,
          o.isCordova()
            ? ((K = b().subscribe()), e.autoConnect && t(I, D))
            : ((e.searching = !1),
              (e.autoConnect = !1),
              (e.enterstatic = !0),
              e.services.push(
                B("127.0.0.1", "Development localhost", "NEEO-localhost", !0),
              ),
              e.services.push(
                B("127.0.0.1", "Development RESCUE", "NEEO-rescue", !0),
              )));
      }
      function b() {
        return (
          l.skip(!0),
          y()
            .concat(w())
            .concat(
              m.Observable.of({}).switchMap(function () {
                return k();
              }),
            )
            ["finally"](function () {
              ((e.searching = !1),
                e.services.length < 1 && (e.notfound = !0),
                l.skip(!1));
            })
        );
      }
      function y() {
        return c.getBrainStream()["do"](function (n) {
          var e = n.brain,
            t = n.action;
          return "resolved" === t
            ? void A({ brain: e, logMessage: "BONJOUR_BRAIN_ADDED" })
            : void R(e);
        });
      }
      function w() {
        return s
          .getBrainsStream()
          .switchMap(function (n) {
            return m.Observable.from(n);
          })
          ["do"](function (n) {
            A({ brain: n, logMessage: "CLOUD_BRAIN_ADDED" });
          });
      }
      function k() {
        return E()
          ? m.Observable.empty()
          : ((e.enterstatic = !0),
            (e.ipScanSearch = !0),
            u.getBrainStream()["do"](function (n) {
              A({ brain: n, logMessage: "IPSCAN_BRAIN_ADDED" });
            }));
      }
      function E() {
        return e.services.length > 0;
      }
      function S() {
        (C(), n.reload());
      }
      function C() {
        e.searching &&
          (c.cutBrainStream(), K.unsubscribe(), (e.searching = !1));
      }
      function N() {
        ((e.notfound = !1),
          (e.enterstatic = !1),
          (e.searching = !0),
          (e.connecting = !1),
          (e.ipScanSearch = !1),
          (e.services = []),
          (e.data = { ip: "" }),
          d.scrollTop());
      }
      function I() {
        if (1 === e.services.length) {
          var n = e.services[0];
          return $(n)["finally"](function () {
            e.autoConnect = !1;
          });
        }
        e.autoConnect = !1;
      }
      function $(t) {
        C();
        var o = t.name.indexOf("RESCUE") > -1;
        return o
          ? n.go("rescue", { rescueUrl: t.addresses[0] })
          : ((e.connecting = !0),
            h.show(),
            a.validateBrain(t).then(x)["catch"](T)["finally"](h.hide));
      }
      function x(n) {
        a.saveBrain(n).then(function (e) {
          e
            ? i.eui("home/rooms?" + Date.now())
            : n.debug
              ? i.toLiveReload()
              : i.iui("account/welcome?" + Date.now());
        });
      }
      function T(n) {
        ((e.connecting = !1),
          f.alert({
            title: p.getString("Connection failed."),
            template: p.getString(
              "It looks like “{{brain}}” isn’t responding. Make sure to wait until the LED is white &amp; not blinking.",
              { brain: n.name },
            ),
            okText: p.getString("OK"),
          }));
      }
      function B(n, e, t, o) {
        return {
          name: e || n,
          type: "NA",
          domain: "NA",
          hostname: t || "NA",
          port: r.brainBackendPort,
          addresses: [n],
          debug: !!o || void 0,
        };
      }
      function O() {
        return (
          (e.data.ip = ""),
          f.show({
            template:
              '<ion-input class="item item-input"><input ng-model="data.ip" type="text" clear-input autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" focus clear-input></ion-input>',
            title: p.getString("Enter an IP address"),
            scope: e,
            cssClass: "custom-ionic-popup",
            buttons: [
              { text: p.getString("Cancel") },
              {
                text: p.getString("Connect"),
                type: "button-positive",
                onTap: function (n) {
                  return e.data.ip ? e.data.ip : void n.preventDefault();
                },
              },
            ],
          })
        );
      }
      function _(n) {
        n &&
          (U.test(n)
            ? $(B(n))
            : f.alert({
                title: p.getString("Invalid IP address, try again."),
                okText: p.getString("OK"),
              }));
      }
      function A(n) {
        var t = n.brain;
        n.logMessage;
        P(t) || (e.services.push(t), e.$applyAsync());
      }
      function P(n) {
        return e.services.some(function (e) {
          return e.hostname === n.hostname;
        });
      }
      function R(n) {
        ((e.services = e.services.filter(function (e) {
          return e.name !== n.name;
        })),
          e.$applyAsync());
      }
      var U =
          /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
        D = 500,
        K = void 0;
      (i.hideNext(),
        i.hideBack(),
        (e.scanCount = 0),
        (e.MIN_SCAN_BEFORE_HINT = 3),
        (e.autoConnect = /^true$/i.test(n.params.autoconnect)),
        e.$on("$ionicView.afterEnter", g),
        (e.searchForBrains = v),
        (e.connectToBrain = $),
        (e.support = i.neeoSupport),
        (e.enterIpAddress = function () {
          O().then(_);
        }));
    },
  ]),
  angular.module("introApp.lookup").factory("IpScan", [
    "BrainChecker",
    "$window",
    "Rx",
    "CONFIG_KEYS",
    function (n, e, t, o) {
      function r() {
        var n =
          arguments.length > 0 && void 0 !== arguments[0]
            ? arguments[0]
            : t.Scheduler.async;
        return i()
          ["do"](function (n) {})
          .switchMap(function (e) {
            return a(e, n);
          });
      }
      function i() {
        return t.Observable.create(function (n) {
          e.networkinterface.getIPAddress(
            function (e) {
              (n.next(e), n.complete());
            },
            function (e) {
              return n.error(e);
            },
          );
        });
      }
      function a(n, e) {
        return t.Observable.interval(s, e)
          .map(function (n) {
            return n + 1;
          })
          .take(254)
          .switchMap(function (e) {
            return c(n, e);
          })
          .map(function (n) {
            return {
              name: n.name,
              type: "NA",
              domain: "NA",
              hostname: n.hostname,
              port: o.brainBackendPort,
              addresses: [n.ip],
            };
          });
      }
      function c(e, o) {
        var r = e.toString().split("."),
          i = [r[0], r[1], r[2], o].join(".");
        return n
          .getSystemInfoStream(i, u)
          .switchMap(function (e) {
            return n.getNameStream(i, u).map(function (n) {
              return {
                ip: getBrainIpFrom(e),
                hostname: e.data.hostname,
                name: n,
              };
            });
          })
          ["catch"](function () {
            return t.Observable.empty();
          });
      }
      var s = 80,
        u = 250;
      return { getBrainStream: r };
    },
  ]),
  angular.module("introApp.lookup").controller("RescueCtrl", [
    "$stateParams",
    "Transit",
    "$sce",
    function (n, e, t) {
      var o = this;
      (e.hideNext(),
        e.showBack(),
        e.onBackGoTo("brainlookup"),
        (o.url = "http://" + n.rescueUrl),
        (o.trustSrc = function (n) {
          return t.trustAsResourceUrl(n);
        }));
    },
  ]),
  angular.module("introApp.lookup").factory("ZeroConf", [
    "Config",
    "Rx",
    function (n, e) {
      function t() {
        return (
          r().close(),
          e.Observable.create(function (n) {
            r().watch(i, a, function (e) {
              n.next(e);
            });
          })
        );
      }
      function o() {
        n.isCordova() && (r().unwatch(i, a), r().close());
      }
      function r() {
        return cordova.plugins.zeroconf;
      }
      var i = "_neeo._tcp.",
        a = "local.",
        c = "ipv4";
      return (
        (r.watchAddressFamily = c),
        { getEventStream: t, stopWatching: o }
      );
    },
  ]),
  angular.module("common.crypto", ["commonService"]),
  angular.module("common.crypto").factory("EncryptionInitService", [
    "$http",
    "$timeout",
    "Config",
    "EncryptionService",
    function (n, e, t, o) {
      function r() {
        if (t.isBrainApiUrlInvalid())
          throw new Error(
            "Encryption initialize failed: invalid brain API URL!",
          );
        return i().then(function (n) {
          return n ? n : (e(r, c), n);
        });
      }
      function i() {
        return n.get(a + "/secure/pubkey").then(
          function (n) {
            if (n && n.data && n.data.publickey)
              try {
                return (o.setPublicKey(n.data.publickey), !0);
              } catch (e) {}
            return !1;
          },
          function () {
            return !1;
          },
        );
      }
      var a = t.getBrainApiUrl(),
        c = 4e3;
      return { fetchPublicKeyFromBrain: r };
    },
  ]),
  angular.module("common.crypto").factory("EncryptionService", [
    "$window",
    function (n) {
      function e() {
        ((n.openpgp.config.show_version = !1),
          (n.openpgp.config.show_comment = !1));
      }
      function t(t) {
        e();
        var o = n.openpgp.key.readArmored(t);
        if (o.err) throw new Error("INVALID_PUBLIC_KEY");
        return ((r = o.keys), !0);
      }
      function o(e) {
        if (!r) throw new Error("NO_PUBLIC_KEY_DEFINED");
        return n.openpgp
          .encrypt({ data: JSON.stringify(e), publicKeys: r })
          .then(function (n) {
            return n.data;
          });
      }
      var r;
      return { setPublicKey: t, encrypt: o };
    },
  ]),
  angular.module("common.crypto").factory("CryptoInterceptor", [
    "EncryptionService",
    function (n) {
      function e(e) {
        if (!e || !e.url || !e.data || "POST" !== e.method) return e;
        var o = new URL(e.url) || new webkitURL(e.url),
          r = t.filter(function (n) {
            return n.test(o.pathname);
          });
        return r && r[0]
          ? n.encrypt(e.data).then(function (n) {
              return (
                e.headers || (e.headers = {}),
                (e.data = { data: n }),
                (e.headers["X-NEEO-Secure"] = !0),
                e
              );
            })
          : e;
      }
      var t = [
        /\/v1\/wifi\/connect/,
        /\/v1\/account/,
        /\/v1\/deviceadapter\/register/,
      ];
      return { request: e };
    },
  ]),
  angular.module("common.exception", ["ionic", "gettext", "commonService"]),
  angular.module("common.exception").factory("$exceptionHandler", [
    "$window",
    "logErrorToBrain",
    "$injector",
    "CONFIG_KEYS",
    function (n, e, t, o) {
      function r(n) {
        var t = "intro" !== o.APP_IDENTIFIER;
        t && e(i(n));
      }
      function i(e) {
        var o = t.get("$state"),
          r = { state: o.current.name, params: o.params };
        if (f) {
          var i = n.ionic.Platform;
          ((r.platform = i.platform()), (r.platformVersion = i.version()));
        }
        var a = ["message", "stack"];
        return (
          a.forEach(function (n) {
            angular.isDefined(e[n]) && (r[n] = e[n]);
          }),
          r
        );
      }
      function a(n) {
        return (
          (l = l || t.get("$ionicPopup")),
          (d = d || t.get("gettextCatalog")),
          l.alert({
            title: d.getString("NEEO says sorry..."),
            template:
              d.getString('There was something fishy going on: "') + n + '"',
          })
        );
      }
      function c() {
        ((u = u || t.get("$location")),
          "iui" === o.APP_IDENTIFIER
            ? u.url(o.brainFrontendUrl + "/iui/index.html#/settings/list")
            : "eui" === o.APP_IDENTIFIER &&
              u.url(o.brainFrontendUrl + "/eui/index.html#/home/rooms"));
      }
      function s(n) {
        return p.some(function (e) {
          return e.test(n.message);
        });
      }
      var u = void 0,
        l = void 0,
        d = void 0,
        f = !!n.cordova,
        p = [/\$digest/, /\$apply/];
      return function (n, e) {
        n.data && (n = n.data);
        var t = n.message;
        (e && (n.message += ' (caused by "' + e + '")'),
          r(n),
          s(n) || a(t).then(c));
      };
    },
  ]),
  angular.module("common.directives", ["slugifier"]),
  angular.module("common.directives").directive("focus", [
    "$timeout",
    "$window",
    function (n, e) {
      function t(e, t) {
        var r = n(function () {
          t[0].focus();
        }, 700);
        e.$on("$destroy", function () {
          (n.cancel(r), t[0].blur(), o && cordova.plugins.Keyboard.close());
        });
      }
      var o = e.cordova && e.cordova.plugins && e.cordova.plugins.Keyboard;
      return { restrict: "A", link: t };
    },
  ]),
  angular.module("common.directives").directive("clearInput", [
    "$compile",
    "$timeout",
    function (n, e) {
      return {
        require: "ngModel",
        scope: {},
        link: function (t, o, r, i) {
          var a = /text|search|tel|url|email|password/i;
          if ("INPUT" === o[0].nodeName) {
            if (!a.test(r.type))
              throw new Error("Invalid input type for ClearInput: " + r.type);
          } else if ("TEXTAREA" !== o[0].nodeName)
            throw new Error(
              "ClearInput is limited to input and textarea elements",
            );
          var c = n(
              '<i ng-show="enabled" ng-click="clear()" class="icon icon-remove icon-clear-input"></i>',
            )(t),
            s = o.parent();
          ("LABEL" === s[0].nodeName
            ? (o.addClass("clear-input"), s.after(c))
            : (o.addClass("clear-input"), o.after(c)),
            (t.clear = function () {
              (i.$setViewValue(null),
                i.$render(),
                e(
                  function () {
                    o[0].focus();
                  },
                  0,
                  !1,
                ),
                (t.enabled = !1));
            }),
            o
              .bind("input", function () {
                t.enabled = !i.$isEmpty(o.val());
              })
              .bind("focus", function () {
                t.$evalAsync(function () {
                  t.enabled = !i.$isEmpty(o.val());
                });
              })
              .bind("blur", function () {
                t.$evalAsync(function () {
                  t.enabled = !1;
                });
              }));
        },
      };
    },
  ]),
  angular
    .module("common.directives")
    .controller("DirectiveInjectorCtrl", function () {})
    .directive("directiveInjector", [
      "$compile",
      function (n) {
        function e(n) {
          var e = Object.keys(n);
          return e
            .filter(function (e) {
              return angular.isDefined(n[e]);
            })
            .map(function (n) {
              var e = n
                .replace(/([A-Z])/g, "-$1")
                .replace(/^-/, "")
                .toLowerCase();
              return " " + e + '="$ctrl.data.' + n + '"';
            })
            .join("");
        }
        return {
          restrict: "E",
          replace: !0,
          scope: {},
          bindToController: { directive: "=", data: "=" },
          controller: "DirectiveInjectorCtrl",
          controllerAs: "$ctrl",
          link: function (t, o, r) {
            var i = t.$ctrl.directive;
            ((t.$ctrl.data = t.$ctrl.data || {}),
              (t.$ctrl.data["class"] = t.$ctrl.data["class"] || r["class"]),
              (t.$ctrl.data.style = t.$ctrl.data.style || r.style));
            var a = "<" + i,
              c = "></" + i + ">",
              s = e(t.$ctrl.data),
              u = a + s + c,
              l = n(u)(t);
            (o.replaceWith(l), o.remove());
          },
        };
      },
    ]),
  angular.module("common.directives").directive("includeReplace", function () {
    return {
      require: "ngInclude",
      restrict: "A",
      link: function (n, e) {
        (e.replaceWith(e.children()), e.remove());
      },
    };
  }),
  angular.module("common.directives").directive("fadeout", [
    "$timeout",
    "$window",
    "$rootScope",
    function (n, e, t) {
      var o = 5e3;
      return {
        priority: Number.MIN_SAFE_INTEGER,
        restrict: "A",
        link: function (e) {
          function r() {
            ((e.showLoader = !0), n(i, o));
          }
          function i() {
            e.show || (e.showLoader = !1);
          }
          function a() {
            (i(), c());
          }
          ((e.showLoader = !0),
            t.$on("initial-loader-show", r),
            t.$on("initial-loader-hide", i));
          var c = t.$on("$stateChangeSuccess", a);
        },
      };
    },
  ]),
  angular
    .module("common.directives")
    .directive("ionNumericKeyboard", [
      "$document",
      "$compile",
      function (n, e) {
        var t = {
            visible: !0,
            hideOnOutsideClick: !1,
            leftControl: null,
            rightControl: '<i class="icon ion-backspace-outline"></i>',
            onKeyPress: angular.noop,
            button: null,
          },
          o = function (n) {
            var e =
              '<style type="text/css">@charset "UTF-8";.ion-numeric-keyboard {    z-index: 12;    bottom: 0;    left: 0;    right: 0;    position: absolute;     width: 100%;}.backdrop-numeric-keyboard {    background-color: transparent;}.ion-numeric-keyboard .row {    padding: 0;    margin: 0;}.ion-numeric-keyboard .key {    border: 0;    border-radius: 0;    padding: 0;    background-color: transparent;    font-size: 180%;    border-style: solid;    color: #fefefe;    border-color: #444;    background-color: #333;}.ion-numeric-keyboard .control-key {    background-color: #242424;}.ion-numeric-keyboard .key.activated {    box-shadow: inset 0 1px 4px rgba(0, 0, 0, .1);    background-color: rgba(68, 68, 68, 0.5);}.ion-numeric-keyboard .row:nth-child(1) .key {    border-top-width: 1px;}.ion-numeric-keyboard .row:nth-child(1) .key,.ion-numeric-keyboard .row:nth-child(2) .key,.ion-numeric-keyboard .row:nth-child(3) .key ,.ion-numeric-keyboard .row:nth-child(4) .key {    border-bottom-width: 1px;}.ion-numeric-keyboard .row .key:nth-child(1),.ion-numeric-keyboard .row .key:nth-child(2) {    border-right-width: 1px;}.has-ion-numeric-keyboard {    bottom: 188px;}.has-ion-numeric-keyboard.has-ion-numeric-keyboard-top-bar {    bottom: 228px;}.ion-numeric-keyboard-top-bar {    background-color: #242424;}</style>';
            n.append(e);
          },
          r = function (n, e, t) {
            e &&
              (n
                ? (e.addClass("has-ion-numeric-keyboard"),
                  t && e.addClass("has-ion-numeric-keyboard-top-bar"))
                : (e.removeClass("has-ion-numeric-keyboard"),
                  e.removeClass("has-ion-numeric-keyboard-top-bar")));
          };
        return {
          restrict: "E",
          replace: !0,
          template:
            '<div id="asjasjdk" click-outside="hide()" outside-if-not="numeric-keyboard-source" class="ion-numeric-keyboard ng-hide" ng-show="opts.visible" ng-class="{\'with-top-bar\': opts.button}"><div class="row ion-numeric-keyboard-top-bar" ng-show="opts.button"><div class="col"><button class="{{opts.button.class}}" ng-click="opts.button.onClick()" ng-bind-html="opts.button.content"></button></div></div><div class="row"><button class="col key button" ng-click="opts.onKeyPress(1, \'NUMERIC_KEY\')" ng-bind-html="1"></button><button class="col key button" ng-click="opts.onKeyPress(2, \'NUMERIC_KEY\')" ng-bind-html="2"></button><button class="col key button" ng-click="opts.onKeyPress(3, \'NUMERIC_KEY\')" ng-bind-html="3"></button></div><div class="row"><button class="col key button" ng-click="opts.onKeyPress(4, \'NUMERIC_KEY\')" ng-bind-html="4"></button><button class="col key button" ng-click="opts.onKeyPress(5, \'NUMERIC_KEY\')" ng-bind-html="5"></button><button class="col key button" ng-click="opts.onKeyPress(6, \'NUMERIC_KEY\')" ng-bind-html="6"></button></div><div class="row"><button class="col key button" ng-click="opts.onKeyPress(7, \'NUMERIC_KEY\')" ng-bind-html="7"></button><button class="col key button" ng-click="opts.onKeyPress(8, \'NUMERIC_KEY\')" ng-bind-html="8"></button><button class="col key button" ng-click="opts.onKeyPress(9, \'NUMERIC_KEY\')" ng-bind-html="9"></button></div><div class="row"><button class="col key button control-key left-control-key" ng-click="opts.onKeyPress(opts.leftControl, \'LEFT_CONTROL\')" ng-bind-html="opts.leftControl" ng-show="opts.leftControl"></button><div class="col key  control-key right-control-key" ng-show="!opts.leftControl"></div><button class="col key button" ng-click="opts.onKeyPress(0, \'NUMERIC_KEY\')" ng-bind-html="0"></button><button class="col key button control-key right-control-key" ng-click="opts.onKeyPress(opts.rightControl, \'RIGHT_CONTROL\')" ng-bind-html="opts.rightControl" ng-show="opts.rightControl"></button><div class="col key  control-key right-control-key" ng-show="!opts.rightControl"></div></div></div>',
          scope: { options: "=" },
          link: function (e, i, a) {
            o(n.find("head"));
            var c = i.parent().find("ion-content");
            ((e.hide = function () {
              e.opts.hideOnOutsideClick &&
                ((e.opts.visible = !1), r(e.opts.visible, c));
            }),
              (e.opts = angular.merge({}, t, e.options || {})),
              r(e.opts.visible, c, null !== e.opts.button),
              e.$watchCollection("options", function (n, o) {
                n !== o &&
                  ((e.opts = angular.merge({}, t, n)),
                  r(e.opts.visible, c, null !== e.opts.button));
              }));
          },
        };
      },
    ])
    .directive("clickOutside", [
      "$document",
      "$parse",
      function (n, e) {
        return {
          restrict: "A",
          link: function (t, o, r) {
            var i =
                void 0 !== r.outsideIfNot
                  ? r.outsideIfNot.replace(", ", ",").split(",")
                  : [],
              a = e(r.clickOutside);
            void 0 !== r.id && i.push(r.id);
            var c = function (n) {
              if (!angular.element(o).hasClass("ng-hide")) {
                var e,
                  r = 0;
                if (n && n.target) {
                  for (e = n.target; e; e = e.parentNode) {
                    var c = e.id,
                      s = e.className,
                      u = i.length;
                    for (
                      s && void 0 !== s.baseVal && (s = s.baseVal), r = 0;
                      r < u;
                      r++
                    )
                      if (
                        (void 0 !== c && c.indexOf(i[r]) > -1) ||
                        (s && s.indexOf(i[r]) > -1)
                      )
                        return;
                  }
                  return t.$evalAsync(function () {
                    return a(t);
                  });
                }
              }
            };
            (n.on("click", c),
              t.$on("$destroy", function () {
                n.off("click", c);
              }));
          },
        };
      },
    ]),
  angular.module("common.directives").directive("hideKeyboardOnScroll", [
    "$cordovaKeyboard",
    "$ionicGesture",
    function (n, e) {
      return {
        restrict: "A",
        link: function (t, o) {
          e.on(
            "swipeup",
            function () {
              n.close();
            },
            o,
          );
        },
      };
    },
  ]),
  angular.module("common.directives").directive("neeoLoading", function () {
    return {
      restrict: "E",
      templateNamespace: "svg",
      template:
        '<svg class="neeo-loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" r="40" stroke="#404040" fill="none" stroke-width="10" stroke-linecap="round"><animate attributeName="stroke-dashoffset" dur="3s" repeatCount="indefinite" from="502" to="0"></animate><animate attributeName="stroke-dasharray" dur="3s" repeatCount="indefinite" values="125.5 125.5;1 250;125.5 125.5"></animate></circle></svg>',
    };
  }),
  angular.module("common.directives").directive("optionalButton", [
    "$compile",
    function (n) {
      return {
        restrict: "A",
        replace: !1,
        link: function (e, t, o) {
          "true" === o.optionalButton &&
            (t.replaceWith(
              n('<button class="button button-clear" disabled></button>')({}),
            ),
            t.remove());
        },
      };
    },
  ]),
  angular.module("common.directives").directive("remoteButton", [
    "Slug",
    "$timeout",
    "$interval",
    "$window",
    function (n, e, t, o) {
      function r(n, e) {
        return angular.isDefined(n) ? n : e;
      }
      var i = 150,
        a = 15,
        c = 75;
      return {
        restrict: "E",
        replace: !0,
        transclude: !0,
        scope: {
          action: "@",
          label: "@",
          repeat: "@",
          interval: "@",
          tolerance: "@",
          safety: "@",
          icon: "@",
          cssclass: "@",
          triggerFn: "=",
        },
        template:
          '<button class="{{cssclass}} {{icon}} button-remote"><div ng-transclude></div>{{label}}</button>',
        link: function (s, u, l) {
          function d(n) {
            if (((S = !1), !n.touches || 0 === n.touches.length))
              return void m(n);
            ((y.xStart = n.touches[0].clientX),
              (y.yStart = n.touches[0].clientY));
            var t = {};
            (void 0 !== s.deviceKey && (t.deviceKey = s.deviceKey),
              (k = !1),
              e(c).then(function () {
                S ||
                  ((E = s.repeat), b(s.action, t), e(h, g), n.preventDefault());
              }),
              n.preventDefault());
          }
          function f(n) {
            e(1.25 * c).then(function () {
              m(n);
            });
          }
          function p(n) {
            if (!n.touches || 0 === n.touches.length) return void m(n);
            ((y.xEnd = n.changedTouches[0].clientX),
              (y.yEnd = n.changedTouches[0].clientY));
            var e = {
              x: o.Math.abs(y.xStart - y.xEnd),
              y: o.Math.abs(y.yStart - y.yEnd),
            };
            (e.x >= v || e.y >= v) && !k && ((k = !0), m(n), (S = !0));
          }
          function h() {
            s.repeat &&
              E &&
              !w &&
              ((w = t(function () {
                if (E) {
                  var n = { repeat: !0 };
                  (void 0 !== s.deviceKey && (n.deviceKey = s.deviceKey),
                    b(s.action, n));
                }
              }, g)),
              w["catch"](function () {
                w = null;
              }));
          }
          function m(n) {
            ((E = !1), t.cancel(w), n && n.preventDefault());
          }
          ((s.deviceKey = l.device),
            (s.cssclass = r(s.cssclass, "button button-clear")),
            (s.repeat = r(s.repeat, !1)),
            (s.safety = r(s.safety, !1)));
          var g = r(s.interval, i),
            v = r(s.tolerance, a),
            b = r(s.triggerFn, s.$parent.triggerAction),
            y = {},
            w = void 0,
            k = !1,
            E = !1,
            S = !1;
          if (
            (u.on("mousedown touchstart", d),
            u.on("mousemove touchmove", p),
            u.on("mouseup touchend", f),
            s.$on("$destroy", m),
            !s.label && !s.icon)
          ) {
            var C = n.slugify(s.action);
            s.icon = "icon icon-" + C;
          }
        },
      };
    },
  ]),
  angular.module("common.directives").component("triggerRemoteButton", {
    bindings: {
      repeat: "<",
      interval: "<",
      name: "@",
      label: "@",
      useIcon: "<",
      icon: "@",
      cssclass: "@",
      onTrigger: "&",
    },
    transclude: !0,
    controller: [
      "$scope",
      "$ionicPlatform",
      "$element",
      "$timeout",
      "$interval",
      "Slug",
      "Config",
      function (n, e, t, o, r, i, a) {
        function c(n) {
          return (
            (N = !1),
            "touchstart" === n.type && t.off("mousedown", c),
            n.touches && 0 !== n.touches.length
              ? (($.xStart = n.touches[0].clientX),
                ($.yStart = n.touches[0].clientY),
                (I = !1),
                void o(g).then(function () {
                  N || ((S = p.repeat), p.onTrigger(), o(l, v));
                }))
              : void d(n)
          );
        }
        function s(n) {
          o(1.25 * g).then(function () {
            return d(n);
          });
        }
        function u(n) {
          if (n.touches && 0 !== n.touches.length) {
            (($.xEnd = n.changedTouches[0].clientX),
              ($.yEnd = n.changedTouches[0].clientY));
            var e = {
              x: Math.abs($.xEnd - $.xStart),
              y: Math.abs($.yEnd - $.yStart),
            };
            (e.x >= y || e.y >= y) && !I && ((I = !0), d(n), (N = !0));
          }
        }
        function l() {
          if (p.repeat && S && !C) {
            var n = 0;
            ((C = r(function () {
              if (S) {
                var e = { repeat: !0 };
                if ((n++, n >= b)) return void r.cancel(C);
                p.onTrigger({ options: e });
              }
            }, w)),
              C["finally"](function () {
                ((C = void 0), (n = 0));
              }));
          }
        }
        function d(n) {
          ((S = !1), r.cancel(C), n && n.preventDefault());
        }
        function f(n, e) {
          return angular.isDefined(n) ? n : e;
        }
        var p = this,
          h = 15,
          m = 150,
          g = 75,
          v = 400,
          b = 60;
        (t.on("mousedown touchstart", c),
          t.on("mousemove touchmove", u),
          t.on("mouseup touchend", s),
          n.$on("$destroy", d),
          a.isCordova() &&
            e.on("pause", function (n) {
              d(n);
            }));
        var y = f(p.tolerance, h),
          w = f(p.interval, m);
        ((p.cssclass = f(p.cssclass, "button button-clear")),
          (p.useIcon = f(p.useIcon, !0)));
        var k = !p.label && !p.icon && p.useIcon;
        if (k) {
          var E = i.slugify(p.name);
          p.icon = "icon icon-" + E;
        }
        p.breakBeforeLabel = p.icon && p.label;
        var S = !1,
          C = void 0,
          N = !1,
          I = !1,
          $ = {};
      },
    ],
    templateUrl: "directives/triggerRemoteButton.html",
  }),
  angular.module("common.health", [
    "commonService",
    "btford.socket-io",
    "ionic",
  ]),
  angular.module("common.health").factory("HealthBackend", [
    "HealthConfig",
    "HealthNotification",
    "HealthUtil",
    "ErrorInterceptor",
    "Config",
    "$state",
    "$rootScope",
    "Transit",
    "socketPromise",
    "$interval",
    function (n, e, t, o, r, i, a, c, s, u) {
      function l() {
        ((_ = !1), (B = !1), (O = 0));
      }
      function d(e) {
        return e
          ? (l(),
            r.getDeviceSSID().then(function (n) {
              P = n;
            }),
            a.$on("socket-status-disconnect", p),
            a.$on("health-backend-suspend", h),
            a.$on("health-backend-resume", g),
            a.$on("app:resume", function () {
              r.getDeviceSSID().then(function (n) {
                P !== n && p();
              });
            }),
            void s.then(function (n) {
              (n.on(x, function () {
                A = !0;
              }),
                n.on(T, function () {
                  A = !1;
                }));
            }))
          : void n.disableBackendMonitoring();
      }
      function f() {
        return A;
      }
      function p() {
        var e = !n.isBackendMonitorEnabled();
        _ || e || (o.skip(!0), (_ = u(v, E)));
      }
      function h() {
        (_ && m(), (B = !0), n.disableBackendMonitoring());
      }
      function m() {
        (u.cancel(_), t.cancelPendingRequests(), o.skip(!1), l());
      }
      function g() {
        (n.enableBackendMonitoring(), l(), p());
      }
      function v() {
        (t.backendReady().then(b)["catch"](k),
          t.checkSecondBackendIp().then(function (n) {
            return c.changeConnectionIp(n);
          }));
      }
      function b() {
        (m(),
          s.then(y),
          e.hideBackendModal(),
          a.$broadcast("Project:active-recipes-changed"),
          (A = !1));
      }
      function y(n) {
        n.connect();
      }
      function w(n, e) {
        var t = void 0;
        switch (n.status) {
          case -1:
            t = "HEALTH_-1_HOST_UNREACHABLE";
            break;
          case 502:
            t = "HEALTH_502_NODE_SERVICE_DOWN_BAD_GATEWAY";
            break;
          case 408:
            t = "HEALTH_408_TIMEOUT";
            break;
          case 404:
            t = "HEALTH_404_NOT_FOUND";
            break;
          default:
            t = "HEALTH_UNKNOWN_HTTP_ERROR";
        }
      }
      function k(n) {
        O++;
        var t = r.isFirstTimeUserExperience();
        if (
          (t && O >= S && c.intro("brainlookup?autoconnect=true"), !(O < C))
        ) {
          (e.showBackendModal(), w(n, O));
          var o = A ? $ : N;
          O > o && (m(), c.intro("brainlookup?autoconnect=true"));
        }
      }
      var E = 1500,
        S = 2,
        C = 4,
        N = 44,
        I = 9e5,
        $ = I / E,
        x = "fw:updating",
        T = "fw:updateFailed",
        B = void 0,
        O = void 0,
        _ = void 0,
        A = !1,
        P = void 0;
      return { init: d, isFirmwareUpdateRunning: f };
    },
  ]),
  angular.module("common.health").factory("HealthConfig", [
    "CONFIG_KEYS",
    function (n) {
      function e() {
        r || (a = !0);
      }
      function t() {
        a = !1;
      }
      function o() {
        return a;
      }
      var r = "intro" === n.APP_IDENTIFIER,
        i = "/projects/home/configured",
        a = !r;
      return {
        enableBackendMonitoring: e,
        disableBackendMonitoring: t,
        isBackendMonitorEnabled: o,
        getBackendTestUrl: function () {
          return i;
        },
      };
    },
  ]),
  angular.module("common.health").factory("HealthConnection", [
    "HealthNotification",
    "CONFIG_KEYS",
    "Config",
    "$rootScope",
    "Transit",
    "$cordovaNetwork",
    "$window",
    function (n, e, t, o, r, i, a) {
      function c(n) {
        if (n && t.isCordova()) {
          var e = g.isAndroid() && /^[7-9]/.test(g.version());
          e ||
            ((h = i.getNetwork()),
            "wifi" !== h && p("CONNECTION_NOT_CONNECTED_TO_WIFI_ON_INIT"),
            o.$on("$cordovaNetwork:online", u),
            o.$on("$cordovaNetwork:offline", l),
            o.$on("app:resume", d));
        }
      }
      function s() {
        return m;
      }
      function u(n, e) {
        var t = h;
        ((h = e),
          "wifi" !== h
            ? p("CONNECTION_NOT_CONNECTED_TO_WIFI")
            : h !== t && f());
      }
      function l() {
        ((h = "offline"), p("CONNECTION_OFFLINE"));
      }
      function d() {
        var n = i.getNetwork();
        u({}, n);
      }
      function f() {
        if (
          ((m = !0),
          o.$broadcast("health-backend-resume"),
          n.hideConnectionModal(),
          "intro" === e.APP_IDENTIFIER)
        )
          return void r.intro();
      }
      function p(e) {
        ((m = !1),
          o.$broadcast("health-backend-suspend"),
          n.showConnectionModal());
      }
      var h,
        m = !0,
        g = a.ionic.Platform;
      return { init: c, isHealthy: s };
    },
  ]),
  angular.module("common.health").controller("HealthNotificationCtrl", [
    "$cordovaKeyboard",
    "$ionicPopup",
    "gettextCatalog",
    "Transit",
    "Config",
    "CONFIG_KEYS",
    "HealthBackend",
    function (n, e, t, o, r, i, a) {
      var c = this;
      ((c.isInIntro = "intro" === i.APP_IDENTIFIER),
        (c.web = o.neeoWeb),
        (c.support = o.neeoSupport),
        r.isCordova() && n.close(),
        r.getDeviceSSID().then(function (n) {
          c.SSID = " " + n;
        }),
        (c.firmwareUpdateRunning = a.isFirmwareUpdateRunning()),
        (c.brainLookup = function () {
          o.intro("brainlookup?autoconnect=true");
        }),
        (c.confirmBrainLookup = function () {
          e.confirm({
            title: t.getString("Change Brain?"),
            subTitle: t.getString(
              "Your NEEO Brain is currently upgrading to a new version.\n        We will automatically reconnect to it once it is done. Do you want to change\n        to another Brain nevertheless?",
            ),
            okText: t.getString("Change"),
            okType: "button-assertive",
          }).then(function (n) {
            if (n) return c.brainLookup();
          });
        }));
    },
  ]),
  angular.module("common.health").factory("HealthNotification", [
    "$ionicModal",
    "$ionicLoading",
    function (n, e) {
      function t() {
        s || (s = a("health/health.notification.backend.modal.html"));
      }
      function o() {
        s &&
          s.then(function (n) {
            (n.remove(), (s = !1));
          });
      }
      function r() {
        c || (c = a("health/health.notification.connection.modal.html"));
      }
      function i() {
        c &&
          c.then(function (n) {
            (n.remove(), (c = !1));
          });
      }
      function a(t) {
        return n.fromTemplateUrl(t, { animation: u }).then(function (n) {
          return (e.hide(), n.show(), n);
        });
      }
      var c,
        s,
        u = "slide-in-up";
      return {
        showBackendModal: t,
        hideBackendModal: o,
        showConnectionModal: r,
        hideConnectionModal: i,
      };
    },
  ]),
  angular.module("common.health").factory("Health", [
    "Config",
    "HealthBackend",
    "HealthConnection",
    function (n, e, t) {
      function o(o) {
        ((o = n.isHealthMonitorEnabled()
          ? angular.extend({}, r, o)
          : { disableBackendHealth: !0, disableConnectionHealth: !0 }),
          e.init(!o.disableBackendHealth),
          t.init(!o.disableConnectionHealth));
      }
      var r = { disableBackendHealth: !1, disableConnectionHealth: !1 };
      return { init: o };
    },
  ]),
  angular.module("common.health").factory("HealthUtil", [
    "Config",
    "HealthConfig",
    "BrainChecker",
    "$http",
    "$q",
    function (n, e, t, o, r) {
      function i() {
        return (
          f > 0 && s.resolve(),
          (s = r.defer()),
          f++,
          o
            .get(n.getBrainApiUrl() + e.getBackendTestUrl(), {
              timeout: s.promise,
            })
            ["finally"](function () {
              f--;
            })
        );
      }
      function a() {
        f && s.resolve();
      }
      function c() {
        return (
          d || (d = n.getSecondaryIp()),
          u && u.resolve(),
          (u = r.defer()),
          (l = d.then(function (n) {
            return t.getSystemInfo(n, u).then(function () {
              return n;
            });
          })),
          l["finally"](function () {
            l = !1;
          }),
          l
        );
      }
      var s,
        u,
        l,
        d,
        f = 0;
      return {
        backendReady: i,
        cancelPendingRequests: a,
        checkSecondBackendIp: c,
      };
    },
  ]),
  angular.module("common.loading", ["ionic"]),
  angular.module("common.loading").controller("LoadingCtrl", [
    "$timeout",
    "$window",
    "Loading",
    "CONFIG_KEYS",
    function (n, e, t, o) {
      function r() {
        ((d = c()),
          d.animate(0.1, { duration: 5e3 }),
          (s.recipeName = ""),
          (s.loadingScreenVisible = !0),
          (p = 0),
          t.getActionQueue().then(function (n) {
            var e = n.actionQueue;
            ((s.recipeName = n.name),
              (s.recipeHeader =
                "poweroff" === n.type ? "POWER OFF RECIPE" : "RUNNING RECIPE"),
              (f = e || []),
              d.stop(),
              i());
          }));
      }
      function i() {
        if (!f.length) return t.done();
        var n = f[p],
          e = (p + 1) / f.length,
          o = { duration: n.duration };
        (d.setText(n.text),
          (d.text.className = "recipe recipe-fadeIn"),
          d.animate(e, o, a));
      }
      function a() {
        ((d.text.className = "recipe recipe-fadeOut"),
          p++,
          p < f.length ? n(i, 200) : t.done());
      }
      function c() {
        var n = {
          color: l,
          strokeWidth: 3.4,
          trailColor: l,
          trailWidth: 0.4,
          text: { value: " ", className: "recipe" },
          fill: "transparent",
          easing: "easeInOut",
        };
        return new e.ProgressBar.Circle(".loading-circle", n);
      }
      var s = this,
        u = "eui" === o.APP_IDENTIFIER,
        l = u ? "#fff" : "#444";
      ((s.loadingScreenVisible = !1), (s.showRecipeName = u));
      var d, f, p;
      n(r, 0);
    },
  ]),
  angular.module("common.loading").factory("Loading", [
    "$q",
    "$ionicLoading",
    "$ionicModal",
    function (n, e, t) {
      function o(n) {
        return (
          0 !== h.length,
          (h = n.steps),
          p.resolve({ actionQueue: h, name: n.name, type: n.type }),
          m.promise
        );
      }
      function r() {
        return p.promise;
      }
      function i() {
        ((g = !0), u(), (f = d(b)));
      }
      function a() {
        ((g = !1), u(), (f = d(b)));
      }
      function c() {
        if (f) {
          var e = f.then(l);
          return ((f = void 0), e);
        }
        return n.resolve();
      }
      function s() {
        g ? c().then(m.resolve) : m && m.resolve();
      }
      function u() {
        ((h = []), (p = n.defer()), (m = n.defer()), f && f.then(l));
      }
      function l(n) {
        n.remove();
      }
      function d(n) {
        return t.fromTemplateUrl(n, v).then(function (n) {
          return (e.hide(), n.show(), n);
        });
      }
      var f,
        p,
        h,
        m,
        g,
        v = {
          animation: "loading-fade",
          backdropClickToClose: !1,
          hardwareBackButtonClose: !1,
        },
        b = "loading/loading.modal.html";
      return {
        startActionQueue: o,
        getActionQueue: r,
        showAndHideWhenDone: i,
        showAndKeepOnScreen: a,
        hide: c,
        done: s,
      };
    },
  ]),
  angular.module("recipe.core", ["commonService", "common.loading"]),
  angular.module("recipe.core").factory("RecipeService", [
    "$http",
    "$q",
    "util",
    "devicetypeService",
    "Config",
    "DateConversion",
    "recipeStep",
    "Loading",
    function (n, e, t, o, r, i, a, c) {
      function s(n) {
        ((this.key = n.key),
          (this.type = n.type),
          (this.name = n.name),
          (this.roomKey = n.roomKey),
          (this.roomName = n.roomName),
          (this.room = n.room),
          (this.scenarioKey = n.scenarioKey),
          (this.enabled = n.enabled),
          (this.trigger = n.trigger),
          (this.conditions = n.conditions || []),
          (this.steps = n.steps || []),
          (this.isHiddenRecipe = n.isHiddenRecipe),
          (this.mainDeviceType = n.mainDeviceType),
          (this.isCustom = n.isCustom),
          (this.isDirty = n.dirty),
          (this.weight = n.weight));
      }
      function u(n, e) {
        return {
          name: n.getName(),
          roomKey: n.roomKey,
          launch: n,
          poweroff: void 0,
          icon: e[n.scenarioKey],
          weight: n.weight,
        };
      }
      var l = r.getBrainApiUrl(),
        d = { duration: 750, text: "Activating Recipe" },
        f = "My recipe",
        p = "snake",
        h = /^snake$/i;
      return (
        (s.TYPE_LAUNCH = "launch"),
        (s.TYPE_POWEROFF = "poweroff"),
        (s.STEP_TYPE_ACTIONS = "action"),
        (s.STEP_TYPE_VOLUME = "volume"),
        (s.STEP_TYPE_CONTROLS = "controls"),
        (s.STEP_TYPE_DELAY = "delay"),
        (s.STEP_TYPE_EMAIL = "email"),
        (s.CONDITION_TYPE_TIME = "time"),
        (s.CONDITION_TYPE_SENSOR = "sensor"),
        (s.TRIGGER_TYPE_ICON = "icon"),
        (s.TRIGGER_TYPE_SENOSR = "sensor"),
        (s.TRIGGER_TYPE_TIME = "time"),
        (s.TRIGGER_TYPE_INTERVAL = "interval"),
        (s.build = function (n, e) {
          return ((n.room = e), new s(n));
        }),
        (s.list = function (e) {
          return n
            .get(l + "/projects/home/recipes/" + (e ? e : ""))
            .then(function (n) {
              var e = n.data;
              return e.map(s.build);
            });
        }),
        (s.get = function (e, t) {
          return n
            .get(l + "/projects/home/rooms/" + e + "/recipes/" + t)
            .then(function (n) {
              return s.build(n.data);
            });
        }),
        (s.reorder = function (t, r, i) {
          var a = this;
          return n
            .get(l + "/projects/home/rooms/" + t + "/recipes/reorder", {
              params: { from: r, to: i },
            })
            .then(function (n) {
              var t = n.data.map(s.build);
              return e.all({
                recipes: t,
                scenarioTypes: o.getDeviceIconsOfRecipes(t),
              });
            })
            .then(function (n) {
              return a.groupRecipesByScenario(n.recipes, n.scenarioTypes);
            });
        }),
        (s.groupRecipesByScenario = function (n, e) {
          var o = [],
            r = t.groupBy(n, "scenarioKey");
          return (
            angular.forEach(r, function (n, t) {
              if (n.length) {
                if ("undefined" === t) {
                  var r = n.map(u).map(function (n) {
                    return (h.test(n.name) && (n.icon = p), n);
                  });
                  return void (o = o.concat(r));
                }
                var i = u(n[0], e);
                ((i.poweroff = n[1]), o.push(i));
              }
            }),
            o.sort(t.compareByWeight)
          );
        }),
        (s.prototype._url = function (n) {
          return (
            (n = n || ""),
            (n = this.key ? this.key + n : n),
            l + "/projects/home/rooms/" + this.roomKey + "/recipes/" + n
          );
        }),
        (s.prototype.save = function () {
          return n.post(this._url(), this).then(function (n) {
            return n.data;
          });
        }),
        (s.prototype.update = function () {
          return n.put(this._url(), this);
        }),
        (s.prototype.remove = function () {
          return n["delete"](this._url());
        }),
        (s.prototype.getName = function () {
          return this.name;
        }),
        (s.prototype.getKey = function () {
          return this.key;
        }),
        (s.prototype.isEnabled = function () {
          return this.enabled;
        }),
        (s.prototype.setEnabled = function (n) {
          this.enabled = /true/.test(n);
        }),
        (s.prototype.getType = function () {
          return this.type;
        }),
        (s.prototype.removeStep = function (e) {
          return (
            this.steps.splice(e, 1),
            n["delete"](this._url("/steps/" + e))
          );
        }),
        (s.prototype.validateStepIndex = function (n) {
          if (isNaN(n) || n < 0 || n >= this.steps.length)
            throw new Error("Recipe step index out of range!");
          return n;
        }),
        (s.prototype.hasConditions = function () {
          return this.conditions.length > 0;
        }),
        (s.prototype.removeCondition = function (e) {
          var t = this;
          return n["delete"](this._url("/conditions/" + e)).then(function () {
            t.conditions.splice(e, 1);
          });
        }),
        (s.prototype.getCondition = function (n) {
          var e = this.conditions[n] || {};
          return ((e.idx = n), e);
        }),
        (s.prototype.setCondition = function (e) {
          var t = this;
          if (e)
            return e.idx === -1
              ? n.post(this._url("/conditions"), e).then(function () {
                  t.conditions.push(e);
                })
              : n.put(this._url("/conditions/" + e.idx), e).then(function () {
                  t.conditions[e.idx] = e;
                });
        }),
        (s.prototype.getStep = function (n) {
          var e = this.steps[n] || {};
          return ((e.idx = n), e);
        }),
        (s.prototype.getClientSteps = function () {
          return this.steps.filter(function (n) {
            return n.client === !0;
          });
        }),
        (s.prototype.getSteps = s.prototype.getClientSteps),
        (s.prototype.getControlsStep = function () {
          return this.steps.find(function (n) {
            return n.type === s.STEP_TYPE_CONTROLS;
          });
        }),
        (s.prototype.hasSteps = function () {
          return this.steps.length > 0;
        }),
        (s.prototype.setStep = function (e) {
          var t = this;
          if (e)
            return e.idx === -1
              ? n.post(this._url("/steps"), e).then(function (n) {
                  return (t.steps.push(e), n);
                })
              : n.put(this._url("/steps/" + e.idx), e).then(function (n) {
                  return ((t.steps[e.idx] = e), n);
                });
        }),
        (s.prototype.reorderStep = function (e, t) {
          this.validateStepIndex(t);
          var o = this.getStep(this.validateStepIndex(e));
          return (
            this.steps.splice(e, 1),
            this.steps.splice(t, 0, o),
            n.put(this._url("/steps/reorder"), { from: e, to: t })
          );
        }),
        (s.prototype.executeStep = function (e) {
          return n.get(this._url("/steps/" + e + "/execute"));
        }),
        (s.prototype._executeOnServer = function () {
          return n
            .get(this._url("/execute"))
            .then(function (n) {
              var e = n.data;
              return (
                (e.steps && 0 !== e.steps.length) || (e.steps = [d]),
                c.startActionQueue(e)
              );
            })
            ["catch"](function (n) {
              return n.data
                ? e.reject(new Error(n.data.message || ""))
                : e.reject(n);
            });
        }),
        (s.prototype.execute = function (n) {
          function t(t) {
            return e(function (e, o) {
              try {
                var i = a(t).execute(n, r);
                e(i);
              } catch (c) {
                o(c);
              }
            });
          }
          c.showAndKeepOnScreen();
          var o = this.getClientSteps(),
            r = this.key;
          return this._executeOnServer()
            .then(function () {
              if (n) {
                var r = o.map(t);
                return e.all(r);
              }
            })
            ["finally"](function () {
              return c.hide();
            });
        }),
        (s.prototype.getScenario = function () {
          return this.room && this.scenarioKey
            ? this.room.getScenarioByKey(this.scenarioKey)
            : null;
        }),
        (s.prototype.getScenarioParams = function () {
          var n = this.getContextScenarioKey();
          return {
            project: r.getDefaultProjectName(),
            roomKey: this.roomKey,
            scenarioKey: n,
          };
        }),
        (s.prototype.getContextScenarioKey = function () {
          var n = this.getControlsStep();
          return n ? n.scenarioKey : this.scenarioKey;
        }),
        (s.prototype.isEmpty = function () {
          return !this.steps || 0 === this.steps.length;
        }),
        (s.prototype.isVisible = function () {
          return (
            this.enabled &&
            this.type === s.TYPE_LAUNCH &&
            this.getTriggerType() === s.TRIGGER_TYPE_ICON &&
            !(h.test(this.name) && this.isCustom)
          );
        }),
        (s.prototype.getTrigger = function () {
          if (!this.trigger) return {};
          if (
            (this.trigger.labelSuffix ||
              (this.trigger.labelSuffix = this.trigger.label),
            "time" === this.trigger.type)
          ) {
            var n = i.utcToLocalTime(
              this.trigger.time.hour,
              this.trigger.time.minute,
            );
            this.trigger.label = "At " + n + " " + this.trigger.labelSuffix;
          }
          return this.trigger;
        }),
        (s.prototype.getTriggerType = function () {
          return this.trigger ? this.trigger.type : void 0;
        }),
        (s.prototype.setTrigger = function (e) {
          var t = this;
          if (e)
            return n.put(this._url("/trigger"), e).then(function (n) {
              t.trigger = n.data;
            });
        }),
        (s.prototype.isNew = function () {
          return this.name === f && !this.enabled && this.isCustom;
        }),
        s
      );
    },
  ]),
  angular.module("recipe.core").factory("recipeStep", [
    "gettextCatalog",
    function (n) {
      function e(n) {
        ((this.client = n.client), (this.label = n.label), this.validate());
      }
      function t(n) {
        ((this.type = t.TYPE),
          (this.scenarioKey = n.scenarioKey),
          (this.scenarioName = n.scenarioName),
          e.call(this, n));
      }
      ((e.prototype.validate = function () {
        if (!this.client) throw new Error("not a client recipe step!");
        if (!this.type) throw new Error("validation failed: no recipe type");
      }),
        (e.prototype.getType = function () {
          return this.type;
        }),
        (e.prototype.execute = function () {
          throw new Error("to be implemented");
        }),
        (t.TYPE = "controls"),
        (t.prototype = Object.create(e.prototype, {
          execute: {
            value: function (e, t) {
              var o = e.getScenarioByKey(this.scenarioKey);
              if (!o)
                throw new Error(
                  n.getString("Invalid device in show controls step."),
                );
              return o.open(t);
            },
          },
        })));
      var o = {};
      o[t.TYPE] = t;
      var r = function i(n) {
        var e = n.type;
        if (!e) throw new Error("No recipe step type given");
        var i = o[e];
        if (!i) throw new Error("No such recipe step type: " + e);
        return new i(n);
      };
      return ((r.TYPE_CONTROLS = t.TYPE), r);
    },
  ]),
  angular
    .module("commonService", [
      "ui.router",
      "gettext",
      "ionic",
      "btford.socket-io",
    ])
    .constant("Rx", window.Rx),
  angular.module("commonController", ["commonService"]),
  angular.module("introApp").controller("InfoScreenCtrl", [
    "Config",
    "Transit",
    "$ionicLoading",
    function (n, e, t) {
      function o() {
        n.isCordova()
          ? e.iui("account/welcome?" + Date.now())
          : n.isDebug() && e.toLiveReload();
      }
      var r = this;
      (e.hideNext(),
        e.hideBack(),
        e.disableNextTransition(),
        (r.home = e.eui),
        (r.web = e.neeoWeb),
        (r.support = e.neeoSupport),
        (r.setup = o),
        t.show(),
        n.loadBrainUrls()["finally"](t.hide));
    },
  ]),
  angular.module("introApp").controller("StartCtrl", [
    "$state",
    "$q",
    "Config",
    "HealthConnection",
    "Transit",
    "$ionicLoading",
    function (n, e, t, o, r, i) {
      function a() {
        return t.isCordova()
          ? void (
              o.isHealthy() &&
              (i.show(),
              t
                .loadBrainUrls()
                .then(c)
                ["catch"](function (e) {
                  e && e.hasNoSavedBrain
                    ? n.go("welcome")
                    : n.go("brainlookup", { autoconnect: !0 });
                })
                ["finally"](i.hide))
            )
          : void n.go("welcome");
      }
      function c() {
        return t.getBrainProjectConfiguredStatus().then(function (e) {
          e
            ? r.eui("home/rooms?" + Date.now())
            : n.go("infobrainnotconfigured");
        });
      }
      (r.hideNext(), r.hideBack(), r.disableNextTransition(), a());
    },
  ]),
  angular.module("introApp").factory("IonicService", [
    "$rootScope",
    "$cordovaStatusbar",
    "$cordovaKeyboard",
    "$ionicPlatform",
    "$window",
    "Transit",
    "Config",
    function (n, e, t, o, r, i, a) {
      function c() {
        if (a.isCordova()) {
          var n = m.isIOS();
          (t.disableScroll(!0),
            e.show(),
            e.overlaysWebView(n),
            e.style(0),
            o.registerBackButtonAction(s, p),
            o.on("pause", l),
            o.on("resume", d));
        }
      }
      function s() {
        var n = i.hasPreviousState() && "start" !== i.getPreviousStateName();
        n ? i.onBack() : u();
      }
      function u() {
        r.navigator.app.minimizeApp(h);
      }
      function l() {
        f = Date.now();
      }
      function d() {
        var e = Date.now();
        Math.floor((e - f) / 1e3);
        n.$broadcast("app:resume");
      }
      var f = Date.now(),
        p = 100,
        h = !0,
        m = r.ionic.Platform;
      return { init: c };
    },
  ]),
  angular.module("commonController").controller("ErrorCtrl", [
    "$scope",
    "$stateParams",
    "$ionicLoading",
    "Transit",
    function (n, e, t, o) {
      (o.hideBack(),
        o.hideNext(),
        t.hide(),
        (n.msg = e.msg),
        (n.debug = e.debug),
        (n.eui = o.eui),
        (n.iui = o.iui));
    },
  ]),
  angular.module("commonController").controller("TransitCtrl", [
    "$scope",
    "Transit",
    function (n, e) {
      function t() {
        ((n.nextLabel = e.nextLabel),
          (n.backVisible = e.backVisible),
          (n.backEnabled = e.backEnabled),
          (n.nextVisible = e.nextVisible),
          (n.nextEnabled = e.nextEnabled),
          (n.onBack = function () {
            e.onBack();
          }),
          (n.onNext = function () {
            e.onNext();
          }));
      }
      n.$on("transit:navbarChanged", t);
    },
  ]),
  angular.module("commonService").filter("brainImageDefaultFavoriteImage", [
    "Config",
    function (n) {
      return function (e) {
        return angular.isString(e) && e.length > 0
          ? n.getBrainImageUrl(e)
          : n.getBrainDefaultFavoriteImageUrl();
      };
    },
  ]),
  angular.module("commonService").filter("brainImageDefaultSonosImage", [
    "Config",
    function (n) {
      return function (e) {
        return angular.isString(e) && e.length > 0
          ? n.getBrainImageUrl(e)
          : n.getBrainDefaultSonosImageUrl();
      };
    },
  ]),
  angular.module("commonService").filter("capitalize", function () {
    return function (n) {
      var e = n
        ? n.replace(/\w\S*/g, function (n) {
            return n.charAt(0).toUpperCase() + n.substr(1).toLowerCase();
          })
        : "";
      return (e = e
        .replace(/hdmi/i, "HDMI")
        .replace(/cd/i, "CD")
        .replace(/avr/i, "AVR")
        .replace(/av/i, "AV")
        .replace(/dvd/i, "DVD")
        .replace(/sat/i, "SAT")
        .replace(/aux/i, "AUX")
        .replace(/ipod/i, "iPod")
        .replace(/tv/i, "TV")
        .replace(/yuv/i, "YUV")
        .replace(/xlr/i, "XLR")
        .replace(/dvi/i, "DVI"));
    };
  }),
  angular.module("commonService").factory("BrainChecker", [
    "$q",
    "$http",
    "Rx",
    "CONFIG_KEYS",
    function (n, e, t, o) {
      function r(e, t) {
        var o = e.filter(function (n) {
          return !y.test(n);
        });
        return o.length < 1
          ? n.reject(new Error("No valid Ips"))
          : i(o[0], t)
              .then(function () {
                return o;
              })
              ["catch"](function (e) {
                return o.length < 2
                  ? n.reject(e)
                  : i(o[1], t).then(function () {
                      return [o[1], o[0]];
                    });
              });
      }
      function i(n, t) {
        return ((t = t || w), e.get(l(n), { timeout: t }));
      }
      function a(n, e) {
        return t.Observable.fromPromise(i(n, e));
      }
      function c(n, t) {
        return (
          (t = t || w),
          e.get(d(n), { timeout: t }).then(function (n) {
            return v + n.data.controllerRoomName;
          })
        );
      }
      function s(n, e) {
        return t.Observable.fromPromise(c(n, e));
      }
      function u(n) {
        var t = "?" + Date.now(),
          r = n ? p(n) : o.brainFrontendUrl;
        return e.get(r + g + t, { timeout: w });
      }
      function l(n) {
        return f(n) + o.healthTestUrl;
      }
      function d(n) {
        return f(n) + m;
      }
      function f(n) {
        return ((n = h(n)), o.protocol + n + ":" + o.brainBackendPort);
      }
      function p(n) {
        return ((n = h(n)), o.protocol + n + ":" + o.brainFrontendPort);
      }
      function h(n) {
        var e = !b.test(n);
        return e ? "[" + n + "]" : n;
      }
      var m = "/projects/home/controllerRoomName",
        g = "/eui/index.html",
        v = "NEEO ",
        b =
          /((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/,
        y = /^fe80::/,
        w = o.HTTP_REQUEST_TIMEOUT;
      return {
        sortWorkingIpFirst: r,
        getSystemInfo: i,
        getSystemInfoStream: a,
        getName: c,
        getNameStream: s,
        warmUpFrontend: u,
      };
    },
  ]),
  angular.module("commonService").factory("LocalStorage", [
    "$window",
    function (n) {
      return {
        setItem: function (e, t) {
          n.localStorage.setItem(e, t);
        },
        getItem: function (e, t) {
          return n.localStorage.getItem(e) || t;
        },
        setObject: function (e, t) {
          n.localStorage.setItem(e, JSON.stringify(t));
        },
        getObject: function (e) {
          return JSON.parse(n.localStorage.getItem(e) || "{}");
        },
        deleteKey: function (e) {
          n.localStorage.removeItem(e);
        },
        clear: function () {
          n.localStorage.clear();
        },
      };
    },
  ]),
  angular.module("commonService").factory("animate", [
    "Easing",
    "$window",
    function (n, e) {
      return function (t, o, r, i) {
        function a(t, o, c, s) {
          return function () {
            (o > t
              ? i(Math.round(t + n.easeOutQuad(s * c) * (o - t)), s)
              : i(Math.round(t - n.easeOutQuad(s * c) * (t - o)), s),
              s <= r && e.requestAnimationFrame(a(t, o, c, s + 1)));
          };
        }
        e.requestAnimationFrame(a(parseInt(t), parseInt(o), 1 / r, 0));
      };
    },
  ]),
  angular.module("commonService").factory("AppCache", [
    "$log",
    function (n) {
      return {
        clear: function () {
          document.addEventListener(
            "deviceready",
            function () {
              window.cache.clear(
                function () {},
                function () {},
              );
            },
            !1,
          );
        },
      };
    },
  ]),
  angular.module("commonService").factory("Config", [
    "$window",
    "$http",
    "$q",
    "JsonFiler",
    "BrainChecker",
    "LocalStorage",
    "CONFIG_KEYS",
    function (n, e, t, o, r, i, a) {
      function c() {
        return (
          angular.isDefined(F) ||
            (F = w()
              .then(function (n) {
                B(n);
              })
              ["catch"](function (n) {
                B(!1);
              })
              ["finally"](function () {
                D = !O();
              })),
          F
        );
      }
      function s() {
        return (angular.isDefined(K) || (K = u().then(h).then(m).then(g)), K);
      }
      function u() {
        return o
          .read("current.brain.connect")
          .then(function (n) {
            return n.service;
          })
          .then(p)
          ["catch"](function (n) {
            return ((n.hasNoSavedBrain = !0), t.reject(n));
          });
      }
      function l(n) {
        return p(n).then(m).then(g);
      }
      function d(e) {
        var t = n.location.hostname;
        return u()
          .then(function (n) {
            return ((n.addresses = [t, e]), n);
          })
          .then(g);
      }
      function f() {
        return t(function (e, t) {
          L.isCordova()
            ? n.WifiWizard.getCurrentSSID(function (n) {
                e(n);
              }, t)
            : t(new Error("Cordova missing."));
        });
      }
      function p(n) {
        var e =
          angular.isUndefined(n) ||
          angular.isUndefined(n.addresses) ||
          0 === n.addresses.length;
        return e ? t.reject(new Error("Saved Brain has no IP")) : t.resolve(n);
      }
      function h(n) {
        var e = 1 === n.addresses.length;
        return e
          ? n
          : r
              .sortWorkingIpFirst(n.addresses, a.HTTP_REQUEST_TIMEOUT)
              .then(function (e) {
                return ((n.addresses = e), n);
              });
      }
      function m(n) {
        var e = a.protocol + n.addresses[0];
        return (
          (a.brainBackendUrl = e + ":" + a.brainBackendPort),
          (a.brainFrontendUrl = e + ":" + a.brainFrontendPort),
          n
        );
      }
      function g(n) {
        return o
          .write({ service: n }, "current.brain.connect")
          .then(function (n) {
            return L.getBrainProjectConfiguredStatus();
          })
          ["catch"](function (n) {
            return t.reject(n);
          });
      }
      function v() {
        return u().then(function (n) {
          var e = n.addresses;
          return 2 !== e.length
            ? t.reject(new Error("Brain has no secondary IP"))
            : e[1];
        });
      }
      function b() {
        return !!n.cordova;
      }
      function y() {
        return !!a.DEBUG;
      }
      function w() {
        if (k()) return t.resolve(!1);
        var n = "?" + Date.now(),
          o = S() + U + n,
          r = { timeout: a.HTTP_REQUEST_TIMEOUT };
        return e.get(o, r).then(function (n) {
          return n.data.configured;
        });
      }
      function k() {
        return S().indexOf("http") === -1;
      }
      function E() {
        return R;
      }
      function S() {
        var n;
        return (
          (n = a.API_URL ? a.API_URL : a.brainBackendUrl),
          n + "/" + a.API_VERSION
        );
      }
      function C() {
        return a.brainFrontendUrl;
      }
      function N() {
        return a.cloudDiscoveryUrl;
      }
      function I() {
        return P(a.ENABLE_HEALTH_MONITOR);
      }
      function $(n) {
        return n && "" !== n.trim()
          ? 0 === n.indexOf(S())
            ? n
            : S() + a.IMAGECACHE_URL + encodeURIComponent(n)
          : S() + a.IMAGECACHE_URL;
      }
      function x() {
        return S() + a.DEFAULT_FAVORITE_URL;
      }
      function T() {
        return $("/images/sonos-nocover.jpg");
      }
      function B(n) {
        return (angular.isDefined(n) && i.setItem(a.projectConfigured, n), O());
      }
      function O() {
        return P(i.getItem(a.projectConfigured));
      }
      function _() {
        return D;
      }
      function A() {
        D = !O();
      }
      function P(n) {
        return /^true$/i.test(n);
      }
      var R = "home",
        U = "/projects/" + R + "/configured",
        D = !1,
        K = void 0,
        F = void 0,
        L = {
          init: c,
          loadBrainUrls: s,
          setBrainUrls: l,
          setProjectConfiguredAs: B,
          saveSecondaryIp: d,
          finishFirstTimeUserExperience: A,
          getBrainApiUrl: S,
          getBrainDefaultFavoriteImageUrl: x,
          getBrainDefaultSonosImageUrl: T,
          getBrainImageUrl: $,
          getBrainProjectConfiguredStatus: w,
          getFrontendUrl: C,
          getDeviceSSID: f,
          getDefaultProjectName: E,
          getDiscoveryUrl: N,
          getSecondaryIp: v,
          isCordova: b,
          isBrainApiUrlInvalid: k,
          isDebug: y,
          isFirstTimeUserExperience: _,
          isHealthMonitorEnabled: I,
          isProjectConfigured: O,
        };
      return L;
    },
  ]),
  angular.module("commonService").factory("DateConversion", function () {
    function n(n, e) {
      var t = moment();
      return moment(
        moment.utc([t.year(), t.month(), t.date(), n || 0, e || 0, 0]).toDate(),
      ).format("HH:mm");
    }
    return { utcToLocalTime: n };
  }),
  angular.module("commonService").service("debounce", [
    "$timeout",
    function (n) {
      return function (e, t, o) {
        function r() {
          ((r.called = !1), (c = this), (a = arguments));
          var u = function () {
              ((i = null), o || ((s = e.apply(c, a)), (r.called = !0)));
            },
            l = o && !i;
          return (
            i && n.cancel(i),
            (i = n(u, t)),
            l && ((s = e.apply(c, a)), (r.called = !0)),
            s
          );
        }
        var i = void 0,
          a = void 0,
          c = void 0,
          s = void 0;
        return (
          (r.cancel = function () {
            (n.cancel(i), (i = null));
          }),
          (r.called = !0),
          r
        );
      };
    },
  ]),
  angular.module("commonService").factory("DeviceCapability", function () {
    function n(n) {
      return function (e) {
        return (
          !!e &&
          n.some(function (n) {
            return e.includes(n);
          })
        );
      };
    }
    return {
      resetWiringAvailable: n(["neeo.feature.wiring-resettable"]),
      inputsNotWorking: n([
        "input-commands-not-working",
        "neeo.device.no-wiring-inputs",
      ]),
      hasPowerOnOffMissing: n(["macro-onoff-missing"]),
      isPhantomDevice: n(["neeo.device.phantom"]),
      isDuiDevice: n(["neeo.device.details.source-duiro"]),
      showAdditionalSetupScreens: n([
        "neeo.device.details.source-duiro",
        "neeo.device.type.tv",
      ]),
      supportsSmartener: n(["neeo.device.supports-smartener"]),
      isSmartifiedDevice: n(["neeo.device.smartified-power-mode"]),
      needsUpdate: n(["neeo.device.needs-spec-update"]),
      isFullscreen: n(["neeo.feature.player-fullscreen"]),
    };
  }),
  angular.module("commonService").factory("devicetypeService", [
    "$http",
    "Config",
    function (n, e) {
      function t(e) {
        var t = e.map(function (n) {
            return n.scenarioKey;
          }),
          r = { scenariokeys: t.join(",") };
        return n.post(o + "/projects/home/getdeviceicon", r).then(function (n) {
          return n.data;
        });
      }
      var o = e.getBrainApiUrl();
      return { getDeviceIconsOfRecipes: t };
    },
  ]),
  angular.module("commonService").factory("dialogService", [
    "$ionicActionSheet",
    "$ionicPopup",
    "$rootScope",
    "gettextCatalog",
    function (n, e, t, o) {
      function r(e, t, r) {
        var i = void 0,
          c = void 0;
        r &&
          ((i = r.text),
          (c = function () {
            return (r.onClick(), a);
          }));
        var s = n.show({
          buttons: t,
          titleText: e,
          destructiveText: i,
          cancelText: o.getString("Cancel"),
          cancel: function () {
            return s();
          },
          destructiveButtonClicked: c,
          buttonClicked: function (n) {
            return (t[n].onClick(), a);
          },
        });
      }
      function i(n) {
        var r =
            arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
          i = t.$new();
        i.data = { value: r };
        var a =
            '<ion-input class="item item-input"><input ng-model="data.value" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" clear-input focus></ion-input>',
          c = [
            { text: o.getString("Cancel") },
            {
              text: o.getString("Save"),
              type: "button-positive",
              onTap: function (n) {
                var e = !i.data.value;
                return e ? void n.preventDefault() : i.data.value;
              },
            },
          ];
        return e.show({
          template: a,
          title: n,
          scope: i,
          cssClass: "custom-ionic-popup",
          buttons: c,
        });
      }
      var a = !0;
      return { showActionSheet: r, promptRequiredValue: i };
    },
  ]),
  angular.module("commonService").factory("Easing", function () {
    return {
      linear: function (n) {
        return n;
      },
      easeInQuad: function (n) {
        return n * n;
      },
      easeOutQuad: function (n) {
        return n * (2 - n);
      },
      easeInOutQuad: function (n) {
        return n < 0.5 ? 2 * n * n : -1 + (4 - 2 * n) * n;
      },
      easeInCubic: function (n) {
        return n * n * n;
      },
      easeOutCubic: function (n) {
        return --n * n * n + 1;
      },
      easeInOutCubic: function (n) {
        return n < 0.5
          ? 4 * n * n * n
          : (n - 1) * (2 * n - 2) * (2 * n - 2) + 1;
      },
      easeInQuart: function (n) {
        return n * n * n * n;
      },
      easeOutQuart: function (n) {
        return 1 - --n * n * n * n;
      },
      easeInOutQuart: function (n) {
        return n < 0.5 ? 8 * n * n * n * n : 1 - 8 * --n * n * n * n;
      },
      easeInQuint: function (n) {
        return n * n * n * n * n;
      },
      easeOutQuint: function (n) {
        return 1 + --n * n * n * n * n;
      },
      easeInOutQuint: function (n) {
        return n < 0.5 ? 16 * n * n * n * n * n : 1 + 16 * --n * n * n * n * n;
      },
    };
  }),
  angular.module("commonService").factory("ErrorInterceptor", [
    "$q",
    "$location",
    function (n, e) {
      function t(n) {
        i = n;
      }
      function o(e) {
        return e || n.when(e);
      }
      function r(t) {
        var o =
            "Error connecting to NEEO Brain. Try to restart the Mobile App and the NEEO Brain.",
          r = !i,
          p = !i;
        switch (t.status) {
          case a:
            o =
              "A firmware update is in progress, wait until the NEEO Brain stops blinking and press OK";
            break;
          case c:
            var h = t.data || {},
              m = h.error && h.error.detail ? h.error.detail : "";
            ((o = h.message + m), (r = !1));
            break;
          case s:
            ((o =
              "File or endpoint not available (404). Try to restart the Mobile App and the NEEO Brain."),
              (r = !1));
            break;
          case u:
          case l:
            ((o =
              "Access denied (401/403). Try to restart the Mobile App and the NEEO Brain."),
              (r = !1));
            break;
          case d:
            ((r = !1), (p = !1));
            break;
          case f:
            ((r = !1), (p = !1));
        }
        return (r && e.url("/error/" + encodeURIComponent(o)), n.reject(t));
      }
      var i = !1,
        a = 503,
        c = 500,
        s = 404,
        u = 403,
        l = 401,
        d = 0,
        f = -1;
      return { skip: t, response: o, responseError: r };
    },
  ]),
  angular.module("commonService").factory("focusElement", [
    "$timeout",
    "$window",
    function (n, e) {
      function t(t) {
        n(function () {
          var n = e.document.getElementsByClassName(t)[0];
          n && n.focus();
        });
      }
      return { byClassName: t };
    },
  ]),
  angular.module("commonService").factory("JsonFiler", [
    "$q",
    "$cordovaFile",
    "$window",
    function (n, e, t) {
      function o(o, r) {
        return t.cordova
          ? e
              .writeFile(i(), r + ".json", angular.toJson(o), a)
              ["catch"](function (e) {
                return n.reject(e);
              })
          : n.reject(new Error("Cordova is not defined"));
      }
      function r(o) {
        return t.cordova
          ? e
              .readAsText(i(), o + ".json")
              .then(function (n) {
                var e = angular.fromJson(n);
                return e;
              })
              ["catch"](function (e) {
                return n.reject(e);
              })
          : n.reject(new Error("Cordova is not defined"));
      }
      function i() {
        return t.cordova.file.dataDirectory;
      }
      var a = !0;
      return { write: o, read: r };
    },
  ]),
  angular.module("commonService").factory("logErrorToBrain", [
    "$injector",
    function (n) {
      function e(e) {
        return (
          (t = t || n.get("$http")),
          (o = o || n.get("Config")),
          t
            .post(o.getBrainApiUrl() + "/guilogger/exceptions", e)
            ["catch"](angular.noop)
        );
      }
      var t = void 0,
        o = void 0;
      return e;
    },
  ]));
var _typeof =
  "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
    ? function (n) {
        return typeof n;
      }
    : function (n) {
        return n &&
          "function" == typeof Symbol &&
          n.constructor === Symbol &&
          n !== Symbol.prototype
          ? "symbol"
          : typeof n;
      };
(angular.module("commonService").factory("naturalSort", function () {
  return function n(e, t) {
    var o,
      r,
      i =
        /(^([+\-]?(?:\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[\da-fA-F]+$|\d+)/g,
      a = /^\s+|\s+$/g,
      c = /\s+/g,
      s =
        /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
      u = /^0x[0-9a-f]+$/i,
      l = /^0/,
      d = function (e) {
        return ((n.insensitive && ("" + e).toLowerCase()) || "" + e).replace(
          a,
          "",
        );
      },
      f = d(e) || "",
      p = d(t) || "",
      h = f
        .replace(i, "\0$1\0")
        .replace(/\0$/, "")
        .replace(/^\0/, "")
        .split("\0"),
      m = p
        .replace(i, "\0$1\0")
        .replace(/\0$/, "")
        .replace(/^\0/, "")
        .split("\0"),
      g = parseInt(f.match(u), 16) || (1 !== h.length && Date.parse(f)),
      v =
        parseInt(p.match(u), 16) || (g && p.match(s) && Date.parse(p)) || null,
      b = function (n, e) {
        return (
          ((!n.match(l) || 1 == e) && parseFloat(n)) ||
          n.replace(c, " ").replace(a, "") ||
          0
        );
      };
    if (v) {
      if (g < v) return -1;
      if (g > v) return 1;
    }
    for (
      var y = 0, w = h.length, k = m.length, E = Math.max(w, k);
      y < E;
      y++
    ) {
      if (
        ("undefined" == typeof h[y] && (h[y] = String(-9007199254740991)),
        "undefined" == typeof m[y] && (m[y] = String(-9007199254740991)),
        (o = b(h[y], w)),
        (r = b(m[y], k)),
        isNaN(o) !== isNaN(r))
      )
        return isNaN(o) ? 1 : -1;
      if (
        (("undefined" == typeof o ? "undefined" : _typeof(o)) !==
          ("undefined" == typeof r ? "undefined" : _typeof(r)) &&
          ((o += ""), (r += "")),
        o < r)
      )
        return -1;
      if (o > r) return 1;
    }
    return 0;
  };
}),
  angular.module("commonService").factory("timestampMarker", [
    function () {
      var n = {
        request: function (n) {
          return ((n.requestTimestamp = new Date().getTime()), n);
        },
        response: function (n) {
          return ((n.config.responseTimestamp = new Date().getTime()), n);
        },
      };
      return n;
    },
  ]),
  angular.module("commonService").config([
    "$httpProvider",
    function (n) {
      n.interceptors.push("timestampMarker");
    },
  ]),
  angular.module("commonService").factory("retryActionWithDelay", [
    "$q",
    "$timeout",
    function (n, e) {
      function t(o, r, i) {
        return o()["catch"](function (a) {
          return r <= 0
            ? n.reject(a)
            : e(function () {
                return t(o, r - 1);
              }, i);
        });
      }
      return t;
    },
  ]),
  angular.module("commonService").factory("RoomIconService", function () {
    function n(n) {
      return "beer" === n
        ? { class: "icon-beer" }
        : t.find(function (e) {
            return e.key === n;
          });
    }
    var e = { key: "neeo.icon.room.default" },
      t = [
        e,
        { key: "neeo.icon.room.living-room", class: "icon-living-room" },
        { key: "neeo.icon.room.kids-bedroom", class: "icon-kids-bedroom" },
        { key: "neeo.icon.room.bedroom", class: "icon-bedroom" },
        { key: "neeo.icon.room.kitchen", class: "icon-kitchen" },
        { key: "neeo.icon.room.office", class: "icon-office" },
        { key: "neeo.icon.room.basement", class: "icon-basement" },
        { key: "neeo.icon.room.garden", class: "icon-garden" },
        { key: "neeo.icon.room.garage", class: "icon-garage" },
        { key: "neeo.icon.room.cinema", class: "icon-cinema" },
        { key: "neeo.icon.room.library", class: "icon-library" },
        { key: "neeo.icon.room.family-room", class: "icon-family-room" },
        { key: "neeo.icon.room.bonus-room", class: "icon-bonus-room" },
        { key: "neeo.icon.room.bathroom", class: "icon-bathroom" },
        { key: "neeo.icon.room.house", class: "icon-house" },
      ];
    return {
      getAll: function () {
        return t;
      },
      getByKey: function (t) {
        return n(t) || e;
      },
      getForRoom: function (t) {
        return n(t.icon) || e;
      },
    };
  }),
  angular.module("commonService").factory("socketPromise", [
    "$q",
    "$http",
    "$window",
    "socketFactory",
    "CONFIG_KEYS",
    "$rootScope",
    function (n, e, t, o, r, i) {
      if ("intro" === r.APP_IDENTIFIER) return n.reject();
      var a = n.defer();
      !(function (n, e, t, o) {
        var r,
          i = n.getElementsByTagName(e)[0],
          c = !1;
        n.getElementById(t) ||
          ((r = n.createElement(e)),
          (r.id = t),
          (r.src = o),
          (r.onload = r.onreadystatechange =
            function () {
              c ||
                (this.readyState && "complete" !== this.readyState) ||
                ((c = !0), a.resolve());
            }),
          i.parentNode.insertBefore(r, i));
      })(
        document,
        "script",
        "socketio-client",
        r.brainBackendUrl + "/socket.io/socket.io.js",
      );
      var c = a.promise.then(function () {
        var n = o({ ioSocket: io.connect(r.brainBackendUrl) });
        return (
          n.on("disconnect", function () {
            i.$broadcast("socket-status-disconnect");
          }),
          n
        );
      });
      return c;
    },
  ]),
  angular.module("commonService").factory("systeminfo", [
    "$http",
    "Config",
    "$cordovaAppVersion",
    "$q",
    "$window",
    function (n, e, t, o, r) {
      function i() {}
      function a(e) {
        return n.get(c + e).then(function (n) {
          return n.data;
        });
      }
      var c = e.getBrainApiUrl();
      return (
        (i.prototype.mobileVersion = function () {
          return e.isCordova()
            ? t.getVersionNumber()["catch"](function () {
                return "unknown";
              })
            : o.resolve("unknown");
        }),
        (i.prototype.getDeviceInfo = function () {
          if (e.isCordova()) return r.device;
        }),
        (i.prototype.brain = function () {
          return a("/systeminfo");
        }),
        (i.prototype.NEEOCloud = function () {
          return a("/systeminfo/cloudInfo");
        }),
        (i.prototype.lanAddress = function () {
          return a("/systeminfo/lan-address");
        }),
        (i.prototype.identifyBrain = function () {
          return a("/systeminfo/identbrain");
        }),
        (i.prototype.projectLastChanged = function () {
          return a("/projects/home/lastchange");
        }),
        (i.prototype.licenseFile = function () {
          var t = e.getFrontendUrl();
          return n
            .get(t + "/license/LICENSE.txt")
            .then(function (n) {
              return n.data;
            })
            ["catch"](function () {
              return { status: "internal error" };
            });
        }),
        new i()
      );
    },
  ]),
  angular.module("commonService").factory("TimeoutInterceptor", [
    "CONFIG_KEYS",
    function (n) {
      return {
        request: function (e) {
          return ((e.timeout = e.timeout || n.HTTP_REQUEST_TIMEOUT), e);
        },
      };
    },
  ]),
  angular.module("commonService").factory("Transit", [
    "$rootScope",
    "$state",
    "$window",
    "$timeout",
    "$q",
    "$ionicViewSwitcher",
    "$ionicHistory",
    "gettextCatalog",
    "CONFIG_KEYS",
    "LocalStorage",
    "BrainChecker",
    "transitRouter",
    function (n, e, t, o, r, i, a, c, s, u, l, d) {
      function f() {
        (a.clearCache(), a.clearHistory());
      }
      function p() {
        var n = u.getObject("currentContextCaller");
        return (
          Object.keys(n).length > 0 && {
            stateName: n.stateName,
            stateParams: n.stateParams,
            callerUrl: n.callerUrl,
          }
        );
      }
      function h() {
        var n = u.getObject("currentContextRoot");
        return (
          Object.keys(n).length > 0 && {
            stateName: n.stateName,
            stateParams: n.stateParams,
            url: n.url,
          }
        );
      }
      function m(n, o, r) {
        var i = t.location,
          a = i.protocol + "//" + n + ":" + i.port + i.pathname,
          c = o && r ? e.href(o, r) : i.hash,
          s = a + $ + c;
        return E(n).then(function () {
          return g(s);
        });
      }
      function g(n) {
        return (
          v(n),
          o(function () {
            return r.reject(new Error("Ip Change Failed"));
          }, I)
        );
      }
      function v(n) {
        d.openUrl(n);
      }
      function b() {
        var n = a.backView();
        if (n && n.stateName) return n.stateName;
      }
      function y(n) {
        var t = null === a.backView();
        return t
          ? e.go("settings.list")
          : ((angular.isNumber(n) && isFinite(n)) || (n = -1),
            void a.goBack(n));
      }
      function w() {
        (u.deleteKey("currentContextRoot"),
          u.deleteKey("currentContextCaller"));
      }
      function k() {
        n.$broadcast("transit:navbarChanged");
      }
      function E(n) {
        var e = l.warmUpFrontend(n).then(function () {
          S();
        });
        return (e["catch"](function () {}), e);
      }
      function S() {
        n.$broadcast("initial-loader-show");
      }
      function C(n) {
        v(s.brainFrontendUrl + n);
      }
      function N(n) {
        t.open(n, "_system", "location=yes");
      }
      var I = 1e4,
        $ = "?" + Date.now(),
        x = {
          nextLabel: "Next",
          backVisible: !0,
          nextVisible: !0,
          backEnabled: !0,
          nextEnabled: !0,
          bothVisible: !0,
          setNextLabel: function (n) {
            ((this.nextLabel = c.getString(n)), k());
          },
          showNext: function () {
            ((this.nextVisible = !0), k());
          },
          hideNext: function () {
            ((this.nextVisible = !1), k());
          },
          showBack: function () {
            ((this.backVisible = !0), k());
          },
          hideBack: function () {
            ((this.backVisible = !1), k());
          },
          disableNext: function () {
            ((this.nextEnabled = !1), k());
          },
          enableNext: function () {
            ((this.nextEnabled = !0), k());
          },
          disableBack: function () {
            ((this.backEnabled = !1), k());
          },
          enableBack: function () {
            ((this.backEnabled = !0), k());
          },
          showAndEnableNext: function () {
            ((this.nextVisible = !0), (this.nextEnabled = !0), k());
          },
          showAndEnableBack: function () {
            ((this.backVisible = !0), (this.backEnabled = !0), k());
          },
          goBack: null,
          goNext: null,
          onBack: function () {
            this.backEnabled &&
              (angular.isFunction(this.goBack)
                ? (i.nextDirection("back"), this.goBack())
                : (i.nextDirection("back"), y()));
          },
          onNext: function () {
            angular.isFunction(this.goNext)
              ? this.goNext()
              : (i.nextDirection("forward"), y());
          },
          onBackGoTo: function (n) {
            this.goBack = function () {
              return e.go(n, e.params);
            };
          },
          onNextGoTo: function (n) {
            this.goNext = function () {
              return e.go(n, e.params);
            };
          },
          hasPreviousState: function () {
            return angular.isFunction(this.goBack) || null !== a.backView();
          },
          getPreviousStateName: b,
          isComingFrom: function (n) {
            return b() === n;
          },
          historyBack: y,
          url: v,
          changeConnectionIp: m,
          toLiveReload: function () {
            (S(), v(s.localhostLivereload + $));
          },
          eui: function (n) {
            E().then(function () {
              C(
                angular.isString(n)
                  ? "/eui/index.html" + $ + "#/" + n
                  : "/eui/index.html" + $ + "#/home/rooms",
              );
            });
          },
          euiControls: function (n, e) {
            var t = "controls/" + n + "/" + e + "/dynamic";
            this.eui(t);
          },
          iui: function (n) {
            E().then(function () {
              C(
                angular.isString(n)
                  ? "/iui/index.html" + $ + "#/" + n
                  : "/iui/index.html" + $ + "#/settings/list",
              );
            });
          },
          intro: function (n) {
            var e = void 0,
              o = n ? "#/" + n : "";
            if ((S(), t.ionic.Platform.isIOS() || t.ionic.Platform.isIPad()))
              e = "cdvfile://localhost/bundle/www/intro/index.html" + o;
            else {
              if (t.ionic.Platform.isAndroid())
                return (
                  (e = "file:///android_asset/www/intro/index.html" + o),
                  void t.open(e)
                );
              e = s.brainFrontendUrl + "/intro/index.html" + o;
            }
            t.location.href = e;
          },
          settingsFor: function (n, e) {
            switch (n) {
              case "accounts":
                this.iui("settings/accounts/list");
                break;
              case "favorites":
                this.iui(
                  "favorites/" + e.roomKey + "/device/" + e.deviceKey + "/",
                );
                break;
              case "shortcuts":
                this.iui(
                  "projects/" +
                    e.projectName +
                    "/shortcuts/room/" +
                    e.roomKey +
                    "/scenario/" +
                    e.scenarioKey +
                    "/list",
                );
                break;
              case "slides":
                this.iui(
                  "projects/" +
                    e.projectName +
                    "/rooms/" +
                    e.roomKey +
                    "/scenarios/" +
                    e.scenarioKey +
                    "/slides",
                );
                break;
              case "recipes":
                var t = void 0;
                ((t =
                  e.projectName && e.roomKey && e.recipeKey
                    ? "rooms/" + e.roomKey + "/recipes/" + e.recipeKey + "/edit"
                    : "recipes/list"),
                  this.iui(t));
            }
          },
          settings: function () {
            (S(), C("/iui/index.html#/settings"));
          },
          neeoWeb: function () {
            N("https://neeo.com");
          },
          neeoStore: function () {
            N("https://neeo.com/pre-order");
          },
          neeoSupport: function () {
            N("https://planet.neeo.com");
          },
          neeoLegal: function () {
            N("https://neeo.com/legal");
          },
          nextDirection: function (n) {
            (i.nextDirection(n), a.nextViewOptions({ historyRoot: !0 }));
          },
          disableNextTransition: function () {
            a.nextViewOptions({ disableAnimate: !0 });
          },
          reset: f,
          setContextCaller: function (n, e) {
            w();
            var t = {};
            ((t.stateName = n.stateName),
              (t.stateParams = n.stateParams),
              (t.callerUrl = e),
              u.setObject("currentContextCaller", t));
          },
          setContextRoot: function (n) {
            ((n = n || a.currentView()), u.setObject("currentContextRoot", n));
          },
          hasContextCaller: function () {
            return !(!h() || !p());
          },
          destroyContext: w,
          goToCaller: function () {
            var n = p();
            (f(),
              i.nextDirection("back"),
              w(),
              e.go(n.stateName, n.stateParams));
          },
          goToCallerUrl: function () {
            S();
            var n = p();
            (w(), v(n.callerUrl));
          },
          goToRoot: function () {
            var n = h();
            (f(), i.nextDirection("back"), e.go(n.stateName, n.stateParams));
          },
        };
      return x;
    },
  ]),
  angular.module("commonService").factory("transitRouter", [
    "$window",
    function (n) {
      function e(e) {
        n.location.href = e;
      }
      return { openUrl: e };
    },
  ]),
  angular.module("commonService").factory("util", [
    "naturalSort",
    function (n) {
      function e(e, t) {
        return (
          (t =
            t ||
            function () {
              return !0;
            }),
          Array.isArray(e)
            ? e.filter(t)
            : Object.keys(e)
                .sort(n)
                .map(function (n) {
                  return e[n];
                })
                .filter(t)
        );
      }
      function t(n, e, t) {
        return (
          (t = t || {}),
          angular.forEach(n, function (n) {
            ("undefined" == typeof t[n[e]] && (t[n[e]] = []), t[n[e]].push(n));
          }),
          t
        );
      }
      function o(n) {
        var e = [];
        return (
          n.forEach(function (n) {
            n instanceof Array ? e.push.apply(e, o(n)) : e.push(n);
          }),
          e
        );
      }
      function r(n, e) {
        return n.reduce(
          function (n, t) {
            var o = n[n.length - 1];
            return (o.length >= e ? n.push([t]) : o.push(t), n);
          },
          [[]],
        );
      }
      function i(n, e) {
        return n.weight === e.weight
          ? 0
          : void 0 === n.weight
            ? 1
            : void 0 === e.weight
              ? -1
              : null === (n.weight && e.weight)
                ? null === n.weight
                  ? 1
                  : -1
                : n.weight - e.weight;
      }
      function a(n, e) {
        return n && Array.isArray(n) && e
          ? n.sort(function (n, t) {
              return n[e] < t[e] ? -1 : n[e] > t[e] ? 1 : 0;
            })
          : n;
      }
      return {
        sort: n,
        values: e,
        groupBy: t,
        flatten: o,
        chunkBy: r,
        compareByWeight: i,
        sortAlphabeticallyBy: a,
      };
    },
  ]));
