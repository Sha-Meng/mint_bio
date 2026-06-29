<template>
  <div class="header-w">
    <div class="header">
      <div class="header-left">
        <div class="header-left-logo" :style="{ cursor: 'pointer' }">
          <img src="@/assets/images/logo.png" alt="Logo" @click="handleJumps('home')" />
        </div>
      </div>
      <div class="header-right">
        <el-popover placement="bottom" width="370" trigger="manual" :visible="visible" :show-arrow="false" effect="dark"
          popper-class="header-mobile-popover" :popper-options="popperOptions">
          <div class="popover-close" @click="visible = !visible">
            <!-- <img src="./images/close.png" alt="close" /> -->
             x
          </div>
          <div class="popover-mobile-content">
            <div class="popover-mobile-content-menu">
              <div class="popover-mobile-content-menu-item">
                <p class="pointer" @click="handleJumps('bioIntelligent')">
                  {{ getText('nav.bioIntelligent') }}
                </p>
              </div>
              <div class="popover-mobile-content-menu-item">
                <div @click="togglePanel('productPanel')">{{ getText('nav.products') }} 
                    <span class="plus">{{isPanelOpen.productPanel ? 'x' : '+'}}</span>
                  </div>
                <p class="pointer" v-if="isPanelOpen.productPanel" @click="handleJumps('material')">{{ getText('nav.material') }}</p>
                <p class="pointer" v-if="isPanelOpen.productPanel" @click="handleJumps('aminoAcid')">{{ getText('nav.aminoAcid') }}</p>
                <p class="pointer" v-if="isPanelOpen.productPanel" @click="handleJumps('knotWeed')">{{ getText('nav.knotWeed') }}</p>
              </div>
              <div class="popover-mobile-content-menu-item">
                <div @click="togglePanel('aboutUsPanel')">{{ getText('nav.aboutUs') }}
                  <span class="plus">{{isPanelOpen.aboutUsPanel ? 'x' : '+'}}</span>
                  </div>
                <p class="pointer" v-if="isPanelOpen.aboutUsPanel" @click="handleJumps('corporate')">{{ getText('nav.corporate') }}</p>
                <p class="pointer" v-if="isPanelOpen.aboutUsPanel" @click="handleJumps('vision')">{{ getText('nav.vision') }}</p>
                <p class="pointer" v-if="isPanelOpen.aboutUsPanel" @click="handleRecruitmentClick">{{ getText('nav.joinUs') }}</p>
              </div>
              <div class="popover-mobile-content-menu-item noDivider" >
                <p class="pointer" @click="handleJumps('mintNews')">{{ getText('nav.news') }}</p>
              </div>
              <!-- <div class="popover-mobile-content-menu-item">
                <p>加入我们</p>
              </div>
              <div class="popover-mobile-content-menu-item">
                <p>下载中心</p>
              </div> -->
            </div>
            <div v-if="isEnglishEnabled()" class="popover-mobile-content-language">
              <p class="popover-mobile-content-language-cn" 
                 :class="{ 'active-language': currentLanguage === 'zh' }"
                 @click="toggleToCN">CN</p>
              <p class="popover-mobile-content-language-en"
                 :class="{ 'active-language': currentLanguage === 'en' }"
                 @click="toggleToEN">EN</p>
            </div>
          </div>
          <template #reference>
            <div class="menu" @click="visible = !visible">
              <img src="@/assets/images/menu.png" alt="Menu" />
            </div>
          </template>
        </el-popover>
        <div v-if="visible" class="popover-mobile-overlay" @click="visible = false"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { currentLanguage, switchLanguage, getText, isEnglishEnabled } from '@/utils/language';
import { openRecruitmentLink } from '@/utils/recruitmentLink';

const router = useRouter();

const visible = ref(false);
const isPanelOpen = reactive({
  productPanel: false,
  aboutUsPanel: false
});

// 语言切换函数
const toggleToCN = () => switchLanguage('zh');
const toggleToEN = () => switchLanguage('en');

const togglePanel = (panel) => {
  // 关闭所有面板
  for(let key in isPanelOpen){
    if(key !== panel){
      isPanelOpen[key] = false;
    }
  }
  isPanelOpen[panel] = !isPanelOpen[panel];
};

const handleJumps = (target) => {
  visible.value = false;
  router.push({ name: target });
};

const handleRecruitmentClick = () => {
  visible.value = false;
  openRecruitmentLink();
};

const popperOptions = ref({
  modifiers: [{
    name: "offset",
    options: {
      offset: [0, 10],
    },
  }],
});


</script>

<style lang="scss">
.el-popover.el-popper.header-mobile-popover {
  /* padding: 24px 26px 95px 72px; */
  padding-left: 40px;
  background-color: #12161b;
  border-radius: 12px;
}
</style>
<style lang="less" scoped>
@import "@/style/variable.less";

.popover-close {
  text-align: right;
}

.popover-mobile-content {
  width: 100%;
  display: flex;
  align-items: flex-start;

  &-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
  }

  &-wrapper {
    display: flex;
    justify-content: space-between;
  }

  &-menu {
    display: flex;
    flex-direction: column;

    &-item {
      min-height: 60px;
      line-height: 60px;
      width: 160px;
      border-bottom: 1px solid #3a3e41;
      font-size: 14px;
      color: #f1f3f7;

      .plus {
        width: 10px;
        height: 10px;
        margin-left: 16px;
        transition: transform 0.3s ease;
        display: inline-block; // 确保 span 可以旋转
      }

      .rotated {
        transform: rotate(45deg); // 修改为 45deg 以实现 + 变成 x 的效果
      }
    }
    .noDivider{
    border-bottom: none;
    }
  }


  &-language {
    margin-left: 57px;

    &-cn,
    &-en {
      width: 30px;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      font-weight: 500;
      color: #f1f3f7;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        color: #ff7200;
      }
    }

    .active-language {
      color: #ff7200 !important;
      font-weight: 600;

      &::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 4px;
        background-color: #ff7200;
        border-radius: 50%;
        margin-right: 4px;
      }
    }
  }

  &-download {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 158px;
    height: 67px;
    color: #f1f3f7;
    border: 1px solid #ffffff1a;
    border-radius: 999px;
  }
}

.popover-mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9;
}

.header-w {
  display: flex;
  justify-content: center;
  z-index: 4;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  padding: 15px 0;

  .header {
    width: 370px;
    flex-direction: row;
    display: flex;
    justify-content: space-between;

    &-left {
      &-logo {
        width: 102px;
        height: 50px;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    &-right {
      .menu {
        width: 54px;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .header::after {
    content: "";
    position: absolute;
    top: 0;
    /* 位于边框下方 */
    left: 50%;
    /* 水平居中 */
    width: 80%;
    /* 光晕的宽度 */
    height: 450px;
    /* 光晕的高度 */
    background: radial-gradient(55% 50% at 50% 0%,
        rgba(255, 255, 255, 0.5) 0%,
        rgba(255, 255, 255, 0) 100%);
    transform: translateX(-50%);
    filter: blur(20px);
    opacity: 0.1;
    pointer-events: none;
    /* 光晕不影响交互 */
  }
}


.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
