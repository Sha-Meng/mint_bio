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
  &-step {
    margin-bottom: 60px;
    padding: 0 10px;
    color: #f2f3f7;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .title {
      font-size: 16px;
      text-align: left;
      margin-right: 4px;
      height: 36px;
      line-height: 40px;
    }

    .number {
      font-size: 24px;
      font-weight: 330;
      line-height: 38.4px;
      text-align: left;
    }

    .text {
      font-size: 14px;
      text-align: left;
      height: 36px;
      line-height: 38px;
      margin-left: 4px;
    }
  }

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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 10px;
    gap: 16px;

    &-img1,
    &-img3 {
      width: 290px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-radius: 12px;

      &-title {
        width: 340px;
        font-size: 20px;
        font-weight: 500;
        color: #f1f3f7;
        margin-bottom: 20px;
      }

      &-desc {
        font-size: 14px;
        color: #f1f3f7;
        width: 266px;
        margin-left: 0;
        line-height: 22px;
      }
    }

    &-img1 {
      background: url("./images/module5_img1.jpeg");
      background-size: cover;
      background-repeat: no-repeat;
      border-radius: 12px;
    }

    &-img2 {
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: 16px;


      &-item1,
      &-item2 {
        padding: 40px;
        width: 180px;
        height: 160px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        &-text {
          text-align: center;
          width: 80px;
          font-size: 20px;
          line-height: 28px;
          font-weight: 500;
          color: #fff;
        }
      }

      &-item1 {
        background: url("./images/module5_img2.png");
        background-size: cover;
        background-repeat: no-repeat;
      }

      &-item2 {
        background: url("./images/module5_img3.jpeg");
        background-size: cover;
        background-repeat: no-repeat;
      }

      .learn-more-btn {
        width: 6rem;
        height: 2.375rem;
        line-height: 2.375rem;
        text-align: center;
        font-size: 0.875rem;
        font-weight: 500;
        color: #f1f3f7;
        background: rgba(40, 40, 40, 0.6226);
        border-radius: 13.0625rem;
        border: 1px solid;
        border-image-source: linear-gradient(156.52deg, rgba(255, 255, 255, 0.5) 2.12%, rgba(255, 255, 255, 0.0001) 39%, rgba(255, 255, 255, 0.0001) 54.33%, rgba(255, 255, 255, 0.2) 93.02%);
      }
    }

    &-img3 {
      background: url("./images/module5_img4.png");
      background-size: cover;
      background-repeat: no-repeat;

      &-btn {
        margin-top: 5.4375rem;
        width: 7.75rem;
        height: 3.625rem;
        line-height: 3.625rem;
        text-align: center;
        font-size: 1rem;
        font-weight: 500;
        color: #f1f3f7;
        background-color: rgba(40, 40, 40, 0.62);
        border-radius: 13.0625rem;
      }
    }

    &-img4 {
      img {
        width: 464px;
        height: 460px;
      }
    }

    .last-box {
      padding: 60px 40px 40px;
      color: #f2f3f7;
      margin-top: 10px;

      &-btn {
        margin-top: 40px;
        width: 72px;
        height: 29px;
        font-size: 12px;
        line-height: 29px;
      }

    }
  }
}
</style>