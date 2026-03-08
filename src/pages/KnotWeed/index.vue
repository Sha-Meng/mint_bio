<template>
  <div class="knotWeed">
    <div class="knotWeed-title">
      <img class="grid-image" src="@/assets/images/grid1.png" alt="knotWeed_grid" />
      <img class="mint-image" src="@/assets/images/mint.png" alt="knotWeed_mint" />
      <div class="knotWeed-title-text">
        <p class="knotWeed-title-text-top">
          {{ getText('knotWeed.importIntro') }}
          <span>1亿</span>
          {{ getText('knotWeed.importUnit') }}
        </p>
        <p class="knotWeed-title-text-bottom">
          <span>52%</span>
          {{ getText('knotWeed.importPurpose') }}
        </p>
      </div>
    </div>

    <div v-intersect="() => module1InView = true" class="knotWeed-module1-w sector">
      <div v-if="module1InView" class="knotWeed-module1 animate__animated animate__zoomIn">
        <div class="knotWeed-module1-title animate__animated animate__fadeInUp">
          <p>{{ getText('knotWeed.title1') }}</p>
          <p class="knotWeed-module1-title-replace">{{ getText('knotWeed.title2') }}</p>
          <p>{{ getText('knotWeed.title3') }}</p>
        </div>
        <div class="knotWeed-module1-desc animate__animated animate__fadeInUp">
          <p>{{ getText('knotWeed.desc') }}</p>
        </div>
      </div>
    </div>
    <div v-intersect="() => module2InView = true" class="knotWeed-module2-w sector">
      <div v-if="module2InView" class="knotWeed-module2 animate__animated animate__zoomIn">
        <div class="knotWeed-module2-propagate animate__animated animate__fadeInUp">
          <div class="knotWeed-module2-propagate-title">{{ getText('knotWeed.label') }}</div>
          <div class="knotWeed-module2-propagate-target">
            <p>{{ getText('knotWeed.slogan1') }}</p>
            <p>{{ getText('knotWeed.slogan2') }}</p>
          </div>
        </div>
        <div class="knotWeed-module2-advantage">
          <div class="knotWeed-module2-advantage-content">
            <ul class="knotWeed-module2-advantage-content-text">
              <li>{{ getText('knotWeed.benefit1') }}</li>
              <li>{{ getText('knotWeed.benefit2') }}</li>
              <li>{{ getText('knotWeed.benefit3') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <MiNTDivider :content="'+'"></MiNTDivider>

    <div v-intersect="() => module3InView = true" class="knotWeed-module3-w sector">
      <div v-if="module3InView" class="knotWeed-module3 animate__animated animate__fadeInUp">
        <div class="knotWeed-module3-title-w">
          <div class="knotWeed-module3-title">
            <p>{{ getText('knotWeed.helpTitle') }}</p>
            <p class="">{{ getText('knotWeed.helpSubtitle') }}</p>
          </div>
          <p class="knotWeed-module3-counselor" @click="triggerPopover">{{ getText('knotWeed.matchAdvisor') }}</p>
        </div>
        <div class="knotWeed-module3-data">
          <div class="knotWeed-module3-data-item" v-for="item in knotData" :key="item.key">
            <p class="knotWeed-module3-data-item-important">
              {{ item.important }}
            </p>
            <p class="knotWeed-module3-data-item-content">{{ item.content }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import MiNTDivider from "@/components/Divider";
import emitter from '@/event/event';
import { getText } from "@/utils/language";

export default {
  components: {
    MiNTDivider,
  },
  setup() {
    const knotData = computed(() => {
      const stats = getText('knotWeed.stats') || [];
      return stats.map((s, i) => ({
        key: i,
        important: s.number,
        content: s.desc,
      }));
    });

    const module1InView = ref(false);
    const module2InView = ref(false);
    const module3InView = ref(false);

    const triggerPopover = () => {
      emitter.emit('open-popover');
    };

    return {
      knotData,
      module1InView,
      module2InView,
      module3InView,
      triggerPopover,
      getText
    };
  },
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

/* 样式部分保持不变 */
.knotWeed {
  &-title {
    height: 468px;
    line-height: 468px;
    text-align: center;
    position: relative;

    &-text {
      font-size: 70px;
      font-weight: 500;

      &-top {
        height: 130px;
        color: #ffffff73;

        span {
          font-size: 128px;
        }
      }

      &-bottom {
        color: rgba(236, 236, 238, 0.8);

        span {
          font-size: 128px;
        }
      }
    }

    .grid-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 34.5%;
      z-index: 0;
      /* 确保网格图在下面 */
    }

    .mint-image {
      position: absolute;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 52%;
      z-index: 0;
      /* 确保Mint图在网格图下面 */
    }
  }

  &-module1 {
    height: 100%;
    background-image: url("@/assets/KnotWeed/banner1.jpeg");
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 1.25rem;
    border: 1px solid #ffffff33;

    &-w {
      padding-bottom: 70px;
      height: 843px;
    }

    &-title {
      margin-top: 144px;
      margin-left: 60px;
      display: flex;
      align-items: center;
      font-size: 90px;
      font-weight: 500;
      color: #fff;

      &-replace {
        width: 130px;
        text-align: center;
        color: #ff7200;
      }
    }

    &-desc {
      margin-left: 60px;
      margin-top: 20px;
      font-size: 66px;
      font-weight: 500;
      color: #fff;
    }
  }

  &-module2 {
    padding: 135px 164px 134px 95px;
    height: 100%;
    display: flex;
    background-image: url("@/assets/AminoAcid/module3_bg.jpeg");
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 20px;
    box-sizing: border-box;

    &-w {
      padding-bottom: 150px;
      height: 843px;
    }

    &-propagate {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      &-title {
        font-size: 96px;
        font-weight: 500;
        color: #fff;
      }

      &-target {
        font-size: 74px;
        font-weight: 500;
        color: transparent;
        background-clip: text;
        background-image: linear-gradient(90deg,
            #000000 0%,
            #000 30%,
            #3e0603 40%,
            #000 50%,
            #3e0603 60%,
            #000 100%);

        p:last-child {
          margin-left: 148px;
        }
      }
    }

    &-advantage {
      margin-left: 10.625rem;
      display: flex;
      flex-direction: column;
      justify-content: center;

      &-content {
        width: 20.375rem;
        height: 12.125rem;
        background-color: #2828289f;
        backdrop-filter: blur(68px);
        border-radius: 1.25rem;
        border: 1px solid transparent;
        background-image: linear-gradient(#181a1d, #2828289f),
          linear-gradient(156.52deg,
            rgba(255, 255, 255, 0.4) 2.12%,
            rgba(255, 255, 255, 0.0001) 60%,
            rgba(255, 255, 255, 0.0001) 54%,
            rgba(255, 255, 255, 0.1) 93.02%);
        background-origin: border-box;
        background-clip: content-box, border-box;

        &-text {
          padding: 2.5rem;

          li {
            position: relative;
            font-size: 1.5rem;
            font-weight: 500;
            color: #f1f3f7;
            padding-left: 2rem;

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
              margin-bottom: 1rem;
              /* 每项之间的间隔 */
            }
          }
        }
      }
    }
  }

  &-module3 {
    &-w {
      padding-top: 132px;
      padding-bottom: 300px;
    }

    &-title {
      // margin-bottom: 200px;
      font-size: 60px;
      font-weight: 500;
      color: #f1f3f7;

      &-w{
        display: flex;
        align-items: center;
        margin-bottom: 200px;
      }

      p:last-child {
        margin-left: 240px;
      }
    }

    &-counselor {
      cursor: pointer;
      margin-left: 30px;
      width: 124px;
      height: 58px;
      line-height: 58px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
      color: #f1f3f7;
      background-color: rgba(40, 40, 40, 0.62);
      border-radius: 209px;
    }

    &-data {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      row-gap: 149px;
      column-gap: 369px;
      width: 100%;

      &-item {
        width: 388px;

        &:nth-child(1),
        &:nth-child(3) {
          margin-right: 120px;
        }

        &-important {
          font-size: 120px;
          font-weight: 500;
          color: #ff7200;
          white-space: nowrap;
        }

        &-content {
          font-size: 32px;
          color: #f1f3f7;
        }
      }
    }
  }
}
</style>