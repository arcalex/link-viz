<!-- Used for displaying info about any selected object -->
<template>
  <!-- Info Board for displaying info -->
  <div class="info-board" ref="infoBoard">
    <div class="d-flex flex-column" style="height: 100%">
      <!-- <v-scroll-y-transition mode="out-in"> -->
      <!-- <v-card color="orange"> -->
      <v-system-bar
        class="info-board-header"
        color="black"
        dark
        ref="infoBoardHeader"
        @mousedown="dragInfoBoard($event)"
      >
        <v-card-text>Information</v-card-text>
        <v-spacer></v-spacer>
        <v-btn icon dark x-small @click="hideInfoBoard()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-system-bar>

      <div class="d-flex" style="height: 100%; overflow:auto;">
        <v-tabs
          fixed-tabs
          vertical
          background-color="gray"
          dark
          v-model="mainTab"
          style="height: 100%;overflow:auto;"
        >
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab :disabled='graphPropertyList.length === 0'>Graph Info</v-tab>
          <v-tab :disabled='timelinePropertyList.length === 0'>Timeline Info</v-tab>
          <v-tab>Selected Node</v-tab>
          <v-tabs-items v-model="mainTab" style="height: 100%; overflow:auto;">
            <!-- Graph Info Tab -->
            <v-tab-item>
              <v-simple-table dense fixed-header>
                <template v-slot:default>
                  <tbody style="height:100%;">
                    <tr
                      v-for="graphProperty in graphPropertyList"
                      :key="graphProperty.name"
                    >
                      <td>{{ graphProperty.name }}</td>
                      <td class="url-in-table-cell">
                        {{ graphProperty.value }}
                      </td>
                    </tr>
                    <!-- Add actions -->
                    <tr>
                      <td>Actions</td>
                      <td>
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              v-on="on"
                              @click="visitNode(targetNode.id())"
                              icon
                              light
                            >
                              <v-icon color="orange">mdi-link</v-icon>
                            </v-btn>
                          </template>
                          <span>Visit At Archive</span>
                        </v-tooltip>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-tab-item>
            <!-- Timeline Tab -->
            <v-tab-item>
              <v-simple-table dense fixed-header>
                <template v-slot:default>
                  <tbody style="height:100%">
                    <tr
                      v-for="timelineProperty in timelinePropertyList"
                      :key="timelineProperty.name"
                    >
                      <td>{{ timelineProperty.name }}</td>
                      <td class="url-in-table-cell">
                        {{ timelineProperty.value }}
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-tab-item>
            <!-- Selected Node Info Tab-->
            <v-tab-item>
              <!-- create tab for displaying information about selected node -->
              <v-tabs fixed-tabs background-color="gray" dark v-model="nodeTab">
                <v-tabs-slider color="yellow"></v-tabs-slider>
                <v-tab>Properties</v-tab>
                <v-tab>Outlinks</v-tab>
                <v-tab>Inlinks</v-tab>
              </v-tabs>
              <v-tabs-items v-model="nodeTab">
                <!-- Node properties Tab -->
                <v-tab-item>
                  <v-simple-table
                    dense
                    fixed-header
                    class="info-board-table"
                    height="200px"
                    v-if="propertyList"
                  >
                    <template v-slot:default>
                      <tbody>
                        <tr
                          v-for="property in propertyList"
                          :key="property.name"
                        >
                          <td>{{ property.name }}</td>
                          <td>{{ property.value }}</td>
                        </tr>
                        <!-- Add actions -->
                        <tr>
                          <td>Actions</td>
                          <td>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  v-on="on"
                                  @click="visitNode(targetNode.id())"
                                  icon
                                  light
                                >
                                  <v-icon color="orange">mdi-link</v-icon>
                                </v-btn>
                              </template>
                              <span>Visit At Archive</span>
                            </v-tooltip>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-tab-item>
                <!-- Outlinks Tab -->
                <v-tab-item>
                  <v-simple-table
                    dense
                    fixed-header
                    class="info-board-table"
                    height="200px"
                    v-if="outlinkList.length > 0"
                  >
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">Serial</th>
                          <th class="text-left">Node URL</th>
                          <th class="text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(node, idx) in outlinkList" :key="idx">
                          <td>{{ idx + 1 }}</td>
                          <td class="url-in-table-cell">{{ node.url }}</td>
                          <td>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  v-on="on"
                                  @click="showInfo(node.url)"
                                  icon
                                  light
                                >
                                  <v-icon color="orange">mdi-text-box</v-icon>
                                </v-btn>
                              </template>
                              <span>Show Info</span>
                            </v-tooltip>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  v-on="on"
                                  @click="visitNode(node.id)"
                                  icon
                                  light
                                >
                                  <v-icon color="orange">mdi-link</v-icon>
                                </v-btn>
                              </template>
                              <span>Visit At Archive</span>
                            </v-tooltip>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-tab-item>
                <!-- Inlinks Tab -->
                <v-tab-item>
                  <v-simple-table
                    dense
                    fixed-header
                    class="info-board-table"
                    height="200px"
                    v-if="inlinkList.length > 0"
                  >
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">Serial</th>
                          <th class="text-left">Node URL</th>
                          <th class="text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(node, idx) in inlinkList" :key="idx">
                          <td>{{ idx + 1 }}</td>
                          <td class="url-in-table-cell">{{ node.url }}</td>
                          <td>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  v-on="on"
                                  @click="showInfo(node.url)"
                                  icon
                                  light
                                >
                                  <v-icon color="orange">mdi-text-box</v-icon>
                                </v-btn>
                              </template>
                              <span>Show Info</span>
                            </v-tooltip>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-btn
                                  v-on="on"
                                  @click="visitNode(node.id)"
                                  icon
                                  light
                                >
                                  <v-icon color="orange">mdi-link</v-icon>
                                </v-btn>
                              </template>
                              <span>Visit At Archive</span>
                            </v-tooltip>
                          </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                </v-tab-item>
              </v-tabs-items>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </div>
    </div>
  </div>
</template>

<script>
// import { linkviz_utilities } from "@/js/utilities.js";
import { mapActions, mapGetters } from "vuex";

export default {
  data: () => ({
    nodeTab: null,
    mainTab: null,
    previousMousePos: {
      x: 0,
      y: 0,
    },
    currentMousePos: {
      x: 0,
      y: 0,
    },
    // Another implementation for computed properties
    propertyList: null,
    outlinkList: [],
    inlinkList: [],
    // emptyTargetNode: true, // Flag for speeding up
  }),
  props: {
    targetNode: {
      type: Object,
      default: null,
    },
    // Info about the graph for displaying to user
    graphPropertyList: {
      type: Array,
      default: null,
    },
    timelinePropertyList: {
      type: Array,
      default: null,
    },
  },
  computed: {
    ...mapGetters({
      getResponseNodeDataList: "getResponseNodeDataList",
    }),
  },
  watch: {
    // watch "targetNode" and update the table
    targetNode: {
      immediate: true,
      handler(val, oldVal) {
        // Empty all data holders
        this.propertyList = null;
        this.outlinkList = [];
        this.inlinkList = [];
        let nodeDataList = [];
        if (!val) {
          // this.emptyTargetNode = true;
        } else {
          // this.emptyTargetNode = false;
          let outlinkCount = 0,
            inlinkCount = 0;

          // Prepare outlinks List
          val.outgoers("node").forEach((node) => {
            nodeDataList.push({ id: node.id(), type: "o" }); // type 'o' => outlink
            outlinkCount++;
          });

          val.incomers("node").forEach((node) => {
            nodeDataList.push({ id: node.id(), type: "i" });
            inlinkCount++;
          });
          this.setRequestNodeIDList(nodeDataList);

          // Prepare Properties List
          this.propertyList = [
            // 'Node ID': val.id(),
            {
              name: "URL",
              value: val.data("url"),
            },
            {
              name: "Outlink Count",
              value: outlinkCount, //this.outlinkList.length,
            },
            {
              name: "Inlink Count",
              value: inlinkCount, //this.inlinkList.length,
            },
          ];
        }
      },
    },

    getResponseNodeDataList: {
      immediate: true,
      handler(val, oldVal) {
        val.forEach((nodeData) => {
          switch (nodeData.type) {
            case "o":
              this.outlinkList.push({ id: nodeData.id, url: nodeData.url });
              break;

            case "i":
              this.inlinkList.push({ id: nodeData.id, url: nodeData.url });
              break;

            default:
              // Never reach this point at all!!
              break;
          }
        });
      },
    },
  },
  methods: {
    ...mapActions({
      setRequestNodeIDList: "setRequestNodeIDList",
    }),
    hideInfoBoard() {
      this.$emit("hideInfoBoard");
    },
    // Show Info of another node
    showInfo(nodeID) {
      this.$emit("showNodeInfo", nodeID);
    },
    // Open the archive web page of this node
    visitNode(nodeID) {
      this.$emit("visitNodeURL", nodeID);
    },
    // Start dragging the info board
    dragInfoBoard(event) {
      event = event || window.event;
      event.preventDefault();
      // this.isMouseDown = true;
      this.currentMousePos.x = event.clientX;
      this.currentMousePos.y = event.clientY;
      // console.log("isMouseDown : " + this.isMouseDown);
      document.addEventListener("mousemove", this.moveInfoBoard);
      document.addEventListener("mouseup", this.closeInfoBoardDragging);
    },

    // Move the info board while dragging the mouse
    moveInfoBoard(event) {
      event = event || window.event;
      event.preventDefault();
      this.previousMousePos.x = this.currentMousePos.x;
      this.previousMousePos.y = this.currentMousePos.y;

      this.currentMousePos.x = event.clientX;
      this.currentMousePos.y = event.clientY;

      this.$refs.infoBoard.style.left =
        this.$refs.infoBoard.offsetLeft +
        this.currentMousePos.x -
        this.previousMousePos.x +
        "px";

      this.$refs.infoBoard.style.top =
        this.$refs.infoBoard.offsetTop +
        this.currentMousePos.y -
        this.previousMousePos.y +
        "px";
    },

    // After mouse release, close dragging
    closeInfoBoardDragging() {
      document.removeEventListener("mousemove", this.moveInfoBoard);
      document.removeEventListener("mouseup", this.closeInfoBoardDragging);
    },
  },
//  mounted() {
//     this.$nextTick(() => {
//       console.log('infoBoard.mounted(), graphPropertyList.length:' + this.graphPropertyList.length)
//     })
//  }
};
</script>

<style scoped>
/* Info Board */
.info-board {
  position: absolute;
  /* overflow: auto; */
  width: 40%;
  height: 40%; /* 30% */
  bottom: 0%;
  right: 50%;
  z-index: 6;
}

/* Info Board Header*/
.info-board-header {
  cursor: move;
  z-index: 5;
}

/* Info Board Table */
.info-board-table {
  overflow: auto;
}

/* Cell that displays url */
.url-in-table-cell {
  word-break: break-word;
}
</style>