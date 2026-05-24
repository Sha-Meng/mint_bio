<template>
  <div class="top">
    <div class="top-container">
      <div class="bgtext">
        <img src="@/assets/images/mint.png" mode="aspectFill" />
      </div>
      <div class="bggrid">
        <img src="@/assets/images/grid1.png" mode="aspectFill" />
      </div>
      <div class="title">
        <text label1>{{ getText('news.title') }}&nbsp;&nbsp;&nbsp;&nbsp;{{ getText('news.title2') }}</text>
      </div>
      <div class="sub">
        <text class="sub"> & </text>
      </div>
      <div class="desc">
        {{ getText('news.subtitle') }}
      </div>
      <!-- 品牌手册按钮暂时隐藏，恢复时取消注释即可
      <div class="button">
        <div class="button-btn">
          <p>{{ getText('news.downloadBrochure') }}</p>
          <div class="button-btn-img">
            <img src="@/assets/images/download.png" alt="download" />
          </div>
        </div>
      </div>
      -->
    </div>
  </div>
</template>

<script setup>
import { getText } from "@/utils/language";
</script>

<style lang="scss" scoped>
@media screen and (min-width: 380px) {
  .top {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #11161b;
    display: flex;
    justify-content: center;
    align-items: center;

    .top-container {
      width: 1728px;
      white-space: nowrap;
      overflow: hidden;
      height: 100%;
      position: relative;
      justify-content: center;

      .bgtext {
        position: absolute;
        width: 988px;
        height: 172px;

        top: 251px;
        left: 370px;

        image {
          width: 100%;
          height: 100%;
        }
      }

      .bggrid {
        position: absolute;
        width: 663px;
        height: 468px;

        top: 66px;
        left: 532px;

        image {
          width: 100%;
          height: 100%;
        }
      }

      .title {
        position: absolute;
        width: 380px;
        top: 230px;
        left: 684px;
        font-size: 70px;
        background: linear-gradient(to top, #ffffff 30%, #555555 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
      }

      .sub {
        position: absolute;
        width: 52px;
        height: 52px;
        color: #ff7200;
        font-size: 70px;
        font-weight: 450;
        font-family: Arial, Helvetica, sans-serif;
        top: 135px;
        left: 425px;
      }

      .desc {
        position: absolute;
        top: 367px;
        left: 600px;
        font-size: 16px;
        font-weight: 380;
        font-family: Arial, Helvetica, sans-serif;
        line-height: 21.22px;
        background: linear-gradient(to top, #ffffff 30%, #555555 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
      }

      .button {
        position: absolute;
        top: 450px;
        left: 785px;
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
          &-img {
            width: 18px;
            height: 18px;
            img {
              width: 100%;
            }
          }
        }
      }
    }
  }
}
</style>
