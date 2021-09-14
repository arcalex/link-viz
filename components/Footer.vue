<template>
  <v-footer dense padless color="black" class="footer">
    <v-row align="start">
      <v-col class="text-center footer-lower-part" cols="12">
        <p class="white--text">
          {{ new Date().getFullYear() }} — &copy;
          <strong>Bibliotheca Alexandrina</strong>
        </p>
      </v-col>
    </v-row>
  </v-footer>
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
 * Page Footer
 */
export default {
  
}
</script>

<style scoped>
.footer-lower-part {
  /*background-color:#fff;*//* This is the original */
  background-color:#000;/* This is the original */
  padding: 0 !important;
}
.footer {
  border-top: 1px solid #6B6B6B !important;
}
</style>