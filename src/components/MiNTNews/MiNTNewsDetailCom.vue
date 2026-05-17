<template>
  <div class="news-container">
    <div class="content">
      <div class="body">
        <div class="topbg">
          <img src="@/assets/News/Grid.png" />
        </div>
        <div class="tag">
          <span :style="{ color: props.info.categorycolor }">
            {{ props.info.categorylabel }}</span>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span> {{ props.info.time }} </span>
        </div>

        <div class="title">
          <span class="overview-header"> {{ props.info.overviewtitle }} </span>
        </div>

        <div class="abstract">
          <span class="overview-abstract">
            {{ props.info.overviewcontent }}
          </span>
        </div>

        <div class="pic" v-if="getImageUrl(props.info.pic)">
          <img :src="getImageUrl(props.info.pic)" loading="eager" decoding="async" fetchpriority="high" />
        </div>


        <div class="overview">
          <span class="overview-content"> {{ props.info.abstract }} </span>
        </div>

        <div class="sections">
          <div v-for="section in props.info.sections" :key="section.id">
            <MiNTNewsDetailSection :info="section" :categorycolor="props.info.categorycolor"></MiNTNewsDetailSection>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

import { getImageUrl } from "@/utils/index";

import MiNTNewsDetailSection from "./MiNTNewsDetailSection.vue";

const props = defineProps({
  info: {
    Object,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.news-container {
  margin-bottom: 100px;
  width: 100%;
  /* height: 6904px; */
  background-color: #11161b;
  display: flex;
  justify-content: center;
  overflow: hidden;

  .content {
    width: 1728px;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    .body {
      width: 56.3%;
      height: 100%;
      // border: solid 1px red;

      overflow: hidden;
      position: relative;
      justify-content: center;

      .topbg {
        position: absolute;
        width: 663px;
        height: 468px;
        top: 0;
        left: 140px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .tag {
        width: 100%;
        margin-top: 171px;

        span {
          font-size: 18px;
          font-weight: 450;
          line-height: 23.87px;
          color: white;
        }
      }

      .title {
        width: 100%;
        margin-top: 50px;

        .overview-header {
          font-size: 40px;
          line-height: 53.04px;
          color: white;

        }
      }

      .abstract {
        margin-top: 100px;
        color: white;
        font-size: 21px;
        font-weight: 330;
        line-height: 33px;
        font-family: MiSans;

        .overview-abstract {
          white-space: pre-wrap;
          /* 保留空白符序列，但是正常地进行换行 */
        }
      }

      .pic {
        margin-top: 100px;
        width: 100%;
        height: 637px;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .overview {
        margin-top: 50px;

        .overview-content {
          color: white;
          font-size: 21px;
          font-weight: 330;
          line-height: 33px;
          white-space: pre-wrap;
        }
      }
    }
  }
}


@media screen and (max-width: 922px) {
  .news-container {
    .content {
      .body {
        width: 100%;
        padding: 0 10px;

        .topbg {
          position: absolute;
          width: 663px;
          height: 468px;
          top: 66px;
          left: 140px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .tag {
          width: 100%;
          margin-top: 120px;

          span {
            font-size: 18px;
            font-weight: 450;
            line-height: 23.87px;
            color: white;
          }
        }

        .title {
          width: 100%;
          margin-top: 30px;
          white-space: normal;

          .overview-header {
            font-size: 24px;
            line-height: 32px;
            white-space: normal;
            color: white;
          }
        }

        .abstract {
          font-size: 14px;
          line-height: 20px;
          margin-top: 30px;

          .overview-abstract {
            white-space: pre-wrap;
            /* 保留空白符序列，但是正常地进行换行 */
          }
        }

        .pic {
          margin-top: 30px;
          width: 100%;
          height: 230px;
          border-radius: 12px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .overview {
          margin-top: 50px;

          .overview-content {
            color: white;
            font-weight: 330;
            font-size: 14px;
            white-space: pre-wrap;
          }
        }


      }
    }
  }
}
</style>