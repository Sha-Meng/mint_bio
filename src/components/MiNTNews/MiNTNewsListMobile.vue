<template>
  <div class="container">
    <div class="selecthead">
      <div class="radio-group" @change="handleRadioChange" v-if="!props.isDetail">
        <label class="radio">
          <input type="radio" value="all" v-model="selectedOption" class="custom-news-radio" />
          <div :class="{ selectedradio: isSelected('all'), 'all-radio': true }">全部</div>
        </label>
        <div class="radio-list">
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
    </div>

    <MiNTNewsListPreview class="news-preview" :filteredNews="filteredNews"></MiNTNewsListPreview>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, defineProps } from "vue";
import { fetchNewsList } from "@/api/news";


import MiNTNewsListPreview from "./MiNTNewsListPreview.vue";

// 使用ref创建响应式数据
const props = defineProps({
  isDetail: {
    type: Boolean,
    default: false,
  }
});
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
  console.log('filteredNews', filteredNews);
  if (selectedOption.value === "all") {
    return newsList.value;
  } else {
    return newsList.value.filter(
      (news) => news.category === selectedOption.value
    );
  }
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

const newsList = ref([]);

onMounted(async () => {
  try {
    newsList.value = await fetchNewsList();
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});
</script>

<style lang="scss" scoped>
.container {
  padding: 40px 10px;
  background-color: #11161b;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;


  .selecthead {
    width: 100%;
    font-size: 14px;
    margin-bottom: 30px;

    .radio-list {
      margin-left: -8px;
    }

    span {
      color: #666666;
    }

    label.radio {
      width: 88px;

    }

    .all-radio {
      margin-bottom: 20px;
    }


    .normal-radio {
      text-align: left;
      width: 88px;
      height: 10px;
      margin-right: 8px;
    }

    .custom-news-radio {
      transform: scale(0);
    }

    .selectedradio {
      color: white;
    }
  }

  .preview-newsinfo {
    height: 647px;
    margin: 60px 0px;
  }

  .news-preview {
    top: 880px;
  }

}

/* } */
</style>