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
      @click:event="fetchWithCache"
    ></v-calendar>

    <!-- Snapshot List -->
    <!-- <v-menu
      absolute
      offset-y
      v-model="snapshotDialogShown"
      min-width="10%"
      max-height="20%"
      :position-x="mousePosX"
      :position-y="mousePosY"
      :close-on-content-click="false"
    > -->
    <v-dialog
      v-model="snapshotDialogShown"
      persistent
      max-width="15%"
      overlay-opacity="0.3"
      overlay-color="#222222"
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
    </v-dialog>
    <!-- </v-menu> -->
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
    targetURLInSSURT: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      snapshotDialogShown: false, // Flag for toggling snapshot dialog visibility
      // mousePosX: null, // Mouse x-position
      // mousePosY: null, // Mouse y-position
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
      setSnapshotListCache: "setSnapshotListCache",
    }),

    // Fill Calendar with events count per day
    async fillCalnedarWithEventsCount() {
      // console.log('fillCalnedarWithEventsCount, this.targetURLInSSURT: ' + this.targetURLInSSURT)
      await this.loadVersionCountDaily(this.year, this.month).then(
        (response) => {
          this.events.splice(0, this.events.length);
          for (const [key, value] of Object.entries(response.data)) {
            this.events.push({
              name: `${value} snapshot${value === 1 ? "" : "s"}`,
              start: new Date(`${this.year}-${this.month}-${key}`),
              allDay: true,
              color: "teal",
            });
          }
          // Progress Bar
          this.setProgressIndicatorVisibility(false);
        }
      );
      // .then(() => {
      //   // Progress Bar
      //   this.setProgressIndicatorVisibility(false);
      //   // Progress Bar
      //   //  this.$nuxt.$loading.finish()
      // });
    },

    // ***** FETCH WITH Cache *****
    fetchWithCache({ nativeEvent, event }) {
      // Get (Year Month Day) of the click event and concatenate them to store it as id for snapshot
      let yearMonthDay = event.start.getFullYear().toString();
      yearMonthDay = yearMonthDay.concat(
        event.start.getMonth() + 1,
        event.start.getDate()
      );

      let cached = [];

      // Get Cached snapshots
      this.getSnapshotListCache.forEach(function(snap) {
        if (snap.id === yearMonthDay) {
          cached.push(snap);
        }
      });

      // Check if there exists Cached data
      if (cached.length) {
        // Assign Catched data to snapshotList to show them
        console.log("CACHED");
        this.snapshotList = cached;
        this.snapshotDialogShown = true;
        console.log("END CACHED");
      } else {
        // There is no cached data, so go to fetch them
        console.log("FETCHING");
        nativeEvent.stopPropagation();
        this.selectedDay = event.start.getDate();
        this.showSnapshotList(yearMonthDay);
        console.log("END FETCHING");
      }
      console.log("END FETCHING WITH CACHE");
    },
    // ***** END *****

    // Show snapshots list for given year, month, and day
    async showSnapshotList(yearMonthDay) {
      // console.log(
      //   "CP#1: this.snapshotList.length : " + this.snapshotList.length
      // );
      // nativeEvent.stopPropagation();
      // // Save mouse position
      // this.mousePosX = nativeEvent.clientX;
      // this.mousePosY = nativeEvent.clientY;

      this.snapshotList = []; // This is correct

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
              id: yearMonthDay, // ID to retrieve data when cached
              value: oneSnapshot, // Actual value
              name: label,
            });
            this.setSnapshotListCache({
              id: yearMonthDay,
              value: oneSnapshot,
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
      // console.log('this.getLinkservRequestURLHub["versionCountsDaily"]:');
      // console.log(
      //   this.getLinkservRequestURLHub["versionCountsDaily"]
      //     .replace("{0}", this.targetURLInSSURT)
      //     .replace("{1}", year)
      //     .replace("{2}", month)
      // );

      return await this.$axios.get(
        this.getLinkservRequestURLHub["versionCountsDaily"]
          .replace("{0}", this.targetURLInSSURT)
          .replace("{1}", year)
          .replace("{2}", month)
      );
    },

    // Get all versions for a date 'YYYY-MM-DD'
    // year, month and day should all be string
    async loadVersions(year, month, day) {
      return await this.$axios.get(
        this.getLinkservRequestURLHub["versions"]
          .replace("{0}", this.targetURLInSSURT)
          .replace(
            "{1}",
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
      getSnapshotListCache: "getSnapshotListCache",
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
