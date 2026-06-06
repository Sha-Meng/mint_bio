<template>
  <div class="layout">
    <BannerTitleAnimation
      :titleImage="require('@/assets/BioIntelligent/banner_title.png')"
      :backgroundImg="require('@/assets/BioIntelligent/module1_bg.jpeg')"
    />
    <div class="platform-intro-divider mt120"></div>
    <section class="platform-intro">
      <div class="platform-intro-inner">
        <p>{{ getText('bioIntelligent.platformIntro.paragraph1') }}</p>
        <p>{{ getText('bioIntelligent.platformIntro.paragraph2') }}</p>
      </div>
    </section>
    <div class="platform-intro-divider"></div>
    <BioIntelligentPart2></BioIntelligentPart2>
    <div class="line2"></div>
    <BioIntelligentPart3></BioIntelligentPart3>
    <MiNTDivider :content="'+'"></MiNTDivider>
    <!-- <BioIntelligentPart4></BioIntelligentPart4> -->
    <BioIntelligentPart7></BioIntelligentPart7>
    <div class="line2"></div>
    <VisionModule5></VisionModule5>
    <div class="line2"></div>
    <BioIntelligentPart6></BioIntelligentPart6>
  </div>
</template>

<script setup>
import BannerTitleAnimation from "@/components/BannerTitleAnimation";
import BioIntelligentPart2 from "@/components/BioIntelligent/BioIntelligentPart2.vue";
import BioIntelligentPart3 from "@/components/BioIntelligent/BioIntelligentPart3.vue";
// import BioIntelligentPart4 from "@/components/BioIntelligent/BioIntelligentPart4.vue";
import VisionModule5 from "@/pages/Vision/VisionModule5.vue";
import BioIntelligentPart6 from "@/components/BioIntelligent/BioIntelligentPart6.vue";
import MiNTDivider from "@/components/Divider";
import BioIntelligentPart7 from "@/components/BioIntelligent/BioIntelligentPart7.vue";
import { getText } from "@/utils/language";
</script>

<style lang="less" scoped>
@import "@/style/variable.less";


.part1 {
  width: 100%;
  height: 1282px;
  background-color: #000;

  text {
    color: #ececee;
  }
}

.line2 {
  height: 1px;
  width: 100%;
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

.platform-intro {
  background-color: #11161b;
  padding: 48px 160px 56px;

  .platform-intro-inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  p {
    margin: 0;
    font-size: 20px;
    line-height: 1.8;
    color: #f1f3f7;
    font-weight: 400;

    & + p {
      margin-top: 18px;
    }
  }
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
