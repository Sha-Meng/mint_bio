<template>
  <div class="aminoAcid-module2">
    <div class="aminoAcid-module2-radian" :style="{ marginLeft: tabStyle.marginLeft, zIndex: tabStyle.zIndex }">
      <div class="aminoAcid-module2-radian-inner"></div>
      <div class="aminoAcid-module2-radian-title">
        <p>{{ title }}</p>
      </div>
    </div>
    <div class="aminoAcid-module2-content">
      <div class="aminoAcid-module2-content-w">
        <div class="aminoAcid-module2-content-top">
          <p v-for="(item, index) in topItems" :key="index">{{ item }}</p>
        </div>
        <div class="aminoAcid-module2-content-bottom">
          <div class="aminoAcid-module2-content-bottom-introduction">
            <div class="aminoAcid-module2-content-bottom-introduction-title"
              :style="{ flexDirection: isRow ? 'row' : 'column' }">
              <span class="aminoAcid-module2-content-bottom-introduction-title-text1">
                {{ introductionTitle1 }}
              </span>
              <span class="aminoAcid-module2-content-bottom-introduction-title-text2">
                {{ introductionTitle2 }}
              </span>
            </div>
            <div class="aminoAcid-module2-content-bottom-introduction-apply">
              <p v-for="(applyText, index) in applyTexts" :key="index"
                class="aminoAcid-module2-content-bottom-introduction-apply-text">
                {{ applyText }}
              </p>
            </div>
            <div class="aminoAcid-module2-content-bottom-introduction-advantage">
              <ul class="aminoAcid-module2-content-bottom-introduction-advantage-text">
                <li v-for="(advantage, index) in advantages" :key="index">
                  {{ advantage }}
                </li>
              </ul>
            </div>
          </div>
          <div class="aminoAcid-module2-content-bottom-exhibit">
            <div v-if="imageUrl.length === 1" class="aminoAcid-module2-content-bottom-exhibit-image">
              <img :src="getImageUrl(imageUrl[0])" alt="" />
            </div>

            <div v-else class="swiper-content">
              <div class="navigation">
                <div class="arrow" :class="{ 'arrow-active': curSwipIndex === 0 }" @click="handlePrev">
                  &lt;
                </div>
                <div class="arrow" :class="{
                  'arrow-active': curSwipIndex === imageUrl.length - 1,
                }" @click="handleNext">
                  &gt;
                </div>
              </div>
              <Swiper :slides-per-view="1" :effect="'fade'" :current="curSwipIndex" @slide-change="onSlideChange"
                @swiper="onSwiper" :modules="[EffectFade]" :speed="1000">
                <SwiperSlide v-for="(item, index) in imageUrl" :key="index">
                  <img :src="getImageUrl(item.url)" />
                  <div class="swiper-slide-desc">{{ item.desc }}</div>
                </SwiperSlide>
              </Swiper>
              <div class="indicator">
                <div v-for="(item, index) in imageUrl" :key="index" class="dot"
                  :class="{ active: index === curSwipIndex }"></div>
              </div>
            </div>

            <div class="aminoAcid-module2-content-bottom-exhibit-match">
              <p class="aminoAcid-module2-content-bottom-exhibit-match-btn" @click="triggerPopover">
                {{ getText('common.labels.matchAdvisor') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { getImageUrl } from "@/utils";
import { getText } from "@/utils/language";
import { throttle } from "lodash";

import "swiper/css";
import "swiper/css/effect-fade";
import emitter from '@/event/event';

const triggerPopover = () => {
  emitter.emit('open-popover');
};

const props = defineProps({
  title: String,
  topItems: Array,
  introductionTitle1: String,
  introductionTitle2: String,
  isRow: Boolean,
  applyTexts: Array,
  advantages: Array,
  imageUrl: Array,
  tabStyle: {
    type: Object,
    default: () => ({
      marginLeft: "0%", // 默认值
      zIndex: 1, // 默认值
    }),
  },
});

const curSwipIndex = ref(0);
const swiperRef = ref(null);

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
}, 500);

const handleNext = throttle(() => {
  if (curSwipIndex.value === props.imageUrl.length - 1) return;
  swiperRef.value && swiperRef.value.slideNext();
}, 500);
</script>


<style lang="less" scoped>
.aminoAcid {
  &-module2 {
    width: 100%;

    &-radian {
      position: relative;
      top: 1px;
      width: 20%;
      height: 40px;
      overflow: hidden;
      border-radius: 20px 20px 0 0;

      &-inner {
        position: absolute;
        width: 224px;
        height: 40px;
        background: #17191c;
        bottom: 0;
        left: 24px;
        border-radius: 20px 20px 0 0;
        z-index: 2;
        transform: perspective(40px) scaleX(1.2) scaleY(1.5) rotateX(24deg);
        border: 1px solid #ffffff66;
        border-bottom: none;
        transform-origin: center bottom;

        &::before {
          content: "";
          position: absolute;
          width: 8px;
          height: 10px;
          bottom: -8px;
          left: -8px;
          background: radial-gradient(circle at 0% 0,
              transparent,
              transparent 9.5px,
              #626568 10px,
              #17191c);
        }

        &::after {
          content: "";
          position: absolute;
          width: 8px;
          height: 10px;
          top: 40px;
          right: -8px;
          background: radial-gradient(circle at 10px 0,
              transparent,
              transparent 9.5px,
              #626568 10px,
              #17191c);
        }
      }

      &-title {
        margin-left: 25px;
        position: absolute;
        width: 224px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        top: 0;
        left: 0;
        z-index: 3;
        color: #f1f3f780;
        font-size: 14px;
        font-weight: 500;
        border-radius: 30px 30px 0 0;
      }
    }

    &-content {
      border-radius: 20px;
      border: 1px solid transparent;
      background-image: linear-gradient(#181a1d, #12161b),
        linear-gradient(156.52deg,
          rgba(255, 255, 255, 0.4) 2.12%,
          rgba(255, 255, 255, 0.0001) 60%,
          rgba(255, 255, 255, 0.0001) 54%,
          rgba(255, 255, 255, 0.1) 93.02%);
      background-origin: border-box;
      background-clip: content-box, border-box;

      &-w {
        margin: 45px 74px 60px 74px;
      }

      &-top {
        margin-bottom: 44px;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 500;
        color: #f1f3f780;
      }

      &-bottom {
        display: flex;
        justify-content: space-between;
        gap: 70px;

        &-introduction {
          margin-top: 70px;
          width: 440px;

          &-title {
            display: flex;
            flex-direction: column;

            &-text1,
            &-text2 {
              font-size: 40px;
              font-weight: 500;
            }

            &-text1 {
              color: #ff7200;
              margin-right: 10px;
            }

            &-text2 {
              color: #f1f3f7;
            }
          }

          &-apply {
            margin-top: 33px;
            margin-bottom: 121px;
            display: flex;
            gap: 30px;

            &-text {
              padding: 20px;
              font-size: 14px;
              font-weight: 500;
              color: #f1f3f7;
              border-radius: 50px;
              border: 1px solid #ffffff;
            }
          }

          &-advantage {
            li {
              position: relative;
              font-size: 20px;
              font-weight: 500;
              color: #f1f3f7;
              padding-left: 24px;

              &::before {
                content: "";
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 10px;
                height: 10px;
                background-color: #fff;
                border-radius: 50%;
              }

              &:not(:last-child) {
                margin-bottom: 16px;
                /* 每项之间的间隔 */
              }
            }
          }
        }

        &-exhibit {
          position: relative;

          &-image {
            width: 764px;
            height: 526px;

            img {
              width: 100%;
            }
          }

          &-match {
            position: absolute;
            bottom: 20px;
            right: 10px;
            z-index: 999;

            &-btn {
              width: 124px;
              height: 58px;
              line-height: 58px;
              text-align: center;
              font-size: 16px;
              font-weight: 500;
              color: #f1f3f7;
              background-color: rgba(40, 40, 40, );
              border-radius: 209px;
              border: 1px solid white;
            }
          }

          .swiper-content {
            position: relative;
            width: 764px;
            height: 526px;

            .swiper {
              height: 100%;
              width: 100%;

              .swiper-slide {
                width: 100%;
                height: 100%;

                .swiper-slide-desc {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  padding: 17px 20px;
                  text-align: center;
                  background-color: #11161bb2;
                  color: #fff;
                  font-size: 16px;
                  border-radius: 100px;
                }

                img {
                  width: 100%;
                  height: 100%;
                  border-radius: 20px;
                }
              }
            }

            .navigation {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              width: 100%;
              display: flex;
              justify-content: space-between;
              padding: 0 20px;
              box-sizing: border-box;
              z-index: 99;

              .arrow {
                width: 36px;
                height: 36px;
                line-height: 36px;
                text-align: center;
                border-radius: 4px;
                background-color: #11161bb2;
                font-size: 14px;
                color: #d9d9d9;
                user-select: none;
              }

              .arrow-active {
                opacity: 0.5;
              }
            }

            .indicator {
              margin-top: 20px;
              display: flex;
              justify-content: center;

              .dot {
                width: 10px;
                height: 10px;
                margin: 0 10px;
                border-radius: 50%;
                background-color: #ffffff4d;
              }

              .active {
                background-color: #ff7200;
              }
            }
          }
        }
      }
    }
  }
}
</style>