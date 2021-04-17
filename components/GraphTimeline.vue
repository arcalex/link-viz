<template>
  <!-- The outer div is needed for letting v-show work -->
  <div class="root-graph-timeline-div">
    <div class="inner-graph-timeline-div d-flex justify-center flex-row">
      <!-- <div class="inner-graph-timeline-div d-flex flex-row flex-wrap"> -->
      <!-- This is a test values -->
      <!-- <v-row class="d-flex justify-center flex-grow-0 flex-shrink-1" no-gutters> -->
      <!-- <v-slider min="1" max="5" dense> </v-slider> -->
      <!-- </v-row> -->
      <!-- <v-row class="d-flex justify-center" no-gutters> -->
      <!-- <v-btn-toggle group> -->
      <v-btn icon @click="doAnimationAction"
        ><v-icon>{{
          animationAction === "ready"
            ? "mdi-animation-play-outline"
            : "mdi-pause-circle-outlinez`"
        }}</v-icon></v-btn
      >
      <v-btn icon @click="toggleRepeat"
        ><v-icon>{{
          repeat === true ? "mdi-repeat" : "mdi-repeat-off"
        }}</v-icon></v-btn
      >
      <v-slider
        :min="sliderMinVal"
        :max="sliderMaxVal"
        :value="sliderCurVal"
        dense
        ticks="always"
        tick-size="4"
        class="timelineSlider"
      >
        <template v-slot:thumb-label="{ value }">
          {{ value }}
        </template>
      </v-slider>
      <!-- <v-btn icon @click="pauseAnimation"><v-icon>mdi-pause</v-icon></v-btn> -->
      <!-- </v-btn-toggle> -->
      <!-- </v-row> -->
      <!-- </div> -->
    </div>
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
 * Ui of graph timeline
 */
export default {
  data: () => ({
    // currentAnimationAction: "ready", // valid values: 'ready', 'playing'
    repeat: false, // Repeat Playing
  }),
  props: {
    animationAction: {
      type: String,
      required: true,
      default: "ready", // valid values: 'ready', 'playing'
    },
    // tick label List 
    // tickLabelList: {
    //   type: Array,
    //   required: true,
    // },
    // initState: {
    //   type: String,
    //   required: true,
    //   default: "ready", // valid values: 'ready', 'playing'
    // },
    // Minimum Value of the slider
    sliderMinVal: {
      type: Number,
      required: true,
    },
    // Maximum Value of the slider
    sliderMaxVal: {
      type: Number,
      required: true,
    },
    // Current Value of the slider
    sliderCurVal: {
      type: Number,
      required: true,
    },
  },
  methods: {
    // Play animation from current progress bar
    doAnimationAction() {
      // switch (this.state) {
      // switch (this.currentAnimationAction) {
      switch (this.animationAction) {
        // if 'ready', then put in 'playing' and play animation
        case "ready":
          // this.currentAnimationAction = "playing";
          this.$emit("doAnimationAction", "play");
          break;

        // if 'playing', then put in 'ready' and stop animation
        case "playing":
          // this.currentAnimationAction = "ready";
          this.$emit("doAnimationAction", "pause");
        default:
          break;
      }
    },
    toggleRepeat() {
      this.repeat = !this.repeat;
      this.$emit("toggleRepeat", this.repeat);
    },
    // Pause animation if playing
    // pauseAnimation() {},
  },
};
</script>
<style scoped>
.root-graph-timeline-div {
  position: absolute;
  z-index: 2;
  bottom: 0%; /* Stick to buttom */
  left: 40%;
  width: 20%;
}
.inner-graph-timeline-div {
  /*bottom: 0%;*/ /* Stick to buttom */
  /* left: 40%; */
  /* position: absolute; */
  /* width: 20%; */
  /* Important for alpha to be transparent */
  background-color: rgba(0, 0, 0, 0);
  /* z-index: 2; */
}

.timelineSlider {
  min-width: 150px;
}
</style>