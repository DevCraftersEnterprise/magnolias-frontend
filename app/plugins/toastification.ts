import Toast, { POSITION, type PluginOptions } from "vue-toastification";
import 'vue-toastification/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
    const options: PluginOptions = {
        position: POSITION.BOTTOM_RIGHT,
        timeout: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        showCloseButtonOnHover: false,
        hideProgressBar: false,
        closeButton: 'button',
        rtl: false,
        icon: false,
    };

    nuxtApp.vueApp.use(Toast, options)
});