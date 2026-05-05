<template>
  <div class="material">
    <BannerTitle :titleImage="require('@/assets/images/material-title.png')" :titleStyle="titleStyle" />

    <div class="material-banner">
      <div class="material-banner-content">
        <div class="material-banner-content-right">
          <ul class="material-banner-content-right-text">
            <li v-for="(feature, idx) in getText('newMaterial.features')" :key="idx">{{ feature }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="material-scroll">
      <MouseScroll :modules="modules" />
    </div>
    <div v-intersect="() => title1InView = true" class="case sector">
      <div v-if="title1InView" class="case-title animate__animated animate__fadeInUp">
        <div class="case-title-first">
          <span class="orange-text">{{ getText('newMaterial.applicationCase') }}</span><span>{{ getText('newMaterial.applicationCase2') }}</span>
        </div>
        <div class="flex pt100">
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
        <div v-for="(item, index) in caseList" :key="index"
          class="case-list-item border-gradient hover-scale-transition" @mousemove="cardHover(item)"
          @mouseleave="cardLeave(item)" :style="{ transform: item.transform }">
          <div class="case-list-item-top">
            <span>China</span><span>MiNT BiO</span><span>Hangzhou</span>
          </div>
          <img :src="item.imgSrc" alt="case-list-item" class="case-list-item-img" />
          <div class="case-list-item-describe">{{ item.describe }}</div>
          <div class="case-list-item-tips">{{ item.tips }}</div>
        </div>
      </div>
    </div>

    <div v-intersect="() => title2InView = true" class="case sector pt70">
      <div v-if="title2InView" class="case-title flex animate__animated animate__fadeInUp">
        <div class="case-title-third">
          <p>{{ getText('newMaterial.xinjiangCaas') }}</p>
          <p>{{ getText('newMaterial.caasAndMint') }}</p>
        </div>
        <div class="case-title-second">
          <span class="orange-text">{{ getText('newMaterial.mulchingCase') }}</span>
        </div>
      </div>
      <div class="case-list" ref="caseListSecond" @mousedown="startDrag($event, 'caseListSecond')"
        @mousemove="onDrag($event, 'caseListSecond')" @mouseup="endDrag" @mouseleave="endDrag">
        <div class="case-list-item border-gradient hover-scale-transition" v-for="(item, index) in caseListSecond"
          :key="index" @mousemove="cardHover(item)" @mouseleave="cardLeave(item)"
          :style="{ transform: item.transform }">
          <div class="case-list-item-top">
            <span>China</span><span>MiNT BiO</span><span>Hangzhou</span>
          </div>
          <img :src="item.imgSrc" alt="case-list-item" class="case-list-item-img" />
          <div class="case-list-item-describe">{{ item.describe }}</div>
          <div class="case-list-item-tips">{{ item.tips }}</div>
        </div>
      </div>
    </div>

    <div v-intersect="() => title3InView = true" class="question sector border-gradient">
      <div v-if="title3InView" class="title-first animate__animated animate__fadeInUp">
        <span>{{ getText('newMaterial.faq') }}</span><span class="orange-text question-code">？</span><span>{{ getText('newMaterial.faq2') }}</span>
      </div>
      <div v-if="title3InView" class="title-second animate__animated animate__fadeInUp">
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
import MouseScroll from "@/components/MouseScroll";
import { Plus, Minus } from "@element-plus/icons-vue";
import { getText } from "@/utils/language";

export default {
  name: "NewMaterial",
  components: {
    BannerTitle,
    MouseScroll,
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
      title1InView: false,
      title2InView: false,
      title3InView: false,
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
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/images/case-2.png"),
          describe: cases.step2 || "",
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/images/case-1.png"),
          describe: cases.step3 || "",
          transform: "scale(1)",
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
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/images/case-2.jpeg"),
          describe: mulch.advantage1 || "",
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/images/case-3.jpeg"),
          describe: mulch.advantage2 || "",
          transform: "scale(1)",
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
    cardHover(card) {
      card.transform = "scale(1.05)";
    },
    cardLeave(card) {
      card.transform = "scale(1)";
    },
  },
};
</script>
<style lang="less" scoped>
@import "@/style/variable.less";

.icon-ele {
  margin: 0 8px 0 auto;
  color: #409eff;
}

.pt100 {
  padding-top: 100px;
}

.pt70 {
  padding-top: 70px;
}

.material {
  background-color: #11161b;


  &-banner {
    padding: 0 160px;

    &-content {
      margin-top: 87px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 600px;
      background-image: url("@/assets/images/material-banner.png");
      background-size: cover;
      background-repeat: no-repeat;
      border-radius: 20px;
      border: 1px solid #ffffff33;

      &-right {
        width: 340px;
        margin-right: 63px;
        background-color: #2828289f;
        backdrop-filter: blur(68px);
        border-radius: 20px;
        border: 1px solid transparent;

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

  &-scroll {
    padding: 0 160px;
  }

  .case {
    color: #fff;

    &-title {
      &-first {
        text-align: left;
        font: 520 60px MiSans;
      }

      &-second {
        text-align: center;
        font: 520 40px MiSans;
      }

      &-third {
        text-align: left;
        font: 520 40px MiSans;
      }
    }

    .flex {
      display: flex;
      gap: 377px;
    }

    &-list {
      padding-top: 70px;
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

      // &:hover {

      //   /* 悬停时显示滚动条 */
      //   &::-webkit-scrollbar {
      //     height: 8px;
      //     /* 恢复滚动条高度 */
      //     background: rgba(255, 255, 255, 0.1);
      //     /* 恢复滚动条背景颜色 */
      //   }

      //   &::-webkit-scrollbar-thumb {
      //     background: rgba(255, 255, 255, 0.3);
      //     /* 恢复滚动条滑块颜色 */
      //   }

      //   &::-webkit-scrollbar-track {
      //     background: rgba(255, 255, 255, 0.1);
      //     /* 恢复滚动条轨道颜色 */
      //   }
      // }

      &-item {
        background: hsla(206, 9%, 15%, 1);
        backdrop-filter: blur(68px);
        flex-shrink: 0;
        padding: 32px;
        width: 516px;
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
          font: 400 14 Montserrat;
          color: rgba(241, 243, 247, 0.5);
          display: flex;
          justify-content: space-between;
        }

        &-img {
          width: 100%;
          height: 416px;
          object-fit: cover;
          margin: 16px 0;
          border-radius: 20px;
        }

        &-describe {
          margin-top: 40px;
          font-size: 24px;
          font-weight: 550;
          color: #fff;
          white-space: normal;
          line-height: 34px;
        }

        &-tips {
          margin-top: 20px;
          font-size: 14px;
          line-height: 24px;
          font-weight: 400;
          white-space: normal;
          color: #f1f3f799;
        }
      }
    }
  }

  .question {
    color: #fff;
    font-family: MiSans;
    font-size: 60px;
    font-weight: 520;
    line-height: 79.56px;
    text-align: left;

    &-code {
      display: inline-block;
      width: 30px;
      margin: 0 20px;
    }

    .title-second {
      margin-bottom: 94px;
    }

    .collapse {
      margin-left: 432px;
      margin-bottom: 160px;
      font: 400 24px MiSans;
      color: #fff;

      &-item {
        &-content {
          font: 400 24px MiSans !important;
          color: #fff !important;
        }
      }

      --el-collapse-header-bg-color: #11161b !important;
      --el-collapse-header-text-color: #fff !important;
      --el-collapse-header-font-size: 24px !important;
      --el-collapse-header-padding: 0 !important;
      --el-collapse-header-font-weight: 500 !important;
      --el-collapse-header-border-bottom: none !important;

      /* 使用深度选择器 */
      ::v-deep .el-collapse-item__wrap {
        padding: 40px 0;
        background-color: #11161b;
        border-bottom: 1px solid #66666680;
      }

      .is-active {
        ::v-deep .el-collapse-item__header {
          border-bottom: none;
          height: 120px;
        }
      }

      ::v-deep .el-collapse-item__header {
        border-bottom: 1px solid #66666680;
        height: 120px;
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