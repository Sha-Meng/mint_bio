<template>
  <div class="vision-module5">
    <div class="vision-module5-title">
      <p class="vision-module5-title-text1">60%</p>
      <p class="vision-module5-title-text2">
        {{ getText('vision.title60') }}<br />{{ getText('vision.subtitle60') }}
      </p>
    </div>
    <div class="vision-module5-content">
      <div class="vision-module5-content-img1">
        <p class="vision-module5-content-img1-title">
          {{ getText('vision.productSolution') }}
        </p>
        <p class="vision-module5-content-img1-desc">
          {{ getText('vision.productSolutionDesc') }}
        </p>
      </div>
      <div class="vision-module5-content-img2">
        <div class="vision-module5-content-img2-item1">
          <p class="vision-module5-content-img2-item1-text">{{ getText('nav.material') }}</p>
          <router-link :to="`/material`">
            <p class="learn-more-btn">{{ getText('common.buttons.learnMore') }}</p>
          </router-link>
        </div>
        <div class="vision-module5-content-img2-item2">
          <p class="vision-module5-content-img2-item2-text">{{ getText('nav.aminoAcid') }}</p>
          <router-link :to="`/aminoAcid`">

            <p class="learn-more-btn">{{ getText('common.buttons.learnMore') }}</p>
          </router-link>
        </div>
      </div>
      <div class="vision-module5-content-img3 last-box">
        <p class="vision-module5-content-img3-title">
          {{ getText('vision.customSolution') }}
        </p>
        <p class="vision-module5-content-img3-desc">
          {{ getText('vision.customSolutionDesc') }}
        </p>
        <p class="vision-module5-content-img3-btn last-box-btn" @click="triggerPopover">{{ getText('vision.matchAdvisor') }}</p>
      </div>


      <div class="vision-module5-step">
        <div class="title">{{ getText('vision.customProcess') }}</div>
        <div><span class="number">01</span><span class="text">{{ getText('vision.step1') }}</span></div>
        <div><span class="number">02</span><span class="text">{{ getText('vision.step2') }}</span></div>
        <div><span class="number">03</span><span class="text">{{ getText('vision.step3') }}</span></div>
        <div><span class="number">04</span><span class="text">{{ getText('vision.step4') }}</span></div>
        <div><span class="number">05</span><span class="text">{{ getText('vision.step5') }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import emitter from '@/event/event';
import { getText } from "@/utils/language";

const triggerPopover = () => {
  emitter.emit('open-popover');
};
</script>


<style lang="less" scoped>
.vision-module5 {
  &-title {
    margin: 60px auto;
    display: flex;
    justify-content: center;
    align-items: flex-end;

    &-text1 {
      font-size: 64px;
      font-weight: 500;
      color: #ff7200;
      line-height: 0.8;
      margin: 0;
    }

    &-text2 {
      margin-left: 20px;
      font-size: 15px;
      font-weight: 500;
      color: #f1f3f7;
      line-height: 20px;

    }
  }

  &-content {
    width: calc(100% - 50px);
    max-width: 370px;
    margin: 0 auto;
    padding: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 16px;

    > div {
      box-sizing: border-box;
      min-width: 0;
    }

    &-img1,
    &-img3 {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: #f1f3f7;
      overflow: hidden;

      &-title {
        width: auto;
        margin: 0;
        font-weight: 500;
        color: #f1f3f7;
      }

      &-desc {
        width: auto;
        margin: 0;
        color: #f1f3f7;
      }
    }

    &-img1 {
      min-height: 124px;
      padding: 32px 40px 28px;
      background: url("./images/module5_img1.jpeg");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 8px;

      &-title {
        margin-bottom: 12px;
        font-size: 18px;
        line-height: 1.35;
      }

      &-desc {
        font-size: 12px;
        line-height: 21px;
        font-weight: 500;
      }
    }

    &-img2 {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;

      &-item1,
      &-item2 {
        width: 100%;
        min-width: 0;
        height: 168px;
        padding: 34px 12px 16px;
        box-sizing: border-box;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;

        &-text {
          text-align: center;
          width: 100%;
          max-width: 96px;
          margin: 0;
          font-size: 16px;
          line-height: 22px;
          font-weight: 500;
          color: #fff;
        }
      }

      &-item1 {
        background: url("./images/module5_img2.png");
        background-size: 185% auto;
        background-position: 44% 44%;
      }

      &-item2 {
        background: url("./images/module5_img3.jpeg");
        background-size: 190% auto;
        background-position: 48% 42%;
      }

      .learn-more-btn {
        width: 72px;
        height: 29px;
        margin: 0;
        line-height: 29px;
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        color: #f1f3f7;
        background: rgba(40, 40, 40, 0.6226);
        border-radius: 209px;
        border: 1px solid;
        border-image-source: linear-gradient(156.52deg, rgba(255, 255, 255, 0.5) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.2) 93.02%);
      }
    }

    &-img3 {
      min-height: 205px;
      padding: 58px 40px 28px;
      border-radius: 8px;
      background: url("./images/module5_img4.png");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;

      &-title {
        margin-bottom: 18px;
        font-size: 18px;
        line-height: 1.35;
      }

      &-desc {
        font-size: 12px;
        line-height: 21px;
        font-weight: 500;
      }

      &-btn {
        width: 72px;
        height: 29px;
        margin-top: 18px;
        line-height: 29px;
        text-align: center;
        font-size: 12px;
        font-weight: 500;
        color: #f1f3f7;
        background-color: rgba(40, 40, 40, 0.62);
        border-radius: 209px;
      }
    }

    .last-box {
      color: #f2f3f7;
      margin-top: 10px;
    }
  }

  &-step {
    width: 100%;
    max-width: 370px;
    box-sizing: border-box;
    margin: 0 auto 60px;
    padding: 0 20px;
    color: #f2f3f7;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    column-gap: 16px;
    row-gap: 8px;

    > div {
      flex: 0 0 auto;
      display: flex;
      align-items: baseline;
      height: 28px;
    }

    .title {
      height: 28px;
      margin-right: 0;
      font-size: 14px;
      line-height: 28px;
      font-weight: 500;
    }

    .number {
      font-size: 24px;
      font-weight: 330;
      line-height: 28px;
      text-align: left;
    }

    .text {
      height: 28px;
      margin-left: 4px;
      font-size: 12px;
      line-height: 28px;
      white-space: nowrap;
    }
  }
}
</style>
