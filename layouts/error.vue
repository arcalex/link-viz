<template>
  <v-app dark>
    <div
      class="flex-container d-flex flex-column justify-center align-center root-div"
    >
      <div class="oops-div">Oops!</div>
      <!-- <div v-if="error.statusCode === 404"> -->
      <!-- Display Error 404 (Not Found) Page -->
      <!-- <v-img :src="require('~/assets/images/error404.png')"></v-img> -->

      <!-- <img src="~/assets/images/error404.png" /> -->
      <!-- </div> -->
      <!-- <div v-else> -->
      <!-- Display Error 500 (Internal Error) Page -->
      <div :class="backgroundImageClass">
        <!-- <img
          v-if="this.error.statusCode === 404"
          src="~/assets/images/error404.png"
        />
        <img v-else src="~/assets/images/error500.png" /> -->
        <div
          :class="
            this.error.statusCode === 404 ? 'error-code-404' : 'error-code-500'
          "
        >
          {{ this.error.statusCode }}
        </div>
      </div>
      <div class="div-descriptive-error-message d-flex justify-center">
        {{
          this.error.statusCode === 404
            ? "Page Not Found"
            : "Internal Server Error"
        }}
      </div>
      <div class="d-flex justify-center">
        <nuxt-link to="/" class="home-link">Go Home</nuxt-link>
      </div>
      <!-- <img src="~/assets/images/error500.png" /> -->

      <!-- <v-img :src="require('~/assets/images/error500.png')"></v-img> -->
    </div>
    <!-- </div> -->
    <!-- <h1 v-if="error.statusCode === 404">
      {{ pageNotFound }}
    </h1>
    <h1 v-else>
      {{ otherError }}
    </h1>
    <NuxtLink to="/">
      Home page
    </NuxtLink> -->
  </v-app>
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
 * This is the error page
 */
export default {
  layout: "empty",
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: "404 Not Found",
      otherError: "An error occurred",
      backgroundImageClass: "",
    };
  },
  head() {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError;
    return {
      title,
    };
  },
  mounted() {
    this.$nextTick(() => {
      switch (this.error.statusCode) {
        case 404:
          this.backgroundImageClass =
            "error-code-404-root-div d-flex justify-center";
          break;

        default:
          this.backgroundImageClass =
            "error-code-500-root-div d-flex justify-center";
          break;
      }
    });
  },
};
</script>

<style scoped>
/* h1 {
  font-size: 20px;
} */

.root-div {
  background-color: white;
}

.oops-div {
  text-align: center;
  color: rgb(100, 100, 100);
  font-size: 40pt;
}

.error-code-500-root-div {
  /* position: absolute;  */
  background-color: rgba(255, 255, 255, 1);
  background-image: url('~assets/images/error500.png');
  background-size: contain;
  overflow: hidden;
}

.error-code-404-root-div {
  /* position: absolute;  */
  background-color: rgba(255, 255, 255, 1);
  background-image: url('~assets/images/error404.png');
  background-size: contain;
  overflow: hidden;
}

.error-code-500 {
  font-size: 60pt;
  position: absolute;
  right: 45%;
  top: 28%;
  color: rgb(50, 50, 50);
}

.error-code-404 {
  font-size: 60pt;
  position: absolute;
  color: rgb(50, 50, 50);
  right: 45%;
  top: 35%;
}

.div-descriptive-error-message {
  color: rgb(199, 62, 48);
}

.home-link {
  border-radius: 25pt;
  padding: 12px;
  background-color: yellow;
}
</style>
