<template>
  <div class="d-flex flex-row">
    <v-text-field-integer
      v-model="minData"
      v-bind:label="minLabel"
      v-bind:properties="{
        readonly: false,
        disabled: false,
        outlined: false,
        clearable: false,
        placeholder: minPlaceholder,
      }"
      v-bind:options="{
        inputMask: '###',
        outputMask: '###',
        empty: null,
        applyAfter: false,
      }"
      @change="onMinChange"
    />
    <div class="d-flex flex-column flex-grow-0 justify-center">
      <v-btn x-small icon @click="increaseMin" :disabled="minData === max">
        <v-icon x-small>mdi-triangle</v-icon>
      </v-btn>
      <v-btn x-small icon @click="decreaseMin" :disabled="minData === min">
        <v-icon x-small style="transform: rotate(-180deg)">mdi-triangle</v-icon>
      </v-btn>
    </div>
    <v-spacer> </v-spacer>
    <v-text-field-integer
      v-model="maxData"
      v-bind:label="maxLabel"
      v-bind:properties="{
        readonly: false,
        disabled: false,
        outlined: false,
        clearable: false,
        placeholder: maxPlaceholder,
      }"
      v-bind:options="{
        inputMask: '###',
        outputMask: '###',
        empty: null,
        applyAfter: false,
      }"
      @change="onMaxChange"
    />
    <div class="d-flex flex-column flex-grow-0 justify-center">
      <v-btn x-small icon @click="increaseMax" :disabled="maxData === max">
        <v-icon x-small>mdi-triangle</v-icon>
      </v-btn>
      <v-btn x-small icon @click="decreaseMax" :disabled="maxData === min">
        <v-icon x-small style="transform: rotate(-180deg)">mdi-triangle</v-icon>
      </v-btn>
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
export default {
  data: () => ({
    minData: 1,
    maxData: 1,
  }),
  props: {
    minPlaceholder: {
      type: String,
      default: "",
    },
    maxPlaceholder: {
      type: String,
      default: "",
    },
    minLabel: {
      type: String,
      default: "",
    },
    maxLabel: {
      type: String,
      default: "",
    },
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    initMin: {
      type: Number,
      default: 1,
    },
    initMax: {
      type: Number,
      default: 99,
    },
  },
  methods: {
    onMinChange() {
      if (this.minData !== null) {
        // let num = Number(this.minData); // Convert Value to Number
        this.minData = Number(this.minData); // Convert Value to Number
        // Check that it's within the range and clamp if necessary
        if (/*num*/ this.minData < this.min) {
          this.minData = this.min;
        } else if (/*num*/ this.minData > this.maxData) {
          if (/*num*/ this.minData > this.max) {
            this.maxData = this.minData = this.max;
          } else {
            this.maxData = this.minData;
          }
        }
      } else {
        // null is entered
        // So, set it to min
        this.minData = this.min;
      }
      // Emit the ready event
      // this.$emit("valueReady", { min: this.minData, max: this.maxData });
      this.$emit("valueReady", [this.minData, this.maxData]);
    },
    onMaxChange() {
      if (this.maxData !== null) {
        // let num = Number(this.maxData); // Convert Value to Number
        this.maxData = Number(this.maxData); // Convert Value to Number
        // Check that it's within the range and clamp if necessary
        if (/*num*/ this.maxData > this.max) {
          this.maxData = this.max;
        } else if (/*num*/ this.maxData < this.minData) {
          if (/*num*/ this.maxData < this.min) {
            this.minData = this.maxData = this.min;
          } else {
            this.minData = this.maxData;
          }
        }
      } else {
        // null is entered
        // So, set it to max
        this.maxData = this.max;
      }
      // Emit the ready event
      // this.$emit("valueReady", { min: this.minData, max: this.maxData });
      this.$emit("valueReady", [this.minData, this.maxData]);
    },
    // Increase maximum value
    increaseMax() {
      if (this.maxData < this.max) {
        this.maxData++;
        // this.$emit("valueReady", { min: this.minData, max: this.maxData });
        this.$emit("valueReady", [this.minData, this.maxData]);
      }
    },
    // Decrease maximum value
    decreaseMax() {
      if (this.maxData > this.min) {
        if (this.maxData === this.minData) {
          // Decrease current minimum
          this.minData--;
        }
        // Do the actual decrease
        this.maxData--;
        // this.$emit("valueReady", { min: this.minData, max: this.maxData });
        this.$emit("valueReady", [this.minData, this.maxData]);
      }
    },
    // Increase minimum value
    increaseMin() {
      if (this.minData < this.max) {
        // console.log('increaseMin, typeof this.minData : ' + typeof this.minData )
        // console.log('increaseMin, this.minData : ' + this.minData )
        // console.log('increaseMin, typeof this.max : ' + typeof this.max)
        // console.log('increaseMin, this.max : ' + this.max)
        if (this.minData === this.maxData) {
          // Increase current maximum
          this.maxData++;
        }
        this.minData++;
        // this.$emit("valueReady", { min: this.minData, max: this.maxData });
        this.$emit("valueReady", [this.minData, this.maxData]);
      }
    },
    // Decrease minimum value
    decreaseMin() {
      if (this.minData > this.min) {
        // console.log('decreaseMin, typeof this.minData : ' + typeof this.minData )
        // console.log('decreaseMin, this.minData : ' + this.minData )
        // console.log('decreaseMin, typeof this.max : ' + typeof this.max)
        // console.log('decreaseMin, this.max : ' + this.max)
        this.minData--;
        // this.$emit("valueReady", { min: this.minData, max: this.maxData });
        this.$emit("valueReady", [this.minData, this.maxData]);
      }
    },
  },
  mounted() {
    // this.$nextTick(() => {});
    this.minData = this.initMin;
    this.maxData = this.initMax;
  },
};
</script>

<style scoped>
</style>