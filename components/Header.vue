<template>
<!-- This div must be added so that Header can be in its tree size!!!! -->
  <div>
  <v-app-bar dense dark color="black" class="header"> 
    <div v-if="this.$route.path !== '/'">
      <nuxt-link to="/" v-if="this.$route.path !== '/'">
        <img class="brand-img" src="~/assets/images/LogoIcon-White.png" />
        <span class="brand-name">LinkGate</span>
      </nuxt-link>
    </div>

    <v-spacer></v-spacer>

    <nuxt-link
      to="about"
      v-if="this.$route.path !== '/about'"
      class="ml-4 headerLink"
    >
      <span class="white--text" color="white">About</span>
    </nuxt-link>
  </v-app-bar>
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
 * Page Header
 */
export default {
  methods: {
    // Display Alert
    showAlert() {
      window.alert("You clicked login");
    },
    doNothing() {},
  },
};
</script>

<style scoped>
.headerLink {
  text-decoration: none;
  text-transform: uppercase;
}
.headerLink:hover {
  text-decoration: underline;
  color: #fff;
}
.brand-name {
  float: left;
display: flex;
line-height: 42px;
color: #fff;
font-size: 25px;
font-weight: bold;
margin-left: 10px;
text-transform: uppercase;
}
.brand-img {
  float: left;
  width: 40px
}
.header {
  border-bottom: 1px solid #6B6B6B !important;
}
</style>