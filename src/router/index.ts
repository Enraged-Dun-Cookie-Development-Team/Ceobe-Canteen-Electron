import { createRouter, createWebHashHistory } from "vue-router";

import Browser from "@/components/Browser.vue";
import Navbar from "@/components/Navbar.vue";
import Background from "@/view/Background.vue";
import Notification from "@/view/Notification.vue";
import Home from "@/view/home/Home.vue";
import InfoAndTool from "@/view/home/InfoAndTool.vue";

const routes = [
  {
    path: "",
    component: Navbar,
    redirect: "/home/tool",
    children: [
      {
        path: "/home",
        component: Home,
        name: "Home",
        children: [
          {
            path: "tool",
            component: InfoAndTool,
            name: "Tool",
          },
          {
            path: "browser",
            component: Browser,
            name: "Browser",
          },
        ],
      },
    ],
  },
  {
    path: "/notification",
    component: Notification,
  },
  {
    path: "/background",
    component: Background,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
