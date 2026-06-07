<template>
  <div class="banner">
    <div class="banner-title">
      <img class="grid-image" src="@/assets/images/grid1.png" alt="vision_grid" />
      <img class="mint-image" src="@/assets/images/mint.png" alt="vision_mint" />
      <div class="banner-title-text">
        <slot></slot>
      </div>
      <img class="text-image" :src="titleImage" :style="titleStyle" alt="title" v-if="titleImage" />
    </div>
  </div>
</template>
<script>
export default {
  name: "BannerTitle",
  components: {},
  props: {
    titleImage: {
      type: String,
      default: ''
    },
    titleStyle: {
      type: Object,
      default: () => ({})
    },
    titleRender: {
      type: Function,
      default: (h) => h('div', {}, 'Your Title')
    }
  },

};
</script>

<style lang="less" scoped>
.banner {
  padding-top: 70px;
  &-title {
    margin: auto;
    width: 998px;
    position: relative;
    height: 468px;

    .grid-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 663px;
      z-index: 1;
    }

    .mint-image {
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      z-index: 0;
    }

    .text-image {
      position: absolute;
      width: 735px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
    }

    .banner-title-text {
      position: absolute;
      width: 735px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      display: flex;
      justify-content: center;

    }
  }
}

@media (max-width: 992px) {

  .banner {
    margin-top: 60px;

    &-title {
      width: calc(100vw - 20px);
      height: 248px;

      .grid-image {
        width: 100%;
      }

      .mint-image {
        width: 302px;
      }

      .text-image {
        width: 217px;
      }

      .banner-title-text {
        width: calc(100vw - 56px);
        max-width: 320px;
      }
    }
  }
}
</style>
