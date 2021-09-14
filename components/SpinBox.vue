<template>
  <div class="d-flex flex-row flex-grow-0">
    <v-text-field-integer
      v-model="fieldData"
      v-bind:label="label"
      v-bind:properties="{
        readonly: false,
        disabled: disabled,
        outlined: false,
        clearable: false,
        placeholder: placeholder,
      }"
      v-bind:options="{
        inputMask: '##',
        outputMask: '##',
        empty: null,
        applyAfter: false,
      }"
      @change="onChange"
    />
    <div class="d-flex flex-column flex-grow-0 justify-center">
      <v-btn x-small icon @click="increase" :disabled="fieldData === max || disabled">
        <v-icon x-small>mdi-triangle</v-icon>
      </v-btn>
      <v-btn x-small icon @click="decrease" :disabled="fieldData === min || disabled">
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
    fieldData: 1,
  }),
  // computed: {
  //   model: {
  //     get() {
  //       return this.value;
  //     },
  //     set(value) {
  //       this.$emit("input", value);
  //     },
  //   },
  // },
  props: {
    // value: {
    //   // type: Number,
    //   type: String,
    // },\
    disabled: {
      type: Boolean,
      default: false
    },
    initValue: {
      type: Number,
      default: 1,
    },
    placeholder: {
      type: String,
      default: "",
    },
    label: {
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
  },
  methods: {
    onChange() {
      if (this.fieldData !== null) {
        this.fieldData = Number(this.fieldData); // Convert Value to Number
        // Check that it's within the range and clamp if necessary
        if (this.fieldData < this.min) {
          this.fieldData = this.min;
        } else if (this.fieldData > this.max) {
          this.fieldData = this.max;
        }
      } else {
        // null is entered
        // So, set it to min
        this.fieldData = this.min;
      }
      // Emit the ready event
      this.$emit("valueReady", this.fieldData);
    },
    // Increase value if it's under limit
    increase() {
      if (this.fieldData < this.max) {
        this.fieldData++;
        // Emit the ready event
        this.$emit("valueReady", this.fieldData);
      }
    },
    // Decrease value if it's under limit
    decrease() {
      if (this.fieldData > this.min) {
        this.fieldData--;
        // Emit the ready event
        this.$emit("valueReady", this.fieldData);
      }
    },
  },
  mounted() {
    // this.$nextTick(() => {});
    this.fieldData = this.initValue;
  },
};
</script>

<style scoped>
/* #spin-box input[type="number"] {
  -moz-appearance: textfield !important;
}
#spin-box input::-webkit-inner-spin-button,
#spin-box input::-webkit-outer-spin-button { */
  /* -webkit-appearance: none !important;
  margin: 0 !important; */
  /* appearance: none;
    margin: 0; 
    -webkit-appearance: none;
    -moz-appearance: none;  */
/* } */
</style>