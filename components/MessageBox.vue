<template>
  <div>
    <v-alert
      prominent
      :type="type"
      :class="position"
      class="default ma-0 py-0"
      :border="border"
    >
      <v-row align="center">
        <v-col class="grow">
          <h2 class="pb-3" v-if="title">{{ title }}</h2>
          <v-divider v-if="message && title"></v-divider>
          <p v-if="message" class="pt-3">{{ message }}</p>
        </v-col>
        <v-col class="shrink">
          <v-btn icon @click="close"><v-icon>mdi-close-circle</v-icon></v-btn>
        </v-col>
      </v-row>
    </v-alert>
  </div>
</template>

<script>
import { mapActions } from "vuex";
export default {
  props: {
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    border: {
      type: String,
      default: "left",
      // Options: "left", "right", "top", "bottom"
    },
    type: {
      type: String,
      default: "info",
      // Options: "success", "warning", "error", "default"
    },
    position: {
      type: String,
      default: "top-right",
      // Options: "top","bottom","center","top-left","top-right","bottom-left","bottom-right"
    },
  },
  methods: {
    ...mapActions({
      setShowMessageBox: "setShowMessageBox",
    }),
    close: function() {
      this.setShowMessageBox(false);
    },
  },
};
</script>

<style scoped>
.default {
  width: 30%;
  position: absolute;
  z-index: 9999;
}
.top {
  top: 0;
  left: 50%;
  transform: translatex(-50%);
}
.bottom {
  bottom: 0;
  left: 50%;
  transform: translatex(-50%);
}
.center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.top-left {
  top: 0;
  left: 0;
}
.top-right {
  top: 0;
  right: 0;
}
.bottom-left {
  bottom: 0;
  left: 0;
}
.bottom-right {
  bottom: 0;
  right: 0;
}
</style>
