<template>
  <div class="vision">
    <BannerTitle>
      <div class="text-section">
        <span>{{ getText('vision.esgPartner') }}</span>
        <span>{{ getText('vision.esgResponsibility') }}</span>
      </div>
    </BannerTitle>
    <div class="vision-module1 ">
      <div class="vision-module1-banner">
        <img src="./images/banner1.png" alt="vision_banner1" />
        <div class="vision-module1-banner-text">
          <svg viewBox="0 0 100 30" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <radialGradient id="visionBannerHighlightMobile" gradientUnits="userSpaceOnUse" cx="50" cy="15" r="34">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.42" />
                <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
              </radialGradient>
            </defs>
            <g class="vision-module1-banner-text-base" fill="#ECECEE" fill-opacity="0.58">
              <text x="50" y="12.3" text-anchor="middle" font-size="5.35" class="vision-module1-banner-text-line1">{{ getText('vision.bannerLine1') }}</text>
              <text x="50" y="20.8" text-anchor="middle" font-size="5.35" class="vision-module1-banner-text-line2">{{ getText('vision.bannerLine2') }}</text>
            </g>
            <g class="vision-module1-banner-text-highlight" fill="url(#visionBannerHighlightMobile)">
              <text x="50" y="12.3" text-anchor="middle" font-size="5.35" class="vision-module1-banner-text-line1">{{ getText('vision.bannerLine1') }}</text>
              <text x="50" y="20.8" text-anchor="middle" font-size="5.35" class="vision-module1-banner-text-line2">{{ getText('vision.bannerLine2') }}</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
    <div class="vision-module2 " ref="impactList" @mousedown="startImpactDrag" @mousemove="onImpactDrag"
      @mouseup="endImpactDrag" @mouseleave="endImpactDrag" @touchstart="startImpactDrag"
      @touchmove="onImpactDrag" @touchend="endImpactDrag" @touchcancel="endImpactDrag">
      <div class="vision-module2-item" v-for="(item, index) in impactData" :key="index">
        <p class="vision-module2-item-title" >{{ item.title }}</p>
        <div class="hover-scale-transition">
          <img class="vision-module2-item-img" :src="item.imgSrc"  />
          <ul class="vision-module2-item-text">
            <li v-for="(text, idx) in item.texts" :key="idx">{{ text }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="vision-module3 ">
      <div class="vision-module3-title">
        <span class="vision-module3-title-text1">{{ getText('vision.title') }}</span>
        <span class="vision-module3-title-text2">{{ getText('vision.subtitle') }}</span>
        <p class="vision-module3-title-text3">{{ getText('vision.oecdIntro') }}</p>
        <p class="vision-module3-title-text3"> {{ getText('vision.oecdIntro2') }}</p>
      </div>
      <div class="mouse-scroll">
        <MouseScrollM :modules="declineData" :originHeight="430">
          <template #item-content="{ module }">
            <CrisisCard :module="module" />
          </template>
        </MouseScrollM>
      </div>

    </div>

    <div class="vision-module4 border-gradient">
      <div class="vision-module4-w">
        <div class="vision-module4-top">
          <div class="vision-module4-top-title">
            <p class="vision-module4-top-title-text1">{{ getText('vision.respond') }}</p>
            <p class="vision-module4-top-title-text2">{{ getText('vision.call') }}</p>
          </div>
          <div class="vision-module4-top-description">
            <p class="vision-module4-top-description-text">
              {{ getText('vision.nationalPolicy') }}
            </p>
          </div>
        </div>
        <div class="vision-module4-bottom">
          <div class="vision-module4-bottom-card border-white" v-for="item in cardData" :key="item.key">
            <div class="book-icon">
              <img src="./images/book_icon.png" alt="policy" />
            </div>
            <div class="vision-module4-bottom-card-content">
              <p class="vision-module4-bottom-card-content-text1">
                {{ item.title }}
              </p>
              <p v-if="item.tags" class="vision-module4-bottom-card-content-tags">
                {{ item.tags }}
              </p>
              <p class="vision-module4-bottom-card-content-text2">
                {{ item.content }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <VisionModule5 />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import VisionModule5 from "./VisionModule5.vue";
import BannerTitle from '@/components/BannerTitle'
import MouseScrollM from '@/components/MouseScrollM'
import CrisisCard from "./CrisisCard";
import { getText } from "@/utils/language";


const impactList = ref(null);
const isImpactDragging = ref(false);
const impactDragStartX = ref(0);
const impactDragScrollLeft = ref(0);

const startImpactDrag = (event) => {
  if (!impactList.value) return;
  const point = event.type === 'touchstart' ? event.touches[0] : event;
  if (!point) return;
  isImpactDragging.value = true;
  impactDragStartX.value = point.clientX;
  impactDragScrollLeft.value = impactList.value.scrollLeft;
};

const onImpactDrag = (event) => {
  if (!isImpactDragging.value || !impactList.value) return;
  const point = event.type === 'touchmove' ? event.touches[0] : event;
  if (!point) return;
  const walk = (point.clientX - impactDragStartX.value) * 2;
  impactList.value.scrollLeft = impactDragScrollLeft.value - walk;
};

const endImpactDrag = () => {
  isImpactDragging.value = false;
};


const cardData = computed(() => {
  const policies = getText('vision.policies') || [];
  return policies.map((p, i) => ({
    key: i,
    title: p.title,
    tags: p.tags,
    content: p.content,
  }));
});

const declineData = computed(() => {
  const stats = getText('vision.oecdStats') || [];
  return stats.map((s, i) => ({
    key: i,
    name: s.label,
    rate: s.value,
  }));
});

const impactData = computed(() => {
  const cards = getText('vision.crisisCards') || [];
  return cards.map((c, i) => ({
    title: c.title,
    imgSrc: require(`./images/banner2_${i + 1}.jpg`),
    texts: c.items,
  }));
});

</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.mouse-scroll {
  height: 430px;
}

.vision {

  .text-section {
    font-size: 22px;
    font-weight: 450;
    line-height: 1.45;
    text-align: center;
    color: #e8e8ea;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    white-space: nowrap;

    span {
      display: block;
    }
  }

  &-module1 {
    display: flex;
    justify-content: center;
    margin-bottom: 70px;

    &-banner {
      position: relative;
      width: calc(100vw - 40px);
      max-width: 370px;
      container-type: inline-size;

      img {
        width: 100%;
        display: block;
      }

      &-text {
        position: absolute;
        top: 53%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 76%;
        z-index: 1;
        pointer-events: none;

        svg {
          display: block;
          width: 100%;
          height: auto;
          overflow: visible;
        }

        text {
          font-family: 'MiSans VF', 'MiSans', sans-serif;
          font-weight: 450;
          letter-spacing: 0;
        }
      }
    }
  }

  &-module2 {
    padding: 30px 0;
    overflow: auto;
    display: flex;
    margin-bottom: 70px;
    margin-left: 45px;

    &::-webkit-scrollbar {
      display: none;
    }

    &-item-title{
      padding: 10px;
      width: 72px;
      color: #fff;
      border: 1px solid #fff;
      border-radius: 100px;
      font-size: 13px;
      text-align: center;
      margin-bottom: 14px;
    }

    &-item-text {
      margin-top: 14px;
      margin-left: 6px;

      li {
        position: relative;
        font-size: 13px;
        font-weight: 400;
        color: #fff;
        padding-left: 13px;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 9px;
          transform: translateY(-50%);
          width: 5px;
          height: 5px;
          background-color: #fff;
          border-radius: 50%;
        }

        &:not(:last-child) {
          margin-bottom: 14px;
        }
      }
    }

    &-item {
      margin-right: 16px;

      &-img {
        width: 300px;
        height: 210px;
        object-fit: cover;
        border-radius: 12px;
      }
    }
  }

  &-module3 {
    &-title {
      margin-left: 45px;
      margin-bottom: 60px;

      &-text1,
      &-text2 {
        display: inline-block;
        font-size: 25px;
        font-weight: 500;
        padding-bottom: 14px;
      }

      &-text1 {
        color: #ff7200;
      }

      &-text2 {
        color: #f1f3f7;
      }

      &-text3 {
        font-size: 12px;
        color: #f1f3f7;
        line-height: 17px;
      }
    }



    &-grid {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 663px;
      height: 468px;
      z-index: 0;
      /* 确保网格图在下面 */
    }

    &-trend {
      position: absolute;
      top: 65%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 824px;
      height: 386px;
      z-index: 0;
      /* 确保Mint图在网格图下面 */
    }
  }

  &-module4 {
    margin-top: 60px;
    width: 100%;

    &-top {
      margin: 60px 0 0 60px;
      display: flex;
      flex-direction: column;

      &-title-text1,
      &-title-text2 {
        font-size: 25px;
      }

      &-title {
        display: flex;

        &-text1 {
          color: #ff7200;
          margin-right: 0;
        }

        &-text2 {
          color: #f1f3f7;
        }
      }

      &-description {
        display: flex;
        justify-content: flex-start;
        margin: 10px 0 45px;

        &-text {
          font-size: 12px;
          line-height: 1.7;
          color: #fff;
        }
      }
    }

    &-bottom {
      padding: 0 10px 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 14px;

      &-card {
        display: flex;
        font-size: 13px;
        color: #fff;
        padding: 16px;
        border-radius: 12px;
        // border: 1px solid rgba(255, 255, 255, 0.2);

        .book-icon {
          width: 15.89px;
          height: 20px;

          img {
            height: 100%;
          }


        }

        &-content {
          margin-left: -4px;

          &-text1 {
            margin-top: 36px;
            margin-bottom: 16px;
            font-size: 16px;
            font-weight: 500;
            color: #f1f3f7;
          }

          &-tags {
            margin: 0 0 18px;
            font-size: 12px;
            line-height: 20px;
            color: #ff7200;
          }

          &-text2 {
            margin-top: 0;
            font-size: 13px;
            line-height: 21px;
            color: #f1f3f7;
            margin-bottom: 14px;
          }
        }
      }
    }
  }
}
</style>
