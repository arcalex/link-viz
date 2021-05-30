<!-- Settings for controlling graph and other options in rendering the graph -->
<template>
  <!-- <v-dialog v-model="visibility" persistent max-width="290"> -->
  <div class="main-settings">
    <v-card>
      <v-card-title>Settings</v-card-title>
      <v-tabs
        v-model="mainTab"
        fixed-tabs
        background-color="black"
        dark
      >
        <v-tabs-slider color="yellow"></v-tabs-slider>
        <v-tab>Nodes</v-tab>
        <v-tab>Edges</v-tab>
        <v-tab>Others</v-tab>
      </v-tabs>
      <v-tabs-items v-model="mainTab">
        <!-- -------- -->
        <!-- -------- -->
        <!-- Node Tab -->
        <!-- -------- -->
        <!-- -------- -->
        <v-tab-item>
          <v-card class="d-flex flex-row flex-wrap justify-center tab-settings">
            <!-- +++++ -->
            <!-- Color -->
            <!-- +++++ -->
            <v-card shaped elevation="6" width="40%">
              <v-card-title>Color</v-card-title>
              <v-card-text>
                <span>Selected color</span>
                <v-color-picker
                  hide-canvas
                  mode="rgba"
                  :disabled="selectedNodeColorTypeIndex !== 0"
                  v-model="nodeColoringMethodColor"
                  @update:color="updateNodeUniformColor"
                >
                </v-color-picker>
              </v-card-text>
              <v-card-actions class="d-flex-inline">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      color="orange"
                      @click="
                        setColoringAction({
                          color: nodeColoringMethodColor.rgba,
                          methodIndex: 0,
                        })
                      "
                      ><v-icon large class="base-custom-icon color-all-nodes"></v-icon></v-btn
                    >
                  </template>
                  <span
                    >Assign Selected color to <strong>ALL</strong> nodes</span
                  >
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      color="orange"
                      @click="
                        setColoringAction({
                          color: nodeColoringMethodColor.rgba,
                          methodIndex: 1,
                        })
                      "
                      ><v-icon large class="base-custom-icon color-selected-node"></v-icon></v-btn
                    >
                  </template>
                  <span>Assign Selected color to selected node</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      color="orange"
                      @click="
                        setColoringAction({
                          color: nodeColoringMethodColor.rgba,
                          methodIndex: 2,
                        })
                      "
                      ><v-icon large class="base-custom-icon color-nodes-in-selected-domain"></v-icon></v-btn
                    >
                  </template>
                  <span
                    >Assign Selected color to nodes belonging to same domain of
                    selected node</span
                  >
                </v-tooltip>
                <!-- <v-divider vertical></v-divider> -->
                <v-spacer></v-spacer>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      color="orange"
                      @click="
                        setColoringAction({
                          color: nodeColoringMethodColor.rgba,
                          methodIndex: 3,
                        })
                      "
                      ><v-icon large class="base-custom-icon color-nodes-in-domain-based"></v-icon></v-btn
                    >
                  </template>
                  <span>Apply domain-driven colors</span>
                </v-tooltip>
              </v-card-actions>
            </v-card>

            <!-- +++++ -->
            <!-- Size -->
            <!-- +++++ -->
            <v-card shaped elevation="6" width="40%">
              <v-card-title>Size</v-card-title>
              <v-card-text>
                <v-radio-group
                  mandatory
                  column
                  @change="updateNodeSizeType"
                  v-model="selectedNodeSizeTypeIndex"
                >
                  <template v-slot:label>
                    <span><strong>Size type calculation</strong></span>
                  </template>
                  <v-radio
                    v-for="(type, index) in getNodeSizeTypeList"
                    :label="type"
                    :key="index"
                    :value="index"
                  ></v-radio>
                </v-radio-group>
                <v-slider
                  label="Level"
                  :min="10"
                  :max="50"
                  :step="1"
                  :value="getLatestUniformNodeSizeUsedValue"
                  thumb-label="always"
                  v-if="selectedNodeSizeTypeIndex === 0"
                  class="mt-4"
                  @change="updateUniformNodeSize"
                >
                </v-slider>
                <v-range-slider
                  label="Range"
                  :min="10"
                  :max="50"
                  :value="currentNodeSizeTypeRangeValue"
                  :step="1"
                  thumb-label="always"
                  v-else
                  class="mt-4"
                  @change="UpdateNodeSizeTypeRangeValue"
                >
                </v-range-slider>
              </v-card-text>
            </v-card>

            <!-- +++++ -->
            <!-- Shape -->
            <!-- +++++ -->
            <v-card shaped elevation="6" width="40%">
              <v-card-title>Shape</v-card-title>
              <v-card-text>
                <v-radio-group mandatory column @change="updateNodeShapeType">
                  <span>Shape type selection</span>
                  <v-radio
                    v-for="(type, index) in getNodeShapeTypeList"
                    :label="type"
                    :key="index"
                  >
                  </v-radio>
                </v-radio-group>
                <v-select
                  :disabled="getSelectedNodeShapeTypeIndex === 0"
                  label="Node shape"
                  :items="getNodeShapeList"
                  @change="updateNodeShape"
                  :value="getNodeShapeList[getSelectedNodeShapeIndex]"
                ></v-select>
              </v-card-text>
            </v-card>

            <!-- +++++++++++++ -->
            <!-- Miscellaneous -->
            <!-- +++++++++++++ -->
            <v-card shaped elevation="6" width="40%">
              <v-card-title>Miscellaneous</v-card-title>
              <v-card-text>
                <v-radio-group
                  mandatory
                  column
                  @change="setSelectedNodeLabelFormatIndex"
                  v-model="selectedNodeLabelFormatIndex"
                >
                  <template v-slot:label>
                    <div>Node Label Format</div>
                  </template>
                  <v-radio
                    v-for="(type, index) in getNodeLabelFormatList"
                    :label="type"
                    :key="index"
                    :value="index"
                  ></v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </v-card>
        </v-tab-item>

        <!-- -------- -->
        <!-- -------- -->
        <!-- Edge Tab -->
        <!-- -------- -->
        <!-- -------- -->
        <v-tab-item>
          <v-card class="d-flex flex-row flex-wrap justify-center tab-settings">
            <v-card shaped elevation="6" width="40%">
              <v-card-title>Color</v-card-title>
              <v-card-text>
                <v-radio-group
                  mandatory
                  column
                  @change="setSelectedEdgeColorTypeIndex"
                  v-model="selectedEdgeColorTypeIndex"
                >
                  <span>Edge color method</span>
                  <v-radio
                    v-for="(type, index) in getEdgeColorTypeList"
                    :label="type"
                    :key="index"
                  >
                  </v-radio>
                </v-radio-group>
                <v-color-picker
                  hide-canvas
                  @update:color="updateEdgeColor"
                  :value="getEdgeColor"
                >
                </v-color-picker>
                <v-switch
                  label="Use white color and dashed line(s) for external edge(s)"
                  @change="setUseDifferentStyleForExtEdges"
                  :disabled="selectedEdgeColorTypeIndex === 0"
                >
                </v-switch>
              </v-card-text>
            </v-card>
          </v-card>
        </v-tab-item>

        <!-- ---------- -->
        <!-- ---------- -->
        <!-- Others Tab -->
        <!-- ---------- -->
        <!-- ---------- -->
        <v-tab-item>
          <v-card class="d-flex flex-row flex-wrap justify-center tab-settings">
            <v-card shaped elevation="6" width="40%">
              <v-card-title>Background Color</v-card-title>
              <!-- Background Color -->
              <!-- <v-chip label large outlined>Background Color</v-chip> -->
              <v-card-text>
                <v-color-picker
                  hide-mode-switch
                  class="ma-2"
                  @update:color="updateBackgroundColor"
                  :value="getBackgroundColor"
                >
                </v-color-picker>
              </v-card-text>
            </v-card>
          </v-card>
        </v-tab-item>
      </v-tabs-items>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text @click="closeDialog()">Close</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </div>
  <!-- </v-dialog> -->
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
 * Settings Customization UI widget
 */
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      mainTab: null,
      selectedEdgeColorTypeIndex: 0,
      selectedNodeColorTypeIndex: 0,
      selectedNodeSizeTypeIndex: 0,
      nodeColoringMethodColor: {},
      selectedNodeLabelFormatIndex: 0,
    };
  },

  computed: {
    ...mapGetters({
      // getLinkservRequestURLHub: "getLinkservRequestURLHub",
      getBackgroundColor: "getBackgroundColor",
      getNodeSizeTypeList: "getNodeSizeTypeList",
      // getNodeColorTypeList: "getNodeColorTypeList",
      getNodeShapeTypeList: "getNodeShapeTypeList",
      getNodeShapeList: "getNodeShapeList",
      getEdgeColorTypeList: "getEdgeColorTypeList",
      getNodeLabelFormatList: "getNodeLabelFormatList",
      getNodeUniformColor: "getNodeUniformColor",
      getEdgeColor: "getEdgeColor",
      getNodeColoringMethodList: "getNodeColoringMethodList",
      getSelectedNodeSizeTypeIndex: "getSelectedNodeSizeTypeIndex",
      getSelectedNodeLabelFormatIndex: "getSelectedNodeLabelFormatIndex",
      getSelectedNodeShapeTypeIndex: "getSelectedNodeShapeTypeIndex",
      getSelectedNodeShapeIndex: "getSelectedNodeShapeIndex",

      // TODO: Try to rename them in the future
      getLatestUniformNodeSizeUsedValue: "getLatestUniformNodeSizeUsedValue",
      getLatestFileSizeBasedNodeSizeValue:
        "getLatestFileSizeBasedNodeSizeValue",
      getLatestInlinkCountBasedNodeSizeValue:
        "getLatestInlinkCountBasedNodeSizeValue",
      getLatestOutlinkCountBasedNodeSizeValue:
        "getLatestOutlinkCountBasedNodeSizeValue",
      // TODO: Later
      // getNodeSizeValidRange: "getNodeSizeValidRange"
    }),

    currentNodeSizeTypeRangeValue() {
      switch (this.getSelectedNodeSizeTypeIndex) {
        case 1:
          // File-size based
          return this.getLatestFileSizeBasedNodeSizeValue;
          break;

        case 2:
          // Inlink-count based
          return this.getLatestInlinkCountBasedNodeSizeValue;
          break;

        case 3:
          // Outlink-count based
          return this.getLatestOutlinkCountBasedNodeSizeValue;
          break;

        default:
          // uniform selected => return []
          return [];
          break;
      }
    },
  },

  methods: {
    ...mapActions({
      setBackgroundColor: "setBackgroundColor",
      setSelectedNodeSizeTypeIndex: "setSelectedNodeSizeTypeIndex",
      // setSelectedNodeColorTypeIndex: "setSelectedNodeColorTypeIndex",
      setSelectedNodeShapeTypeIndex: "setSelectedNodeShapeTypeIndex",
      setSelectedNodeShapeIndex: "setSelectedNodeShapeIndex",
      setSelectedEdgeColorTypeIndex: "setSelectedEdgeColorTypeIndex",
      setSelectedNodeLabelFormatIndex: "setSelectedNodeLabelFormatIndex",
      setNodeUniformColor: "setNodeUniformColor",
      setColoringAction: "setColoringAction",
      setEdgeColor: "setEdgeColor",
      // setLinkservRequestURLHub: "setLinkservRequestURLHub",
      // setProgressIndicatorVisibility: "setProgressIndicatorVisibility",
      setLatestUniformNodeSizeUsedValue: "setLatestUniformNodeSizeUsedValue",
      setLatestFileSizeBasedNodeSizeValue:
        "setLatestFileSizeBasedNodeSizeValue",
      setLatestInlinkCountBasedNodeSizeValue:
        "setLatestInlinkCountBasedNodeSizeValue",
      setLatestOutlinkCountBasedNodeSizeValue:
        "setLatestOutlinkCountBasedNodeSizeValue",
      setUseDifferentStyleForExtEdges: "setUseDifferentStyleForExtEdges",
    }),

    // Close the dialog settings
    closeDialog() {
      this.$emit("onClose");
    },

    // Update background color
    updateBackgroundColor(color) {
      this.setBackgroundColor(color.rgba);
    },

    // Update Node Size Type
    updateNodeSizeType(index) {
      this.setSelectedNodeSizeTypeIndex(index); // Update index
    },

    // Update Uniform Node Size after changing with slider
    updateUniformNodeSize(value) {
      // console.log("Inside updateUniformNodeSize, value = " + value);
      this.setLatestUniformNodeSizeUsedValue(value);
    },

    // Update Edge Color
    updateEdgeColor(color) {
      this.setEdgeColor(color.hsla);
    },
    // Update Range Values for selected ranged node size Type
    UpdateNodeSizeTypeRangeValue(rangedValue) {
      console.log("Inside UpdateNodeSizeTypeRangeValue " + rangedValue);
      switch (this.getSelectedNodeSizeTypeIndex) {
        case 1:
          // File-size based
          this.setLatestFileSizeBasedNodeSizeValue(rangedValue);
          break;

        case 2:
          // Inlink-count based
          this.setLatestInlinkCountBasedNodeSizeValue(rangedValue);
          break;

        case 3:
          // Outlink-count based
          this.setLatestOutlinkCountBasedNodeSizeValue(rangedValue);
          break;

        default:
          // uniform selected => nothing
          break;
      }
    },

    // Update Node Uniform color  if selected
    updateNodeUniformColor(color) {
      this.setNodeUniformColor(color);
    },

    updateNodeShape(selected) {
      this.setSelectedNodeShapeIndex(this.getNodeShapeList.indexOf(selected));
    },

    // Update Node Shape Type
    updateNodeShapeType(index) {
      this.setSelectedNodeShapeTypeIndex(index); // Update index
    },
  },

  mounted() {
    this.selectedNodeLabelFormatIndex = this.getSelectedNodeLabelFormatIndex;
  },
};
</script>

<style scoped>
.main-settings {
  height: 30%;
  max-height: 30%;
  overflow: auto;
}

.tab-settings {
  overflow-y: auto;
  height: 500px;
}
</style>