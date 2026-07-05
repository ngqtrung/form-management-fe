const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("pages/login/index.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", name: "active-forms", component: () => import("pages/index.vue") },
      {
        path: "forms/:formId/fill",
        name: "fill-form",
        component: () => import("pages/forms/fill/index.vue"),
        props: true,
      },
      { path: "submissions", name: "submissions", component: () => import("pages/submissions/index.vue") },
      {
        path: "admin/forms",
        name: "admin-forms",
        component: () => import("pages/admin/forms/index.vue"),
        meta: { requiresRole: "admin" },
      },
      {
        path: "admin/forms/:formId/fields",
        name: "admin-form-fields",
        component: () => import("pages/admin/forms/fields/index.vue"),
        props: true,
        meta: { requiresRole: "admin" },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
