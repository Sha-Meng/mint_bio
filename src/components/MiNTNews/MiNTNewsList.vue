<template>
  <div class="container">
    <div class="news-container">
      <div class="selecthead">
        <div class="radio-group" @change="handleRadioChange">
          <label class="radio">
            <input type="radio" value="all" v-model="selectedOption" class="custom-news-radio" />
            <span :class="{ selectedradio: isSelected('all') }">全部</span>
          </label>
          <label class="radio" v-for="item in options" :key="item.value">
            <input type="radio" :value="item.value" v-model="selectedOption" class="custom-news-radio" />
            <span :class="[
              'normal-radio',
              { selectedradio: isSelected(item.value) },
            ]" :style="{
              color: isSelected(item.value)
                ? getHighlightColor(item.value)
                : '',
            }">{{ item.label }}</span>
          </label>
        </div>
      </div>

      <div class="preview-newsinfo">
        <MiNTNewsOverview v-if="firstNews" :info="firstNews"></MiNTNewsOverview>
      </div>

      <MiNTNewsListPreview class="news-preview" :filteredNews="filteredNews"></MiNTNewsListPreview>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

import MiNTNewsListPreview from "./MiNTNewsListPreview.vue";
import MiNTNewsOverview from "./MiNTNewsOverview.vue";

// 使用ref创建响应式数据
const selectedOption = ref("all");
const options = ref([
  {
    value: "production",
    label: "#MiNT产品力",
  },
  {
    value: "runtime",
    label: "#MiNT进行时",
  },
  {
    value: "vision",
    label: "#MiNT Vision",
  },
  {
	value: "manufacture",
	label: "#MiNT智造力"
  }
  // 可以添加更多分类选项
]);

// 处理单选框值改变的事件
const handleRadioChange = (event) => {
  // 通常情况下，你不需要手动更新selectedOption，因为v-model已经处理了这一步
  selectedOption.value = event.target.value;
};

const isSelected = (value) => {
  return value == selectedOption.value;
};

// 计算筛选后的新闻列表
const filteredNews = computed(() => {
  if (selectedOption.value === "all") {
    return newsList.value;
  } else {
    return newsList.value.filter(
      (news) => news.category === selectedOption.value
    );
  }
});

// 计算筛选后的第一个新闻做预览
const firstNews = computed(() => {
  return filteredNews.value.length > 0 ? filteredNews.value[0] : null;
});

// 计算类别高亮颜色
const getHighlightColor = (value) => {
  switch (value) {
    case "runtime":
      return "#FF7200";
    case "production":
      return "#144BE1";
    case "vision":
      return "#007D30";
    default:
      return "";
  }
};

// 假设这是你的新闻数据数组
// const newsItems = ref([
//   {
//     id: 1,
//     title: "低豆粕日粮助力全面绿色转型",
//     category: "production",
//     categorylabel: "#MiNT产品力",
//     categorycolor: "#144BE1",
//     time: "2024/09/21",
//     pic: require("@/assets/News/news01.png"),
//     overviewtitle: "向“新”而创——元素驱动的生物智造之路",
//     overviewcontent:
//       "“高起点、小而精、研究型”，以这种办学定位成长起来的西湖大学，既聚焦“从0到1”关键核心技术突破，又不忘为师生搭建产业化平台。让“实验室”牵手“生产线”，让更多科研成果转变成产业“成品”，生物合成科技公司元素驱动就是其中的佼佼者。",
//   },
//   {
//     id: 2,
//     title: "新闻2",
//     category: "production",
//     categorylabel: "#MiNT产品力",
//     categorycolor: "#144BE1",
//     time: "2024/09/21",
//     pic: require("@/assets/News/news02.png"),
//   },
//   {
//     id: 3,
//     title: "周扬区长莅临元素驱动调研指导",
//     category: "runtime",
//     categorylabel: "#MiNT进行时",
//     categorycolor: "#FF7200",
//     time: "2024/09/21",
//     pic: require("@/assets/News/news03.png"),
//   },
//   {
//     id: 4,
//     title: "中央首次部署！加快经济社会发展全面绿色转型",
//     category: "vision",
//     categorylabel: "#MiNT vision",
//     categorycolor: "#007D30",
//     time: "2024/09/21",
//     pic: require("@/assets/News/news04.png"),
//   },
//   {
//     id: 5,
//     title: "姚高员市长调研重点产业赛道企业，莅临元素驱动指导",
//     category: "runtime",
//     categorylabel: "#MiNT进行时",
//     categorycolor: "#FF7200",
//     time: "2024/09/21",
//     pic: require("@/assets/News/news03.png"),
//   },
// ]);

const newsList = ref([]);


onMounted(async () => {
  try {
    const response = await axios.get("/data/news_list.json");
    if (response.status === 200) {
      newsList.value = response.data;
      newsList.value.forEach((news) => {
        news.transform = 'scale(1)';
      });
    }
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});
</script>

<style lang="less" scoped>
@import "@/style/variable.less";

.container {
  width: 100%;
  /* height: 100%; */
  overflow: hidden;
  background-color: #11161b;
  display: flex;
  justify-content: center;
  align-items: center;

  .news-container {
    width: 100%;
    height: 100%;
    padding: 40px 160px 300px 160px;
    /* position: relative; */

    .selecthead {
      width: 100%;
      overflow: hidden;
      font-size: 18px;

      span {
        color: #666666;
      }

      .normal-radio {
        width: 154px;
        height: 53px;
        margin: 0px 13px;
      }

      .custom-news-radio {
        transform: scale(0);
      }

      .selectedradio {
        color: white;
      }
    }

    .preview-newsinfo {
      width: 100%;
      height: 647px;
      margin-top: 100px;
    }

    .news-preview {
      width: 100%;
      padding-top: 100px;
    }
  }
}

/* } */
</style>