const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("pages/login/index.vue"),
    meta: { public: true },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
