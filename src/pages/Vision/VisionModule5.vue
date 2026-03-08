<template>
  <div class="vision-module5 sector border-gradient">
    <div v-intersect="() => titleInView = true">
      <div v-if="titleInView" class="vision-module5-title animate__animated animate__fadeInUp">
        <p class="vision-module5-title-text1 animate__animated animate__flipInX animate__slow">60%</p>
        <p class="vision-module5-title-text2">
          {{ getText('vision.title60') }}<br />{{ getText('vision.subtitle60') }}
        </p>
      </div>
    </div>
    <div class="vision-module5-content">
      <div v-intersect="() => img1InView = true" class="vision-module5-content-img1-w">
        <div v-if="img1InView" class="vision-module5-content-img1 animate__animated animate__fadeInUp">
          <p class="vision-module5-content-img1-title">
            {{ getText('vision.productSolution') }}
          </p>
          <p class="vision-module5-content-img1-desc">
            {{ getText('vision.productSolutionDesc') }}
          </p>
        </div>
      </div>
      <div v-intersect="() => img2InView = true" class="vision-module5-content-img2">
        <div v-if="img2InView" class="vision-module5-content-img2-item1 animate__animated animate__fadeInUp">
          <p class="vision-module5-content-img2-item1-text">{{ getText('nav.material') }}</p>
          <router-link :to="`/material`">

            <p class="learn-more-btn">{{ getText('common.buttons.learnMore') }}</p>
          </router-link>
        </div>
        <div v-if="img2InView" class="vision-module5-content-img2-item2 animate__animated animate__fadeInUp">
          <p class="vision-module5-content-img2-item2-text">{{ getText('nav.aminoAcid') }}</p>
          <router-link :to="`/aminoAcid`">
            <p class="learn-more-btn">{{ getText('common.buttons.learnMore') }}</p>
          </router-link>
        </div>
      </div>
      <div v-intersect="() => img3InView = true" class="vision-module5-content-img3-w">
        <div v-if="img3InView" class="vision-module5-content-img3 animate__animated animate__fadeInUp">
          <p class="vision-module5-content-img3-title">
            {{ getText('vision.customSolution') }}
          </p>
          <p class="vision-module5-content-img3-desc">
            {{ getText('vision.customSolutionDesc') }}
          </p>
          <p class="vision-module5-content-img3-btn" @click="triggerPopover">{{ getText('vision.matchAdvisor') }}</p>
        </div>
      </div>
      <div v-intersect="() => img4InView = true" class="vision-module5-content-img4">
        <div v-if="img4InView" class="vision-module5-process animate__animated animate__fadeInUp">
          <div class="vision-module5-process-title">{{ getText('vision.customProcess') }}</div>
          <div class="vision-module5-process-steps">
            <div class="vision-module5-process-step" v-for="n in 5" :key="n">
              <div class="step-dot-line">
                <span class="step-dot"></span>
                <span v-if="n < 5" class="step-line"></span>
              </div>
              <span class="step-number">Step 0{{ n }}</span>
              <span class="step-text">{{ getText('vision.step' + n) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import emitter from '@/event/event';
import { getText } from "@/utils/language";

const triggerPopover = () => {
  emitter.emit('open-popover');
};

const titleInView = ref(false);
const img1InView = ref(false);
const img2InView = ref(false);
const img3InView = ref(false);
const img4InView = ref(false);

</script>
<style lang="less" scoped>
@import "@/style/variable.less";

.vision-module5 {
  &-title {
    display: flex;
    justify-content: center;
    align-items: flex-end;

    &-text1 {
      font-size: 200px;
      font-weight: 500;
      color: #ff7200;
      line-height: 0.8;
      margin: 0;
    }

    &-text2 {
      font-size: 48px;
      font-weight: 500;
      color: #f1f3f7;
      line-height: 1;
      margin: 0;
    }
  }

  &-content {
    margin-top: 160px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    column-gap: 16px;
    row-gap: 100px;

    &-img1,
    &-img3 {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 60px;
      width: 100%;
      height: 100%;
      border-radius: 20px;
      box-sizing: border-box;

      &-w {
        width: 60%;
        height: 460px;
      }

      &-title {
        font-size: 30px;
        font-weight: 500;
        color: #f1f3f7;
        margin-bottom: 40px;
      }

      &-desc {
        font-size: 20px;
        color: #f1f3f7;
      }
    }

    &-img1 {
      background: url("./images/module5_img1.jpeg");
      background-size: cover;
      background-repeat: no-repeat;
    }

    &-img2 {
      width: 34%;

      &-item1,
      &-item2 {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 51px;
        border-radius: 20px;
        width: 100%;
        height: 222px;

        &-text {
          font-size: 24px;
          font-weight: 500;
          color: #fff;
        }
      }

      &-item1 {
        margin-bottom: 16px;
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
        cursor: pointer;
        width: 96px;
        height: 38px;
        line-height: 38px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        color: #f1f3f7;
        background-color: rgba(255, 114, 0, 0.8);
        border-radius: 209px;
      }
    }

    &-img3 {
      width: 100%;
      height: 100%;
      background: url("./images/module5_img4.png");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center;

      &-btn {
        cursor: pointer;
        margin-top: 87px;
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
    }

    &-img4 {
      width: 34%;
    }
  }

  &-process {
    background: rgba(30, 33, 38, 0.9);
    border-radius: 20px;
    padding: 40px 36px;
    height: 460px;
    box-sizing: border-box;

    &-title {
      font-size: 20px;
      font-weight: 500;
      color: #f1f3f7;
      margin-bottom: 36px;
    }

    &-steps {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    &-step {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .step-dot-line {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 10px;
        flex-shrink: 0;
        padding-top: 5px;
      }

      .step-dot {
        width: 10px;
        height: 10px;
        background: #00965A;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .step-line {
        width: 1px;
        height: 46px;
        background: rgba(241, 243, 247, 0.2);
      }

      .step-number {
        font-size: 16px;
        font-weight: 400;
        color: #f1f3f7;
        white-space: nowrap;
        font-family: Montserrat, MiSans, sans-serif;
        line-height: 20px;
      }

      .step-text {
        font-size: 16px;
        font-weight: 400;
        color: #00965A;
        white-space: nowrap;
        line-height: 20px;
      }
    }
  }
}
</style>