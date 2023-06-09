<template>
    <div class="application-container">
        <div class="application-list">
            <div
                class="application-item"
                v-for="(item, index) in applicationList"
                :key="index"
                @click="openApplication(item.application, item.url)"
            >
                <Loading :process="downloadProcess" v-if="downloadingApplication === item.application" />
                <img :src="item.icon" :alt="item.name" />
                <div class="application-name">{{ item.name }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { message } from "ant-design-vue";
import { ref } from "vue";
import Loading from "./Loading.vue";

const applicationList = ref([
    {
        name: "画板",
        icon: new URL("@/assets/images/write.png", import.meta.url).href,
        application: "whiteboard",
        url: "http://127.0.0.1:5500/applications/whiteboard/app.zip"
    },
    {
        name: "MPPTX",
        icon: new URL("@/assets/images/mpptx.png", import.meta.url).href,
        application: "mpptx",
        url: "http://127.0.0.1:5500/applications/mpptx/app.zip"
    }
]);

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

const downloadingApplication = ref("");
const downloadProcess = ref(0);
const openApplication = async (application: string, url: string) => {
    const isExist = window.electron.openApplication(application);
    if (!isExist) {
        // 下载进度进行延迟处理，让用户看到下载进度
        downloadingApplication.value = application;
        downloadProcess.value = 0;
        await sleep(500);
        const time = new Date().getTime();
        const isOk = await window.electron.downloadApplication(application, url, (process: number) => {
            if (new Date().getTime() - time >= 2000) {
                downloadProcess.value = process * 100;
            }
        });
        const endTime = new Date().getTime();
        if (endTime - time < 2000) {
            // 如果2s就下载完成，那么就模拟假的下载进度，为了看清动画效果
            const interval = setInterval(() => {
                if (downloadProcess.value < 100) {
                    downloadProcess.value += 1;
                }
            }, 20);
            await sleep(2000);
            clearInterval(interval);
        }
        await sleep(1000);
        downloadingApplication.value = "";
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
    width: 112px;
    height: 112px;
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    user-select: none;
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
