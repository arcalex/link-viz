<template>
  <div class="path-finder-tool" ref="pathFinderTool">
    <!-- <v-scroll-y-transition mode="out-in"> -->
    <v-card color="gray" dark>
      <v-system-bar
        class="path-finder-tool-header"
        color="black"
        dark
        ref="infoBoardHeader"
        @mousedown="dragInfoBoard($event)"
      >
        <!-- <v-card-text>{{ getFinderToolTitle() }}</v-card-text> -->
        <v-card-text>Path Finder Tool</v-card-text>
        <v-spacer></v-spacer>
        <v-btn icon dark x-small @click="hidePathFinderTool()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-system-bar>
      <div class="pa-3">
        <v-alert outlined :type="getPathFinderMessageType" prominent border="left">
          {{ messages[getPathFinderMessageType] }}
        </v-alert>

        <v-row
          align="center"
          v-for="(nodeObj, index) in pathFinderUIDataList"
          :key="index"
        >
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="openNodeSelectionMode(nodeObj.type)"
                icon
                light
                :disabled="!getLoadedGraphFlag"
              >
                <v-icon color="orange">mdi-cursor-pointer</v-icon>
              </v-btn>
            </template>
            <span>Open {{ nodeObj.type }} node selection mode</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="cancelNodeSelectionMode(nodeObj.type)"
                icon
                light
                :disabled="nodeObj.disabled"
              >
                <v-icon color="orange">mdi-cancel</v-icon>
              </v-btn>
            </template>
            <span>Cancel {{ nodeObj.type }} node selection mode</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="fitNodeSelectionToView(nodeObj.type)"
                icon
                light
                :disabled="nodeObj.disabled"
              >
                <v-icon color="orange">mdi-fit-to-page-outline</v-icon>
              </v-btn>
            </template>
            <span>Fit selected {{ nodeObj.type }} to view</span>
          </v-tooltip>
          <v-text-field
            :prefix="nodeObj.type + ':'"
            :placeholder="nodeObj.placeholder"
            readonly
            disabled
            v-model="nodeObj.value"
          >
          </v-text-field>
        </v-row>
        <v-row class="d-flex">
          <v-card-actions>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  icon
                  light
                  @click="fitAllNodesToView"
                  :disabled="!(getPathFinderSource && getPathFinderTarget)"
                >
                  <v-icon color="orange">mdi-fit-to-page-outline</v-icon>
                </v-btn>
              </template>
              <span>Fit both source and target to view</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  icon
                  light
                  @click="swapSourceAndTargetNodes"
                  :disabled="!(getPathFinderSource || getPathFinderTarget)"
                >
                  <v-icon color="orange">mdi-swap-vertical-bold</v-icon>
                </v-btn>
              </template>
              <span>Swap source and target nodes</span>
            </v-tooltip>
          </v-card-actions>
        </v-row>
      </div>
    </v-card>
    <!-- </v-scroll-y-transition> -->
  </div>
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
 * Finder Tool
 */
import { mapActions, mapGetters } from "vuex";

export default {
  data: () => ({
    previousMousePos: {
      x: 0,
      y: 0,
    },
    currentMousePos: {
      x: 0,
      y: 0,
    },
    pathFinderUIDataList: [
      {
        type: "source",
        placeholder: `No source node selected'`,
        value: null,
        disabled: true,
      },
      {
        type: "target",
        placeholder: "No target node selected",
        value: null,
        disabled: true,
      },
    ],
    messages: {
      info:
        "Please, select source and target nodes. Note that direction matters.",
      warning: "No path exists between these two nodes.",
      success: "Existed path is highlighted",
    },
  }),

  watch: {
    getPathFinderSource: {
      immediate: true,
      handler(val) {
        // FUTURE TODO: Try to avoid using index
        // this.pathFinderUIDataList[0].value = val ? val.url : null;
        let uiData = this.pathFinderUIDataList[0];
        if (val) {
          uiData.value = val.url;
          uiData.disabled = false;
        } else {
          uiData.value = null;
          uiData.disabled = true;
        }
      },
      // color is the same object used by "v-color-picker" component
    },

    getPathFinderTarget: {
      immediate: true,
      handler(val) {
        // FUTURE TODO: Try to avoid using index
        // this.pathFinderUIDataList[1].value = val ? val.url : null;
        let uiData = this.pathFinderUIDataList[1];
        if (val) {
          uiData.value = val.url;
          uiData.disabled = false;
        } else {
          uiData.value = null;
          uiData.disabled = true;
        }
      },
      // color is the same object used by "v-color-picker" component
    },

    getPathFinderResult: {
      immediate: true,
      handler(val) {
        if (val) {
        }
      },
    },
  },
  computed: {
    ...mapGetters({
      getLoadedGraphFlag: "getLoadedGraphFlag",
      getPathFinderSource: "getPathFinderSource",
      getPathFinderTarget: "getPathFinderTarget",
      getPathFinderResult: "getPathFinderResult",
      // getPathFinderMessage: "getPathFinderMessage",
      getPathFinderMessageType: "getPathFinderMessageType",
    }),
  },

  // props: {
  //   type: {
  //     type: String,
  //     required: true,
  //   },
  // },

  methods: {
    ...mapActions({
      // setPathFinderMessage: "setPathFinderMessage",
      setPathFinderMessageType: "setPathFinderMessageType", // valid values: 'success', 'info', 'warning'
    }),

    // Hide Finder Tool
    hidePathFinderTool() {
      this.$emit("hidePathFinderTool");
    },

    // Open Node Selection Mode for choosing a node
    openNodeSelectionMode(type) {
      console.log(type + " node selection mode was opened");
      this.$emit("requestNodeSelection", type);
    },

    // Cancel Node Selection
    cancelNodeSelectionMode(type) {
      console.log(type + " node selection mode was cancelled");
      this.$emit("cancelNodeSelectionRequest", type);
    },

    // Fit node selection to window
    fitNodeSelectionToView(type) {
      this.$emit("fitNodeSelectionToView", type);
    },

    // Fit all nodes to view
    fitAllNodesToView() {
      this.$emit("fitAllNodesToView");
    },

    // Swap source and target nodes
    swapSourceAndTargetNodes() {
      this.$emit("swapSourceAndTargetNodes");
    },

    // getFinderToolTitle() {
    //   console.log("getFinderToolTitle, this.type = " + this.type);
    //   switch (this.type) {
    //     case "pathFinder":
    //       return "Path Finder Tool";
    //       break;

    //     case "loopFinder":
    //       return "Loop Finder Tool";
    //       break;

    //     // default:
    //     //   // Never reach this point at all
    //     //   return "Undefined Finder Type!"
    //     //   // throw new Error("Undefined Finder Type!")
    //     //   break;
    //   }
    //   // Never reach this point at all
    //   return "Undefined Finder Type!";
    // },

    // getNodeData(nodeType) {
    //   switch (this.type) {
    //     case "source":
    //       return this.getPathFinderSource ? this.getPathFinderSource.url : null;
    //       break;

    //     case "target":
    //       return this.getPathFinderTarget ? this.getPathFinderTarget.url : null;
    //       break;
    //   }
    //   return null;
    // },

    // Start dragging the info board
    dragInfoBoard(event) {
      event = event || window.event;
      event.preventDefault();
      // this.isMouseDown = true;
      this.currentMousePos.x = event.clientX;
      this.currentMousePos.y = event.clientY;
      // console.log("isMouseDown : " + this.isMouseDown);
      document.addEventListener("mousemove", this.moveFinderTool);
      document.addEventListener("mouseup", this.closeFinderToolDragging);
    },

    // Move the info board while dragging the mouse
    moveFinderTool(event) {
      event = event || window.event;
      event.preventDefault();
      // if (this.isMouseDown) {
      // console.log("Inside 'moveFinderTool', this.$refs.pathFinderTool");
      // console.log(this.$refs.pathFinderTool);
      this.previousMousePos.x = this.currentMousePos.x;
      this.previousMousePos.y = this.currentMousePos.y;

      this.currentMousePos.x = event.clientX;
      this.currentMousePos.y = event.clientY;

      this.$refs.pathFinderTool.style.left =
        this.$refs.pathFinderTool.offsetLeft +
        this.currentMousePos.x -
        this.previousMousePos.x +
        "px";

      this.$refs.pathFinderTool.style.top =
        this.$refs.pathFinderTool.offsetTop +
        this.currentMousePos.y -
        this.previousMousePos.y +
        "px";

      // }
    },

    // After mouse release, close dragging
    closeFinderToolDragging() {
      document.removeEventListener("mousemove", this.moveFinderTool);
      document.removeEventListener("mouseup", this.closeFinderToolDragging);
      // this.isMouseDown = false;
      // console.log("isMouseDown : " + this.isMouseDown);
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.setPathFinderMessageType("info");
    });
  },
};
</script>

<style scoped>
.path-finder-tool {
  position: absolute;
  /* overflow: auto; */
  width: 30%; /*fit-content;*/
  /* margin: auto; */
  /* top: 20%;
  right: 20%; */
  z-index: 4;
  /* left: 35% !important; */
  left: 35%;
  /* right: 35% !important; */
  /* right: 35% ;
  top: 20%;
  bottom: 20%; */
}
/* .alert {
  margin-left: 23px;
  margin-right: 23px;
  margin-bottom: 23px;
} */

.path-finder-tool-header {
  cursor: move;
}
</style>