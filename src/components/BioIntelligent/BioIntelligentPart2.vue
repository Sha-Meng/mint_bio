<template>
  <div class="part2 sector">
    <div v-intersect="() => titleInView = true">
      <div v-if="titleInView" class="label animate__animated animate__fadeInUp">
        <div class="label-top">
          <span class="labelBig labelOrange mr120">{{ getText('bioIntelligent.researchTitle') }}</span>
          <span class="labelBig labelOrange">{{ getText('bioIntelligent.industryTitle') }}</span>
        </div>
        <div>
          <span class="labelSmall labelWhite">0~1</span>
          <span class="labelBig labelWhite mlr30">{{ getText('bioIntelligent.to') }}</span>
          <span class="labelSmall labelWhite">1~&infin;</span>
        </div>
      </div>
    </div>

    <div class="card-container">
      <div
        @mouseover="hoverCard1"
        class="card first-card"
        :style="{ width: card1Size + '%', height: '100%' }"
      >
        <div class="card-title">LABORATORY</div>
        <div
          class="card-item first-card-item"
          :style="{ opacity: card1Opacity }"
        >
          <p class="card-item-title">{{ getText('bioIntelligent.research0to1') }}</p>
          <p class="card-item-content">
            {{ getText('bioIntelligent.research0to1Desc') }}
          </p>
        </div>
      </div>
      <div
        @mouseover="hoverCard2"
        class="card second-card"
        :style="{ width: card2Size + '%', height: '100%' }"
      >
        <div class="card-title">INDUSTRY</div>
        <div
          class="card-item second-card-item"
          :style="{ opacity: card2Opacity }"
        >
          <p class="card-item-title">{{ getText('bioIntelligent.industry1toInf') }}</p>
          <p class="card-item-content">
            {{ getText('bioIntelligent.industry1toInfDesc') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getText } from "@/utils/language";

const card1Size = ref(69);
const card2Size = ref(36);
const card1Opacity = ref(1);
const card2Opacity = ref(0);
const showCardTrans = ref(true);
const titleInView = ref(false);
function hoverCard1() {
  card1Size.value = 69;
  card2Size.value = 36;
  card1Opacity.value = 1;
  card2Opacity.value = 0;
  showCardTrans.value = true;
}

function hoverCard2() {
  card1Size.value = 36;
  card2Size.value = 69;
  card1Opacity.value = 0;
  card2Opacity.value = 1;
  showCardTrans.value = true;
}
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.part2 {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .label {
    height: 112px;
    text-align: center;
    margin-bottom: 100px;
    .label-top {
      height: 44px;
      line-height: 44px;
    }

    .labelBig {
      font-size: 60px;
    }

    .labelSmall {
      font-size: 36px;
    }

    .labelOrange {
      color: #ff7200;
    }

    .labelWhite {
      color: white;
    }
  }

  .card-container {
    display: flex;
    gap: 16px;
    width: 100%;
    height: 800px;

    .card {
      position: relative;
      display: inline-block;
      transition-property: width;
      transition-duration: 0.3s;
      width: 100%;
      height: 100%;
      border-radius: 20px;
    }
    .first-card {
      background: url("@/assets/BioIntelligent/Laboratory.png");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    .second-card {
      background: url("@/assets/BioIntelligent/Industry.png");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    .card-title {
      margin-top: 229px;
      font-size: 48px;
      color: #ffffff;
      text-align: center;
      font-family: Montserrat;
      font-weight: 700;
    }
    .card-item {
      width: 466px;
      height: 258px;
      background-color: #666666b2;
      border: 1px solid #999999;
      border-radius: 17px;
      padding: 52px 36px 62px 37px;
      box-sizing: border-box;
      transition: opacity 0.3s;
      .card-item-title {
        font-size: 30px;
        color: #ffffff;
      }
      .card-item-content {
        margin-top: 38px;
        font-size: 16px;
        color: #ffffff;
      }
    }
    .first-card-item {
      position: absolute;
      bottom: 20px;
      left: 20px;
    }
    .second-card-item {
      position: absolute;
      bottom: 20px;
      right: 20px;
    }
  }
}

.mr120 {
  margin-right: 120px;
}
.mlr30 {
  margin-left: 30px;
  margin-right: 30px;
}
</style>