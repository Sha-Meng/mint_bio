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
      <div
        v-for="base in baseCards"
        :key="base.key"
        class="base-card"
      >
        <div class="base-card-header">
          <span>{{ base.name }}</span>
          <span>MiNT BiO</span>
          <span>{{ base.location }}</span>
        </div>
        <div class="base-card-image-wrap">
          <img :src="base.imgSrc" :alt="base.name" class="base-card-image">
          <div class="base-card-image-title">{{ base.name }} / {{ base.location }}</div>
        </div>
        <div
          class="base-card-metrics"
          :class="{ 'base-card-metrics-four': base.metrics.length === 4 }"
        >
          <div
            v-for="metric in base.metrics"
            :key="metric.label"
            class="base-card-metric"
          >
            <div class="base-card-metric-label">{{ metric.label }}</div>
            <div class="base-card-metric-value">{{ metric.value }}</div>
          </div>
        </div>
      </div>
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
    baseCards() {
      return [
        {
          key: 'hq',
          name: getText('bioIntelligent.bases.hq.name'),
          location: getText('bioIntelligent.bases.hq.location'),
          imgSrc: require("@/assets/BioIntelligent/hangzhou.jfif"),
          metrics: [
            {
              label: getText('bioIntelligent.bases.hq.patents'),
              value: getText('bioIntelligent.bases.hq.patentsMetric'),
            },
            {
              label: getText('bioIntelligent.bases.hq.team'),
              value: getText('bioIntelligent.bases.hq.teamMetric'),
            },
            {
              label: getText('bioIntelligent.bases.hq.rdCenter'),
              value: getText('bioIntelligent.bases.hq.rdCenterMetric'),
            },
          ],
        },
        {
          key: 'muyuan',
          name: getText('bioIntelligent.bases.muyuan.name'),
          location: getText('bioIntelligent.bases.muyuan.location'),
          imgSrc: require("@/assets/BioIntelligent/nanyang.jfif"),
          metrics: [
            {
              label: getText('bioIntelligent.bases.muyuan.area'),
              value: getText('bioIntelligent.bases.muyuan.areaMetric'),
            },
            {
              label: getText('bioIntelligent.bases.muyuan.capacity1'),
              value: getText('bioIntelligent.bases.muyuan.capacity1Metric'),
            },
            {
              label: getText('bioIntelligent.bases.muyuan.capacity2'),
              value: getText('bioIntelligent.bases.muyuan.capacity2Metric'),
            },
          ],
        },
        {
          key: 'jiande',
          name: getText('bioIntelligent.bases.jiande.name'),
          location: getText('bioIntelligent.bases.jiande.location'),
          imgSrc: require("@/assets/BioIntelligent/jiande.jfif"),
          metrics: [
            {
              label: getText('bioIntelligent.bases.jiande.area1'),
              value: getText('bioIntelligent.bases.jiande.area1Metric'),
            },
            {
              label: getText('bioIntelligent.bases.jiande.capacity1'),
              value: getText('bioIntelligent.bases.jiande.capacity1Metric'),
            },
            {
              label: getText('bioIntelligent.bases.jiande.area2'),
              value: getText('bioIntelligent.bases.jiande.area2Metric'),
            },
            {
              label: getText('bioIntelligent.bases.jiande.capacity2'),
              value: getText('bioIntelligent.bases.jiande.capacity2Metric'),
            },
          ],
        },
      ];
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

  .base-card {
    width: 100%;
    margin: 16px auto;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid rgba(241, 243, 247, 0.22);
    border-radius: 10px;
    background: #202428;
    overflow: hidden;
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
  }

  .base-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    padding: 2px 2px 0;
    font-size: 9.5px;
    line-height: 1.3;
    font-weight: 500;
    color: rgba(241, 243, 247, 0.58);

    span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    span:nth-child(2) {
      flex: 0 0 auto;
      color: rgba(241, 243, 247, 0.58);
      font-weight: 400;
    }
  }

  .base-card-image-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 1.62;
    border-radius: 6px;
    overflow: hidden;
    background: #333;
  }

  .base-card-image {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
    object-fit: cover;
  }

  .base-card-image-title {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 14px;
    color: #fff;
    font-size: 15px;
    line-height: 1.25;
    font-weight: 500;
    text-align: center;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
    overflow-wrap: anywhere;
  }

  .base-card-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    padding: 22px 4px 10px;
  }

  .base-card-metrics-four {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .base-card-metrics-four .base-card-metric-label {
    font-size: 10px;
    white-space: nowrap;
  }

  .base-card-metric {
    min-width: 0;
    text-align: left;
  }

  .base-card-metric-label {
    min-height: 18px;
    color: rgba(241, 243, 247, 0.72);
    font-size: 11px;
    line-height: 1.35;
    font-weight: 400;
    overflow-wrap: anywhere;
  }

  .base-card-metric-value {
    margin-top: 4px;
    color: #ff7200;
    font-size: 20px;
    line-height: 1.1;
    font-weight: 400;
    white-space: nowrap;
  }

  .base-card-metrics-four .base-card-metric-value {
    font-size: 17px;
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
