<template>
  <client-only>
    <v-container fluid class="home-container">

      <Toolbar :toolbarItems="toolbarItems" />

      <v-dialog v-model="showSettingsDialog" persistent max-width="1000">
        <!-- <Settings
        @onClose="showSettingsDialog = false"
        @onBackgroundColorChanged="changeBackgroundColor"
        :currentBackgroundColor="this.$refs.graph_canvas_ref.style.backgroundColor"
      /> -->
        <Settings @onClose="showSettingsDialog = false" />
      </v-dialog>

      <v-navigation-drawer
        v-model="showGraphLocator"
        class="right-toolbar"
        style="background-color: rgba(0, 0, 0, 0.8)"
        dark
        absolute
      >
        <v-row no-gutters class="aside-title">
          <h4 class="white--text">Graph Locator</h4>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn
              color="white"
              icon
              dark
              x-small
              @click="showGraphLocator = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <URLGraphSeeker
          color="#666"
          background-color="#FFFFFF"
          :initialURL="this.$route.query['url']"
          @readyURL="resetupURL"
        />
        <v-radio-group mandatory column v-model="selectedGraphLocatorModeIndex">
          <template v-slot:label>
            <div>Mode</div>
          </template>
          <v-radio
            v-for="(mode, index) in getGraphLocatorModeOptionList"
            :label="mode"
            :key="index"
          >
          </v-radio>
        </v-radio-group>

        <div>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click="activateTimeline" :disabled="!enableStartBuildingTimelineButton">
                <v-icon>mdi-chart-timeline-variant</v-icon>
                <!-- <v-icon>mdi-timeline-clock-outline</v-icon> -->
              </v-btn>
            </template>
            <span>Start building timeline</span>
          </v-tooltip>
        </div>

        <v-treeview
          style="border: 5px solid #222"
          :items="searchTreeItems"
          :load-children="loadSearchTreePart"
          :selectable="selectableGraphLocator"
          v-model="selectedSnapshotList"
          selected-color="teal"
          dense
          color="teal"
          activatable
          transition
          open-on-click
          @update:active="toggleCalendar"
          return-object
        ></v-treeview>
      </v-navigation-drawer>

      <!-- Calendar -->
      <v-menu
        absolute
        offset-y
        v-model="calendarShown"
        min-width="40%"
        ref="calendar"
        max-height="50%"
        :position-x="mousePosX"
        :position-y="mousePosY"
        :close-on-content-click="false"
      >
        <EventCalendar
          :year="calendarYear"
          :month="calendarMonth"
          :title="calendarTitle"
          @closeCalendar="calendarShown = false"
          @loadGraph="loadGraphWithSnapshot"
        />
      </v-menu>

      <ProgressIndicator />

      <FinderTool
        :type="selectedFinderType"
        v-show="showFinderTool"
        @hideFinderTool="
          showFinderTool = false;
          finderAndVisorItems.items.finders.selected = undefined;
        "
        @requestNodeSelection="requestNodeSelection"
        @cancelNodeSelectionRequest="cancelNodeSelection"
        @fitNodeSelectionToView="fitNodeSelectionToView"
      />

      <InfoBoard
        v-show="showInfoBoard"
        :targetNode="selectedNode"
        @hideInfoBoard="showInfoBoard = false"
        @showNodeInfo="showNodeInfo"
        @visitNodeURL="visitNodeURL"
      />

      <!--UI for timeline -->
      <GraphTimeline
        :sliderMinVal="0"
        :sliderMaxVal="
          timelineSnapshotList.length ? timelineSnapshotList.length - 1 : 1
        "
        :sliderCurVal="currentPlayedFrameIndex"
        :animationAction="currentAnimationAction"
        v-show="timelineReady"
        @doAnimationAction="doAnimationAction"
        @toggleRepeat="toggleRepeat"
      />

      <!-- The first of div is needed for solving the problem of height increase that push down the footer -->
      <div class="graph-div">
        <div ref="graph_canvas_ref" id="graph_canvas_ref"></div>
      </div>
      <a href style="display: none" ref="screenshot_a"></a>
    </v-container>
  </client-only>
</template>

<script>
/**
 *
 *
 * Copyright (C) 2020-2021  Bibliotheca Alexandrina
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 *
 */

/**
 * graph page for selecting and loading graph given a URL
 */
import { mapActions, mapGetters } from "vuex";
import EventCalendar from "@/components/EventCalendar";
import InfoBoard from "@/components/InfoBoard";
import GraphTimeline from "@/components/GraphTimeline";
import URLGraphSeeker from "@/components/URLGraphSeeker";
import FinderTool from "@/components/FinderTool";
import Toolbar from "@/components/Toolbar";
import Settings from "@/components/Settings";
import ProgressIndicator from "@/components/ProgressIndicator";
import { ssurt } from "@/js/ssurt.js";
import { utilities } from "@/js/utilities.js";


// Cytoscape-based related
import cytoscape from "cytoscape";
import cise from "cytoscape-cise";
import expandCollapse from "cytoscape-expand-collapse"; // More info at https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse


/*******************************************************************************

    publicsuffixlist.js - an efficient javascript implementation to deal with
    Mozilla Foundation's Public Suffix List <http://publicsuffix.org/list/>

    Copyright (C) 2013-present Raymond Hill

    License: pick the one which suits you:
      GPL v3 see <https://www.gnu.org/licenses/gpl.html>
      APL v2 see <http://www.apache.org/licenses/LICENSE-2.0>

*/

/*! Home: https://github.com/gorhill/publicsuffixlist.js -- GPLv3 APLv2 */

/* jshint browser:true, esversion:6, laxbreak:true, undef:true, unused:true */
/* globals WebAssembly, console, exports:true, module */

/*******************************************************************************

    Reference:
    https://publicsuffix.org/list/

    Excerpt:

    > Algorithm
    > 
    > 1. Match domain against all rules and take note of the matching ones.
    > 2. If no rules match, the prevailing rule is "*".
    > 3. If more than one rule matches, the prevailing rule is the one which
         is an exception rule.
    > 4. If there is no matching exception rule, the prevailing rule is the
         one with the most labels.
    > 5. If the prevailing rule is a exception rule, modify it by removing
         the leftmost label.
    > 6. The public suffix is the set of labels from the domain which match
         the labels of the prevailing rule, using the matching algorithm above.
    > 7. The registered or registrable domain is the public suffix plus one
         additional label.

*/

/******************************************************************************/

/* Minified using https://skalman.github.io/UglifyJS-online/ */
/*! Home: https://github.com/gorhill/publicsuffixlist.js -- GPLv3 APLv2 */
// (function(e){;let t,n,i,r=0,o="";const f=function(){window instanceof Object&&window.dispatchEvent instanceof Function&&window.CustomEvent instanceof Function&&window.dispatchEvent(new CustomEvent("publicSuffixListChanged"))},c=function(e){if(r=e+3&-4,!(void 0!==n&&n.byteLength>=r)){if(void 0!==t){const e=(r+65535>>>16)-(t.buffer.byteLength>>>16);e>0&&(t.grow(e),n=new Uint32Array(t.buffer),i=new Uint8Array(t.buffer))}else i=new Uint8Array(r),n=new Uint32Array(i.buffer);o="",i[256]=0}},s=function(e){const t=i;if(e===o)return t[256];if(null===e||0===e.length)return o="",t[256]=0;e=e.toLowerCase(),o=e;let n=e.length;n>255&&(n=255),t[256]=n;let r=n,f=257;for(;r--;){const n=e.charCodeAt(r);46===n&&(t[f+0]=r+1,t[f+1]=r,f+=2),t[r]=n}return t[f]=0,n},u=function(){const e=i,t=n,r=t[101];let o=n[100],f=-1,c=256;for(;;){const n=e[c+1],i=e[c+0]-n;let s=t[o+0]>>>16;if(0===s)break;const u=t[o+2];let l=0,a=0;for(;l<s;){const o=l+s>>>1,f=u+o+(o<<1),c=255&t[f+0];let d=i-c;if(0===d){const o=c<=4?f+1<<2:r+t[f+1];for(let t=0;t<i&&0===(d=e[n+t]-e[o+t]);t++);}if(d<0)s=o;else{if(!(d>0)){a=f;break}l=o+1}}if(0===a){if(42!==e[u+1<<2])break;e[399]=1,a=u}if(0!=(512&t[(o=a)+0])){if(c>256)return c-2;break}if(0!=(256&t[o+0])&&(f=c),0===n)break;c+=2}return f};let l,a=u;const d=function(){let e,r;{const t=new URL(document.currentScript.src),n=/[^\/]+$/.exec(t.pathname);null!==n&&(t.pathname=t.pathname.slice(0,n.index)),e=t.href}return function(){if(l instanceof Function)return Promise.resolve(!0);if("object"!=typeof WebAssembly||"function"!=typeof WebAssembly.instantiateStreaming)return Promise.resolve(!1);const o=new Uint32Array(1),f=new Uint8Array(o.buffer);return o[0]=1,1!==f[0]?Promise.resolve(!1):fetch(e+"wasm/publicsuffixlist.wasm",{mode:"same-origin"}).then(e=>{const t=void 0!==i?i.byteLength+65535>>>16:1;return r=new WebAssembly.Memory({initial:t}),WebAssembly.instantiateStreaming(e,{imports:{memory:r}})}).then(({instance:e})=>{const o=r.buffer.byteLength>>>16,f=void 0!==i?i.byteLength+65535>>>16:0;if(f>o&&r.grow(f-o),void 0!==n){const e=new Uint8Array(r.buffer),t=new Uint32Array(r.buffer);t.set(n),i=e,n=t}return t=r,l=e.exports.getPublicSuffixPos,a=l,r=void 0,!0}).catch(e=>(console.info(e),!1))}}();(e=e||window).publicSuffixList={version:"2.0",parse:function(e,t){const r={l:"",f:0,c:void 0};{const n=function(e,t){let n=e.length,i=n-t.length;if(0!==i)return i;for(let r=0;r<n;r++)if(0!=(i=e.charCodeAt(r)-t.charCodeAt(r)))return i;return 0},i=function(e,t){let i=r,o=e.length;for(;o>0;){const t=e.lastIndexOf(".",o-1),r=e.slice(t+1,o);if(o=t,!1===Array.isArray(i.c)){const e={l:r,f:0,c:void 0};i.c=[e],i=e;continue}let f=0,c=i.c.length;for(;f<c;){const e=f+c>>>1,t=n(r,i.c[e].l);if(t<0){if((c=e)===f){const e={l:r,f:0,c:void 0};i.c.splice(f,0,e),i=e;break}}else{if(!(t>0)){i=i.c[e];break}if((f=e+1)===c){const e={l:r,f:0,c:void 0};i.c.splice(c,0,e),i=e;break}}}}i.f|=1,t&&(i.f|=2)};i("*",!1);const o=/[^a-z0-9.-]/,f=e.length;let c=0;for(;c<f;){let n=e.indexOf("\n",c);-1===n&&-1===(n=e.indexOf("\r",c))&&(n=f);let r=e.slice(c,n).trim();c=n+1;const s=r.indexOf("//");if(-1!==s&&(r=r.slice(0,s)),0===(r=r.trim()).length)continue;const u=33===r.charCodeAt(0);u&&(r=r.slice(1)),o.test(r)&&(r=t(r.toLowerCase())),i(r,u)}}{const e=new Map,t=[],o=[],f=function(e){const n=t.length;for(let n=0;n<e;n++)t.push(0);return n},s=function(n,i){const r=i.l.length,c=void 0!==i.c?i.c.length:0;if(t[n+0]=c<<16|i.f<<8|r,r<=4){let e=0;r>0&&(e|=i.l.charCodeAt(0),r>1&&(e|=i.l.charCodeAt(1)<<8,r>2&&(e|=i.l.charCodeAt(2)<<16,r>3&&(e|=i.l.charCodeAt(3)<<24)))),t[n+1]=e}else{let f=e.get(i.l);if(void 0===f){f=o.length;for(let e=0;e<r;e++)o.push(i.l.charCodeAt(e));e.set(i.l,f)}t[n+1]=f}if(!1===Array.isArray(i.c))return void(t[n+2]=0);const u=f(3*c);t[n+2]=u;for(let e=0;e<c;e++)s(u+3*e,i.c[e])};f(128);const u=f(3);s(u,r),t[100]=u;const l=t.length<<2;t[101]=l;const a=(t.length<<2)+(o.length+3&-4);c(a),n.set(t),i.set(o,t.length<<2)}f()},getDomain:function(e){if(void 0===n)return"";const t=s(e),r=i;if(0===t||46===r[0])return"";const f=a();if(-1===f||0===r[f+1])return"";const c=r[f+3];return 0===c?o:o.slice(c)},getPublicSuffix:function(e){if(void 0===n)return"";const t=s(e),r=i;if(0===t||46===r[0])return"";const f=a();if(-1===f)return"";const c=r[f+1];return 0===c?o:o.slice(c)},suffixInPSL:function(e){if(void 0===n)return!1;const t=s(e),r=i;if(0===t||46===r[0])return!1;r[399]=0;const o=a();return-1!==o&&0===r[o+1]&&1!==r[399]},toSelfie:function(e){if(void 0===i)return"";if(e instanceof Object)return`2\t${e.encode(i.buffer,r)}`;return{magic:2,buf32:Array.from(new Uint32Array(i.buffer,0,r>>>2))}},fromSelfie:function(e,t){let r=0;if("string"==typeof e&&0!==e.length&&t instanceof Object){const n=e.indexOf("\t");if(-1===n||"2"!==e.slice(0,n))return!1;const o=e.slice(n+1);if(0===(r=t.decodeSize(o)))return!1;c(r),t.decode(o,i.buffer)}else{if(!(e instanceof Object&&2===e.magic&&Array.isArray(e.buf32)))return!1;r=e.buf32.length<<2,c(r),n.set(e.buf32)}return o="",i[256]=0,f(),!0},disableWASM:function(){if(l instanceof Function&&(a=u,l=void 0),void 0!==t){if(void 0!==n){const e=new Uint8Array(r),t=new Uint32Array(e.buffer);t.set(n),i=e,n=t}t=void 0}},enableWASM:d},"undefined"!=typeof module?module.exports=e.publicSuffixList:"undefined"!=typeof exports&&(exports=e.publicSuffixList)})(this);

/*! http://mths.be/punycode v1.2.3 by @mathias */
(function (o) {
  function e(o) {
    throw RangeError(L[o]);
  }
  function n(o, e) {
    for (var n = o.length; n--; ) o[n] = e(o[n]);
    return o;
  }
  function t(o, e) {
    return n(o.split(S), e).join(".");
  }
  function r(o) {
    for (var e, n, t = [], r = 0, u = o.length; u > r; )
      (e = o.charCodeAt(r++)),
        e >= 55296 && 56319 >= e && u > r
          ? ((n = o.charCodeAt(r++)),
            56320 == (64512 & n)
              ? t.push(((1023 & e) << 10) + (1023 & n) + 65536)
              : (t.push(e), r--))
          : t.push(e);
    return t;
  }
  function u(o) {
    return n(o, function (o) {
      var e = "";
      return (
        o > 65535 &&
          ((o -= 65536),
          (e += R(55296 | (1023 & (o >>> 10)))),
          (o = 56320 | (1023 & o))),
        (e += R(o))
      );
    }).join("");
  }
  function i(o) {
    return 10 > o - 48
      ? o - 22
      : 26 > o - 65
      ? o - 65
      : 26 > o - 97
      ? o - 97
      : x;
  }
  function f(o, e) {
    return o + 22 + 75 * (26 > o) - ((0 != e) << 5);
  }
  function c(o, e, n) {
    var t = 0;
    for (o = n ? P(o / m) : o >> 1, o += P(o / e); o > (M * y) >> 1; t += x)
      o = P(o / M);
    return P(t + ((M + 1) * o) / (o + j));
  }
  function l(o) {
    var n,
      t,
      r,
      f,
      l,
      d,
      s,
      a,
      p,
      h,
      v = [],
      g = o.length,
      w = 0,
      j = I,
      m = A;
    for (t = o.lastIndexOf(F), 0 > t && (t = 0), r = 0; t > r; ++r)
      o.charCodeAt(r) >= 128 && e("not-basic"), v.push(o.charCodeAt(r));
    for (f = t > 0 ? t + 1 : 0; g > f; ) {
      for (
        l = w, d = 1, s = x;
        f >= g && e("invalid-input"),
          (a = i(o.charCodeAt(f++))),
          (a >= x || a > P((b - w) / d)) && e("overflow"),
          (w += a * d),
          (p = m >= s ? C : s >= m + y ? y : s - m),
          !(p > a);
        s += x
      )
        (h = x - p), d > P(b / h) && e("overflow"), (d *= h);
      (n = v.length + 1),
        (m = c(w - l, n, 0 == l)),
        P(w / n) > b - j && e("overflow"),
        (j += P(w / n)),
        (w %= n),
        v.splice(w++, 0, j);
    }
    return u(v);
  }
  function d(o) {
    var n,
      t,
      u,
      i,
      l,
      d,
      s,
      a,
      p,
      h,
      v,
      g,
      w,
      j,
      m,
      E = [];
    for (o = r(o), g = o.length, n = I, t = 0, l = A, d = 0; g > d; ++d)
      (v = o[d]), 128 > v && E.push(R(v));
    for (u = i = E.length, i && E.push(F); g > u; ) {
      for (s = b, d = 0; g > d; ++d) (v = o[d]), v >= n && s > v && (s = v);
      for (
        w = u + 1,
          s - n > P((b - t) / w) && e("overflow"),
          t += (s - n) * w,
          n = s,
          d = 0;
        g > d;
        ++d
      )
        if (((v = o[d]), n > v && ++t > b && e("overflow"), v == n)) {
          for (
            a = t, p = x;
            (h = l >= p ? C : p >= l + y ? y : p - l), !(h > a);
            p += x
          )
            (m = a - h),
              (j = x - h),
              E.push(R(f(h + (m % j), 0))),
              (a = P(m / j));
          E.push(R(f(a, 0))), (l = c(t, w, u == i)), (t = 0), ++u;
        }
      ++t, ++n;
    }
    return E.join("");
  }
  function s(o) {
    return t(o, function (o) {
      return E.test(o) ? l(o.slice(4).toLowerCase()) : o;
    });
  }
  function a(o) {
    return t(o, function (o) {
      return O.test(o) ? "xn--" + d(o) : o;
    });
  }
  var p = "object" == typeof exports && exports,
    h = "object" == typeof module && module && module.exports == p && module,
    v = "object" == typeof global && global;
  (v.global === v || v.window === v) && (o = v);
  var g,
    w,
    b = 2147483647,
    x = 36,
    C = 1,
    y = 26,
    j = 38,
    m = 700,
    A = 72,
    I = 128,
    F = "-",
    E = /^xn--/,
    O = /[^ -~]/,
    S = /\x2E|\u3002|\uFF0E|\uFF61/g,
    L = {
      overflow: "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input",
    },
    M = x - C,
    P = Math.floor,
    R = String.fromCharCode;
  if (
    ((g = {
      version: "1.2.3",
      ucs2: { decode: r, encode: u },
      decode: l,
      encode: d,
      toASCII: a,
      toUnicode: s,
    }),
    "function" == typeof define && "object" == typeof define.amd && define.amd)
  )
    define(function () {
      return g;
    });
  else if (p && !p.nodeType)
    if (h) h.exports = g;
    else for (w in g) g.hasOwnProperty(w) && (p[w] = g[w]);
  else o.punycode = g;
})(this);

import { PLSUtilities } from "@/js/PSLUtilities.js";

// // Suffix list downloaded from https://publicsuffix.org/list/public_suffix_list.dat.dat
// const suffixData = require('@/js/public_suffix_list.dat');

import { wwwData } from "@/js/wwwData.js";

// Month Strings
const monthStringList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Node Shape List supported by Cytoscape
const nodeShapeList = [
  "ellipse",
  "triangle",
  "round-triangle",
  "rectangle",
  "round-rectangle",
  "bottom-round-rectangle",
  "cut-rectangle",
  "barrel",
  "rhomboid",
  "diamond",
  "round-diamond",
  "pentagon",
  "round-pentagon",
  "hexagon",
  "round-hexagon",
  "concave-hexagon",
  "heptagon",
  "round-heptagon",
  "octagon",
  "round-octagon",
  "star",
  "tag",
  "round-tag",
  "vee",
];

// ID generator using closure function. For more information about function closures refer to:
// https://www.w3schools.com/js/js_function_closures.asp
var generateID = (function () {
  var nodeID = 0;
  var edgeID = 0;
  var nodeAndEdge = 0;
  var othersID = 0;
  return function (type) {
    switch (type) {
      case "n":
        return nodeID++;
        break;

      case "e":
        return edgeID++;
        break;

      case "ne":
        return nodeAndEdge++;
        break;

      default:
        return othersID++;
        break;
    }
  };
})();

// Defining a class for storing min Max pair for calculating some mapping
class MinMaxPair {
  constructor(min, max) {
    this._min = min;
    this._max = max;
    this._diff = max - min;
  }
  // Return min
  get min() {
    return this._min;
  }

  // Set min
  set min(min) {
    this._min = min;
    this._diff = this._max - min;
  }

  // Return max
  get max() {
    return this._max;
  }

  // Set max
  set max(max) {
    this._max = max;
    this._diff = max - this._min;
  }

  // Set both min and max
  set minMax({ min, max }) {
    this._min = min;
    this._max = max;
    this._diff = max - min;
  }

  // Get "_diff"
  get diff() {
    return this._diff;
  }
}

export default {
  components: {
    EventCalendar,
    InfoBoard,
    ProgressIndicator,
    URLGraphSeeker,
    FinderTool,
    // FindersAndVisors,
    Toolbar,
    // LayoutParams,
    Settings,
    GraphTimeline,
    // LinkvizSearch,
    //LinkvizNavigator
  },

  head() {
    return {
      title: "Archive Visualization",
      // script: [
      //   {
      //     hid: "punycode",
      //     src: "/js/punycode.min.js",
      //     body: true,
      //   },
      //   {
      //     hid: "publicsuffixlist",
      //     src: "/js/publicsuffixlist.js",
      //     body: true,
      //   },
      // ],
    };
  },

  // layout: "graphLayout",

  data() {
    var self = this;

    return {
      targetURL: "", // Target URL for which graphs are loaded with relation to other websites
      targetURLInSSURT: "", // The Target url in SSURT format

      currentGraphSnapshotDate: null, // current Graph Snapshot Date (type will be date)

      // cluster
      // clusterIndex: 0,
      // clusterList: [], // Keep track of cluster ids

      // filteredNodeCount: 0, // Count how many nodes are filtered

      // activeSearchTreeItems: [], // Active items of search trees
      calendarShown: false,
      mousePosX: null,
      mousePosY: null,

      calendarTitle: "", // Calendar Title
      calendarYear: "", // Calendar Year
      calendarMonth: "", // Calendar Month

      // graphDepth: 1,
      // zoomLevel: 1, // Keep Track of zoom level
      zoomDelta: 0.1, // Zooming level increment or decrement

      // PROOF of CONCEPT
      // cyto: {},
      cyto: undefined,
      cytoNodes: [], // Default sort by ID
      cytoEdges: [], // Default sort by ID
      nodeURLBasedIndexerMap: new Map(), // Indexer Map based on URL for speedup search
      edgeURLBasedIndexerMap: new Map(), // Indexer Map based of URL for speedup search
      currentGraphDepth: 1/*null*//* For now, let it be 1  */, // Current Load graph depth. If null, no graph is loaded till now
      reciprocalCurrentGraphDepth: null, // 1.0 / currentGraphDepth
      cytoExpClpAPI: {},
      // compoundNodes: [],
      // filteredNodes: null,
      selectedNode: null, // Single node selected
      nodeDomainCluster: null, // node domain-based cluster
      ciseClusterInfo: [], // Cluster Info for CISE Layout array of arrays
      rootNodeID: null, // root node that has a url corresponding to user URL and it should be unique
      expandCollapseExtansionInitialized: false, // Workaround for the problem of re-initializing the expandCollapse again that results in
      //  Page increase in height

      // New structure for timeline
      timelineSnapshotList: [], // The list of snapshots selected by users
      timelineReady: false, // Flag for indicating that the snapshots are downloaded successfully
      historyRecordTemplate: "", //  Hold the pattern 'XXX...X' with a length equal to "timelineSnapshotList.length",  X = 0 or 1
      repeatTimelinePlay: false,
      // Used in initialization of "nodeHistoryRecord" per node and "edgeHistoryRecord" per edge
      // '0' means that node/edge doesn't exist in snapshot
      // '1' means that node/edge exists in snapshot
      // timelineAnimationTimer: null, // Hold variable returned from "setInterval" or "setTimeout" (the used of them)
      currentPlayedFrameIndex: 0, // current played timeline animation frame index (minimum value:0, maximum value: timelineSnapshotList.length-1)
      currentAnimationAction: "ready", // valid values: 'ready', 'playing'
      animationShownNodeList: [], // List of animated nodes to be shown
      animationHiddenNodeList: [], // List of animated nodes to be hidden
      animationTimeoutTimer: null, // Timer for timeout animation (used when advancing in time without showing or hiding)
      showingAnimationPromiseResolver: null,
      hidingAnimationPromiseResolver: null,
      timeoutPromiseResolver: null,
      layout: null,

      // showingAnimation: null, // Showing Animation Object
      // hidingAnimation: null, // Hiding Animation Object

      requestNodeSelectionType: null, // Valid values: "source", "target", or null

      // Possible format for the array
      // {domainName1:nodeList1, domainName2:nodeList2, ...}  // Here domain name us the key and this will provide fats indexing
      // [{domain:"", nodeList}]
      // [{domain:"", nodeList:[]}, {domain:"", nodeList:[]}, ...]
      // {domain:"", nodeList:[]}, {domain:"", nodeList:[], ...}
      // selectedLayout: "random", // Selected Layout
      selectedNodeShapeIndex: 0, //nodeShapeList[0], // Selected node shape

      // Normal node style (default)
      normalNodeStyle: {
        "background-color": "yellow", // Designer's concern
        // shape: nodeShapeList[this.selectedNodeShapeIndex], // Node Shape
        // "background-image": function(node) {
        //   return this.nodeDomainCluster[this.getDomainName(node.data("url"))].faviconData
        // },
        // width: "10",
        // height: "10",
        // "background-image": "https://favicongrabber.com/download/https://cdn.cnn.com/cnn/.e/img/3.0/global/misc/apple-touch-icon.png", //[], // Maybe this should be empty at initialization!!??
        // "background-image":
        //   "https://favicongrabber.com/download/https://www.google.com/favicon.ico", //[], // Maybe this should be empty at initialization!!??
        // "background-image": "https://www.masrawy.com/favicon.ico", //[], // Maybe this should be empty at initialization!!??
        // "background-image-crossorigin": "anonymous", // Valid values: "use-credentials" or "anonymous"
        // "background-gradient-stop-colors": "red yellow", // Designer's TODO
        // "background-fill": "linear-gradient", // Valid Values: "solid" (default), "linear-gradient" or "radial-gradient"    // Designer's TODO
        // "background-gradient-direction": "to-bottom", // Designer's TODO
        // Valid values for above property: "to-bottom" (default), "to-top", "to-left", "to-right", "to-bottom-right", "to-bottom-left", "to-top-right", and  "to-top-left"
      },

      normalEdgeStyle: {
        width: 1,
        "line-color": "#ccc", // Designer's TODO
        "target-arrow-color": "#ccc", // Designer's TODO
        "target-arrow-shape": "triangle",
        "curve-style": "straight", //valid values: "unbundled-bezier","bezier", and "haystack"
      },
      // grabbedNodeStyle: {
      //   "background-color": "blue",
      //   "background-fill": "solid",
      // },
      grabbedNodeOutgoersEdgeStyle: {
        width: 2,
        "line-color": "yellow",
        "target-arrow-color": "yellow",
        // "target-arrow-shape": "triangle",
        // "curve-style": "straight", //"unbundled-bezier","bezier","haystack"
      },
      grabbedNodeIncomersEdgeStyle: {
        width: 2,
        "line-color": "red",
        "target-arrow-color": "red",
      },
      selectedNodeStyle: {
        "background-color": "brown", // Designer's concern
        "background-fill": "solid",
      },
      // Common Options for expand-collapse plugin
      expandCollapseOptions: {
        layoutBy: {
          name: "cose-bilkent", //"cose-bilkent" was very good for stopping funny bouncing //"cise",
          animate: "end",
          randomize: false,
          fit: true,
        },
        // undoable: false, // if set to false, no need for installing plugin. If true, plugin have to be installed
        // expandCueImage: "",
        // collapseCueImage: "",
        animate: "end",
        zIndex: 0,
      },
      isMouseDown: false,
      toolbarItems: {
        graphLocatorGroup: {
          controlList: {
            showGraphLocator: {
              // Zoom In
              type: "button",
              action: function () {
                // self.showGraphLocator = true;
                self.showGraphLocator = !self.showGraphLocator;
                // console.log("Zoom In");
              },
              disabled: false,
              // icon: "mdi-graph-outline",
              iconClass: "base-custom-icon graph-locator-icon",
              tooltip: "Show/Hide Graph locator",
            },
          },
        },
        zoomGroup: {
          // Zoom Buttons
          // name: "zoomGroup",
          controlList: {
            zoomIn: {
              // Zoom In
              type: "button",
              action: function () {
                self.zoomInOnGraph();
                // console.log("Zoom In");
              },
              disabled: true,
              icon: "mdi-magnify-plus-outline",
              tooltip: "Zoom In",
            },
            zoomOut: {
              // Zoom Out
              type: "button",
              action: function () {
                self.zoomOutOnGraph();
                // console.log("Zoom Out");
              },
              disabled: true,
              icon: "mdi-magnify-minus-outline",
              tooltip: "Zoom Out",
            },
            resetView: {
              // Reset View
              type: "button",
              action: function () {
                self.resetGraphView();
                // console.log("Reset View");
              },
              disabled: true,
              icon: "mdi-fit-to-page",
              tooltip: "Reset view",
            },
          },
        },
        collapseExpandGroup: {
          // Collapse Expand
          // name: "collapseExpandGroup",
          controlList: {
            collapse: {
              // Collapse Selected Node
              type: "button",
              action() {
                self.collapseNode();
                // console.log("Collapse Node");
              },
              disabled: true,
              icon: "mdi-arrow-collapse",
              tooltip: "Collapse selected node",
            },
            expand: {
              // Expand Selected Node
              type: "button",
              action() {
                self.expandNode();
                // console.log("Expand Node");
              },
              disabled: true,
              icon: "mdi-arrow-expand",
              tooltip: "Expand selected node",
            },
            collapseAll: {
              // Collapse All Node(s)
              type: "button",
              icon: "mdi-arrow-collapse-all",
              tooltip: "Collapse all Node(s)",
              action() {
                self.collapseAllNodes();
                // console.log("Expand All Node(s)");
              },
              disabled: true,
            },
            expandAll: {
              // Expand All Node(s)
              type: "button",
              icon: "mdi-arrow-expand-all",
              tooltip: "Expand all Node(s)",
              action() {
                self.expandAllNodes();
                // console.log("Expand All Node(s)");
              },
              disabled: true,
            },
          },
        },
        nodeFilterGroup: {
          // Node Filter
          // name: "nodeFilterGroup",
          controlList: {
            nodeFilter: {
              type: "textField",
              onInputUpdate: function (text) {
                self.updateNodeFilter(text);
              },
              disabled: true,
              text: "",
              placeholder: "Filter Nodes",
            },
            showInfo: {
              // Zoom In
              type: "button",
              action: function () {
                self.showInfoBoard = true;
                // console.log("Zoom In");
              },
              disabled: false,
              icon: "mdi-text-box-outline",
              icon: "mdi-information-variant", //, "mdi-information-outline", "mdi-text-box-outline"
              tooltip: "Show Node Info",
            },
          },
        },
        // Decided to remove the depth field as it can hit performance when choosing high values for depth
        // depthGroup: {
        //   // name: "depthGroup",
        //   controlList: {
        //     graphDepth: {
        //       type: "slider",
        //       // action: function () {
        //       // },
        //       label: "Graph Depth",
        //       value: 1,
        //       disabled: false,
        //       text: "",
        //       placeholder: "Filter Nodes",
        //     },
        //     // graphLayout: {
        //     //   type: "selection",
        //     //   disabled: false,
        //     //   label: "Graph Layout",
        //     //   itemList: cytoscapeLayoutList,
        //     //   selectedItem: cytoscapeLayoutList[11].name,
        //     // },
        //   },
        // },
        // TEST DATASET
        // testDatasetGroup: {
        //   // name: "testDatasetGroup",
        //   controlList: {
        //   useTestDataset: {
        //     type: "switch",
        //     // action: function () {
        //     // },
        //     label: "Use Test Data",
        //     value: true,
        //     disabled: false,
        //   },
        //   dictionaryWordSelection: {
        //     type: "selection",
        //     disabled: false,
        //     label: "Test Data",
        //     itemList: dictionaryWordList,
        //     selectedItem: dictionaryWordList[0],
        //   },
        //   layoutParams: {
        //     // Show Layout
        //     type: "switch",
        //     label: "Params?",
        //     value: false,
        //     disabled: false,
        //   },
        //   },
        // },
        // END of TEST DATASET
        reloadGroup: {
          // name: "reloadGroup",
          controlList: {
            reload: {
              type: "button",
              showBadge: false,
              action: function () {
                console.log("Reload");
                // Reload Data
                self.loadGraph();
                //self.loadDatasetGraph();
              },
              disabled: true,
              icon: "mdi-reload",
              tooltip: "Reload Graph",
            },
          },
        },
        screenshotGroup: {
          // Screenshot
          // name: "screenshotGroup",
          controlList: {
            saveScreenshot: {
              type: "button",
              action: function () {
                self.saveScreenshot();
                // console.log("Save screenshot");
              },
              disabled: true,
              icon: "mdi-camera-iris",
              tooltip: "Save screenshot",
            },
          },
        },
        visorsGroup: {
          controlList: {
            visorsList: {
              speedDial: true, // New type for speedDial
              type: "speedDial",
              expanded: false, // passed to v-model for controlling its state
              disabled: false,
              multiple: true, //
              tooltip: "View the graph in different figures",
              //icon:""
              iconClass: "base-custom-icon visor-icon",
              activeVisorList: [], // List for active visors
              buttonList: {
                flagVisor: {
                  type: "toggle", // valid types: "button", "toggle"
                  action: function (state) {
                    // TODO: This ugly way of data access:( Can we try to revamp it in the future?
                    self.toolbarItems.visorsGroup.controlList.visorsList.buttonList.flagVisor.on = !self
                      .toolbarItems.visorsGroup.controlList.visorsList
                      .buttonList.flagVisor.on;
                    if (
                      self.toolbarItems.visorsGroup.controlList.visorsList
                        .buttonList.flagVisor.on
                    ) {
                      activeVisorList.push("flagVisor");
                    } else {
                      activeVisorList.splice(
                        activeVisorList.indexOf("flagVisor"),
                        1
                      );
                    }
                    self.updateVisors(); // Update Visors
                  },
                  disabled: true,
                  on: true, // valid values "true", or "false"
                  icon: "mdi-flag-variant", // Priority for property "icon" if defined. Then it comes to "iconClass" if "icon" is not defined
                  // iconClass: "base-custom-icon flag-visor-icon",
                  tooltip:
                    "Apply flag visor: Show country origins of URLs represented by flags in nodes",
                  style: {
                    "background-offset-x": "-50%",
                    "background-offset-y": "50%",
                    "background-image-sub-path": "images/countryFlags/64/",
                    // "background-image-sub-path": require(`~/assets/images/fileTypes/`),
                    //                   require(`~/assets/images/fileTypes/iconfinder/selective/${node.data(
                    //   "fileType"
                    // )}.png`)
                    // "background-clip": "none", // values: "node", or "none"
                    // "background-fit": "none", // values: "none","contain", or "cover"
                    // "background-width": "50%", // "backkground-fit" should have "none" for working
                    // "background-height": "50%", // "backkground-fit" should have "none" for working
                  },
                },
                fileTypeVisor: {
                  type: "toggle",
                  action: function (state) {
                    // this.on = !this.on;
                    // toggleVisor("fileTypeVisor", this.on);
                    // TODO: This ugly way of data access:( Can we try to revamp it in the future?
                    self.toolbarItems.visorsGroup.controlList.visorsList.buttonList.fileTypeVisor.on = !self
                      .toolbarItems.visorsGroup.controlList.visorsList
                      .buttonList.fileTypeVisor.on;
                    if (
                      self.toolbarItems.visorsGroup.controlList.visorsList
                        .buttonList.fileTypeVisor.on
                    ) {
                      activeVisorList.push("fileTypeVisor");
                    } else {
                      activeVisorList.splice(
                        activeVisorList.indexOf("fileTypeVisor"),
                        1
                      );
                    }
                    self.updateVisors(); // Update Visors
                  },
                  disabled: true,
                  on: true, // valid values "true", or "false"
                  icon: "mdi-file-outline",
                  // iconClass: "base-custom-icon file-type-visor-icon",
                  tooltip:
                    "Apply file type Visor: Show file type of url by file type icons in nodes",
                  style: {
                    "background-offset-x": "50%",
                    "background-offset-y": "50%",
                    "background-image-sub-path": "images/fileTypes/",
                    // "background-image-sub-path": require(`~/assets/images/fileTypes/`),
                    //                   require(`~/assets/images/fileTypes/iconfinder/selective/${node.data(
                    //   "fileType"
                    // )}.png`)
                    // "background-clip": "none", // values: "node", or "none"
                    // "background-fit": "none", // values: "none","contain", or "cover"
                    // "background-width": "50%", // "backkground-fit" should have "none" for working
                    // "background-height": "50%", // "backkground-fit" should have "none" for working
                  },
                },
              },
            },
          },
        },
        pathFindersGroup: {
          controlList: {
            findersList: {
              speedDial: true,
              type: "speedDial",
              expanded: false, // passed to v-model for controlling its state
              disabled: false,
              multiple: true, //
              tooltip: "Use differet finders for finding different pathes",
              //icon:""
              iconClass: "base-custom-icon path-finder-group-icon",
              buttonList: {
                pathFinder: {
                  type: "button",
                  action: function () {
                    // Toggle visibility of path finder menu
                    self.togglePathFinderTool();
                  },
                  disabled: false,
                  // icon: "mdi-map-marker-path",
                  iconClass: "base-custom-icon path-finder-icon",
                  tooltip: "Find path between two nodes",
                },
                loopFinder: {
                  type: "button",
                  action: function () {},
                  disabled: false,
                  // icon: "mdi-graphql",
                  iconClass: "base-custom-icon loop-finder-icon",
                  tooltip: "Find loop(s) if exist(s)",
                },
              },
            },
          },
        },
        settingsGroup: {
          // Settings
          // name: "settingsGroup",
          controlList: {
            settings: {
              type: "button",
              action: function (eventObject) {
                // Prevent event propagation
                eventObject.stopPropagation();
                self.openSettingsDialog();
                // console.log("Open Settings");
              },
              disabled: false,
              icon: "mdi-cog",
              tooltip: "Open Settings",
            },
          },
        },
        // Decided to move the position to another place after discussion with designer
        // timelineGroup: {
        //   controlList: {
        //     timeline: {
        //       type: "button",
        //       action: function () {
        //         // self.startTimeline();
        //         self.activateTimeline();
        //       },
        //       disabled: false,
        //       icon: "mdi-chart-timeline-variant", //"mdi-timeline-clock-outline"
        //       tooltip: "Start Timeline Animation",
        //     },
        //   },
        // },
        // hideGroup: {
        //   // name: "hideGroup",
        //   controlList: {
        //     hide: {
        //       type: "button",
        //       action: function () {
        //         // console.log("Hide");
        //         self.setToolbarVisibility(false);
        //       },
        //       disabled: false,
        //       icon: "mdi-close",
        //       tooltip: "Hide Toolbar",
        //     },
        //   },
        // },
      },

      // TODO: This data structure is going to be removed since we have moved this part into toolbar item
      finderAndVisorItems: {
        disabled: false,
        items: {
          // Finder items in the menu
          finders: {
            multiple: false, // Allow multiple buttons to be active
            // previouslySelected: undefined, // Previously Selected Finder
            selected: undefined, // Single Selected Finder
            items: [
              // Launch a tool for finding path from node to node
              {
                type: "pathFinder",
                icon: "mdi-map-marker-path",
                tooltip: "Find a path from a node to another node",
                // action: function () {
                // self.enablePathFinderTool(selected === 1 ? true : false);
                // if (selected === 1) {
                //   // Path Finder Tool is on
                //   self.enablePathFinderTool(true);
                // } else {
                //   self.enablePathFinderTool(false);
                // }
                // },
              },
              // Launch a tool for showing loops in the graph
              {
                type: "loopFinder",
                icon: "mdi-graphql",
                tooltip: "Find a loop in the graph",
                // action: function () {
                // self.enableLoopFinderTool(selected === 1 ? true : false);
                // },
              },
            ],
          },
          // Visor Items
          visors: {
            multiple: true, // Allow multiple buttons to be active
            // previouslySelected: [],
            selected: [], // Selected visor(s)
            // orderedActiveVisors: [], // Ordered Active Visors

            items: [
              // File type visor
              {
                type: "fileVisor",
                icon: "mdi-file-eye",
                tooltip: "Show file type",
                style: {
                  "background-offset-x": "50%",
                  "background-offset-y": "50%",
                  "background-image-sub-path": "images/fileTypes/",
                  // "background-image-sub-path": require(`~/assets/images/fileTypes/`),
                  //                   require(`~/assets/images/fileTypes/iconfinder/selective/${node.data(
                  //   "fileType"
                  // )}.png`)
                  // "background-clip": "none", // values: "node", or "none"
                  // "background-fit": "none", // values: "none","contain", or "cover"
                  // "background-width": "50%", // "backkground-fit" should have "none" for working
                  // "background-height": "50%", // "backkground-fit" should have "none" for working
                },
                // layerIndex: -1, // Indicate the index of the visor laid on the node
                // action: function () {
                // self.toggleFileVisor();
                // },
              },
              // Flag Visor
              {
                type: "flagVisor",
                icon: "mdi-flag-variant",
                tooltip: "Show country flag",
                style: {
                  "background-offset-x": "-50%",
                  "background-offset-y": "50%",
                  "background-image-sub-path": "images/countryFlags/64/",
                  // "background-image-sub-path": require(`~/assets/images/countryFlags/64/`),
                  // "background-clip": "none", // values: "node", or "none"
                  // "background-fit": "none", // values: "none","contain", or "cover"
                  // "background-width": "50%", // "backkground-fit" should have "none" for working
                  // "background-height": "50%", // "backkground-fit" should have "none" for working
                },
                // layerIndex: -1, // Indicate the index of the visor laid on the node
                // action: function () {
                //   self.toggleFlagVisor();
                // },
              },
            ],
          },
        },
      },
      // END of CONCEPT

      // Abstract Data for visors. TODO: It should be revamped in the future
      // visors: [{}, {}],

      showGraphLocator: true,
      showRightToolbar: false,
      // showUpperToolbar: false,
      showInfoBoard: false,
      showFinderTool: false,
      // TODO: Double-check that you no longer need this variable
      // showTimelineUI: false,
      showSettingsDialog: false,
      progressDialogShown: false,
      // Dataset TEST
      // showDataset: false,
      useTestDataset: false,
      datasetKeyword: "",
      // Selected Layout Option Parameters
      selectedLayoutParams: {
        name: "cise",//cytoscapeLayoutList[11].name,
        // padding: 17,
      },

      // // Layout Params
      // showLayoutParams: false,
      // // END of Layout Params

      // End of Dataset TEST
      // Hold search tree for navigation and selecting a graph
      searchTreeItems: [],
      selectedSnapshotList: [], // Selected snapshot list in the tree

      // graphLocatorMode: "timeline", // values: "singleSnapshot", "timeline"
      selectedGraphLocatorModeIndex: 0, // selected graph locator mode
      selectableGraphLocator: false,
      enableStartBuildingTimelineButton:false,
      // Use RangedValue for holding pairs for calculating minimum and maximum for some values
      inlinkCountMinMaxPair: null,
      outlinkCountMinMaxPair: null,
    };
  },

  watch: {
    // // Watch for changes in finders toggling
    // "finderAndVisorItems.items.finders.selected": {
    //   immediate: true,
    //   handler(val, oldVal) {
    //     // Only one finder is active
    //     // Check for "oldVal" if it was an active finder
    //     if (oldVal !== undefined) {
    //       switch (this.finderAndVisorItems.items.finders.items[oldVal].type) {
    //         case "pathFinder":
    //           this.enablePathFinderTool(false);
    //           break;

    //         case "loopFinder":
    //           this.enableLoopFinderTool(false);
    //           break;

    //         default:
    //           // In case of unexisted value
    //           throw new Error("Undefined Finder Type");
    //           break;
    //       }
    //     }
    //     // Checl for "val" for knowing what the active finder is
    //     if (val !== undefined) {
    //       switch (this.finderAndVisorItems.items.finders.items[val].type) {
    //         case "pathFinder":
    //           this.enablePathFinderTool(true);
    //           break;

    //         case "loopFinder":
    //           this.enableLoopFinderTool(true);
    //           break;

    //         default:
    //           // In case of unexisted value
    //           throw new Error("Undefined Finder Type");
    //           break;
    //       }
    //     }
    //   },
    // },

    // Watch for changes in visors toggling
    "finderAndVisorItems.items.visors.selected": {
      immediate: true,
      handler(val, oldVal) {
        if (this.cyto) {
          this.updateVisors();
        }
      },
    },

    getBackgroundColor(color) {
      this.$refs.graph_canvas_ref.style.backgroundColor = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    },

    // Watch for node coloring request
    getColoringAction(coloringAction) {
      // "coloringAction" has the following format:
      //{
      //     color: null,        // color object either rgba or hsla according to type
      //     methodIndex: null,  // index refering to "nodeColoringMethodList"
      // }
      const color = `rgb(${coloringAction.color.r},${coloringAction.color.g},${coloringAction.color.b})`; // Color object for coloring the node
      const opacity = coloringAction.color.a; // get opacity
      let selected = this.cyto.$(":selected"); // get selected node if exists
      switch (this.getNodeColoringMethodList[coloringAction.methodIndex]) {
        case "all":
          // Color all graph nodes
          this.cyto.$("node").style({
            "background-color": color,
            "background-opacity": opacity,
          });
          break;

        case "selected":
          if (selected) {
            selected.style({
              "background-color": color,
              "background-opacity": opacity,
            });
          }
          break;

        case "selected-node domain":
          // Color selected node and all other node(s) that has/have the same domain
          if (selected) {
            this.cyto
              .$(
                "#" +
                  this.nodeDomainCluster[
                    this.getDomainName(selected.data("url"))
                  ].nodeList.join(", #")
              )
              .style({
                "background-color": color,
                "background-opacity": opacity,
              });
          }
          break;

        case "domain-driven":
          // TODO: Later, try to create a way for generating discrete color group with maximum distance between colors
          // Perform a random coloring for getting the
          for (const domain in this.nodeDomainCluster) {
            // if (this.nodeDomainCluster.hasOwnProperty(domain)) {
            const nodeList = this.nodeDomainCluster[domain].nodeList;
            // }
            let color = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(
              Math.random() * 256
            )},${Math.floor(Math.random() * 256)})`;
            this.cyto.$("#" + nodeList.join(", #")).style({
              "background-color": color,
              "background-opacity": "1",
            });
          }

          break;
      }
    },

    // Watch for edge coloring type
    getSelectedEdgeColorTypeIndex: {
      immediate: true,
      handler(/*val, oldVal*/) {
        if (this.cyto) {
          this.updateEdgeColor();
        }
      },
    },

    // Watch for updating node label format
    getSelectedNodeLabelFormatIndex(index) {
      switch (this.getNodeLabelFormatList[index]) {
        case "short":
          // The following code fragment doesn't work
          // this.cyto.$("node").style({
          //   'label': 'data(label)',
          // });
          // TODO: The following code fragment works, but does it impact performance?
          //        Maybe we need later investigate this point
          this.cyto.$("node").forEach((node) => {
            node.style({
              label: node.data("label"), //"data(label)", // Comment part doesn't work
            });
          });

          break;

        case "long":
          // The following code fragment doesn't work
          // this.cyto.$("node").style({
          //   label: "hhgn",
          // });

          // TODO: The following code fragment works, but does it impact performance?
          //        Maybe we need later investigate this point
          this.cyto.$("node").forEach((node) => {
            node.style({
              label: node.data("url"), //"data(url)", // Comment part doesn't work
            });
          });
          break;

        default:
          throw new Error("Undefined node label format");
          break;
      }
    },

    // Watch for edge color
    getEdgeColor: {
      immediate: true,
      handler(/*val, oldVal*/) {
        if (this.cyto) {
          this.updateEdgeColor();
        }
      },
      // color is the same object used by "v-color-picker" component
    },

    // watch for node size type index
    getSelectedNodeSizeTypeIndex(index) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      switch (this.getNodeSizeTypeList[index]) {
        case "uniform":
          // Set all node(s) to be in a uniform size
          this.updateUniformNodeSize(this.getLatestUniformNodeSizeUsedValue);
          break;

        // TODO: This type is removed untill its benefit is checked
        // case "file-size based":
        //   // TODO: Postpone for now, till you get a better understanding for how to get file size
        //   break;

        case "inlink-count based":
          this.updateNodeSizeOnInlinkCountBasis(
            this.getLatestInlinkCountBasedNodeSizeValue
          );
          break;

        case "outlink-count based":
          this.updateNodeSizeOnOutlinkCountBasis(
            this.getLatestOutlinkCountBasedNodeSizeValue
          );
          break;

          break;

        default:
          throw new Error("Undefined Node Size Option!!");
          break;
      }
    },

    // Watch for uniform size value changes
    getLatestUniformNodeSizeUsedValue(value) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      // Change all nodes sizes
      this.updateUniformNodeSize(value);
    },

    // TODO: Postpone for now, till you get a better understanding for how to get file size
    // Watch for File-Size Based for changing node
    getLatestFileSizeBasedNodeSizeValue(rangedValue) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
    },

    // Watch for Inlink-Count Based for changing node
    getLatestInlinkCountBasedNodeSizeValue(rangedValue) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      this.updateNodeSizeOnInlinkCountBasis(rangedValue);
    },

    // Watch for Outlink-Count Based for changing node
    getLatestOutlinkCountBasedNodeSizeValue(rangedValue) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      this.updateNodeSizeOnOutlinkCountBasis(rangedValue);
    },

    // Watch for node shape index
    getSelectedNodeShapeIndex(index) {
      this.cyto.$("node").style({
        shape: this.getNodeShapeList[index],
      });
    },

    // Watch source node selection
    // getPathFinderSource({ id, url }) {
    //   // start to find path if target is ready
    //   this.runPathFinderIfReady();
    // },
    getPathFinderSource: {
      immediate: true,
      handler(val /*, oldVal*/) {
        this.runPathFinderIfReady();
      },
    },

    // Watch target node selection
    // getPathFinderTarget({ id, url }) {
    //   // start to find path if target is ready
    //   this.runPathFinderIfReady();
    // },
    getPathFinderTarget: {
      immediate: true,
      handler(val /*, oldVal*/) {
        this.runPathFinderIfReady();
      },
    },

    // Watch different Style for External Edges Flag
    getUseDifferentStyleForExtEdges: {
      immediate: true,
      handler(val) {
        // TODO: Try to optimize this code
        if (!this.cyto) {
          return;
        }
        this.updateExternalEdgeStyle(val); // Update external edges style with either different style or stay the same
      },
    },

    // Watch Graph Locator Mode Index
    selectedGraphLocatorModeIndex: {
      immediate: true,
      handler(val, oldVal) {
        // "val" and "oldVal" are indices for the array "getGraphLocatorModeOptionList" in the store
        if (
          val === 1 ||
          oldVal ===
            1 /* Index of "View Snapshots in Calendar" in "getGraphLocatorModeOptionList" */
        ) {
          // Either oldVal was "Snapshot Selection in Tree" or "Timeline", so reload graph locator
          this.searchTreeItems = [];
          this.loadVersionCountYearly();
        }
        this.selectableGraphLocator = val === 2;
        this.enableStartBuildingTimelineButton = this.selectableGraphLocator
      },
    },
  },

  computed: {
    ...mapGetters({
      getLinkservRequestURLHub: "getLinkservRequestURLHub",
      getBackgroundColor: "getBackgroundColor",
      getSelectedNodeSizeTypeIndex: "getSelectedNodeSizeTypeIndex",
      getNodeSizeTypeList: "getNodeSizeTypeList",
      getSelectedNodeShapeIndex: "getSelectedNodeShapeIndex",
      getNodeColoringMethodList: "getNodeColoringMethodList",
      getGraphLocatorModeOptionList: "getGraphLocatorModeOptionList",
      getSelectedNodeLabelFormatIndex: "getSelectedNodeLabelFormatIndex",
      getColoringAction: "getColoringAction",
      getEdgeColorTypeList: "getEdgeColorTypeList",
      getEdgeColor: "getEdgeColor",
      getSelectedEdgeColorTypeIndex: "getSelectedEdgeColorTypeIndex",
      getNodeLabelFormatList: "getNodeLabelFormatList",
      getNodeShapeList: "getNodeShapeList",
      getLatestUniformNodeSizeUsedValue: "getLatestUniformNodeSizeUsedValue",
      getLatestFileSizeBasedNodeSizeValue:
        "getLatestFileSizeBasedNodeSizeValue",
      getLatestInlinkCountBasedNodeSizeValue:
        "getLatestInlinkCountBasedNodeSizeValue",
      getLatestOutlinkCountBasedNodeSizeValue:
        "getLatestOutlinkCountBasedNodeSizeValue",
      getPathFinderSource: "getPathFinderSource",
      getPathFinderTarget: "getPathFinderTarget",
      getUseDifferentStyleForExtEdges: "getUseDifferentStyleForExtEdges",
    }),

    // Return type of finder
    selectedFinderType() {
      return this.finderAndVisorItems.items.finders.selected != undefined
        ? this.finderAndVisorItems.items.finders.items[
            this.finderAndVisorItems.items.finders.selected
          ].type
        : "";
    },
  },

  methods: {
    // Actions of veux
    ...mapActions({
      setLinkservRequestURLHub: "setLinkservRequestURLHub",
      setProgressIndicatorVisibility: "setProgressIndicatorVisibility",
      setProgressIndicatorMessage: "setProgressIndicatorMessage",
      setPathFinderSource: "setPathFinderSource",
      setPathFinderTarget: "setPathFinderTarget",
      setPathFinderResult: "setPathFinderResult",
    }),

    // Setup after entering a new URL
    setupURL(url) {
      this.targetURL = url; // Get URL from route

      // Get the SSURT format from url
      let targetURLInSSURTObject = ssurt.regularURLToSSURT(
        this.targetURL
      );
      if (targetURLInSSURTObject.error.length === 0) {
        this.targetURLInSSURT = targetURLInSSURTObject.ssurt;
      } else {
        // TODO: Handle the error of ssurt format,but for now show an alert
        console.error("Your ssurt function has errors");
        return;
      }
      console.log(this.targetURLInSSURT);
      this.setLinkservRequestURLHub({
        ssurtURL: this.targetURLInSSURT,
        linkservHostname: this.$config.linkservHostname,
      });
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                     Settings                                               //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update edge color completely
    updateEdgeColor() {
      switch (this.getEdgeColorTypeList[this.getSelectedEdgeColorTypeIndex]) {
        case "uniform":
          // Color All edges with uniform color
          this.cyto.$("edge").style({
            // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
            "line-color": `hsl(${this.getEdgeColor.h},${
              this.getEdgeColor.s * 100
            }%,${this.getEdgeColor.l * 100}%)`,
          });
          break;

        case "domain name & depth":
          // Here we need to perform traversing for all edges starting from root node
          this.updateEdgeColorUponDomainAndDepthBasis();
          break;

        default:
          // Never reach this point!!
          throw new Error("Undefined Edge Color Type");
          break;
      }
    },

    // Update uniform node size
    updateUniformNodeSize(size) {
      // Change all nodes sizes to uniform size
      this.cyto.$("node").style({
        width: size,
        height: size,
      });
    },

    // Update node size according to inlink-count basis
    updateNodeSizeOnInlinkCountBasis(minMaxSizeArray) {
      let sizeMinMaxPair = new MinMaxPair(
        minMaxSizeArray[0],
        minMaxSizeArray[1]
      );

      this.cyto.$("node").forEach((node) => {
        // Get Inlinks cout to node
        let inlinkCount = node.incomers("edge").length;

        // Calculate Node size based of this formula
        let size =
          ((inlinkCount - this.inlinkCountMinMaxPair.min) /
            this.inlinkCountMinMaxPair.diff) *
            sizeMinMaxPair.diff +
          sizeMinMaxPair.min;

        //Finally, calculate the style
        node.style({
          width: size,
          height: size,
        });
      });
    },

    // Update node size according to outlink-count basis
    updateNodeSizeOnOutlinkCountBasis(minMaxSizeArray) {
      let sizeMinMaxPair = new MinMaxPair(
        minMaxSizeArray[0],
        minMaxSizeArray[1]
      );

      this.cyto.$("node").forEach((node) => {
        // Get outlinks cout to node
        let outlinkCount = node.outgoers("edge").length;

        // Calculate Node size based of this formula
        let size =
          ((outlinkCount - this.outlinkCountMinMaxPair.min) /
            this.outlinkCountMinMaxPair.diff) *
            sizeMinMaxPair.diff +
          sizeMinMaxPair.min;
        //Finally, calculate the style
        node.style({
          width: size,
          height: size,
        });
      });
    },

    // Update edge color based on Domain and Depth
    updateEdgeColorUponDomainAndDepthBasis() {
      // useDifferentStyleForExtEdges = false
      // // this.getEdgeColor.rgba.r;
      // let visitedNodeList = [];
      // let unvisitedNodeQueue = [
      //   {
      //     node: this.cyto.$(`#${this.rootNodeID}`),
      //     depth: 0, //1,
      //   },
      // ];
      // // const domainName =  this.nodeDomainCluster[this.getDomainName(this.cyto.$(`#${this.rootNodeID}`).data("url"))]
      // const domainName = this.getDomainName(
      //   this.cyto.$(`#${this.rootNodeID}`).data("url")
      // );

      // let applyDifferectStyleCB = function () {};
      // if (useDifferentStyleForExtEdges) {
      //   applyDifferectStyle = function (edge, targetNode) {
      //     if (domainName === this.getDomainName(targetNode.data("url"))) {
      //       // node with the same domain, then apply same style
      //       edge.syle({
      //         // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
      //         "line-color": `hsl(${this.getEdgeColor.h}, ${
      //           100 - depth * delta
      //         }%, 50%)`,
      //         "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
      //       });
      //     } else {
      //       // Target node with different domain, then apply different style
      //       edge.syle({
      //         // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
      //         "line-color": "white",
      //         "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
      //       });
      //     }
      //     // this.nodeDomainCluster[
      //     //           this.getDomainName(sourceNode.data("url"))
      //     //         ]
      //     // if (node.data("url")) bfgh dgdf gffdg dsgfdg
      //   };
      // }
      // // unvisitedNodeQueue.push({
      // //   node: this.cyto.$(`#${this.rootNodeID}`),
      // //   depth: 0, //1,
      // // });
      // // let hue = this.getEdgeColor.h; // Get hue color component
      // // let currentDepth = 1;
      // const delta = 1.0 / this.currentGraphDepth; //this.toolbarItems.depthGroup.controlList.graphDepth.value; //this.graphDepth; // Amount of increment
      // // let colorSaturation = 100.0;
      // // Color will be hsl(hue, s=1.0, 0.5)
      // // Loop till "unvisitedNodeQueue" is empty
      // while (unvisitedNodeQueue.length > 0) {
      //   // Grab node from "unvisitedNodeQueue"
      //   let { node, depth } = unvisitedNodeQueue.shift();

      //   // // Current all coming-out edges
      //   // node.outgoers("edge").style({
      //   //   // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
      //   //   "line-color": `hsl(${this.getEdgeColor.h}, ${
      //   //     100 - depth * delta
      //   //   }%, 50%)`,
      //   // });
      //   // // Add all nodes connecting to these edges
      //   // node.outgoers("node").forEach((nd) => {
      //   //   if (!visitedNodeList.includes(nd)) {
      //   //     unvisitedNodeQueue.push({ node: nd, depth: depth + 1 });
      //   //   }
      //   // });
      //   ///////////////
      //   // Another code
      //   ///////////////
      //   // Loop through all outgoers edges
      //   node.outgoers("edge").forEach((edge) => {
      //     // Check if the taget
      //     edge.target();
      //   });
      //   // Add that processed node to array "visitedNodeList"
      //   visitedNodeList.push(node);
      //   // colorSaturation -= delta;
      // }

      // // Clear arrays
      // visitedNodeList = [];
      // unvisitedNodeQueue = [];
      // // this.cyto.$(`#${this.rootNodeID}`).outgoers("edge");

      let colorEdgeWithinGraph = this.getUseDifferentStyleForExtEdges
        ? // Use this function for coloring with consideration of
          (edge) => {
            const depth = edge.data("depth");
            if (depth >= 0) {
              edge.style({
                "line-color": `hsl(${this.getEdgeColor.h}, ${
                  100 - depth * this.reciprocalCurrentGraphDepth
                }%, 50%)`,
                "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
              });
            } else {
              edge.style({
                "line-color": "white",
                "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
              });
            }
          }
        : (edge) => {
            edge.style({
              "line-color": `hsl(${this.getEdgeColor.h}, ${
                100 -
                Math.abs(edge.data("depth")) * this.reciprocalCurrentGraphDepth
              }%, 50%)`,
              "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
            });
          };

      let colorEdgeInDisjointGraph = this.getUseDifferentStyleForExtEdges
        ? (edge) => {
            edge.style({
              // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
              "line-color": "white",
              "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
            });
          }
        : (edge) => {
            edge.style({
              // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
              "line-color": `hsl(${this.getEdgeColor.h}, 100%, 50%)`,
              "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
            });
          };

      // Check if attribute "depth" is defined for edges or not
      if (this.cyto.edges()[0].data("depth")) {
        // Depth attribute is added to edge, so looping through edges will be straight forward
        this.cyto.$("edge[depth >= 0]").forEach((edge) => {
          edge.style({
            "line-color": `hsl(${this.getEdgeColor.h}, ${
              100 - edge.data("depth") * this.reciprocalCurrentGraphDepth
            }%, 50%)`,
            "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
          });
        });
        if (this.getUseDifferentStyleForExtEdges) {
          this.cyto.$("edge[depth < 0]").style({
            "line-color": "white",
            "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
          });
        } else {
          this.cyto
            .$(`edge[depth < 0][depth != ${Number.MIN_SAFE_INTEGER}]`)
            .style({
              "line-color": `hsl(${this.getEdgeColor.h}, ${
                100 -
                Math.abs(edge.data("depth")) * this.reciprocalCurrentGraphDepth
              }%, 50%)`,
              "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
            });
          // For disjoint graph(s), let their color be constant
          this.cyto.$(`edge[depth = ${Number.MIN_SAFE_INTEGER}]`).style({
            // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
            "line-color": `hsl(${this.getEdgeColor.h}, 100%, 50%)`,
            "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
          });
        }
      } else {
        // Compute edge weight only once
        computeEdgeWeight(colorEdgeWithinGraph, colorEdgeInDisjointGraph);
      }
    },

    // // Update external Edge Style. Either use different Style for them, or stay the same
    updateExternalEdgeStyle(useDifferentStyleForExtEdges) {
      if (useDifferentStyleForExtEdges) {
        // Applying different style for external edges
        // TODO: Add handling the case of disjoint graph
        this.cyto.$(`edge[depth < 0]`).style({
          // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
          "line-color": "white",
          "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
        });
      } else {
        // Change external egdes except edges in disjoint graph(s)
        //const delta = 1.0 / this.currentGraphDepth;
        this.cyto
          .$(`edge[depth < 0][depth != ${Number.MIN_SAFE_INTEGER}]`)
          .forEach((edge) => {
            edge.style({
              // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
              "line-color": `hsl(${this.getEdgeColor.h}, ${
                100 -
                Math.abs(edge.data("depth")) * this.reciprocalCurrentGraphDepth
              }%, 50%)`,
              "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
            });
          });

        // For disjoint graph(s), let their color be constant
        this.cyto.$(`edge[depth = ${Number.MIN_SAFE_INTEGER}]`).style({
          // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
          "line-color": `hsl(${this.getEdgeColor.h}, 100%, 50%)`,
          "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
        });
      }
    },

    // compute a weight for the edges in order to simplify coloring according to depth
    computeEdgeWeight(
      colorEdgeWithingGraph = (edge) => {}, // Color edge in the same graph
      colorEdgeInDisjointGraph = (disjointEdge) => {} // Color edge in disjoint graph
    ) {
      // This should be done once per graph
      let visitedNodeList = []; // Hold visited nodes
      let unvisitedNodeQueue = [
        // Hold unvisited node in queue structure
        {
          node: this.cyto.$(`#${this.rootNodeID}`),
          depth: 0, //1,
        },
      ];
      const domainName = this.getDomainName(
        this.cyto.$(`#${this.rootNodeID}`).data("url")
      ); // main domain node

      // Loop till "unvisitedNodeQueue" is empty
      while (unvisitedNodeQueue.length > 0) {
        // Grab node from "unvisitedNodeQueue"
        let { node, depth } = unvisitedNodeQueue.shift();

        // Loop through all outgoers edges
        node.outgoers("edge").forEach((edge) => {
          // Check if the tagret belongs to the same domain
          if (domainName === this.getDomainName(edge.target().data("url"))) {
            // Belongs to same domain
            edge.data("depth", depth); // add new weight for depth
          } else {
            edge.data("depth", -depth); // add new weight for depth with negative number
          }
          // After adding depth to edge, call a color function if exists
          colorEdgeWithingGraph(edge);

          // Check the target node if it's visited
          let targetNode = edge.target();
          if (!visitedNodeList.includes(targetNode)) {
            unvisitedNodeQueue.push({ node: targetNode, depth: depth + 1 });
          }
        });
        visitedNodeList.push(node);
      }
      // Clear arrays
      visitedNodeList = [];
      unvisitedNodeQueue = [];

      // At this point, you may have some edge(s) in a disjoint graph as a Controversy 🤔
      // So, we should find them
      // TODO: Add a handler for the case of more than one disjoints graph (done)
      // TODO: Try to optimize it if needed
      this.cyto.$("edge[!depth]").forEach((edge) => {
        edge.data("depth", Number.MIN_SAFE_INTEGER); // This integer value indicates that this edge is disjoint from the graph
        colorEdgeInDisjointGraph(edge);
      });
    },

    //--------------------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          Finders & Visors Actions                                          //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // // Open Path Finder Tool
    enablePathFinderTool(enabled) {
      console.log("openPathFinderTool is " + enabled);
      this.showFinderTool = enabled;
    },

    // Toggle state of path finder visibility
    togglePathFinderTool() {
      this.showFinderTool = !this.showFinderTool;
    },

    // // Open Loop Finder
    enableLoopFinderTool(enabled) {
      console.log("openLoopFinderTool is " + enabled);
      this.showFinderTool = enabled;
    },

    // Update visor states as they are now consider a state machine
    updateVisors() {
      // if (this.finderAndVisorItems.items.visors.selected.length === 0) { // Old condition
      if (
        this.toolbarItems.visorsGroup.controlList.visorsList.activeVisorList
          .length === 0
      ) {
        // New condition
        // All visors are turned off
        this.cyto.$("node").style({
          "background-image": "",
        });
        // If you need to tune the perfomance, you can try to remove unnecessary properties related to "background-image"
        // this.cyto.nodes().removeStyle("background-clip background-fit background-width background-height");
      } else {
        // Setup style for reflecting changes in visors

        let currentStyle = {
          // "background-image": [], // Initially empty
          "background-offset-x": [],
          "background-offset-y": [],

          "background-clip": [], // values: "node", or "none"
          "background-fit": [], // values: "none","contain", or "cover"
          "background-width": [], // "backkground-fit" should have "none" for working
          "background-height": [], // "backkground-fit" should have "none" for working

          visorType: [],
        }; // Hold style for changing nodes

        // const fixedAttributeStyle = {
        //   "background-clip": ["none"], // values: "node", or "none"
        //   "background-fit": ["none"], // values: "none","contain", or "cover"
        //   "background-width": ["50%"], // "backkground-fit" should have "none" for working
        //   "background-height": ["50%"], // "backkground-fit" should have "none" for working
        // };

        // Loop through all selected visors
        // this.finderAndVisorItems.items.visors.selected.forEach((visorIndex) => {
        this.toolbarItems.visorsGroup.controlList.visorsList.activeVisorList.forEach(
          (visorType) => {
            // Postpone it till final stage
            // currentStyle["background-image"].push(
            //   this.finderAndVisorItems.items.visors.items[visorIndex].style[
            //     "background-image-sub-path"
            //   ]
            // );
            currentStyle["background-offset-x"].push(
              // this.finderAndVisorItems.items.visors.items[visorIndex].style[
              this.toolbarItems.visorsGroup.controlList.visorsList.buttonList[
                visorType
              ].style["background-offset-x"]
            );
            currentStyle["background-offset-y"].push(
              // this.finderAndVisorItems.items.visors.items[visorIndex].style[
              this.toolbarItems.visorsGroup.controlList.visorsList.buttonList[
                visorType
              ].style["background-offset-y"]
            );
            // Attributes need duplication
            currentStyle["background-clip"].push("none");
            currentStyle["background-fit"].push("none");
            currentStyle["background-width"].push("50%");
            currentStyle["background-height"].push("50%");

            // Can be omited
            // No, now it's not omitted
            // No No 🤣,  can be omitted again
            currentStyle["visorType"].push(
              // this.finderAndVisorItems.items.visors.items[visorIndex].type
              visorType
            );

            // currentStyle = {
            //   ...this.finderAndVisorItems.items.visors.items[visorIndex].style,
            // };
          }
        );

        currentStyle["bounds-expansion"] = "20px"; // Add this one time only

        let { visorType, ...partialCurrentStyle } = currentStyle;
        this.cyto.$("node").style({
          ...partialCurrentStyle,
          "background-image": function (node) {
            let arr = []; //
            // let arr = currentStyle["background-image"]; // hold the background images

            // Make another loop through all selected visors
            // this.finderAndVisorItems.items.visors.selected.forEach(
            //   (visorIndex) => {}
            // );
            // Replaced with better code
            currentStyle["visorType"].forEach((visorType) => {
              switch (visorType) {
                case "fileTypeVisor":
                  arr.push(
                    require(`~/assets/images/fileTypes/${node.data(
                      "fileType"
                    )}.png`)
                  );
                  break;

                case "flagVisor":
                  arr.push(
                    require(`~/assets/images/countryFlags/64/${node.data(
                      "countryCode"
                    )}.png`)
                  );
                  break;

                default:
                  // Invalid Point to reach!!
                  throw new Error("Undefined Visor Type!!");
                  break;
              }
            });
            return arr;
          },
        });
      }
    },

    // Setup a flag for node selection
    requestNodeSelection(type) {
      this.requestNodeSelectionType = type;
      this.cyto.$("node").once("click", this.getClickedNodeData);
    },

    // Get clicked node data and set ""
    getClickedNodeData(eventObject) {
      switch (this.requestNodeSelectionType) {
        case "source":
          this.setPathFinderSource({
            id: eventObject.target.id(),
            url: eventObject.target.isParent()
              ? eventObject.target.id()
              : eventObject.target.data("url"),
          });
          break;

        case "target":
          this.setPathFinderTarget({
            id: eventObject.target.id(),
            url: eventObject.target.isParent()
              ? eventObject.target.id()
              : eventObject.target.data("url"),
          });
          break;

        default:
          // Printing a warning to the user
          console.warn("this.requestNodeSelectionType has got null value!!");
          break;
      }
      this.requestNodeSelectionType = null; // Set to null
    },

    // Run Path Finder If Ready af
    runPathFinderIfReady() {
      if (this.getPathFinderSource && this.getPathFinderTarget) {
        this.findPath(this.getPathFinderSource.id, this.getPathFinderTarget.id); // Find a path from a node to node
      }
    },

    // Find a path from source node to target node
    findPath(sourceNodeID, targetNodeID) {
      // let srcNode = this.cyto.filter(`[id = "${sourceNodeID}" ]`);  // Use this line if you have none alpha-numeric characters
      let srcNode = this.cyto.$(`#${sourceNodeID}`);
      // let trgtNode = this.cyto.filter(`[id = "${targetNodeID}" ]`); // Use this line if you have none alpha-numeric characters
      let trgtNode = this.cyto.$(`#${targetNodeID}`);
      let srcCollection = null;
      let trgtCollection = null;

      // Handle the case of parent node

      if (srcNode.isParent()) {
        srcCollection = srcNode.children();
      } else {
        srcCollection = srcNode;
      }

      if (trgtNode.isParent()) {
        trgtCollection = trgtNode.children();
      } else {
        trgtCollection = trgtNode;
      }

      // let edgesList = srcNode.edgesTo(trgtNode); // Get egdes
      let edgeList = srcCollection.edgesTo(trgtCollection); // Get egdes
      // Check if we have got edges
      if (edgeList.length !== 0) {
        // Apply animation for showing the paths
        // edgeList.flashClass('pathFinderIndicator', 2000);
        // Check this link for creating blinking effect
        // let ani = edgeList.animation({
        //   style: {
        //     // "background-color": "red",
        //     // width: 75,
        //     width: 5,
        //     "line-color": "red", // Designer's TODO
        //   },
        //   duration: 2000,
        // });

        // ani
        //   .play()
        //   .promise("completed")
        //   .then(() => {
        //     ani.reverse().rewind().play();
        //   });
        edgeList
          .animate({
            style: {
              // "background-color": "red",
              // width: 75,
              width: 5,
              "line-color": "red", // Designer's TODO
            },
            duration: 2000,
          })
          .animate({
            style: {
              // style: { "background-color": "yellow" },
              ...this.normalEdgeStyle,
            },
            duration: 2000,
          });
      } else {
        console.log(`No Path exist for these two nodes`);
      }
    },

    // Cancel a request for node selection
    cancelNodeSelection(type) {
      // Remove Listener attached to nodes
      this.cyto.$("node").removeListener("click", this.getClickedNodeData);

      switch (type) {
        case "source":
          this.setPathFinderSource(null);
          break;

        case "target":
          this.setPathFinderTarget(null);
          break;

          // Never reach this point!!
          throw new Error(
            "Undefined type while trying to cancel node selection"
          );
          break;
      }
    },

    // Fit selected node to window
    fitNodeSelectionToView(type) {
      switch (type) {
        case "source":
          this.cyto.fit(this.cyto.$(`#${this.getPathFinderSource.id}`));
          break;

        case "target":
          this.cyto.fit(this.cyto.$(`#${this.getPathFinderTarget.id}`));
          break;

        default:
          // Never reach this point!!
          throw new Error("Undefined type while trying to fit node");
          break;
      }
    },

    //----------------------------------------------------------------------------------------------------------------
    //----------------------------------------------------------------------------------------------------------------

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          Upper Toolbar Actions                                             //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Show/Hide Toolbar
    // setToolbarVisibility(visible) {
    //   this.showUpperToolbar = visible;
    // },

    // Enable/Disable zoom group buttons
    enableZoomButtons(enabled) {
      for (let item in this.toolbarItems.zoomGroup.controlList) {
        this.toolbarItems.zoomGroup.controlList[item].disabled = !enabled;
      }
    },

    // Enable/Disable collapse selecte/expand buttons according to selection state
    enableCollapseSelectedExpandSelectedButtons(enabled) {
      // Collapse all and expand all button should always be enabled when a graph is loaded
      this.toolbarItems.collapseExpandGroup.controlList.collapse.disabled = !enabled;
      this.toolbarItems.collapseExpandGroup.controlList.expand.disabled = !enabled;
    },

    // Enabe/Disable expand all/ collapse all buttons
    enableCollapseAllExpandAllButtons(enabled) {
      this.toolbarItems.collapseExpandGroup.controlList.collapseAll.disabled = !enabled;
      this.toolbarItems.collapseExpandGroup.controlList.expandAll.disabled = !enabled;
    },

    // Enable/Disable node filter
    enableNodeFilter(enabled) {
      // this.toolbarItems.nodeFilter.disabled = !enabled;
      this.toolbarItems.nodeFilterGroup.controlList.nodeFilter.disabled = !enabled;
    },

    // Enable/Disable text filter
    // enableDepthSlider(enabled) {
    //   // this.toolbarItems.depthSlider.disabled = !enabled;
    //   this.toolbarItems.depthGroup.controlList.graphDepth.disabled = !enabled;
    // },

    enableReloadButton(enabled) {
      this.toolbarItems.reloadGroup.controlList.reload.disabled = !enabled;
    },

    // Enable/Disable screenshot button
    enableScreenshotButton(enabled) {
      this.toolbarItems.screenshotGroup.controlList.saveScreenshot.disabled = !enabled;
    },

    // Enble/Disable show settings button
    enableShowSettingsButton(enabled) {
      this.toolbarItems.settingsGroup.controlList.settings.disabled = !enabled;
    },

    // Enable/Disable reload button
    enableReloadButton(enabled) {
      this.toolbarItems.reloadGroup.controlList.reload.disabled = !enabled;
    },

    // Eanble "StartTimeline" button
    // enableStartTimelineButton(enabled) {
    //   // this.toolbarItems.timelineGroup.controlList.timeline.disabled = !enabled;
    //   this.enableStartBuildingTimelineButton = enabled
    // },

    // // Enable/Disable settings button
    // enableSettingsButton(enabled) {
    //   this.toolbarItems.settingsGroup.controlList.settings.disabled = !enabled;
    // },

    // Expand selected node
    expandNode() {
      // let selectedNode = this.cyto.$(":selected");
      // if (
      //   selectedNode.isParent() &&
      //   this.cytoExpClpAPI.isExpandable(selectedNode)
      // ) {
      //   this.cytoExpClpAPI.expand(selectedNode, this.expandCollapseOptions);
      // }
      if (
        this.selectedNode.isParent() &&
        this.cytoExpClpAPI.isExpandable(this.selectedNode)
      ) {
        this.cytoExpClpAPI.expand(
          this.selectedNode,
          this.expandCollapseOptions
        );
      }
    },

    // Collapse selected node
    collapseNode() {
      // let selectedNode = this.cyto.$(":selected");
      // if (
      //   selectedNode.isParent() &&
      //   this.cytoExpClpAPI.isCollapsible(selectedNode)
      // ) {
      //   this.cytoExpClpAPI.collapse(selectedNode, this.expandCollapseOptions);
      // }
      if (
        this.selectedNode.isParent() &&
        this.cytoExpClpAPI.isCollapsible(this.selectedNode)
      ) {
        this.cytoExpClpAPI.collapse(
          this.selectedNode,
          this.expandCollapseOptions
        );
      }
    },

    // Collapse all nodes
    collapseAllNodes() {
      // if (this.cytoExpClpAP.getAllCollapsedChildrenRecursively().length > 0) {
      // TODO: this condition needs refinement
      this.cytoExpClpAPI.collapseAll(this.expandCollapseOptions);
      // }
    },

    // Expand all nodes
    expandAllNodes() {
      // if (this.cytoExpClpAP.getAllCollapsedChildrenRecursively().length > 0) { // Maybe the number should be all children nodes count without parents count!!??
      // TODO: this condition needs refinement
      this.cytoExpClpAPI.expandAll(this.expandCollapseOptions); // Expand all nodes
      // }
    },

    // Add your actions after node selection
    onNodeBeingSelected(eventObject) {
      // FUTURE TODO: Try to remove some redundant condition(s).
      // It was added due to unknown behaviour of twice call to this method when selecting node inside compound node
      if (!this.selectedNode) {
        this.enableCollapseSelectedExpandSelectedButtons(
          eventObject.target.isParent()
        );
        this.selectedNode = eventObject.target;
      } else if (this.selectedNode.id() !== eventObject.target.id()) {
        // if there is a change from parent to child or vice versa, then change the behaviour of
        this.enableCollapseSelectedExpandSelectedButtons(
          eventObject.target.isParent()
        ); // accomodate to new node
        this.selectedNode = eventObject.target;
      }
    },

    // Add your actions after node unselection
    onNodeBeingUnselected(eventObject) {
      // FUTURE TODO: Try to remove some redundant condition(s).
      // It was added due to unknown behaviour of twice call to this method when selecting node inside compound node
      if (this.selectedNode) {
        // TODO: You may need to change the style here
        // Added due to unknown problem
        this.enableCollapseSelectedExpandSelectedButtons(false);
        this.selectedNode = null; // Set node unselected
      }
      // this.selectedNode.style(this.normalNodeStyle); // Back to normal style
      // if (this.selectedNode.isParent()) {
      //   this.enableCollapseSelectedExpandSelectedButtons(false); // Disable collapse
      // }
      // this.selectedNode = {}; // Set node unselected
    },

    // Add your actions after node has the event "grabon"
    onNodeBeingGrabbedOn(eventObject) {
      // if (utilities.isObjectEmpty(this.selectedNode)) {
      //   // No node is selected
      //   this.cyto.$(`#${eventObject.target.id()}`).json({ selected: true });
      // } else if (eventObject.target.id() !== this.selectedNode.id()) {
      //   // Is the selected node the same to node being called by event
      //   // Set previously selected node to be unselected
      //   this.cyto.$(`#${this.selectedNode.id()}`).json({ selected: false });
      //   // Set Node receiving event to be selected
      //   this.cyto.$(`#${eventObject.target.id()}`).json({ selected: true });
      //   this.selectedNode = eventObject.target;
      // }
      // // eventObject.target.style(this.grabbedNodeStyle);
      // eventObject.target
      //   .outgoers("edge")
      //   .style(this.grabbedNodeOutgoersEdgeStyle);
      // eventObject.target
      //   .incomers("edge")
      //   .style(this.grabbedNodeIncomersEdgeStyle);
      // .update(); // indicate the end of your new stylesheet so that it can be updated on elements
    },

    // Add your actions after node has the event "dragfreeon"
    onNodeBeingdragFreeOn(eventObject) {
      // eventObject.target.style(this.normalNodeStyle);
      // eventObject.target.outgoers("edge").style(this.normalEdgeStyle);
      // eventObject.target.incomers("edge").style(this.normalEdgeStyle);
    },

    // Filter nodes with typed text in the filter
    updateNodeFilter(text) {
      // this.cyto.nodes().filter("[label @*= '']")
      if (text) {
        // Change all matching node to normal display
        let matching = this.cyto.nodes().filter(`[label @*= "${text}" ]`);
        matching = matching.parent().union(matching);
        // this.cyto.nodes().filter(`[label @*= "${text}" ]`).style({
        matching.style({
          "background-color": "blue",
          // opacity: 1.0,
        });
        // Change all unmatching node to lower opacity value
        // this.cyto.nodes().filter(`[label !@*= "${text}" ]`).style({
        let unmatching = this.cyto.nodes().filter(`[label !@*= "${text}" ]`);
        unmatching.style({
          "background-color": "yellow",
          // opacity: 0.1,
        });
      } else {
        // Restore all nodes to default opacity
        this.cyto.nodes().style({
          "background-color": "yellow",
          // opacity: 1.0
        });
      }

      // // Second Approach
      // if (this.toolbarItems.nodeFilter.text != null) {
      //   console.log("fliter text not null");
      //   const pattern = new RegExp(this.toolbarItems.nodeFilter.text, "i"); // prepare testing pattern
      //   this.cyto.nodes().forEach((node) => {
      //     // console.log('type of node.id : ' + typeof node.id)
      //     let result = pattern.test(node.id());
      //     if (!result) {
      //       // console.log("visible")
      //       node.style({ display: "none" });
      //     } else {
      //       // console.log("invisible")
      //       node.style({ display: "element" });
      //     }
      //   });
      // } else {
      //   console.log("fliter text null");
      //   this.cyto.nodes().forEach((node) => {
      //     if (node.style("display") === "none") {
      //       node.style({ display: "element" });
      //     }
      //   });
      // }
    },

    // Zoom in on graph
    zoomInOnGraph() {
      this.cyto.zoom(this.cyto.zoom() + this.zoomDelta); // Best way for getting consistancy between wheel zoom and toolbar buttons
    },

    // Zoom out on graph
    zoomOutOnGraph() {
      this.cyto.zoom(this.cyto.zoom() - this.zoomDelta); // Best way for getting consistancy between wheel zoom and toolbar buttons
    },

    // Reset Graph View i.e. reset zoom or perform zoom extent
    resetGraphView() {
      this.cyto.fit();
      // This is for animation
      // this.cyto.animate(
      //   {
      //     fit: {},
      //   },
      //   {
      //     duration: 1000,
      //   }
      // );
    },

    // Save screenshot
    saveScreenshot() {
      this.cyto
        .png({ output: "blob-promise", full: true, scale: 3 }) // Scale can be option in the settings
        .then((img) => {
          let aElement = this.$refs.screenshot_a;
          let file = new Blob([img], { type: "graph.png" });
          aElement.href = URL.createObjectURL(file);
          aElement.download = "graph.png";
          aElement.click();
        });
      // let aElement = this.$refs.screenshot_a;
      // aElement.href = this.$refs.graph_canvas_ref.firstChild.firstChild.toDataURL();
      // aElement.download = "graph.png";
      // aElement.click();
    },

    // // Start the timeline
    // startTimeline() {
    //   // this.showTimelineUI = !this.showTimelineUI;
    //   // TODO: Show a progress bar for loading all snapshots
    //   this.activateTimeline();
    // },

    // Open Settings Dialog
    openSettingsDialog() {
      this.showSettingsDialog = true;
    },

    //----------------------------------------------------------------------------------------------------------------

    //----------------------------------------------------------------------------------------------------------------
    //                                                    Timeline                                                  //
    //----------------------------------------------------------------------------------------------------------------
    // Reset data related to timeline
    resetTimeline() {
      this.nodeURLBasedIndexerMap.clear();
      this.edgeURLBasedIndexerMap.clear();

      this.historyRecordTemplate = "";
      this.timelineSnapshotList = [];
      // this.timelineAnimationTimer = null;
      this.currentPlayedFrameIndex = 0;
      this.timelineReady = false;
    },

    // The starting point for the timeline
    async activateTimeline() {
      this.setProgressIndicatorVisibility(true);
      this.setProgressIndicatorMessage(
        "This may take few minutes. Please wait..."
      );
      // Make sure to reset timeline if it's used in previous round
      this.resetTimeline();

      // Reset Data
      this.resetNetwork();

      // First, read the snapshots selected by the user
      this.readTimelineSnapshots();

      // // Loop through all the snapshots
      for (let index = 0; index < this.timelineSnapshotList.length; index++) {
        // await this.downloadSnapshot(
        //   this.timelineSnapshotList[index]
        // ).then((snapshotData) => this.loadSnapshot(snapshotData, index));
        let snapshotData = await this.downloadSnapshot(
          this.timelineSnapshotList[index]
        );
        this.loadSnapshot(snapshotData, index);
      }
      // The following code didn't work!! Kept for learning and understanding
      // await this.timelineSnapshotList.forEach(async (snapshot, index) => {
      //   // 'index' here is the frame index of the timeline
      //   await this.downloadSnapshot(snapshot).then(async (snapshotData) => {
      //     // console.log(typeof snapshotData);
      //     // console.log(snapshotData);
      //     // console.log('At index ' + index + ', snapshotData : ' + snapshotData)
      //     console.log("Before dead loop");
      //     await (async ()=>{for (let i = 0; i < 1000000; i++) {}})()
      //     console.log("After dead loop");
      //     await this.loadSnapshot(snapshotData, index);
      //   });
      //   // let snapshotData = await this.downloadSnapshot(snapshot)
      //   // console.log('At index ' + index + ', snapshotData : ' + snapshotData)
      // });

      // Add the domain(s) here,
      this.addDomainNodes();

      // console.log("Will we enter this strange loop?");
      for (const domain in this.nodeDomainCluster) {
        // "ciseClusterInfo" will be array of arrays as stated by CISE Layout documentation
        // this.ciseClusterInfo.push(this.nodeDomainCluster[domain]);
        // console.log("Inside the strange loop!!");
        this.ciseClusterInfo.push(this.nodeDomainCluster[domain].nodeList);

        // Setup compound nodes

        // // Here, try to fetch favicon for each node
        // this.nodeDomainCluster[
        //   domain
        // ].faviconData = await this.getFaviconDataURL(domain);
      }

      // Up to this point, graph should be loaded in cytoscape
      // console.log("Starting to build Cytoscape...");
      this.initCytoscape(() => {
        this.setFrame;
        this.timelineReady = true;
      });
      //this.setProgressIndicatorVisibility(false);
    },

    // Handle snapshots
    // async processSnapshots() {
    //   // Loop through all the snapshots
    //   await this.timelineSnapshotList.forEach(async (snapshot, index) => {
    //     // 'index' here is the frame index of the timeline
    //     await this.downloadSnapshot(snapshot).then(async (snapshotData) => {
    //       // console.log(typeof snapshotData);
    //       // console.log(snapshotData);
    //       // console.log('At index ' + index + ', snapshotData : ' + snapshotData)
    //       console.log("Before non-dead loop");
    //       // await (async () => {
    //         // for (let i = 0; i < 1000000; i++) {}
    //       // })();
    //       console.log("After non-dead loop");
    //       await this.loadSnapshot(snapshotData, index);
    //     });
    //     // console.log('At index ' + index + ', snapshotData : ' + snapshotData)
    //   });
    // },

    // Read timeline snapshots from the selected elements in "this.searchTreeItems"
    readTimelineSnapshots() {
      // We need to get all leaves in the tree structure as snapshots exist there
      this.selectedSnapshotList.forEach((snapshotItem) => {
        // "snapshotItem.value" is the actual format of the snapshot
        // "snapshotItem.name" is the displayed name of the snapshot
        // Check the type for selecting the proper type
        if (snapshotItem.type === "s") {
          this.timelineSnapshotList.push(snapshotItem.value);
        }
      });
      this.timelineSnapshotList.sort(); // Sort them


      for (let i = 0; i < this.timelineSnapshotList.length; i++) {
        this.historyRecordTemplate += "0"; // Initially, node/edge are supposed not to be in any entry in timeline snapshots
      }
    },

    // Load single snapshot
    loadSnapshot(snapshot, timelineFrameIndex) {
      let snapshotInJSON = this.convertSnapshotToJSON(snapshot);
      let {
        currentSnapshotNodeList,
        currentSnapshotEdgeList,
      } = this.readNodesAndEdges(snapshotInJSON /*, timelineFrameIndex*/);
      this.matchAndMergeSnapshot(
        currentSnapshotNodeList,
        currentSnapshotEdgeList,
        timelineFrameIndex
      );
    },

    // Parse snapshots and return it as a string
    // Two approaches:
    // 1- Download all then parse
    // 2-Download and parse immediately (selected)
    async downloadSnapshot(snapshot) {
      // Format of snapshot should be 'YYYY-MM-DDTHH:MM:SSZ' e.g. '2012-12-12T08:18:46Z' (obsolete)
      // New format is 14-digit format
      // let snapshotDate = new Date(snapshot); // Create date for snapshot object

      // Load the snapshot
      return await this.$axios
        .get(
          this.getLinkservRequestURLHub["graph"]
            .replace(
              "{0}",
              snapshot
            )
            .replace(
              "{1}",
              1/*this.toolbarItems.depthGroup.controlList.graphDepth
                .value*/ /*this.graphDepth*/
            ),
          { responseType: "text" }
        )
        .then((response) => {
          return typeof response.data === "object"
            ? JSON.stringify(response.data)
            : response.data;
          // return JSON.stringify(response.data);
          // return (response.data === "object")?JSON.stringify(response.data):response.data
          // if (typeof response.data === "object") {
          //   let temp = JSON.stringify(response.data); // Convert to string
          //   return temp
          // } else {
          //   return response.data;
          // }
        });
    },

    // Convert the snapshot in string format  to JSON
    convertSnapshotToJSON(snapshot) {
      return JSON.parse("[" + snapshot.replace(/}\s*{/gm, "},{") + "]"); // Add comma to separate between objects. Then, prepend and append array brackets
      // This is a normal JSON that can be parsed friendly,
    },

    // Read nodes and edges in JSON format and store them in this.cytoNodes and this.cytoEdges
    readNodesAndEdges(snapshotInJSON) {
      // Prepare public suffix list
      // PLSUtilities.parse(PLSUtilities.PLSData, punycode.toASCII);   // TODO: It's called in this.$nextTick. Is this enough
      let currentSnapshotNodeList = []; // List of all read nodes of this snapshot
      let currentSnapshotEdgeList = []; // List of all read edges of this snapshot

      // TODO: Synthesized node shouldn't be existing

      // Loop through snapshotInJSON for reading nodes and edges
      for (let i = 0; i < snapshotInJSON.length; i++) {
        // if ("an" in snapshotInJSON[i]) {
        if (snapshotInJSON[i].hasOwnProperty("an")) {
          // nodeCountTemp++;
          let node = snapshotInJSON[i]["an"]; // Get node
          let nodeXID = Object.keys(node)[0]; // Get node ID which is XID

          let ssurtURL = node[nodeXID]["identifier"]; // according to new names instead of "url"
          this.insertInOrder(
            { xid: nodeXID, ssurtURL: ssurtURL /*, realID: undefined*/ },
            "xid",
            (listElement, targetValue) => listElement > targetValue,
            currentSnapshotNodeList
          );
          // } else if ("ae" in snapshotInJSON[i]) {
        } else if (snapshotInJSON[i].hasOwnProperty("ae")) {
          // edgeCountTemp++;
          let edge = snapshotInJSON[i]["ae"];
          let edgeXID = Object.keys(edge)[0];
          let sourceNodeXID = edge[edgeXID]["source"];
          let targetNodeXID = edge[edgeXID]["target"];

          currentSnapshotEdgeList.push({
            xid: edgeXID,
            sourceXID: sourceNodeXID,
            targetXID: targetNodeXID,
          });
        }
      }
      return {
        currentSnapshotNodeList: currentSnapshotNodeList,
        currentSnapshotEdgeList: currentSnapshotEdgeList,
      };
    },

    // Perform matching and merging for a snapshot into main nodes and edges
    // nodeList: List of all read nodes
    // edgeList: List of all read edges
    matchAndMergeSnapshot(
      currentSnapshotNodeList,
      currentSnapshotEdgeList,
      timelineFrameIndex
    ) {
      // Loop through all nodes for insertion into "this.cytoNodes"
      // currentSnapshotNodeList.forEach((node) => {
      for (let index = 0; index < currentSnapshotNodeList.length; index++) {
        let node = currentSnapshotNodeList[index];
        // Check if inserted before
        if (this.nodeURLBasedIndexerMap.has(node.ssurtURL)) {
          let nodeID = this.nodeURLBasedIndexerMap.get(node.ssurtURL); // Check this node was inserted before
          let nodeIndex = this.searchBinary(
            "data.id",
            nodeID,
            this.cytoNodes
          ); // Search nodes using binary search
          let targetNode = this.cytoNodes[nodeIndex];
          if (!targetNode) {
          }

          // modify node history record
          targetNode.data.nodeHistoryRecord = utilities.setCharAt(
            targetNode.data.nodeHistoryRecord,
            timelineFrameIndex,
            "1"
          );
        } else {
          // New node should be inserted
          this.insertNode(node.ssurtURL, timelineFrameIndex);
        }
      }

      // Loop through all edges for insertions into "this.cytoEdges"
      for (let index = 0; index < currentSnapshotEdgeList.length; index++) {
        let edge = currentSnapshotEdgeList[index];
        let sourceSSURT =
          currentSnapshotNodeList[
            this.searchBinary(
              "xid",
              edge.sourceXID,
              currentSnapshotNodeList
            )
          ].ssurtURL;
        let targetSSURT =
          currentSnapshotNodeList[
            this.searchBinary(
              "xid",
              edge.targetXID,
              currentSnapshotNodeList
            )
          ].ssurtURL;
        // let edgeKey = [sourceSSURT, targetSSURT];  // Not working as the is the array reference not the array elements
        let edgeKey = sourceSSURT + " " + targetSSURT;
        if (this.edgeURLBasedIndexerMap.has(edgeKey)) {
          // Existing edge
          let edgeID = this.edgeURLBasedIndexerMap.get(edgeKey);
          let edgeIndex = this.searchBinary(
            "data.id",
            edgeID ,
            this.cytoEdges
          );
          let targetEdge = this.cytoEdges[edgeIndex];

          targetEdge.data.edgeHistoryRecord = utilities.setCharAt(
            targetEdge.data.edgeHistoryRecord,
            timelineFrameIndex,
            "1"
          );
        } else {
          // Add new edge
          // But before inserting new edge, we need to get the id of new
          this.insertEdge(sourceSSURT, targetSSURT, timelineFrameIndex);
          insertEdgeCount++;
        }
      }
    },

    // Insert "targetObject" into "targetList" in order using key and a compare function
    insertInOrder(targetObject, key, shiftingConditionFunction, targetList) {
      let index = targetList.length - 1;
      let found = false;
      while (index >= 0 && !found) {
        shiftingConditionFunction(targetList[index][key], targetObject[key])
          ? index--
          : (found = true); // Sorting will be based on URL
      }
      targetList.splice(index + 1, 0, targetObject); // Insert the object
    },

    // Add the node using insertion sort way
    // async addNodeUsingInsertionSort(
    insertNode(ssurtURL, timelineFrameIndex) {
      let regularURL = ssurt.ssurtToRegularURL(ssurtURL); // Get the regular url

      // Shorten the url to be suitable for a label
      let index = utilities.indexOfNth(regularURL, "/", 3);
      let label = index !== -1 ? regularURL.substring(0, index) : regularURL;
      let domainName = regularURL ? this.getDomainName(regularURL) : null; // Get domain // TODO: This is a test, put the actual code
      // TODO: you can eliminate these temp variables and directly add them in the objects
      let fileType = this.guessFileType(regularURL); // Guess the file type
      let countryCode = this.guessCountryCode(domainName); // Guess the country code
      // After generating then id, convert it to string
      let nodeID = generateID("ne"); /*+ ""*/ // according to discuss with Amr Morad, we'll generate a new ID
      let nodeHistoryRecord = utilities.setCharAt(
        this.historyRecordTemplate,
        timelineFrameIndex,
        "1"
      );

      if (domainName) {
        // check if "nodeDomainCluster" has a key equal to "domainName"
        if (this.nodeDomainCluster.hasOwnProperty(domainName)) {
          // Push new entry in the array
          this.nodeDomainCluster[domainName].nodeList.push(nodeID);
        } else {
          // Create new array
          this.nodeDomainCluster[domainName] = {};
          this.nodeDomainCluster[domainName].nodeList = [nodeID];

          // Here, try to fetch favicon for each node
          // TODO: Urgent! Comment for now favicon proxy solution till you get Tasneem' another solution
          // this.nodeDomainCluster[
          //   domainName
          // ].faviconData = await this.getFaviconDataURL(domainName);
          // Here, in this point we should the part of loading the favicon
          // TODO: Is it easy to do? Needs investigation?
        }
      }
      // TODO: Add a handler for case such as 'https://s3.amazonaws.com/com.alexa.toolbar/atbp/4cE76z/download/index.htm'
      // TODO: This is urgent task

      // Insert the new node
      this.cytoNodes.push({
        // TODO: Add the actual URL, actual file type
        data: {
          id: nodeID, // real ID
          label: label, // label: will hold the short form
          // TODO: URGENT! Remove favicon for now
          // faviconData: domainName
          //   ? this.nodeDomainCluster[domainName].faviconData
          //   : "",
          url: regularURL, //"https://vuetifyjs.com", // TODO: This is a test, put the actual code
          fileType: fileType, //"pdf", // TODO: This is a test, put the actual code
          countryCode: countryCode, //"eg", // TODO: This is a test, put the actual code
          nodeHistoryRecord: nodeHistoryRecord,
          // FUTURE TODO: Try a better solution for handling
          // parent: domainName ? domainName : undefined,
          parent: domainName ? domainName.replace(/\./g, "_") : undefined,
          // domain: this.getDomainName(url), // calculate domain name // RETHINK
          // }),
        },
      });

      // Update indexer for finding the next
      this.nodeURLBasedIndexerMap.set(ssurtURL, nodeID);

      // TODO: Maybe you need to check that this condition will not fail
      if (!this.rootNodeID) {
        let tempURL = new URL(this.targetURL);
        if (tempURL.href === regularURL) {
          // First condition is added in order to try to speed up the search if found
          // This is the available way for getting root node as we have no way from link-serv requests
          this.rootNodeID = nodeID;
        }
      }
    },

    // Add new edge
    insertEdge(sourceSSURT, targetSSURT, timelineFrameIndex) {
      let sourceNodeID = this.nodeURLBasedIndexerMap.get(sourceSSURT); // Get source node ID (realID)
      let targetNodeID = this.nodeURLBasedIndexerMap.get(targetSSURT); // Get target node ID (realID)
      let edgeID = generateID("ne"); /*+ ""*/ // Real ID (Convert it to string)

      this.cytoEdges.push({
        data: {
          id: edgeID, // real ID
          source: sourceNodeID,
          target: targetNodeID,
          edgeHistoryRecord: utilities.setCharAt(
            this.historyRecordTemplate,
            timelineFrameIndex,
            "1"
          ),
        },
      });

      // Update the indexer
      this.edgeURLBasedIndexerMap.set(sourceSSURT + " " + targetSSURT, edgeID);
    },

    // Try to guess the country code from the domain (egyptian www.nissan.com.eg, british www.nissan.co.uk,..etc)
    // Note: This is a heuristic method for knowning the origin from the url. This is just a proof of concept
    // We don't rely on IP for knowing the origin of the URL.
    // Maybe another technologies like AI can be used for guessing how to know the origin
    guessCountryCode(domain) {
      // Try to get the last part of the domain if exists
      let guessedCode = domain.substring(domain.lastIndexOf(".") + 1);
      if (guessedCode.length !== 2) {
        // Cannot be country code
        return "";
      } else {
        // try to search that part of the domain to get the country
        let index = this.searchBinary(
          "ccTLD",
          guessedCode,
          wwwData.countryCodeTLDList
        );
        if (index !== -1) {
          // This is a valid country code
          return guessedCode;
        } else {
          // No country code found
          return "";
        }
      }
    },

    // Try to guess file type from the url
    // Note: This is a heuristic method for knowing the file type from the url. This is just a proof of concept
    guessFileType(url) {
      // Construct a URL class for trying to guess the file type
      let guessedFileType = "";
      try {
        let tempURL = new URL(url);
        let index = tempURL.pathname.lastIndexOf(".");
        if (index !== -1) {
          guessedFileType = tempURL.pathname.substring(index + 1);
          // Check if the file type exists in
          let idx = this.searchBinary(
            "ext",
            guessedFileType,
            wwwData.fileExtensionList
          );
          if (idx === -1) {
            // No valid extension
            guessedFileType = "";
          }
        }
      } catch (error) {
        console.error(error.toString());
      } finally {
        return guessedFileType; // For now
      }
    },

    // Handle animation action received by user
    doAnimationAction(actionType) {
      switch (actionType) {
        // Start playing animation
        case "play":
          this.playTimelineAnimation();
          break;

        // Pause playing animation
        case "pause":
          this.pauseTimelineAnimation();
          break;

        default:
          // Never reach this point
          throw new Error("Unsupported Timeline Animation Action!");
          break;
      }
    },

    // Toggle the repeat playing animation
    toggleRepeat(repeat) {
      this.repeatTimelinePlay = repeat;
    },

    // Play animation in the time line
    async playTimelineAnimation() {
      this.currentAnimationAction = "playing";
      // this.currentPlayedFrameIndex = startFrameIndex;

      //this.setFrame(startFrameIndex); // Initially, set the frame in the beginning
      do {
        // for (let index = startFrameIndex; index < endFrameIndex; index++) {
        // let animationLoopDone = false;
        while (
          // !animationLoopDone /*this.currentPlayedFrameIndex < endFrameIndex*/
          this.currentAnimationAction === "playing"
        ) {
          await this.advanceToFrame(this.currentPlayedFrameIndex + 1);
          this.currentPlayedFrameIndex++;
          if (
            this.currentPlayedFrameIndex ===
            this.timelineSnapshotList.length - 1
          ) {
            // Go to the first frame
            await this.advanceToFrame(0);
            //this.setFrame(0)
            // animationLoopDone = true;
            this.currentPlayedFrameIndex = 0;
            if (this.currentAnimationAction === "playing") {
              this.currentAnimationAction = "ready";
            }
          }
        }
      } while (this.repeatTimelinePlay);
    },

    // Advance Frame in animation
    async advanceToFrame(nextFrameIndex) {
      // advance one frame
      // Search for the nodes that should be animated
      let animatedNodes = this.cyto.nodes().filter((node) => {
        return (
          !node.isParent() &&
          node.data("nodeHistoryRecord")[this.currentPlayedFrameIndex] !==
            node.data("nodeHistoryRecord")[nextFrameIndex]
        );
      });

      // Animate them
      // First,  animate the nodes that are non-existed at current frame and should be existed in the next frame
      this.animationShownNodeList = animatedNodes.filter((node) => {
        return (
          node.data("nodeHistoryRecord")[this.currentPlayedFrameIndex] === "0"
        );
      });

      let showingAnimationPromise = null;
      if (this.animationShownNodeList.length > 0) {
        // Begin animation for the showing
        showingAnimationPromise = new Promise((resolve) => {
          this.showingAnimationPromiseResolver = resolve; // Save reference to resolver for external call
          this.animationShownNodeList.animate(
            {
              style: { opacity: "1" /*, "background-color": "blue" */ },
            },
            {
              duration: this.$config.frameTime,
              complete: () => {
                console.log("Showing Animation complete");
                self.showingAnimationPromiseResolver = null; // No need for this resolver
                resolve();
              },
            }
          );
        });
      }

      // Second,  animate the nodes that are existed at current frame and should be non-existed in the next frame
      this.animationHiddenNodeList = animatedNodes.filter((node) => {
        return (
          node.data("nodeHistoryRecord")[this.currentPlayedFrameIndex] === "1"
        );
      });

      let hidingAnimationPromise = null;
      if (this.animationHiddenNodeList.length > 0) {
        // Begin animation for the hiding
        hidingAnimationPromise = new Promise((resolve) => {
          this.hidingAnimationPromiseResolver = resolve; // Save reference to resolver for external call
          this.animationHiddenNodeList.animate(
            {
              style: { opacity: "0.2" /*, "background-color": "red" */ }, // Better to let the node visible with a lower opacity value
            },
            {
              duration: this.$config.frameTime,
              complete: () => {
                console.log("Hiding Animation complete");
                self.hidingAnimationPromiseResolver = null; // No need for this resolver
                resolve();
              },
            }
          );
        });
      }

      if (!showingAnimationPromise && !hidingAnimationPromise) {
        // Nothing needs showing or hiding, just advance to next frame
        await new Promise((resolve) => {
          this.timeoutPromiseResolver = resolve;
          this.animationTimeoutTimer = setTimeout(
            resolve,
            this.$config.frameTime
          );
        }).then(() => {
          console.log("advanceToFrame, setTimeout has just finished");
          this.timeoutPromiseResolver = null;
        });
      } else if (!showingAnimationPromise) {
        await hidingAnimationPromise.then(() => {
          this.hidingAnimationPromiseResolver = null;
        });
      } else if (!hidingAnimationPromise) {
        await showingAnimationPromise.then(() => {
          this.showingAnimationPromiseResolver = null;
        });
      } else {
        await Promise.all([
          showingAnimationPromise,
          hidingAnimationPromise,
        ]).then(() => {
        });
      }
    },

    // Set the frame instantly (before playing or after finishing play)
    setFrame(frameIndex) {
      // Loop through each node and set opacity for
      this.cyto.nodes().forEach((node) => {
        if (!node.isParent()) {
          let opacity = null;
          //   node.data("nodeHistoryRecord")[frameIndex] === "1" ? "1" : "0.2";
          if (node.data("nodeHistoryRecord")[frameIndex] === "1") {
            opacity = "1";
          } else {
            opacity = "0.2";
          }
          node.style({ opacity: opacity });
        }
      });
    },

    // Pause Timeline Animation
    pauseTimelineAnimation() {
      this.currentAnimationAction = "ready";
      // if (this.animationTimeoutTimer) {
      if (this.timeoutPromiseResolver) {
        clearTimeout(this.animationTimeoutTimer);
        this.timeoutPromiseResolver();
        this.timeoutPromiseResolver = null;
        this.animationTimeoutTimer = null;
      }
      if (this.showingAnimationPromiseResolver) {
        this.animationShownNodeList.stop();
        this.showingAnimationPromiseResolver();
        this.showingAnimationPromiseResolver = null;
        this.animationShownNodeList = [];
      }
      if (this.hidingAnimationPromiseResolver) {
        this.animationHiddenNodeList.stop();
        this.hidingAnimationPromiseResolver();
        this.hidingAnimationPromiseResolver = null;
        this.animationHiddenNodeList = [];
      }
    },

    // Hide all nodes completely
    hideAllNodes() {
      this.cyto.$("node").style({ opacity: 0 });
    },

    searchBinary(key, value, targetList) {
      let foundIndex = -1;
      let low = 0;
      let high = targetList.length - 1;
      let mid = -1;
      let keysList = key.split(".");
      let accessor = function (index) {
        let temp = targetList[index];
        for (let i = 0; i < keysList.length; i++) {
          temp = temp[keysList[i]];
        }
        return temp;
      };
      while (foundIndex === -1 && low <= high) {
        mid = Math.trunc((low + high) / 2);
        switch (value) {
          case accessor(low): //targetList[low][data][key]:
            foundIndex = low;
            break;

          case accessor(high): //targetList[high][data][key]:
            foundIndex = high;
            break;

          case accessor(mid): //targetList[mid][data][key]:
            foundIndex = mid;
            break;

          default:
            if (value > accessor(mid) /*targetList[mid][data][key]*/) {
              low = mid + 1;
            } else {
              high = mid - 1;
            }
            break;
        }
      }
      return foundIndex;
    },

    // Clear timeline from any data and return to normal mode
    clearTimeline() {},

    //----------------------------------------------------------------------------------------------------------------

    // Call after graph is rendered and for only one time
    onRenderOnce() {
      // Enable Zoom Group buttons
      this.enableZoomButtons(true);

      // Enable Expand all and collapse all buttons
      this.enableCollapseAllExpandAllButtons(true);

      this.enableNodeFilter(true);
      // this.enableDepthSlider(true);
      this.enableReloadButton(true);
      this.enableScreenshotButton(true);
      this.enableShowSettingsButton(true);
      // this.enableSettingsButton(true);
    },

    // Load part of search tree
    async loadSearchTreePart(searchTreeItem) {
      // At this point, year(s) are loaded if exist(s)
      // Since we made some modification, we have to figure out which item has been clicked
      // if (searchTreeItem.id.startsWith("y")) {
      switch (searchTreeItem.type) {
        case "y":
          // Year Item
          await this.loadVersionCountMonthly(searchTreeItem.value).then(
            (response) => {
              // searchTreeItem.name = year
              for (const [key, value] of Object.entries(response.data)) {
                searchTreeItem.children.push({
                  // Let id start with m to discriminate it from year
                  // id: "m" + (key.length === 1 ? "0" : "") + key + searchTreeItem.id,
                  id: generateID(),
                  type: "m", // Type of node is year
                  value: (key.length === 1 ? "0" : "") + key, // Value
                  ///*searchTreeItem.id +*/ , //generateID(), // id is a MUST for making prop "activable" working
                  name: monthStringList[key - 1],
                  parent: searchTreeItem, // Parent
                  ...(this.getGraphLocatorModeOptionList[
                    this.selectedGraphLocatorModeIndex
                  ] === "View Snapshots in Calendar"
                    ? {}
                    : { children: [] }),
                  // children: [], // hold the days
                  // hiddenChildren: undefined, // Used for hiding children in changing mode
                });
              }
            }
          );
          break;

        case "m":
          // Month Item
          // Yes, so load version count daily
          await this.loadVersionCountDaily(
            searchTreeItem.parent.value /*year*/,
            searchTreeItem.value /*month*/
          ).then((response) => {
            for (const [key, value] of Object.entries(response.data)) {
              searchTreeItem.children.push({
                id: generateID(),
                type: "d",
                value: (key.length === 1 ? "0" : "") + key,
                name: key,
                parent: searchTreeItem, // Parent
                children: [], // Holds the snapshot
              });
            }
          });
          break;

        case "d":
          // Day Item
          // Yes, so load snapshot count per day
          await this.loadVersions(
            searchTreeItem.parent.parent.value /*year*/,
            searchTreeItem.parent.value /*month*/,
            searchTreeItem.value /*day*/
          ).then((response) => {
            let snapshots =
              typeof response.data !== "string"
                ? response.data.toString().split(",")
                : response.data.split(","); // Better code

            snapshots.forEach((oneSnapshot) => {
              // Prepare an informative label for the snapshot
              let label = oneSnapshot.substring(8);
              label =
                label.substr(0, 2) +
                ":" +
                label.substr(2, 2) +
                ":" +
                label.substr(4, 2);

              // Save single snapshot
              searchTreeItem.children.push({
                id: generateID(),
                type: "s",
                value: oneSnapshot, // Actual value
                name: label,
                parent: searchTreeItem, // Parent
                // children: [], // Holds the snapshot (But since this is a snapshot, so no children exist)
              });
              // this.snapshotList.push({
              // shortTimestamped: oneSnapshot.substring(
              //   oneSnapshot.indexOf("T") + 1,
              //   oneSnapshot.indexOf("Z")
              // ),
              // longTimestamped: oneSnapshot,
              // });
              // console.log("snapshot : " + oneSnapshot);
            });
          });
          break;

        default:
          // You should never reach this point!!!
          throw new Error("Unhandled search tree item!!");

          break;
      }
    },

    // Get stored version count for a given url per year
    async loadVersionCountYearly() {
      console.log('this.getLinkservRequestURLHub["versionCountsYearly"]');
      console.log(this.getLinkservRequestURLHub["versionCountsYearly"]);
      let result = await this.$axios.$get(
        // this.linkservRequestBaseURLStore["versionCountsYearly"]
        this.getLinkservRequestURLHub["versionCountsYearly"]
      );

      // Parse the result
      for (const [key, value] of Object.entries(result)) {
        this.searchTreeItems.push({
          // Add "y" prefix for a year item in the tree
          // id: "y" + key, //generateID(), // id is a MUST for making prop "activable" working
          id: generateID(), // id is a MUST for making prop "activable" working
          type: "y", // Type of node is year
          value: key, // Value
          name: key, // Display Name
          children: [],
        });
      }

      // Check that if no entries for years, then display an info for user
    },

    // Get stored verison count for a given url with a given year per day
    async loadVersionCountMonthly(year) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versionCountsMonthly"].replace(
          "{0}",
          year
        )
      );
    },

    // Future TODO: This method is a duplicate one in the component "EventCalendar.vue". Try to eliminate duplicates
    // Get stored version count for a given url with a given year and a given month per day
    async loadVersionCountDaily(year, month) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versionCountsDaily"]
          .replace("{0}", year)
          .replace("{1}", month)
      );
    },

    // Future TODO: This method is a duplicate one in the commponent "EventCalendar.vue". Try to eliminate duplicates
    // Get all versions for a date 'YYYY-MM-DD'
    // year, month and day should all be string
    async loadVersions(year, month, day) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versions"].replace(
          "{0}",
          // `${year}-${month}-${day <= 9 ? "0" : ""}${day}`
          // `${year}-${month}-${day}`    // Old when dashes was separators
          `${year}${month}${day}` // New without dashes
        )
      );
    },

    // Load Graph with a given snapshot
    async loadGraphWithSnapshot(snapshot /*, selectedDay*/) {
      // Format of snapshot will be 'YYYY-MM-DDTHH:MM:SSZ' e.g. '2012-12-12T08:18:46Z'  (Obsolete)
      // Format of snapshot now should be 'YYYYMMDDHHMMSS' (14-digit format)
      console.log("Inside loadGraph(snapshot), snapshot = " + snapshot);

      // Replace old code with old date with a new one
      this.currentGraphSnapshotDate = snapshot; // save snapshot date

      await this.loadGraph();
    },

    // Load a graph
    async loadGraph() {
      this.setProgressIndicatorVisibility(true);    // Show progress bar
      let graph = await this.$axios.$get(
        this.getLinkservRequestURLHub["graph"]
          .replace("{0}", /*snapshot*/ this.currentGraphSnapshotDate)
          .replace(
            "{1}",
            1/*this.toolbarItems.depthGroup.controlList.graphDepth
              .value*/ /*this.graphDepth*/
          ),
        { responseType: "text" }
      );

      if (typeof graph === "object") {
        graph = JSON.stringify(graph); // Convert to string
      }

      if (graph.length !== 0) {
        this.rebuildGraph(graph);
      }
    },

    // Parse Data returned successfully from link-serv almost as a JSON file (Actually it's a format compatible with Gephi)
    async parseLinkServData(linkServJSON) {
      // Now, this file contains multiple root JSON object which is not standard.
      // For solving this problem, we'll try to add some characters to make it standard
      let linkServJSONModified = linkServJSON.replace(/}\s*{/gm, "},{"); // Add comma to separate between objects
      linkServJSONModified = "[" + linkServJSONModified + "]"; // Append array brackets

      // Now this is a normal JSON that can be parsed friendly,

      // Parse JSON file into JS objects
      let linkServGraph = JSON.parse(linkServJSONModified);
      let i;
      let postponedEdges = {}; // Hold edges that will be detected in later after parsing

      for (i = 0; i < linkServGraph.length; i++) {
        if (linkServGraph[i].hasOwnProperty("an")) {
          let node = linkServGraph[i]["an"];
          let nodeID = Object.keys(node)[0];
          // Old code with "url", replaced with "identifier"
          // let nodeURL = node[nodeID]["url"];
          let nodeURL = node[nodeID]["identifier"];
          let xPos = node[nodeID]["x"];
          let yPos = node[nodeID]["y"];
          let tempURLStr = ssurt.ssurtToRegularURL(nodeURL);
          // TODO: This is a fast way for getting the domain instead. Maybe it can be perfect and fast.
          //       But if it's not working, return back to class "URL"
          let tempIndex = utilities.indexOfNth(tempURLStr, "/", 3);
          let shortName =
            tempIndex !== -1 ? tempURLStr.substring(0, tempIndex) : tempURLStr;

          // Add the node using insertion sort way
          await this.addNodeUsingInsertionSort(nodeID, {
            label: shortName,
            // fileType: "pdf",
            url: tempURLStr,
            // countryCode: "eg",
          });

        } else if (linkServGraph[i].hasOwnProperty("ae")) {
          let edge = linkServGraph[i]["ae"];
          let edgeID = Object.keys(edge)[0];
          let sourceNodeID = edge[edgeID]["source"];
          let targetNodeID = edge[edgeID]["target"];

          // PROOF of CONCEPT
          let edgeData = {
            data: { id: edgeID, source: sourceNodeID, target: targetNodeID },
          };
          this.cytoEdges.push(edgeData);

          // Better code
          [sourceNodeID, targetNodeID].forEach((nodeID) => {
            if (this.makeBinarySearchOnNodes(nodeID) === -1) {
              if (postponedEdges[nodeID] === undefined) {
                postponedEdges[nodeID] = [edgeData];
              } else {
                postponedEdges[nodeID].push(edgeData);
              }
            }
          });
        }
      }

      this.addDomainNodes();

      // Add synthesized nodes stage
      let addedNodeCount = 0;
      for (let nodeID in postponedEdges) {
        if (this.makeBinarySearchOnNodes(nodeID) === -1) {
          this.addNodeUsingInsertionSort(nodeID); // This is a synthesized node, so option passed
          addedNodeCount++;
        }
      }
      // setup "ciseClusterInfo" for using in CISE Layout
      for (const domain in this.nodeDomainCluster) {
        // "ciseClusterInfo" will be array of arrays as stated by CISE Layout documentation
        this.ciseClusterInfo.push(this.nodeDomainCluster[domain].nodeList);
      }

      // Till this point, "rootNodeID" should be found. If not print an error message in the console
      if (!this.rootNodeID) {
        console.error("Root node ID is still not Found!!Check your code");
        alert("Root node ID is still not Found!!Check your code");
      }
      // if (addedNodeCount === 0) {
      //   console.log("No new node was added");
      // } else {
      //   console.log(
      //     `${addedNodeCount} new node${
      //       addedNodeCount === 1 ? " was" : "s were"
      //     } added`
      //   );
      // }
    },

    // Perform some statistics
    readStatisticsData() {
      // Outlinks min and max
      let minOutlinkCount = this.cyto.nodes().min(function (node) {
        return node.outgoers("edge").length;
      }).value;
      let maxOutlinkCount = this.cyto.nodes().max(function (node) {
        return node.outgoers("edge").length;
      }).value;
      this.outlinkCountMinMaxPair = new MinMaxPair(
        minOutlinkCount,
        maxOutlinkCount
      );

      // Inlinks min and max
      let minInlinkCount = this.cyto.nodes().min(function (node) {
        return node.incomers("edge").length;
      }).value;
      let maxInlinkCount = this.cyto.nodes().max(function (node) {
        return node.incomers("edge").length;
      }).value;
      this.inlinkCountMinMaxPair = new MinMaxPair(
        minInlinkCount,
        maxInlinkCount
      );
    },

    // Make binary search in nodes
    makeBinarySearchOnNodes(tokenID) {
      let foundIndex = -1;
      let low = 0;
      let high = this.cytoNodes.length - 1;
      let mid = -1;
      while (foundIndex === -1 && low <= high) {
        mid = Math.trunc((low + high) / 2);
        switch (tokenID) {
          case this.cytoNodes[low].data.id:
            foundIndex = low;
            break;

          case this.cytoNodes[high].data.id:
            foundIndex = high;
            break;

          case this.cytoNodes[mid].data.id:
            foundIndex = mid;
            break;

          default:
            if (tokenID > this.cytoNodes[mid].data.id) {
              low = mid + 1;
            } else {
              high = mid - 1;
            }
            break;
        }
      }
      return foundIndex;
    },

    // Add the node using insertion sort way
    async addNodeUsingInsertionSort(
      nodeID,
      { label = "XXX", /*fileType = "", countryCode = "",*/ url = "" } = {}
    ) {
      let index = this.cytoNodes.length - 1;
      let found = false;
      while (index >= 0 && !found) {
        this.cytoNodes[index].data.id <= nodeID ? (found = true) : index--;
      }

      // Add node ID to cluster structure
      // console.log("Inside node, url = " + url);
      let domainName = url === "" ? null : this.getDomainName(url); // TODO: This is a test, put the actual code
      // console.log("Inside node, domainName = " + domainName);

      // if (domainName !== null) {
      if (domainName) {
        // check if "nodeDomainCluster" has a key equal to "domainName"
        if (this.nodeDomainCluster.hasOwnProperty(domainName)) {
          // Push new entry in the array
          this.nodeDomainCluster[domainName].nodeList.push(nodeID);
        } else {
          // Create new array
          this.nodeDomainCluster[domainName] = {};
          this.nodeDomainCluster[domainName].nodeList = [nodeID];

          // Here, try to fetch favicon for each node
          // TODO: Urgent! Comment favicon for now
          // this.nodeDomainCluster[
          //   domainName
          // ].faviconData = await this.getFaviconDataURL(domainName);
          // Here, in this point we should the part of loading the favicon
          // TODO: Is it easy to do? Needs investigation?
        }
      }
      // TODO: Add a handler for case such as 'https://s3.amazonaws.com/com.alexa.toolbar/atbp/4cE76z/download/index.htm'
      // TODO: This is urgent task

      let fileType = this.guessFileType(url); // Guess the file type
      let countryCode = this.guessCountryCode(domainName); // Guess the country code

      this.cytoNodes.splice(index + 1, 0, {
        // TODO: Add the actual URL, actual file type
        data: {
          id: nodeID,
          label: label, // label: will hold the short form
          faviconData: domainName
            ? this.nodeDomainCluster[domainName].faviconData
            : "",
          ...(label === "XXX"
            ? {}
            : {
                url: url, //"https://vuetifyjs.com", // TODO: This is a test, put the actual code
                fileType: fileType, //"pdf", // TODO: This is a test, put the actual code
                countryCode: countryCode, //"eg", // TODO: This is a test, put the actual code
                // FUTURE TODO: Try a better solution for handling
                // parent: domainName ? domainName : undefined,
                parent: domainName ? domainName.replace(/\./g, "_") : undefined,
                // domain: this.getDomainName(url), // calculate domain name // RETHINK
              }),
        },
      });
      // TODO: Maybe you need to check that this condition will not fail
      if (!this.rootNodeID) {
        let tempURL = new URL(this.targetURL);
        if (tempURL.href === url) {
          // First condition is added in order to try to speed up the search if found
          // This is the available way for getting root node as we have no way from link-serv requests
          this.rootNodeID = nodeID;
        }
      }
    },

    // Add domain nodes
    addDomainNodes() {
      for (const domain in this.nodeDomainCluster) {
        this.cytoNodes.push({
          // Modifiy id to avoid using special characters in id field to avoid problems is selection
          // FUTURE TODO: Try a better solution for handling
          data: {
            id: domain.replace(/\./g, "_"),
            label: domain,
            // faviconData: "",
          },
        });
      }
    },

    // Extract the domain from a given URL
    getDomainName(url) {
      let host = null; // "null" will be returned if an exception occurred
      let refinedHost = null;
      try {
        host = new URL(url).host;
        // If the above line works successfully, the host is value and we can then manipulation domain
        // refinedHost = this.refineDomain(host);
        refinedHost = PLSUtilities.getDomain(host);
        // console.log("Inside getDomainName, refinedHost :  " + refinedHost);
      } catch (exp) {
        // Print error
        console.exception(exp.toString());
      } finally {
        return refinedHost;
      }
    },

    // New code
    // Get favicon as a data URI in Base64 encoding
    async getFaviconDataURL(url) {
      // Proxy URL for overcoming CORS
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      //const proxyUrl = "https://favicongrabber.com/download/";//https://favicongrabber.com/download/https://www.google.com/favicon.ico

      let tempURL = {};
      let faviconURL = "";
      try {
        // Check if the url has prefix
        tempURL = new URL(
          (!url.toLowerCase().startsWith("http") ? "http://" : "") + url
        );
        faviconURL = tempURL.protocol + "//" + tempURL.host + "/favicon.ico";
      } catch (error) {
        console.error(error.toString());
      }
      const imageURL = proxyUrl + faviconURL; // Final URL for retrieving image
      console.log("imageURL : " + imageURL);

      // const imgurl = document.getElementById("url");
      const convertImgToBase64URL = (imageURL) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            let canvas = document.createElement("CANVAS");
            const ctx = canvas.getContext("2d");
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL();
            canvas = null;
            resolve(dataURL);
          };
          // Error Handler
          img.onerror = (error) => {
            console.error("Error : " + error.toString());
            console.error(error);
            reject(error);
          };
          img.src = imageURL;
        });
      };
      return convertImgToBase64URL(imageURL);
    },

    // Load all needed favicons
    async loadFaviconList() {
      for (const domain in this.nodeDomainCluster) {
        // This field will hold favicon data which will base64 encoding format
        this.nodeDomainCluster[
          domain
        ].faviconData = await this.getFaviconDataURL(domain);
        // TODO: This solution may be pour. Try to revamp this later
        // for (const node in this.nodeDomainCluster[domain].nodeList) {
        //   node.data("faviconData", this.nodeDomainCluster[domain].faviconData);
        // }
      }
    },

    // Reset all UI and let it in a state before adding data
    reset() {
      // this.graphDepth = 1;
      // this.toolbarItems.depthGroup.controlList.graphDepth.value = 1;
      // this.zoomLevel = 1;
      this.showGraphLocator = false;
      this.showRightToolbar = false;
      // this.showUpperToolbar = false;
      this.showInfoBoard = false;

      this.searchTreeItems = [];
      // Clear network
      this.resetNetwork();
    },

    // Reset network that holds the graph
    resetNetwork() {
      if (this.cyto) {
        console.log("Cleaning Up Cytoscape...");
        this.cyto.removeData();
        this.cyto.elements().remove(); // Remove all data
        console.log("Cytoscape Cleaned up Successfully");
      }
      this.cytoNodes = [];
      this.cytoEdges = [];
      this.rootNodeID = null;
      this.ciseClusterInfo = [];
      this.nodeDomainCluster = {};
    },

    // Reload another graph with a new URL
    resetupURL(url) {
      // Here, try to change the url in the address bar to let the user use the direct url
      window.history.pushState(
        "",
        "",
        `${this.$route.path}?url=${encodeURIComponent(url)}`
      );
      this.reset();

      this.setupURL(url);
      this.loadVersionCountYearly();
    },

    // Rebuild the graph and delete old graph if exists
    rebuildGraph(graphAsJSON) {
      this.resetNetwork(); // Clear anything if exists

      this.buildGraph(graphAsJSON); // Build the graph
    },

    // Initialize Graph
    async buildGraph(graphAsJSON) {
      await this.parseLinkServData(graphAsJSON);

      // Load all needed favicons
      // await this.loadFaviconList();
      //

      // t1 = new Date().getTime()     // Second tick or the base

      if (!this.cyto) {
        this.cyto = cytoscape({
          elements: {
            nodes: this.cytoNodes,
            edges: this.cytoEdges,
          },
          style: [
            {
              selector: "node",
              style: {
                ...this.normalNodeStyle, // Use spread operator for adding node style
                // TODO: urgent!!background-image is commented for trying to solve the problem
                // "background-image": function (node) {
                //   return node.data("faviconData");
                //   // return this.nodeDomainCluster[
                //   //   this.getDomainName(node.data("url"))
                //   // ].faviconData;
                // },
                // "background-fit": "cover",

                // shape: "hexagon",
                // "background-color": "red",
                // // "background-image": [
                // //   // "https://upload.wikimedia.org/wikipedia/commons/b/b4/High_above_the_Cloud_the_Sun_Stays_the_Same.jpg",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // // ],
                // "background-fit": "cover  cover", // "none","contain", or "cover"
                // "background-image-opacity": "1.0 0.2",
                // "background-clip": "node none", // values: "node", or "none"
                // "background-offset-x": "0 -100%", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "background-offset-y": "0 0", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "bounds-expansion": "20px", //bounds-expansions accepts 1 value (for all directions), 2 values, ([topAndBottom, leftAndRight]) or 4 values ([top, right, bottom, left])
                // "background-fill": "linear-gradient",
                // "background-gradient-stop-colors": "red yellow",
                // "border-width": 1,
                // "border-color": "black",
                // TODO: Setup a switch statement for better handling labels if more than three options exist
                label:
                  this.getSelectedNodeLabelFormatIndex === 0
                    ? "data(label)"
                    : "data(url)",
                // label: "data(label)", // Will Remain constant all the time
              },
            },
            {
              selector: ":parent",
              style: {
                "background-opacity": 0.333,
              },
            },
            {
              // Class for blinking components with path finder
              selector: ".pathFinderIndicator",
              style: {
                "background-color": "#61bffc",
                "line-color": "#61bffc",
                "target-arrow-color": "#61bffc",
                "transition-property":
                  "background-color, line-color, target-arrow-color",
                "transition-duration": "2s",
              },
            },
            {
              selector: "edge",
              style: {
                ...this.normalEdgeStyle,
                // width: 1,
                // "line-color": "#ccc",
                // "target-arrow-color": "#ccc",
                // "target-arrow-shape": "triangle",
                // "curve-style": "straight", //"unbundled-bezier","bezier","haystack"
              },
            },
          ],

          // interaction options:
          selectionType: "single", // valid values: 'single' and 'additive'
          boxSelectionEnabled: false,

          // rendering options:
          headless: true,
          textureOnViewport: true,
          hideEdgesOnViewport: true, // while manipulation like panning, zooming, ..etc

          // on layoutready
          // ready: function () {
          //   console.log("Graph is ready");
          // },
          // layout: {
          //   // name: "concentric",
          //   name: "grid",
          // },
        });
        // Moved code from layout calculation to this point
        this.cyto.nodes().on("select", this.onNodeBeingSelected);
        this.cyto.nodes().on("unselect", this.onNodeBeingUnselected);
        this.cyto.nodes().on("grabon", this.onNodeBeingGrabbedOn);
        this.cyto.nodes().on("dragfreeon", this.onNodeBeingdragFreeOn);

        this.cyto.one("render", this.onRenderOnce);

        // TODO try to make it be initialized only once
        // cytoscape.use(klay); // register extension
        // cytoscape.use(avsdf); // register extension
        // cytoscape.use(dagre); // register extension
        // cytoscape.use(spread); // register extension
        // cytoscape.use(coseBilkent); // register extension
        cytoscape.use(cise); // register extension
        // cytoscape.use(fcose); // register extension
        // cytoscape.use(cola); // register extension
        // cytoscape.use(euler); // register extension
        // cytoscape.use(elk);// register extension
      } else {
        let tempNodeAndEdgeList = [];
        this.cytoNodes.forEach((node) => {
          tempNodeAndEdgeList.push({ group: "nodes", ...node });
        });
        this.cytoEdges.forEach((edge) => {
          tempNodeAndEdgeList.push({ group: "edges", ...edge });
        });
        this.cyto.add(tempNodeAndEdgeList);
        this.cyto.json({
          style: [
            {
              selector: "node",
              style: {
                ...this.normalNodeStyle, // Use spread operator for adding node style
                // TODO: urgent!!background-image is commented for trying to solve the problem
                // "background-image": function (node) {
                //   return node.data("faviconData");
                //   // return this.nodeDomainCluster[
                //   //   this.getDomainName(node.data("url"))
                //   // ].faviconData;
                // },
                // "background-fit": "cover",

                // shape: "hexagon",
                // "background-color": "red",
                // // "background-image": [
                // //   // "https://upload.wikimedia.org/wikipedia/commons/b/b4/High_above_the_Cloud_the_Sun_Stays_the_Same.jpg",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // // ],
                // "background-fit": "cover  cover", // "none","contain", or "cover"
                // "background-image-opacity": "1.0 0.2",
                // "background-clip": "node none", // values: "node", or "none"
                // "background-offset-x": "0 -100%", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "background-offset-y": "0 0", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "bounds-expansion": "20px", //bounds-expansions accepts 1 value (for all directions), 2 values, ([topAndBottom, leftAndRight]) or 4 values ([top, right, bottom, left])
                // "background-fill": "linear-gradient",
                // "background-gradient-stop-colors": "red yellow",
                // "border-width": 1,
                // "border-color": "black",
                // TODO: Setup a switch statement for better handling labels if more than three options exist
                label:
                  this.getSelectedNodeLabelFormatIndex === 0
                    ? "data(label)"
                    : "data(url)",
                // label: "data(label)", // Will Remain constant all the time
              },
            },
            {
              selector: ":parent",
              style: {
                "background-opacity": 0.333,
              },
            },
            {
              // Class for blinking components with path finder
              selector: ".pathFinderIndicator",
              style: {
                "background-color": "#61bffc",
                "line-color": "#61bffc",
                "target-arrow-color": "#61bffc",
                "transition-property":
                  "background-color, line-color, target-arrow-color",
                "transition-duration": "2s",
              },
            },
            {
              selector: "edge",
              style: {
                ...this.normalEdgeStyle,
                // width: 1,
                // "line-color": "#ccc",
                // "target-arrow-color": "#ccc",
                // "target-arrow-shape": "triangle",
                // "curve-style": "straight", //"unbundled-bezier","bezier","haystack"
              },
            },
          ],
        });
      }
      this.setupLayout();
      // Save the depth
      // this.currentGraphDepth = this.toolbarItems.depthGroup.controlList.graphDepth.value;
      this.reciprocalCurrentGraphDepth = 1.0 / this.currentGraphDepth;
    },

    // Initialize cytoscape
    async initCytoscape(onLayoutReady) {
      if (!this.cyto) {
        this.cyto = cytoscape({
          // container: this.$refs.graph_canvas_ref,
          elements: {
            nodes: this.cytoNodes,
            edges: this.cytoEdges,
          },
          style: [
            {
              selector: "node",
              style: {
                ...this.normalNodeStyle, // Use spread operator for adding node style
                // TODO: urgent!!background-image is commented for trying to solve the problem
                // "background-image": function (node) {
                //   return node.data("faviconData");
                //   // return this.nodeDomainCluster[
                //   //   this.getDomainName(node.data("url"))
                //   // ].faviconData;
                // },
                // "background-fit": "cover",

                // shape: "hexagon",
                // "background-color": "red",
                // // "background-image": [
                // //   // "https://upload.wikimedia.org/wikipedia/commons/b/b4/High_above_the_Cloud_the_Sun_Stays_the_Same.jpg",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // // ],
                // "background-fit": "cover  cover", // "none","contain", or "cover"
                // "background-image-opacity": "1.0 0.2",
                // "background-clip": "node none", // values: "node", or "none"
                // "background-offset-x": "0 -100%", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "background-offset-y": "0 0", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "bounds-expansion": "20px", //bounds-expansions accepts 1 value (for all directions), 2 values, ([topAndBottom, leftAndRight]) or 4 values ([top, right, bottom, left])
                // "background-fill": "linear-gradient",
                // "background-gradient-stop-colors": "red yellow",
                // "border-width": 1,
                // "border-color": "black",
                // TODO: Setup a switch statement for better handling labels if more than three options exist
                label:
                  this.getSelectedNodeLabelFormatIndex === 0
                    ? "data(label)"
                    : "data(url)",
                // label: "data(label)", // Will Remain constant all the time
              },
            },
            {
              selector: ":parent",
              style: {
                "background-opacity": 0.333,
              },
            },
            {
              // Class for blinking components with path finder
              selector: ".pathFinderIndicator",
              style: {
                "background-color": "#61bffc",
                "line-color": "#61bffc",
                "target-arrow-color": "#61bffc",
                "transition-property":
                  "background-color, line-color, target-arrow-color",
                "transition-duration": "2s",
              },
            },
            {
              selector: "edge",
              style: {
                ...this.normalEdgeStyle,
                // width: 1,
                // "line-color": "#ccc",
                // "target-arrow-color": "#ccc",
                // "target-arrow-shape": "triangle",
                // "curve-style": "straight", //"unbundled-bezier","bezier","haystack"
              },
            },
          ],

          // interaction options:
          selectionType: "single", // valid values: 'single' and 'additive'
          boxSelectionEnabled: false,

          // rendering options:
          headless: true,
          textureOnViewport: true,
          hideEdgesOnViewport: true, // while manipulation like panning, zooming, ..etc

          // on layoutready
          // ready: function () {
          //   console.log("Graph is ready");
          // },
          // layout: {
          //   // name: "concentric",
          //   name: "grid",
          // },
        });
        // Moved code from layout calculation to this point
        this.cyto.nodes().on("select", this.onNodeBeingSelected);
        this.cyto.nodes().on("unselect", this.onNodeBeingUnselected);
        this.cyto.nodes().on("grabon", this.onNodeBeingGrabbedOn);
        this.cyto.nodes().on("dragfreeon", this.onNodeBeingdragFreeOn);

        this.cyto.one("render", this.onRenderOnce);

        // TODO try to make it be initialized only once
        // cytoscape.use(klay); // register extension
        // cytoscape.use(avsdf); // register extension
        // cytoscape.use(dagre); // register extension
        // cytoscape.use(spread); // register extension
        // cytoscape.use(coseBilkent); // register extension
        cytoscape.use(cise); // register extension
        // cytoscape.use(fcose); // register extension
        // cytoscape.use(cola); // register extension
        // cytoscape.use(euler); // register extension
        // cytoscape.use(elk);// register extension
      } else {
        let tempNodeAndEdgeList = [];
        this.cytoNodes.forEach((node) => {
          tempNodeAndEdgeList.push({ group: "nodes", ...node });
        });
        this.cytoEdges.forEach((edge) => {
          tempNodeAndEdgeList.push({ group: "edges", ...edge });
        });
        this.cyto.add(tempNodeAndEdgeList);
        this.cyto.json({
          style: [
            {
              selector: "node",
              style: {
                ...this.normalNodeStyle, // Use spread operator for adding node style
                // TODO: urgent!!background-image is commented for trying to solve the problem
                // "background-image": function (node) {
                //   return node.data("faviconData");
                //   // return this.nodeDomainCluster[
                //   //   this.getDomainName(node.data("url"))
                //   // ].faviconData;
                // },
                // "background-fit": "cover",

                // shape: "hexagon",
                // "background-color": "red",
                // // "background-image": [
                // //   // "https://upload.wikimedia.org/wikipedia/commons/b/b4/High_above_the_Cloud_the_Sun_Stays_the_Same.jpg",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // //   "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pigeon_silhouette_4874.svg/1000px-Pigeon_silhouette_4874.svg.png",
                // // ],
                // "background-fit": "cover  cover", // "none","contain", or "cover"
                // "background-image-opacity": "1.0 0.2",
                // "background-clip": "node none", // values: "node", or "none"
                // "background-offset-x": "0 -100%", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "background-offset-y": "0 0", //measured in percent (e.g. 50%) or pixels (e.g. 10px).
                // "bounds-expansion": "20px", //bounds-expansions accepts 1 value (for all directions), 2 values, ([topAndBottom, leftAndRight]) or 4 values ([top, right, bottom, left])
                // "background-fill": "linear-gradient",
                // "background-gradient-stop-colors": "red yellow",
                // "border-width": 1,
                // "border-color": "black",
                // TODO: Setup a switch statement for better handling labels if more than three options exist
                label:
                  this.getSelectedNodeLabelFormatIndex === 0
                    ? "data(label)"
                    : "data(url)",
                // label: "data(label)", // Will Remain constant all the time
              },
            },
            {
              selector: ":parent",
              style: {
                "background-opacity": 0.333,
              },
            },
            {
              // Class for blinking components with path finder
              selector: ".pathFinderIndicator",
              style: {
                "background-color": "#61bffc",
                "line-color": "#61bffc",
                "target-arrow-color": "#61bffc",
                "transition-property":
                  "background-color, line-color, target-arrow-color",
                "transition-duration": "2s",
              },
            },
            {
              selector: "edge",
              style: {
                ...this.normalEdgeStyle,
                // width: 1,
                // "line-color": "#ccc",
                // "target-arrow-color": "#ccc",
                // "target-arrow-shape": "triangle",
                // "curve-style": "straight", //"unbundled-bezier","bezier","haystack"
              },
            },
          ],
        });
      }
      // New code
      this.setupLayout(onLayoutReady);
    },

    // Toggle calendar visibility
    toggleCalendar(activeItems) {
      if (activeItems.length === 0) {
        // console.log("Close calendar");
        this.calendarShown = false;
        document.addEventListener("mousemove", this.saveMousePosition);
      } else {
        // Are we selecting "View Snapshots in Calendar"?
        if (this.selectedGraphLocatorModeIndex === 1) {
          this.calendarYear = activeItems[0].parent.value;
          this.calendarMonth = activeItems[0].value;
          this.calendarTitle = activeItems[0].name + " - " + this.calendarYear;

          this.calendarShown = true;
          document.removeEventListener("mousemove", this.saveMousePosition);
        } else if (this.selectedGraphLocatorModeIndex === 0) {
          // Are we selecting "Snapshot Selection in Tree"?
          // Load the specified snapshot
          this.loadGraphWithSnapshot(activeItems[0].value);
        }
        // document.removeEventListener("mousemove", this.saveMousePosition);
      }
    },

    // Save mouse position
    saveMousePosition(e) {
      e = e || window.event;
      this.mousePosX = e.clientX;
      this.mousePosY = e.clientY;
    },

    // Change target or selected node and show its info
    showNodeInfo(nodeID) {
      if (!this.selectedNode) {
        this.cyto.$(`#${nodeID}`).json({ selected: true });
        console.log("this.selectedNode should be selected");
      } else {
        // Set selected node to be unselected
        this.cyto.$(`#${this.selectedNode.id()}`).json({ selected: false });
        this.cyto.$(`#${nodeID}`).json({ selected: true });
      }
      this.cyto.animate({
        fit: { eles: `#${nodeID}` },
        padding: 60,
      });
    },

    // Open new tab in browser and visit node URL at archive
    visitNodeURL(nodeID) {
      // Compose url for displaying url
      const baseURL = "http://web.archive.bibalex.org/web/"; // Base URL for displaying at archive
      let url =
        baseURL +
        this.currentGraphSnapshotDate
          .toISOString()
          .replace(/([-:T]|\S{5}$)/g, "") +
        "/" +
        this.cyto.$(`#${nodeID}`).data("url");
      console.log("Inside visitNodeURL: url = " + url);
      console.log("Inside visitNodeURL: nodeID = " + nodeID);
      console.log(
        'Inside visitNodeURL: data("url") = ' +
          this.cyto.$(`#${nodeID}`).data("url")
      );
      window.open(url);
      // console.log("A tab should be opened and visit URL at archive.");
    },

    // Setup Graph Layout
    setupLayout(onLayoutReady) {
      let rect = this.$refs.graph_canvas_ref.getBoundingClientRect();
      this.layout = this.cyto.elements().layout(
        {
          // Old working code
          // // Special case for cise layout
          // ...(this.selectedLayoutParams.name === "cise"
          //   ? {
          //       // clusters: function (node) {
          //       //   return null;
          //       // },
          //       clusters: this.ciseClusterInfo,
          //     }
          //   : {}),

          // ...this.selectedLayoutParams,

          // For now, use the layout options of "cise"
          // source: https://github.com/iVis-at-Bilkent/cytoscape.js-cise
          // -------- Mandatory parameters --------
          name: "cise",

          // ClusterInfo can be a 2D array contaning node id's or a function that returns cluster ids.
          // For the 2D array option, the index of the array indicates the cluster ID for all elements in
          // the collection at that index. Unclustered nodes must NOT be present in this array of clusters.
          //
          // For the function, it would be given a Cytoscape node and it is expected to return a cluster id
          // corresponding to that node. Returning negative numbers, null or undefined is fine for unclustered
          // nodes.
          // e.g
          // Array:                                     OR          function(node){
          //  [ ['n1','n2','n3'],                                       ...
          //    ['n5','n6']                                         }
          //    ['n7', 'n8', 'n9', 'n10'] ]
          clusters: this.ciseClusterInfo,
          // clusters: function(node){return null;},

          // -------- Optional parameters --------
          // Whether to animate the layout
          // - true : Animate while the layout is running
          // - false : Just show the end result
          // - 'end' : Animate directly to the end result
          animate: false,

          // number of ticks per frame; higher is faster but more jerky
          refresh: 10,

          // Animation duration used for animate:'end'
          animationDuration: undefined,

          // Easing for animate:'end'
          animationEasing: undefined,

          // Whether to fit the viewport to the repositioned graph
          // true : Fits at end of layout for animate:false or animate:'end'
          fit: true,

          // Padding in rendered co-ordinates around the layout
          padding: 30,

          // separation amount between nodes in a cluster
          // note: increasing this amount will also increase the simulation time
          nodeSeparation: 12.5,

          // Inter-cluster edge length factor
          // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
          idealInterClusterEdgeLengthCoefficient: 1.4,

          // Whether to pull on-circle nodes inside of the circle
          allowNodesInsideCircle: false,

          // Max percentage of the nodes in a circle that can move inside the circle
          maxRatioOfNodesInsideCircle: 0.1,

          // - Lower values give looser springs
          // - Higher values give tighter springs
          springCoeff: 0.45,

          // Node repulsion (non overlapping) multiplier
          nodeRepulsion: 4500,

          // Gravity force (constant)
          gravity: 0.25,

          // Gravity range (constant)
          gravityRange: 3.8,

          // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
          // ready: function(){}, // on layoutready
          // stop: function(){}, // on layoutstop

          //////////////////////////////////////////////////////////////////////////////////////////////////////////////
          // End of parameters
          //////////////////////////////////////////////////////////////////////////////////////////////////////////////
          boundingBox: {
            x1: rect.left,
            y1: rect.top,
            w: rect.width,
            h: rect.height,
          },
        }
      );
      this.layout.on("layoutstop", (event) => {
        console.log("layoutstop promise fulfilled");
        if (!this.cyto.container()) {
          // Check that it's mounted
          this.cyto.mount(this.$refs.graph_canvas_ref);
        }
        this.cyto.fit();
        // This the way for getting the seleted node

        // perform some statistics Info
        this.readStatisticsData();

        // There is a strange problem that let the div part of the graph expand, so I'll let it be initiallized only onr time
        // Try to initialize module (Now it's commented to as the error message states that it's already set)
        // if (!this.expandCollapseExtansionInitialized) {
        //   try {
        //     cytoscape.use(expandCollapse); // RETURNED ERROR:  Uncaught (in promise) TypeError: ext is undefined first in other place
        //     this.expandCollapseExtansionInitialized = true;
        //   } catch (error) {
        //     console.warn(error.toString());
        //   }
        // // }
        // // Second returned error: Uncaught (in promise) Error: Can not register `expandCollapse` for `core` since `expandCollapse` already exists in the prototype and can not be overridden
        // console.log("Initializing collapse-expand plugin...");
        // this.cyto.expandCollapse({
        //   layoutBy: {
        //     name: "cise", //"cose-bilkent",
        //     animate: "false",
        //     randomize: false,
        //     fit: true,
        //   },
        //   undoable: false, // if set to false, no need for installing plugin. If true, plugin have to be installed
        //   // expandCueImage: "",
        //   // collapseCueImage: "",
        //   animate: false,
        //   zIndex: 0,
        // });
        // this.cytoExpClpAPI = this.cyto.expandCollapse("get");
        // console.log("Initializing collapse-expand plugin done successfully");
        if (onLayoutReady) {
          // TODO: Urgent!! The parameter is hard coded!!Turn it into a general one immediately
          onLayoutReady(0);
        }
        this.setProgressIndicatorVisibility(false); // Disable progress bar
      });
      // } // else {
      // }
      // });

      // layout.run();
      this.layout.run();
    },
  },

  mounted() {
    this.$nextTick(() => {
      // window.publicSuffixList.parse(PLSUtilities.PLSData, punycode.toASCII);

      // Original Working Code for testing dataset test
      this.setupURL(this.$route.query.url); //(this.setupURL(this.$route.params.url);) // NOT WORKING
      // Will be executed when the DOM is ready
      this.loadVersionCountYearly();
      document.addEventListener("mousemove", this.saveMousePosition);
      // let color = this.getBackgroundColor;
      this.$refs.graph_canvas_ref.style.backgroundColor = `rgba(${this.getBackgroundColor.r},${this.getBackgroundColor.g},${this.getBackgroundColor.b},${this.getBackgroundColor.a})`; 
      // End of Original Working Code for testing dataset test

      // Setup initially here edge color
      this.normalEdgeStyle[
        "line-color"
      ] = `hsl(${this.getEdgeColor.h},${this.getEdgeColor.s * 100}%,${
        this.getEdgeColor.l * 100
      }%)`;
      PLSUtilities.parse(PLSUtilities.PLSData, punycode.toASCII);
    });
  },

  // "beforeDestroy" hook
  beforeDestroy() {
    if (this.cyto) {
      this.resetTimeline();
      this.resetNetwork();
      console.log("Cleaning Up Cytoscape...");
      this.cyto.destroy();
      console.log("Cytoscape Cleaned up Successfully");
    }
  },
};
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  padding: 0%;
  /* justify-self: center; */
}
/* aside {
  width: 17% !important;
} */
.aside-title {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px;
  margin-bottom: 15px;
  border-bottom: 1px dotted lightgray;
}

.graph-div {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

#graph_canvas_ref {
  /* height: 600px; /*LPTP Settings*/
  /*height: 800px;*/ /*Work Settings*/
  /* height: 100%; */
  /*
    TODO (Resolve Issue related to setting height to 100%. The problem is related to 100%)
  */
  width: 100%;
  height: 100%;
  /* background-color: blue; */
  /* This is acceptable workaround*/
}

/* Right Toolbar */
.right-toolbar {
  position: absolute;
  width: 10%;
  height: fit-content; /* 100%; */ /* This was working good */
  /* background-color: brown; */
  right: 0;
  top: 20%;
  z-index: 3;
}
</style>