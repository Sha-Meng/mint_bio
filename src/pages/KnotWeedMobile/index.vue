<template>
  <div class="knotWeed">

    <BannerTitle>
      <div class="knotWeed-title-text">
        <div class="knotWeed-title-text-top">
          {{ getText('knotWeed.importIntro') }}
          <span>{{ getText('knotWeed.importAmount') }}</span>
          {{ getText('knotWeed.importUnit') }}
        </div>
        <div class="knotWeed-title-text-bottom">
          <span>52%</span>
          {{ getText('knotWeed.importPurpose') }}
        </div>
      </div>
    </BannerTitle>
    <!-- <div class="knotWeed-title">
      <img class="grid-image" src="@/assets/images/grid1.png" alt="knotWeed_grid" />
      <img class="mint-image" src="@/assets/images/mint.png" alt="knotWeed_mint" />
      <div class="knotWeed-title-text">
        <p class="knotWeed-title-text-top">
          {{ getText('knotWeed.importIntro') }}
          <span>{{ getText('knotWeed.importAmount') }}</span>
          {{ getText('knotWeed.importUnit') }}
        </p>
        <p class="knotWeed-title-text-bottom">
          <span>52%</span>
          {{ getText('knotWeed.importPurpose') }}
        </p>
      </div>
    </div> -->

    <div class="knotWeed-module1-w mobile-sector">
      <div class="knotWeed-module1">
        <div class="knotWeed-module1-title">
          <p>{{ getText('knotWeed.title1') }}</p>
          <p class="knotWeed-module1-title-replace">{{ getText('knotWeed.title2') }}</p>
          <p>{{ getText('knotWeed.title3') }}</p>
        </div>
        <div class="knotWeed-module1-desc">
          <p>{{ getText('knotWeed.desc') }}</p>
        </div>
      </div>
    </div>

    <div class="knotWeed-module2">
      <Propagate />
      <div class="knotWeed-module2-advantage">
        <span>{{ getText('knotWeed.benefit1') }}</span>
        <span>{{ getText('knotWeed.benefit2') }}</span>
        <span>{{ getText('knotWeed.benefit3') }}</span>
      </div>
    </div>
    <MiNTDivider :content="'+'"></MiNTDivider>

    <div class="knotWeed-module3-w mobile-sector">
      <div class="knotWeed-module3">
        <div class="knotWeed-module3-title">
          <p>{{ getText('knotWeed.helpTitle') }}</p>
          <p>{{ getText('knotWeed.helpSubtitle') }}</p>
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
import Propagate from "@/components/Propagate";
import BannerTitle from "@/components/BannerTitle";
import emitter from '@/event/event';
import { getText } from "@/utils/language";

export default {
  components: {
    MiNTDivider,
    Propagate,
    BannerTitle
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

    const triggerPopover = () => {
      emitter.emit('open-popover');
    };

    return {
      knotData,
      triggerPopover,
      getText,
    };
  },
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

/* 样式部分保持不变 */
.knotWeed {
  padding: 0 10px;

  &-title {

    &-text {
      width: 317px;
      font-size: 20px;
      font-weight: 500;

      &-top {
        height: 36px;
        color: #ffffff73;

        span {
          font-size: 20px;
        }
      }

      &-bottom {
        color: rgba(236, 236, 238, 0.8);

        span {
          font-size: 20px;
        }
      }
    }
  }

  &-module1 {
    height: 224px;
    background-image: url("@/assets/KnotWeed/banner1.jpeg");
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 12px;
    border: 1px solid #ffffff33;

    &-title {
      margin-top: 60px;
      margin-left: 60px;
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: 500;
      color: #fff;

      &-replace {
        width: 48px;
        text-align: center;
        color: #ff7200;
      }
    }

    &-desc {
      margin-left: 10px;
      margin-top: 20px;
      font-size: 16px;
      font-weight: 500;
      color: #fff;
    }
  }

  &-module2 {

    &-advantage {
      color: #f1f3f7;
      display: flex;
      gap: 16px;
      font-size: 12px;
      font-weight: 450;
      line-height: 16.8px;
      text-align: left;
      margin: 20px 0 40px 32px;

      span {
        display: flex;
        align-items: center;
      }

      span::before {
        content: "";
        width: 4px;
        height: 4px;
        background-color: #f6f3f0;
        display: inline-block;
        border-radius: 50%;
        margin-right: 4px;
      }

    }
  }

  &-module3 {
    padding: 60px 0 60px 46px;

    &-title {
      margin-bottom: 40px;
      font-size: 25px;
      font-weight: 500;
      color: #f1f3f7;
    }

    &-counselor {
      margin-top: 10px;
      width: 72px;
      height: 29px;
      font-size: 12px;
      line-height: 29px;
      text-align: center;
      font-weight: 500;
      color: #f1f3f7;
      background-color: rgba(40, 40, 40, 0.62);
      border-radius: 13.0625rem;
    }

    &-data {
      display: flex;
      flex-wrap: wrap;
      width: 87%;
      gap: 16px;

      &-item {

        &:nth-child(1),
        &:nth-child(3) {
          margin-right: 20px;
        }

        &-important {
          font-size: 40px;
          font-weight: 500;
          color: #ff7200;
        }

        &-content {
          font-size: 10px;
          color: #f1f3f7;
        }
      }
    }
  }
}
</style>
