import { createApp } from "vue";

import App from "@/App.vue";
import router from "@/router";

import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";

import "@/assets/css/index.scss";

loadFonts();

const app = createApp(App);

app.use(router).use(vuetify).mount("#app");
