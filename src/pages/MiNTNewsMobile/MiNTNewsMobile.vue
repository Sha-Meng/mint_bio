<template>
  <div class="news">
    <BannerTitle>
      <div class="text-section">
        <div class="title">
          <div label1>{{ getText('news.title') }}&nbsp;&nbsp;<span class="sub"> & </span>&nbsp;&nbsp;{{ getText('news.title2') }}</div>
        </div>
        <div class="desc">
          {{ getText('news.subtitle') }}
        </div>
      </div>
    </BannerTitle>
    <div class="button">
      <div class="button-btn">
        <span>{{ getText('news.downloadBrochure') }}</span>
        <img src="@/assets/images/download.png" alt="download" />
      </div>
    </div>
    <MiNTDivider :content="'+'"></MiNTDivider>
    <div class="newslist">
      <MiNTNewsListMobile> </MiNTNewsListMobile>
    </div>
  </div>
</template>

<script>
import MiNTNewsListMobile from "../../components/MiNTNews/MiNTNewsListMobile.vue";
import MiNTDivider from "@/components/Divider";
import BannerTitle from "@/components/BannerTitle";
import { getText } from "@/utils/language";

export default {
  components: {
    MiNTDivider,
    BannerTitle,
    MiNTNewsListMobile
  },
  methods: {
    getText,
  },
};
</script>
<style lang="less" scoped>
.news {
  padding-top: 70px;

  .text-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 36px;
    font-weight: 450;
    line-height: 47.74px;
    text-align: center;
    color: #e8e8ea;

    .sub {
      color: #FF7200;
      position: relative;
      top: 15px;
    }

    .desc {
      margin-top: 20px;
      font-size: 10px;
      line-height: 13.26px;
      text-align: center;
      width: 180px;
      height: 26px;
      white-space: normal;
      color: #b4b5b7;
    }
  }

  .button {
    display: flex;
    justify-content: center;

    .button-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 158px;
      height: 67px;
      font-size: 14px;
      color: #ffffff;
      border: 1px solid #FFFFFF1A;
      border-radius: 9999px;
      text-align: center;
      background: #202123;

      img {
        width: 18px;
        margin: 0;
      }

      margin-bottom: 60px;
    }
  }
}
</style>
