<template>
  <div class="footer">
    <img src="@/assets/images/left-line.png" class="left-line">
    <el-row>
      <el-col :span="24" class="footer-left">
        <div class="footer-left-logo">
          <div class="footer-left-logo-img-w pointer" @click="handleJumps('home')">
            <img class="footer-left-logo-img" src="@/assets/images/logo.png" alt="" />
          </div>
          <div class="footer-left-logo-text1">{{ getText('footer.slogan') }}</div>
          <div class="footer-left-logo-text2"></div>
        </div>

      </el-col>
      <el-col :span="24" class="footer-right">
        <div class="footer-right-content">
          <div class="footer-right-content-menus footer-common">
            <p class="footer-right-content-menus-item " @click="handleJumps('bioIntelligent')">{{ getText('footer.sections.biomanufacturing') }}</p>

          </div>
          <div class="footer-right-content-products footer-common">
            <p class="footer-right-content-products-item-title gray-text">{{ getText('nav.products') }}</p>
            <p class="footer-right-content-products-item pointer " @click="handleJumps('material')">{{ getText('nav.material') }}</p>
            <p class="footer-right-content-products-item pointer" @click="handleJumps('aminoAcid')">{{ getText('nav.aminoAcid') }}</p>
            <p class="footer-right-content-products-item pointer" @click="handleJumps('knotWeed')">{{ getText('nav.knotWeed') }}</p>
          </div>
          <div class="footer-right-content-about footer-common">
            <p class="footer-right-content-about-item-title gray-text">{{ getText('nav.aboutUs') }}</p>
            <p class="footer-right-content-about-item pointer" @click="handleJumps('corporate')">{{ getText('nav.corporate') }}</p>
            <p class="footer-right-content-about-item pointer" @click="handleJumps('vision')">{{ getText('nav.vision') }}</p>
          </div>
          <p class="footer-right-content-dynamic " @click="handleJumps('mintNews')">{{ getText('nav.news') }}</p>
          <p class="footer-right-content-join pointer" @click="openRecruitmentLink">{{ getText('nav.joinUs') }}</p>
          <p class="footer-right-content-down">{{ getText('footer.downloadCenter') }}</p>
        </div>

      </el-col>
      <div class="footer-advisors">
        <p class="footer-advisors-title footer-common">{{ getText('footer.contactAdvisor') }}</p>
        <div class="footer-advisors-list">
          <div v-for="advisor in contactAdvisors" :key="advisor.key" class="footer-advisor">
            <p class="footer-advisor-name">{{ getText(advisor.labelKey) }}</p>
            <p>TEL: {{ advisor.phone }}</p>
            <p>WECHAT: {{ getText('contact.wechat') }}</p>
            <img class="footer-advisor-qrcode" :src="advisor.qrCodeUrl" :alt="getText(advisor.labelKey)" />
          </div>
        </div>
      </div>

      <div class="address footer-common">
        <p class="mb26">{{ getText('footer.address') }}</p>
        <p>
          {{ getText('footer.addressLine1') }}<br />
          {{ getText('footer.addressLine2') }}
        </p>
      </div>
      <div class="copyright">
        <p>
          {{ getText('footer.copyright') }}
        </p>
        <a class="copyright-record" href="https://beian.miit.gov.cn" target="_blank">{{ getText('footer.icp') }}</a>
      </div>

    </el-row>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { getText } from "@/utils/language";
import { openRecruitmentLink } from "@/utils/recruitmentLink";
import { contactAdvisors } from "@/config/contactAdvisors";

const router = useRouter();

const handleJumps = (item) => {
  router.push({ name: item });
};
</script>
<style lang="less" scoped>
@import "@/style/variable.less";

.footer {
  position: relative;
  display: flex;
  justify-content: space-between;
  position: relative;
  background-color: #11161b;
  border-width: 1px 0 0 0;
  padding: 40px 0;
  /* 只设置上边框 */
  border-style: solid;
  border-image: linear-gradient(to right,
      rgba(53, 52, 74, 0.5) 0%,
      rgba(53, 52, 74, 0.5) 10%,
      rgba(255, 255, 255, 0.4) 30%,
      rgba(255, 255, 255, 0.4) 70%,
      rgba(53, 52, 74, 0.5) 90%,
      rgba(53, 52, 74, 0.5) 100%) 1;

  .left-line {
    width: 20px;
    margin: 0 30px 0 5px;
  }

  &-common {
    font-weight: 500;
    font-size: 14px;
    color: #ffffff;
  }

  &-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-bottom: 40px;

    &-logo {
      display: flex;
      align-items: center;

      &-img {
        width: 100%;
        height: 100%;

        &-w {
          width: 110px;

          img {
            width: 90px;
          }

          border-right: 1px solid white;
        }
      }

      &-text1,
      &-text2 {
        font-size: 14px;
        font-weight: 500;
        color: #ffffff;
      }

      &-text1 {
        width: 57px;
        margin-left: 42px;
        text-align: right;
      }

      &-text2 {
        width: 70px;
        margin-left: 15px;
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
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      gap: 30px;
      margin-bottom: 40px;

      .gray-text {
        color: #6c7077;
      }


      &-menus {
        font-size: 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        &-item {
          width: 101px;
          height: 30px;
          line-height: 30px;
          cursor: pointer;
        }
      }

      &-products {
        display: flex;
        flex-direction: column;
        gap: 20px;

        &-item {
          width: 120px;
          height: 30px;
          line-height: 30px;


          &-title {
            width: 101px;
          }
        }
      }

      &-about {
        display: flex;
        flex-direction: column;
        gap: 20px;

        &-item {
          width: 101px;
          height: 30px;

          &-title {
            width: 101px;
          }
        }
      }
    }






  }

  .footer-advisors {
    width: 100%;
    margin-top: 8px;

    &-title {
      margin-bottom: 16px;
    }

    &-list {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 24px 16px;
    }
  }

  .footer-advisor {
    min-width: 0;
    color: #ffffff;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.6;

    &-name {
      min-height: 38px;
      font-size: 14px;
      line-height: 1.35;
    }

    &-qrcode {
      display: block;
      width: min(128px, 100%);
      aspect-ratio: 1;
      margin: 8px 0 0;
      justify-self: start;
      border-radius: 0 !important;
      object-fit: contain;
      background: #ffffff;
    }
  }

  @media (max-width: 360px) {
    .footer-advisors-list {
      grid-template-columns: 1fr;
    }

    .footer-advisor-name {
      min-height: 0;
    }
  }

  .address {
    font-size: 13px;
    line-height: 20px;
    margin: 40px 0 30px;
  }

  .copyright {
    color: #ffffff;
    margin: 30px 0 0;
    font-size: 10px;
    line-height: 17px;
    &-record{
      color: #ffffff;
    }
    &-record:hover{
      color: #FF7200;
      text-decoration: none;
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
