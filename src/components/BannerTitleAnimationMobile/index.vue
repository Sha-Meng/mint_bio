<template>
  <div class="banner">
    <div class="banner-title" ref="bannerTitle">
      <Header v-if="isShowHeader" />
      <img class="background-img" :src="backgroundImg" alt="background-img"
        :class="{ 'animate-background': isAnimating }" />
      <img class="grid-image" src="@/assets/images/grid1.png" alt="vision_grid"
        :class="{ 'animate-grid': isAnimating }" />
      <img class="mint-image" src="@/assets/images/mint.png" alt="vision_mint"
        :class="{ 'animate-mint': isAnimating }" />
      <img v-if="titleImage" class="text-image" :src="titleImage" :style="titleStyle" alt="title"
        :class="{ 'animate-text': isAnimating }" />
      <div v-if="$slots.default" class="text-image banner-text-slot" :style="titleStyle"
        :class="{ 'animate-text': isAnimating }">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script>
import Header from "@/components/Header";

export default {
  name: "BannerTitleAnimation",

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
    isShowHeader: {
      type: Boolean,
      default: true
    }
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
};
</script>
<style lang="less" scoped>
.banner {
  &-title {
    margin: auto;
    position: relative;
    height: 412px;
    overflow: hidden;
    margin-top: 60px;

    .background-img {
      position: absolute;
      top: 340px;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 330px;
      height: 211px;
      object-fit: cover;
      transition: all 1s ease-in-out;
      z-index: 0;
      border-radius: 20px;
    }

    .animate-background {
      top: 20px;
      width: 370px;
      left: 10px;
      height: 392px;

      transform: translate(0, 0);
    }

    .grid-image {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      height: 261px;
      top: 115px;
      width: 370px;
      z-index: 1;
      transition: transform 2s ease-in-out, opacity 2s ease-in-out;
    }

    .animate-grid {
      transform: translate(-50%, -150%);
      opacity: 0;
    }

    .mint-image {
      position: absolute;
      top: 115px;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 370px;
      z-index: 0;
      transition: transform 2s ease-in-out, opacity 2s ease-in-out;
    }

    .animate-mint {
      transform: translate(-50%, -150%);
      opacity: 0;
    }

    .text-image {
      position: absolute;
      top: 115px;
      width: 280px;
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