<template>
  <div class="layout">
    <BannerTitleAnimation
      :titleImage="require('@/assets/BioIntelligent/banner_title.png')"
      :backgroundImg="require('@/assets/BioIntelligent/module1_bg.jpeg')"
    />
    <div class="line2 mt120 border-gradient"></div>
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

.line3 {
  height: 1px;
  width: 100%;
  background: rgba(49, 49, 50, 1);
}
.mt120 {
  margin-top: 120px;
}
</style>