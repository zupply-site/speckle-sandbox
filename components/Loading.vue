<template>
  <v-container fluid fill-height :style="'min-height: ' + height">
    <v-row align="center" justify="center">
      <v-col cols="12" align="center" justify="center">
        <v-progress-circular
          v-if="!progress"
          indeterminate
          :size="size"
          color="primary"></v-progress-circular>
        <v-progress-circular
          class="progress-circular"
          v-else
          rotate="-90"
          :value="progress"
          :size="size"
          color="primary"></v-progress-circular>
      </v-col>
      <v-col cols="12" align="center" justify="center" v-if="text || progress">
        <span class="">{{ text ? text : progress + "%" }}</span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    size: { type: Number, default: 100 },
    text: { type: String, default: null },
    height: { type: Number, default: 200 },
    progress: { type: Number, default: null },
  },
};
</script>

<style lang="css">
.v-progress-circular__overlay {
  transition: none !important;
}
</style>
