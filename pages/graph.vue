<template>
  <client-only>
    <v-container fluid class="home-container">
      <!-- Use it to show any message for the user -->
      <MessageBox
        :title="fetchingBoxMessage.title"
        :message="fetchingBoxMessage.message"
        :type="fetchingBoxMessage.type"
        :position="fetchingBoxMessage.position"
        :border="fetchingBoxMessage.border"
        v-show="getShowMessageBox"
      />

      <Toolbar :toolbarItems="toolbarItems" />

      <v-scroll-x-transition>
        <v-btn
          absolute
          class="settings-show-button"
          rounded
          v-show="!showSettings"
          @click="showSettings = true"
        >
          Settings
        </v-btn>
      </v-scroll-x-transition>
      <v-slide-x-transition>
        <Settings v-show="showSettings" @hideSettings="showSettings = false" />
      </v-slide-x-transition>
      <!-- <PopupMessage
        v-show="showPopupMessage"
        :arrowDirection="showArrowDirection"
        :message="popupMessage"
        :title="popupMessageTitle"
        :position="popupMessagePos"
        @hidePopupMessage="showPopupMessage = false"
      /> -->
      <v-scroll-x-transition>
        <v-btn
          absolute
          class="graph-locator-show-button"
          rounded
          v-show="!showGraphLocator"
          @click="showGraphLocator = true"
        >
          Graph Locator
        </v-btn>
      </v-scroll-x-transition>
      <v-navigation-drawer
        v-model="showGraphLocator"
        class="graph-locator"
        style="background-color: rgba(0, 0, 0, 0.8)"
        dark
        absolute
      >
        <div class="d-flex flex-column" style="height: 100%">
          <v-row no-gutters class="aside-title flex-grow-0">
            <h4 class="white--text mr-2">Graph Locator</h4>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-icon color="orange" dark v-bind="attrs" v-on="on">
                  mdi-information-outline
                </v-icon>
              </template>
              <span
                >Use the graph locator for selecting snapshot to view a
                graph.<br />
                Or, select multiple snapshots for viewing timeline
                animation.</span
              >
            </v-tooltip>
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
          <div
            class="d-flex flex-column justify-space-between graph-locator-panel"
            style="width: 100%; height: 100%; overflow: hidden; padding: 15px"
          >
            <URLGraphSeeker
              color="#666"
              class="flex-grow-0 url-graph-seeker"
              background-color="#FFFFFF"
              :initialURL="this.$route.query['url']"
              @readyURL="resetupURL"
            />
            <div class="d-flex justify-start mb-1">
              <v-btn-toggle
                mandatory
                dense
                rounded
                v-model="viewMode"
                class="mr-1"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" small :disabled="timelineReady === true">
                      <v-icon>mdi-graph-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>View graph for single snapshot</span>
                </v-tooltip>

                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" small :disabled="timelineReady === true">
                      <v-icon>mdi-animation-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>View graph for timeline</span>
                </v-tooltip>
              </v-btn-toggle>

              <!-- <v-spacer>
          </v-spacer> -->

              <v-btn-toggle
                mandatory
                dense
                rounded
                v-model="snapshotSelectionMode"
                class="ml-1"
              >
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      small
                      :disabled="viewMode === 1 || timelineReady === true"
                    >
                      <v-icon>mdi-file-tree-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Select snapshot from tree</span>
                </v-tooltip>

                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      small
                      :disabled="viewMode === 1 || timelineReady === true"
                    >
                      <!-- <v-icon>mdi-calendar-month-outline</v-icon> -->
                      <v-icon>mdi-calendar</v-icon>
                    </v-btn>
                  </template>
                  <span>Select snapshot from calendar</span>
                </v-tooltip>
              </v-btn-toggle>
            </div>
            <div class="d-flex flex-row">
              <SpinBox
                :placeholder="
                  'Greater than 1 and less than ' + depthMaxAllowedValue
                "
                label="Maximum Depth"
                :min="1"
                :max="depthMaxAllowedValue"
                :initValue="1"
                @valueReady="setMaximumDepth"
                :disabled="timelineReady === true"
              />
              <SpinBox
                placeholder="Span values in minutes"
                label="Time Elasticity (mins)"
                :min="0"
                :max="9000"
                :initValue="timeElasticity"
                @valueReady="setTimeElasticity"
                :disabled="timelineReady === true"
              />
            </div>
            <v-treeview
              style="border: 5px solid #222; overflow-y: auto"
              class="flex-grow-1 flex-shrink-1"
              :items="searchTreeItems"
              :load-children="loadSearchTreePart"
              selected-color="#CE7330"
              dense
              color="#CE7330"
              transition
              return-object
            >
              <!-- :selectable="viewMode === 1" -->
              <!-- v-model="selectedSnapshotList" -->
              <!-- This isn't working for the current new model -->
              <template v-if="viewMode === 0" v-slot:append="{ item }">
                <v-tooltip v-if="item.type === 's'" top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      color="#CE7330"
                      v-show="viewMode === 0 && snapshotSelectionMode === 0"
                      @click="loadGraphWithSnapshot_NEW(item.value)"
                    >
                      <v-icon>mdi-graph</v-icon>
                    </v-btn>
                  </template>
                  <span>Load graph</span>
                </v-tooltip>
                <v-tooltip v-else-if="item.type === 'm'" top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      color="#CE7330"
                      v-show="viewMode === 0 && snapshotSelectionMode === 1"
                      @click="openCalendar(item)"
                    >
                      <v-icon>mdi-calendar-month-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Show monthly calendar</span>
                </v-tooltip>
              </template>
              <template v-else v-slot:append="{ item }">
                <!-- :ripple="false" --><!-- This attribute is a must due to strange warning -->
                <v-simple-checkbox
                  v-if="item.type === 's'"
                  v-model="item.selected"
                  :ripple="false"
                  color="#CE7330"
                  :disabled="timelineReady === true"
                  @click="
                    item.selected
                      ? addSnapshotToTimeline(item)
                      : removeSnapshotFromTimeline(item)
                  "
                >
                </v-simple-checkbox>
              </template>
            </v-treeview>

            <!-- <div class="d-flex justify-center align-end"> -->
            <!-- <div class="align-end mt-auto"> -->
            <v-alert
              type="warning"
              outlined
              dense
              v-show="viewMode === 1 && selectedSnapshotList.length < 2"
            >
              Select two or more Snapshots
            </v-alert>
            <v-tooltip v-if="!timelineReady" top class="align-end">
              <template v-slot:activator="{ on }">
                <v-btn
                  class="build-timeline"
                  v-on="on"
                  rounded
                  @click="activateTimeline"
                  color="#CE7330"
                  :disabled="viewMode === 0 || selectedSnapshotList.length < 2"
                >
                  Build timeline ({{ selectedSnapshotList.length }})
                </v-btn>
              </template>
              <span>Start building timeline with selected snapshots</span>
            </v-tooltip>
            <v-tooltip v-else top class="align-end">
              <template v-slot:activator="{ on }">
                <v-btn
                  class="build-timeline"
                  v-on="on"
                  rounded
                  @click="closeTimeline"
                  color="#CE7330"
                >
                  Close timeline
                </v-btn>
              </template>
              <span>Close timeline and unload related data</span>
            </v-tooltip>
            <!-- </div> -->
          </div>
        </div>
      </v-navigation-drawer>

      <v-dialog
        v-model="calendarShown"
        persistent
        max-width="40%"
        ref="calendar"
        overlay-opacity="0.3"
        overlay-color="#222222"
      >
        <EventCalendar
          :year="calendarYear"
          :month="calendarMonth"
          :title="calendarTitle"
          :targetURLInSSURT="targetURLInSSURT"
          @closeCalendar="calendarShown = false"
          @loadGraph="loadGraphWithSnapshot_NEW"
        />
      </v-dialog>

      <ProgressIndicator />

      <PathFinderTool
        v-show="selectedFinder === 'path'"
        @hidePathFinderTool="hidePathFinderTool"
        @requestNodeSelection="requestNodeSelection"
        @cancelNodeSelectionRequest="cancelNodeSelection"
        @fitNodeSelectionToView="fitNodeSelectionToView"
        @fitAllNodesToView="fitAllNodesToView"
        @swapSourceAndTargetNodes="swapSourceAndTargetNodes"
      />
      <!-- v-show="showFinderTool" -->

      <v-scroll-x-transition>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              absolute
              x-small
              class="info-board-show-button"
              rounded
              color="#CE7330AA"
              v-show="!showInfoBoard && cyto"
              @click="showInfoBoard = true"
            >
              Info Board
            </v-btn>
          </template>
          <span>Open Info Board for viewing node properties</span>
        </v-tooltip>
      </v-scroll-x-transition>
      <InfoBoard
        v-show="showInfoBoard"
        :targetNode="selectedNode"
        :graphPropertyList="graphPropertyList"
        :timelinePropertyList="timelinePropertyList"
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
        @updateCurVal="updateCurVal"
      />

      <!-- The first of div is needed for solving the problem of height increase that push down the footer -->
      <div class="graph-div">
        <div
          ref="graph_canvas_ref"
          id="graph_canvas_ref"
          style="position: absolute;"
        ></div>
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
import MessageBox from "@/components/MessageBox";
import EventCalendar from "@/components/EventCalendar";
import InfoBoard from "@/components/InfoBoard";
import GraphTimeline from "@/components/GraphTimeline";
import URLGraphSeeker from "@/components/URLGraphSeeker";
import PathFinderTool from "@/components/PathFinderTool";
import Toolbar from "@/components/Toolbar";
import Settings from "@/components/Settings";
import ProgressIndicator from "@/components/ProgressIndicator";
import PopupMessage from "@/components/PopupMessage";
import SpinBox from "@/components/SpinBox.vue";
import { ssurt } from "@/js/ssurt.js";
import { utilities } from "@/js/utilities.js";

// Cytoscape-based related
import cytoscape from "cytoscape";
import cise from "cytoscape-cise";
import euler from "cytoscape-euler"; // Before run this command npm install cytoscape-euler, more info at https://github.com/cytoscape/cytoscape.js-euler
import avsdf from "cytoscape-avsdf";
import coseBilkent from "cytoscape-cose-bilkent"; // Before run this command npm install cytoscape-cose-bilkent, more info at https://github.com/cytoscape/cytoscape.js-cose-bilkent
import cola from "cytoscape-cola"; // Before run this command npm install cytoscape-cola, more info at https://github.com/cytoscape/cytoscape.js-cola
import klay from "cytoscape-klay"; // Before run this command npm install cytoscape-klay, more info at https://github.com/cytoscape/cytoscape.js-klay
import dagre from "cytoscape-dagre"; // Before run this command npm install cytoscape-dagre, more info at https://github.com/cytoscape/cytoscape.js-dagre
import spread from "cytoscape-spread"; // Before run this command npm install cytoscape-spread, more info at https://github.com/cytoscape/cytoscape.js-spread
import fcose from "cytoscape-fcose"; // Before run this command npm install cytoscape-fcose, more info at https://github.com/iVis-at-Bilkent/cytoscape.js-fcose
// import elk from 'cytoscape-elk'; // Before run this command npm install cytoscape-elk, more info at https://github.com/cytoscape/cytoscape.js-elk

import cxtmenu from "cytoscape-cxtmenu";
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

/*! http://mths.be/punycode v1.2.3 by @mathias */
(function(o) {
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
    return n(o, function(o) {
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
    return t(o, function(o) {
      return E.test(o) ? l(o.slice(4).toLowerCase()) : o;
    });
  }
  function a(o) {
    return t(o, function(o) {
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
    define(function() {
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

// // Node Shape List supported by Cytoscape
// const nodeShapeList = [
//   "ellipse",
//   "triangle",
//   "round-triangle",
//   "rectangle",
//   "round-rectangle",
//   "bottom-round-rectangle",
//   "cut-rectangle",
//   "barrel",
//   "rhomboid",
//   "diamond",
//   "round-diamond",
//   "pentagon",
//   "round-pentagon",
//   "hexagon",
//   "round-hexagon",
//   "concave-hexagon",
//   "heptagon",
//   "round-heptagon",
//   "octagon",
//   "round-octagon",
//   "star",
//   "tag",
//   "round-tag",
//   "vee",
// ];

// ID generator using closure function. For more information about function closures refer to:
// https://www.w3schools.com/js/js_function_closures.asp
var generateID = (function() {
  var nodeID = 0;
  var edgeID = 0;
  var nodeAndEdge = 0;
  var othersID = 0;
  return function(type) {
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
    MessageBox,
    EventCalendar,
    InfoBoard,
    ProgressIndicator,
    URLGraphSeeker,
    PathFinderTool,
    PopupMessage,
    // FindersAndVisors,
    Toolbar,
    // LayoutParams,
    Settings,
    GraphTimeline,
    SpinBox,
    // LinkvizSearch,
    //LinkvizNavigator
  },

  data() {
    var self = this;

    return {
      //Messasge Box props
      fetchingBoxMessage: {
        title: "",
        message: "",
        position: "top-right",
        border: "left",
        type: "info",
      },
      graphPropertyList: [], // Graph data for displaying in the info board
      // original code
      // timelinePropertyList: [], // timeline data for displaying in the info board
      // original code
      // Test code
      timelinePropertyList: [
        // {
        //   name: "URL",
        //   value: "",
        // },
        // { name: "Snapshot Counts", value: 43 },
      ], // timeline data for displaying in the info board
      // Test code
      // Hint tip list that are used in the application
      hintTipList: {
        graphLocator: {
          initial:
            "Welcome! Use the graph locator for selecting snapshot to view a graph. Or, select multiple snapshots for viewing timeline animation.",
        },
        settings: {
          size: {
            noLinks:
              "No {0} exists, hence size calculation based on {0} count will have no effect.",
            noVariance:
              "No variance exists i.e. all {0} counts are equal. hence size calculation based on {0} count will have no effect.",
          },
        },
        visors: {
          flag: "No flag exists for the flag visor.",
        },
      },
      // TEST
      showArrowDirection: "left", // valid values: "top", "bottom", "right", "left", or null
      popupMessagePos: null, // if not supplied, it'll be centered in the screen.
      // Value format: {x:value ,y: value }) which is top left corner
      showPopupMessage: true, // Flag for controlling the display of popup message
      popupMessage: "", // Message displayed to user
      popupMessageTitle: "", // Title of popup message
      // TEST
      targetURL: "", // Target URL for which graphs are loaded with relation to other websites
      targetURLInSSURT: "", // The Target url in SSURT format

      selectedTimestamp: null, // current Graph Snapshot timestamp

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
      // cytoNodes: [], // Default sort by ID
      // cytoEdges: [], // Default sort by ID
      nodeURLBasedIndexerMap: new Map(), // Indexer Map based on URL for speedup search
      edgeURLBasedIndexerMap: new Map(), // Indexer Map based of URL for speedup search
      // maximumDepth: 1, // Maximum Depth that can be obtained from a graph
      maximumDepth_NEW: 1, // Maximum Depth that can be obtained from a graph
      timeElasticity: 0, // Time (in minutes) elasticity defines the the margins for collecting nodes the edges beside a selected snapshot
      // if zero, the parameter has no effect
      depthMaxAllowedValue: 10, // Maximum allowed value for depth
      // currentGraphDepth: 1 /*null*/ /* For now, let it be 1  */, // Current Load graph depth. If null, no graph is loaded till now
      reciprocalCurrentGraphDepth: 1.0, // currentGraphDepth
      edgesColorRatio: 100,
      cytoExpClpAPI: null, //{},
      // compoundNodes: [],
      // filteredNodes: null,
      selectedNode: null, // Single node selected
      nodeDomainCluster: {}, // node domain-based cluster
      ciseClusterInfo: [], // Cluster Info for CISE Layout array of arrays
      rootNodeID: null, // root node that has a url corresponding to user URL and it should be unique
      expandCollapseExtansionInitialized: false, // Workaround for the problem of re-initializing the expandCollapse again that results in
      viewMode: [], // Graph View Mode, valid values 0 for Single snapshot, and 1 for  Timeline
      snapshotSelectionMode: [], // valid values: Tree, and Calendar
      // countryFlags: new Map(), // Hold country flags
      countryFlags: {}, // now it's class
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

      // Found Edges found by using path finder tool
      pathFinderFoundEdgeList: [],

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
        // "background-color": "yellow", // Designer's concern
        // color: "#333333",
        "background-color": "#CE7330", // Designer's concern
        "border-style": "solid", // valid values: 'solid', 'dotted', 'dashed', or 'double'.
        "border-width": "1",
        "border-color": "#000000",
        // shape: nodeShapeList[this.selectedNodeShapeIndex], // Node Shape
        // "background-image": (node) => self.nodeDomainCluster[self.getDomainName(node.data("url"))].favicon ,
        // "background-image": (node) => {
        //   let arr = [];
        //   if (node.data("favicon")) {
        //     arr.push(node.data("favicon"));
        //   }
        //   return arr;
        // },
        // "background-fit": "cover", // values: "none","contain", or "cover"
        // "background-image": [] ,
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

      // Style for a collapsed node style
      collapsedNodeStyle: {
        "background-color": "#CE7330", // Designer's concern
        "border-style": "double", // valid values: 'solid', 'dotted', 'dashed', or 'double'.
        "border-width": "1",
        "border-color": "#000000",
        shape: "round-rectangle",
      },

      // Constant Node Style set only once
      constantNormalNodeStyle: {
        "background-fit": "cover",
      },

      // Selected Node style
      selectedNodeStyle: {
        // "background-color": "#FF0000", // Designer's concern
        // 'border-style':'dashed', // valid values: 'solid', 'dotted', 'dashed', or 'double'.
        "border-width": "5", // Designer's edits
        "border-color": "#FF0000", // Designer's edits
      },

      // This is a style for override the effect of "selectedNodeStyle"
      unselectedNodeStyle: {
        // "background-color": "#FF0000", // Designer's concern
        // 'border-style':'dashed', // valid values: 'solid', 'dotted', 'dashed', or 'double'.
        "border-width": "1", // Designer's edits
        "border-color": "#000000", // Designer's edits
      },

      // Path finder node style for discriminating node
      pathFinderNodeStyle: {
        "background-color": "#00FF00", // Designer's concern
        // 'border-width':'1',           // Designer's edits
        // 'border-color':'#000000'      // Designer's edits
      },

      normalEdgeStyle: {
        width: 1,
        "line-color": "#969696", // Designer's TODO
        "target-arrow-color": "#969696", // Designer's TODO
        "target-arrow-shape": "vee",
        "arrow-scale": 1,
        // To let the arrow be shown, 'curve-style' should be active
        "curve-style": "straight", //valid values: 'unbundled-bezier','bezier', and 'haystack'
      },

      // constantNormalEdgeStyle: {
      //   width: 1,
      //   // "line-color": "#969696", // Designer's TODO
      //   // "target-arrow-color": "#969696", // Designer's TODO
      //   "target-arrow-shape": "triangle",
      //   "curve-style": "straight", //valid values: "unbundled-bezier","bezier", and "haystack"
      // },

      // Path Finder Edge Style for disriminating edge
      pathFinderEdgeStyle: {
        width: 2,
        "line-color": "brown",
        "target-arrow-color": "brown",
        "target-arrow-shape": "vee",
        "arrow-scale": 1,
        // To let the arrow be shown, 'curve-style' should be active
        "curve-style": "straight", //valid values: 'unbundled-bezier','bezier', and 'haystack'
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

      // selectedNodeStyle: {
      //   "background-color": "brown", // Designer's concern
      //   "background-fill": "solid",
      // },
      // Common Options for expand-collapse plugin
      expandCollapseOptions: {
        // layoutBy: {
        //   name: "cose-bilkent", //"cose-bilkent" was very good for stopping funny bouncing //"cise",
        //   animate: "end",
        //   randomize: false,
        //   fit: true,
        // },
        // undoable: false, // if set to false, no need for installing plugin. If true, plugin have to be installed
        // expandCueImage: "",
        // collapseCueImage: "",
        animate: false,
        zIndex: 0,
      },

      isMouseDown: false,

      toolbarItems: {
        zoomGroup: {
          // Zoom Buttons
          // name: "zoomGroup",
          controlList: {
            zoomIn: {
              // Zoom In
              type: "button",
              action: function() {
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
              action: function() {
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
              action: function() {
                self.resetGraphView();
                // console.log("Reset View");
              },
              disabled: true,
              icon: "mdi-fit-to-page",
              tooltip: "Reset view",
            },
          },
        },
        // expandCollapseGroup: {
        //   // expand-collapse Buttons
        //   controlList: {
        //     collapse: {
        //       // Collapse
        //       type: "button",
        //       action: function () {
        //         self.collapseNode();
        //       },
        //       disabled: true,
        //       icon: "mdi-minus-box",
        //       tooltip: "Collapse selected node",
        //     },
        //     expand: {
        //       // Zoom Out
        //       type: "button",
        //       action: function () {
        //         self.expandNode();
        //       },
        //       disabled: true,
        //       icon: "mdi-plus-box",
        //       tooltip: "Expand selected node",
        //     },
        //   },
        // },
        nodeFilterGroup: {
          // Node Filter
          // name: "nodeFilterGroup",
          controlList: {
            nodeFilter: {
              type: "textField",
              onInputUpdate: function(text) {
                self.updateNodeFilter(text);
              },
              disabled: true,
              text: "",
              placeholder: "Filter Nodes",
            },
            // showInfo: {
            //   // Zoom In
            //   type: "button",
            //   action: function () {
            //     self.toggleInfoBoard();
            //     // self.showInfoBoard = true;
            //     // console.log("Zoom In");
            //   },
            //   disabled: false,
            //   icon: "mdi-text-box-outline",
            //   icon: "mdi-information-variant", //, "mdi-information-outline", "mdi-text-box-outline"
            //   tooltip: "Show Node Info",
            // },
          },
        },
        screenshotGroup: {
          // Screenshot
          // name: "screenshotGroup",
          controlList: {
            saveScreenshot: {
              type: "button",
              action: function() {
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
              type: "toggleButton",
              disabled: false,
              selected: undefined, // Selected button
              buttonList: [
                {
                  type: "flag",
                  icon: "mdi-flag-variant-outline",
                  tooltip:
                    "Apply flag visor: Show country origins of URLs represented by flags in nodes",
                },
                {
                  type: "favicon",
                  label: "FAV",
                  // icon: "mdi-movie-roll",
                  tooltip: "Apply favicon Visor: show favicon of website",
                },
              ],
            },
          },
        },
        pathFindersGroup: {
          controlList: {
            pathFindersList: {
              type: "toggleButton",
              disabled: false,
              selected: undefined, // Selected button
              buttonList: [
                {
                  // icon: "mdi-flag-variant-outline",
                  type: "path",
                  iconClass: "base-custom-icon path-finder-icon",
                  tooltip: "Find path between two nodes",
                },
                {
                  // icon: "mdi-movie-roll",
                  type: "loop",
                  iconClass: "base-custom-icon loop-finder-icon",
                  tooltip: "Find loop(s) if exist(s)",
                },
              ],
            },
          },
        },
      },

      showGraphLocator: true,
      showInfoBoard: false,
      // showFinderTool: false,
      selectedFinder: null, // valid values: 'path', 'loop', and null
      showSettings: false,
      progressDialogShown: false,

      // Hold search tree for navigation and selecting a graph
      searchTreeItems: [],
      selectedSnapshotList: [], // Selected snapshot list in the tree

      // Use RangedValue for holding pairs for calculating minimum and maximum for some values
      inlinkCountMinMaxPair: null,
      outlinkCountMinMaxPair: null,

      cxtmenu1: undefined,
      cxtmenu2: undefined,
    };
  },

  watch: {
    // watch for the Changes of "viewMode"
    viewMode: {
      immediate: true,
      handler(val, oldVal) {
        // console.log("watch:viewMode, viewMode =" + this.viewMode);
        switch (val) {
          case 0:
            // Single Snapshot
            break;

          case 1:
            // Timeline
            break;
        }
      },
    },

    // watch for the Changes of "snapshotSelectionMode"
    snapshotSelectionMode: {
      immediate: true,
      handler(val, oldVal) {},
    },

    // Watch 'selectedNode' for changing style
    selectedNode: {
      immediate: true,
      handler(val, oldVal) {
        if (oldVal) {
          // Check if this node isn't a source nor a target
          // if (
          //   ((!this.getPathFinderSource) ||
          //     (this.getPathFinderSource &&
          //       oldVal.id !== this.getPathFinderSource.id)) &&
          //   ((!this.getPathFinderTarget) ||
          //     (this.getPathFinderTarget &&
          //       oldVal.id !== this.getPathFinderTarget.id))
          // ) {
          if (
            !(
              (this.getPathFinderSource &&
                this.getPathFinderSource.id === oldVal.id()) ||
              (this.getPathFinderTarget &&
                this.getPathFinderTarget.id === oldVal.id())
            )
          ) {
            this.setNodeStyle(oldVal.id(), this.unselectedNodeStyle);
            console.log("selectedNode was set back to normal style");
          }
          this.setSelectedNodeFlag(false);
        }
        if (val) {
          // Check if this node isn't a source nor a target
          this.setNodeStyle(val.id(), this.selectedNodeStyle);
          this.setSelectedNodeFlag(true);
          // Enable expand-collapse buttons
          // this.enableExpandButton(true);
          // this.enableCollapseButton(true);
        } //else {
        // Disable expand-collapse buttons
        // this.enableExpandButton(false);
        // this.enableCollapseButton(false);
        //}
      },
    },

    // Watch for changes in visors group
    "toolbarItems.visorsGroup.controlList.visorsList.selected": {
      immediate: false,
      handler(val, oldVal) {
        // Add this condition to avoid
        if (!this.cyto) {
          return;
        }
        // if (oldVal !== undefined) {
        //   // Close the activated visor
        //   this.deactivateVisor(
        //     this.toolbarItems.visorsGroup.controlList.visorsList.buttonList[
        //       this.toolbarItems.visorsGroup.controlList.visorsList.selected
        //     ]
        //   );
        // }
        // if (val !== undefined) {
        //   // Activate the selected visor
        //   this.activateVisor(
        //     this.toolbarItems.visorsGroup.controlList.visorsList.buttonList[
        //       this.toolbarItems.visorsGroup.controlList.visorsList.selected
        //     ]
        //   );
        // }
        if (val !== undefined) {
          this.activateVisor(
            this.toolbarItems.visorsGroup.controlList.visorsList.buttonList[
              this.toolbarItems.visorsGroup.controlList.visorsList.selected
            ].type
          );
        } else {
          // Clear any visors
          this.clearVisors();
        }
        // console.log('toolbarItems.visorsGroup.controlList.visorsList.selected = ' + this.toolbarItems.visorsGroup.controlList.visorsList.selected)
      },
    },

    // Watch for changes in finders group
    "toolbarItems.pathFindersGroup.controlList.pathFindersList.selected": {
      immediate: true,
      handler(val, oldVal) {
        if (oldVal !== undefined) {
          // Close the activated visor
          this.closeFinder(
            this.toolbarItems.pathFindersGroup.controlList.pathFindersList
              .buttonList[oldVal].type
          );
        }
        if (val !== undefined) {
          // Activate the selected visor
          this.openFinder(
            this.toolbarItems.pathFindersGroup.controlList.pathFindersList
              .buttonList[val].type
          );
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
      // switch (this.getNodeColoringMethodEnum[coloringAction.methodIndex]) {
      switch (
        Object.keys(this.getNodeColoringMethodEnum)[
          Object.values(this.getNodeColoringMethodEnum).indexOf(
            coloringAction.methodIndex
          )
        ]
      ) {
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

        // case "selected-node domain":
        case "selectedNodeDomain":
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

        case "domainDriven":
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

        default:
          // This shouldn't be reached
          throw new Error("Undefined node coloring method");
      }
    },

    // Watch for edge coloring type
    // getSelectedEdgeColorTypeIndex: {
    getEdgeColoringMethodCurrentIndex: {
      immediate: true,
      handler(/*val, oldVal*/) {
        if (this.cyto) {
          this.updateEdgeColor();
        }
      },
    },

    // Watch for updating node label format
    // getSelectedNodeLabelFormatIndex(index) {
    getNodeLabelFormatCurrentIndex(index) {
      switch (index) {
        case this.getNodeLabelFormatEnum.short:
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

        case this.getNodeLabelFormatEnum.long:
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
          // NEVER reach this point!!
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

    getNodeSizeCalcCurrentIndex(index) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      switch (index) {
        case this.getNodeSizeCalcEnum.uniform:
          // Set all node(s) to be in a uniform size
          this.updateUniformNodeSize(this.getUniformNodeSize);
          break;

        case this.getNodeSizeCalcEnum.inlinkCount:
          this.updateNodeSizeOnInlinkCountBasis(this.getInlinkNodeSizeRange);
          break;

        case this.getNodeSizeCalcEnum.outlinkCount:
          this.updateNodeSizeOnOutlinkCountBasis(this.getOutlinkNodeSizeRange);
          break;

        default:
          // Never reach this point!!
          throw new Error("Undefined Node Size Calculation Enum!!");
          break;
      }
    },

    // Watch for uniform size value changes
    // getLatestUniformNodeSizeUsedValue(value) {
    getUniformNodeSize(value) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      // Change all nodes sizes
      this.updateUniformNodeSize(value);
    },

    // // TODO: Postpone for now, till you get a better understanding for how to get file size
    // // Watch for File-Size Based for changing node
    // getLatestFileSizeBasedNodeSizeValue(rangedValue) {
    //   // TODO: Try to remove this line when fixing conditions
    //   if (!this.cyto) {
    //     return;
    //   }
    // },

    // Watch for Inlink-Count Based for changing node
    // getLatestInlinkCountBasedNodeSizeValue(rangedValue) {
    getInlinkNodeSizeRange(rangedValue) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      this.updateNodeSizeOnInlinkCountBasis(rangedValue);
    },

    // Watch for Outlink-Count Based for changing node
    // getLatestOutlinkCountBasedNodeSizeValue(rangedValue) {
    getOutlinkNodeSizeRange(rangedValue) {
      // TODO: Try to remove this line when fixing conditions
      if (!this.cyto) {
        return;
      }
      this.updateNodeSizeOnOutlinkCountBasis(rangedValue);
    },

    // Watch for node shape index
    // getSelectedNodeShapeIndex(index) {
    getNodeShapeCurrentIndex(index) {
      this.cyto.$("node").style({
        shape: this.getNodeShapeList[index],
      });
    },

    // Watch source node selection
    getPathFinderSource: {
      immediate: true,
      handler(val, oldVal) {
        console.log("getPathFinderSource, val = ");
        console.log(val);
        console.log("getPathFinderSource, oldVal = ");
        console.log(oldVal);
        // Restore the style of the previously selected node for path finder target
        if (oldVal) {
          this.setNodeStyle(oldVal.id, this.normalNodeStyle);
        }
        if (val) {
          this.setNodeStyle(val.id, this.pathFinderNodeStyle);
        }
        if (!(oldVal && val)) {
          this.setPathFinderMessageType("info");
        }
        this.resetPathFinderFoundEdgeList();
        this.runPathFinderIfReady();
      },
    },

    // Watch target node selection
    getPathFinderTarget: {
      immediate: true,
      handler(val, oldVal) {
        console.log("getPathFinderTarget, val = ");
        console.log(val);
        console.log("getPathFinderTarget, oldVal = ");
        console.log(oldVal);
        // Restore the style of the previously selected node for path finder target
        if (oldVal) {
          this.setNodeStyle(oldVal.id, this.normalNodeStyle);
        }
        if (val) {
          this.setNodeStyle(val.id, this.pathFinderNodeStyle);
        }
        if (!(oldVal && val)) {
          this.setPathFinderMessageType("info");
        }
        this.resetPathFinderFoundEdgeList();
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

    // Watch for a request for node data be inquiring by id
    getRequestNodeIDList: {
      immediate: true,
      handler(val) {
        // if (val.length > 0) {
        // The following needs checking its feasibility
        if (!this.cyto) {
          return;
        }

        // node ID is set
        let nodeDataList = [];
        val.forEach((node) => {
          let nodeData = {};
          nodeData.id = node.id;
          nodeData.url = this.cyto.$(`#${node.id}`).data("url"); // add url to this object
          nodeData.type = node.type;
          nodeDataList.push(nodeData);
        });
        // You can add more data
        if (nodeDataList.length > 0) {
          this.setResponseNodeDataList(nodeDataList);
        }
        // }
      },
    },
  },

  computed: {
    ...mapGetters({
      getShowMessageBox: "getShowMessageBox",
      getScreenshotResolution: "getScreenshotResolution",
      getLoadedGraphFlag: "getLoadedGraphFlag",
      getLinkservRequestURLHub: "getLinkservRequestURLHub",
      getBackgroundColor: "getBackgroundColor",
      getNodeSizeCalcCurrentIndex: "getNodeSizeCalcCurrentIndex",
      getNodeSizeCalcEnum: "getNodeSizeCalcEnum",
      getNodeShapeCurrentIndex: "getNodeShapeCurrentIndex",
      getNodeColoringMethodEnum: "getNodeColoringMethodEnum",
      getNodeLabelFormatCurrentIndex: "getNodeLabelFormatCurrentIndex",
      getColoringAction: "getColoringAction",
      getEdgeColoringMethodEnum: "getEdgeColoringMethodEnum",
      getEdgeColor: "getEdgeColor",
      getEdgeColoringMethodCurrentIndex: "getEdgeColoringMethodCurrentIndex",
      getNodeLabelFormatEnum: "getNodeLabelFormatEnum",
      getNodeShapeList: "getNodeShapeList",
      getUniformNodeSize: "getUniformNodeSize",
      getInlinkNodeSizeRange: "getInlinkNodeSizeRange",
      getOutlinkNodeSizeRange: "getOutlinkNodeSizeRange",
      getPathFinderSource: "getPathFinderSource",
      getPathFinderTarget: "getPathFinderTarget",
      getUseDifferentStyleForExtEdges: "getUseDifferentStyleForExtEdges",
      getRequestNodeIDList: "getRequestNodeIDList",
      getAnimationSpeed: "getAnimationSpeed",
    }),

    // // Return type of finder
    // selectedFinderType() {
    //   // return this.finderAndVisorItems.items.finders.selected !== undefined
    //   //   ? this.finderAndVisorItems.items.finders.items[
    //   //       this.finderAndVisorItems.items.finders.selected
    //   //     ].type
    //   //   : "";
    //   return "";
    // },
  },

  methods: {
    // Actions of veux
    ...mapActions({
      setShowMessageBox: "setShowMessageBox",
      setLoadedGraphFlag: "setLoadedGraphFlag",
      setSelectedNodeFlag: "setSelectedNodeFlag",
      setLinkservRequestURLHub: "setLinkservRequestURLHub",
      setProgressIndicatorVisibility: "setProgressIndicatorVisibility",
      setProgressIndicatorMessage: "setProgressIndicatorMessage",
      setPathFinderSource: "setPathFinderSource",
      setPathFinderTarget: "setPathFinderTarget",
      setPathFinderResult: "setPathFinderResult",
      // setPathFinderMessage: "setPathFinderMessage",
      setPathFinderMessageType: "setPathFinderMessageType",
      setResponseNodeDataList: "setResponseNodeDataList",
      setSelectedSnapshotList: "setSelectedSnapshotList",
    }),

    setMaximumDepth(value) {
      this.maximumDepth_NEW = value;
    },

    setTimeElasticity(value) {
      this.timeElasticity = value;
    },

    // Setup after entering a new URL
    setupURL(url) {
      this.targetURL = url; // Get URL from route

      // Get the SSURT format from url
      let targetURLInSSURTObject = ssurt.regularURLToSSURT(this.targetURL);
      if (targetURLInSSURTObject.error.length === 0) {
        this.targetURLInSSURT = targetURLInSSURTObject.ssurt;
      } else {
        // TODO: Handle the error of ssurt format,but for now show an alert
        console.error("Your ssurt function has errors");
        return;
      }
      console.log(
        "Inside setupURL,  this.targetURLInSSURT : " + this.targetURLInSSURT
      );
      // this.setLinkservRequestURLHub({
      //   ssurtURL: this.targetURLInSSURT,
      //   linkservHostname: this.$config.linkservHostname,
      // });
      this.setLinkservRequestURLHub(this.$config.linkservHostname);
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                                     Settings                                               //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Update edge color completely
    updateEdgeColor() {
      // switch (this.getEdgeColorTypeList[this.getSelectedEdgeColorTypeIndex]) {
      //   case "uniform":
      //     // Color All edges with uniform color
      //     this.cyto.$("edge").style({
      //       // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
      //       "line-color": `hsl(${this.getEdgeColor.h},${
      //         this.getEdgeColor.s * 100
      //       }%,${this.getEdgeColor.l * 100}%)`,
      //     });
      //     break;

      //   case "domain name & depth":
      //     // Here we need to perform traversing for all edges starting from root node
      //     this.updateEdgeColorUponDomainAndDepthBasis();
      //     break;

      //   default:
      //     // Never reach this point!!
      //     throw new Error("Undefined Edge Color Type");
      //     break;
      // }
      // switch (this.getSelectedEdgeColorTypeIndex) {
      switch (this.getEdgeColoringMethodCurrentIndex) {
        case this.getEdgeColoringMethodEnum.uniform:
          // Color All edges with uniform color
          this.cyto.$("edge").style({
            // "line-color": `hsl(${this.getEdgeColor.r},${this.getEdgeColor.g},${this.getEdgeColor.b})`,
            "line-color": `hsl(${this.getEdgeColor.h},${this.getEdgeColor.s *
              100}%,${this.getEdgeColor.l * 100}%)`,
            "target-arrow-color": `hsl(${this.getEdgeColor.h},${this
              .getEdgeColor.s * 100}%,${this.getEdgeColor.l * 100}%)`,
            opacity: `${this.getEdgeColor.a}`,
          });
          break;

        case this.getEdgeColoringMethodEnum.domainNameAndDepth:
          // Here we need to perform traversing for all edges starting from root node
          this.updateEdgeColorUponDomainAndDepthBasis();
          break;

        default:
          // Never reach this point!!
          throw new Error("Undefined Edge Coloring Method");
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
      if (this.inlinkCountMinMaxPair.diff === 0) {
        if (this.inlinkCountMinMaxPair.max > 0) {
          // All nodes have the same inlink count and there is no variance at all
          // So, handle this case like uniform value
          this.popupMessage = this.hintTipList.settings.size.noVariance.replace(
            "{0}",
            "inlink"
          );
          this.popupMessageTitle = "Node Size Calculation";
          this.showArrowDirection = "right";
          this.showPopupMessage = true;
        } else {
          // There is only one node without any edges!!
          // So, show the user a warning message
          this.popupMessage = this.hintTipList.settings.size.nolinks.replace(
            "{0}",
            "inlink"
          );
          this.popupMessageTitle = "Node Size Calculation";
          this.showArrowDirection = "right";
          this.showPopupMessage = true;
        }
      } else {
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
      }
    },

    // Update node size according to outlink-count basis
    updateNodeSizeOnOutlinkCountBasis(minMaxSizeArray) {
      if (this.outlinkCountMinMaxPair.diff === 0) {
        if (this.outlinkCountMinMaxPair.max > 0) {
          // All nodes have the same outlink count and there is no variance at all
          // So, handle this case like uniform value
          this.popupMessage = this.hintTipList.settings.size.noVariance.replace(
            "{0}",
            "outlink"
          );
          this.popupMessageTitle = "Node Size Calculation";
          this.showArrowDirection = "right";
          this.showPopupMessage = true;
        } else {
          // There is only one node without any edges!!
          // So, show the user a warning message
          this.popupMessage = this.hintTipList.settings.size.noLinks.replace(
            "{0}",
            "outlink"
          );
          this.popupMessageTitle = "Node Size Calculation";
          this.showArrowDirection = "right";
          this.showPopupMessage = true;
        }
      } else {
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
      }
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

      this.edgesColorRatio = 100 / this.maximumDepth_NEW;
      let colorEdgeWithinGraph = this.getUseDifferentStyleForExtEdges
        ? // Use this function for coloring with consideration of
          (edge) => {
            const depth = edge.data("depth");
            if (depth > 0) {
              edge.style({
                "line-color": `hsl(${this.getEdgeColor.h}, ${100 -
                  (Math.abs(edge.data("depth")) - 1) *
                    this.edgesColorRatio}%, 50%)`,
                "target-arrow-color": `hsl(${this.getEdgeColor.h}, ${100 -
                  (Math.abs(edge.data("depth")) - 1) *
                    this.edgesColorRatio}%, 50%)`,
                opacity: `${this.getEdgeColor.a}`,
                "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
              });
            } else {
              edge.style({
                "line-color": "#969696",
                "target-arrow-color": "#969696",
                "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
              });
            }
          }
        : (edge) => {
            console.log("else1");
            console.log(Math.abs(edge.data("depth")) - 1);
            console.log(
              `Second: ${100 -
                (Math.abs(edge.data("depth")) - 1) * this.edgesColorRatio}%`
            );
            edge.style({
              "line-color": `hsl(${this.getEdgeColor.h}, ${100 -
                (Math.abs(edge.data("depth")) - 1) *
                  this.edgesColorRatio}%, 50%)`,
              "target-arrow-color": `hsl(${this.getEdgeColor.h}, ${100 -
                (Math.abs(edge.data("depth")) - 1) *
                  this.edgesColorRatio}%, 50%)`,
              opacity: `${this.getEdgeColor.a}`,
              "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
            });
          };

      let colorEdgeInDisjointGraph = this.getUseDifferentStyleForExtEdges
        ? (edge) => {
            edge.style({
              // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
              "line-color": "#969696",
              "target-arrow-color": "#969696",
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
        this.cyto.$("edge[depth > 0]").forEach((edge) => {
          console.log(edge.data());
          edge.style({
            "line-color": `hsl(${this.getEdgeColor.h}, ${100 -
              (Math.abs(edge.data("depth")) - 1) *
                this.edgesColorRatio}%, 50%)`,
            "target-arrow-color": `hsl(${this.getEdgeColor.h}, ${100 -
              (Math.abs(edge.data("depth")) - 1) *
                this.edgesColorRatio}%, 50%)`,
            opacity: `${this.getEdgeColor.a}`,
            "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
          });
        });
        if (this.getUseDifferentStyleForExtEdges) {
          this.cyto.$("edge[depth < 0]").style({
            "line-color": "#969696",
            "target-arrow-color": "#969696",
            "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
          });
        }
      } else {
        // Compute edge weight only once
        this.computeEdgeWeight(colorEdgeWithinGraph, colorEdgeInDisjointGraph);
      }
    },

    // // Update external Edge Style. Either use different Style for them, or stay the same
    updateExternalEdgeStyle(useDifferentStyleForExtEdges) {
      if (useDifferentStyleForExtEdges) {
        // Applying different style for external edges
        // TODO: Add handling the case of disjoint graph
        this.cyto.$(`edge[depth < 0]`).style({
          // "line-color": `rgb(${this.getEdgeColor.rgba.r},${this.getEdgeColor.rgba.g},${this.getEdgeColor.rgba.b})`,
          "line-color": "#969696",
          "target-arrow-color": "#969696",
          "line-style": "dashed", // Valid values: "solid", "dotted", or "dashed"
        });
      } else {
        // Change external egdes except edges in disjoint graph(s)
        //const delta = 1.0 / this.currentGraphDepth;
        this.cyto
          .$(`edge[depth < 0][depth != ${Number.MIN_SAFE_INTEGER}]`)
          .forEach((edge) => {
            edge.style({
              "line-color": `hsl(${this.getEdgeColor.h}, ${100 -
                (Math.abs(edge.data("depth")) - 1) *
                  this.edgesColorRatio}%, 50%)`,
              "target-arrow-color": `hsl(${this.getEdgeColor.h}, ${100 -
                (Math.abs(edge.data("depth")) - 1) *
                  this.edgesColorRatio}%, 50%)`,
              opacity: `${this.getEdgeColor.a}`,
              "line-style": "solid", // Valid values: "solid", "dotted", or "dashed"
            });
          });

        // TODO: Check this part again
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
      colorEdgeInDisjointGraph = (edge) => {} // Color edge in disjoint graph
    ) {
      // This should be done once per graph
      let visitedNodeList = []; // Hold visited nodes
      let unvisitedNodeQueue = [
        // Hold unvisited node in queue structure
        {
          node: this.cyto.$(`#${this.rootNodeID}`),
          depth: 1,
        },
      ];

      const vnLength = this.cyto.$(`#${this.rootNodeID}`).outgoers("edge")
        .length;
      const domainName = this.getDomainName(
        this.cyto.$(`#${this.rootNodeID}`).data("url")
      ); // main domain node

      // Loop till "unvisitedNodeQueue" is empty
      while (unvisitedNodeQueue.length > 0) {
        // Grab node from "unvisitedNodeQueue"
        let { node, depth } = unvisitedNodeQueue.shift();
        // Loop through all outgoers edges
        let outgoers = node.outgoers("edge");
        outgoers.forEach((edge) => {
          let targetNode = edge.target();
          if (domainName === this.getDomainName(targetNode.data("url"))) {
            // Check if the tagret belongs to the same domain
            // Belongs to same domain
            edge.data("depth", depth); // add new weight for depth
          } else {
            edge.data("depth", -depth); // add new weight for depth with negative number
          }

          // Check the target node if it's visited
          if (edge.isLoop()) {
            console.log("loop");
            // if (targetNode === node) { // not working
            visitedNodeList.push(targetNode);
          }
          if (!visitedNodeList.includes(targetNode)) {
            unvisitedNodeQueue.push({
              node: targetNode,
              depth: Math.abs(depth) + 1,
            });
          }
          // After adding depth to edge, call a color function if exists
          colorEdgeWithingGraph(edge);
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
      // TODO: Check this part again
      this.cyto.$("edge[!depth]").forEach((edge) => {
        edge.data("depth", Number.MIN_SAFE_INTEGER); // This integer value indicates that this edge is disjoint from the graph
        colorEdgeInDisjointGraph(edge);
      });
    },

    // Set node with id "nodeID" with a given style "style"
    setNodeStyle(nodeID, style) {
      this.cyto.$(`#${nodeID}`).style(style);
    },

    // Set edge with id "edgeID" with a given style "style"
    setEdgeStyle(edgeID, style) {
      this.cyto.$(`#${edgeID}`).style(style);
    },

    //--------------------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------------------

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //                                          Finders & Visors Actions                                          //
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ++++++++++++++++++++++++++++++++++++ NEW ++++++++++++++++++++++++++++++++++
    // Activate a visor
    async activateVisor(type) {
      switch (type) {
        case "flag":
          // Here we'll download the flags for only one time before we proceed
          if (this.countryFlags.size > 0) {
            console.log(
              "activateVisor, starting to download the flags if they are not downloaded"
            );

            // Check the first entry in "countryFlags" if the flag is downloaded or not
            if (!this.countryFlags.values().next().value) {
              // Download the flags
              this.setProgressIndicatorVisibility(true);
              this.setProgressIndicatorMessage("Please wait...");
              await this.downloadAllFlags();
              // Use this step if you want to cache the flag data in the node
              // // Loop through all nodes and assign flags
              // this.cyto.$("node").forEach((node) => {
              //   node.data(
              //     "countryFlag",
              //     this.countryFlags[node.data("countryCode")]
              //   );
              // });
              this.setProgressIndicatorVisibility(false);
            }
            let localThis = this;
            // Apply the flag style
            this.cyto.$("node").style({
              "background-image": function(node) {
                let arr = []; //
                let flag = localThis.countryFlags.get(node.data("countryCode"));
                if (node.data("countryCode") && flag) {
                  arr.push(localThis.countryFlags.get(flag));
                }
                return arr;
              },
              "background-fit": "cover",
            });
          } else {
            // Show an info to the user that there is no flags
          }
          break;

        case "favicon":
          // Download all favicon here for only one time
          if (!Object.values(this.nodeDomainCluster)[0].favicon) {
            this.setProgressIndicatorVisibility(true);
            this.setProgressIndicatorMessage("Please wait...");
            for (const domain in this.nodeDomainCluster) {
              this.nodeDomainCluster[
                domain
              ].favicon = await this.downloadFavicon_NEW(domain);
            }
            // Loop through all nodes and assign favicon
            this.cyto.$("node").forEach((node) => {
              if (node.data("domain")) {
                node.data(
                  "favicon",
                  this.nodeDomainCluster[node.data("domain")].favicon
                );
              }
            });
            this.setProgressIndicatorVisibility(false);
          }
          this.cyto.$("node").style({
            "background-image": function(node) {
              let arr = []; //
              if (node.data("favicon")) {
                arr.push(node.data("favicon"));
              }
              return arr;
            },
            "background-fit": "cover",
          });
          break;

        default:
          break;
      }
    },

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // ++++++++++++++++++++++++++++++++++++ NEW ++++++++++++++++++++++++++++++++++
    // //Deavtivate an activated visor
    // deactivateVisor(type) {},
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // ++++++++++++++++++++++++++++++++++++ NEW ++++++++++++++++++++++++++++++++++
    clearVisors() {
      // All visors are turned off
      this.cyto.$("node").style({
        "background-image": "",
      });
    },

    // Open a finder
    openFinder(type) {
      this.selectedFinder = type;
      if (type === "loop") {
        this.popupMessage =
          "Currently, loop finder is not implemented. It will available soon";
        this.popupMessageTitle = "Loop Finder";
        this.showArrowDirection = null;
        this.showPopupMessage = true;

        // Close the finder
        setTimeout(() => {
          this.toolbarItems.pathFindersGroup.controlList.pathFindersList.selected = undefined;
        }, 100);
      }

      // switch (type) {
      //   case 'path':

      //     break;

      //   case 'loop':
      //     break;

      //   default:
      //     // Never reach this point!!
      //     throw new Error("Unable to open undefined finder");
      //     break;
      // }
      // For now, open the path finder tool
      // this.showFinderTool = true;

      // switch (type) {
      //   case 'path':

      //     break;

      //   case 'loop':
      //     break;

      //   default:
      //     break;
      // }
    },

    // Close an opened finder
    closeFinder(type) {
      // Perform a cleanup for data initialized by finder
      switch (type) {
        case "path":
          this.resetPathFinderFoundEdgeList();
          this.setPathFinderMessageType("info"); // Reset message
          if (this.getPathFinderSource) {
            this.setPathFinderSource(null);
          }
          if (this.getPathFinderTarget) {
            this.setPathFinderTarget(null);
          }
          break;
        case "loop":
          break;

        default:
          // Never reach this point!!
          throw new Error("Unable to open undefined finder");
          break;
      }
      this.selectedFinder = null; // Set it to null
      // For now, close the path finder tool
      // this.showFinderTool = false;
    },

    // Hide finder tool
    hidePathFinderTool() {
      this.toolbarItems.pathFindersGroup.controlList.pathFindersList.selected = undefined;
      // this.closeFinder('path')
      // this.resetPathFinderFoundEdgeList();
      // this.showFinderTool = false;
      // this.setPathFinderMessageType("info"); // Reset message
      // if (this.getPathFinderSource) {
      //   this.setPathFinderSource(null)
      // }
      // if (this.getPathFinderTarget) {
      //   this.setPathFinderTarget(null)
      // }
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
      // let srcCollection = null;
      // let trgtCollection = null;

      // // Handle the case of parent node
      // if (srcNode.isParent()) {
      //   srcCollection = srcNode.children();
      // } else {
      //   srcCollection = srcNode;
      // }
      // if (trgtNode.isParent()) {
      //   trgtCollection = trgtNode.children();
      // } else {
      //   trgtCollection = trgtNode;
      // }

      // Check if there is a previous edge list with highlighted edges. If so, reset it to original style
      this.resetPathFinderFoundEdgeList();

      // this.pathFinderFoundEdgeList = srcCollection.edgesTo(trgtCollection); // Get egdes
      let result = this.cyto.elements().aStar({
        root: `#${srcNode.id()}`,
        goal: `#${trgtNode.id()}`,
        directed: true,
      });

      // Check if we have got edges
      // if (this.pathFinderFoundEdgeList.length !== 0) {
      if (result.found) {
        this.pathFinderFoundEdgeList = result.path.filter("edge");
        // highlight these edges
        this.pathFinderFoundEdgeList.animate({
          style: { ...this.pathFinderEdgeStyle },
          duration: 2000,
        });
        this.fitAllNodesToView();
        this.setPathFinderMessageType("success");
      } else {
        this.setPathFinderMessageType("warning");
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

        default:
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
          this.cyto.animate(
            {
              fit: {
                eles: `#${this.getPathFinderSource.id}`,
                padding: 20,
              },
            },
            {
              duration: 1000,
            }
          );
          break;

        case "target":
          this.cyto.animate(
            {
              fit: {
                eles: `#${this.getPathFinderTarget.id}`,
                padding: 20,
              },
            },
            {
              duration: 1000,
            }
          );
          break;

        default:
          // Never reach this point!!
          throw new Error("Undefined type while trying to fit node");
          break;
      }
    },

    // Fit all nodes to view
    fitAllNodesToView() {
      this.cyto.animate(
        {
          fit: {
            eles: `#${this.getPathFinderSource.id}, #${this.getPathFinderTarget.id}`,
            padding: 20,
          },
        },
        {
          duration: 1000,
        }
      );
    },

    // Reset path finder found edge list to its original style
    resetPathFinderFoundEdgeList() {
      // If there is a list of edges highlighted, then restore its status to original
      if (this.pathFinderFoundEdgeList.length > 0) {
        // highlight these edges
        this.pathFinderFoundEdgeList.animate({
          style: { ...this.normalEdgeStyle },
          duration: 2000,
        });
        this.pathFinderFoundEdgeList = []; // Clear the array
      }
    },

    // Swap source and target nodes
    swapSourceAndTargetNodes() {
      let temp1 = this.getPathFinderSource;
      let temp2 = this.getPathFinderTarget;

      this.setPathFinderSource(null);
      this.setPathFinderTarget(null);

      // this.setPathFinderSource(temp2);
      // this.setPathFinderTarget(temp1);
      // Use 'setTimeout' to dispatch a task after temporarily setting the source and target to null
      setTimeout(
        (temp1, temp2) => {
          this.setPathFinderSource(temp2);
          this.setPathFinderTarget(temp1);
        },
        200,
        temp1,
        temp2
      );
    },

    // Toggle the display of info board
    toggleInfoBoard() {
      this.showInfoBoard = !this.showInfoBoard;
    },

    // Fit a node to be zoomed in the viewport
    fitNode(node) {
      // this.cyto.fit(`#${nodeID}`)
      this.cyto.animate(
        {
          fit: {
            eles: node,
            padding: 20,
          },
        },
        {
          duration: 1000,
        }
      );
    },

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

    // // Enable/Disable expand button
    // enableExpandButton(enabled) {
    //   this.toolbarItems.expandCollapseGroup.controlList.expand.disabled =
    //     !enabled;
    // },

    // // Enable/Disable collapse button
    // enableCollapseButton(enabled) {
    //   this.toolbarItems.expandCollapseGroup.controlList.collapse.disabled =
    //     !enabled;
    // },

    // Enable/Disable node filter
    enableNodeFilter(enabled) {
      // this.toolbarItems.nodeFilter.disabled = !enabled;
      this.toolbarItems.nodeFilterGroup.controlList.nodeFilter.disabled = !enabled;
    },

    // Enable/Disable screenshot button
    enableScreenshotButton(enabled) {
      this.toolbarItems.screenshotGroup.controlList.saveScreenshot.disabled = !enabled;
    },

    // Expand selected node
    expandNode(node) {
      // Check that a node is selected and it can be expandable can be expanded
      if (
        /*this.selectedNode &&*/
        this.cytoExpClpAPI.isExpandable(/*this.selectedNode*/ node)
      ) {
        // Expand the node and delete it forever
        this.cytoExpClpAPI.expand(
          // this.selectedNode,
          node,
          this.expandCollapseOptions
        );

        /*this.selectedNode*/ node.children().move({ parent: null });
        /*this.selectedNode*/ node.remove();
      }
    },

    // Collapse selected node
    collapseNode(node) {
      // Check that the node can collapsed
      // if (this.selectedNode) {
      // Also check that this node have adjacent nodes whether being coming in or going out
      let nodes = node //this.selectedNode
        .outgoers("node")
        .union(/*this.selectedNode*/ node.incomers("node"));
      nodes = nodes.union(/*this.selectedNode*/ node); // Add the target node
      const parentID = generateID("ne") + "_TEMP"; // Generate new ID
      // Check that the node count is greater than one
      if (nodes.length > 1) {
        // Create a parent node for these nodes
        const nodeObj = {
          group: "nodes",
          data: {
            id: parentID,
            label: "[collapsed]",
            specialTemp: true, // This is a temporary attribute for handling two cicular menus
          },
        };

        // Add this new node to cytoscape
        this.cyto.add([nodeObj]); // Add to cytoscape
        // this.applyStyle();

        // Let these nodes have a reference to their new parent
        nodes.forEach((node) => {
          // node.data('parent', parentID)  // This is wrong way ❎
          node.move({ parent: parentID });
        });

        // If this parent node has been added successfully, It should be queried direcly
        let parent = this.cyto.$(`#${parentID}`);

        // Now collapse this node
        this.cytoExpClpAPI.collapse(parent, this.expandCollapseOptions);

        parent.style(this.collapsedNodeStyle); // Change the style of the node
        // Add Event listener to this node
        parent.nodes().on("select", this.onNodeBeingSelected);
        parent.nodes().on("unselect", this.onNodeBeingUnselected);

        // // TEST
        // if (this.cyto.$("[id *= '_TEMP']").empty()) {
        //   console.log('collapseNode, no node returned by selector')
        // } else {
        //   console.log('collapseNode, there is/are node(s) returned by selector')
        // }
        // // TEST

        // For, now we can try to investigate about the state of 'this.selectedNode'
        // this.selectedNode = parent; // Set the selection to the parent
      }
      // }
    },

    // Add your actions after node selection
    onNodeBeingSelected(eventObject) {
      this.selectedNode = eventObject.target;
      console.log(
        "onNodeBeingSelected, this.selectedNode.id() " + this.selectedNode.id()
      );
    },

    // Add your actions after node unselection
    onNodeBeingUnselected(eventObject) {
      this.selectedNode = null;
      console.log("onNodeBeingUnselected");
    },

    // Add your actions after node has the event "grabon"
    // onNodeBeingGrabbedOn(eventObject) {
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
    // },

    // Add your actions after node has the event "dragfreeon"
    // onNodeBeingdragFreeOn(eventObject) {
    // eventObject.target.style(this.normalNodeStyle);
    // eventObject.target.outgoers("edge").style(this.normalEdgeStyle);
    // eventObject.target.incomers("edge").style(this.normalEdgeStyle);
    // },

    // Filter nodes with typed text in the filter
    updateNodeFilter(text) {
      // this.cyto.nodes().filter("[label @*= '']")
      if (text) {
        // Change all matching node to normal display
        let matching = this.cyto.nodes().filter(`[url @*= "${text}" ]`);
        matching = matching.parent().union(matching);
        // this.cyto.nodes().filter(`[label @*= "${text}" ]`).style({
        matching.style({
          "background-color": "yellow", //"blue",
          // opacity: 1.0,
        });
        // Change all unmatching node to lower opacity value
        // this.cyto.nodes().filter(`[label !@*= "${text}" ]`).style({
        let unmatching = this.cyto.nodes().filter(`[url !@*= "${text}" ]`);
        unmatching.style({
          "background-color": "#999894", //"yellow",
          // opacity: 0.1,
        });
      } else {
        this.cyto.nodes().style({ ...this.normalNodeStyle });
      }
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
      // this.cyto.fit();
      // This is for animation
      this.cyto.animate(
        {
          fit: {},
        },
        {
          duration: 1000,
        }
      );
    },

    // Save screenshot
    saveScreenshot() {
      // Check if the image format chosen is PNG or JPG
      if (this.getScreenshotResolution.format == "png") {
        this.cyto
          .png({
            output: "blob-promise",
            full: true,
            scale: (this.getScreenshotResolution.value * 2) / 10, // The mathematical operation for keeping the value between (0-2) to not crash
          }) // Scale can be option in the settings
          .then((img) => {
            let aElement = this.$refs.screenshot_a;
            let file = new Blob([img], { type: "graph.png" });
            aElement.href = URL.createObjectURL(file);
            aElement.download = "graph.png";
            aElement.click();
          });
      } else {
        this.cyto
          .jpg({
            output: "blob-promise",
            full: true,
            scale: (this.getScreenshotResolution.value * 2) / 10,
          }) // Scale can be option in the settings
          .then((img) => {
            let aElement = this.$refs.screenshot_a;
            let file = new Blob([img], { type: "graph.jpg" });
            aElement.href = URL.createObjectURL(file);
            aElement.download = "graph.jpg";
            aElement.click();
          });
      }

      // let aElement = this.$refs.screenshot_a;
      // aElement.href = this.$refs.graph_canvas_ref.firstChild.firstChild.toDataURL();
      // aElement.download = "graph.png";
      // aElement.click();
    },

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

      let finalNodeList = [];
      let finalEdgeList = [];

      // // Loop through all the snapshots
      for (let index = 0; index < this.timelineSnapshotList.length; index++) {
        let snapshotData = await this.downloadSnapshot(
          this.timelineSnapshotList[index]
        );
        // this.loadSnapshot(snapshotData, index);
        let snapshotInJSON = this.convertSnapshotToJSON(snapshotData);

        let snapshotNodeList = []; // Node List for "snapshot"
        let snapshotEdgeList = []; // Edge List for "snapshot"

        this.readNodesAndEdges(
          snapshotInJSON,
          this.addNode,
          snapshotNodeList,
          this.addEdge,
          snapshotEdgeList
        );
        this.matchAndMergeSnapshot(
          snapshotNodeList,
          snapshotEdgeList,
          index,
          finalNodeList,
          finalEdgeList
        );
      }

      await this.buildGraphWithCytoscape(finalNodeList, finalEdgeList, () => {
        this.setFrame(0);
        this.timelineReady = true;
      });

      this.graphPropertyList = []; // Clear the property list
      this.timelinePropertyList.splice(
        0,
        this.timelinePropertyList.length,
        { name: "URL", value: this.targetURL }, // URL
        { name: "Snapshot Count", value: this.timelineSnapshotList.length } // Extract year part
      );

      this.setSelectedSnapshotList(this.selectedSnapshotList);
      //this.setProgressIndicatorVisibility(false);
    },

    // Close the timeline
    closeTimeline() {
      this.resetTimeline();

      // Reset Data
      this.resetNetwork();

      // Set view mode to single snapshot mode
      this.viewMode = 0;
    },

    // Add a snapshot to timeline elements for animation
    addSnapshotToTimeline(snapshot) {
      this.selectedSnapshotList.push(snapshot);

      console.log(
        "addSnapshotToTimeline, this.selectedSnapshotList.length : " +
          this.selectedSnapshotList.length
      );
    },

    // Remove a snapshot from timeline elements for animation
    removeSnapshotFromTimeline(snapshot) {
      this.selectedSnapshotList.splice(
        this.selectedSnapshotList.indexOf(snapshot),
        1
      );
      console.log(
        "removeSnapshotFromTimeline, this.selectedSnapshotList.length : " +
          this.selectedSnapshotList.length
      );
    },

    // Read timeline snapshots from the selected elements in "this.searchTreeItems"
    readTimelineSnapshots() {
      // Get all selected snapshots

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

    // Download and return a snapshot
    // snapshotTimestamp: snapshot timestamp
    // ssurtURL: given ssurt URL for downloading. If not supplied, this.targetURLInSSURT will be used
    async downloadSnapshot(snapshotTimestamp, ssurtURL) {
      // Format of snapshotDate should be 'YYYY-MM-DDTHH:MM:SSZ' e.g. '2012-12-12T08:18:46Z' (obsolete)
      // New format is 14-digit format
      console.log('downloadSnapshot, this.getLinkservRequestURLHub["graph"]:');
      console.log(
        this.getLinkservRequestURLHub["graph"]
          .replace("{0}", ssurtURL ? ssurtURL : this.targetURLInSSURT)
          .replace("{1}", snapshotTimestamp)
          .replace("{2}", this.maximumDepth_NEW /*this.maximumDepth*/)
          .replace("{3}", this.timeElasticity)
      );

      // Load the snapshot
      return await this.$axios
        .get(
          this.getLinkservRequestURLHub["graph"]
            .replace("{0}", ssurtURL ? ssurtURL : this.targetURLInSSURT)
            .replace("{1}", snapshotTimestamp)
            .replace("{2}", this.maximumDepth_NEW /*this.maximumDepth*/)
            .replace("{3}", this.timeElasticity),
          { responseType: "text" }
        )
        .then((response) => {
          return typeof response.data === "object"
            ? JSON.stringify(response.data)
            : response.data;
        });
    },

    // Convert the snapshot in string format  to JSON
    convertSnapshotToJSON(snapshot) {
      return JSON.parse("[" + snapshot.replace(/}\s*{/gm, "},{") + "]"); // Add comma to separate between objects. Then, prepend and append array brackets
      // This is a normal JSON that can be parsed friendly,
    },

    // Read nodes and edges in JSON format
    readNodesAndEdges(
      snapshotInJSON,
      nodeCallback,
      nodeList,
      edgeCallback,
      edgeList
    ) {
      // console.log('readNodesAndEdges, snapshotInJSON.length = ' + snapshotInJSON.length)
      // Loop through snapshotInJSON for reading nodes and edges
      for (let i = 0; i < snapshotInJSON.length; i++) {
        if (snapshotInJSON[i].hasOwnProperty("an")) {
          let node = snapshotInJSON[i]["an"]; // Get node
          let nodeXID = Object.keys(node)[0]; // Get node ID which is XID
          let ssurtURL = node[nodeXID]["identifier"]; // according to new names instead of "url"
          let timestamp = node[nodeXID]["timestamp"];
          // await nodeCallback(nodeXID, ssurtURL, timestamp, nodeList);
          // console.log('readNodesAndEdges (an), i=' + i)
          nodeCallback(
            ssurtURL,
            { nodeID: nodeXID, timestamp: timestamp },
            nodeList
          );
        } else if (snapshotInJSON[i].hasOwnProperty("ae")) {
          // console.log('readNodesAndEdges (ae), i=' + i)
          let edge = snapshotInJSON[i]["ae"];
          let edgeXID = Object.keys(edge)[0];
          let sourceNodeXID = edge[edgeXID]["source"]; // Source Node
          let targetNodeXID = edge[edgeXID]["target"]; // Target Node
          // edgeCallback(edgeXID, sourceNodeXID, targetNodeXID, edgeList);
          edgeCallback(
            sourceNodeXID,
            targetNodeXID,
            { edgeID: edgeXID },
            edgeList
          );
        }
      }
    },

    // Perform matching and merging for a snapshot into main nodes and edges
    // nodeList: List of all read nodes
    // edgeList: List of all read edges
    matchAndMergeSnapshot(
      currentSnapshotNodeList,
      currentSnapshotEdgeList,
      timelineFrameIndex,
      finalNodeList,
      finalEdgeList
    ) {
      // Loop through all nodes for insertion into "this.cytoNodes"❎ "finalNodeList"✅
      // currentSnapshotNodeList.forEach((node) => {
      // console.log('matchAndMergeSnapshot, at timelineFrameIndex = '  +timelineFrameIndex+ ' currentSnapshotNodeList:')
      // console.log(currentSnapshotNodeList)
      // console.log('matchAndMergeSnapshot, currentSnapshotNodeList.length = ' + currentSnapshotNodeList.length)
      // console.log('matchAndMergeSnapshot, currentSnapshotEdgeList.length = ' + currentSnapshotEdgeList.length)
      // console.log('matchAndMergeSnapshot, finalNodeList:')
      // console.log(finalNodeList)
      // if (timelineFrameIndex === 1) {
      // console.log('matchAndMergeSnapshot, nodeURLBasedIndexerMap:')
      // console.log(this.nodeURLBasedIndexerMap)

      // }
      for (let index = 0; index < currentSnapshotNodeList.length; index++) {
        let node = currentSnapshotNodeList[index];
        // Check if inserted before
        if (this.nodeURLBasedIndexerMap.has(node.data.ssurtURL)) {
          let nodeID = this.nodeURLBasedIndexerMap.get(node.data.ssurtURL); // Check this node was inserted before
          let nodeIndex = this.searchBinary(
            "data.id",
            nodeID,
            finalNodeList /*this.cytoNodes*/
          ); // Search nodes using binary search
          // if (timelineFrameIndex === 1) {
          //   console.log('matchAndMergeSnapshot, node.data.ssurtURL:' + node.data.ssurtURL)
          //   console.log('matchAndMergeSnapshot, nodeID:' + nodeID)
          //   console.log('matchAndMergeSnapshot, node:')
          //   console.log(node)

          // }
          // console.log('matchAndMergeSnapshot, nodeIndex = ' + nodeIndex)
          // console.log('matchAndMergeSnapshot, nodeIndex = ' + nodeIndex)
          let targetNode =
            finalNodeList[nodeIndex]; /*this.cytoNodes[nodeIndex]*/
          // if (!targetNode) {
          // }

          // modify node history record
          targetNode.data.nodeHistoryRecord = utilities.setCharAt(
            targetNode.data.nodeHistoryRecord,
            timelineFrameIndex,
            "1"
          );
        } else {
          // New node should be inserted
          // this.insertNode(node.ssurtURL, timelineFrameIndex);
          let nodeID = generateID("ne");
          this.addNode(
            node.data.ssurtURL,
            {
              timelineFrameIndex: timelineFrameIndex,
              addWithSort: true,
              nodeID: nodeID,
            },
            finalNodeList
          );
          // Update indexer for finding the next
          this.nodeURLBasedIndexerMap.set(node.data.ssurtURL, nodeID);
        }
      }
      // console.log('matchAndMergeSnapshot, currentSnapshotNodeList')
      // console.log(currentSnapshotNodeList)
      // Loop through all edges for insertions into "this.cytoEdges"❎ "finalEdgeList"✅
      for (let index = 0; index < currentSnapshotEdgeList.length; index++) {
        let edge = currentSnapshotEdgeList[index];
        // console.log('matchAndMergeSnapshot, index = ' + index)
        // console.log('matchAndMergeSnapshot, edge: ')
        // console.log(edge)

        // console.log('this.searchBinary("data.id"/*"xid"*/, edge.data.source/*edge.sourceXID*/, currentSnapshotNodeList)')
        // console.log(this.searchBinary("data.id"/*"xid"*/, edge.data.source/*edge.sourceXID*/, currentSnapshotNodeList))
        let sourceSSURT =
          currentSnapshotNodeList[
            this.searchBinary(
              "data.id" /*"xid"*/,
              edge.data.source /*edge.sourceXID*/,
              currentSnapshotNodeList
            )
          ].data.ssurtURL;
        let targetSSURT =
          currentSnapshotNodeList[
            this.searchBinary(
              "data.id" /*"xid"*/,
              edge.data.target /*edge.targetXID*/,
              currentSnapshotNodeList
            )
          ].data.ssurtURL;
        // let edgeKey = [sourceSSURT, targetSSURT];  // Not working as the is the array reference not the array elements
        let edgeKey = sourceSSURT + " " + targetSSURT;
        if (this.edgeURLBasedIndexerMap.has(edgeKey)) {
          // Existing edge
          let edgeID = this.edgeURLBasedIndexerMap.get(edgeKey);
          let edgeIndex = this.searchBinary(
            "data.id",
            edgeID,
            finalEdgeList /*this.cytoEdges*/
          );
          let targetEdge = finalEdgeList[edgeIndex]; //this.cytoEdges[edgeIndex];

          targetEdge.data.edgeHistoryRecord = utilities.setCharAt(
            targetEdge.data.edgeHistoryRecord,
            timelineFrameIndex,
            "1"
          );
        } else {
          // // Add new edge
          // // But before inserting new edge, we need to get the id of new
          // this.insertEdge(sourceSSURT, targetSSURT, timelineFrameIndex);
          // // insertEdgeCount++;
          // New code
          let sourceNodeID = this.nodeURLBasedIndexerMap.get(sourceSSURT); // Get source node ID (realID)
          let targetNodeID = this.nodeURLBasedIndexerMap.get(targetSSURT); // Get target node ID (realID)
          let edgeID = generateID("ne");
          this.addEdge(
            sourceNodeID,
            targetNodeID,
            { edgeID: edgeID, timelineFrameIndex: timelineFrameIndex },
            finalEdgeList
          );
          // Update the indexer
          this.edgeURLBasedIndexerMap.set(
            sourceSSURT + " " + targetSSURT,
            edgeID
          );
        }
      }
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

    // Update Current Value (position or cursor) of timeline
    updateCurVal(value) {
      this.currentPlayedFrameIndex = value;
    },

    // Toggle the repeat playing animation
    toggleRepeat(repeat) {
      this.repeatTimelinePlay = repeat;
      console.log("toggleRepeat, repeat = " + repeat);
      console.log(
        "toggleRepeat, this.repeatTimelinePlay = " + this.repeatTimelinePlay
      );
    },

    // Play animation in the time line
    async playTimelineAnimation() {
      this.currentAnimationAction = "playing";
      do {
        console.log(
          "playTimelineAnimation, first line in outer loop, this.repeatTimelinePlay = " +
            this.repeatTimelinePlay
        );
        console.log(
          "playTimelineAnimation, first line in outer loop, this.currentAnimationAction = " +
            this.currentAnimationAction
        );
        while (this.currentAnimationAction === "playing") {
          console.log("playTimelineAnimation, first line in inner loop");
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
            // if (this.currentAnimationAction === "playing") {
            if (!this.repeatTimelinePlay) {
              this.currentAnimationAction = "ready";
            }
          }
        }
      } while (
        this.repeatTimelinePlay &&
        this.currentAnimationAction === "playing"
      );
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
              duration: this.getAnimationSpeed,
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
              duration: this.getAnimationSpeed,
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
            this.getAnimationSpeed
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
        ]).then(() => {});
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
      let accessor = function(index) {
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

    // Download favicon given a domain URL
    async downloadFavicon_NEW(domainURL) {
      // Start to download favicon if exists
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
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
        img.onerror = (e) => {
          // Handle error here
          reject("Error!!Cannot grab " + domainURL + " favicon");
        };
        // img.src = 'http://linkgate.bibalex.org/ico?' + domainURL
        img.src =
          "/ico?" +
          domainURL +
          (domainURL.endsWith("/") ? "" : "/") +
          "favicon.ico";
      }).then(
        (dataURI) => dataURI,
        (error) => ""
      );
    },

    // // Download a file from URL
    // async downloadFile(url) {
    //   // Start to download favicon if exists
    //   await new Promise((resolve, reject) => {
    //     const img = new Image();
    //     img.crossOrigin = "Anonymous";
    //     img.onload = () => {
    //       let canvas = document.createElement("CANVAS");
    //       const ctx = canvas.getContext("2d");
    //       canvas.height = img.height;
    //       canvas.width = img.width;
    //       ctx.drawImage(img, 0, 0);
    //       const dataURL = canvas.toDataURL();
    //       canvas = null;
    //       resolve(dataURL);
    //     };
    //     img.onerror = (e) => {
    //       // Handle error here
    //       reject("Error!!Cannot grab " + domainURL + " favicon");
    //     };
    //     // img.src = 'http://linkgate.bibalex.org/ico?' + domainURL
    //     img.src = "/ico?" + domainURL;
    //   }).then(
    //     (dataURI) => dataURI,
    //     (error) => ""
    //   );
    // },

    // Obsolete and to be removed
    // // Download all favicon available for the project
    // async downloadAllDomain() {
    //   for (const domain in this.nodeDomainCluster) {
    //     await this.downloadFavicon(domain);
    //   }
    // },

    // // Download flag if needed
    // async downloadFlagIfNeeded(countryCode) {
    //   // Check if this flag already exists
    //   if (this.countryFlags.has(countryCode)) {
    //     // console.log('downloadFlagIfNeeded countryCode is already existed')
    //     // Exists => return it from the map
    //     return this.countryFlags.get(countryCode);
    //   } else {
    //     // Download the flag
    //     let flagData = await this.downloadFlag(countryCode);
    //     this.countryFlags.set(countryCode, flagData);
    //     return flagData;
    //   }
    // },

    // // Download all flags
    async downloadAllFlags() {
      // Loop through all existing flags
      for (const countryCode in this.countryFlags) {
        let flagData = await this.downloadFlag(countryCode);
        this.countryFlags[countryCode] = flagData;
        console.log(
          "downloadAllFlags, this.countryFlags[" +
            countryCode +
            "] = " +
            this.countryFlags[countryCode]
        );
      }
    },

    // Download flag
    async downloadFlag(countryCode) {
      // Start to download favicon if exists
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
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
        img.onerror = (e) => {
          // Handle error here
          reject("Error!!Cannot download flag for " + countryCode);
        };
        img.src =
          "/ico?" +
          this.$config.countryFlagTemplateAPIURL
            .replace("{0}", countryCode)
            .replace("{1}", "flat")
            .replace("{2}", "16");
      }).then(
        (dataURI) => dataURI,
        (error) => ""
      );
    },

    // Obsolete and to be removed
    // // Download favicon given a domain URL
    // async downloadFavicon(domainURL) {
    //   // Start to download favicon if exists
    //   // await this.$axios.get("/ico?" + domainURL, { responseType: 'blob'}).then((response) => {
    //   //   // convert this favicon to
    //   //   let blob = new Blob(response.data, {type: 'image/png'})
    //   // });
    //   // let vm = this
    //   await new Promise((resolve, reject) => {
    //     const img = new Image();
    //     img.crossOrigin = "Anonymous";
    //     img.onload = () => {
    //       let canvas = document.createElement("CANVAS");
    //       const ctx = canvas.getContext("2d");
    //       canvas.height = img.height;
    //       canvas.width = img.width;
    //       ctx.drawImage(img, 0, 0);
    //       const dataURL = canvas.toDataURL();
    //       canvas = null;
    //       resolve(dataURL);
    //     };
    //     img.onerror = (e) => {
    //       // Handle error here
    //       reject("Error!!Cannot grab " + domainURL + " favicon");
    //     };
    //     // img.src = 'http://linkgate.bibalex.org/ico?' + domainURL
    //     img.src = "/ico?" + domainURL;
    //   }).then(
    //     (dataURI) => {
    //       // Save the favicon to the domain
    //       // console.log(dataURI);
    //       this.nodeDomainCluster[domainURL].favicon = dataURI;
    //       // vm.nodeDomainCluster[domainURL].favicon = dataURI;
    //     },
    //     (error) => {
    //       // Error occurred, so this domain will have no icon
    //       // console.warn(error);
    //       this.nodeDomainCluster[domainURL].favicon = "";
    //       // vm.nodeDomainCluster[domainURL].favicon = null;
    //     }
    //   );
    // },

    // Load node children (incremental loading approach)
    // nodeID: ID of parent node
    // ssurtURL: URL of this node in SSURT format
    async loadNodeChildren(node) {
      // Get reference to node
      let timestamp = node.data("timestamp");
      if (timestamp) {
        console.log(
          "Inside loadNodeChildren, It's supposed to load children for node with timestamp = " +
            timestamp +
            ", and ssurt = " +
            node.data()
        );
        let ssurtURL = node.data("ssurtURL"); // Get URL in ssurt mode
        let nodeList = []; // Node List
        let edgeList = []; // Edge List

        // Download  snapshot for this node ID
        let snapshotData = await this.downloadSnapshot(timestamp, ssurtURL);

        let snapshotInJSON = this.convertSnapshotToJSON(snapshotData); // Convert to JSON

        this.readNodesAndEdges(
          snapshotInJSON,
          this.addNode,
          nodeList,
          this.addEdge,
          edgeList
        );

        this.addSubgraph(nodeList, edgeList); // Add the
        this.applyStyle();
      }
    },

    // Add a subgraph to exiting graph
    addSubgraph(nodeList, edgeList) {
      let tempList = nodeList.concat(edgeList); // Concatenate nodes and edges
      this.cyto.add(tempList); // Add to cytoscape
    },

    // Apply style sheet to nodes
    applyStyle() {
      // Re-apply style upon nodes
      this.cyto.json({
        style: [
          {
            selector: ":childless",
            style: {
              ...this.normalNodeStyle, // Use spread operator for adding node style
              label:
                // this.getSelectedNodeLabelFormatIndex === 0
                this.getNodeLabelFormatCurrentIndex === 0
                  ? "data(label)"
                  : "data(url)",
              // label: "data(label)", // Will Remain constant all the time
            },
          },
          // {
          //   selector: ":parent",
          //   style: {
          //     ...this.collapsedNodeStyle,
          //   }
          // style: {
          //   "background-opacity": 0.333,
          // },
          // },
          // {
          //   // Class for blinking components with path finder
          //   selector: ".pathFinderIndicator",
          //   style: {
          //     "background-color": "#61bffc",
          //     "line-color": "#61bffc",
          //     "target-arrow-color": "#61bffc",
          //     "transition-property":
          //       "background-color, line-color, target-arrow-color",
          //     "transition-duration": "2s",
          //   },
          // },
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
    },

    //----------------------------------------------------------------------------------------------------------------

    // Call after graph is rendered and for only one time
    onRenderOnce() {
      // Enable Zoom Group buttons
      this.enableZoomButtons(true);

      // Enable Expand all and collapse all buttons
      // this.enableCollapseAllExpandAllButtons(true);

      this.enableNodeFilter(true);
      // this.enableDepthSlider(true);
      // this.enableReloadButton(true);
      this.enableScreenshotButton(true);
      // this.enableShowSettingsButton(true);
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
                  ...(this.viewMode === 0 && this.snapshotSelectionMode === 1
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
                selected: false, // Used for timeline selection
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
    async loadVersionCountsYearly() {
      console.log('this.getLinkservRequestURLHub["versionCountsYearly"]');
      console.log(this.getLinkservRequestURLHub["versionCountsYearly"]);
      console.log(
        this.getLinkservRequestURLHub["versionCountsYearly"].replace(
          "{0}",
          this.targetURLInSSURT
        )
      );
      let result = await this.$axios
        .$get(
          // this.linkservRequestBaseURLStore["versionCountsYearly"]
          this.getLinkservRequestURLHub["versionCountsYearly"].replace(
            "{0}",
            this.targetURLInSSURT
          )
        )
        .then(this.successLoad)
        .catch(this.handleLoadError);
    },

    // The json response has succeed
    successLoad(res) {
      // Check if the json response is empty
      if (Object.entries(res).length === 0) {
        this.fetchingBoxMessage.message =
          "No data exists for this URL. Please, check it or try another one.";
        this.fetchingBoxMessage.title = "URL";
        this.fetchingBoxMessage.position = "top-right";
        this.fetchingBoxMessage.border = "left";
        this.fetchingBoxMessage.type = "warning";
        this.setShowMessageBox(true);
      } else {
        this.setShowMessageBox(false);
        // Parse the result
        for (const [key, value] of Object.entries(res)) {
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
      }
    },

    // Failed json response so display the error to the user
    handleLoadError(err) {
      this.fetchingBoxMessage.title = "Error";
      this.fetchingBoxMessage.message = err.message;
      this.fetchingBoxMessage.position = "top-right";
      this.fetchingBoxMessage.border = "left";
      this.fetchingBoxMessage.type = "error";
      this.setShowMessageBox(true);
    },

    // Get stored verison count for a given url with a given year per day
    async loadVersionCountMonthly(year) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versionCountsMonthly"]
          .replace("{0}", this.targetURLInSSURT)
          .replace("{1}", year)
      );
    },

    // Future TODO: This method is a duplicate one in the component "EventCalendar.vue". Try to eliminate duplicates
    // Get stored version count for a given url with a given year and a given month per day
    async loadVersionCountDaily(year, month) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versionCountsDaily"]
          .replace("{0}", this.targetURLInSSURT)
          .replace("{1}", year)
          .replace("{2}", month)
      );
    },

    // Future TODO: This method is a duplicate one in the commponent "EventCalendar.vue". Try to eliminate duplicates
    // Get all versions for a date 'YYYY-MM-DD'
    // year, month and day should all be string
    async loadVersions(year, month, day) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versions"]
          .replace("{0}", this.targetURLInSSURT)
          .replace(
            "{1}",
            // `${year}-${month}-${day <= 9 ? "0" : ""}${day}`
            // `${year}-${month}-${day}`    // Old when dashes was separators
            `${year}${month}${day}` // New without dashes
          )
      );
    },

    // Load Graph with a given snapshot
    async loadGraphWithSnapshot_NEW(timestamp) {
      this.setProgressIndicatorVisibility(true); // Show progress bar
      this.setProgressIndicatorMessage("Please wait...");
      // Format of 'timestamp' now should be 'YYYYMMDDHHMMSS' (14-digit format)

      // Replace old code with old date with a new one
      this.selectedTimestamp = timestamp; // save snapshot date
      let nodeList = []; // Node List
      let edgeList = []; // Edge List

      let snapshotData = await this.downloadSnapshot(timestamp); // Download snapshot of "this.targetURLInSSURT"
      let snapshotInJSON = this.convertSnapshotToJSON(snapshotData); // Convert to JSON
      this.resetNetwork();
      this.readNodesAndEdges(
        snapshotInJSON,
        this.addNode,
        nodeList,
        this.addEdge,
        edgeList
      );
      // this.addDomainNodes(nodeList); // Add domain node(s)

      // Till this point, "rootNodeID" should be found. If not print an error message in the console
      if (!this.rootNodeID) {
        console.error("Root node ID is still not Found!!Check your code");
        alert("Root node ID is still not Found!!Check your code");
      }
      await this.buildGraphWithCytoscape(nodeList, edgeList, () => {});

      // Prepare 'graphPropertyList' for displaying it in the property list of graph
      // this.graphPropertyList = [];
      this.timelinePropertyList = []; // Clear the timeline
      this.graphPropertyList.splice(
        0,
        this.graphPropertyList.length,
        { name: "URL", value: this.targetURL }, // URL
        { name: "Year", value: timestamp.substr(0, 4) }, // Extract year part
        {
          name: "Month",
          value: monthStringList[Number(timestamp.substr(4, 2)) - 1],
        }, // Extract month part
        { name: "Day", value: Number(timestamp.substr(6, 2)) }, // Extract month part
        {
          name: "Time",
          value:
            timestamp.substr(8, 2) +
            ":" +
            timestamp.substr(10, 2) +
            ":" +
            timestamp.substr(12, 2),
        }
      );
      // this.graphPropertyList = graphProps
    },

    // Toggle calendar display
    openCalendar(item) {
      this.calendarYear = item.parent.value;
      this.calendarMonth = item.value;
      this.calendarTitle = item.name + " " + this.calendarYear;
      // document.removeEventListener("mousemove", this.saveMousePosition);
      // console.log("openCalendar, this.targetURLInSSURT = " + this.targetURLInSSURT)
      this.calendarShown = true;
    },

    // Callback for handling node read from downloaded snapshot
    addNode(
      ssurtURL,
      {
        nodeID = undefined,
        addWithSort = true,
        timestamp = undefined,
        timelineFrameIndex = -1,
      },
      nodeList
    ) {
      let url = ssurt.ssurtToRegularURL(ssurtURL);
      // TODO: This is a fast way for getting the domain instead. Maybe it can be perfect and fast.
      //       But if it's not working, return back to class "URL"
      // let tempIndex = utilities.indexOfNth(url, "/", 3);
      // let label = tempIndex !== -1 ? url.substring(0, tempIndex) : url;

      // Add node ID to cluster structure
      let domainName = url ? this.getDomainName(url) : null; // TODO: This is a test, put the actual code

      // change the way of displaying the label
      let tempIndex = utilities.indexOfNth(url, "/", 3) + 1;
      let firstStr = url.substring(0, tempIndex); // Get the domain of the string
      tempIndex = url.lastIndexOf("/");
      let secondStr = url.substring(tempIndex); // Get only part of the path
      let label = firstStr + "..." + secondStr;

      let newNodeID = nodeID !== undefined ? nodeID : generateID("ne");

      let nodeHistoryRecord =
        timelineFrameIndex !== -1
          ? utilities.setCharAt(
              this.historyRecordTemplate,
              timelineFrameIndex,
              "1"
            )
          : undefined;

      // Old working code
      // let countryFlag = null;
      // if (domainName) {
      //   // check if "nodeDomainCluster" has a key equal to "domainName"
      //   if (this.nodeDomainCluster.hasOwnProperty(domainName)) {
      //     // Push new entry in the array
      //     this.nodeDomainCluster[domainName].nodeList.push(newNodeID/*nodeID*/);
      //   } else {
      //     // Create new array
      //     this.nodeDomainCluster[domainName] = {};
      //     this.nodeDomainCluster[domainName].nodeList = [newNodeID/*nodeID*/];

      //     // Try to download favicon here
      //     this.nodeDomainCluster[
      //       domainName
      //     ].favicon = await this.downloadFavicon_NEW(domainName);
      //   }
      //   // Original code
      //   // let countryCode = this.guessCountryCode(domainName); // Guess the country code
      //   // if (countryCode) {
      //   //   // Original code
      //   //   // Download the country code if needed
      //   //   countryFlag = await this.downloadFlagIfNeeded(countryCode);
      //   // }
      //   // Feature Test Code
      //   countryFlag = await this.downloadFlagIfNeeded("eg");
      //   // Feature Test Code
      // }
      // TODO: Add a handler for case such as 'https://s3.amazonaws.com/com.alexa.toolbar/atbp/4cE76z/download/index.htm'
      // TODO: This is urgent task\
      let countryCode = undefined;
      if (domainName) {
        // check if "nodeDomainCluster" has a key equal to "domainName"
        if (this.nodeDomainCluster.hasOwnProperty(domainName)) {
          // Push new entry in the array
          this.nodeDomainCluster[domainName].nodeList.push(
            newNodeID /*nodeID*/
          );
        } else {
          // Create new array
          this.nodeDomainCluster[domainName] = {};
          this.nodeDomainCluster[domainName].nodeList = [newNodeID /*nodeID*/];
        }
        // Original code
        countryCode = this.guessCountryCode(domainName);
        // Original code
        // // TEST CODE
        // countryCode = "eg";
        // // TEST CODE
        if (countryCode && !this.countryFlags.hasOwnProperty(countryCode)) {
          this.countryFlags[countryCode] = undefined;
        }
      }

      const nodeObj = {
        group: "nodes",
        data: {
          id: newNodeID, //nodeID, //generateID("ne"),
          label: label, // label: will hold the short form
          favicon: "", //domainName ? this.nodeDomainCluster[domainName].favicon : "",
          domain: domainName,
          url: url, //"https://vuetifyjs.com", // TODO: This is a test, put the actual code
          ssurtURL: ssurtURL, // Maybe in the future, we can remove it if the library for converting frim library to suurtv is mature enough
          // fileType: fileType, //"pdf", // TODO: This is a test, put the actual code
          // countryCode: countryCode, //"eg", // TODO: This is a test, put the actual code
          countryCode: countryCode /*Test Data*/, //countryCode
          countryFlag: "", //,countryFlag, // Flag Data
          ...(timestamp ? { timestamp: timestamp } : {}),
          ...(nodeHistoryRecord
            ? { nodeHistoryRecord: nodeHistoryRecord }
            : {}),
          // FUTURE TODO: Try a better solution for handling
          // parent: domainName ? domainName : undefined,
          parent: domainName ? domainName.replace(/\./g, "_") : undefined,
          //
          // domain: this.getDomainName(url), // calculate domain name // RETHINK
        },
      };

      // Postponed till we investigate visors extensively
      // let fileType = this.guessFileType(url); // Guess the file type

      // this.cytoNodes.push({
      if (addWithSort) {
        // Add the node with sorting in proper place
        let index = nodeList.length - 1;
        let found = false;
        while (index >= 0 && !found) {
          if (nodeObj.data.id < nodeList[index].data.id) {
            index--;
          } else {
            found = true;
          }
        }
        nodeList.splice(index + 1, 0, nodeObj);
      } else {
        nodeList.push(nodeObj);
        // nodeList.push({
        //   group: "nodes",
        //   data: {
        //     id: newNodeID,//nodeID, //generateID("ne"),
        //     label: label, // label: will hold the short form
        //     favicon: "",//domainName ? this.nodeDomainCluster[domainName].favicon : "",
        //     url: url, //"https://vuetifyjs.com", // TODO: This is a test, put the actual code
        //     ssurtURL: ssurtURL, // Maybe in the future, we can remove it if the library for converting frim library to suurtv is mature enough
        //     // fileType: fileType, //"pdf", // TODO: This is a test, put the actual code
        //     // countryCode: countryCode, //"eg", // TODO: This is a test, put the actual code
        //     countryCode: "eg"/*Test Data*/,//countryCode
        //     countryFlag: "",//,countryFlag, // Flag Data
        //     ...(timestamp?{timestamp:timestamp}:{}),
        //     ...(nodeHistoryRecord?{nodeHistoryRecord:nodeHistoryRecord}:{}),
        //     // FUTURE TODO: Try a better solution for handling
        //     // parent: domainName ? domainName : undefined,
        //     parent: domainName ? domainName.replace(/\./g, "_") : undefined,
        //     //
        //     // domain: this.getDomainName(url), // calculate domain name // RETHINK
        //   },
        // });
      }

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

    // Callback for handling edge read from downloaded snapshot
    addEdge(
      sourceID,
      targetID,
      { edgeID = undefined, timelineFrameIndex = -1 },
      edgeList
    ) {
      // this.cytoEdges.push({
      edgeList.push({
        group: "edges",
        data: {
          id: edgeID !== undefined ? edgeID : generateID("ne"),
          source: sourceID,
          target: targetID,
          ...(timelineFrameIndex !== -1
            ? {
                edgeHistoryRecord: utilities.setCharAt(
                  this.historyRecordTemplate,
                  timelineFrameIndex,
                  "1"
                ),
              }
            : {}),
        },
      });
    },

    // Perform some statistics
    readStatisticsData() {
      // Outlinks min and max
      let minOutlinkCount = this.cyto.nodes().min(function(node) {
        return node.outgoers("edge").length;
      }).value;
      let maxOutlinkCount = this.cyto.nodes().max(function(node) {
        return node.outgoers("edge").length;
      }).value;
      this.outlinkCountMinMaxPair = new MinMaxPair(
        minOutlinkCount,
        maxOutlinkCount
      );

      // Inlinks min and max
      let minInlinkCount = this.cyto.nodes().min(function(node) {
        return node.incomers("edge").length;
      }).value;
      let maxInlinkCount = this.cyto.nodes().max(function(node) {
        return node.incomers("edge").length;
      }).value;
      this.inlinkCountMinMaxPair = new MinMaxPair(
        minInlinkCount,
        maxInlinkCount
      );
    },

    // Add domain nodes
    addDomainNodes(nodeList) {
      for (const domain in this.nodeDomainCluster) {
        nodeList.push({
          group: "nodes",
          // Modifiy id to avoid using special characters in id field to avoid problems is selection
          // FUTURE TODO: Try a better solution for handling
          data: {
            id: domain.replace(/\./g, "_"),
            label: domain,
            favicon: "",
          },
        });
        // setup "ciseClusterInfo" for using in CISE Layout
        // "ciseClusterInfo" will be array of arrays as stated by CISE Layout documentation
        this.ciseClusterInfo.push(this.nodeDomainCluster[domain].nodeList);
      }
    },

    // Extract the domain from a given URL
    getDomainName(url) {
      let host = null; // "null" will be returned if an exception occurred
      let refinedHost = null;
      try {
        const tempURL = new URL(url);
        host = tempURL.host;
        // If the above line works successfully, the host is value and we can then manipulation domain
        // refinedHost = this.refineDomain(host);
        refinedHost = tempURL.protocol + "//" + PLSUtilities.getDomain(host);
        // console.log("Inside getDomainName, url :  " + url);
        // console.log("Inside getDomainName, host :  " + host);
        // console.log("Inside getDomainName, refinedHost :  " + refinedHost);
      } catch (exp) {
        // Print error
        console.exception(exp.toString());
      } finally {
        return refinedHost;
      }
    },

    // Reset all UI and let it in a state before adding data
    reset() {
      // this.graphDepth = 1;
      // this.toolbarItems.depthGroup.controlList.graphDepth.value = 1;
      // this.zoomLevel = 1;
      // this.showGraphLocator = false;
      // this.showRightToolbar = false;
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
        this.setLoadedGraphFlag(false);
      }
      this.rootNodeID = null;
      this.ciseClusterInfo = [];
      this.nodeDomainCluster = {};
    },

    // Reload another graph with a new URL
    resetupURL(url) {
      this.setProgressIndicatorVisibility(true); // Show progress bar
      this.setProgressIndicatorMessage("Please wait...");
      // Here, try to change the url in the address bar to let the user use the direct url
      window.history.pushState(
        "",
        "",
        `${this.$route.path}?url=${encodeURIComponent(url)}`
      );
      this.reset();

      this.setupURL(url);
      this.loadVersionCountsYearly();
      this.setProgressIndicatorVisibility(false); // Hide progress bar
    },

    // ++++++++++++++++++++++++++++++++++++ NEW +++++++++++++++++++++++++++
    // Initialize cytoscape
    // async initCytoscape_NEW(nodeList, edgeList, onLayoutReady) {
    async buildGraphWithCytoscape(nodeList, edgeList, onLayoutReady) {
      if (!this.cyto) {
        // let tempList = ;
        this.cyto = cytoscape({
          // container: this.$refs.graph_canvas_ref,
          elements: nodeList.concat(edgeList), //tempList,
          // elements: {
          //   nodes: nodeList,
          //   edges: edgeList,
          // },
          style: [
            {
              selector: "node",
              style: {
                ...this.normalNodeStyle, // Use spread operator for adding node style
                label:
                  // this.getSelectedNodeLabelFormatIndex === 0
                  this.getNodeLabelFormatCurrentIndex === 0
                    ? "data(label)"
                    : "data(url)",
              },
            },
            {
              selector: ":parent",
              style: {
                "background-opacity": 0.0,
                "border-color": "#333333",
              },
            },
            // {
            //   // Class for blinking components with path finder
            //   selector: ".pathFinderIndicator",
            //   style: {
            //     "background-color": "#61bffc",
            //     "line-color": "#61bffc",
            //     "target-arrow-color": "#61bffc",
            //     "transition-property":
            //       "background-color, line-color, target-arrow-color",
            //     "transition-duration": "2s",
            //   },
            // },
            {
              selector: "edge",
              style: {
                ...this.normalEdgeStyle,
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
        });
        // Moved code from layout calculation to this point
        this.cyto.nodes().on("select", this.onNodeBeingSelected);
        this.cyto.nodes().on("unselect", this.onNodeBeingUnselected);
        // this.cyto.nodes().on("grabon", this.onNodeBeingGrabbedOn);
        // this.cyto.nodes().on("dragfreeon", this.onNodeBeingdragFreeOn);

        this.cyto.one("render", this.onRenderOnce);

        // TODO try to make it be initialized only once
        cytoscape.use(avsdf); // register extension
        cytoscape.use(coseBilkent); // register extension
        cytoscape.use(cola); // register extension
        cytoscape.use(euler); // register extension
        cytoscape.use(cise); // register extension
        cytoscape.use(klay); // register extension
        cytoscape.use(dagre); // register extension
        cytoscape.use(spread); // register extension
        cytoscape.use(fcose); // register extension
        // cytoscape.use(elk);// register extension

        // if (!this.cyto.cxtmenu) {
        //   cytoscape.use(cxtmenu); // register extension
        // }
      } else {
        this.addSubgraph(nodeList, edgeList); // Add the
        this.applyStyle();
      }
      this.setLoadedGraphFlag(true);
      // New code
      this.setupLayout(onLayoutReady);
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
      // const baseURL = "http://web.archive.bibalex.org/web/"; // Base URL for displaying at archive
      const baseURL = "http://web.archive.org/web/"; // Base URL for displaying at archive
      let url =
        baseURL +
        // this.selectedTimestamp.toISOString().replace(/([-:T]|\S{5}$)/g, "") +
        this.selectedTimestamp +
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
      // @@@@@@@@@@@
      // CISE Layout
      // @@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   // Old working code
      //   // // Special case for cise layout
      //   // ...(this.selectedLayoutParams.name === "cise"
      //   //   ? {
      //   //       // clusters: function (node) {
      //   //       //   return null;
      //   //       // },
      //   //       clusters: this.ciseClusterInfo,
      //   //     }
      //   //   : {}),

      //   // ...this.selectedLayoutParams,

      //   // For now, use the layout options of "cise"
      //   // source: https://github.com/iVis-at-Bilkent/cytoscape.js-cise
      //   // -------- Mandatory parameters --------
      //   name: "cise",

      //   // ClusterInfo can be a 2D array contaning node id's or a function that returns cluster ids.
      //   // For the 2D array option, the index of the array indicates the cluster ID for all elements in
      //   // the collection at that index. Unclustered nodes must NOT be present in this array of clusters.
      //   //
      //   // For the function, it would be given a Cytoscape node and it is expected to return a cluster id
      //   // corresponding to that node. Returning negative numbers, null or undefined is fine for unclustered
      //   // nodes.
      //   // e.g
      //   // Array:                                     OR          function(node){
      //   //  [ ['n1','n2','n3'],                                       ...
      //   //    ['n5','n6']                                         }
      //   //    ['n7', 'n8', 'n9', 'n10'] ]
      //   clusters: this.ciseClusterInfo,
      //   // clusters: function(node){return null;},

      //   // -------- Optional parameters --------
      //   // Whether to animate the layout
      //   // - true : Animate while the layout is running
      //   // - false : Just show the end result
      //   // - 'end' : Animate directly to the end result
      //   animate: false,

      //   // number of ticks per frame; higher is faster but more jerky
      //   refresh: 10,

      //   // Animation duration used for animate:'end'
      //   animationDuration: undefined,

      //   // Easing for animate:'end'
      //   animationEasing: undefined,

      //   // Whether to fit the viewport to the repositioned graph
      //   // true : Fits at end of layout for animate:false or animate:'end'
      //   fit: true,

      //   // Padding in rendered co-ordinates around the layout
      //   padding: 30,

      //   // separation amount between nodes in a cluster
      //   // note: increasing this amount will also increase the simulation time
      //   nodeSeparation: 80,//60,//40,//30,//25,//20,//12.5,

      //   // Inter-cluster edge length factor
      //   // (2.0 means inter-cluster edges should be twice as long as intra-cluster edges)
      //   idealInterClusterEdgeLengthCoefficient: 1.4,

      //   // Whether to pull on-circle nodes inside of the circle
      //   // allowNodesInsideCircle: false,
      //   allowNodesInsideCircle: false,

      //   // Max percentage of the nodes in a circle that can move inside the circle
      //   // maxRatioOfNodesInsideCircle: 0.1,
      //   maxRatioOfNodesInsideCircle: 0.1,

      //   // - Lower values give looser springs
      //   // - Higher values give tighter springs
      //   springCoeff: 0.45,//1.0,//0.01,//1.0,//0.45,

      //   // Node repulsion (non overlapping) multiplier
      //   nodeRepulsion: 10000,//1000,//100,//10,//1,//18000,//9000,//4500,

      //   // Gravity force (constant)
      //   gravity: 1.0,//10.0,//1.0,//0.1,//0.01,//0.001,//5.0,//1.0,//0.25,
      //   /* It seems that the working values <= 1.0 */

      //   // Gravity range (constant)
      //   gravityRange: 5.0,//10.0,//1.0,//0.1,//3.8,

      //   // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
      //   // ready: function(){}, // on layoutready
      //   // stop: function(){}, // on layoutstop

      //   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //   // End of parameters
      //   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //   boundingBox: {
      //     x1: rect.left,
      //     y1: rect.top,
      //     w: rect.width,
      //     h: rect.height,
      //   },
      // });
      // @@@@@@@@@@@@@@@@@
      // Concentric Layout
      // @@@@@@@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'concentric',

      //   fit: true, // whether to fit the viewport to the graph
      //   padding: 30, // the padding on fit
      //   startAngle: 3 / 2 * Math.PI, // where nodes start in radians
      //   sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      //   clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      //   equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
      //   minNodeSpacing: 60,//30,//10, // min spacing between outside of nodes (used for radius adjustment)
      //   boundingBox: {
      //     x1: rect.left,
      //     y1: rect.top,
      //     w: rect.width,
      //     h: rect.height,
      //   }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      //   avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      //   nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
      //   height: undefined, // height of layout area (overrides container height)
      //   width: undefined, // width of layout area (overrides container width)
      //   spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      //   concentric: function( node ){ // returns numeric value for each node, placing higher nodes in levels towards the centre
      //   return node.degree();
      //   },
      //   levelWidth: function( nodes ){ // the variation of concentric values in each level
      //   return nodes.maxDegree() / 4;
      //   },
      //   animate: false, // whether to transition the node positions
      //   animationDuration: 500, // duration of animation in ms if enabled
      //   animationEasing: undefined, // easing of animation if enabled
      //   animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      //   ready: undefined, // callback on layoutready
      //   stop: undefined, // callback on layoutstop
      //   // transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
      // });
      // @@@@@@@@@@@@@@@@@@@@@@
      // Euler Layout (working)
      // @@@@@@@@@@@@@@@@@@@@@@
      this.layout = this.cyto.elements().layout({
        name: "euler",

        // The ideal length of a spring
        // - This acts as a hint for the edge length
        // - The edge length can be longer or shorter if the forces are set to extreme values
        springLength: (edge) => 100,

        // Hooke's law coefficient
        // - The value ranges on [0, 1]
        // - Lower values give looser springs
        // - Higher values give tighter springs
        springCoeff: (edge) => 0.0001, //0,//0.0008,    // Never let it be 0

        // The mass of the node in the physics simulation
        // - The mass affects the gravity node repulsion/attraction
        mass: (node) => 4,

        // Coulomb's law coefficient
        // - Makes the nodes repel each other for negative values
        // - Makes the nodes attract each other for positive values
        gravity: -20, //-1.2,

        // A force that pulls nodes towards the origin (0, 0)
        // Higher values keep the components less spread out
        pull: 0.001,

        // Theta coefficient from Barnes-Hut simulation
        // - Value ranges on [0, 1]
        // - Performance is better with smaller values
        // - Very small values may not create enough force to give a good result
        theta: 0.666,

        // Friction / drag coefficient to make the system stabilise over time
        dragCoeff: 0.02,

        // When the total of the squared position deltas is less than this value, the simulation ends
        movementThreshold: 1,

        // The amount of time passed per tick
        // - Larger values result in faster runtimes but might spread things out too far
        // - Smaller values produce more accurate results
        timeStep: 20,

        // The number of ticks per frame for animate:true
        // - A larger value reduces rendering cost but can be jerky
        // - A smaller value increases rendering cost but is smoother
        refresh: 10,

        // Whether to animate the layout
        // - true : Animate while the layout is running
        // - false : Just show the end result
        // - 'end' : Animate directly to the end result
        animate: false,

        // Animation duration used for animate:'end'
        animationDuration: undefined,

        // Easing for animate:'end'
        animationEasing: undefined,

        // Maximum iterations and time (in ms) before the layout will bail out
        // - A large value may allow for a better result
        // - A small value may make the layout end prematurely
        // - The layout may stop before this if it has settled
        maxIterations: 8000,
        maxSimulationTime: 8000,

        // Prevent the user grabbing nodes during the layout (usually with animate:true)
        ungrabifyWhileSimulating: false,

        // Whether to fit the viewport to the repositioned graph
        // true : Fits at end of layout for animate:false or animate:'end'; fits on each frame for animate:true
        fit: true,

        // Padding in rendered co-ordinates around the layout
        padding: 30,

        // Constrain layout bounds with one of
        // - { x1, y1, x2, y2 }
        // - { x1, y1, w, h }
        // - undefined / null : Unconstrained
        boundingBox: {
          x1: rect.left,
          y1: rect.top,
          w: rect.width,
          h: rect.height,
        },

        // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
        // ready: function(){}, // on layoutready
        // stop: function(){}, // on layoutstop

        // Whether to randomize the initial positions of the nodes
        // true : Use random positions within the bounding box
        // false : Use the current node positions as the initial positions
        /* By experimantation, settings to true speeds up the algorithm layaout. Setting to false, let it take very long time that almost leads to crash */
        randomize: true,
      });
      // @@@@@@@@@@@@
      // avsdf Layout
      // @@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'avsdf',

      //   // Called on `layoutready`
      //   ready: function () {
      //   },
      //   // Called on `layoutstop`
      //   stop: function () {
      //   },
      //   // number of ticks per frame; higher is faster but more jerky
      //   refresh: 30,
      //   // Whether to fit the network view after when done
      //   fit: true,
      //   // Padding on fit
      //   padding: 10,
      //   // Prevent the user grabbing nodes during the layout (usually with animate:true)
      //   ungrabifyWhileSimulating: false,
      //   // Type of layout animation. The option set is {'during', 'end', false}
      //   animate: false,
      //   // Duration for animate:end
      //   animationDuration: 500,
      //   // How apart the nodes are
      //   nodeSeparation: 100
      // });
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // cose-bilkent Layout (working without compound)
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'cose-bilkent',
      //   // // Called on `layoutready`
      //   // ready: function () {
      //   // },
      //   // // Called on `layoutstop`
      //   // stop: function () {
      //   // },
      //   // 'draft', 'default' or 'proof"
      //   // - 'draft' fast cooling rate
      //   // - 'default' moderate cooling rate
      //   // - "proof" slow cooling rate
      //   quality: 'proof',
      //   // Whether to include labels in node dimensions. Useful for avoiding label overlap
      //   nodeDimensionsIncludeLabels: true,
      //   // number of ticks per frame; higher is faster but more jerky
      //   refresh: 30,
      //   // Whether to fit the network view after when done
      //   fit: true,
      //   // Padding on fit
      //   padding: 10,
      //   // Whether to enable incremental mode
      //   randomize: true,
      //   // Node repulsion (non overlapping) multiplier
      //   nodeRepulsion: 1000000,//4500,
      //   // Ideal (intra-graph) edge length
      //   idealEdgeLength: 200,
      //   // Divisor to compute edge forces
      //   edgeElasticity: 0.45,
      //   // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
      //   nestingFactor: 0.1,
      //   // Gravity force (constant)
      //   gravity: 0.25,
      //   // Maximum number of iterations to perform
      //   numIter: 2500,
      //   // Whether to tile disconnected nodes
      //   tile: true,
      //   // Type of layout animation. The option set is {'during', 'end', false}
      //   animate: false,
      //   // Duration for animate:end
      //   animationDuration: 500,
      //   // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
      //   tilingPaddingVertical: 10,
      //   // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
      //   tilingPaddingHorizontal: 10,
      //   // Gravity range (constant) for compounds
      //   gravityRangeCompound: 1.5,
      //   // Gravity force (constant) for compounds
      //   gravityCompound: 1.0,
      //   // Gravity range (constant)
      //   gravityRange: 3.8,
      //   // Initial cooling factor for incremental layout
      //   initialEnergyOnIncremental: 0.5
      // });
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // cola layout (working without compound)
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'cola',
      //   animate: false, // whether to show the layout as it's running
      //   refresh: 1, // number of ticks per frame; higher is faster but more jerky
      //   maxSimulationTime: 4000, // max length in ms to run the layout
      //   ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
      //   fit: true, // on every layout reposition of nodes, fit the viewport
      //   padding: 30, // padding around the simulation
      //   boundingBox: {  // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      //     x1: rect.left,
      //     y1: rect.top,
      //     w: rect.width,
      //     h: rect.height,
      //   },
      //   nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node

      //   // layout event callbacks
      //   // ready: function(){}, // on layoutready
      //   // stop: function(){}, // on layoutstop

      //   // positioning options
      //   randomize: true, // use random node positions at beginning of layout
      //   avoidOverlap: true, // if true, prevents overlap of node bounding boxes
      //   handleDisconnected: true, // if true, avoids disconnected components from overlapping
      //   convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
      //   nodeSpacing: function( node ){ return 80; }, // extra spacing around nodes
      //   flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
      //   alignment: undefined, // relative alignment constraints on nodes, e.g. {vertical: [[{node: node1, offset: 0}, {node: node2, offset: 5}]], horizontal: [[{node: node3}, {node: node4}], [{node: node5}, {node: node6}]]}
      //   gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]

      //   // different methods of specifying edge length
      //   // each can be a constant numerical value or a function like `function( edge ){ return 2; }`
      //   edgeLength: undefined, // sets edge length directly in simulation
      //   edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
      //   edgeJaccardLength: undefined, // jaccard edge length in simulation

      //   // iterations of cola algorithm; uses default values on undefined
      //   unconstrIter: undefined, // unconstrained initial layout iterations
      //   userConstIter: undefined, // initial layout iterations with user-specified constraints
      //   allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

      // });
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // fcose  Layout (works only without headless mode 😠, and didn't returned any results in about 40 min 😢 )
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'fcose',
      //   // 'draft', 'default' or 'proof'
      //   // - "draft" only applies spectral layout
      //   // - "default" improves the quality with incremental layout (fast cooling rate)
      //   // - "proof" improves the quality with incremental layout (slow cooling rate)
      //   quality: "default",
      //   // Use random node positions at beginning of layout
      //   // if this is set to false, then quality option must be "proof"
      //   randomize: true,
      //   // Whether or not to animate the layout
      //   animate: false,
      //   // Duration of animation in ms, if enabled
      //   animationDuration: 1000,
      //   // Easing of animation, if enabled
      //   animationEasing: undefined,
      //   // Fit the viewport to the repositioned nodes
      //   fit: true,
      //   // Padding around layout
      //   padding: 30,
      //   // Whether to include labels in node dimensions. Valid in "proof" quality
      //   nodeDimensionsIncludeLabels: false,
      //   // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
      //   uniformNodeDimensions: false,
      //   // Whether to pack disconnected components - valid only if randomize: true
      //   packComponents: true,
      //   // Layout step - all, transformed, enforced, cose - for debug purpose only
      //   step: "all",

      //   /* spectral layout options */

      //   // False for random, true for greedy sampling
      //   samplingType: true,
      //   // Sample size to construct distance matrix
      //   sampleSize: 25,
      //   // Separation amount between nodes
      //   nodeSeparation: 75,
      //   // Power iteration tolerance
      //   piTol: 0.0000001,

      //   /* incremental layout options */

      //   // Node repulsion (non overlapping) multiplier
      //   nodeRepulsion: node => 4500,
      //   // Ideal edge (non nested) length
      //   idealEdgeLength: edge => 50,
      //   // Divisor to compute edge forces
      //   edgeElasticity: edge => 0.45,
      //   // Nesting factor (multiplier) to compute ideal edge length for nested edges
      //   nestingFactor: 0.1,
      //   // Maximum number of iterations to perform
      //   numIter: 2500,
      //   // For enabling tiling
      //   tile: true,
      //   // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
      //   tilingPaddingVertical: 10,
      //   // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
      //   tilingPaddingHorizontal: 10,
      //   // Gravity force (constant)
      //   gravity: 0.25,
      //   // Gravity range (constant) for compounds
      //   gravityRangeCompound: 1.5,
      //   // Gravity force (constant) for compounds
      //   gravityCompound: 1.0,
      //   // Gravity range (constant)
      //   gravityRange: 3.8,
      //   // Initial cooling factor for incremental layout
      //   initialEnergyOnIncremental: 0.3,

      //   /* constraint options */

      //   // Fix desired nodes to predefined positions
      //   // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
      //   fixedNodeConstraint: undefined,
      //   // Align desired nodes in vertical/horizontal direction
      //   // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
      //   alignmentConstraint: undefined,
      //   // Place two nodes relatively in vertical/horizontal direction
      //   // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
      //   relativePlacementConstraint: undefined,

      //   /* layout event callbacks */
      //   // ready: () => {}, // on layoutready
      //   // stop: () => {} // on layoutstop
      //   boundingBox: {  // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      //     x1: rect.left,
      //     y1: rect.top,
      //     w: rect.width,
      //     h: rect.height,
      //   },
      // });
      // @@@@@@@@@@@@@@@@@
      // spread  Layout
      // @@@@@@@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'spread',
      //   animate: false, // Whether to show the layout as it's running
      //   ready: undefined, // Callback on layoutready
      //   stop: undefined, // Callback on layoutstop
      //   fit: true, // Reset viewport to fit default simulationBounds
      //   minDist: 20, // Minimum distance between nodes
      //   padding: 20, // Padding
      //   expandingFactor: -1.0, // If the network does not satisfy the minDist
      //   // criterium then it expands the network of this amount
      //   // If it is set to -1.0 the amount of expansion is automatically
      //   // calculated based on the minDist, the aspect ratio and the
      //   // number of nodes
      //   prelayout: { name: 'cose' }, // Layout options for the first phase
      //   maxExpandIterations: 10,//4, // Maximum number of expanding iterations
      //   boundingBox: {  // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      //     x1: rect.left,
      //     y1: rect.top,
      //     w: rect.width,
      //     h: rect.height,
      //   },
      //   randomize: true // Uses random initial node positions on true
      // });
      // @@@@@@@@@@@@@@@@@
      // klay Layout
      // @@@@@@@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'klay',
      //   nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
      //   fit: true, // Whether to fit
      //   padding: 20, // Padding on fit
      //   animate: false, // Whether to transition the node positions
      //   animateFilter: function( node, i ){ return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
      //   animationDuration: 500, // Duration of animation in ms if enabled
      //   animationEasing: undefined, // Easing of animation if enabled
      //   // transform: function( node, pos ){ return pos; }, // A function that applies a transform to the final node position
      //   // ready: undefined, // Callback on layoutready
      //   // stop: undefined, // Callback on layoutstop
      //   klay: {
      //     // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
      //     addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
      //     aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
      //     borderSpacing: 20, // Minimal amount of space to be left to the border
      //     compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
      //     crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
      //     /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
      //     INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
      //     cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
      //     /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
      //     INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
      //     direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
      //     /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
      //     edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
      //     edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
      //     feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
      //     fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
      //     /* NONE Chooses the smallest layout from the four possible candidates.
      //     LEFTUP Chooses the left-up candidate from the four possible candidates.
      //     RIGHTUP Chooses the right-up candidate from the four possible candidates.
      //     LEFTDOWN Chooses the left-down candidate from the four possible candidates.
      //     RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
      //     BALANCED Creates a balanced layout from the four possible candidates. */
      //     inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
      //     layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
      //     linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
      //     mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
      //     mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
      //     nodeLayering:'NETWORK_SIMPLEX', // Strategy for node layering.
      //     /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
      //     LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
      //     INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
      //     nodePlacement:'BRANDES_KOEPF', // Strategy for Node Placement
      //     /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
      //     LINEAR_SEGMENTS Computes a balanced placement.
      //     INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
      //     SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
      //     randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
      //     routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
      //     separateConnectedComponents: true, // Whether each connected component should be processed separately
      //     spacing: 20, // Overall setting for the minimal amount of space to be left between objects
      //     thoroughness: 7 // How much effort should be spent to produce a nice layout..
      //   },
      //   priority: function( edge ){ return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
      // });
      // @@@@@@@@@@@@@@@@@
      // dagre  Layout
      // @@@@@@@@@@@@@@@@@
      // this.layout = this.cyto.elements().layout({
      //   name: 'dagre',
      //   // dagre algo options, uses default value on undefined
      //   nodeSep: 20, // the separation between adjacent nodes in the same rank
      //   edgeSep: undefined, // the separation between adjacent edges in the same rank
      //   rankSep: undefined, // the separation between each rank in the layout
      //   rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right,
      //   ranker: 'network-simplex', // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
      //   minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge
      //   edgeWeight: function( edge ){ return 1; }, // higher weight edges are generally made shorter and straighter than lower weight edges

      //   // general layout options
      //   fit: true, // whether to fit to viewport
      //   padding: 30, // fit padding
      //   spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      //   nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node
      //   animate: false, // whether to transition the node positions
      //   animateFilter: function( node, i ){ return true; }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
      //   animationDuration: 500, // duration of animation in ms if enabled
      //   animationEasing: undefined, // easing of animation if enabled
      //   boundingBox: {  // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      //     x1: rect.left,
      //     y1: rect.top,
      //     w: rect.width,
      //     h: rect.height,
      //   },
      //   // transform: function( node, pos ){ return pos; }, // a function that applies a transform to the final node position
      //   // ready: function(){}, // on layoutready
      //   // stop: function(){} // on layoutstop
      // });
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

        let savedThis = this;

        // Check if cxtmenu was registered
        if (!savedThis.cyto.cxtmenu) {
          console.log("Resgister");
          cytoscape.use(cxtmenu); // register extension
        }

        // Check if cxtmenu1 or cxtmenu2 were initialized
        if (!this.cyto.cxtmenu1 || !this.cyto.cxtmenu2) {
          console.log("Initializing cxtmenu plugin...");
          this.cxtmenu1 = this.cyto.cxtmenu({
            selector: "[^specialTemp]", //"node[timestamp]", //'node, edge',

            commands: (node) => {
              let arr = [];
              arr.push({
                content: "Load more",
                select: function(node) {
                  console.log(
                    "Load more for node with timestamp = " +
                      node.data("timestamp")
                  );
                  // return;
                  // savedThis.loadNodeChildren(node);
                },
                enabled: false, //node.data("timestamp") !== undefined,
              });
              arr.push({
                content: "Fit",
                select: function(node) {
                  savedThis.fitNode(node); // View this node
                },
                enabled: true,
              });
              arr.push({
                content: "Show Info",
                select: function(node) {
                  // savedThis.toggleInfoBoard();
                  if (savedThis.selectedNode !== node) {
                    savedThis.selectedNode = node;
                  }
                  if (!savedThis.showInfoBoard) {
                    savedThis.showInfoBoard = true;
                  }
                  // console.log("Showing Info for node " + node.id());
                },
                enabled: true,
              });
              arr.push({
                content: "Collapse",
                select: function(node) {
                  savedThis.collapseNode(node);
                },
                enabled: true,
              });
              return arr;
            },
            zIndex: 9999, // the z-index of the ui div
          });
          this.cxtmenu2 = this.cyto.cxtmenu({
            // selector: "[id *= '_TEMP']", //"node[timestamp]", //'node, edge',
            selector: "[specialTemp]", //"node[timestamp]", //'node, edge',

            commands: (node) => {
              let arr = [];
              arr.push({
                content: "Load more",
                select: function(node) {
                  console.log(
                    "Load more for node with timestamp = " +
                      node.data("timestamp")
                  );
                  // return;
                  // savedThis.loadNodeChildren(node);
                },
                enabled: false, //node.data("timestamp") !== undefined,
              });
              arr.push({
                content: "Fit",
                select: function(node) {
                  savedThis.fitNode(node); // View this node
                  console.log("Fitting for node " + node.id());
                },
                enabled: true,
              });
              arr.push({
                content: "Show Info",
                select: function(node) {
                  // savedThis.toggleInfoBoard();
                  if (savedThis.selectedNode !== node) {
                    savedThis.selectedNode = node;
                  }
                  if (!savedThis.showInfoBoard) {
                    savedThis.showInfoBoard = true;
                  }
                  // console.log("Showing Info for node " + node.id());
                },
                enabled: true,
              });
              arr.push({
                content: "Expand",
                select: function(node) {
                  savedThis.expandNode(node);
                },
                enabled: true,
              });
              return arr;
            },
            zIndex: 9999, // the z-index of the ui div
          });
          console.log("Initializing cxtmenu plugin done successfully");
        } else {
          console.warn('"cxtmenu" plugin has been already registered');
        }

        // Finally, we can conclude that this way is wrong in initialization
        // There is a strange problem that let the div part of the graph expand, so I'll let it be initiallized only one time
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

        // Check if plugin "expand-collapse" is initialized, and initialize it if need
        // if (!this.cyto.expandCollapse) {
        //   console.log("Initializing collapse-expand plugin...");
        //   cytoscape.use(expandCollapse);
        //   this.cyto.expandCollapse({
        //     // layoutBy: {
        //     //   name: "cise", //"cose-bilkent",
        //     //   animate: "false",
        //     //   randomize: false,
        //     //   fit: true,
        //     // },
        //     undoable: false, // if set to false, no need for installing plugin. If true, plugin have to be installed
        //     cueEnabled: false,
        //     // expandCueImage: "",
        //     // collapseCueImage: "",
        //     animate: false,
        //     zIndex: 0,
        //   });
        //   this.cytoExpClpAPI = this.cyto.expandCollapse("get");
        //   console.log("Initializing collapse-expand plugin done successfully");
        // }

        // Check if expandCollapse was registered
        if (!this.cyto.expandCollapse) {
          cytoscape.use(expandCollapse);
        }

        // Check if cytoExpClAPI was initialized
        if (!this.cytoExpClpAPI) {
          console.log("Initializing collapse-expand plugin...");
          this.cyto.expandCollapse({
            // layoutBy: {
            //   name: "cise", //"cose-bilkent",
            //   animate: "false",
            //   randomize: false,
            //   fit: true,
            // },
            cueEnabled: false,
            undoable: false, // if set to false, no need for installing plugin. If true, plugin have to be installed
            // expandCueImage: "",
            // collapseCueImage: "",
            animate: false,
            zIndex: 0,
          });
          this.cytoExpClpAPI = this.cyto.expandCollapse("get");
          console.log("Initializing collapse-expand plugin done successfully");
        }

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
      this.loadVersionCountsYearly();
      document.addEventListener("mousemove", this.saveMousePosition);
      // let color = this.getBackgroundColor;
      this.$refs.graph_canvas_ref.style.backgroundColor = "#FCFCFC"; //`rgba(${this.getBackgroundColor.r},${this.getBackgroundColor.g},${this.getBackgroundColor.b},${this.getBackgroundColor.a})`;
      // End of Original Working Code for testing dataset test

      // Show the initial message about the graph locator usage
      this.popupMessage = this.hintTipList.graphLocator.initial;
      this.popupMessageTitle = "Graph Locator";
      this.showPopupMessage = true;

      // Setup initially here edge color
      // this.normalEdgeStyle["line-color"] = `hsl(${this.getEdgeColor.h},${
      //   this.getEdgeColor.s * 100
      // }%,${this.getEdgeColor.l * 100}%)`;
      PLSUtilities.parse(PLSUtilities.PLSData, punycode.toASCII);
    });
  },

  // "beforeDestroy" hook
  beforeDestroy() {
    if (this.cyto) {
      this.resetTimeline();
      this.resetNetwork();
      console.log("Destroying Cytoscape...");
      if (this.cxtmenu1) {
        console.log("Destroying this.cxtmenu1...");
        this.cxtmenu1.destroy();
        this.cxtmenu1 = undefined;
      }
      if (this.cxtmenu2) {
        console.log("Destroying this.cxtmenu2...");
        this.cxtmenu2.destroy();
        this.cxtmenu2 = undefined;
      }
      if (this.cyto.cxtmenu) {
        this.cyto.cxtmenu = undefined; // Can this work??
      }
      cytoscape.use = () => {}; // Can this work?
      this.cyto.destroy();
      console.log("Cytoscape destroyed Successfully");
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

.aside-title {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 15px;
  margin-bottom: 15px;
  border-bottom: 1px dotted lightgray;
}

.graph-locator-show-button {
  /* position: absolute; */
  top: 20%;
  transform: rotate(-90deg) translateY(-80px);
  z-index: 3;
}

.settings-show-button {
  transform-origin: right bottom !important;
  top: 10px;
  right: 0;
  transform: rotate(-90deg);
  z-index: 3;
}

.info-board-show-button {
  bottom: 0;
  right: 0;
  z-index: 3;
}

.graph-div {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: hidden;
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

.graph-locator {
  position: absolute;
  width: 10%;
  height: 100%; /*fit-content;*/ /* This was working good */
  /* background-color: brown; */
  /* right: 0; */
  /* top: 20%; */
  z-index: 3;
}

aside {
  width: 315px !important;
}

.v-icon.v-icon.v-icon--link {
  color: #fff !important;
}

.theme--dark.v-treeview {
  color: #fff;
  background-color: #404040;
  border: 1px solid #595959 !important;
  overflow-y: auto;
}

.build-timeline {
  margin-top: 20px;
}

.notranslate.mdi-search-web {
  color: red !important;
}
</style>
