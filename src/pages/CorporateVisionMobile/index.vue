<template>
  <div class="corporate">
    <BannerTitleAnimationMobile :titleImage="require('@/assets/images/vision-title.png')"
      :backgroundImg="require('@/assets/images/corporateVision.png')" :isShowHeader="false" />
    <div class="introduction">
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
          <div>张科春</div>
          <div>创始人&首席科学家</div>
        </div>
        <div class="story-img-box-item">
          <img src="@/assets/images/story-2.png" />
          <div class="plus" @click="toggleStoryItem2">+</div>
          <div>刘旻昊</div>
          <div>联合创始人&创始董事</div>

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

      <div :class="{ 'visible': isStoryItemVisible2, 'story-item border-gradient story-item-right': true }">

        <div class="close-icon" @click="toggleStoryItem2">X</div>
        <div class="top">
          <div class="top-left">
            <img src="@/assets/images/story-2.png" alt="" />
          </div>
          <div class="top-right">
            <div class="margin-bottom">
              <p>刘旻昊</p>
              <p>联合创始人&创始董事</p>
            </div>
            <div class="font-12">
              <p>西湖大学校长助理</p>
              <p>西湖大学董事会秘书</p>
              <p>西湖大学未来产业研究中心副主任</p>
              <p>新质生产力培育平台负责人</p>
              <p>杭州市西湖教育基金会副理事长</p>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="bottom-left">
            <p>
              刘旻昊2011年毕业于英国帝国理工学院，获得生物物理博士学位，2012年回国后在清华大学从事博士后研究工作;2016年起任清华大学助理研究员，同时担任北京市结构生物学高精尖中心副主任、行政办公室主任。
            </p>
            <p>
              自2014年起，刘旻吴参与西湖大学筹办，先后或同时担任西湖大学筹委会办公室主任、西湖大学董事会秘书、西湖大学校长助理，西湖教育基金会创始秘书长、副理事长等职务。
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

    <div class="scientific mobile-sector border-gradient">
      <div class="scientific-title">
        <div>
          <span>前端</span><span class="orange-text">科研</span><span>攻坚</span>
        </div>
        <div class="scientific-title-middle">
          <p>从实验室走向生产线是合成生物行业必经之路</p>
          <p>迈向生物智造时代，元素驱动已做好准备。</p>
        </div>
        <div>
          <span>后端</span><span class="orange-text">落地</span><span>量产</span>
        </div>
      </div>
      <div class="scientific-card">
        <div class="scientific-card-top">
          <div class="menu-item">MiNT BiO</div>
          <div :class="{ 'menu-item': true, 'active': activeIndex === 0 }" @click="itemMove(cardList[0])">研发中心

            <div class="slider" :style="{ left: sliderPosition + 'px' }"></div>

          </div>
          <div :class="{ 'menu-item': true, 'active': activeIndex === 1 }" @click="itemMove(cardList[1])">研发团队</div>
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

export default {
  name: " CorporateVision",
  components: { BannerTitleAnimationMobile },
  setup() {
    return { titleStyle: { top: "47%" } };
  },
  data() {
    return {
      isStoryItemVisible: false,
      isStoryItemVisible2: false,
      sliderPosition: 0, // 添加滑块位置
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
          textTop: "中心团队",
          textMiddle: require("@/assets/images/number-1.png"),
          textBottom: "承担前端科研、实验及小试。",
          imSrc: require("@/assets/images/scientific.png"),
        },
        {
          index: 1,
          textTop: "中心团队",
          textMiddle: require("@/assets/images/number-2.png"),
          textBottom: "跨科学人才合作，探索前沿技术",
          imSrc: require("@/assets/images/scientific-2.png"),
        },
      ],
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
