<template>
  <div class="container">
    <div class="news-container">
      <div class="selecthead">
        <div class="radio-group" @change="handleRadioChange">
          <label class="radio">
            <input type="radio" value="all" v-model="selectedOption" class="custom-news-radio" />
            <span :class="{ selectedradio: isSelected('all') }">{{ getText('news.all') }}</span>
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
import { fetchNewsCategories, fetchNewsList } from "@/api/news";
import { getText } from "@/utils/language";


import MiNTNewsListPreview from "./MiNTNewsListPreview.vue";
import MiNTNewsOverview from "./MiNTNewsOverview.vue";

// 使用ref创建响应式数据
const selectedOption = ref("all");
const options = ref([]);

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
    case "manufacture":
      return "#7455F6";
    default:
      return "";
  }
};

const newsList = ref([]);


onMounted(async () => {
  const [categoriesResult, listResult] = await Promise.allSettled([
    fetchNewsCategories(),
    fetchNewsList(),
  ]);

  if (categoriesResult.status === "fulfilled") {
    options.value = categoriesResult.value;
  } else {
    console.error("Error fetching news categories:", categoriesResult.reason);
  }

  if (listResult.status === "fulfilled") {
    newsList.value = listResult.value;
  } else {
    console.error("Error fetching news data:", listResult.reason);
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
