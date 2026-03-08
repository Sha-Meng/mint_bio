<template>
  <div class="corporate">
    <BannerTitleAnimationMobile :backgroundImg="require('@/assets/images/corporateVision.png')" :isShowHeader="false">
      <div class="banner-title-content">
        <div class="banner-title-zh">{{ getText('bannerTitle.corporate.line1') }}</div>
        <div class="banner-title-en">{{ getText('bannerTitle.corporate.line2') }}</div>
      </div>
    </BannerTitleAnimationMobile>
    <div class="introduction">
      <div class="introduction-section">
        {{ getText('corporate.intro1') }}
      </div>
      <div class="introduction-section">
        {{ getText('corporate.intro2') }}
      </div>
      <div class="introduction-section">
        {{ getText('corporate.intro3') }}
      </div>
    </div>
    <div class="timeline">
      <div class="timeline-list">
        <div class="timeline-list-item" v-for="(item, index) in timeList" :key="index">
          <div class="timeline-list-item-time" :style="{ color: item.color, width: item.width }">
            {{ item.time }}
          </div>
          <div class="timeline-list-item-content" :style="{ color: item.color, width: item.width }">
            {{ item.content }}
          </div>
        </div>
      </div>

    </div>

    <div class="story  border-gradient">
      <div class="story-img-box">
        <div class="story-img-box-item">
          <img src="@/assets/images/story-1.png" alt="" />
          <div class="plus" @click="toggleStoryItem">+</div>
          <div>{{ getText('corporate.founders.zhang.name') }}</div>
          <div>{{ getText('corporate.founders.zhang.title') }}</div>
        </div>
        <div class="story-img-box-item">
          <img src="@/assets/images/story-2.png" />
          <div class="plus" @click="toggleStoryItem2">+</div>
          <div>{{ getText('corporate.founders.liu.name') }}</div>
          <div>{{ getText('corporate.founders.liu.titleMobile') }}</div>

        </div>

      </div>
      <div :class="{ 'visible': isStoryItemVisible, 'story-item border-gradient story-item-left': true }">
        <div class="close-icon" @click="toggleStoryItem">X</div>
        <div class="top">
          <div class="top-left">
            <img src="@/assets/images/story-1.png" alt="" />
          </div>
          <div class="top-right space-between">
            <div>
              <div class="margin-bottom">
                <p>{{ getText('corporate.founders.zhang.name') }}</p>
                <p>{{ getText('corporate.founders.zhang.title') }}</p>
              </div>
              <div class="margin-bottom">
                <p>{{ getText('corporate.founders.zhang.position1') }}</p>
                <p>{{ getText('corporate.founders.zhang.position2') }}</p>
              </div>
            </div>

            <img src="@/assets/images/story-3.png" class="img-right" />
          </div>
        </div>
        <div class="bottom">
          {{ getText('corporate.founders.zhang.bio') }}
        </div>
      </div>

      <div :class="{ 'visible': isStoryItemVisible2, 'story-item border-gradient story-item-right': true }">

        <div class="close-icon" @click="toggleStoryItem2">X</div>
        <div class="top">
          <div class="top-left">
            <img src="@/assets/images/story-2.png" alt="" />
          </div>
          <div class="top-right">
            <div class="margin-bottom">
              <p>{{ getText('corporate.founders.liu.name') }}</p>
              <p>{{ getText('corporate.founders.liu.titleMobile') }}</p>
            </div>
            <div class="font-12">
              <p>{{ getText('corporate.founders.liu.position1Mobile') }}</p>
              <p>{{ getText('corporate.founders.liu.position4Mobile') }}</p>
              <p>{{ getText('corporate.founders.liu.position2') }}</p>
              <p>{{ getText('corporate.founders.liu.position3') }}</p>
              <p>{{ getText('corporate.founders.liu.position5Mobile') }}</p>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="bottom-left">
            <p>
              {{ getText('corporate.founders.liu.bio1') }}
            </p>
            <p>
              {{ getText('corporate.founders.liu.bio2') }}
            </p>
          </div>
          <ul class="bottom-right">
            <li v-for="(item, index) in getText('corporate.achievements')" :key="index">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="scientific mobile-sector border-gradient">
      <div class="scientific-title">
        <div>
          <span>{{ getText('corporate.frontend') }}</span><span class="orange-text">{{ getText('corporate.research') }}</span><span>{{ getText('corporate.breakthrough') }}</span>
        </div>
        <div class="scientific-title-middle">
          <p>{{ getText('corporate.roadDescMobile1') }}</p>
          <p>{{ getText('corporate.roadDescMobile2') }}</p>
        </div>
        <div>
          <span>{{ getText('corporate.backend') }}</span><span class="orange-text">{{ getText('corporate.landing') }}</span><span>{{ getText('corporate.massProduction') }}</span>
        </div>
      </div>
      <div class="scientific-card">
        <div class="scientific-card-top">
          <div class="menu-item">MiNT BiO</div>
          <div :class="{ 'menu-item': true, 'active': activeIndex === 0 }" @click="itemMove(cardList[0])">{{ getText('corporate.rdCenter') }}

            <div class="slider" :style="{ left: sliderPosition + 'px' }"></div>

          </div>
          <div :class="{ 'menu-item': true, 'active': activeIndex === 1 }" @click="itemMove(cardList[1])">{{ getText('corporate.rdTeamMobile') }}</div>
        </div>
        <div class="scientific-card-content">
          <img :src="cardList[activeIndex].textMiddle" class="text-middle" />
          <div class="text-bottom">{{ cardList[activeIndex].textBottom }}</div>
          <img :src="cardList[activeIndex].imSrc" :key="imgSrc" class="main-img" />
        </div>
      </div>
    </div>

    <!-- <div class="project">
      <img src="@/assets/images/corporates.png" alt="">
    </div> -->
    <div class="project">
        <div v-for="item in corpList" :key="item.key" class="project-image">
          <img :src="item.imgSrc" alt="" />
        </div>
      </div>
    <div class="banner-sector">
      <img src="@/assets/images/banners-mobile.png" class="banner-img" />
    </div>
  </div>
</template>

<script>
import BannerTitleAnimationMobile from "@/components/BannerTitleAnimationMobile";
import { computed } from "vue";
import { getText } from "@/utils/language";

export default {
  name: " CorporateVision",
  components: { BannerTitleAnimationMobile },
  setup() {
    const timeList = computed(() => {
      const timeline = getText('corporate.timeline');
      const items = Array.isArray(timeline) ? timeline.map(item => ({
        time: item.year,
        content: item.desc,
      })) : [];
      items.push({
        time: getText('corporate.futureTitle'),
        content: getText('corporate.futureDesc'),
        color: "#00965A",
        width: "480px",
      });
      return items;
    });

    const cardList = computed(() => [
      {
        index: 0,
        textTop: getText('corporate.rdTeamMobile'),
        textMiddle: require("@/assets/images/number-1.png"),
        textBottom: getText('corporate.rdCenterDesc'),
        imSrc: require("@/assets/images/scientific.png"),
      },
      {
        index: 1,
        textTop: getText('corporate.rdTeamMobile'),
        textMiddle: require("@/assets/images/number-2.png"),
        textBottom: getText('corporate.rdTeamDesc'),
        imSrc: require("@/assets/images/scientific-2.png"),
      },
    ]);

    return { titleStyle: { top: "47%" }, getText, timeList, cardList };
  },
  data() {
    return {
      isStoryItemVisible: false,
      isStoryItemVisible2: false,
      sliderPosition: 0,
      imgSrc: require("@/assets/images/scientific.png"),
      activeIndex: 0,
      corpList: [
        {
          imgSrc: require("@/assets/CorporateVision/corp8.png"),
          key: 8,
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/CorporateVision/corp1.png"),
          key: 1,
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/CorporateVision/corp2.png"),
          key: 2,
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/CorporateVision/corp3.png"),
          key: 3,
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/CorporateVision/corp4.png"),
          key: 4,
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/CorporateVision/corp5.png"),
          key: 5,
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/CorporateVision/corp6.png"),
          key: 6,
          transform: "scale(1)",
        },
        {
          imgSrc: require("@/assets/CorporateVision/corp7.png"),
          key: 7,
          transform: "scale(1)",
        },
      ],
      isPrevDisabled: true,
      isNextDisabled: false,
      timelineElement: null,
    };
  },
  mounted() {
    this.timelineElement = document.querySelector(".timeline-list");
    this.timelineElement.addEventListener("scroll", this.handleScroll);
    this.updateButtonState();
    this.updateSliderPosition();
  },
  beforeDestroy() {
    if (this.timelineElement) {
      this.timelineElement.removeEventListener("scroll", this.handleScroll);
    }
  },
  methods: {
    updateSliderPosition() {
      const buttons = document.querySelectorAll('.scientific-card-top .menu-item');
      if (buttons.length > this.activeIndex) {
        const button = buttons[this.activeIndex];
        this.sliderPosition = button.offsetLeft;
      }
    },
    handleScroll() {
      this.updateButtonState();
    },
    updateButtonState() {
      if (!this.timelineElement) return;
      const { scrollLeft, scrollWidth, clientWidth } = this.timelineElement;
      this.isPrevDisabled = scrollLeft <= 0;
      this.isNextDisabled = scrollLeft + clientWidth >= scrollWidth;
    },
    scrollTimeline(direction) {
      if (!this.timelineElement) return;

      const scrollStep = 1200; // 每次滚动的距离
      if (direction === "prev") {
        this.timelineElement.scrollLeft -= scrollStep;
      } else if (direction === "next") {
        this.timelineElement.scrollLeft += scrollStep;
      }
      this.updateButtonState();
    },

    itemMove(item) {
      this.activeIndex = item.index;
      this.updateSliderPosition();
    },
    toggleStoryItem() {
      this.isStoryItemVisible = !this.isStoryItemVisible;
    },
    toggleStoryItem2() {
      this.isStoryItemVisible2 = !this.isStoryItemVisible2;
    },
  },
};
</script>
<style lang="less" scoped>
@import "@/style/variable.less";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); // 使用更复杂的缓动函数
}

.fade-enter,
.fade-leave-to {
  opacity: 0.5;
}

.corporate {
  background-color: #11161b;

  .banner-title-content {
    text-align: center;
    .banner-title-zh {
      font: 600 28px MiSans;
      color: #ffffff;
      letter-spacing: 2px;
    }
    .banner-title-en {
      font: 400 14px Montserrat;
      color: rgba(241, 243, 247, 0.8);
      margin-top: 8px;
    }
  }

  .introduction {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 30px 0;

    &-img {
      width: 100%;
      margin: 60px auto;
    }

    &-section {
      width: 100%;
      margin-bottom: 20px;
      font-family: MiSans;
      font-size: 14px;
      line-height: 22px;
      font-weight: 450;
      text-align: left;
      color: #fff;
    }
  }

  .timeline {
    position: relative;

    &-list {
      margin: 60px 0;
      color: #fff;
      display: flex;
      flex-shrink: 0;
      overflow: scroll;
      scroll-behavior: smooth;
      flex-direction: row;
      padding-left: 45px;
      padding-bottom: 40px;

      &::-webkit-scrollbar {
        display: none;
      }

      &-item {
        &-time {
          padding: 0 20px 20px;
          font-family: MiSans;
          font-size: 24px;
          font-weight: 450;
          text-align: left;
          border-bottom: 1px solid rgba(241, 243, 247, 0.4);
          width: 100%;
        }

        &-time:first-child {
          padding-left: 0;
        }

        &-content {
          padding: 20px 40px 60px 0;
          font-family: MiSans;
          font-size: 12px;
          font-weight: 520;
          text-align: left;
          line-height: 22px;
        }
      }
    }
  }

  .story {
    padding: 80px 10px 40px;
    height: 370px;
    font-size: 12px;
    line-height: 20px;
    color: #fff;
    position: relative;

    .font-12 {
      font-size: 12px;
    }

    &-img-box {
      display: flex;
      justify-content: space-between;
      gap: 10px;

      &-item {
        font-size: 14px;
        line-height: 21px;
        position: relative;
        width: 180px;
        height: 210px;
        margin-top: 20px;
        position: relative;

        img {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          object-fit: cover;
          object-position: 50% 10%;

          margin-bottom: 20px;
        }

        .plus {
          width: 31px;
          height: 31px;
          line-height: 31px;
          text-align: center;
          border-radius: 6px;
          background: #FF7200;
          position: absolute;
          right: 8px;
          bottom: 8px;
          font-size: 20px;
          font-weight: 200;
          color: #fff;
        }

      }


    }

    .margin-bottom {
      margin-bottom: 20px;
    }

    &-item {
      top: -50px;
      position: absolute;
      background: #24272a;
      width: 360px;
      transition: all 0.3s ease-in-out; // 平滑过渡效果
      z-index: 99999;
      padding: 20px;
      box-sizing: border-box;
      border-radius: 12px;
      padding: 60px 20px 30px;
      border: 1px solid #828486;
      border-radius: 12px;


      .close-icon {
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 16px;
        font-weight: 400;
        color: white;
      }

      .top {
        height: 170px;
        display: flex;
        flex-direction: row;
        gap: 12px;
        margin-bottom: 40px;

        &-left {
          width: 40%;

          img {
            width: 100%;
            height: 150px;
            border-radius: 4px;
            object-fit: cover;
            object-position: 50% 10%;
          }
        }

        &-right {
          height: 100%;
          width: 60%;
          font-size: 14px;
          padding: 10px 0;
          position: relative;

          .img-right {
            width: 80px;
            position: absolute;
            right: 10px;
            bottom: 10px;
          }
        }

        .space-between {
          justify-content: space-between;
        }
      }

      .bottom {
        text-align: justify;
        display: flex;

        &-left {
          flex: 1;
          padding-right: 28px;
        }

        &-right {
          flex: 1;
          list-style: disc;
        }
      }
    }

    .story-item-right {
      top: 0;
      right: -100%;
    }

    .story-item-left {
      top: 0;
      left: -100%;
    }

    .story-item-right.visible {
      right: 15px;
      top: 0;
    }

    .story-item-left.visible {
      left: 15px;
      top: 0;
    }
  }
}

.scientific {
  color: #fff;
  font-size: 14px;
  font-weight: 520;
  padding: 0 10px;

  &-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 60px;
    font-size: 25px;

    &-middle {
      margin: 20px auto;
      font-size: 12px;
      font-weight: 450;
      text-align: center;
      color: rgba(241, 243, 247, 0.5);
    }
  }

  &-card {
    border-radius: 12px;
    margin: 40px auto 60px;
    transition: all 0.3s ease-in-out; // 平滑过渡效果
    border: 1px solid #444649;



    &-content {
      padding: 10px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      flex-direction: column;

      .text-middle {
        margin: 30px auto 10px;
        width: 118px;
      }

      .text-bottom {
        margin-bottom: 30px;
      }

    }

    &-top {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: space-between;
      height: 36px;
      line-height: 36px;
      color: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 8.85%, rgba(255, 255, 255, 0.5) 100%);


      .menu-item {
        text-align: center;
        font-size: 14px;
        font-weight: 400;
        transition: all 0.3s ease-in-out; // 平滑过渡效果
        border-bottom: 1px solid #444649;

        &:nth-child(1) {
          background: #181c20;
          color: #F1F3F780;
          width: 90px;
        }

        &:nth-child(2) {
          width: calc(100% - 230px);
          background: #181c20;
          position: relative;

          .slider {
            // position: absolute;
            // bottom: 0;
            // left: 90px;
            // height: 2px;
            // background: #FF7200;
            // transition: all 0.3s ease-in-out;
            // width: 100px;
          }
        }

        &:nth-child(3) {
          width: 140px;
          background: #181c20;
        }

        &.active {
          background: linear-gradient(0deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.01)),
            radial-gradient(63.94% 63.94% at 50% 0%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 100%);
          border: 1px solid #444649;
          border-bottom: none;
        }
      }


    }

    .main-img {
      width: 350px;
      height: 214px;
      object-fit: cover;
      border-radius: 12px;
    }

  }
}

.project {
  padding: 70px 30px 29px 30px;
  display: flex;
  flex-wrap: wrap;
  row-gap: 29px;
  column-gap: 30px;

  &-item {
    width: 141.18px;
    height: 116.71px;
    background: #2828289F;
    border: 0.45px solid #2d2e2e;
    border-radius: 9.07px;
  }

  &-image {
    width: 150px;
    height: 124px;
    // margin-right: 30px;

    img {
      width: 100%;
    }
  }

  // &-image:nth-child(n) {
  //   margin-right: 0;
  // }
}

.banner-sector {
  padding: 60px 10px;

  img {
    width: 100%;
  }
}
</style>
