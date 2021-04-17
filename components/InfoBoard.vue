<!-- Used for displaying info about any selected object -->
<template>
  <!-- Info Board for displaying info -->
  <div class="info-board" ref="infoBoard">
    <v-scroll-y-transition mode="out-in">
      <v-card color="orange">
        <v-system-bar
          class="info-board-header"
          color="black"
          dark
          ref="infoBoardHeader"
          @mousedown="dragInfoBoard($event)"
        >
          <v-card-text>Node Information</v-card-text>
          <v-spacer></v-spacer>
          <v-btn icon dark x-small @click="hideInfoBoard()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-system-bar>
        <v-tabs v-model="tab" fixed-tabs background-color="gray" dark>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab>Properties</v-tab>
          <v-tab>Outlinks</v-tab>
          <v-tab>Inlinks</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <!-- Properties tab content -->
          <v-tab-item>
            <v-card flat>
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
                      v-for="(value, name, index) in propertyList"
                      :key="index"
                    >
                      <td>{{ name }}</td>
                      <td>{{ value }}</td>
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
              <v-card-text v-else-if="emptyTargetNode === false"
                >No properties for this node.</v-card-text
              >
              <v-card-text v-else>No node selected.</v-card-text>
            </v-card>
          </v-tab-item>
          <!-- -->
          <!-- -->
          <!-- -->
          <v-tab-item
            v-for="(linkObj, index) in [
              { type: 'out', linkList: outlinkList },
              { type: 'in', linkList: inlinkList },
            ]"
            :key="index"
          >
            <v-card flat>
              <v-simple-table
                dense
                fixed-header
                class="info-board-table"
                height="200px"
                v-if="linkObj.linkList.length > 0"
              >
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Serial</th>
                      <th class="text-left">Node ID</th>
                      <th class="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(linkID, idx) in linkObj.linkList" :key="idx">
                      <td>{{ idx + 1 }}</td>
                      <td>{{ linkID }}</td>
                      <td>
                        <v-tooltip top>
                          <template v-slot:activator="{ on }">
                            <v-btn
                              v-on="on"
                              @click="showInfo(linkID)"
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
                              @click="visitNode(linkID)"
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
              <v-card-text v-else-if="emptyTargetNode === false"
                >No {{ linkObj.type }}link(s)</v-card-text
              >
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </v-scroll-y-transition>
  </div>
</template>


<script>
// import { linkviz_utilities } from "@/js/utilities.js";

export default {
  data: () => ({
    tab: null,
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
    emptyTargetNode: true, // Flag for speeding up
  }),
  props: {
    targetNode: {
      type: Object ,
      default: null
    },
  },
  computed: {
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
        if (!val) {
          this.emptyTargetNode = true;
        } else {
          this.emptyTargetNode = false;

          // Prepare outlinks List
          val.outgoers("node").forEach((node) => {
            this.outlinkList.push(node.id());
          });

          val.incomers("node").forEach((node) => {
            this.inlinkList.push(node.id());
          });

          // Prepare Properties List
          this.propertyList = {
            "Node ID": val.id(),
            "Outlink(s) Count": this.outlinkList.length,
            "Inlink(s) Count": this.inlinkList.length,
          };
        }
      },
    },
  },
  methods: {
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
};
</script>

<style scoped>
/* Info Board */
.info-board {
  position: absolute;
  /* overflow: auto; */
  width: 20%;
  height: fit-content; /* 30% */
  bottom: 0%;
  right: 50%;
  z-index: 2;
}

/* Info Board Header*/
.info-board-header {
  cursor: move;
}

/* Info Board Table */
.info-board-table {
  overflow: auto;
}
</style>