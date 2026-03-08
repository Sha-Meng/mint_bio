<template>
  <div ref="banner" class="banner">
    <div class="banner-title">
      <Header />
      <img
        class="background-img"
        :src="backgroundImg"
        alt="background-img"
        :class="{ 'animate-background': isAnimating }"
      />
      <img
        class="grid-image"
        src="@/assets/images/grid1.png"
        alt="vision_grid"
        :class="{ 'animate-grid': isAnimating }"
      />
      <img
        class="mint-image"
        src="@/assets/images/mint.png"
        alt="vision_mint"
        :class="{ 'animate-mint': isAnimating }"
      />
      <img
        v-if="titleImage"
        class="text-image"
        :src="titleImage"
        :style="titleStyle"
        alt="title"
        :class="{ 'animate-text': isAnimating }"
      />
      <div
        v-if="$slots.default"
        class="text-image banner-text-slot"
        :style="titleStyle"
        :class="{ 'animate-text': isAnimating }"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, provide, onMounted } from 'vue';
import Header from "@/components/Header";

export default {
  name: "BannerAnimation",

  components: { Header },
  props: {
    titleImage: {
      type: String,
      default: '',
    },
    backgroundImg: {
      type: String,
    },
    titleStyle: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      isAnimating: false,
    };
  },
  mounted() {
    setTimeout(() => {
      this.startAnimation();
    }, 1000);
  },
  methods: {
    startAnimation() {
      this.isAnimating = true;
    },
  },
  setup() {
    const banner = ref(null);
    const bannerHeight = ref(0);

    onMounted(() => {
      if (banner.value) {
        bannerHeight.value = banner.value.offsetHeight;
      }
    });

    provide('bannerHeight', bannerHeight);

    return {
      banner,
    };
  },
};
</script>
<style lang="less" scoped>
.banner {
  &-title {
    padding: 0 160px;
    margin: auto;
    position: relative;
    height: 1000px;
    overflow: hidden;

    .background-img {
      position: absolute;
      top: 1100px;
      transform: translate(-50%, -50%);
      left: 50%;
      width: calc(100% - 320px);
      height: 100%;
      object-fit: cover;
      transition: all 1s ease-in-out;
      z-index: 0;
    }

    .animate-background {
      top: 500px;
      width: 100%;
    }

    .grid-image {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      top: 400px;
      width: 663px;
      z-index: 1;
      transition: transform 2s ease-in-out, opacity 2s ease-in-out;
    }

    .animate-grid {
      transform: translate(-50%, -150%);
      opacity: 0;
    }

    .mint-image {
      position: absolute;
      top: 400px;
      left: 50%;
      transform: translate(-50%, -50%);
      width: calc(100% - 320px);
      z-index: 0;
      transition: transform 2s ease-in-out, opacity 2s ease-in-out;
    }

    .animate-mint {
      transform: translate(-50%, -150%);
      opacity: 0;
    }

    .text-image {
      position: absolute;
      width: 735px;
      top: 400px;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      opacity: 0.7;
      transition: all 1s ease-in-out;
    }

    .animate-text {
      opacity: 1;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .banner-text-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
  }
}
</style>