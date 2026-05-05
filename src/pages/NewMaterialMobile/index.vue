<template>
  <div class="material">
    <BannerTitle :titleStyle="titleStyle">
      <div class="banner-title-content banner-title-content-mobile">
        <div class="banner-title-zh">{{ getText('bannerTitle.newMaterial.line1') }}</div>
        <div class="banner-title-en">{{ getText('bannerTitle.newMaterial.line3') }}</div>
        <div class="banner-title-zh">{{ getText('bannerTitle.newMaterial.line2') }}</div>
      </div>
    </BannerTitle>
    <div class="material-banner">
      <img src="@/assets/images/material-banner.png" alt="material-banner" class="material-banner-img" />
      <div class="material-banner-list">
        <div class="material-banner-list-item" v-for="(item, index) in getText('newMaterial.features')" :key="index">
          {{ item }}
        </div>
      </div>

    </div>
    <div class="mouse-scroll">
      <MouseScrollM :modules="modules" :originHeight="600">
        <template #item-content="{ module, index }">
          <aa-module-content-mobile :title="module.title" :topItems="module.topItems"
            :introductionTitle1="module.introductionTitle1" :introductionTitle2="module.introductionTitle2"
            :applyTexts="module.applyTexts" :advantages="module.advantages" :imageUrl="module.imageUrl"
            :isRow="module.isRow" :tabStyle="getTabStyleData(index)"></aa-module-content-mobile>
        </template>
      </MouseScrollM>
    </div>
    <div class="case border-gradient" :style="{marginTop:'100px'}">
      <div class="case-title">
        <div class="case-title-first">
          <span class="orange-text">{{ getText('newMaterial.applicationCase') }}</span><span>{{ getText('newMaterial.applicationCase2') }}</span>
        </div>
        <div class="text-wrapper">
          <div class="case-title-third">
            <p>{{ getText('newMaterial.vipshop') }}</p>
            <p>{{ getText('newMaterial.andMint') }}</p>
          </div>
          <div class="case-title-second">
            <span class="orange-text">{{ getText('newMaterial.expressCase') }}</span>
          </div>

        </div>

      </div>
      <div class="case-list" ref="caseList" @mousedown="startDrag($event, 'caseList')"
        @mousemove="onDrag($event, 'caseList')" @mouseup="endDrag" @mouseleave="endDrag">
        <div class="case-list-item border-gradient" v-for="(item, index) in caseList" :key="index">
          <div class="case-list-item-top">
            <span>China</span><span>MiNT BiO</span><span>Hangzhou</span>
          </div>
          <img :src="item.imgSrc" alt="case-list-item" class="case-list-item-img" />
          <div class="case-list-item-describe">{{ item.describe }}</div>
          <div class="case-list-item-tips">{{ item.tips }}</div>
        </div>
      </div>
    </div>

    <div class="case mobile-sector ">
      <div class="case-title">
        <div class=" text-wrapper">
          <div class="case-title-second">
            <span class="orange-text">{{ getText('newMaterial.mulchingCase') }}</span>
          </div>
          <div class="case-title-third">
            <p>{{ getText('newMaterial.xinjiangCaas') }}</p>
            <p>{{ getText('newMaterial.caasAndMint') }}</p>
          </div>
        </div>
      </div>
      <div class="case-list" ref="caseListSecond" @mousedown="startDrag($event, 'caseListSecond')"
        @mousemove="onDrag($event, 'caseListSecond')" @mouseup="endDrag" @mouseleave="endDrag">
        <div class="case-list-item border-gradient" v-for="(item, index) in caseListSecond" :key="index">
          <div class="case-list-item-top">
            <span>China</span><span>MiNT BiO</span><span>Hangzhou</span>
          </div>
          <img :src="item.imgSrc" alt="case-list-item" class="case-list-item-img" />
          <div class="case-list-item-describe">{{ item.describe }}</div>
          <div class="case-list-item-tips">{{ item.tips }}</div>
        </div>
      </div>
    </div>

    <div class="question mobile-sector border-gradient">
      <div class="title-first">
        <span>{{ getText('newMaterial.faq') }}</span><span class="orange-text question-code">？</span><span>{{ getText('newMaterial.faq2') }}</span>
      </div>
      <div class="title-second">
        <span :style="{ opacity: 0 }">{{ getText('newMaterial.faq') }}</span><span class="orange-text question-code"
          :style="{ opacity: 0 }">？</span><span>{{ getText('newMaterial.faq3') }}</span>
      </div>
      <el-collapse class="collapse" @change="handleChange">
        <el-collapse-item class="collapse-item" v-for="(item, index) in questionList" :key="index" :title="item.title"
          :name="index" :icon="activeNames.includes(index) ? Minus : Plus">
          <div class="collapse-item-content" v-html="item.content"></div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import BannerTitle from "@/components/BannerTitle";
import MouseScrollM from "@/components/MouseScrollM";
import AaModuleContentMobile from "@/components/AaModuleContentMobile";

import { Plus, Minus } from "@element-plus/icons-vue";
import { getText } from "@/utils/language";


export default {
  name: "NewMaterial",
  components: {
    BannerTitle,
    MouseScrollM,
    AaModuleContentMobile
  },
  setup() {
    return {
      titleStyle: { top: "57%" },
    };
  },
  data() {
    return {
      Plus,
      Minus,
      activeNames: [],
    };
  },
  computed: {
    modules() {
      const cats = getText('newMaterial.categories') || [];
      const imageUrls = [
        [
          { url: "assets/NewMaterial/P001-1.png" },
          { url: "assets/NewMaterial/P001-2.jpeg" },
          { url: "assets/NewMaterial/P001-3.jpeg" },
        ],
        [
          { url: "assets/NewMaterial/P002-1.jpeg" },
          { url: "assets/NewMaterial/P002-2.jpeg" },
          { url: "assets/NewMaterial/P002-3.jpeg" },
        ],
        [
          { url: "assets/NewMaterial/P003-1.jpeg" },
          { url: "assets/NewMaterial/P003-2.png" },
          { url: "assets/NewMaterial/P003-3.png" },
          { url: "assets/NewMaterial/P003-4.png" },
          { url: "assets/NewMaterial/P003-5.png" },
          { url: "assets/NewMaterial/P003-6.png" },
        ],
        [
          { url: "assets/NewMaterial/P004-1.jpeg" },
          { url: "assets/NewMaterial/P004-2.png" },
          { url: "assets/NewMaterial/P004-4.jpg" },
          { url: "assets/NewMaterial/P004-3.png" },
        ],
        [
          { url: "assets/NewMaterial/P005-1.jpg" },
          { url: "assets/images/product-6.jpg" },
        ],
      ];
      const titles = ["PiX 膜袋材料", "PiX3D 打印材料", "PiX 注塑材料", "PiX 地膜材料", "PiX 纤维材料"];
      const nums = ["膜袋材料", "3D 打印材料", "注塑材料", "地膜材料", "纤维材料"];
      return cats.map((cat, i) => ({
        title: titles[i],
        isRow: true,
        topItems: ["Affordable", "Infinity"],
        introductionTitle1: "PiX",
        introductionTitle2: nums[i],
        applyTexts: cat.title,
        advantages: cat.advantages,
        imageUrl: (imageUrls[i] || []).map((img, j) => ({
          url: img.url,
          desc: (cat.items && cat.items[j]) || "",
        })),
      }));
    },
    caseList() {
      const cases = getText('newMaterial.cases.express') || {};
      return [
        {
          imgSrc: require("@/assets/images/case-4.png"),
          describe: cases.step1 || "",
        },
        {
          imgSrc: require("@/assets/images/case-2.png"),
          describe: cases.step2 || "",
        },
        {
          imgSrc: require("@/assets/images/case-1.png"),
          describe: cases.step3 || "",
        },
      ];
    },
    caseListSecond() {
      const mulch = getText('newMaterial.cases.mulching') || {};
      return [
        {
          imgSrc: require("@/assets/images/case-1.jpeg"),
          describe: mulch.title || "",
          tips: mulch.desc || "",
        },
        {
          imgSrc: require("@/assets/images/case-2.jpeg"),
          describe: mulch.advantage1 || "",
        },
        {
          imgSrc: require("@/assets/images/case-3.jpeg"),
          describe: mulch.advantage2 || "",
        },
      ];
    },
    questionList() {
      const faqList = getText('newMaterial.faqList') || [];
      return faqList.map(item => ({
        title: item.question,
        content: item.answer,
      }));
    },
  },
  methods: {
    getText,
    getTabStyleData(index) {
      const marginLeft = index === 0 ? "1%" : `${1 + index * 19.7}%`;

      return {
        marginLeft: marginLeft,
        zIndex: index,
      };
    },
    handleChange(activeNames) {
      this.activeNames = activeNames;
    },
    startDrag(event, listRef) {
      this.isDragging = true;
      this.startX = event.clientX;
      this.scrollLeft = this.$refs[listRef].scrollLeft;
    },
    onDrag(event, listRef) {
      if (!this.isDragging) return;
      const x = event.clientX;
      const walk = (x - this.startX) * 2; // Adjust the multiplier for sensitivity
      this.$refs[listRef].scrollLeft = this.scrollLeft - walk;
    },
    endDrag() {
      this.isDragging = false;
    },
  },
};
</script>
<style lang="less" scoped>
@import "@/style/variable.less";

.mouse-scroll {
  margin-top: 100px;
  height: 600px;
}

.icon-ele {
  margin: 0 8px 0 auto;
  color: #409eff;
}

.material {
  background-color: #11161b;

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
      width: 60px;
      word-break: break-word;
      line-height: 1.4;
    }
  }

  &-banner {
    padding: 0 10px;

    &-img {
      width: 100%;
    }

    &-list {
      margin: 10px auto 20px;
      width: 282px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;

      &-item {
        padding: 0 20px;
        border-radius: 8px;
        height: 34px;
        color: white;
        font-size: 11px;
        font-weight: 380;
        line-height: 34px;
        text-align: center;
        border: 0.4px solid #F1F3F799
      }
    }
  }

  &-scroll {}

  .case {
    color: #fff;
    padding: 60px 0 60px 45px;

    &-title {
      &-first {
        text-align: left;
        font: 520 25px MiSans;
      }

      .text-wrapper {
        margin-top: 30px;
        display: flex;
        justify-content: flex-start;
        gap: 16px;

        .case-title-second {
          text-align: center;
          font: 520 16px MiSans;
        }

        .case-title-third {
          margin-right: 30px;
          text-align: left;
          font: 520 16px MiSans;
        }

      }

    }

    &-list {
      margin-top: 40px;
      white-space: nowrap;
      overflow-x: auto;
      display: flex;
      align-items: stretch;

      /* 初始状态下隐藏滚动条 */
      &::-webkit-scrollbar {
        height: 0;
        /* 初始状态下滚动条高度为0 */
        background: rgba(255, 255, 255, 0);
        /* 初始状态下滚动条背景透明 */
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0);
        /* 初始状态下滚动条滑块透明 */
        border-radius: 4px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0);
        /* 初始状态下滚动条轨道透明 */
      }


      &-item {
        background: hsla(206, 9%, 15%, 1);
        backdrop-filter: blur(68px);
        flex-shrink: 0;
        padding: 12px;
        width: 300px;
        margin-right: 20px;
        border-width: 2px;
        border: 1px solid transparent;
        border-image: linear-gradient(156.52deg,
            rgba(255, 255, 255, 0.4) 2.12%,
            rgba(255, 255, 255, 0.0001) 39%,
            rgba(255, 255, 255, 0.0001) 54.33%,
            rgba(255, 255, 255, 0.1) 93.02%);
        border-radius: 20px;

        &-top {
          font: 400 8px Montserrat;
          color: rgba(241, 243, 247, 0.5);
          display: flex;
          justify-content: space-between;
        }

        &-img {
          width: 100%;
          height: 233px;
          object-fit: cover;
          margin: 16px 0;
          border-radius: 20px;
        }

        &-describe {
          margin-top: 8px;
          font-size: 12px;
          font-weight: 550;
          color: #fff;
          white-space: normal;
        }

        &-tips {
          margin-top: 20px;
          font-size: 12px;
          line-height: 24px;
          font-weight: 400;
          white-space: normal;
          color: #f1f3f799;
        }
      }
    }
  }

  .question {
    padding: 60px 0 60px 45px;
    color: #fff;
    font-size: 25px;
    font-weight: 520;
    text-align: left;

    &-code {
      display: inline-block;
      width: 30px;
      margin: 0 20px;
    }

    .title-second {
      margin-bottom: 40px;
    }

    .collapse {
      font: 400 14px MiSans;
      color: #fff;

      &-item {
        &-content {
          font: 400 14px MiSans !important;
          color: #fff !important;
        }
      }

      --el-collapse-header-bg-color: #11161b !important;
      --el-collapse-header-text-color: #fff !important;
      --el-collapse-header-font-size: 14px !important;
      --el-collapse-header-padding: 0 !important;
      --el-collapse-header-font-weight: 500 !important;
      --el-collapse-header-border-bottom: none !important;

      /* 使用深度选择器 */
      ::v-deep .el-collapse-item__wrap {
        padding: 20px 0;
        background-color: #11161b;
        border-bottom: 1px solid #66666680;
      }

      .is-active {
        ::v-deep .el-collapse-item__header {
          border-bottom: none;
          height: 80px;
          text-align: left;
        }
      }

      ::v-deep .el-collapse-item__header {
        border-bottom: 1px solid #66666680;
        height: 80px;
        text-align: left;
      }

      ::v-deep .el-collapse-item__arrow {
        margin: 0 0 0 10px;
      }

      ::v-deep .el-collapse-item__arrow.is-active {
        transform: rotate(180deg);
      }
    }

    ::v-deep .el-collapse {
      border-top: 1px solid #66666680;
    }
  }
}
</style>