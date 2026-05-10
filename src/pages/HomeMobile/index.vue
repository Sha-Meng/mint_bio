<template>
  <div class="home">
    <BannerTitleAnimationMobile :isShowHeader="false"
      :backgroundImg="require('@/assets/images/home-background.png')">
      <div class="banner-title-content">
        <div class="banner-title-zh">
          <span>{{ getText('bannerTitle.home.line1') }}</span>
          <span class="orange">{{ getText('bannerTitle.home.line2') }}</span>
        </div>
        <div class="banner-title-en">
          <span>Infinity from</span>
          <span>Biomanufacturing</span>
        </div>
        <div class="banner-title-zh">
          <span class="orange">{{ getText('bannerTitle.home.line3') }}</span>
          <span>{{ getText('bannerTitle.home.line4') }}</span>
        </div>
      </div>
    </BannerTitleAnimationMobile>
    <div class="dna-section mobile-sector">
      <div class="top-title">
        <div class="mint-text">MiNT BiO</div>
        <div class="line-group">
          <div v-for="(divide, index) in lineDivides" :key="index" class="line-divide"
            :style="{ marginLeft: divide.marginLeft + 'px' }"></div>
        </div>
        <div class="dna-text">DNA</div>
      </div>

      <Swiper :caseList="caseList" :topTip="topTip" :bottomTip="bottomTip">
        <template #item-content="{ item }">
          <router-link :to="item.router" class="case-list-item-router" >
            <div class="case-list-item-title" :style="{ color: item.moveColor }">{{ item.title }}</div>
          </router-link>

          <div class="case-list-item-describe">{{ item.describe }}</div>
          <div class="case-list-item-describe2">{{ item.describe2 }}</div>
        </template>
      </Swiper>
    </div>
    <div class="product-section mobile-sector border-gradient">
      <div class="title">
        <div class="infinite-title">
          <div class="infinite-title-row">
            <span class="infinite-title-zh">{{ getText('home.hero.bio1') }}</span>
            <span class="infinite-title-zh orange">{{ getText('home.hero.bio2') }}</span>
            <span class="infinite-title-en">
              <span>Infinity from</span>
              <span>Biomanufacturing</span>
            </span>
            <span class="infinite-title-zh orange">{{ getText('home.hero.infinite1') }}</span>
            <span class="infinite-title-zh">{{ getText('home.hero.infinite2') }}</span>
          </div>
        </div>
        <p class="product-description">{{ getText('home.hero.description') }}</p>
      </div>
      <div class="product-list">
        <Swiper :caseList="productList" :topTip="productTopTip">
          <template #item-content="{ item }">
            <img :src="item.imgSrc" class="case-list-item-img">
            <div class="case-list-item-first">{{ item.first }}</div>
            <div class="case-list-item-second">{{ item.second }}</div>
            <div class="case-list-item-third">
              <div v-for="i in item.advantage" :key="i" class="advantage-item">{{ i }}</div>
            </div>

          </template>
        </Swiper>
      </div>
    </div>
    <div class="banner-section  border-gradient">
      <div class="title">
        <span>{{ getText('home.testimonialParts.part1') }}</span><span class="orange-text">{{ getText('home.testimonialParts.part2') }}</span><span>{{ getText('home.testimonialParts.part3') }}</span>
      </div>
      <img src="@/assets/images/banners-mobile.png" class="banner-img" />
    </div>
    <div class="new-section mobile-sector border-gradient">
      <div class="new-item" v-for="(item, index) in newsList" :key="index">
        <router-link :to="`/mintNews/detail/${item.id}`">
          <div class="img-box">
            <img :src="getImageUrl(item.pic)" alt="" class="new-img" />


            <div class="overlay">
              <div class="overlay-content">
                <div class="button-more">{{ getText('common.buttons.learnMore') }}</div>
              </div>
            </div>
          </div>
        </router-link>

        <div class="text-top">
          <span class="name" :style="{ color: item.categorycolor, marginRight: '16px' }">{{ item.categorylabel
            }}</span>
          <span class="date">{{ item.time }}</span>
        </div>
        <div class="text-bottom">{{ item.title }}</div>
      </div>
      <router-link :to="`/mintNews`">
        <div class="button-more-lg border-gradient">{{ getText('common.actions.moreNews') }}</div>
      </router-link>
    </div>
  </div>
</template>

<script>
import BannerTitleAnimationMobile from "@/components/BannerTitleAnimationMobile";
import Swiper from "@/components/Swiper";
import { getImageUrl } from "@/utils/index";
import { getText, currentLanguage } from "@/utils/language";
import { fetchLatestNews } from "@/api/news";



export default {
  name: "MintHome",
  components: {
    BannerTitleAnimationMobile,
    Swiper
  },
  setup() {
    return {};
  },
  data() {
    return {
      lineDivides: [
        { marginLeft: 0 },
        { marginLeft: 1 },
        { marginLeft: 1 },
        { marginLeft: 2 },
        { marginLeft: 4 },
        { marginLeft: 8 },
        { marginLeft: 16 },
        { marginLeft: 32 },
      ],
      caseList: [],
      topTip: ['N 30.2741°', 'MiNT BiO', 'China'],
      bottomTip: ['Hangzhou', 'DNA', 'E 120.1552°'],
      productTopTip: ['China', 'MiNT BiO', 'Hangzhou'],
      advantageShow: false,
      productList: [],
      productList: [],
      newsList: [],
      getImageUrl
    };
  },
  methods: {
    getText,
    initializeProductList() {
      const langResources = getText('products.list');
      const images = [
        { src: require("../../assets/images/product-1.jpeg"), top: 0, width: "50%" },
        { src: require("../../assets/images/product-2.jpg") },
        { src: require("../../assets/images/product-3.jpeg") },
        { src: require("../../assets/images/product-4.jpeg") },
        { src: require("../../assets/images/product-5.jpg") },
        { src: require("../../assets/images/product-6.jpg"), objectFit: "contain" },
      ];
      if (Array.isArray(langResources)) {
        this.productList = langResources.map((item, index) => ({
          isShow: false,
          second: item.name,
          imgSrc: images[index]?.src,
          advantage: item.advantages,
          applications: item.applications,
          first: item.friends,
          top: images[index]?.top,
          width: images[index]?.width,
          objectFit: images[index]?.objectFit,
        }));
      }
    },
    initializeCaseList() {
      this.caseList = [
        {
          get title() { return getText('home.sections.technology.title'); },
          get describe() { return getText('home.caseList.technology.describe'); },
          get describe2() { return getText('home.caseList.technology.describe2'); },
          moveColor: "#FF7200",
          isShow: false,
          router: '/corporate',
        },
        {
          get title() { return getText('home.sections.platform.title'); },
          get describe() { return getText('home.caseList.platform.describe'); },
          get describe2() { return getText('home.caseList.platform.describe2'); },
          moveColor: "#254ad9",
          isShow: false,
          router: '/bioIntelligent',
        },
        {
          get title() { return getText('home.sections.products.title'); },
          get describe() { return getText('nav.material'); },
          get describe2() { return getText('home.caseList.material.describe2'); },
          moveColor: "#3170d3",
          isShow: false,
          router: 'material',
        },
        {
          get title() { return getText('home.sections.products.title'); },
          get describe() { return getText('nav.aminoAcid'); },
          get describe2() { return getText('home.caseList.aminoAcid.describe2'); },
          moveColor: "#3880f3",
          isShow: false,
          router: 'aminoAcid',
        },
        {
          get title() { return getText('home.sections.sustainability.title'); },
          get describe() { return getText('home.caseList.sustainability.describe'); },
          get describe2() { return getText('home.caseList.sustainability.describe2'); },
          moveColor: "#42945f",
          isShow: false,
          router: 'vision',
        },
      ];
    },
    expandMargin() {
      this.advantageShow = true;
      this.lineDivides.forEach((element) => {
        element.marginLeft *= 2.5;
      });
    },
    advantageMove(advantage) {
      advantage.color = advantage.moveColor;
      advantage.isShow = true;
    },
    advantageLeave(advantage) {
      advantage.color = "#ffffff";
      advantage.isShow = false;
    },
    productMove(product) {
      product.isShow = true;
    },
    productLeave(product) {
      product.isShow = false;
    },
    async getList() {
      try {
        this.newsList = await fetchLatestNews(6);
      } catch (error) {
        console.error("Error fetching news data:", error);
      }

    }

  },
  mounted() {
    this.initializeProductList();
    this.initializeCaseList();
    this.getList();
    
    // 监听语言变化，重新初始化数据
    this.$watch(() => currentLanguage.value, () => {
      this.initializeCaseList();
      this.initializeProductList();
    });
  },
};
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.home {
  font-size: 16px;
  font: 400 20px MiSans;

  .dna-section {
    padding-bottom: 60px;

    .top-title {

      div,
      span {
        display: inline-block;
      }

      .mint-text {
        margin-left: 34px;
        margin-top: 60px;
        font: 600 24px Montserrat;
        color: #ffffff;
        margin-right: 32px;
      }

      .dna-text {
        font-weight: 600;
        font-size: 24px;
        color: @orange-color;
        margin-left: 32px;
      }

      .line-group {
        .line-divide {
          background: @orange-color;
          width: 2px;
          height: 14px;
          transition: margin-left 0.3s ease; // 添加过渡效果
        }
      }
    }

    .advantage {
      margin: 40px auto;
      display: flex;
      justify-content: space-between;

      &-item {
        font: 600 32px MiSans;
        width: 108px;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        color: rgba(241, 243, 247, 1);

        &:hover {
          cursor: pointer;
          transition: all 0.5s ease;
        }

        .title {
          margin-bottom: 4px;
          width: 96px;
        }

        .sub-title {
          font-size: 15px;
          margin-bottom: 4px;
        }

        .describe {
          font-size: 15px;
          transition: all 1s ease;
        }
      }
    }

    .case {

      &-list {

        &-item {

          &-router {
            text-decoration: none;
          }
          
          &-title {
            text-align: center;
            margin: 40px auto 20px;
            font-size: 24px;
            color: #FF7200;
          }

          &-describe {
            margin: 20px auto 0;
            font-size: 14px;
            line-height: 18.56px;
            color: #F1F3F7;
            white-space: normal;
            text-align: center;
          }

          &-describe2 {
            margin: 0 auto 40px;
            font-size: 14px;
            line-height: 18.56px;
            color: #F1F3F7;
            white-space: normal;
            text-align: center;
            margin-top: 2px;

          }
        }
      }
    }
  }

  .product-section {
    padding: 60px 0;

    .title {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 0 auto 40px;

      .infinite-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        
        &-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        &-zh {
          font: 600 32px MiSans;
          color: #ffffff;
          letter-spacing: 4px;

          &.orange {
            color: #FF7200;
          }
        }

        &-en {
          display: flex;
          flex-direction: column;
          align-items: center;
          font: 400 10px Montserrat;
          color: rgba(241, 243, 247, 0.5);
          line-height: 1.4;
          margin: 0 6px;
        }
      }

      .product-description {
        max-width: 340px;
        text-align: center;
        color: rgba(241, 243, 247, 0.6);
        font-size: 12px;
        line-height: 2;
        margin-top: 30px;
      }

    }

    .product-list {

      .case {

        &-list {
          font-size: 14px;

          &-item {

            &-img {
              margin-top: 12px;
              width: 100%;
              height: 203px;
              border-radius: 6px;
              object-fit: cover;
              object-position: top;


            }

            &-first {
              font-size: 14px;
              color: #F1F3F7;
              text-align: left;
              margin: 20px 0;
            }

            &-second {
              font-size: 14px;
              color: #F1F3F7;
              margin: 20px 0;
            }

            &-third {
              display: flex;
              justify-content: space-between;
              gap: 4px;
              flex-wrap: wrap;
              font-size: 14px;
              color: #F1F3F7;

              .advantage-item {
                display: flex;
                align-items: center;
              }

              .advantage-item::before {
                content: "";
                display: inline-block;
                width: 4px;
                height: 4px;
                background: #F1F3F7;
                border-radius: 50%;
                margin-right: 4px;
              }
            }
          }
        }
      }
    }

  }

  .banner-title-content {
    text-align: center;
    .banner-title-zh {
      font: 600 32px MiSans;
      color: #ffffff;
      letter-spacing: 4px;
      span { display: inline; }
      .orange { color: #FF7200; }
    }
    .banner-title-en {
      font: 400 12px Montserrat;
      color: rgba(241, 243, 247, 0.8);
      margin: 4px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }

  .banner-section {
    padding: 60px 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      text-align: center;
      font: 600 25px MiSans;
      margin-bottom: 50px;
      color: #ffffff;

      .orange-text {
        margin: 0 10px;
      }
    }

    img {
      width: 90%;
    }
  }

  .new-section {
    padding: 60px 10px 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .new-item {
      color: #ffffff;
      width: 100%;
      margin-bottom: 40px;
      position: relative;
      cursor: pointer;
      font-size: 14px;

      .img-box {
        position: relative;

        .new-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: 12px;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }

        &:hover {
          opacity: 0.5;
          /* 图片悬停时的透明度 */
        }

        &:hover .overlay {
          opacity: 1;
          /* 蒙层悬停时的透明度 */
        }
      }

      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        /* 蒙层背景色 */
        border-radius: 12px;
        opacity: 0;
        transition: opacity 0.3s ease;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .overlay-content {
        text-align: center;
      }

      .text-top {
        margin: 20px 0;
        text-align: left;
        font-size: 12px;
      }



    }

    .button-more-lg {
      color: #F1F3F7;
      text-align: center;
      line-height: 84px;
      border: 1px solid #2c2f34;
      border-radius: 999px;
      height: 84px;
      width: 140px;
      font-size: 14px;
      backdrop-filter: blur(68px);
      background: linear-gradient(0deg,
          rgba(255, 255, 255, 0.01),
          rgba(255, 255, 255, 0.01)),
        radial-gradient(107.5% 107.5% at 50% 215%,
          rgba(255, 255, 255, 0.08) 0%,
          rgba(255, 255, 255, 0) 100%);
    }

    .button-more-lg:hover {
      background: linear-gradient(0deg,
          rgba(255, 255, 255, 0.01),
          rgba(255, 255, 255, 0.01)),
        radial-gradient(84.92% 150% at 50% 138.75%,
          rgba(255, 255, 255, 0.16) 0%,
          rgba(255, 255, 255, 0) 100%);
    }
  }
}
</style>