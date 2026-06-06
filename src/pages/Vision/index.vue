<template>
  <div class="vision">
    <BannerTitle :titleImage="require('./images/banner_title.png')" />
    <div class="vision-module1 sector">
      <div class="vision-module1-banner">
        <img src="./images/banner1.png" alt="vision_banner1" />
        <div class="vision-module1-banner-text">
          <svg viewBox="0 0 100 30" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <radialGradient id="visionBannerHighlightPc" gradientUnits="userSpaceOnUse" cx="50" cy="15" r="34">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.42" />
                <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
              </radialGradient>
            </defs>
            <g class="vision-module1-banner-text-base" fill="#ECECEE" fill-opacity="0.58">
              <text x="50" y="12.3" text-anchor="middle" class="vision-module1-banner-text-line1">{{ getText('vision.bannerLine1') }}</text>
              <text x="50" y="20.8" text-anchor="middle" class="vision-module1-banner-text-line2">{{ getText('vision.bannerLine2') }}</text>
            </g>
            <g class="vision-module1-banner-text-highlight" fill="url(#visionBannerHighlightPc)">
              <text x="50" y="12.3" text-anchor="middle" class="vision-module1-banner-text-line1">{{ getText('vision.bannerLine1') }}</text>
              <text x="50" y="20.8" text-anchor="middle" class="vision-module1-banner-text-line2">{{ getText('vision.bannerLine2') }}</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
    <div class="vision-module2 sector">
      <div class="vision-module2-item" v-for="(item, index) in impactData" :key="index">
        <p class="vision-module2-item-title">{{ item.title }}</p>
        <div class="hover-scale-transition">
          <img class="vision-module2-item-img" :src="item.imgSrc" />
          <ul class="vision-module2-item-text">
            <li v-for="(text, idx) in item.texts" :key="idx">{{ text }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="vision-module3-w">
      <div v-intersect="() => title1InView = true" class="vision-module3 sector">
        <div v-if="title1InView" class="vision-module3-title animate__animated animate__fadeInUp">
          <p class="vision-module3-title-text1">{{ getText('vision.title') }}</p>
          <p class="vision-module3-title-text2">{{ getText('vision.subtitle') }}</p>
        </div>
        <div class="vision-module3-content">
          <div class="vision-module3-content-left">
            <p class="vision-module3-content-left-text">
              {{ getText('vision.oecdIntro') }}<br />{{ getText('vision.oecdIntro2') }}
            </p>
            <router-link :to="`/bioIntelligent`" class="vision-module3-content-left-more-w">
              <p class="vision-module3-content-left-more">
                {{ getText('common.buttons.learnMore') }}
              </p>
            </router-link>
            <div class="vision-module3-content-left-list-w">
              <ul class="vision-module3-content-left-list">
                <li v-for="(item, index) in declineData" :key="item.title" :class="{
                  highlight: highlightedIndex === index,
                }" @mouseover="updateHoverData(item.rate, index)">
                  {{ item.name }}
                </li>
              </ul>
            </div>
          </div>
          <div class="vision-module3-content-right">
            <img class="vision-module3-grid" src="./images/grid.png" alt="" />
            <img class="vision-module3-trend" src="./images/trend.png" alt="" />
            <div class="vision-module3-content-right-content">
              <img src="./images/down.png" alt="down" />
              <p>{{ hoverData }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="vision-module4-w">
      <div v-intersect="() => title2InView = true" class="vision-module4 sector border-gradient">
        <div v-if="title2InView" class="vision-module4-top animate__animated animate__fadeInUp">
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
          <div v-for="(item, index) in cardData" :key="item.key" class="vision-module4-bottom-card hover-scale-transition"
            @mousemove="cardHover(item)" @mouseleave="cardLeave()" :style="{ transform: hoveredCardKey === item.key ? 'scale(1.05)' : 'scale(1)' }">
            <img class="book-icon-img" src="./images/book_icon.png" alt="policy" />
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
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import VisionModule5 from "./VisionModule5.vue";
import BannerTitle from "@/components/BannerTitle";
import { getText } from "@/utils/language";

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

const highlightedIndex = ref(0);
const hoverData = ref("15%～88%");
const title1InView = ref(false);
const title2InView = ref(false);
const hoveredCardKey = ref(-1);

// 卡片等高逻辑
function syncPolicyCardHeight() {
  nextTick(() => {
    const cards = document.querySelectorAll('.vision-module4-bottom-card');
    if (!cards.length) return;
    cards.forEach(el => { el.style.height = 'auto'; });
    nextTick(() => {
      let maxH = 0;
      cards.forEach(el => {
        const h = el.offsetHeight;
        if (h > maxH) maxH = h;
      });
      if (maxH > 0) {
        cards.forEach(el => { el.style.height = maxH + 'px'; });
      }
    });
  });
}

let resizeObserver = null;

onMounted(() => {
  syncPolicyCardHeight();
  resizeObserver = new ResizeObserver(() => {
    syncPolicyCardHeight();
  });
  const container = document.querySelector('.vision-module4-bottom');
  if (container) {
    resizeObserver.observe(container);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

watch(cardData, () => {
  syncPolicyCardHeight();
}, { flush: 'post' });

function updateHoverData(data, index) {
  highlightedIndex.value = index;
  hoverData.value = data;
}

function cardHover(card) {
  hoveredCardKey.value = card.key;
}
function cardLeave() {
  hoveredCardKey.value = -1;
}
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.vision {

  &-module1 {
    margin-top: 5.4375rem;

    &-banner {
      position: relative;
      width: 100%;
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
        width: 78%;
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
          font-size: 6.6px;
          letter-spacing: 0;
        }
      }
    }
  }

  &-module2 {
    padding: 70px 0 170px 160px;
    display: flex;
    overflow: scroll;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
      display: none;
    }

    &-item-title {
      margin-bottom: 30px;
      width: 96px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      color: #fff;
      border: 1px solid #fff;
      border-radius: 100px;
    }

    &-item-text {
      margin-top: 29px;
      margin-left: 15px;

      li {
        position: relative;
        font-size: 24px;
        font-weight: 500;
        color: #fff;
        padding-left: 32px;

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

    &-item {
      margin-right: 16px;

      &-img {
        width: 824px;
        height: 450px;
        border-radius: 20px;
      }
    }

    &-right {
      &-img {
        width: 780px;
        height: 450px;
        border-radius: 20px;
      }
    }
  }

  &-module3 {
    width: 80%;

    &-w {
      display: flex;
      justify-content: center;
    }

    &-title {
      display: flex;
      gap: 16px;

      &-text1,
      &-text2 {
        font-size: 50px;
        font-weight: 500;
      }

      &-text1 {
        color: #ff7200;
      }

      &-text2 {
        color: #f1f3f7;
      }
    }

    &-content {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      color: transparent;
      z-index: 1;

      &-left {
        width: 35%;
        margin-right: 56px;

        &-list {
          padding: 8px 62px;

          &-w {
            text-align: center;
            width: 419px;
            min-height: 328px;
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
          }

          li {
            min-height: 63px;
            line-height: 1.5;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 0;
            box-sizing: border-box;
            font-size: 16px;
            font-weight: 500;
            color: #5d5f61;
            transition: color 0.3s ease;

            &:not(:last-child) {
              border-bottom: 0.4px solid #f1f3f7;
            }
          }

          .highlight {
            color: #ffffff;
          }
        }

        &-text {
          font-size: 20px;
          color: #fff;
        }

        &-more {
          margin-top: 50px;
          margin-bottom: 30px;
          width: 124px;
          height: 58px;
          line-height: 58px;
          text-align: center;
          font-size: 16px;
          color: #fff;
          border-radius: 209px;
          border: 1px solid transparent;
          background-image: linear-gradient(#181a1d, #12161b),
            linear-gradient(156.52deg,
              rgba(255, 255, 255, 0.4) 2.12%,
              rgba(255, 255, 255, 0.0001) 60%,
              rgba(255, 255, 255, 0.0001) 54%,
              rgba(255, 255, 255, 0.1) 93.02%);
          background-origin: border-box;
          background-clip: content-box, border-box;

          &-w{
            &:hover{
              text-decoration: none;
            }
          }
        }
      }

      &-right {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 55%;
        height: 520px;
        border-radius: 20px;
        border: 1px solid transparent;
        background-image: linear-gradient(#181a1d, #12161b),
          linear-gradient(140deg,
            rgba(255, 255, 255, 0.4) 40%,
            rgba(255, 255, 255, 0.0001) 60%,
            rgba(255, 255, 255, 0.0001) 70%,
            rgba(255, 255, 255, 0.1) 93.02%);
        background-origin: border-box;
        background-clip: content-box, border-box;

        &-content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 34px;

          img {
            width: 80px;
            height: 80px;
          }

          p {
            font-size: 80px;
            font-weight: 500;
            color: #ff7200;
            transition: all 0.3s ease;
          }
        }
      }
    }

    &-grid {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 76%;
      height: 468px;
      z-index: 0;
      /* 确保网格图在下面 */
    }

    &-trend {
      position: absolute;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 386px;
      z-index: 0;
      /* 确保Mint图在网格图下面 */
    }
  }

  &-module4 {
    width: 80%;

    &-w {
      display: flex;
      justify-content: center;
      margin-top: 170px;
    }

    &-top {
      margin-bottom: 88px;
      display: flex;

      &-title-text1,
      &-title-text2 {
        font-size: 50px;
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
        margin-left: 152px;

        &-text {
          font-size: 20px;
          color: #fff;
          line-height: 1.6;
        }
      }
    }

    &-bottom {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      align-items: stretch;
      gap: 20px;

      &-card {
        display: flex;
        width: 49%;
        min-height: 290px;
        box-sizing: border-box;
        font-size: 14px;
        color: #fff;
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
        overflow: hidden;

        .book-icon-img {
          width: 32px;
          height: 40px;
          margin-top: 36px;
          margin-left: 36px;
          flex-shrink: 0;
        }

        &-content {
          flex: 1;
          min-width: 0;
          margin-left: 24px;
          padding: 36px 36px 36px 0;
          overflow: hidden;
          text-align: left;

          &-text1 {
            margin: 0 0 18px;
            font-size: 20px;
            font-weight: 500;
            color: #f1f3f7;
          }

          &-tags {
            margin: 0 0 22px;
            font-size: 15px;
            line-height: 1.6;
            color: #ff7200;
          }

          &-text2 {
            margin: 0;
            font-size: 16px;
            color: #f1f3f7;
          }
        }
      }
    }
  }
}
</style>
