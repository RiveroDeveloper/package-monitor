// External imports
import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Internal imports
import App from './App.vue';
import './assets/css/input.css';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
