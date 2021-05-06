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

const _nodeSizeTypeList = ["uniform", "inlink-count based", "outlink-count based"]
const _nodeShapeTypeList = ["FAV icon", "geometric"]
const _nodeShapeList = ["ellipse",
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
    "vee"]
const _nodeLabelFormatList = ["short", "long"]  // How to display node label
const _edgeColorTypeList = ["uniform", "domain name & depth"]
const _nodeColoringMethodList = ["all", "selected", "selected-node domain", "domain-driven"] // Types of coloring nodes

const _graphLocatorModeOptionList = ["Snapshot Selection in Tree", "View Snapshots in Calendar", "Timeline"]  // Graph locator Mode Options


// Set the following objects to be immutable
Object.freeze(_nodeSizeTypeList)
Object.freeze(_nodeShapeTypeList)
Object.freeze(_nodeShapeList)
Object.freeze(_nodeLabelFormatList)
Object.freeze(_edgeColorTypeList)
Object.freeze(_nodeColoringMethodList)
Object.freeze(_graphLocatorModeOptionList)


export const state = () => ({
    // Hold URLs for accessing linkserv
    linkservRequestURLHub: {
        graph: "",
        latestVersion: "",
        versionCountYearly: "",
        versionCountMonthly: "",
        versionCountDaily: "",
        versions: ""
    },

    // linkservHostname: undefined, // Store link-serv hostname

    // Progress Indicator
    progressIndicatorVisibility: false,
    progressIndicatorMessage: "",


    // Finders
    finders: {
        pathFinder: {
            source: null,       // Source Node
            target: null,       // Target Node
            result: null,       // Holds the result of finding path
        },
    },

    // Setting for changing 
    settings: {
        backgroundColor: { r: 128, g: 128, b: 128, a: 1.0 },  // Background color

        nodeSizeTypeList: _nodeSizeTypeList,        // Reference for "_nodeSizeTypeList"
        nodeShapeTypeList: _nodeShapeTypeList,      // Reference for "_nodeShapeTypeList"
        nodeShapeList: _nodeShapeList,              // Reference for "_nodeShapeList"
        nodeLabelFormatList: _nodeLabelFormatList,  // Reference for "_nodeLabelFormatList"
        edgeColorTypeList: _edgeColorTypeList,      // Reference for "_edgeColorTypeList"
        nodeColoringMethodList: _nodeColoringMethodList,    // Reference for "_nodeColoringMethodList"

        graphLocatorModeOptionList: _graphLocatorModeOptionList, // Reference for "_graphLocatorModeOptionList"

        // Help to change a setting
        coloringAction: {
            color: { r: 255, g: 255, b: 255, a: 1.0 },        // color object either rgba or hsla according to type
            methodIndex: 0,  // index refering to "nodeColoringMethodList"
        },

        uniformNodeColor: { r: 255, g: 255, b: 255, a: 1.0 },  // uniform node color initially set initially and set by user 
        domainColor: { r: 255, g: 0, b: 0, a: 1.0 },   // Domain color set by user

        edgeColor: { h: 232.71, s: 0.08, l: 0.39, a: 1 },   // Edge color (either for uniform method or domain name and depth)
        useDifferentStyleForExtEdges: false,        // Apply different style (will be white color and dashed lines for external edge(s))

        selectedNodeSizeTypeIndex: 0,               // Selected Node Size Type Index
        selectedNodeShapeTypeIndex: 0,              // Selected Node Shape Type Index
        selectedNodeShapeIndex: 0,                  // Selected Node Shape Index
        selectedNodeLabelFormatIndex: 0,            // Selected Node Label Format Index 
        selectedEdgeColorTypeIndex: 0,              // Selected Edge Color Type Index

        // TODO: Try to re-organize variables names
        latestUniformNodeSizeUsedValue: 30,
        latestFileSizeBasedNodeSizeValue: [20, 40],
        latestInlinkCountBasedNodeSizeValue: [20, 40],
        latestOutlinkCountBasedNodeSizeValue: [20, 40],

    }
})

// Getters
export const getters = {
    // Return 'linkservRequestURLHub'
    getLinkservRequestURLHub(state) {
        return state.linkservRequestURLHub
    },

    // Return the state of progress indicator visibility
    getProgressIndicatorVisibility(state) {
        return state.progressIndicatorVisibility
    },

    // Return the state of the progress indicator message
    getProgressIndicatorMessage(state) {
        return state.progressIndicatorMessage
    },

    // Get background color
    getBackgroundColor(state) {
        return state.settings.backgroundColor
    },

    // Return node size type list
    getNodeSizeTypeList(state) {
        return state.settings.nodeSizeTypeList
    },

    // Get node shape type list
    getNodeShapeTypeList(state) {
        return state.settings.nodeShapeTypeList
    },

    // Get node shape list
    getNodeShapeList(state) {
        return state.settings.nodeShapeList
    },

    // Get edge color type list
    getEdgeColorTypeList(state) {
        return state.settings.edgeColorTypeList
    },

    // Get node coloring method
    getNodeColoringMethodList(state) {
        return state.settings.nodeColoringMethodList
    },

    // get node label format list
    getNodeLabelFormatList(state) {
        return state.settings.nodeLabelFormatList
    },

    // Get graph locator mode option list
    getGraphLocatorModeOptionList(state) {
        return state.settings.graphLocatorModeOptionList
    },

    // Return "coloringAction"
    getColoringAction(state) {
        return state.settings.coloringAction
    },

    // Get selected node size type index
    getSelectedNodeSizeTypeIndex(state) {
        return state.settings.selectedNodeSizeTypeIndex
    },

    // Get selected node shape type index
    getSelectedNodeShapeTypeIndex(state) {
        return state.settings.selectedNodeShapeTypeIndex
    },

    // Get selected node shape index
    getSelectedNodeShapeIndex(state) {
        return state.settings.selectedNodeShapeIndex
    },

    // Get selected edge color type index
    getSelectedEdgeColorTypeIndex(state) {
        return state.settings.selectedEdgeColorTypeIndex
    },

    // Get selected node label format index
    getSelectedNodeLabelFormatIndex(state) {
        return state.settings.selectedNodeLabelFormatIndex
    },

    // Get uniform node color
    getUniformNodeColor(state) {
        return state.settings.uniformNodeColor
    },

    // Get domain color
    getDomainColor(state) {
        return state.settings.domainColor
    },

    // Get edge color
    getEdgeColor(state) {
        return state.settings.edgeColor
    },

    // Get 'useDifferentStyleForExtEdges'
    getUseDifferentStyleForExtEdges(state) {
        return state.settings.useDifferentStyleForExtEdges
    },

    // TODO: Try to re-organize variables names
    getLatestUniformNodeSizeUsedValue(state) {
        return state.settings.latestUniformNodeSizeUsedValue
    },

    getLatestFileSizeBasedNodeSizeValue(state) {
        return state.settings.latestFileSizeBasedNodeSizeValue
    },

    getLatestInlinkCountBasedNodeSizeValue(state) {
        return state.settings.latestInlinkCountBasedNodeSizeValue
    },

    getLatestOutlinkCountBasedNodeSizeValue(state) {
        return state.settings.latestOutlinkCountBasedNodeSizeValue
    },

    getPathFinderSource(state) {
        return state.finders.pathFinder.source
    },

    getPathFinderTarget(state) {
        return state.finders.pathFinder.target
    },

    getPathFinderResult(state) {
        return state.finders.pathFinder.result
    }
}

// Mutations for state this.$config.linkservHostname
export const mutations = {
    // setLinkservRequestURLHub(state, { /*ssurtURL = undefined,*/ linkservHostname }) {
    setLinkservRequestURLHub(state, linkservHostname) {
        // // Initialize only if supplied
        // if (linkservHostname) {
        //     state.linkservHostname = linkservHostname
        // }
        // Initialize for getting the proper URL
        // if (ssurtURL) {
        // state.linkservRequestURLHub["graph"] = state.linkservHostname + '?' + 'operation=getGraph&identifier=' + ssurtURL + '&timestamp={0}&depth={1}'
        // state.linkservRequestURLHub["latestVersion"] = state.linkservHostname + '?' + 'operation=getLatestVersion&identifier=' + ssurtURL
        // state.linkservRequestURLHub["versionCountsYearly"] = state.linkservHostname + '?' + 'operation=getVersionCountsYearly&identifier=' + ssurtURL
        // state.linkservRequestURLHub["versionCountsMonthly"] = state.linkservHostname + '?' + 'operation=getVersionCountsMonthly&identifier=' + ssurtURL + '&year={0}'
        // state.linkservRequestURLHub["versionCountsDaily"] = state.linkservHostname + '?' + 'operation=getVersionCountsDaily&identifier=' + ssurtURL + '&year={0}&month={1}'
        // state.linkservRequestURLHub["versions"] = state.linkservHostname + '?' + 'operation=getVersions&identifier=' + ssurtURL + '&dateTime={0}'
        // }
        state.linkservRequestURLHub["graph"] = linkservHostname + '?' + 'operation=getGraph&identifier={0}&timestamp={1}&depth={2}'
        state.linkservRequestURLHub["latestVersion"] = linkservHostname + '?' + 'operation=getLatestVersion&identifier={0}'
        state.linkservRequestURLHub["versionCountsYearly"] = linkservHostname + '?' + 'operation=getVersionCountsYearly&identifier={0}'
        state.linkservRequestURLHub["versionCountsMonthly"] = linkservHostname + '?' + 'operation=getVersionCountsMonthly&identifier={0}&year={1}'
        state.linkservRequestURLHub["versionCountsDaily"] = linkservHostname + '?' + 'operation=getVersionCountsDaily&identifier={0}&year={1}&month={2}'
        state.linkservRequestURLHub["versions"] = linkservHostname + '?' + 'operation=getVersions&identifier={0}&dateTime={1}'
    },

    setProgressIndicatorVisibility(state, progressIndicatorVisibility) {
        state.progressIndicatorVisibility = progressIndicatorVisibility
        // When setting "progressIndicatorVisibility" to false, set the message to be empty
        if (!progressIndicatorVisibility) {
            state.progressIndicatorMessage = ""
        }
    },

    setProgressIndicatorMessage(state, progressIndicatorMessage) {
        state.progressIndicatorMessage = progressIndicatorMessage
    },

    // Set Background Color
    setBackgroundColor(state, color) {
        state.settings.backgroundColor = color
    },

    // Set selected node size type index
    setSelectedNodeSizeTypeIndex(state, index) {
        state.settings.selectedNodeSizeTypeIndex = index
    },

    // Set selected node shape type index
    setSelectedNodeShapeTypeIndex(state, index) {
        state.settings.selectedNodeShapeTypeIndex = index
    },

    // Set selected node shape index
    setSelectedNodeShapeIndex(state, index) {
        state.settings.selectedNodeShapeIndex = index
    },

    // Set selected edge color type index
    setSelectedEdgeColorTypeIndex(state, index) {
        state.settings.selectedEdgeColorTypeIndex = index
    },

    // Set selected node label format index
    setSelectedNodeLabelFormatIndex(state, index) {
        state.settings.selectedNodeLabelFormatIndex = index
    },

    // Set Node Uniform Color
    setNodeUniformColor(state, color) {
        state.settings.nodeUniformColor = color
    },

    // Set uniform node color
    setUniformNodeColor(state, color) {
        state.settings.uniformNodeColor = color
    },

    // Set domain color
    setDomainColor(state, color) {
        state.settings.domainColor = color
    },

    // Get edge color
    setEdgeColor(state, color) {
        state.settings.edgeColor = color
    },

    // Set 'useDifferentStyleForExtEdges'
    setUseDifferentStyleForExtEdges(state, useDifferentStyleForExtEdges) {
        state.settings.useDifferentStyleForExtEdges = useDifferentStyleForExtEdges
    },

    // Set "coloringAction"
    setColoringAction(state, coloringAction) {
        state.settings.coloringAction = coloringAction
    },

    // TODO: Try to re-organize variables names
    setLatestUniformNodeSizeUsedValue(state, latestUniformNodeSizeUsedValue) {
        state.settings.latestUniformNodeSizeUsedValue = latestUniformNodeSizeUsedValue
    },

    setLatestFileSizeBasedNodeSizeValue(state, latestFileSizeBasedNodeSizeValue) {
        state.settings.latestFileSizeBasedNodeSizeValue = latestFileSizeBasedNodeSizeValue
    },

    setLatestInlinkCountBasedNodeSizeValue(state, latestInlinkCountBasedNodeSizeValue) {
        state.settings.latestInlinkCountBasedNodeSizeValue = latestInlinkCountBasedNodeSizeValue
    },

    setLatestOutlinkCountBasedNodeSizeValue(state, latestOutlinkCountBasedNodeSizeValue) {
        state.settings.latestOutlinkCountBasedNodeSizeValue = latestOutlinkCountBasedNodeSizeValue
    },

    // Set source node for path finder
    setPathFinderSource(state, source) {
        state.finders.pathFinder.source = source
    },

    // Set target node for path finder
    setPathFinderTarget(state, target) {
        state.finders.pathFinder.target = target
    },

    // Set operation result of the path finder
    setPathFinderResult(state, result) {
        state.finders.pathFinder.result = result
    }
}

// Actions for changing state
export const actions = {
    setLinkservRequestURLHub({ state, commit }, linkservHostname) {
        commit('setLinkservRequestURLHub', linkservHostname);
    },

    setProgressIndicatorVisibility({ state, commit }, progressIndicatorVisibility) {
        commit('setProgressIndicatorVisibility', progressIndicatorVisibility)
    },

    setProgressIndicatorMessage({ state, commit }, progressIndicatorMessage) {
        commit('setProgressIndicatorMessage', progressIndicatorMessage)
    },

    // Set Background Color
    setBackgroundColor({ state, commit }, color) {
        commit('setBackgroundColor', color)
    },

    // Set selected node size type index
    setSelectedNodeSizeTypeIndex({ state, commit }, index) {
        commit('setSelectedNodeSizeTypeIndex', index)
    },

    // Set selected node shape type index
    setSelectedNodeShapeTypeIndex({ state, commit }, index) {
        commit('setSelectedNodeShapeTypeIndex', index)
    },

    // Set selected node shape index
    setSelectedNodeShapeIndex({ state, commit }, index) {
        commit('setSelectedNodeShapeIndex', index)
    },

    // Set selected edge color type index
    setSelectedEdgeColorTypeIndex({ state, commit }, index) {
        commit('setSelectedEdgeColorTypeIndex', index)
    },

    // Set selected node label format index
    setSelectedNodeLabelFormatIndex({ state, commit }, index) {
        commit('setSelectedNodeLabelFormatIndex', index)
    },

    // Set Node Uniform Color
    setNodeUniformColor({ state, commit }, color) {
        commit('setNodeUniformColor', color)
    },

    // Set uniform node color
    setUniformNodeColor({ state, commit }, color) {
        commit('setUniformNodeColor', color)
    },

    // Set domain color
    setDomainColor({ state, commit }, color) {
        commit('setDomainColor', color)
    },

    // Get edge color
    setEdgeColor({ state, commit }, color) {
        commit('setEdgeColor', color)
    },

    // Set 'useDifferentStyleForExtEdges'
    setUseDifferentStyleForExtEdges({ state, commit }, useDifferentStyleForExtEdges) {
        commit('setUseDifferentStyleForExtEdges', useDifferentStyleForExtEdges)
    },
    // Set "coloringAction"
    setColoringAction({ state, commit }, coloringAction) {
        commit('setColoringAction', coloringAction)
    },

    // TODO: Try to re-organize variables names
    setLatestUniformNodeSizeUsedValue({ state, commit }, latestUniformNodeSizeUsedValue) {
        commit('setLatestUniformNodeSizeUsedValue', latestUniformNodeSizeUsedValue)
    },

    setLatestFileSizeBasedNodeSizeValue({ state, commit }, latestFileSizeBasedNodeSizeValue) {
        commit('setLatestFileSizeBasedNodeSizeValue', latestFileSizeBasedNodeSizeValue)
    },

    setLatestInlinkCountBasedNodeSizeValue({ state, commit }, latestInlinkCountBasedNodeSizeValue) {
        commit('setLatestInlinkCountBasedNodeSizeValue', latestInlinkCountBasedNodeSizeValue)
    },

    setLatestOutlinkCountBasedNodeSizeValue({ state, commit }, latestOutlinkCountBasedNodeSizeValue) {
        commit('setLatestOutlinkCountBasedNodeSizeValue', latestOutlinkCountBasedNodeSizeValue)
    },

    // Set source node for path finder
    setPathFinderSource({ state, commit }, source) {
        commit('setPathFinderSource', source)
    },

    // Set target node for path finder
    setPathFinderTarget({ state, commit }, target) {
        commit('setPathFinderTarget', target)
    },

    // Set operation result of the path finder
    setPathFinderResult({ state, commit }, result) {
        commit('setPathFinderResult', result)
    }
}