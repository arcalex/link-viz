<template>
  <v-container fluid class="home-container">
    <div class="flex-container d-flex flex-column justify-center align-center">
      <div>
        <v-img :src="require('~/assets/images/linkGate_logo_black.png')"></v-img>
      </div>
      <div class="subtitle">Web Archive Graph Visualization</div>
      <div class="d-flex justify-center" style="width: 40%">
        <URLGraphSeeker
          color="#666"
          background-color="#FFFFFF"
          initialURL="https://www.cdc.gov/"
          @readyURL="goToGraphPage"
        />
      </div>
      <p
        class="justify-center home-brief"
        style="text-align: center; display: grid"
      >
        Explore billions of interlinked data nodes in a virtual space with
        time-travel capabilities!
        <br />
        LinkGate is being developed with funding by
        the<a href="https://netpreserve.org/"
          >International Internet Preservation Consortium (IIPC)</a
        >
      </p>
      <div>
        <v-img :src="require('~/assets/images/separator2.png')"></v-img>
      </div>
    </div>
  </v-container>
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
 * Home page
 */
import URLGraphSeeker from "@/components/URLGraphSeeker";

export default {
  components: {
    URLGraphSeeker,
  },
  head() {
    return {
      title: "Archive Visualization",
    };
  },
  methods: {
    // Navigate to graph page
    goToGraphPage(url) {
      this.$router.push({
        path: "/graph",
        query: {
          url: url,
        },
      });
    },
  },
};
</script>

<style scoped>
@font-face {
  font-family: "Open Sans Condensed";
  src: url("~assets/fonts/OpenSansCondensed-Light.eot");
  src: url("~assets/fonts/OpenSansCondensed-Light.eot");
  src: url("~assets/fonts/OpenSansCondensed-Light.eot?#iefix")
      format("embedded-opentype"),
    url("~assets/fonts/OpenSansCondensed-Light.woff2") format("woff2"),
    url("~assets/fonts/OpenSansCondensed-Light.woff") format("woff"),
    url("~assets/fonts/OpenSansCondensed-Light.svg#OpenSansCondensed-Light")
      format("svg");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

.flex-container {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 1);
  background-image: url("~assets/images/linkGate_Bg.png");
  background-position: bottom;
  background-size: cover;
}

.home-container {
  width: 100%;
  height: 100%;
  padding: 0%;
}

/* Apply style for subtitle*/
.subtitle {
  text-transform: none;
  font-size: 18pt;
  margin: 8px 0 20px;
  color: #7a7979;
  font-family: "Open Sans Condensed";
  font-weight: 300;
  font-style: normal;
}
.home-brief {
  color: #5e5e5e !important;
}
</style>