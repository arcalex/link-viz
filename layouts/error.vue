<template>
  <!-- <v-app style="background-color:white;overflow-y:auto;"> -->
    <div
      class="
        flex-container
        d-flex
        flex-column
        justify-center
        align-center
        root-div
      "
    >
      <div class="error-code">{{ errorCode }}</div>
      <div class="d-flex justify-center title-div">
        {{ title }}
      </div>
      <p class="description-p">
        {{ description }}
      </p>
      <div class="d-flex justify-center">
        <a href="/" class="home-link nuxt-link-active">Go Home</a>
      </div>
    </div>
  <!-- </v-app> -->
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
  layout: 'default',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      errorCode: "",
      title: "",
      description: "",
    };
  },
  head() {
    return "Error - LinkGate";
  },
  mounted() {
    this.$nextTick(() => {
      this.errorCode = `${this.error.statusCode}`;
      switch (this.error.statusCode) {
        case 404:
          this.title = "Page Not Found!";
          this.description =
            "We're sorry, but the page you were looking for doesn't exist.";
          break;

        case 500:
          // For now, let it be error 500
          this.title = "Internal Server Error!";
          this.description =
            "We regret the inconvenience and hope the issue will be resolved soon. Please feel free to contact us at linkgate@iipc.simplelists.com.";
          break;

        default:
          // General message for that error
          this.title = "Error!";
          this.description =
            "We regret the inconvenience and hope the issue will be resolved soon. Please feel free to contact us at linkgate@iipc.simplelists.com.";

        // Futuristic TODO: You can add multiple codes for handling
      }
    });
  },
};
</script>

<style scoped>
.root-div {
  display: inline-block !important;
  width: 50%;
  margin: 0 auto;
  background-color:white;
}
.theme--dark.v-application {
  color: #ffffff;
}

.error-code {
  text-align: center;
  color: rgb(100, 100, 100);
  font-size: 82pt;
  font-weight: bolder;
  line-height: 1;
}

/* Page Not Found */
.title-div {
  font-weight: bold;
  font-size: 30px;
  color: tomato;
}

.description-p {
  color: #333;
  text-align: center;
}

/* Go Home*/
.home-link {
  border-radius: 25pt;
  padding: 12px;
  background-color: #e65035;
  color: #fff;
  text-decoration: navajowhite;
  padding: 10px 39px;
  margin-top: 30px;
}
</style>
