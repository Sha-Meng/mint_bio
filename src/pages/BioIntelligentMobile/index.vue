<template>
  <div>
    <BannerTitleAnimationMobile :backgroundImg="require('@/assets/BioIntelligent/module1_bg.jpeg')" :isShowHeader="false">
      <div class="banner-title-content banner-title-content-mobile">
        <div class="banner-title-zh">{{ getText('bannerTitle.bioIntelligent.line1') }}</div>
        <div class="banner-title-zh highlight">{{ getText('bannerTitle.bioIntelligent.line2') }}</div>
        <div class="banner-title-en">{{ getText('bannerTitle.bioIntelligent.line3') }}</div>
      </div>
    </BannerTitleAnimationMobile>
    <div class="platform-intro-divider mt120"></div>

    <section class="platform-intro">
      <p>{{ getText('bioIntelligent.platformIntro.paragraph1') }}</p>
      <p>{{ getText('bioIntelligent.platformIntro.paragraph2') }}</p>
    </section>

    <div class="platform-intro-divider"></div>

    <div class="part2">
      <div class="title">
        <span class="first-text">0~1</span>
        <span class="orange-text">{{ getText('bioIntelligent.researchTitle') }}</span>
        <span>{{ getText('bioIntelligent.to') }}</span>
        <span class="orange-text"> {{ getText('bioIntelligent.industryTitle') }}</span>
        <span class="last-text">1~&infin;</span>
      </div>
      <div class="swiper-content2">
        <Swiper :caseList="caseList" :topTip="topTip" :bottomTip="bottomTip">
          <template #item-content="{ item }">
            <img :src="item.imgSrc" class="part2-list-item-img">
            <div class="part2-list-item-title">{{ item.title }}</div>
            <div class="part2-list-item-describe">{{ item.describe }}</div>
          </template>
        </Swiper>
      </div>
    </div>

    <div class="part3">
      <div class="title">
        <span class="first-text">{{ getText('bioIntelligent.understandTitle1') }}</span>
        <span class="orange-text">{{ getText('bioIntelligent.understandTitle2') }}</span>
      </div>
      <div class="swiper-content3">
        <Swiper :caseList="caseList2" :topTip="topTip3">
          <template #item-content="{ item }">
            <img :src="item.url" class="part3-list-item-img">
            <div class="part3-list-item-title">{{ item.title }}</div>
            <div class="part3-list-item-describe">{{ item.description }}</div>
          </template>
        </Swiper>
      </div>
    </div>
    <div class="part4">
      <img src="@/assets/images/part4.png" alt="">
    </div>
    <VisionModule5 />
    <div class="part6">
      <div class="title"><span>{{ getText('bioIntelligent.baseTitle') }}</span><span class="orange-text">{{ getText('bioIntelligent.baseSuffix') }}</span></div>
      <img src="@/assets/images/base-1.png" alt="">
      <img src="@/assets/images/base-2.png" alt="">
      <img src="@/assets/images/base-3.png" alt="">
    </div>

  </div>
</template>

<script>
import Swiper from "@/components/Swiper";
import VisionModule5 from "@/pages/VisionMobile/VisionModule5";

import BannerTitleAnimationMobile from "@/components/BannerTitleAnimationMobile";
import { getText } from "@/utils/language";
export default {
  name: "MintHome",
  components: {
    BannerTitleAnimationMobile,
    Swiper,
    VisionModule5
  },
  setup() {
    return {};
  },
  data() {
    return {
      topTip: ['N 30.2741°', 'MiNT BiO', 'China'],
      bottomTip: ['Hangzhou', 'LAB&IND', 'E 120.1552°'],
      topTip3: ['China', 'MiNT BiO', 'Hangzhou'],
    };
  },
  computed: {
    caseList() {
      return [
        {
          title: getText('bioIntelligent.research0to1Mobile'),
          describe: getText('bioIntelligent.research0to1Desc'),
          imgSrc: require("@/assets/BioIntelligent/Laboratory.png"),
        },
        {
          title: getText('bioIntelligent.industry1toInfMobile'),
          describe: getText('bioIntelligent.industry1toInfDesc'),
          imgSrc: require("@/assets/BioIntelligent/Industry.png"),
        },
      ];
    },
    caseList2() {
      const featureKeys = ['renewable', 'aiProtein', 'engine', 'massProduction', 'application'];
      const featureUrls = [
        require("@/assets/BioIntelligent/swipper1.png"),
        require("@/assets/BioIntelligent/swipper2.png"),
        require("@/assets/BioIntelligent/swipper3.png"),
        require("@/assets/BioIntelligent/swipper3.png"),
        require("@/assets/BioIntelligent/swipper3.png"),
      ];
      return featureKeys.map((key, i) => ({
        url: featureUrls[i],
        title: getText(`bioIntelligent.features.${key}.title`),
        description: getText(`bioIntelligent.features.${key}.desc`),
      }));
    },
  },
  methods: {
    getText,
  },
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.banner-title-content-mobile {
  text-align: center;
  .banner-title-zh {
    font: 600 28px MiSans;
    color: #ffffff;
    letter-spacing: 2px;
    &.highlight { color: #FF7200; }
  }
  .banner-title-en {
    font: 400 12px Montserrat;
    color: rgba(241, 243, 247, 0.8);
    margin-top: 4px;
  }
}

.part1 {
  width: 100%;
  height: 1282px;
  background-color: #000;

  text {
    color: #ececee;
  }
}

.platform-intro {
  background-color: #11161b;
  padding: 28px 20px 36px;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
    color: #f1f3f7;
    font-weight: 400;
    text-align: left;

    & + p {
      margin-top: 14px;
    }
  }
}

.platform-intro-divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(to right,
      rgba(53, 52, 74, 1) 0%,
      rgba(53, 52, 74, 0.5) 33%,
      rgba(255, 255, 255, 1) 58%,
      rgba(255, 255, 255, 1) 60%,
      rgba(53, 52, 74, 0.5) 67%,
      rgba(53, 52, 74, 1) 100%);
}

.part2 {
  padding: 60px 0px;

  .title {
    font-size: 25px;
    color: #fff;
    text-align: center;

    .first-text {
      margin-right: 10px;
    }

    .orange-text {
      color: #ff8c00;
    }

    .last-text {
      margin-left: 10px;
    }
  }

  .swiper-content2 {
    margin-top: 40px;

    .part2-list-item {


      &-img {
        width: 276px;
        height: 233px;
        border-radius: 6px;
        object-fit: cover;
        margin-top: 20px;
      }

      &-title {
        font-size: 14px;
        text-align: left;
        margin: 20px 0;
        color: #F1F3F7;
        white-space: normal;
      }

      &-describe {
        font-size: 12px;
        line-height: 15.91px;
        text-align: left;
        color: #F1F3F7;
        white-space: normal;
        margin-bottom: 40px;
      }
    }
  }
}

.part3 {
  height: auto;
  padding: 60px 0px;

  .title {
    font-size: 25px;
    color: #fff;
    text-align: center;

    .first-text {
      margin-right: 10px;
    }

    .orange-text {
      color: #ff8c00;
    }

  }

  .swiper-content3 {
    margin-top: 40px;

    .part3-list-item {


      &-img {
        width: 276px;
        height: 233px;
        border-radius: 6px;
        object-fit: cover;
        margin-top: 20px;
      }

      &-title {
        font-size: 14px;
        text-align: left;
        margin: 20px 0;
        color: #F1F3F7;
        white-space: normal;
      }

      &-describe {
        font-size: 12px;
        line-height: 15.91px;
        text-align: left;
        color: #F1F3F7;
        white-space: normal;
        margin-bottom: 40px;
      }
    }
  }
}

.part4 {
  padding: 60px 5px;

  img {
    width: 100%;
  }
}

.part6 {
  padding: 60px 5px;

  .title {
    color: #fff;
    font-size: 25px;
    font-weight: 450;
    text-align: center;
    margin-bottom: 60px;

    .orange-text {
      color: #ff8c00;
      margin-left: 20px;
    }

  }

  img {
    width: 100%;
    margin: 16px auto;
  }
}

.line2 {
  height: 1px;
  width: 100%;
  background-image: linear-gradient(to right,
      #35344a 30%,
      #666666 50%,
      #35344a 70%);
}

.line3 {
  height: 1px;
  width: 100%;
  background: rgba(49, 49, 50, 1);
}

.mt120 {
  margin-top: 120px;
}
</style>
