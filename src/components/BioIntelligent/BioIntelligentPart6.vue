<template>
  <div class="biointelligentpart6v2 sector">
    <div v-intersect="() => titleInView = true">
      <div v-if="titleInView" class="title animate__animated animate__fadeInUp">
        <span class="label1"> 生物智造&nbsp;&nbsp; </span>
        <span class="label2"> 基 <br />地 </span>
      </div>
    </div>

    <div class="content">
      <div
        class="box box1"
        :class="{ hiddenbox: isHidden(0) }"
        @mouseover="handleMouseOver(0)"
        @mouseout="handleMouseOut(0)"
      >
        <div class="box-title">
          <p>{{ getText('bioIntelligent.bases.muyuan.name') }}<br />{{ getText('bioIntelligent.bases.muyuan.location') }}</p>
        </div>
        <div class="box-data-w" :class="{ visible: expandedIndex === 0 }">
          <div class="box-data">
            <p class="box-data-top">{{ getText('bioIntelligent.bases.muyuan.area') }}</p>
            <p class="box-data-bottom">126</p>
          </div>
          <div class="box-data">
            <p class="box-data-top">{{ getText('bioIntelligent.bases.muyuan.capacity1') }}</p>
            <p class="box-data-bottom">30,000</p>
          </div>
          <div class="box-data">
            <p class="box-data-top">{{ getText('bioIntelligent.bases.muyuan.capacity2') }}</p>
            <p class="box-data-bottom">40,000</p>
          </div>
        </div>
      </div>

      <div
        class="box box2"
        :class="{ hiddenbox: isHidden(1) }"
        @mouseover="handleMouseOver(1)"
        @mouseout="handleMouseOut(1)"
      >
        <div class="box-title">
          <p>元素总部<br />杭州·西湖区</p>
        </div>
        <div class="box-data-w" :class="{ visible: expandedIndex === 1 }">
          <div class="box-data">
            <p class="box-data-top">研发专利</p>
            <p class="box-data-bottom">40+</p>
          </div>
          <div class="box-data">
            <p class="box-data-top">名校硕博研发团队</p>
            <p class="box-data-bottom">30+</p>
          </div>
          <div class="box-data">
            <p class="box-data-top">研发中心</p>
            <p class="box-data-bottom">3,000m²+</p>
          </div>
        </div>
      </div>

      <div
        class="box box3"
        :class="{ hiddenbox: isHidden(2) }"
        @mouseover="handleMouseOver(2)"
        @mouseout="handleMouseOut(2)"
      >
        <div class="box-title">
          <p>{{ getText('bioIntelligent.bases.jiande.name') }}<br />{{ getText('bioIntelligent.bases.jiande.location') }}</p>
        </div>
        <div class="box3-data-w" :class="{ visible: expandedIndex === 2 }">
          <div class="box3-data-left">
            <div class="box3-data">
              <p class="box3-data-top">{{ getText('bioIntelligent.bases.jiande.area1') }}</p>
              <p class="box3-data-bottom">50</p>
            </div>
            <div class="box3-data">
              <p class="box3-data-top">{{ getText('bioIntelligent.bases.jiande.capacity1') }}</p>
              <p class="box3-data-bottom">30,000</p>
            </div>
          </div>
          <div class="box3-data-right">
            <div class="box3-data">
              <p class="box3-data-top">{{ getText('bioIntelligent.bases.jiande.area2') }}</p>
              <p class="box3-data-bottom">70</p>
            </div>
            <div class="box3-data">
              <p class="box3-data-top">{{ getText('bioIntelligent.bases.jiande.capacity2') }}</p>
              <p class="box3-data-bottom">120,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getText } from "@/utils/language";

// 使用 ref 创建响应式变量
const expandedIndex = ref(-1); // 当前扩展的盒子索引

const titleInView = ref(false);

// 方法定义

const isHidden = (index) => {
  // 根据逻辑，当最左边或最右边的盒子扩展时，隐藏中间的盒子
  let res =
    (expandedIndex.value === 0 && index === 1) ||
    (expandedIndex.value == 1 && index == 0) ||
    (expandedIndex.value == 1 && index == 2) ||
    (expandedIndex.value === 2 && index === 1);
  return res;
};

const handleMouseOver = (index) => {
  expandedIndex.value = index;
};

const handleMouseOut = () => {
  expandedIndex.value = -1; // 重置扩展状态
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.biointelligentpart6v2 {
  // margin-bottom: 170px;
  // width: 1728px;
  height: 1100px;
  background-color: #11161b;
  .title {
    width: 100%;
    height: 30%;
    display: flex;
    text-align: left;
    align-items: center;

    .label1 {
      color: white;
      font-size: 60px;
    }

    .label2 {
      color: #ff7200;
      font-size: 60px;
    }
  }

  .content {
    width: 100%;
    height: 60%;
    border-radius: 15px;
    position: relative;

    .box {
      width: 32.5%;
      height: 100%;
      transition-property: all;
      transition-duration: 0.5s;
      // transition: all 0.5s;
      position: absolute;

      img {
        width: 100%;
        height: 100%;
        border-radius: 15px;
      }
    }
    .box-title {
      margin: 67px auto 415px auto;
      padding: 30px 40px;
      /* width: 27.5%; */
      width: 96px;
      background-color: #666666b2;
      opacity: 0.7;
      border-radius: 100px;
      font-size: 16px;
      color: #ffffff;
      text-align: center;
    }
    .box-data-w,
    .box3-data-w {
      visibility: hidden; 
      opacity: 0;
      transition: opacity 0.8s ease; 
    }

    .box-data-w.visible,
    .box3-data-w.visible {
      visibility: visible;
      opacity: 1;
    }

    .box-data-w {
      display: none;
      display: flex;
      justify-content: center;
      gap: 82px;
      .box-data {
		  white-space: nowrap;
        color: #ffffff;
        .box-data-top {
          font-size: 20px;
        }
        .box-data-bottom {
          font-size: 64px;
        }
      }
    }
    .box3-data-w {
      display: none;
      display: flex;
      justify-content: center;
      gap: 120px;
      .box3-data-left,
      .box3-data-right {
        display: flex;
        gap: 4px;
      }
      .box3-data {
		    white-space: nowrap;
        color: #ffffff;
        .box3-data-top {
          font-size: 20px;
        }
        .box3-data-bottom {
          font-size: 64px;
        }
      }
    }

    .box1 {
      left: 0%;
      background-image: url("@/assets/BioIntelligent/nanyang.jfif");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 15px;

      // z-index: 2;
      &:hover {
        width: 65.6%;
        z-index: 2;
      }
    }
    .box2 {
      left: 33%;
      background-image: url("@/assets/BioIntelligent/hangzhou.jfif");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 15px;
      &:hover {
        width: 99.9%;
        left: 0%;
        z-index: 2;
      }
    }

    .box3 {
      left: 66%;
      background-image: url("@/assets/BioIntelligent/jiande.jfif");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      border-radius: 15px;
      &:hover {
        left: 33%;
        width: 66.6%;
        z-index: 2;
      }
    }

    .hiddenbox {
      // display: none;
      opacity: 0%;
      z-index: 1;
    }
  }
}
</style>