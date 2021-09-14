<template>
  <!-- <div > -->
  <v-card class="main-div" rounded>
    <div
      v-if="arrowDirection === 'top'"
      class="popover-arrow popover-arrow-top dark"
      style="transform: rotate(-45deg)"
    ></div>
    <div
      v-if="arrowDirection === 'bottom'"
      class="popover-arrow popover-arrow-bottom dark"
      style="transform: rotate(-45deg)"
    ></div>
    <div
      v-if="arrowDirection === 'right'"
      class="popover-arrow popover-arrow-right dark"
      style="transform: rotate(-45deg)"
    ></div>
    <div
      v-if="arrowDirection === 'left'"
      class="popover-arrow popover-arrow-left dark"
      style="transform: rotate(-45deg)"
    ></div>
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle> {{ message }} </v-card-subtitle>
    <v-card-actions>
      <v-spacer> </v-spacer>
      <v-btn color="#CE7330" @click="hidePopupMessage()">
        <v-icon>mdi-close</v-icon>
        Close
      </v-btn>
      <v-spacer> </v-spacer>
    </v-card-actions>
  </v-card>
  <!-- </div> -->
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    // Position (value format: {x:value ,y: value }) which is top left
    position: {
      type: Object,
      default: null,
    },
    arrowDirection: {
      type: String,
      validator: (value) => {
        return ["top", "bottom", "right", "left"].includes(value.toLowerCase());
      },
    },
  },
  methods: {
    hidePopupMessage() {
      this.$emit("hidePopupMessage");
    },
  },
};
</script>

<style scoped>
.main-div {
  z-index: 4;
  position: absolute;
  left: 20%;
  top: 30%;
  width: 20%;
  height: fit-content;
  /* color: rgb(218, 110, 39); */
  background-color: #222222;
  border: 2px solid #cfcfcf !important;
}

.popover-arrow {
  width: 16px;
  height: 16px;
  position: absolute;
  background-color: #222222;
}

/* Top arrow */
.popover-arrow-top {
  top: -8px;
  left: 50%;
  border-top: 2px solid #cfcfcf !important;
  border-right: 2px solid #cfcfcf !important;
}

/* Bottom arrow */
.popover-arrow-bottom {
  bottom: -8px;
  left: 50%;
  border-bottom: 2px solid #cfcfcf !important;
  border-left: 2px solid #cfcfcf !important;
}

/* Right arrow */
.popover-arrow-right {
  right: -8px;
  top: 50%;
  border-bottom: 2px solid #cfcfcf !important;
  border-right: 2px solid #cfcfcf !important;
}

/* Left arrow */
.popover-arrow-left {
  left: -8px;
  top: 50%;
  border-top: 2px solid #cfcfcf !important;
  border-left: 2px solid #cfcfcf !important;
}
</style>