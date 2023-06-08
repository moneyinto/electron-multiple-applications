<template>
    <div class="application-container">
        <div class="application-list">
            <div
                class="application-item"
                v-for="(item, index) in applicationList"
                :key="index"
                @click="openApplication(item.application, item.url)"
            >
                <img :src="item.icon" :alt="item.name" />
                <div class="application-name">{{ item.name }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { message } from "ant-design-vue";
import { ref } from "vue";

const applicationList = ref([
    {
        name: "画板",
        icon: new URL("@/assets/images/write.png", import.meta.url).href,
        application: "whiteboard",
        url: "http://127.0.0.1:5501/applications/whiteboard/app.zip"
    },
    {
        name: "MPPTX",
        icon: new URL("@/assets/images/mpptx.png", import.meta.url).href,
        application: "mpptx",
        url: "http://127.0.0.1:5501/applications/mpptx/app.zip"
    }
]);

const openApplication = async (application: string, url: string) => {
    const isExist = window.electron.openApplication(application);
    if (!isExist) {
        const isOk = await window.electron.downloadApplication(application, url);
        if (isOk) {
            window.electron.openApplication(application);
        } else {
            message.error("应用加载失败");
        }
    }
};
</script>

<style lang="scss" scoped>
.application-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    z-index: 1;;
}

.application-list {
    display: flex;
    flex-wrap: wrap;
}

.application-item {
    padding: 10px;
    cursor: pointer;
    width: 110px;
    img {
        width: 60px;
        -webkit-user-drag: none;
        display: block;
        margin: auto;
    }
    .application-name {
        margin-top: 10px;
        text-align: center;
    }
}
</style>
