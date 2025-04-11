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
        元素驱动（MiNT
        BiO）是一家集技术研发、生产应用推广为一体的合成生物科技公司，由西湖大学张科春教授于2021年8月创办，总部位于浙江杭州。
      </div>
      <div class="introduction-section">
        公司配备世界领先的研发团队及行业顶级的产业化团队，从头设计创新型合成生物路径，以人工智能技术为辅助进行颠覆性源头创新，自研多个合成生物平台核心技术。目前，公司通过前沿技术赋能产业，主要聚焦无豆粕日粮和可降解生物材料领域。现有核心产品处于世界领先水平，已与行业龙头展开深度战略合作，并已布局万吨级规模化量产，真正实现从科研到产业的跨越，实现降本增效、绿色生产的生物“智造”。
      </div>
      <div class="introduction-section">
        作为西湖大学新质生产力培育平台重点支持项目，元素驱动充分发挥自研技术平台优势，践行“新质生产力”理念。未来，元素驱动将继续深耕合成生物创新研究与应用，用科技助力生物制造、能源环境、新型材料等领域的产业升级。同时，公司产品管线也将覆盖更多应用场景，将绿色经济拓展到食品原料、生物能源、美妆材料、汽车制造等行业，共同朝碳达峰、碳中和目标迈进，助力地球可持续发展。
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
                <p>张科春</p>
                <p>创始人&首席科学家</p>
              </div>
              <div class="margin-bottom">
                <p>西湖大学教授</p>
                <p>牧原实验室主任</p>
              </div>
            </div>

            <img src="@/assets/images/story-3.png" class="img-right" />
          </div>
        </div>
        <div class="bottom">
          创始人张科春教授本科毕业于中国科学技术大学，博士毕业于加州理工学院，从事合成生物相关研究20余年，具有独特的交叉学科研究背景。他开发了第一种可规模化生产的弹性生物降解高分子材料，创建了世界第一个可持续高分子研究中心并获得美国自然科学基金经费4000万美元的重点支持。研究成果2022年被选为美国推进生物制造的首批九个重点项目之一。2015年获得明尼苏达大学年轻教授的最高荣誉McKnight
          Land-Grant Professorship，2014 年获得University of Minnesota Innovator
          award.
          2019年，张科春教授选择归国，加入西湖大学创建生物制造和新材料实验室。
        </div>
      </div>

      <div class="story-item">
        <div class="top">
          <div class="top-left">
            <img src="@/assets/images/story-2.png" alt="" />
          </div>
          <div class="top-right">
            <div class="margin-bottom">
              <p>刘旻昊</p>
              <p>董事长 & 联合创始人</p>
            </div>
            <div>
              <p>西湖大学校长特别顾问</p>
              <p>西湖大学未来产业研究中心副主任</p>
              <p>新质生产力培育平台负责人</p>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="bottom-left">
            <p>
              刘旻昊2011年毕业于英国帝国理工学院，获得生物物理博士学位，2012年回国后在清华大学从事博士后研究工作;2016年起任清华大学助理研究员，同时担任北京市结构生物学高精尖中心副主任、行政办公室主任。
            </p>
            <p>
              自2014年起，刘旻昊参与西湖大学筹办，先后或同时担任西湖大学筹委会办公室主任、西湖大学董事会秘书、西湖大学校长助理，西湖教育基金会创始秘书长、副理事长等职务。
            </p>
          </div>
          <ul class="bottom-right">
            <li>深度参与西湖大学0-1筹建，积累丰富管理经验，建立良好企业关系</li>
            <li>发起新质生产力平台，孵化未来产业，充当科学家与产业的翻译官，助力科研成果落地</li>
            <li>推动产学研合作，推动科技创新与产业创新结合，为企业发展提供科研解决方案</li>
            <li>发起并参与公益项目，为科学家提供良好发展平台，为可持续发展作出贡献</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-intersect="() => (title2InView = true)" class="scientific sector border-gradient">
      <div v-if="title2InView" class="scientific-title animate__animated animate__fadeInUp animate__slow">
        <div class="scientific-title-left">
          <div>
            <span>前端</span><span class="opacity-0">科研</span><span>攻坚</span>
          </div>
          <div>
            <span class="opacity-0">前端</span><span class="orange-text">科研</span><span class="opacity-0">攻坚</span>
          </div>
        </div>
        <div class="scientific-title-middle">
          <p>从实验室走向生产线</p>
          <p>是合成生物行业必经之路</p>
          <p>迈向生物智造时代</p>
          <p>元素驱动已做好准备</p>
        </div>
        <div class="scientific-title-right">
          <div class="scientific-title-left">
            <div>
              <span>后端</span><span class="opacity-0">落地</span><span>量产</span>
            </div>
            <div>
              <span class="opacity-0">后端</span><span class="orange-text">落地</span><span class="opacity-0">量产</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="title2InView" class="scientific-card animate__animated animate__fadeInUp animate__slow">
        <div class="scientific-card-left">
          <div class="scientific-card-left-item" v-for="(card, index) in cardList" :key="index"
            @mousemove="itemMove(card)" :class="{ active: activeIndex === index }">
            <div class="top button-top">{{ card.textTop }}</div>
            <div class="middle"><img :src="card.textMiddle" alt="" /></div>
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
          @mousemove="cardHover(item)" @mouseleave="cardLeave(item)" :style="{ transform: item.transform }">
          <img :src="getImageUrl(item.imgSrc)" alt="" />
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
import { onMounted, } from "vue";
import { getImageUrl } from "@/utils";

export default {
  name: " CorporateVision",
  components: { BannerTitleAnimation },
  setup() {

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          // 停止观察已进入视口的元素
          // observer.unobserve(entry.target); 
        } else {
          entry.target.classList.remove('fade-in');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.3, // 当元素10%进入视口时触发
    });

    onMounted(() => {
      const dom = document.querySelector('.project-img')
      const bannerDom = document.querySelector('.banner-img')

      if (dom && bannerDom) {
        observer.observe(dom);
        observer.observe(bannerDom);
      }
    });

    return { titleStyle: { top: "47%" } };
  },
  data() {
    return {
      imgSrc: require("@/assets/images/scientific.png"),
      activeIndex: 0,
      timeList: [
        {
          time: "2021.08",
          content: "创办于杭州",
        },
        {
          time: "2022.09",
          content: "与牧原集团战略合作完成首批饲料添加氨基酸量产交付。",
        },
        {
          time: "2022.11",
          content: "与商汤科技达成战略合作推动AI+合成生物前沿创新。",
        },
        {
          time: "2022.12",
          content: "异亮氨酸300吨量产水平转化工艺优化成熟。",
        },
        {
          time: "2023.02",
          content: "与牧原集团合资成立河南牧元安粮公司。",
        },
        {
          time: "2023.04",
          content: "首次入围杭州市准独角兽榜单。",
        },
        {
          time: "2023.12",
          content: "河南牧元安粮年产3万吨项目开工。",
        },
        {
          time: "2024.02",
          content:
            "与建德市签约年产15万吨元素新材料项目,打造生物降解材料全产业链标杆。",
        },
        {
          time: "2024.06",
          content: "建德元素智造项目开工，一期年产3万吨, 计划2025年底投产。",
        },
        {
          time: "2024.10",
          content: "完成A轮融资",
        },
        {
          time: "2024.12",
          content: "牧元安粮工厂正式试产、元素智造工厂结顶",
        },
		{
		  time: "2025.1",
		  content: "获评浙江省专精特新中小企业",
		},
        {
          time: "迎接生物智造时代",
          content:
            "60%的物质生产可通过生物制造方式实现, 合成生物带来的经济价值可达万亿元规模。",
          color: "#00965A",
          width: "480px",
        },
      ],
      cardList: [
        {
          index: 0,
          textTop: "研发中心",
          textMiddle: require("@/assets/images/number-1.png"),
          textBottom: "承担前端科研、实验及小试。",
          imRight: require("@/assets/images/scientific.png"),
        },
        {
          index: 1,
          textTop: "科研团队",
          textMiddle: require("@/assets/images/number-2.png"),
          textBottom: "跨科学人才合作，探索前沿技术。",
          imRight: require("@/assets/images/scientific-2.png"),
        },
      ],
      corpList: [
        {
          imgSrc: "assets/CorporateVision/corp8.png",
          key: 8,
          transform: "scale(1)",
        },
        {
          imgSrc: "assets/CorporateVision/corp1.png",
          key: 1,
          transform: "scale(1)",
        },
        {
          imgSrc: "assets/CorporateVision/corp2.png",
          key: 2,
          transform: "scale(1)",
        },
        {
          imgSrc: "assets/CorporateVision/corp3.png",
          key: 3,
          transform: "scale(1)",
        },
        {
          imgSrc: "assets/CorporateVision/corp4.png",
          key: 4,
          transform: "scale(1)",
        },
        {
          imgSrc: "assets/CorporateVision/corp5.png",
          key: 5,
          transform: "scale(1)",
        },
        {
          imgSrc: "assets/CorporateVision/corp6.png",
          key: 6,
          transform: "scale(1)",
        },
        {
          imgSrc: "assets/CorporateVision/corp7.png",
          key: 7,
          transform: "scale(1)",
        },
      ],
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
      card.transform = "scale(1.05)";
    },
    cardLeave(card) {
      card.transform = "scale(1)";
    },
    getImageUrl,
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
            border-radius: 20px;
          }
        }

        &-right {
          display: flex;
          flex-direction: column;
          padding: 20px 0;

          .img-right {
            width: 80%;
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
          padding-right: 48px;
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

        img {
          height: 60px;
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

.banner-sector {
  padding: 137px 243px 214px;

  img {
    width: 100%;
  }
}
</style>
