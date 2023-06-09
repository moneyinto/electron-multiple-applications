<template>
    <canvas class="loading-fixed" ref="canvasRef"></canvas>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";

const props = defineProps({
    process: {
        type: Number,
        default: 0
    }
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let width = 112;
let height = 112;
const angle = computed(() => props.process / 100 * 360);
nextTick(() => {
    if (canvasRef.value) {
        const canvas = canvasRef.value;
        ctx = canvas.getContext("2d");
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const dpr = window.devicePixelRatio;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx!.scale(dpr, dpr);

        startLoading();
    }
});

const startLoading = () => {
    if (ctx) {
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 34, 0, 2 * Math.PI);
        ctx.globalAlpha = 0;
        ctx.closePath();
        ctx.clip();
        ctx.clearRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 30, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.arc(width / 2, height / 2, 34, -Math.PI / 2, (angle.value - 90) / 180 * Math.PI);
        ctx.globalAlpha = 0;
        ctx.closePath();
        ctx.clip();
        ctx.clearRect(0, 0, width, height);
        ctx.restore();

        if (angle.value < 360) {
            window.requestAnimationFrame(startLoading);
        } else {
            endLoading(34);
        }
    }
};

const endLoading = (r: number) => {
    if (ctx) {
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, 2 * Math.PI);
        ctx.globalAlpha = 0;
        ctx.closePath();
        ctx.clip();
        ctx.clearRect(0, 0, width, height);
        ctx.restore();

        if (r < 112) {
            window.requestAnimationFrame(() => {
                endLoading(r + 2);
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.loading-fixed {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
}
</style>
