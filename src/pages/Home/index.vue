<template>
  <div class="home">
    <BannerTitleAnimation :titleImage="require('@/assets/images/home-title.png')"
      :backgroundImg="require('@/assets/images/home-background.png')" />
    <div class="dna-section sector" @mouseover.once="expandMargin()">
      <div class="top-title">
        <div class="mint-text">MiNT BiO</div>
        <div class="line-group">
          <div v-for="(divide, index) in lineDivides" :key="index" class="line-divide"
            :style="{ marginLeft: divide.marginLeft + 'px' }"></div>
        </div>
        <div class="dna-text">DNA</div>
        <!-- <img src="@/assets/images/lines.png" class="line"> -->
      </div>
      <div class="advantage animate__animated animate__fadeIn" v-if="advantageShow">
        <div v-for="(advantage, index) in advantageArr" :key="index" class="advantage-item"
          @mousemove="advantageMove(advantage)" @mouseleave="advantageLeave(advantage)">
          <router-link :to="advantage.router" class="advantage-item-router">
            <div class="title" :style="{ color: advantage.color, transition: 'color 1s' }">
              {{ advantage.title }}
            </div>
            <div class="sub-title" v-if="advantage.subTitle">
              {{ advantage.subTitle }}
            </div>
            <div :class="advantage.animationClass" class="describe">
              {{ advantage.describe }}
            </div>
          </router-link>
        </div>
      </div>
    </div>
    <div class="product-section sector border-gradient">
      <div v-intersect="() => titleInView = true" class="product-header">
        <div v-if="titleInView" class="infinite-title animate__animated animate__fadeInUp">
          <span class="infinite-title-zh">{{ getText('home.hero.bio1') }}</span>
          <span class="infinite-title-zh orange">{{ getText('home.hero.bio2') }}</span>
          <span class="infinite-title-en">
            <span>Infinity from</span>
            <span>Biomanufacturing</span>
          </span>
          <span class="infinite-title-zh orange">{{ getText('home.hero.infinite1') }}</span>
          <span class="infinite-title-zh">{{ getText('home.hero.infinite2') }}</span>
        </div>
        <div v-if="titleInView" class="product-description animate__animated animate__fadeInUp">
          <p>{{ descriptionLine1 }}</p>
          <p>{{ descriptionLine2 }}</p>
        </div>
      </div>
      <div class="product-list">
        <div class="product-list-top">
          <div class="product-list-top-item product">{{ getText('common.labels.inDevelopment') }}</div>
          <div class="product-list-top-item advantage">{{ getText('common.labels.performanceAdvantages') }}</div>
          <div class="product-list-top-item applications">{{ getText('common.labels.applicationAreas') }}</div>
        </div>
        <div class="product-list-content">
          <div v-for="(item, index) in productList" :key="index" class="product-list-content-item"
            :style="{ color: isProductActive(index) ? '#fff' : '' }" @mouseenter="setActiveProduct(index)">
            <div class="product">
              <span class="product-text">{{ item.product }}</span>
              <transition name="fade">
                <img :src="item.imgSrc" v-if="isProductActive(index)"
                  :style="{ top: item.top + 'px', objectFit: item.objectFit }" />
              </transition>
            </div>
            <div class="advantage product-text">
              <span class="dot-before" v-for="i in item.advantage" :key="i" :style="{ width: item.width }">{{ i
                }}</span>
            </div>
            <div class="applications product-text">{{ item.applications }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-intersect="() => bannerSectionInView = true" class="banner-section-w sector border-gradient">
      <div v-if="bannerSectionInView" class="animate__animated animate__fadeInUp banner-section">
        <div class="title">
          <span>{{ getText('common.labels.testimonial') }}</span>
        </div>
        <img src="@/assets/images/banners.png" class="banner-img" />
      </div>
    </div>
    <div class="new-section sector border-gradient">
      <div v-for="(item, index) in newsList" :key="index" class="new-item hover-scale-transition"
        @mousemove="cardHover(item)" @mouseleave="cardLeave(item)" :style="{ transform: item.transform }">
        <div class="img-box">
          <img :src="getImageUrl(item.pic)" alt="" class="new-img" />
          <router-link :to="`/mintNews/detail/${item.detailKey || item.slug || item.id}`">
            <div class="overlay">
              <div class="overlay-content">
                <div class="button-more">{{ getText('common.buttons.learnMore') }}</div>
              </div>
            </div>
          </router-link>
        </div>

        <div class="text-top">
          <span class="name" :style="{ color: item.categorycolor, marginRight: '16px' }">{{ item.categorylabel }}</span>
          <span class="date">{{ item.time }}</span>
        </div>
        <div class="text-bottom">{{ item.title }}</div>
      </div>
      <div class="new-item new-item-last ">
        <router-link :to="`/mintNews`">
          <div class=" button-more-lg border-gradient">{{ getText('common.actions.moreNews') }}</div>
        </router-link>
        <img class="line-bottom-img" src="@/assets/images/line-bottom.png" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import BannerTitleAnimation from "@/components/BannerTitleAnimation";
import { getImageUrl } from "@/utils/index";
import { getText, currentLanguage } from "@/utils/language";
import { fetchLatestNews } from "@/api/news";



const lineDivides = reactive([
  { marginLeft: 0 },
  { marginLeft: 1 },
  { marginLeft: 1 },
  { marginLeft: 2 },
  { marginLeft: 4 },
  { marginLeft: 8 },
  { marginLeft: 16 },
  { marginLeft: 32 },
]);

// 使用 reactive 存储advantage数据，支持hover状态修改
const advantageArr = reactive([
  {
    title: getText('home.sections.technology.title'),
    describe: getText('home.sections.technology.subtitle'),
    color: "#ffffff",
    moveColor: "#FF7200",
    animationClass: "",
    router: '/corporate',
  },
  {
    title: getText('home.sections.platform.title'),
    describe: getText('home.sections.platform.subtitle'),
    color: "#ffffff",
    moveColor: "#144BE1",
    animationClass: "",
    router: '/bioIntelligent',
  },
  {
    title: getText('home.sections.products.title'),
    subTitle: getText('nav.material'),
    describe: getText('home.sections.products.materialsDesc'),
    color: "#ffffff",
    moveColor: "#0082FB",
    animationClass: "",
    router: 'material',
  },
  {
    title: getText('home.sections.products.title'),
    subTitle: getText('nav.aminoAcid'),
    describe: getText('home.sections.products.aminoAcidsDesc'),
    color: "#ffffff",
    moveColor: "#0082FB",
    animationClass: "",
    router: 'aminoAcid',
  },
  {
    title: getText('home.sections.sustainability.title'),
    describe: getText('home.sections.sustainability.subtitle'),
    color: "#ffffff",
    moveColor: "#00965A",
    animationClass: "",
    router: 'vision',
  },
]);

const advantageShow = ref(false);
// 产品列表 - 使用 computed 自动响应语言切换
const productListData = computed(() => {
  const langResources = getText('products.list')
  if (!Array.isArray(langResources)) return []
  const images = [
    { src: require("../../assets/images/product-1.jpeg"), top: -12 },
    { src: require("../../assets/images/product-histidine.png"), objectFit: "contain" },
    { src: require("../../assets/images/product-isoleucine.png"), objectFit: "contain" },
    { src: require("../../assets/images/product-4.jpeg") },
    { src: require("../../assets/images/product-6.jpg"), objectFit: "fill" },
    { src: require("../../assets/images/product-3.jpeg") },
    { src: require("../../assets/NewMaterial/P003-1.jpeg") },
    { src: require("../../assets/NewMaterial/P002-new.jpg") },
  ]
  return langResources.map((item, index) => ({
    product: item.name,
    imgSrc: item.image || images[index]?.src,
    advantage: item.advantages,
    applications: item.applications,
    friends: item.friends,
    top: images[index]?.top,
    objectFit: images[index]?.objectFit,
  }))
})

const productList = ref([])
const activeProductIndex = ref(0)

// 初始化和监听语言变化
watch(() => productListData.value, (newVal) => {
  productList.value = newVal.map(item => ({ ...item }))
  if (!productList.value.length || activeProductIndex.value >= productList.value.length) {
    activeProductIndex.value = 0
  }
}, { immediate: true })

const newsList = ref([]);
const titleInView = ref(false);
const bannerSectionInView = ref(false);

// 监听语言变化，更新advantage数据
watch(() => currentLanguage.value, async () => {
  advantageArr[0].title = getText('home.sections.technology.title');
  advantageArr[0].describe = getText('home.sections.technology.subtitle');
  
  advantageArr[1].title = getText('home.sections.platform.title');
  advantageArr[1].describe = getText('home.sections.platform.subtitle');
  
  advantageArr[2].title = getText('home.sections.products.title');
  advantageArr[2].subTitle = getText('nav.material');
  advantageArr[2].describe = getText('home.sections.products.materialsDesc');
  
  advantageArr[3].title = getText('home.sections.products.title');
  advantageArr[3].subTitle = getText('nav.aminoAcid');
  advantageArr[3].describe = getText('home.sections.products.aminoAcidsDesc');
  
  advantageArr[4].title = getText('home.sections.sustainability.title');
  advantageArr[4].describe = getText('home.sections.sustainability.subtitle');
}, { immediate: true });

// 计算描述文字的两行内容
const descriptionLine1 = computed(() => {
  const fullText = getText('home.hero.description');
  // 中文在"应用领域，"后换行
  if (currentLanguage.value === 'zh') {
    const splitIndex = fullText.indexOf('应用领域，');
    if (splitIndex !== -1) {
      return fullText.substring(0, splitIndex + 5);
    }
  }
  // 英文在合适位置换行
  const midPoint = Math.floor(fullText.length / 2);
  const spaceIndex = fullText.indexOf(' ', midPoint);
  return spaceIndex !== -1 ? fullText.substring(0, spaceIndex) : fullText;
});

const descriptionLine2 = computed(() => {
  const fullText = getText('home.hero.description');
  // 中文在"应用领域，"后换行
  if (currentLanguage.value === 'zh') {
    const splitIndex = fullText.indexOf('应用领域，');
    if (splitIndex !== -1) {
      return fullText.substring(splitIndex + 5);
    }
  }
  // 英文在合适位置换行
  const midPoint = Math.floor(fullText.length / 2);
  const spaceIndex = fullText.indexOf(' ', midPoint);
  return spaceIndex !== -1 ? fullText.substring(spaceIndex + 1) : '';
});

const expandMargin = () => {
  advantageShow.value = true;
  lineDivides.forEach((element) => {
    element.marginLeft *= 2.5;
  });
};

const advantageMove = (advantage) => {
  advantage.color = advantage.moveColor;
  advantage.animationClass = "animate__animated animate__fadeIn";
};

const advantageLeave = (advantage) => {
  advantage.color = "#ffffff";
  advantage.animationClass = "animate__animated animate__fadeOut";
};

const isProductActive = (index) => activeProductIndex.value === index;

const setActiveProduct = (index) => {
  if (activeProductIndex.value === index) return;
  activeProductIndex.value = index;
};

const cardHover = (card) => {
  card.transform = "scale(1.05)";
};

const cardLeave = (card) => {
  card.transform = "scale(1)";
};

onMounted(async () => {
  try {
    newsList.value = await fetchLatestNews(6);
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.home {
  font-size: 16px;
  font: 400 20px MiSans;

  .dna-section {
    // padding: 100px 0;
    height: 300px;

    .top-title {

      div,
      span {
        display: inline-block;
      }

      .mint-text {
        font: 600 56px Montserrat;
        color: #ffffff;
        margin-right: 32px;
      }

      .dna-text {
        font-weight: 600;
        font-size: 56px;
        color: @orange-color;
        margin-left: 32px;
      }

      .line-group {
        .line-divide {
          background: @orange-color;
          width: 2px;
          height: 30px;
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
        width: 180px;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        color: rgba(241, 243, 247, 1);
        
        &:hover {
          cursor: pointer;
          transition: all 0.5s ease;
        }

        &-router{
          text-decoration: none;
        }

        .title {
          margin-bottom: 20px;
          width: 112px;
          white-space: pre-line;
        }

        .sub-title {
          font-size: 15px;
          margin-bottom: 20px;
        }

        .describe {
          font-size: 15px;
          transition: all 1s ease;
          opacity: 0;
        }
      }
    }
  }

  .product-section {
    // padding: 100px 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .product-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .infinite-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 50px;
      position: relative;

      &-zh {
        font: 600 72px MiSans;
        color: #ffffff;
        letter-spacing: 6px;

        &.orange {
          color: #FF7200;
        }
      }

      &-en {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        font: 400 21px Montserrat;
        color: rgba(241, 243, 247, 0.8);
        line-height: 1.3;
        margin: 0 -30px;
        position: relative;
        z-index: 1;
      }
    }

    .product-description {
      text-align: center;
      color: rgba(241, 243, 247, 0.5);
      font-size: 21px;
      line-height: 2.2;
      margin-bottom: 170px;

      p {
        margin: 0;
      }
    }

    .product-list {
      width: 100%;

      .product {
        width: 28%;
      }

      .advantage {
        width: 40%;
        display: flex;
        flex-wrap: wrap;

        span {
          display: inline-block;
          min-width: 120px;
          white-space: nowrap;
          margin-right: 16px;
        }

        .dot-before {
          &::before {
            content: "•";
            /* 原点字符 */
            margin-right: 5px;
            /* 原点与文字之间的间距 */
          }
        }
      }

      .applications {
        width: 17%;
      }

      .friends {
        width: calc(15% - 16px);
      }

      &-top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;

        &-item {
          color: #ffffff;
          margin-right: 8px;
          height: 45px;
          line-height: 45px;
          padding: 10px 0;
          font: 520 20px MiSans;
          border-bottom: 1px solid rgba(241, 243, 247, 0.4);

          &:nth-last-child {
            margin-right: 0;
          }
        }
      }

      &-content {
        width: 100%;
        margin-top: 32px;

        .product-text {
          z-index: 2;
        }

        &-item {
          padding: 16px 0;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          flex-direction: row;
          position: relative;
          width: 100%;
          cursor: pointer;

          img {
            width: calc(35% - 220px);
            height: 235px;
            object-fit: cover;
            position: absolute;
            top: -48px;
            left: 210px;
            z-index: 0;
            transition: all 0.5s ease;
          }
        }
      }
    }
  }




  .banner-section {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      text-align: center;
      font: 600 60px MiSans;
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
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;

    .new-item {
      color: #ffffff;
      width: 32%;
      margin-bottom: 40px;
      position: relative;
      cursor: pointer;

      &-last {
        height: 215px;
      }

      .img-box {
        position: relative;

        .new-img {
          width: 100%;
          height: 367px;
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
      }

      .button-more {
        width: 104px;
        border-radius: 50px;
        height: 52px;
        line-height: 52px;
        text-align: center;
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
        border: 1px solid #ffffff;
      }

      .button-more-lg {
        text-align: center;
        line-height: 84px;
        border: 1px solid #2c2f34;
        border-radius: 999px;
        position: absolute;
        top: calc(50% - 80px);
        left: 50%;
        transform: translate(-50%, -50%);
        height: 84px;
        width: 140px;
        font-family: MiSans;
        font-size: 20px;
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

      .line-bottom-img {
        width: 100%;
        position: absolute;
        top: 150px;
        transform: translateY(-100%);
      }
    }
  }
}
</style>
