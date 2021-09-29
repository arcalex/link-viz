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
// TODO:  rename it to _nodeSizeCalcList
const _nodeSizeCalcEnum = { uniform: 0, inlinkCount: 1, outlinkCount: 2 };
const _nodeShapeCategoryEnum = { favicon: 0, geometric: 1 };
const _nodeShapeList = [
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
const _nodeLabelFormatEnum = { short: 0, long: 1 }; // How to display node label
const _edgeColoringMethodEnum = { uniform: 0, domainNameAndDepth: 1 };
const _nodeColoringMethodEnum = {
  all: 0,
  selected: 1,
  selectedNodeDomain: 2,
  domainDriven: 3,
}; // Types of coloring nodes

// Set the following objects to be immutable
Object.freeze(_nodeSizeCalcEnum);
Object.freeze(_nodeShapeCategoryEnum);
Object.freeze(_nodeShapeList);
Object.freeze(_nodeLabelFormatEnum);
Object.freeze(_edgeColoringMethodEnum);
Object.freeze(_nodeColoringMethodEnum);

export const state = () => ({
  // Hold URLs for accessing linkserv
  linkservRequestURLHub: {
    graph: "",
    latestVersion: "",
    versionCountYearly: "",
    versionCountMonthly: "",
    versionCountDaily: "",
    versions: "",
  },

  // Progress Indicator
  progressIndicatorVisibility: false,
  progressIndicatorMessage: "",

  requestNodeIDList: [], // request node ID List that will be set to get their node data
  responseNodeDataList: [], // response node data that will be set after setting "requestNodeID"

  // State indicator that a valid graph is loadeds
  loadedGraphFlag: false,

  // State indicator that a node is selected
  selectedNodeFlag: false,

  // Finders
  finders: {
    pathFinder: {
      source: null, // Source Node
      target: null, // Target Node
      result: null, // Holds the result of finding path (make a survey if it's still needed)
      // message: '',            // Message to displayed in the alert
      messageType: "info", // valid values: 'success', 'info', 'warning'
    },
  },

  // Setting for changing
  settings: {
    backgroundColor: { r: 223, g: 223, b: 223, a: 1.0 }, // Background color

    nodeSizeCalcEnum: _nodeSizeCalcEnum, // Reference for "_nodeSizeCalcEnum"
    nodeShapeCategoryEnum: _nodeShapeCategoryEnum, // Reference for "_nodeShapeCategoryEnum"
    nodeShapeList: _nodeShapeList, // Reference for "_nodeShapeList"
    nodeLabelFormatEnum: _nodeLabelFormatEnum, // Reference for "_nodeLabelFormatEnum"
    edgeColoringMethodEnum: _edgeColoringMethodEnum, // Reference for "_edgeColoringMethodEnum"
    nodeColoringMethodEnum: _nodeColoringMethodEnum, // Reference for "_nodeColoringMethodEnum"

    // Help to change a setting
    coloringAction: {
      color: { r: 255, g: 255, b: 255, a: 1.0 }, // color object either rgba or hsla according to type
      methodIndex: 0, // index refering to "nodeColoringMethodEnum"
    },

    uniformNodeColor: { r: 255, g: 255, b: 255, a: 1.0 }, // uniform node color initially set initially and set by user
    domainColor: { r: 255, g: 0, b: 0, a: 1.0 }, // Domain color set by user

    edgeColor: { h: 232.71, s: 0.08, l: 0.39, a: 1 }, // Edge color (either for uniform method or domain name and depth)
    useDifferentStyleForExtEdges: false, // Apply different style (will be white color and dashed lines for external edge(s))

    nodeSizeCalcCurrentIndex: 0, // Current Index of node-size calculation
    nodeShapeCategoryCurrentIndex: 0, // Current Index of node-shape category
    nodeShapeCurrentIndex: 0, // Current index of node shape
    nodeLabelFormatCurrentIndex: 0,
    edgeColoringMethodCurrentIndex: 0, // Edge Coloring Method current index

    uniformNodeSize: 30,
    inlinkNodeSizeRange: [20, 40], // Node Size Range for mapping inlink-count based of nodes
    outlinkNodeSizeRange: [20, 40], // Node Size Range for mapping outlink-count based of nodes

    screenshotResolution: {
      value: 5, // Screenshot resolution value
      format: "png", // Screenshot file format
      background: 0, // Screenshot Background Default
    },
  },

  // Snapshot List Cache
  snapshotListCache: [],

  // MessageBox component Show condition
  showMessageBox: false,

  // Animation Speed
  animationSpeed: 500,

  //Selected Snapshot list
  selectedSnapshotList: [],
});

// Getters
export const getters = {
  getLoadedGraphFlag(state) {
    return state.loadedGraphFlag;
  },
  getSelectedNodeFlag(state) {
    return state.selectedNodeFlag;
  },
  getLinkservRequestURLHub(state) {
    return state.linkservRequestURLHub;
  },
  getProgressIndicatorVisibility(state) {
    return state.progressIndicatorVisibility;
  },
  getRequestNodeIDList(state) {
    return state.requestNodeIDList;
  },
  getResponseNodeDataList(state) {
    return state.responseNodeDataList;
  },
  getProgressIndicatorMessage(state) {
    return state.progressIndicatorMessage;
  },
  getBackgroundColor(state) {
    return state.settings.backgroundColor;
  },
  getNodeSizeCalcEnum(state) {
    return state.settings.nodeSizeCalcEnum;
  },
  getNodeShapeCategoryEnum(state) {
    return state.settings.nodeShapeCategoryEnum;
  },
  getNodeShapeList(state) {
    return state.settings.nodeShapeList;
  },
  getEdgeColoringMethodEnum(state) {
    return state.settings.edgeColoringMethodEnum;
  },
  getNodeColoringMethodEnum(state) {
    return state.settings.nodeColoringMethodEnum;
  },
  getNodeLabelFormatEnum(state) {
    return state.settings.nodeLabelFormatEnum;
  },
  getColoringAction(state) {
    return state.settings.coloringAction;
  },
  getNodeSizeCalcCurrentIndex(state) {
    return state.settings.nodeSizeCalcCurrentIndex;
  },
  getNodeShapeCategoryCurrentIndex(state) {
    return state.settings.nodeShapeCategoryCurrentIndex;
  },
  getNodeShapeCurrentIndex(state) {
    return state.settings.nodeShapeCurrentIndex;
  },
  getEdgeColoringMethodCurrentIndex(state) {
    return state.settings.edgeColoringMethodCurrentIndex;
  },
  getNodeLabelFormatCurrentIndex(state) {
    return state.settings.nodeLabelFormatCurrentIndex;
  },
  getUniformNodeColor(state) {
    return state.settings.uniformNodeColor;
  },
  getDomainColor(state) {
    return state.settings.domainColor;
  },
  getEdgeColor(state) {
    return state.settings.edgeColor;
  },
  getUseDifferentStyleForExtEdges(state) {
    return state.settings.useDifferentStyleForExtEdges;
  },
  getUniformNodeSize(state) {
    return state.settings.uniformNodeSize;
  },
  getInlinkNodeSizeRange(state) {
    return state.settings.inlinkNodeSizeRange;
  },
  getOutlinkNodeSizeRange(state) {
    return state.settings.outlinkNodeSizeRange;
  },
  getPathFinderSource(state) {
    return state.finders.pathFinder.source;
  },
  getPathFinderTarget(state) {
    return state.finders.pathFinder.target;
  },
  getPathFinderResult(state) {
    return state.finders.pathFinder.result;
  },
  getPathFinderMessageType(state) {
    return state.finders.pathFinder.messageType;
  },
  getSnapshotListCache(state) {
    return state.snapshotListCache;
  },
  getScreenshotResolution(state) {
    return state.settings.screenshotResolution;
  },
  getShowMessageBox(state) {
    return state.showMessageBox;
  },
  getAnimationSpeed(state) {
    return state.animationSpeed;
  },
  getSelectedSnapshotList(state) {
    return state.selectedSnapshotList;
  },
};

// Mutations for state
export const mutations = {
  setLoadedGraphFlag(state, loadedGraphFlag) {
    state.loadedGraphFlag = loadedGraphFlag;
  },
  setSelectedNodeFlag(state, selectedNodeFlag) {
    state.selectedNodeFlag = selectedNodeFlag;
  },
  setLinkservRequestURLHub(state, linkservHostname) {
    state.linkservRequestURLHub["graph"] =
      linkservHostname +
      "?" +
      "operation=getGraph&identifier={0}&timestamp={1}&depth={2}&timeElasticity={3}";
    state.linkservRequestURLHub["latestVersion"] =
      linkservHostname + "?" + "operation=getLatestVersion&identifier={0}";
    state.linkservRequestURLHub["versionCountsYearly"] =
      linkservHostname +
      "?" +
      "operation=getVersionCountsYearly&identifier={0}";
    state.linkservRequestURLHub["versionCountsMonthly"] =
      linkservHostname +
      "?" +
      "operation=getVersionCountsMonthly&identifier={0}&year={1}";
    state.linkservRequestURLHub["versionCountsDaily"] =
      linkservHostname +
      "?" +
      "operation=getVersionCountsDaily&identifier={0}&year={1}&month={2}";
    state.linkservRequestURLHub["versions"] =
      linkservHostname +
      "?" +
      "operation=getVersions&identifier={0}&dateTime={1}";
  },
  setProgressIndicatorVisibility(state, progressIndicatorVisibility) {
    state.progressIndicatorVisibility = progressIndicatorVisibility;
    // When setting "progressIndicatorVisibility" to false, set the message to be empty
    if (!progressIndicatorVisibility) {
      state.progressIndicatorMessage = "";
    }
  },
  setRequestNodeIDList(state, requestNodeIDList) {
    state.requestNodeIDList = requestNodeIDList;
  },
  setResponseNodeDataList(state, responseNodeDataList) {
    state.responseNodeDataList = responseNodeDataList;
  },
  setProgressIndicatorMessage(state, progressIndicatorMessage) {
    state.progressIndicatorMessage = progressIndicatorMessage;
  },
  setBackgroundColor(state, color) {
    state.settings.backgroundColor = color;
  },
  setNodeSizeCalcCurrentIndex(state, index) {
    state.settings.nodeSizeCalcCurrentIndex = index;
  },
  setNodeShapeCategoryCurrentIndex(state, index) {
    state.settings.nodeShapeCategoryCurrentIndex = index;
  },
  setNodeShapeCurrentIndex(state, index) {
    state.settings.nodeShapeCurrentIndex = index;
  },
  setEdgeColoringMethodCurrentIndex(state, index) {
    state.settings.edgeColoringMethodCurrentIndex = index;
  },
  setNodeLabelFormatCurrentIndex(state, index) {
    state.settings.nodeLabelFormatCurrentIndex = index;
  },
  setNodeUniformColor(state, color) {
    state.settings.nodeUniformColor = color;
  },
  setUniformNodeColor(state, color) {
    state.settings.uniformNodeColor = color;
  },
  setDomainColor(state, color) {
    state.settings.domainColor = color;
  },
  setEdgeColor(state, color) {
    state.settings.edgeColor = color;
  },
  setUseDifferentStyleForExtEdges(state, useDifferentStyleForExtEdges) {
    state.settings.useDifferentStyleForExtEdges = useDifferentStyleForExtEdges;
  },
  setColoringAction(state, coloringAction) {
    state.settings.coloringAction = coloringAction;
  },
  setUniformNodeSize(state, uniformNodeSize) {
    state.settings.uniformNodeSize = uniformNodeSize;
  },
  setInlinkNodeSizeRange(state, inlinkNodeSizeRange) {
    state.settings.inlinkNodeSizeRange = inlinkNodeSizeRange;
  },
  setOutlinkNodeSizeRange(state, outlinkNodeSizeRange) {
    state.settings.outlinkNodeSizeRange = outlinkNodeSizeRange;
  },
  setPathFinderSource(state, source) {
    state.finders.pathFinder.source = source;
  },
  setPathFinderTarget(state, target) {
    state.finders.pathFinder.target = target;
  },
  setPathFinderResult(state, result) {
    state.finders.pathFinder.result = result;
  },
  setPathFinderMessageType(state, messageType) {
    state.finders.pathFinder.messageType = messageType;
  },
  setSnapshotListCache(state, SnapshotListCache) {
    state.snapshotListCache.push(SnapshotListCache);
  },
  setScreenshotResolution(state, screenshotResolution) {
    state.settings.screenshotResolution = screenshotResolution;
  },
  setShowMessageBox(state, ShowMessageBox) {
    state.showMessageBox = ShowMessageBox;
  },
  setAnimationSpeed(state, AnimationSpeed) {
    state.animationSpeed = AnimationSpeed;
  },
  setSelectedSnapshotList(state, SelectedSnapshotList) {
    state.selectedSnapshotList = SelectedSnapshotList;
  },
};

// Actions for changing state
export const actions = {
  setLoadedGraphFlag({ state, commit }, loadedGraphFlag) {
    commit("setLoadedGraphFlag", loadedGraphFlag);
  },
  setSelectedNodeFlag({ state, commit }, selectedNodeFlag) {
    commit("setSelectedNodeFlag", selectedNodeFlag);
  },
  setLinkservRequestURLHub({ state, commit }, linkservHostname) {
    commit("setLinkservRequestURLHub", linkservHostname);
  },
  setProgressIndicatorVisibility(
    { state, commit },
    progressIndicatorVisibility
  ) {
    commit("setProgressIndicatorVisibility", progressIndicatorVisibility);
  },
  setRequestNodeIDList({ state, commit }, requestNodeIDList) {
    commit("setRequestNodeIDList", requestNodeIDList);
  },
  setResponseNodeDataList({ state, commit }, responseNodeDataList) {
    commit("setResponseNodeDataList", responseNodeDataList);
  },
  setProgressIndicatorMessage({ state, commit }, progressIndicatorMessage) {
    commit("setProgressIndicatorMessage", progressIndicatorMessage);
  },
  setBackgroundColor({ state, commit }, color) {
    commit("setBackgroundColor", color);
  },
  setNodeSizeCalcCurrentIndex({ state, commit }, index) {
    commit("setNodeSizeCalcCurrentIndex", index);
  },
  setNodeShapeCategoryCurrentIndex({ state, commit }, index) {
    commit("setNodeShapeCategoryCurrentIndex", index);
  },
  setNodeShapeCurrentIndex({ state, commit }, index) {
    commit("setNodeShapeCurrentIndex", index);
  },
  setEdgeColoringMethodCurrentIndex({ state, commit }, index) {
    commit("setEdgeColoringMethodCurrentIndex", index);
  },
  setNodeLabelFormatCurrentIndex({ state, commit }, index) {
    commit("setNodeLabelFormatCurrentIndex", index);
  },
  setNodeUniformColor({ state, commit }, color) {
    commit("setNodeUniformColor", color);
  },
  setUniformNodeColor({ state, commit }, color) {
    commit("setUniformNodeColor", color);
  },
  setDomainColor({ state, commit }, color) {
    commit("setDomainColor", color);
  },
  setEdgeColor({ state, commit }, color) {
    commit("setEdgeColor", color);
  },
  setUseDifferentStyleForExtEdges(
    { state, commit },
    useDifferentStyleForExtEdges
  ) {
    commit("setUseDifferentStyleForExtEdges", useDifferentStyleForExtEdges);
  },
  setColoringAction({ state, commit }, coloringAction) {
    commit("setColoringAction", coloringAction);
  },
  setUniformNodeSize({ state, commit }, uniformNodeSize) {
    commit("setUniformNodeSize", uniformNodeSize);
  },
  setInlinkNodeSizeRange({ state, commit }, inlinkNodeSizeRange) {
    commit("setInlinkNodeSizeRange", inlinkNodeSizeRange);
  },
  setOutlinkNodeSizeRange({ state, commit }, outlinkNodeSizeRange) {
    commit("setOutlinkNodeSizeRange", outlinkNodeSizeRange);
  },
  setPathFinderSource({ state, commit }, source) {
    commit("setPathFinderSource", source);
  },
  setPathFinderTarget({ state, commit }, target) {
    commit("setPathFinderTarget", target);
  },
  setPathFinderResult({ state, commit }, result) {
    commit("setPathFinderResult", result);
  },
  setPathFinderMessageType({ state, commit }, messageType) {
    commit("setPathFinderMessageType", messageType);
  },
  setSnapshotListCache({ state, commit }, SnapshotListCache) {
    commit("setSnapshotListCache", SnapshotListCache);
  },
  setScreenshotResolution({ state, commit }, screenshotResolution) {
    commit("setScreenshotResolution", screenshotResolution);
  },
  setShowMessageBox({ state, commit }, ShowMessageBox) {
    commit("setShowMessageBox", ShowMessageBox);
  },
  setAnimationSpeed({ state, commit }, AnimationSpeed) {
    commit("setAnimationSpeed", AnimationSpeed);
  },
  setSelectedSnapshotList({ state, commit }, SelectedSnapshotList) {
    commit("setSelectedSnapshotList", SelectedSnapshotList);
  },
};
