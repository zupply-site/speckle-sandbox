<template>
  <speckle-viewer
    :viewerId="1"
    :speckle-url="'https://app.speckle.systems/streams/3043c3077d/objects/3444de09c280ab0a6900c23833129c42'"></speckle-viewer>
</template>

<script>
import SpeckleViewer from "~/components/SpeckleViewer.vue";

export default {
  auth: false,
  layout: "default",
  components: {
    SpeckleViewer: SpeckleViewer,
  },
};
</script>

<style></style>
