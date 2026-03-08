<template>
  <div class="aminoAcid">
    <BannerTitle>
      <div class="banner-title-content banner-title-content-mobile">
        <div class="banner-title-zh">{{ getText('bannerTitle.aminoAcid.line1') }}</div>
        <div class="banner-title-en">{{ getText('bannerTitle.aminoAcid.line3') }}</div>
        <div class="banner-title-zh">{{ getText('bannerTitle.aminoAcid.line2') }}</div>
      </div>
    </BannerTitle>

    <div class="aminoAcid-module1">
      <div class="aminoAcid-module1-content">
        <div class="aminoAcid-module1-content-top">
          <p class="aminoAcid-module1-content-top-text1">{{ getText('aminoAcid.title1') }}</p>
          <p class="aminoAcid-module1-content-top-text2">{{ getText('aminoAcid.title2') }}</p>
        </div>
        <div class="aminoAcid-module1-content-bottom">
          <span v-for="(feat, i) in getText('aminoAcid.features')" :key="i">{{ feat }}</span>
        </div>
      </div>
    </div>
    <div class="mouse-scroll">
      <MouseScrollM :modules="module2Data" :originHeight="600">
        <template #item-content="{ module, index }">
          <aa-module-content-mobile :title="module.title" :topItems="module.topItems"
            :introductionTitle1="module.introductionTitle1" :introductionTitle2="module.introductionTitle2"
            :applyTexts="module.applyTexts" :advantages="module.advantages" :imageUrl="module.imageUrl"
            :isRow="module.isRow" :tabStyle="getTabStyleData(index)"></aa-module-content-mobile>
        </template>
      </MouseScrollM>
    </div>

    <div class="aminoAcid-module3 border-gradient" :style="{ marginTop: '100px' }">
      <div class="aminoAcid-module3-title">
        <span class="orange-text">{{ getText('aminoAcid.applicationCase') }}</span>
        <span>{{ getText('aminoAcid.applicationCase2') }}</span>
      </div>
      <div class="aminoAcid-module3-content">
        <div class="second">
          <div class="second-left">
            <p>{{ getText('aminoAcid.muyuanGroup') }}</p>
            <p>{{ getText('aminoAcid.andMint') }}</p>
          </div>
          <p class="second-right">
            {{ getText('aminoAcid.knotWeedSolution') }}
          </p>
        </div>
        <ul class="third">
          <li>{{ getText('aminoAcid.benefit1') }}</li>
          <li>{{ getText('aminoAcid.benefit2') }}</li>
          <li>{{ getText('aminoAcid.benefit3') }}</li>
        </ul>
      </div>
      <Propagate />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import BannerTitle from '@/components/BannerTitle'
import MouseScrollM from '@/components/MouseScrollM';
import Propagate from '@/components/Propagate';
import AaModuleContentMobile from "@/components/AaModuleContentMobile";
import { getText } from "@/utils/language";


export default {
  components: {
    BannerTitle,
    MouseScrollM,
    AaModuleContentMobile,
    Propagate
  },
  setup() {
    const module2Data = computed(() => {
      const list = getText('aminoAcid.productList');
      return [
        {
          title: list[1].fullName,
          topItems: ["Brilliant", "MiNT BiO", "BioAmino"],
          introductionTitle1: list[1].prefix,
          introductionTitle2: list[1].name,
          applyTexts: list[1].fields,
          advantages: list[1].advantages,
          imageUrl: ["assets/AminoAcid/module2_ele1.png"],
        },
        {
          title: list[0].fullName,
          topItems: ["Brilliant", "MiNT BiO", "BioAmino"],
          introductionTitle1: list[0].prefix,
          introductionTitle2: list[0].name,
          applyTexts: list[0].fields,
          advantages: list[0].advantages,
          imageUrl: ["assets/AminoAcid/module2_ele2.png"],
        },
      ];
    });


    const getTabStyleData = (index) => {
      const marginLeft = index === 0 ? "1%" : `${1 + index * 19.7}%`;

      return {
        marginLeft: marginLeft,
        zIndex: index,
      };
    };
    return {
      module2Data,
      getTabStyleData,
      getText,
    };
  },
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.mouse-scroll {
  width: 370px;
  margin-top: 100px;
  height: 600px;
}

.aminoAcid {
  padding: 60px 5px;

  .banner-title-content-mobile {
    text-align: center;
    display: flex;
    align-items: center;
    gap: 8px;
    .banner-title-zh {
      font: 600 32px MiSans;
      color: #ffffff;
      letter-spacing: 2px;
    }
    .banner-title-en {
      font: 600 10px Montserrat;
      color: rgba(241, 243, 247, 0.8);
      text-align: center;
      width: 50px;
      word-break: break-word;
      line-height: 1.4;
    }
  }

  &-module1 {
    padding-bottom: 60px;

    &-content {
      &-top {
        border-radius: 12px;
        width: 100%;
        background-image: url("@/assets/AminoAcid/banner1.png");
        background-size: cover;
        background-repeat: no-repeat;
        margin-top: 60px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;

        &-text1 {
          flex-shrink: 0;
          font-size: 50px;
          font-weight: 500;
          color: #ff7200;
        }

        &-text2 {
          flex-shrink: 0;
          margin-left: 120px;
          font-size: 50px;
          font-weight: 500;
          color: #fff;
        }
      }

      &-bottom {
        padding: 10px 20px;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        span {
          border-radius: 20px;
          text-align: center;
          color: #f1f3f7;
          border: 1px solid #F1F3F799;
          padding: 13px 20px;

        }
      }
    }
  }

  &-module3 {
    padding: 60px 0;
    display: flex;
    flex-direction: column;

    &-title {
      padding-left: 45px;
      font-size: 25px;
      font-weight: 450;
      text-align: left;
      color: white;

      .orange-text {
        color: #ff7200;
      }
    }

    &-content {
      margin: 20px 0;
      padding-left: 45px;

      .second {
        color: #f1f3f7;
        font-size: 16px;
        font-weight: 450;
        text-align: left;
        display: flex;

        &-left {
          margin-right: 16px;
        }

        &-right {
          color: #ff7200;
        }
      }

      .third {
        margin-top: 20px;
        color: white;
        font-size: 12px;
        font-weight: 450;
        text-align: left;
        display: flex;
        gap: 8px;

        li::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 5px;
          background-color: white;
          border-radius: 50%;
          margin-right: 5px;
        }
      }

    }


  }
}
</style>