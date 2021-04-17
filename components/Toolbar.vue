<template>
  <div class="root-div d-flex justify-center flex-row">
    <div class="main-toolbar d-flex flex-row flex-wrap">
      <div
        v-for="(controlGroup, controlGroupName, index1) in toolbarItems"
        class="d-flex flex-nowrap"
      >
        <template
          v-for="(
            singleControl, singleControlName, index2
          ) in controlGroup.controlList"
        >
          <!-- Check if this is a button -->
          <v-tooltip top v-if="singleControl.type === 'button'">
            <template v-slot:activator="{ on }">
              <v-btn
                v-on="on"
                @click="singleControl.action"
                icon
                dark
                class="ma-1"
                :disabled="singleControl.disabled"
              >
                <v-badge
                  overlap
                  dot
                  color="primary"
                  v-if="singleControl.showBadge"
                >
                  <v-icon v-if="singleControl.icon">{{
                    singleControl.icon
                  }}</v-icon>
                  <v-icon v-else :class="singleControl.iconClass">{{
                    singleControl.icon
                  }}</v-icon>
                </v-badge>
                <v-icon v-else-if="singleControl.icon">{{
                  singleControl.icon
                }}</v-icon>
                <v-icon v-else :class="singleControl.iconClass">{{
                  singleControl.icon
                }}</v-icon>
              </v-btn>
            </template>
            <span>{{ singleControl.tooltip }}</span>
          </v-tooltip>
          <!-- Else check if this is a textField -->
          <v-text-field
            v-else-if="singleControl.type === 'textField'"
            clearable
            :placeholder="singleControl.placeholder"
            dense
            class="px-3"
            :disabled="singleControl.disabled"
            v-model="singleControl.text"
            @input="singleControl.onInputUpdate"
          ></v-text-field>
          <!-- Else check if this is a slider -->
          <v-slider
            v-else-if="singleControl.type === 'slider'"
            v-model="singleControl.value"
            min="1"
            max="5"
            :tick-labels="[1, 2, 3, 4, 5]"
            dense
            style="min-width: 250px"
            :label="singleControl.label"
            class="px-3"
            :disabled="singleControl.disabled"
          ></v-slider>
          <!-- Else check if this is a selection -->
          <v-select
            v-else-if="singleControl.type === 'selection'"
            :disabled="singleControl.disabled"
            :label="singleControl.label"
            :items="singleControl.itemList"
            item-text="name"
            item-value="name"
            v-model="singleControl.selectedItem"
          >
          </v-select>
          <!-- Else check if this is a switch -->
          <v-switch
            v-else-if="singleControl.type === 'switch'"
            :label="singleControl.label"
            v-model="singleControl.value"
            :disabled="singleControl.disabled"
          >
          </v-switch>
          <!-- Else check if this is a speed dial -->
          <v-speed-dial
            v-else-if="singleControl.type === 'speedDial'"
            class="ma-1"
            direction="bottom"
            transition="slide-y-transition"
          >
            <template v-slot:activator>
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn v-model="singleControl.expanded" v-on="on" icon>
                    <v-icon v-if="singleControl.expanded === true"
                      >mdi-close</v-icon
                    >
                    <v-icon v-else :class="singleControl.iconClass"></v-icon>
                  </v-btn>
                </template>
                <span>{{ singleControl.tooltip }}</span>
              </v-tooltip>
            </template>
            <template
              v-for="(button, buttonName, index3) in singleControl.buttonList"
            >
              <v-tooltip v-if="button.type === 'button'" :key="index3" top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" fab @click="button.action">
                    <v-icon v-if="button.icon">{{ button.icon }}</v-icon>
                    <v-icon v-else :class="button.iconClass"></v-icon>
                  </v-btn>
                </template>
                <span>{{ button.tooltip }}</span>
              </v-tooltip>
              <v-tooltip v-else-if="button.type === 'toggle'" :key="index3" top>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on" fab @click="button.action">
                    <v-badge
                      overlap
                      dot
                      :color="button.on ? 'red' : '#00000000'"
                    >
                      <v-icon v-if="button.icon">{{ button.icon }}</v-icon>
                      <v-icon v-else :class="button.iconClass"></v-icon>
                    </v-badge>
                  </v-btn>
                </template>
                <span>{{ button.tooltip }}</span>
              </v-tooltip>
            </template>
          </v-speed-dial>
          <v-divider
            vertical
            v-if="
              index2 === Object.keys(controlGroup.controlList).length - 1 &&
              index1 !== Object.keys(toolbarItems).length - 1
            "
          ></v-divider>
        </template>
        <!-- </template> -->
      </div>
      <!-- </v-toolbar> -->
    </div>
  </div>
  <!-- </v-scroll-y-transition> -->
  <!-- </v-card> -->
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
 * Toolbar
 */
export default {
  props: {
    toolbarItems: {
      type: Object,
      required: true,
      // Single Item in the array will have the following object definition
    },
  },
  data() {
    return {
      testClass: "base-custom-icon visor-icon",
      fab: false,
      toggler: [],
      // toolbarItems: {}
    };
  },
  methods: {
    toggleVisor(visorName) {
      console.log('Visor ' + visorName + ' is selected')
    },
    forceUpdate() {
      setTimeout(() => {
        this.$forceUpdate();
        // this.$mount();
        console.log("forceUpdate called successfully!!");
      }, 100);
    },
  },
};
</script>

<style scoped>
/* This is first level of the toolbar */
.root-div {
  position: absolute;
  width: 100%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 2;
}
.main-toolbar {
  /*background-color:rgba(0, 0, 0, 0.3);*/ /* main color*/
  /* position: absolute; */
  /* margin-left: auto;
  margin-right: auto; */
  /* left: auto;
  right: auto; */
  width: fit-content;
  /* left:20%; */
  /* right: 20%; */
  /* left: 50%; */
  /* transform: translate(-50%, 0);  */
  background-color: rgba(0, 0, 0, 0.6); /* test color*/
}
/* .visor-icon {
  background-image: url('~assets/images/1.svg');
} */
/* Base attributes for custom icon */
/* .base-custom-icon {
  background-size: contain;
  background-repeat: no-repeat;
} */
/* .train-icon { */
/* background-image: url(https://www.svgrepo.com/show/9344/train.svg); */
/* background-size: contain;
    background-repeat: no-repeat; */
/* &::before
    visibility hidden
    content "" */
/* } */
</style>