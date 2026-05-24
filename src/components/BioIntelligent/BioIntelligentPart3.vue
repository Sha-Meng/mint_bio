<template>
  <div class="part3 sector border-gradient">
    <div v-intersect="() => titleInView = true">
      <div v-if="titleInView" class="label animate__animated animate__fadeInUp">
        <div class="label-top">
          <span class="labelBig labelWhite mr117">{{ getText('bioIntelligent.understandTitle1Part1') }}</span>
          <span class="labelBig labelOrange">{{ getText('bioIntelligent.understandTitle2') }}</span>
        </div>
        <div class="label-bottom">
          <span class="labelBig labelWhite ml117">{{ getText('bioIntelligent.understandTitle1Part2') }}</span>
        </div>
      </div>
    </div>
    <div class="swipper-container">
      <div class="desc">
        <transition name="fade">
          <div class="desc-content" v-if="showElement">
            <div class="desc-content-top">
              {{ bannerList[curSwipIndex].title }}
            </div>
            <div class="desc-content-bottom">
              {{ bannerList[curSwipIndex].description }}
            </div>
          </div>
        </transition>
        <div class="desc-bottom">
          <div class="navigation">
            <div class="arrow" :class="{ 'arrow-active': curSwipIndex !== 0 }" @click="handlePrev">
              &lt;
            </div>
            <div class="arrow" :class="{
              'arrow-active': curSwipIndex !== bannerList.length - 1,
            }" @click="handleNext">
              &gt;
            </div>
          </div>
          <div class="indicator">
            <div v-for="(item, index) in bannerList" :key="index" class="dot"
              :class="{ active: index === curSwipIndex }"></div>
          </div>
        </div>
      </div>
      <div class="swipper-content">
        <Swiper :slides-per-view="1" :current="curSwipIndex" @slide-change="onSlideChange" @swiper="onSwiper">
          <SwiperSlide v-for="(item, index) in bannerList" :key="index">
            <img :src="getImageUrl(item.url)" />
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import { ref, computed } from "vue";
import { getImageUrl } from "@/utils";
import { throttle } from "lodash";
import { getText } from "@/utils/language";

import "swiper/css";

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const featureKeys = ['renewable', 'aiProtein', 'engine', 'massProduction', 'application'];
    const featureUrls = [
      "assets/BioIntelligent/swipper1.png",
      "assets/BioIntelligent/swipper2.png",
      "assets/images/swiper3.png",
      "assets/images/swiper4.png",
      "assets/images/swiper5.png",
    ];

    const bannerList = computed(() => {
      return featureKeys.map((key, i) => ({
        url: featureUrls[i],
        title: getText(`bioIntelligent.features.${key}.title`),
        description: getText(`bioIntelligent.features.${key}.desc`),
      }));
    });
    const curSwipIndex = ref(0);
    const swiperRef = ref(null); // 用于存储Swiper实例
    const showElement = ref(true);
    const titleInView = ref(false);

    function onSwiper(swiper) {
      swiperRef.value = swiper;
    }

    // 更新当前索引
    function onSlideChange(swiper) {
      curSwipIndex.value = swiper.activeIndex;
    }

    const handlePrev = throttle(() => {
      if (curSwipIndex.value === 0) return;
      swiperRef.value && swiperRef.value.slidePrev();
      showElement.value = !showElement.value;
      setTimeout(() => {
        showElement.value = !showElement.value;
      }, 100);
    }, 500);

    const handleNext = throttle(() => {
      if (curSwipIndex.value === bannerList.value.length - 1) return;
      swiperRef.value && swiperRef.value.slideNext();
      showElement.value = !showElement.value;
      setTimeout(() => {
        showElement.value = !showElement.value;
      }, 100);
    }, 500);

    return {
      getImageUrl,
      bannerList,
      curSwipIndex,
      onSlideChange,
      swiperRef, // 将swiperRef暴露到模板中
      onSwiper,
      showElement,
      handlePrev,
      handleNext,
      titleInView,
      getText,
    };
  },
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.part3 {

  .labelOrange {
    color: #ff7200;
  }

  .labelWhite {
    color: white;
  }

  .labelBig {
    font-size: 60px;
  }

  .labelSmall {
    font-size: 36px;
  }

  .label {
    width: 82.4%;
    height: 112px;
    text-align: left;
    margin-bottom: 100px;
  }

  .label-top {
    margin-bottom: 20px;
    height: 44px;
    line-height: 44px;
  }

  .swipper-container {
    display: flex;
    gap: 16px;
    height: 592px;
    width: 100%;

    .desc {
      width: 34%;
      height: 100%;
      background: #2828289f;
      border-radius: 15px;
      padding: 0 54px;
      box-sizing: border-box;

      .desc-content {
        height: 260px;
        color: #f1f3f7;

        .desc-content-top {
          margin-top: 148px;
          margin-bottom: 61px;
          font-size: 40px;
        }

        .desc-content-bottom {
          font-size: 20px;
        }
      }

      .desc-bottom {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 146px;
        height: 114px;
        border-top: 1px solid #5e5e5e26;

        .navigation {
          display: flex;
          gap: 82px;

          .arrow {
            width: 42px;
            height: 42px;
            line-height: 42px;
            text-align: center;
            border: 1px solid #ffffff33;
            border-radius: 4px;
            background-color: #ffffff2e;
            font-size: 26px;
            color: #82828280;
            user-select: none;
          }

          .arrow:hover {
            color: #ff720080;
            background-color: #797a7c;
            border-color: #ffffff;
          }

          .arrow-active {
            color: #ff720080;
          }
        }

        .indicator {
          display: flex;
          justify-content: center;

          .dot {
            width: 10px;
            height: 10px;
            margin: 0 6px;
            border-radius: 50%;
            background-color: #ffffff4d;
          }

          .active {
            background-color: #ff7200;
          }
        }
      }
    }

    .swipper-content {
      width: 66%;
      height: 100%;

      .swiper {
        height: 100%;
        width: 100%;

        .swiper-slide {
          width: 100%;
          height: 100%;

          img {
            width: 100%;
            height: 100%;
            border-radius: 20px;
          }
        }
      }
    }
  }
}

.fade-leave-from,
// 离开前,进入后透明度是1
.fade-enter-to {
  opacity: 1;
}

.fade-leave-active,
.fade-enter-active {
  transition: all 2s; //过度是2秒
}

.fade-leave-to,
.fade-enter-from {
  opacity: 0;
}

.mr117 {
  margin-right: 117px;
}

.ml117 {
  margin-left: 117px;
}
</style>
