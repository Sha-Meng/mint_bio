<template>
  <div class="footer">
    <el-row>
      <el-col :span="8" class="footer-left">
        <div class="footer-left-logo">
          <div class="footer-left-logo-img-w pointer" @click="handleJumps('home')">
            <img class="footer-left-logo-img" src="@/assets/images/logo.png" alt="" />
          </div>
          <div class="footer-left-logo-text1">{{ getText('footer.slogan') }}</div>
          <div class="footer-left-logo-text2"></div>
        </div>
        <!-- <div class="footer-left-download">
          <span>下载品牌手册</span>
          <div class="footer-left-download-img">
            <img src="@/assets/images/download.png" alt="" />
          </div>
        </div> -->
      </el-col>
      <el-col :span="2" class="footer-middle">
        <img class="footer-middle-divider" src="./images/divider.png" alt="" />
      </el-col>
      <el-col :span="14" class="footer-right">
        <div class="footer-right-content">
          <div class="footer-right-content-menus footer-common">
            <p class="footer-right-content-menus-item" @click="handleJumps('bioIntelligent')">{{ getText('nav.bioIntelligent') }}</p>
            <p class="footer-right-content-menus-item" @click="handleJumps('mintNews')">{{ getText('nav.news') }}</p>
            <p class="footer-right-content-menus-item" @click="handleJumps('corporate')">{{ getText('nav.joinUs') }}</p>
            <!-- <p class="footer-right-content-menus-item">{{ getText('nav.downloadCenter') }}</p> -->
          </div>
          <div class="footer-right-content-products footer-common">
            <p class="footer-right-content-products-item-title">{{ getText('nav.products') }}</p>
            <p class="footer-right-content-products-item pointer" @click="handleJumps('material')">{{ getText('nav.material') }}</p>
            <p class="footer-right-content-products-item pointer" @click="handleJumps('aminoAcid')">{{ getText('nav.aminoAcid') }}</p>
            <p class="footer-right-content-products-item pointer" @click="handleJumps('knotWeed')">{{ getText('nav.knotWeed') }}</p>
          </div>
          <div class="footer-right-content-about footer-common">
            <p class="footer-right-content-about-item-title">{{ getText('footer.aboutUs') }}</p>
            <p class="footer-right-content-about-item pointer" @click="handleJumps('corporate')">{{ getText('footer.corporate') }}</p>
            <p class="footer-right-content-about-item pointer" @click="handleJumps('vision')">{{ getText('footer.visionResponsibility') }}</p>
          </div>
        </div>
        <div class="footer-right-info">
          <div class="footer-right-info-qrCode">
            <p class="footer-right-info-qrCode-text footer-common">{{ getText('footer.contactAdvisor') }}</p>
            <img src="@/assets/images/wxCode.png" alt="" />
          </div>
          <div class="footer-right-info-address footer-common">
            <p class="mb26">{{ getText('footer.address') }}</p>
            <p>
              {{ getText('footer.addressLine1') }}<br />
              {{ getText('footer.addressLine2') }}
            </p>
          </div>
          <div class="footer-right-info-copyright">
            <p>
              {{ getText('footer.copyright') }}
            </p>
            <a class="footer-right-info-copyright-record" href="https://beian.miit.gov.cn"
              target="_blank">{{ getText('footer.icp') }}</a>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getText } from "@/utils/language";

const router = useRouter();

const handleJumps = (item) => {
  router.push({ name: item });
};
</script>
<style lang="less" scoped>
@import "@/style/variable.less";

.footer {
  position: relative;
  background-color: #11161b;
  padding: 4.2% 10.8% 4.2% 8%;
  border-width: 1px 0 0 0;
  /* 只设置上边框 */
  border-style: solid;
  border-image: linear-gradient(to right,
      rgba(53, 52, 74, 0.5) 0%,
      rgba(53, 52, 74, 0.5) 10%,
      rgba(255, 255, 255, 0.4) 30%,
      rgba(255, 255, 255, 0.4) 70%,
      rgba(53, 52, 74, 0.5) 90%,
      rgba(53, 52, 74, 0.5) 100%) 1;

  &-common {
    font-weight: 500;
    font-size: 16px;
    color: #ffffff;
  }

  &-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &-logo {
      display: flex;
      align-items: center;

      &-img {
        width: 100%;
        height: 100%;

        &-w {
          width: 19.6%;
        }
      }

      &-text1,
      &-text2 {
        font-size: 16px;
        font-weight: 500;
        color: #ffffff;
      }

      &-text1 {
        width: 67px;
        margin-left: 42px;
        text-align: right;
      }

      &-text2 {
        width: 87px;
        margin-left: 15px;
      }
    }

    &-download {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 26%;
      height: 10%;
      background-color: #ff7200;
      border-radius: 37px;
      font-size: 12px;
      color: #ffffff;

      &-img {
        width: 18px;
        height: 18px;

        img {
          width: 100%;
        }
      }
    }
  }

  &-middle {
    &-divider {
      width: 12.5%;
      height: 100%;
    }
  }

  &-right {
    &-content {
      display: flex;
      justify-content: space-between;
      width: 100%;

      &-menus {
        height: 190px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &-item {
          width: 66px;
          height: 10px;
          color: #ffffff;
          cursor: pointer;
        }
      }

      &-products {
        &-item {
          width: 128px;
          height: 48px;
          color: #8a8f98;

          &-title {
            width: 98px;
            color: #ffffff;
            margin-bottom: 50px;
          }
        }
      }

      &-about {
        &-item {
          width: 98px;
          height: 48px;
          color: #8a8f98;

          &-title {
            width: 98px;
            color: #ffffff;
            margin-bottom: 50px;
          }
        }
      }
    }

    &-info {
      width: 100%;
      margin-top: 121px;
      display: flex;
      justify-content: space-between;
      align-items: end;

      &-qrCode {
        &-text {
          margin-bottom: 5px;
        }

        img {
          width: 129px;
          height: 129px;
        }
      }

      &-address {
        margin-left: 51px;
      }

      &-copyright {
        margin-left: 111px;
        color: #ffffff;

        &-record {
          color: #ffffff;
        }

        &-record:hover {
          color: #FF7200;
          text-decoration: none;
        }
      }
    }
  }
}

.footer::after {
  content: "";
  position: absolute;
  top: 0;
  /* 位于边框下方 */
  left: 50%;
  /* 水平居中 */
  width: 90%;
  /* 光晕的宽度 */
  height: 50px;
  /* 光晕的高度 */
  background: radial-gradient(circle,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0) 80%);
  transform: translateX(-50%);
  filter: blur(30px);
  opacity: 0.1;
  pointer-events: none;
  /* 光晕不影响交互 */
}

.mb26 {
  margin-bottom: 26px;
}
</style>