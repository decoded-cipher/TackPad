import VueSortable from "vue3-sortablejs";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueSortable)
})
