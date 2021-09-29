<!-- Settings for controlling graph and other options in rendering the graph -->
<template>
  <!-- <v-dialog v-model="visibility" persistent max-width="290"> -->
  <v-navigation-drawer absolute right permanent class="navigation-drawer">
    <div class="d-flex flex-column main">
      <v-row no-gutters class="aside-title flex-grow-0">
        <h4 class="white--text">Settings</h4>
        <v-spacer></v-spacer>
        <v-col cols="auto">
          <v-btn color="white" icon dark x-small @click="hideSettings()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-tabs
        v-model="mainTab"
        fixed-tabs
        background-color="black"
        dark
        class="flex-grow-0"
      >
        <v-tabs-slider color="yellow"></v-tabs-slider>
        <v-tab>Nodes</v-tab>
        <v-tab>Edges</v-tab>
        <v-tab>Others</v-tab>
      </v-tabs>
      <v-tabs-items v-model="mainTab" style="overflow-y: auto">
        <!-- -------- -->
        <!-- -------- -->
        <!-- Node Tab -->
        <!-- -------- -->
        <!-- -------- -->
        <v-tab-item>
          <v-card :disabled="!getLoadedGraphFlag" class="d-flex flex-column">
            <!-- +++++ -->
            <!-- Color -->
            <!-- +++++ -->
            <v-card flat class="separator">
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
                      ><v-icon
                        large
                        class="base-custom-icon color-all-nodes"
                      ></v-icon
                    ></v-btn>
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
                      :disabled="!getSelectedNodeFlag"
                      @click="
                        setColoringAction({
                          color: nodeColoringMethodColor.rgba,
                          methodIndex: 1,
                        })
                      "
                      ><v-icon
                        large
                        class="base-custom-icon color-selected-node"
                      ></v-icon
                    ></v-btn>
                  </template>
                  <span>Assign Selected color to selected node</span>
                </v-tooltip>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      v-on="on"
                      icon
                      color="orange"
                      :disabled="!getSelectedNodeFlag"
                      @click="
                        setColoringAction({
                          color: nodeColoringMethodColor.rgba,
                          methodIndex: 2,
                        })
                      "
                      ><v-icon
                        large
                        class="base-custom-icon color-nodes-in-selected-domain"
                      ></v-icon
                    ></v-btn>
                  </template>
                  <span
                    >Assign Selected color to nodes belonging to same domain of
                    selected node</span
                  >
                </v-tooltip>
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
                      ><v-icon
                        large
                        class="base-custom-icon color-nodes-in-domain-based"
                      ></v-icon
                    ></v-btn>
                  </template>
                  <span>Apply domain-driven colors randomly</span>
                </v-tooltip>
              </v-card-actions>
            </v-card>

            <!-- +++++ -->
            <!-- Size -->
            <!-- +++++ -->
            <v-card flat class="separator">
              <v-card-title>Size</v-card-title>
              <v-card-text>
                <v-radio-group
                  mandatory
                  column
                  @change="updateNodeSizeCalcIndex"
                  v-model="nodeSizeCalcIndex"
                >
                  <template v-slot:label>
                    <span><strong>Size type calculation</strong></span>
                  </template>
                  <v-radio
                    v-for="value in getNodeSizeCalcEnum"
                    :label="getNodeSizeCalcEnumLabel(value)"
                    :key="value"
                    :value="value"
                  ></v-radio>
                </v-radio-group>
                <SpinBox
                  v-if="nodeSizeCalcIndex === 0"
                  placeholder="Enter integer value for uniform size"
                  label="Uniform size"
                  :min="1"
                  :initValue="getUniformNodeSize"
                  :max="100"
                  @valueReady="updateUniformNodeSize"
                />
                <RangeSpinBox
                  v-else
                  :min="1"
                  :max="100"
                  :initMin="1"
                  :initMax="100"
                  minPlaceholder="Minimum Value"
                  maxPlaceholder="Maximum Value"
                  minLabel="Minimum Bound"
                  maxLabel="Maximum Bound"
                  @valueReady="UpdateNodeSizeCalcRange"
                />
              </v-card-text>
            </v-card>

            <!-- +++++ -->
            <!-- Shape -->
            <!-- +++++ -->
            <v-card flat class="separator">
              <v-card-title>Shape</v-card-title>
              <v-card-text>
                <v-radio-group
                  mandatory
                  column
                  @change="updateNodeShapeCategory"
                >
                  <span>Shape type selection</span>
                  <v-radio
                    v-for="value in getNodeShapeCategoryEnum"
                    :label="getNodeShapeCategoryEnumLabel(value)"
                    :key="value"
                  >
                  </v-radio>
                </v-radio-group>
                <v-select
                  :disabled="
                    getNodeShapeCategoryCurrentIndex ===
                      getNodeShapeCategoryEnum.favicon
                  "
                  label="Node shape"
                  :items="getNodeShapeList"
                  @change="updateNodeShape"
                  :value="getNodeShapeList[getNodeShapeCurrentIndex]"
                ></v-select>
              </v-card-text>
            </v-card>

            <!-- +++++++++++++ -->
            <!-- Miscellaneous -->
            <!-- +++++++++++++ -->
            <v-card flat>
              <v-card-title>Miscellaneous</v-card-title>
              <v-card-text>
                <v-radio-group
                  mandatory
                  column
                  @change="setNodeLabelFormatCurrentIndex"
                  v-model="selectedNodeLabelFormatIndex"
                >
                  <template v-slot:label>
                    <div>Node Label Format</div>
                  </template>
                  <v-radio
                    v-for="value in getNodeLabelFormatEnum"
                    :label="getNodeLabelFormatEnumLabel(value)"
                    :key="value"
                    :value="value"
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
          <!-- <v-card :disabled="!getLoadedGraphFlag" class="d-flex flex-column"> -->
          <!-- For now, let it be disabled all the time-->
          <v-card :disabled="!getLoadedGraphFlag" class="d-flex flex-column">
            <v-card flat>
              <v-card-title>Color</v-card-title>
              <v-card-text>
                <v-radio-group
                  mandatory
                  column
                  @change="setEdgeColoringMethodCurrentIndex"
                  v-model="selectedEdgeColorTypeIndex"
                >
                  <p>Edge color method</p>
                  <v-radio
                    v-for="value in getEdgeColoringMethodEnum"
                    :label="getEdgeColoringMethodEnumLabel(value)"
                    :key="value"
                  >
                  </v-radio>
                </v-radio-group>
                <v-color-picker
                  :hide-canvas="selectedEdgeColorTypeIndex === 1"
                  @update:color="updateEdgeColor"
                  :value="getEdgeColor"
                >
                </v-color-picker>
                <v-switch
                  label="Use dashed line(s) for external edge(s)"
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
          <v-card class="d-flex flex-column">
            <v-card flat>
              <v-card-title>Background Color</v-card-title>
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
            <v-divider></v-divider>
            <v-card flat>
              <v-card-title>Screenshot resolution</v-card-title>
              <v-tooltip left>
                <template v-slot:activator="{ on, attrs }">
                  <v-card-text color="primary" dark v-bind="attrs" v-on="on">
                    <v-slider
                      prepend-icon="mdi-monitor-screenshot"
                      v-model="screenshotSlider.val"
                      :value="getScreenshotResolution.value"
                      :label="screenshotSlider.label"
                      :thumb-size="24"
                      max="10"
                      min="1"
                      thumb-label="always"
                      @change="updateScreenShotResolution"
                    >
                      <template v-slot:append>
                        <v-text-field
                          v-model="screenshotSlider.val"
                          :value="getScreenshotResolution.value"
                          class="mt-0 pt-0"
                          hide-details
                          single-line
                          type="number"
                          style="width: 60px"
                          @change="updateScreenShotResolution"
                        ></v-text-field> </template
                    ></v-slider>
                  </v-card-text>
                </template>
                <span
                  >This value specifies the size of the resultant image.</span
                >
              </v-tooltip>
              <v-card-text class="py-0">
                <v-radio-group
                  v-model="screenshotFormat"
                  row
                  @change="updateScreenShotResolution"
                >
                  <v-radio label="PNG" value="png"></v-radio>
                  <v-radio label="JPG" value="jpg"></v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>
  </v-navigation-drawer>
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
import SpinBox from "@/components/SpinBox.vue";
import RangeSpinBox from "@/components/RangeSpinBox.vue";

export default {
  components: {
    SpinBox,
    RangeSpinBox,
  },
  data() {
    return {
      mainTab: null,
      selectedEdgeColorTypeIndex: 0,
      selectedNodeColorTypeIndex: 0,
      nodeSizeCalcIndex: 0,
      nodeColoringMethodColor: {},
      selectedNodeLabelFormatIndex: 0,
      screenshotFormat: "png",
      screenshotSlider: { label: "", val: 5 },
    };
  },

  computed: {
    ...mapGetters({
      getNodeSizeCalcEnum: "getNodeSizeCalcEnum",
      getBackgroundColor: "getBackgroundColor",
      getNodeShapeCategoryEnum: "getNodeShapeCategoryEnum",
      getNodeShapeList: "getNodeShapeList",
      getEdgeColoringMethodEnum: "getEdgeColoringMethodEnum",
      getNodeLabelFormatEnum: "getNodeLabelFormatEnum",
      getNodeUniformColor: "getNodeUniformColor",
      getEdgeColor: "getEdgeColor",
      getNodeColoringMethodEnum: "getNodeColoringMethodEnum",
      getNodeSizeCalcCurrentIndex: "getNodeSizeCalcCurrentIndex",
      getNodeLabelFormatCurrentIndex: "getNodeLabelFormatCurrentIndex",
      getNodeShapeCategoryCurrentIndex: "getNodeShapeCategoryCurrentIndex",
      getNodeShapeCurrentIndex: "getNodeShapeCurrentIndex",
      getUniformNodeSize: "getUniformNodeSize",
      getInlinkNodeSizeRange: "getInlinkNodeSizeRange",
      getOutlinkNodeSizeRange: "getOutlinkNodeSizeRange",
      getLoadedGraphFlag: "getLoadedGraphFlag",
      getSelectedNodeFlag: "getSelectedNodeFlag",
      getScreenshotResolution: "getScreenshotResolution",
    }),
  },

  methods: {
    ...mapActions({
      setBackgroundColor: "setBackgroundColor",
      setNodeSizeCalcCurrentIndex: "setNodeSizeCalcCurrentIndex",
      setNodeShapeCategoryCurrentIndex: "setNodeShapeCategoryCurrentIndex",
      setNodeShapeCurrentIndex: "setNodeShapeCurrentIndex",
      setEdgeColoringMethodCurrentIndex: "setEdgeColoringMethodCurrentIndex",
      setNodeLabelFormatCurrentIndex: "setNodeLabelFormatCurrentIndex",
      setNodeUniformColor: "setNodeUniformColor",
      setColoringAction: "setColoringAction",
      setEdgeColor: "setEdgeColor",
      setUniformNodeSize: "setUniformNodeSize",
      setInlinkNodeSizeRange: "setInlinkNodeSizeRange",
      setOutlinkNodeSizeRange: "setOutlinkNodeSizeRange",
      setUseDifferentStyleForExtEdges: "setUseDifferentStyleForExtEdges",
      setScreenshotResolution: "setScreenshotResolution",
    }),

    // Set Screenshot Resolution Value and Format
    updateScreenShotResolution() {
      this.setScreenshotResolution({
        value: this.screenshotSlider.val,
        format: this.screenshotFormat,
      });
    },

    // Close the dialog settings
    hideSettings() {
      this.$emit("hideSettings");
    },

    // Update background color
    updateBackgroundColor(color) {
      this.setBackgroundColor(color.rgba);
    },

    // Update Node Size Type
    updateNodeSizeCalcIndex(index) {
      // this.setSelectedNodeSizeTypeIndex(index); // Update index
      this.setNodeSizeCalcCurrentIndex(index); // Update index
    },

    // Update Uniform Node Size after changing with slider
    updateUniformNodeSize(value) {
      // console.log("Inside updateUniformNodeSize, value = " + value);
      // this.setLatestUniformNodeSizeUsedValue(value);
      this.setUniformNodeSize(value);
    },

    // Update Edge Color
    updateEdgeColor(color) {
      this.setEdgeColor(color.hsla);
    },
    // Update Range Values for selected ranged node size Type
    UpdateNodeSizeCalcRange(rangedValue) {
      switch (this.getNodeSizeCalcCurrentIndex) {
        case this.getNodeSizeCalcEnum.inlinkCount:
          // Inlink-count based
          this.setInlinkNodeSizeRange(rangedValue);
          break;

        case this.getNodeSizeCalcEnum.outlinkCount:
          // Outlink-count based
          this.setOutlinkNodeSizeRange(rangedValue);
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
      this.setNodeShapeCurrentIndex(this.getNodeShapeList.indexOf(selected));
    },

    // Update Node Shape Type
    // updateNodeShapeType(index) {
    updateNodeShapeCategory(index) {
      // this.setSelectedNodeShapeTypeIndex(index); // Update index
      this.setNodeShapeCategoryCurrentIndex(index); // Update index
    },

    // Return the label
    getNodeSizeCalcEnumLabel(value) {
      let label = "";
      switch (value) {
        case this.getNodeSizeCalcEnum.uniform:
          label = "Uniform";
          break;

        case this.getNodeSizeCalcEnum.inlinkCount:
          label = "Inlink Count";
          break;

        case this.getNodeSizeCalcEnum.outlinkCount:
          label = "Outlink Count";
          break;

        default:
          // NEVER reach this point!!
          label = "UNDEFINED";
          break;
      }
      return label;
    },

    // Return the label
    getNodeShapeCategoryEnumLabel(value) {
      let label = "";
      switch (value) {
        case this.getNodeShapeCategoryEnum.favicon:
          label = "Favicon";
          break;

        case this.getNodeShapeCategoryEnum.geometric:
          label = "Geometric";
          break;

        default:
          // NEVER reach this point!!
          label = "UNDEFINED";
          break;
      }
      return label;
    },

    // Return the label
    getNodeLabelFormatEnumLabel(value) {
      let label = "";
      switch (value) {
        case this.getNodeLabelFormatEnum.short:
          label = "short";
          break;

        case this.getNodeLabelFormatEnum.long:
          label = "long";
          break;

        default:
          // NEVER reach this point!!
          label = "UNDEFINED";
          break;
      }
      return label;
    },

    // Return the label
    getEdgeColoringMethodEnumLabel(value) {
      let label = "";
      switch (value) {
        case this.getEdgeColoringMethodEnum.uniform:
          label = "Uniform";
          break;

        case this.getEdgeColoringMethodEnum.domainNameAndDepth:
          label = "Domain Name And Depth";
          break;

        default:
          // NEVER reach this point!!
          label = "UNDEFINED";
          break;
      }
      return label;
    },
  },

  mounted() {
    this.selectedNodeLabelFormatIndex = this.getNodeLabelFormatCurrentIndex;
    this.nodeSizeCalcIndex = this.getNodeSizeCalcCurrentIndex;
  },
};
</script>

<style scoped>
.separator {
  border-bottom: 1px solid lightgray;
}

.aside-title {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-bottom: 1px dotted lightgray;
}

.main {
  height: 100%;
}

.tab-settings {
  overflow-y: auto;
  /* height: 500px; */
}

.navigation-drawer {
  z-index: 3;
}
</style>
