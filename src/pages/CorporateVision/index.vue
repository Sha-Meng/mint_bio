<template>
  <div class="corporate ">
    <BannerTitleAnimation :titleImage="require('@/assets/images/vision-title.png')"
      :backgroundImg="require('@/assets/images/corporateVision.png')" />
    <div class="introduction">
      <div v-intersect="() => (title1InView = true)">
        <img v-if="title1InView" src="@/assets/images/introduction-title.png" alt=""
          class="introduction-img animate__animated animate__fadeInUp" />
      </div>
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
          <div class="timeline-list-item-divider"></div>
          <div class="timeline-list-item-content" :style="{ color: item.color, width: item.width }">
            {{ item.content }}
          </div>
        </div>
      </div>

      <div class="buttons">
        <div class="prev" :class="{ disabled: isPrevDisabled }" @click="scrollTimeline('prev')">
          &lt;
        </div>
        <div class="next" :class="{ disabled: isNextDisabled }" @click="scrollTimeline('next')">
          &gt;
        </div>
      </div>
    </div>

    <div class="story sector border-gradient">
      <div class="story-item">
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
          </div>
        </div>
        <div class="bottom">
          <div class="bottom-left">
            <p>
              {{ getText('corporate.founders.zhang.bio') }}
            </p>
          </div>
          <ul class="bottom-right">
            <li v-for="(item, index) in getText('corporate.founders.zhang.achievements')" :key="index">{{ item }}</li>
          </ul>
        </div>
      </div>

      <div class="story-item">
        <div class="top">
          <div class="top-left">
            <img src="@/assets/images/story-2.png" alt="" />
          </div>
          <div class="top-right">
            <div class="margin-bottom">
              <p>{{ getText('corporate.founders.liu.name') }}</p>
              <p>{{ getText('corporate.founders.liu.title') }}</p>
            </div>
            <div>
              <p>{{ getText('corporate.founders.liu.position1') }}</p>
              <p>{{ getText('corporate.founders.liu.position2') }}</p>
              <p>{{ getText('corporate.founders.liu.position3') }}</p>
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

    <div v-intersect="() => (title2InView = true)" class="scientific sector border-gradient">
      <div v-if="title2InView" class="scientific-title animate__animated animate__fadeInUp animate__slow">
        <div class="scientific-title-left">
          <div>
            <span>{{ getText('corporate.frontend') }}</span><span class="opacity-0">{{ getText('corporate.research') }}</span><span>{{ getText('corporate.breakthrough') }}</span>
          </div>
          <div>
            <span class="opacity-0">{{ getText('corporate.frontend') }}</span><span class="orange-text">{{ getText('corporate.research') }}</span><span class="opacity-0">{{ getText('corporate.breakthrough') }}</span>
          </div>
        </div>
        <div class="scientific-title-middle">
          <p v-for="line in roadDescLines" :key="line">{{ line }}</p>
        </div>
        <div class="scientific-title-right">
          <div class="scientific-title-left">
            <div>
              <span>{{ getText('corporate.backend') }}</span><span class="opacity-0">{{ getText('corporate.massProduction') }}</span><span>{{ getText('corporate.landing') }}</span>
            </div>
            <div>
              <span class="opacity-0">{{ getText('corporate.backend') }}</span><span class="orange-text">{{ getText('corporate.massProduction') }}</span><span class="opacity-0">{{ getText('corporate.landing') }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="title2InView" class="scientific-card animate__animated animate__fadeInUp animate__slow">
        <div class="scientific-card-left">
          <div class="scientific-card-left-item" v-for="(card, index) in cardList" :key="index"
            @mousemove="itemMove(card)" :class="{ active: activeIndex === index }">
            <div class="top button-top">{{ card.textTop }}</div>
            <div class="middle metric">{{ card.textMiddle }}</div>
            <div class="bottom">{{ card.textBottom }}</div>
          </div>
        </div>
        <div class="scientific-card-right">
          <transition name="fade" mode="in-out">
            <img :src="imgSrc" :key="imgSrc" />
          </transition>
        </div>
      </div>
    </div>

    <div v-intersect="() => (title3InView = true)" class="project-w border-gradient">
      <div v-if="title3InView" class="project animate__animated animate__fadeInUp">
        <div v-for="item in corpList" :key="item.key" class="project-image hover-scale-transition"
          @mousemove="cardHover(item)" @mouseleave="cardLeave(item)" :style="{ transform: transformMap[item.key] || 'scale(1)' }">
          <HonorCard :line1="item.line1" :line2="item.line2" :line3="item.line3" :uid-key="item.key" />
        </div>
      </div>
    </div>
    <div v-intersect="() => (title4InView = true)" class="banner-sector">
      <img v-if="title4InView" src="@/assets/images/banners.png"
        class="banner-img animate__animated animate__fadeInUp" />
    </div>
  </div>
</template>

<script>
import BannerTitleAnimation from "@/components/BannerTitleAnimation";
import HonorCard from "@/components/HonorCard";
import { onMounted, computed } from "vue";
import { getText } from "@/utils/language";

export default {
  name: " CorporateVision",
  components: { BannerTitleAnimation, HonorCard },
  setup() {

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        } else {
          entry.target.classList.remove('fade-in');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3,
    });

    onMounted(() => {
      const dom = document.querySelector('.project-img')
      const bannerDom = document.querySelector('.banner-img')

      if (dom && bannerDom) {
        observer.observe(dom);
        observer.observe(bannerDom);
      }
    });

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

    const roadDescLines = computed(() => {
      const lines = [getText('corporate.roadDesc1')];
      return lines.filter((line) => typeof line === 'string' && line.trim());
    });

    const cardList = computed(() => [
      {
        index: 0,
        textTop: getText('corporate.rdCenter'),
        textMiddle: getText('corporate.rdCenterMetric'),
        textBottom: getText('corporate.rdCenterDesc'),
        imRight: require("@/assets/images/scientific.png"),
      },
      {
        index: 1,
        textTop: getText('corporate.rdTeam'),
        textMiddle: getText('corporate.rdTeamMetric'),
        textBottom: getText('corporate.rdTeamDesc'),
        imRight: require("@/assets/images/scientific-2.png"),
      },
    ]);

    // 荣誉条目展示顺序对应的 key（稳定用于 SVG filter/gradient 唯一 id 及 hover 缩放状态）
    const HONOR_KEYS = [8, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12];
    const corpList = computed(() => {
      const honors = getText('corporate.honors');
      if (!Array.isArray(honors)) return [];
      return honors.map((h, index) => ({
        key: HONOR_KEYS[index],
        line1: h.line1,
        line2: h.line2,
        line3: h.line3,
      }));
    });

    return { titleStyle: { top: "47%" }, getText, timeList, roadDescLines, cardList, corpList };
  },
  data() {
    return {
      imgSrc: require("@/assets/images/scientific.png"),
      activeIndex: 0,
      transformMap: {},
      isPrevDisabled: true,
      isNextDisabled: false,
      timelineElement: null,
      title1InView: false,
      title2InView: false,
      title3InView: false,
      title4InView: false,
    };
  },
  mounted() {
    this.timelineElement = document.querySelector(".timeline-list");
    this.timelineElement.addEventListener("scroll", this.handleScroll);
    this.updateButtonState();
  },
  beforeDestroy() {
    if (this.timelineElement) {
      this.timelineElement.removeEventListener("scroll", this.handleScroll);
    }
  },
  methods: {
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
      if (this.activeIndex !== item.index) {
        this.imgSrc = item.imRight;
        this.activeIndex = item.index;
      }
    },
    cardHover(card) {
      this.transformMap = { ...this.transformMap, [card.key]: "scale(1.05)" };
    },
    cardLeave(card) {
      this.transformMap = { ...this.transformMap, [card.key]: "scale(1)" };
    },
  },
};
</script>
<style lang="less" scoped>
@import "@/style/variable.less";

.project-img,
.banner-img {
  opacity: 0;
  transform: translateY(100px);
  transition: opacity 1s ease-in-out, transform 1s ease-in-out;
}

.project-img.fade-in,
.banner-img.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.corporate {
  background-color: #11161b;


  .introduction {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 160px 0;

    &-img {
      width: 1042px;
      margin: 80px auto 160px;
    }

    &-section {
      width: 1184px;
      margin-bottom: 60px;
      font-family: MiSans;
      font-size: 24px;
      line-height: 32px;
      font-weight: 450;
      line-height: 39px;
      text-align: left;
      color: #fff;
    }
  }

  .timeline {
    position: relative;

    .buttons {
      width: 104px;
      display: flex;
      justify-content: space-between;
      height: 22px;
      position: absolute;
      bottom: 0;
      right: 80px;

      div {
        text-align: center;
        line-height: 22px;
        width: 22px;
        height: 22px;
        border: 1px solid #fff;
        background: #595c5f;
        color: #ff7200;
        cursor: pointer;
        transition: background-color 0.3s;

        &.disabled {
          background: #ccc;
          color: #666;
          cursor: not-allowed;
        }
      }
    }

    &-list {
      margin: 100px 0;
      color: #fff;
      display: flex;
      flex-shrink: 0;
      overflow: scroll;
      scroll-behavior: smooth;
      flex-direction: row;
      padding-left: 160px;
      padding-bottom: 40px;

      &::-webkit-scrollbar {
        display: none;
      }

      &-item {
        &-time {
          padding: 0 60px;
          font-family: MiSans;
          font-size: 60px;
          font-weight: 450;
          text-align: left;
          // border-bottom: 1px solid rgba(241, 243, 247, 0.4);
          width: 100%;

          &:hover {
            cursor: pointer;
            color: #ff7200;
            transform: scale(1.1);
            transition: all 0.6s ease-in-out;
          }
        }

        &-time:first-child {
          padding-left: 0;
        }

        &-divider {
          width: 100%;
          height: 1px;
          background: rgba(241, 243, 247, 0.4);
        }

        &-content {
          padding: 60px 80px 60px 0;
          font-family: MiSans;
          font-size: 20px;
          font-weight: 520;
          text-align: left;
          line-height: 27px;

          &:hover {
            cursor: pointer;
            color: #ff7200;
            transition: all 0.6s ease-in-out;
          }
        }
      }
    }
  }

  .story {
    display: flex;
    gap: 60px;
    font-family: MiSans;
    font-size: 20px;
    color: #fff;
    font-weight: 380;
    line-height: 33px;
    letter-spacing: 0;

    .margin-bottom {
      margin-bottom: 20px;
      white-space: pre-line;
    }

    &-item {
      width: 50%;

      .top {
        height: 492px;
        display: flex;
        flex-direction: row;
        gap: 32px;
        margin-bottom: 40px;

        &-left {
          width: 50%;

          img {
            width: 100%;
            height: 492px;
            object-fit: cover;
            object-position: center top;
            border-radius: 20px;
          }
        }

        &-right {
          display: flex;
          flex-direction: column;
          padding: 20px 0;
        }

        .space-between {
          justify-content: space-between;
        }
      }

      .bottom {
        text-align: justify;
        display: flex;
        white-space: pre-line;

        &-left {
          flex: 1;
          padding-right: 48px;

          p {
            white-space: pre-line;
          }
        }

        &-right {
          flex: 1;
          list-style: disc;
        }
      }
    }
  }
}

.scientific {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-family: MiSans;
  font-size: 50px;
  font-weight: 520;

  &-title {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 68px;

    .opacity-0 {
      opacity: 0;
    }

    &-middle {
      font-family: MiSans;
      font-size: 14px;
      font-weight: 450;
      text-align: center;
      color: rgba(241, 243, 247, 0.5);
      height: 82px;
    }
  }

  &-card {
    height: 578px;
    width: 85%;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 80px;

    &-left {
      width: calc(100% - 54%);
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      height: 578px;

      &-item {
        transition: opacity 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 50%;
        padding: 32px;
        border-radius: 20px;
        background: rgba(40, 40, 40, 0.6226);
        border: 1px solid;
        border-image: linear-gradient(156.52deg,
            rgba(255, 255, 255, 0.4) 2.12%,
            rgba(255, 255, 255, 0.0001) 39%,
            rgba(255, 255, 255, 0.0001) 54.33%,
            rgba(255, 255, 255, 0.1) 93.02%);

        .metric {
          color: #ff7200;
          font-family: MiSans;
          font-size: 54px;
          font-weight: 520;
          line-height: 1.1;
          letter-spacing: 0;
        }

        .button-top {
          border: 1px solid #fff;
          border-radius: 50px;
          width: 96px;
          height: 50px;
          text-align: center;
          line-height: 50px;
        }

        font-size: 14px;
        opacity: 0.6;
      }

      .active {
        opacity: 1;
      }
    }

    &-right {
      width: 53.5%;
      position: relative;
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        height: 578px;
        width: 100%;
        border-radius: 20px;
      }
    }
  }
}

.project {
  display: flex;
  flex-wrap: wrap;
  row-gap: 56px;

  &-w {
    padding: 100px 160px;
  }

  &-image {
    width: 281px;
    height: 231px;
    margin-right: calc((100% - 4 * 281px) / 3);

    img {
      width: 100%;
    }
  }

  &-image:nth-child(4n) {
    margin-right: 0;
  }
}

.honor-svg {
  width: 100%;
  height: 100%;
}

.banner-sector {
  padding: 137px 243px 214px;

  img {
    width: 100%;
  }
}
</style>
