<template>
  <v-text-field
    class="textField customInput"
    light
    v-model="targetURL"
    placeholder="For example: domain1.domain2.com/path/to/directory"
    outlined
    :color="color"
    :background-color="backgroundColor"
    dense
    clearable
    required
    rounded
    append-outer-icon="mdi-search-web"
    @keypress.enter="validateAndGo"
    @click:append-outer="validateAndGo"
    :error="!isValidURL"
    :error-messages="urlFieldErrorMessage"
    :messages="finalURL"
    :validate-on-blur="true"
  ></v-text-field>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: "",
    },
    backgroundColor: {
      type: String,
      default: "",
    },        
    initialURL: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      targetURL: this.initialURL, // Typed URL
      isValidURL: true,
      urlFieldErrorMessage: "",
      finalURL: "",
    };
  },
  methods: {
    validateAndGo() {
      console.log("Inside URLGraphSeeker");
      // Try to validate that URL using URL web API
      let url = {};
      let returnedError = ""; // Holds erro message if exists
      let tempURL = "";

      // Check that url is not empty
      if (!this.targetURL) {
        // Set meaningful error message
        returnedError = "URL cannot be empty!";
      } else {
        // Check that url is valid
        // If user adds a prefix either 'http://' or 'https://', then no need to add it again
        tempURL = this.targetURL;

        if (tempURL.search(/^https?:\/\//i) === -1) {
          // No prefix, so add the default 'http://'
          tempURL = "http://" + tempURL;
        }

        // Now, start to check the url
        try {
          url = new URL(tempURL);
        } catch (error) {
          returnedError = "Invalid URL!!Please, enter a valid one."; // Show informative error message to user
        }
      }

      // Check if error has occurred
      if (returnedError.length !== 0) {
        // ERROR!!
        this.isValidURL = false;
        this.urlFieldErrorMessage = returnedError;
      } else {
        // URL is valid
        this.isValidURL = true;
        this.urlFieldErrorMessage = "";

        this.$emit("readyURL", tempURL);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.v-input__slot:focus {
  border: 1px dashed red !important;
}
</style>