<template>
  <v-row>
    <v-col cols="12">
      <div class="speckle-viewer" :id="viewerId">
        <loading v-if="loading" :progress="loadingProgress"></loading>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import {
  CameraController,
  DefaultViewerParams,
  FilteringExtension,
  SelectionExtension,
  SpeckleLoader,
  Viewer,
  ViewerEvent,
} from "@speckle/viewer";
import Loading from "~/components/Loading.vue";

export default {
  components: { Loading },
  props: {
    viewerId: {
      type: Number,
      required: true,
    },
    speckleUrl: {
      type: String,
      default: null,
    },
  },
  watch: {
    speckleUrl: {
      async handler() {
        if (this.viewer) {
          await this.viewer.unloadAll();
          await this.loadModel();
        }
      },
    },
  },
  data() {
    return {
      loading: true,
      loadingProgress: 0,
      viewer: null,
      camera: null,
      filter: null,
      selector: null,
      keyPressed: {
        shift: false,
        ctrl: false,
        alt: false,
      },
    };
  },
  computed: {},
  methods: {
    async initViewer() {
      try {
        this.loading = true;
        /** Get the HTML container */
        const container = document.getElementById(this.viewerId);

        /** Configure the viewer params */
        const params = DefaultViewerParams;
        // params.showStats = true;
        // params.verbose = true;

        /** Create Viewer instance and initalize */
        const viewer = new Viewer(container, params);
        await viewer.init();

        /** Create extensions */
        await this.initCamera(viewer);
        this.selector = viewer.createExtension(SelectionExtension);
        this.filter = viewer.createExtension(FilteringExtension);

        viewer.on(ViewerEvent.ObjectClicked, this.handleObjectClicked);
        viewer.on(
          ViewerEvent.ObjectDoubleClicked,
          this.handleObjectDoubleClicked
        );

        this.viewer = viewer;

        await this.loadModel();

        this.loading = false;
      } catch (err) {
        console.log(err);
      }
    },
    async initCamera(viewer) {
      this.camera = viewer.createExtension(CameraController);
    },
    async loadModel() {
      try {
        if (!this.viewer) {
          this.initViewer();
        }
        /** Create a loader for the speckle stream */
        const loader = new SpeckleLoader(
          this.viewer.getWorldTree(),
          this.speckleUrl,
          process.env.SPECKLE_KEY,
          false
        );

        /** Load the speckle data */
        await this.viewer.unloadAll(); // Unload all
        await this.viewer.loadObject(loader, true);
      } catch (err) {
        console.log(err);
      }
    },
    handleObjectClicked(selectionInfo) {
      if (selectionInfo && selectionInfo.hits.length > 0) {
        this.$emit("object-clicked", {
          node: selectionInfo.hits[0].node.model,
          shift: this.keyPressed.shift,
        });
      } else {
        // No object clicked. Restore focus to entire scene

        this.$emit("object-clicked", {
          node: null,
          shift: this.keyPressed.shift,
        });
      }
    },
    handleObjectDoubleClicked(selectionInfo) {
      if (selectionInfo && selectionInfo.hits.length > 0) {
        this.camera.setCameraView(
          [selectionInfo.hits[0].node.model.id],
          true,
          5
        );
      }
    },
    handleLoadProgress(progress) {
      let currentProgress = +progress.progress * 100;

      if (this.loadingProgress == currentProgress) {
        return;
      }

      this.loadingProgress = currentProgress;

      if (this.loadingProgress === 100) {
        this.loading = false;
      }
    },

    async setView(view) {
      if (this.camera) {
        await this.camera.setCameraView(view, true);
      }
    },

    onKeyDown(event) {
      if (event.key === "Shift") this.keyPressed.shift = true;
      if (event.key === "Control") this.keyPressed.ctrl = true;
      if (event.key === "Alt") this.keyPressed.alt = true;
    },

    onKeyUp(event) {
      if (event.key === "Shift") this.keyPressed.shift = false;
      if (event.key === "Control") this.keyPressed.ctrl = false;
      if (event.key === "Alt") this.keyPressed.alt = false;
    },
  },
  async beforeDestroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    if (this.viewer) {
      await this.viewer.unloadAll();
      this.viewer.dispose();
      this.viewer = null;
      this.camera = null;
      this.selector = null;
      this.filter = null;
    }
    this.loading = true;
    this.loadingProgress = 0;
  },
  async mounted() {
    await this.initViewer();
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  },
};
</script>

<style lang="css">
.speckle-viewer {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* for a 16:9 aspect ratio */
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.speckle-viewer > * {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
