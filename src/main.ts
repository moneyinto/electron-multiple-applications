import { createApp } from "vue";
import App from "./App.vue";
import AntDesign, { message } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

const app = createApp(App);
app.use(AntDesign);
app.mount("#app");

message.config({
    maxCount: 1
});
