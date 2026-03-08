<template>
  <div class="aminoAcid">
    <BannerTitle :titleImage="require('@/assets/AminoAcid/banner_title.png')" :titleStyle="titleStyle" />

    <div class="aminoAcid-module1">
      <div class="aminoAcid-module1-content">
        <div class="aminoAcid-module1-content-left">
          <p class="aminoAcid-module1-content-left-text1">{{ getText('aminoAcid.title1') }}</p>
          <p class="aminoAcid-module1-content-left-text2">{{ getText('aminoAcid.title2') }}</p>
        </div>
        <div class="aminoAcid-module1-content-right">
          <ul class="aminoAcid-module1-content-right-text">
            <li v-for="(feat, i) in getText('aminoAcid.features')" :key="i">{{ feat }}</li>
          </ul>
        </div>
      </div>
    </div>

    <MouseScroll :modules="module2Data" />

    <div class="aminoAcid-module3">
      <div v-intersect="() => titleInView = true">
        <div v-if="titleInView" class="aminoAcid-module3-title animate__animated animate__fadeInUp">
          <span class="aminoAcid-module3-title-text1">{{ getText('aminoAcid.applicationCase') }}</span>
          <span class="aminoAcid-module3-title-text2">{{ getText('aminoAcid.applicationCase2') }}</span>
        </div>
      </div>
      <div class="aminoAcid-module3-content">
        <div class="aminoAcid-module3-content-name">
          <p>{{ getText('aminoAcid.muyuanGroup') }}</p>
          <p>{{ getText('aminoAcid.andMint') }}</p>
        </div>
        <div class="aminoAcid-module3-content-solution">
          <p class="aminoAcid-module3-content-solution-title">
            {{ getText('aminoAcid.knotWeedSolution') }}
          </p>
          <ul class="aminoAcid-module3-content-solution-list">
            <li>{{ getText('aminoAcid.benefit1') }}</li>
            <li>{{ getText('aminoAcid.benefit2') }}</li>
            <li>{{ getText('aminoAcid.benefit3') }}</li>
          </ul>
        </div>
      </div>
      <div class="aminoAcid-module3-propagate">
        <div class="aminoAcid-module3-propagate-title">{{ getText('aminoAcid.knotWeedLabel') }}</div>
        <div class="aminoAcid-module3-propagate-target">
          <div class="aminoAcid-module3-propagate-target-top">
            <p>{{ getText('aminoAcid.slogan1') }}</p>
            <p>{{ getText('aminoAcid.slogan2') }}</p>
          </div>
          <div class="aminoAcid-module3-propagate-target-bottom">
            <p>
              Create Green Products <br />
              Benefiting Every Life
            </p>
          </div>
        </div>
        <div class="aminoAcid-module3-propagate-more">
          <router-link :to="`/knotWeed`">

            <p>{{ getText('common.buttons.learnMore') }}</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import BannerTitle from '@/components/BannerTitle'
import AaModuleContent from "@/components/AaModuleContent";
import MouseScroll from '@/components/MouseScroll';
import { getText } from "@/utils/language";

export default {
  components: {
    BannerTitle,
    AaModuleContent,
    MouseScroll,
  },
  setup() {
    const module2Data = computed(() => {
      const list = getText('aminoAcid.productList');
      return [
        {
          title: list[0].fullName,
          topItems: ["Brilliant", "MiNT BiO", "BioAmino"],
          introductionTitle1: list[0].prefix,
          introductionTitle2: list[0].name,
          applyTexts: list[0].fields,
          advantages: list[0].advantages,
          imageUrl: ["assets/AminoAcid/module2_ele2.png"],
        },
        {
          title: list[1].fullName,
          topItems: ["Brilliant", "MiNT BiO", "BioAmino"],
          introductionTitle1: list[1].prefix,
          introductionTitle2: list[1].name,
          applyTexts: list[1].fields,
          advantages: list[1].advantages,
          imageUrl: ["assets/AminoAcid/module2_ele1.png"],
        },
      ];
    });

    const titleInView = ref(false);
    const titleStyle = { top: "55%" }
    return {
      module2Data,
      titleInView,
      titleStyle,
      getText,
    };
  },
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.aminoAcid {
  padding: 0 160px;


  &-title {
    width: 988px;
    height: 468px;
    line-height: 468px;
    text-align: center;
    position: relative;

    &-content {
      display: flex;
      justify-content: center;
      gap: 54px;
      background: radial-gradient(123.44% 123.44% at 56.63% 100%,
          #ececee 6.77%,
          rgba(255, 255, 255, 0.45) 100%);
      background-clip: text;
      color: transparent;
      z-index: 1;

      &-text1,
      &-text3 {
        font-size: 90px;
        font-weight: 500;
        color: #ececee;
      }

      &-text2 {
        font-size: 24px;
        font-weight: 600;

        p {
          height: 23px;
        }
      }
    }

    .grid-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 665px;
      height: 470px;
      z-index: 0;
      /* 确保网格图在下面 */
    }

    .mint-image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 988px;
      height: 173px;
      z-index: 0;
      /* 确保Mint图在网格图下面 */
    }
  }

  &-module1 {
    margin-top: 87px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 600px;
    background-image: url("@/assets/AminoAcid/banner1.png");
    background-size: cover;
    background-repeat: no-repeat;
    border-radius: 20px;
    border: 1px solid #ffffff33;

    &-content {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0 80px;

      &-left {
        margin-top: 60px;

        &-text1 {
          font-size: 60px;
          font-weight: 500;
          color: #ff7200;
        }

        &-text2 {
          margin-left: 120px;
          font-size: 60px;
          font-weight: 500;
          color: #fff;
        }
      }

      &-right {
        background-color: #2828289f;
        backdrop-filter: blur(68px);
        border-radius: 20px;
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
          padding: 40px;

          li {
            position: relative;
            font-size: 24px;
            font-weight: 500;
            color: #f1f3f7;
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
      }
    }
  }

  &-module3 {
    display: flex;
    flex-direction: column;

    &-title {

      &-text1,
      &-text2 {
        font-size: 60px;
        font-weight: 500x;
      }

      &-text1 {
        color: #ff7200;
      }

      &-text2 {
        color: #f1f3f7;
      }
    }

    &-content {
      margin-top: 100px;
      margin-bottom: 60px;
      display: flex;
      gap: 217px;

      &-name {
        font-size: 40px;
        font-weight: 500;
        color: #f1f3f7;
      }

      &-solution {
        &-title {
          margin-bottom: 42px;
          font-size: 40px;
          font-weight: 500;
          color: #ff7200;
        }

        &-list {
          margin-left: 15px;

          li {
            position: relative;
            font-size: 20px;
            color: #f1f3f7;
            padding-left: 20px;

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
    }

    &-propagate {
      padding: 10% 14% 10% 10%;
      margin-bottom: 161px;
      display: flex;
      width: 100%;
      background-image: url("@/assets/AminoAcid/module3_bg.jpeg");
      background-size: cover;
      background-repeat: no-repeat;
      border-radius: 20px;
      box-sizing: border-box;

      &-title {
        width: 5.6%;
        font-size: 96px;
        font-weight: 500;
        color: #fff;
      }

      &-target {
        margin-left: 15%;
        width: 100%;

        &-top {
          margin-bottom: 37%;
          font-size: 74px;
          font-weight: 500;
          color: transparent;
          background-clip: text;
          background-image: linear-gradient(90deg,
              #6a3e1d 0%,
              #3e0603 30%,
              #000 50%,
              #000 100%);

          p:last-child {
            margin-left: 148px;
          }
        }

        &-bottom {
          font-family: Montserrat;
          font-size: 55px;
          font-weight: 600;
          color: transparent;
          background-clip: text;
          background-image: linear-gradient(200deg,
              #c47c66 0%,
              #fffffe 10%,
              #735546 40%,
              #463c26 60%,
              #605b34 80%,
              #efa085 90%,
              #373020 100%);
        }
      }

      &-more {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        width: 29%;

        p {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 103px;
          color: #f1f3f7;
          font-size: 25px;
          font-weight: 500;
          border-radius: 209px;
          border: 2.09px solid transparent;
          background-image: linear-gradient(#181a1d, #2828289f),
            linear-gradient(156.52deg,
              rgba(255, 255, 255, 0.4) 2.12%,
              rgba(255, 255, 255, 0.0001) 60%,
              rgba(255, 255, 255, 0.0001) 54%,
              rgba(255, 255, 255, 0.1) 93.02%);
          background-origin: border-box;
          background-clip: content-box, border-box;
        }
      }
    }
  }
}
</style>