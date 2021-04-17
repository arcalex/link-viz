<!-- Used for creating progress bar between loading different routes -->
<template>
  <v-dialog
    v-model="visible"
    persistent
    overlay-color="black"
    overlay-opacity=".5"
    width="10%"
    transition="fade-transition"
  >
    <div class="d-flex flex-column justify-center align-center loading-div rounded-lg">
      <!-- <v-card
      class="d-flex justify-center align-center rounded-circle"
      color="rgb(255,0,0,0.5)"
      dark
      flat
    > -->
      <!-- <atom-spinner :animation-duration="1000" :size="80" color="#FF962B" class="loader" /> -->
      <atom-spinner :animation-duration="1000" :size="80" color="#FF962B" />
      <div>
       <p class="message">{{ message }}</p>
       <!-- {{ message }} -->
      </div>
      <!-- </v-card> -->
    </div>
  </v-dialog>
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
 * Progress Indicator that is shown while an operation that takes somehow big time
 */
import { AtomSpinner } from "epic-spinners";
import { mapGetters } from "vuex";

export default {
  data: () => ({
    visible: false,
    message: "This may take few minutes. Please wait...",
  }),
  computed: {
    // Load linkserv request URL HUB
    ...mapGetters({
      getProgressIndicatorVisibility: "getProgressIndicatorVisibility",
      getProgressIndicatorMessage: "getProgressIndicatorMessage",
    }),
  },
  watch: {
    getProgressIndicatorVisibility: "setVisibility",
    getProgressIndicatorMessage: "setMessage",
  },
  components: {
    AtomSpinner,
  },
  methods: {
    setVisibility(value, oldValue) {
      this.visible = value;
    },
    setMessage(value, oldValue) {
      this.message = value;
    },
  },
};
</script>

<style scoped>
.loading-div {
  background-color: rgba(255, 255, 255, 1.0);
}

.message {
  text-align: center;
  color: black;
}
/* .div-progress-indicator {
  width: fit-content;
  height: fit-content;
  background-color: rgba(0, 0, 0, 0);
} */
</style>
