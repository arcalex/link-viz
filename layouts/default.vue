<template>
  <v-app>
    <div class="d-flex flex-column justify-center flex-container">
        <Header />
        <v-main>
          <nuxt />
        </v-main>
        <Footer />
    </div>
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
 * main layout for all pages
 */
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default {
  // Must be done in order to let component take effect
  components: {
    Footer,
    Header,
  },
};
</script>

<style scoped>
.flex-container {
  width: 100%;
  height: 100%;
  /* overflow-y: auto; */
}
</style>