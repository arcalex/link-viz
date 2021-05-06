<template>
  <v-card>
    <v-system-bar dark>
      <v-spacer></v-spacer>
      <v-btn icon dark x-small @click="closeCalendar">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-system-bar>
    <v-toolbar color="#333" dark dense>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-calendar
      :start="`${year}-${month}-01`"
      :event-color="
        (event) => {
          return event.color;
        }
      "
      :events="events"
      type="month"
      dark
      ref="calendar"
      @click:event="showSnapshotList"
    ></v-calendar>

    <v-menu
      absolute
      offset-y
      v-model="snapshotDialogShown"
      min-width="10%"
      ref="calendar"
      max-height="20%"
      :position-x="mousePosX"
      :position-y="mousePosY"
      :close-on-content-click="false"
    >
      <v-card color="teal" raised outlined>
        <v-system-bar color="#333">
          <v-spacer></v-spacer>
          <v-btn icon dark x-small @click="closeSnapshot">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-system-bar>

        <v-toolbar color="#555" dark>
          <v-toolbar-title>Please select a snapshot</v-toolbar-title>
        </v-toolbar>
        <v-list dense>
          <!-- <v-list-item
            v-for="(snapshot, i) in snapshotList"
            :key="i"
            @click="loadGraph(snapshot.longTimestamped)"
          >           -->
          <v-list-item
            v-for="(snapshot, i) in snapshotList"
            :key="i"
            @click="loadGraph(snapshot.value)"
          >
            <v-list-item-content>
              <!-- <v-list-item-title
                v-text="snapshot.shortTimestamped"
              ></v-list-item-title> -->
              <v-list-item-title v-text="snapshot.name"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-card>
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
 * Calendar Component for viewing snapshots in a month view
 */
import { mapActions, mapGetters } from "vuex";

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      snapshotDialogShown: false, // Flag for toggling snapshot dialog visibility
      mousePosX: null, // Mouse x-position
      mousePosY: null, // Mouse y-position
      snapshotList: [], // Snapshot List
      selectedDay: null, // Selected day for a list of snapshots
      // Events showing snapshot count
      events: [
        // {
        //   name: "12 snapshots",
        //   start: new Date(`${this.year}-${this.month}-01`),
        //   allDay: true,
        //   color: "indigo",
        // },
        // {
        //   name: "3 snapshots",
        //   start: new Date(`${this.year}-${this.month}-03`),
        //   allDay: true,
        //   color: "green",
        // },
        // {
        //   name: "67 snapshots",
        //   start: new Date(`${this.year}-${this.month}-12`),
        //   allDay: true,
        //   color: "teal",
        // },
        // {
        //   name: "100 snapshots",
        //   start: new Date(`${this.year}-${this.month}-20`),
        //   allDay: true,
        //   color: "orange",
        // },
        // {
        //   name: "499 snapshots",
        //   start: new Date(`${this.year}-${this.month}-27`),
        //   allDay: true,
        //   color: "yellow",
        // },
      ],
    };
  },
  //   data() {
  //     return {
  //       year: null,
  //       month: null,
  //     };
  //   },
  //   mounted() {},
  methods: {
    // Actions of veux
    ...mapActions({
      setProgressIndicatorVisibility: "setProgressIndicatorVisibility",
    }),

    // Fill Calendar with events count per day
    async fillCalnedarWithEventsCount() {
      await this.loadVersionCountDaily(this.year, this.month)
        .then((response) => {
          this.events.splice(0, this.events.length);
          for (const [key, value] of Object.entries(response.data)) {
            this.events.push({
              name: `${value} snapshot${value === 1 ? "" : "s"}`,
              start: new Date(`${this.year}-${this.month}-${key}`),
              allDay: true,
              color: "teal",
            });
          }
        })
        .then(() => {
          // Progress Bar
          this.setProgressIndicatorVisibility(false);
          // Progress Bar
          //  this.$nuxt.$loading.finish()
        });
    },

    // Show snapshots list for given year, month, and day
    async showSnapshotList({ nativeEvent, event }) {
      // console.log(
      //   "CP#1: this.snapshotList.length : " + this.snapshotList.length
      // );
      nativeEvent.stopPropagation();
      // Save mouse position
      this.mousePosX = nativeEvent.clientX;
      this.mousePosY = nativeEvent.clientY;

      this.snapshotList.splice(0, this.snapshotList); // This line cause an error!!I don't know why????
      this.snapshotList = []; // This is correct
      // console.log(
      //   "CP#2: this.snapshotList.length : " + this.snapshotList.length
      // );
      // console.log("nativeEvent : ");
      // console.log(nativeEvent);
      // console.log("event : ");
      // console.log(event);
      this.selectedDay = event.start.getDate();
      // Progress Bar
      this.setProgressIndicatorVisibility(true);
      // Progress Bar
      await this.loadVersions(this.year, this.month, this.selectedDay)
        .then((response) => {
          // let snapshots = response.data.split(","); // Get all snapshot
          // let snapshots = response.data.toString().split(","); // Get all snapshot
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

            this.snapshotList.push({
              // shortTimestamped: oneSnapshot.substring(
              //   oneSnapshot.indexOf("T") + 1,
              //   oneSnapshot.indexOf("Z")
              // ),
              // longTimestamped: oneSnapshot,
              value: oneSnapshot, // Actual value
              name: label,
            });
            // console.log("snapshot : " + oneSnapshot);
          });
        })
        .then(() => {
          // Progress Bar
          this.setProgressIndicatorVisibility(false);
          // Progress Bar
        });
      this.snapshotDialogShown = true;
    },

    // Get stored version count for a given url with a given year and a given month per day
    async loadVersionCountDaily(year, month) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versionCountDaily"]
          .replace('{0}', this.targetURLInSSURT)
          .replace('{1}', year)
          .replace('{2}', month)
      );
    },

    // Get all versions for a date 'YYYY-MM-DD'
    // year, month and day should all be string
    async loadVersions(year, month, day) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versions"]
        .replace('{0}', this.targetURLInSSURT)
        .replace('{1}',
          // `${year}-${month}-${day <= 9 ? "0" : ""}${day}`
          `${year}${month}${day <= 9 ? "0" : ""}${day}`
        )
      );
    },

    // Close Calendar
    closeCalendar() {
      this.$emit("closeCalendar");
    },

    // Close Snapshot
    closeSnapshot() {
      this.snapshotDialogShown = false;
    },

    // Load snaphot graph
    loadGraph(snapshot) {
      // console.log(
      //   "Load graph for snapshot :" +
      //     snapshot +
      //     " and selected day :" +
      //     this.selectedDay
      // );
      this.closeSnapshot();
      this.closeCalendar();
      this.$emit("loadGraph", snapshot /*, this.selectedDay*/);
    },
  },
  computed: {
    // Load linkserv request URL HUB
    ...mapGetters({
      getLinkservRequestURLHub: "getLinkservRequestURLHub",
    }),
  },
  watch: {
    year: "fillCalnedarWithEventsCount",
    month: "fillCalnedarWithEventsCount",
  },
  mounted() {
    this.$nextTick(() => {
      // Will be executed when the DOM is ready
      // this.loadVersionCountDaily();
      // console.log("Start to fill calendar with events");
      // this.$nuxt.$loading.start()
      // Progress Bar
      this.setProgressIndicatorVisibility(true);
      // Progress Bar
      this.fillCalnedarWithEventsCount();
    });
  },
};
</script>

<style scoped>
/* .event-calendar {
  border: 10px solid black;
} */
</style>