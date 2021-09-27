<template>
  <div class="root-graph-timeline-div">
    <div class="inner-graph-timeline-div d-flex justify-center flex-row">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="doAnimationAction"
            ><v-icon>{{
              animationAction === "ready"
                ? "mdi-animation-play-outline"
                : "mdi-pause-circle-outline"
            }}</v-icon></v-btn
          >
        </template>
        <span>{{
          animationAction === "ready" ? "Play animation" : "Pause animation"
        }}</span>
      </v-tooltip>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" icon @click="toggleRepeat"
            ><v-icon>{{
              repeat === true ? "mdi-repeat" : "mdi-repeat-off"
            }}</v-icon></v-btn
          >
        </template>
        <span>{{ repeat === true ? "Repeat is on" : "Repeat is off" }}</span>
      </v-tooltip>
      <v-slider
        color="#CE7330"
        :min="sliderMinVal"
        :max="sliderMaxVal"
        :value="sliderCurVal"
        :readonly="animationAction === 'playing' ? true : false"
        dense
        ticks="always"
        tick-size="4"
        class="timelineSlider"
        @change="updateTimeline"
      >
        <template v-slot:thumb-label="{ value }">
          {{ value }}
        </template>
      </v-slider>
      <!-- Animation Speed -->
      <v-menu top offset-x>
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip top>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn icon v-bind="attrs" v-on="{ ...tooltip, ...menu }">
                <v-icon>mdi-speedometer</v-icon>
              </v-btn>
            </template>
            <span>Animation Speed</span>
          </v-tooltip>
        </template>
        <v-list flat>
          <v-list-item-group v-model="selectedSpeed" color="rgb(206, 115, 48)">
            <v-list-item
              v-for="(item, i) in speedOptions"
              :key="i"
              @click="updateAnimationSpeed(item)"
            >
              <v-list-item-content>
                <v-list-item-title v-text="item.title"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
      <!-- END -->
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
import { mapActions, mapGetters } from "vuex";

export default {
  data: () => ({
    // currentAnimationAction: "ready", // valid values: 'ready', 'playing'
    repeat: false, // Repeat Playing
    speedOptions: [
      { title: "0.5", speed: 500 * 2 },
      { title: "Normal", speed: 500 },
      { title: "1.5", speed: (500 * 2) / 3 },
      { title: "2", speed: 500 / 2 },
    ],
    selectedSpeed: 1,
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
    ...mapActions({
      setAnimationSpeed: "setAnimationSpeed",
    }),
    // Play animation from current progress bar
    doAnimationAction() {
      switch (this.animationAction) {
        // if 'ready', then put in 'playing' and play animation
        case "ready":
          this.$emit("doAnimationAction", "play");
          break;

        // if 'playing', then put in 'ready' and stop animation
        case "playing":
          this.$emit("doAnimationAction", "pause");
        default:
          break;
      }
    },
    toggleRepeat() {
      this.repeat = !this.repeat;
      console.log("toggleRepeat, this.repeat = " + this.repeat);
      this.$emit("toggleRepeat", this.repeat);
    },
    // Update timelime if user moves the slider
    updateTimeline(value) {
      this.$emit("updateCurVal", value);
    },

    //Update Animation Speed
    updateAnimationSpeed(i) {
      this.setAnimationSpeed(i.speed);
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
  background-color: #646464;
  /* z-index: 2; */
}

.timelineSlider {
  min-width: 150px;
}
.v-slider__tick-label {
  transform: rotate(-45deg) translate(-22px, -15px) !important;
}
</style>
