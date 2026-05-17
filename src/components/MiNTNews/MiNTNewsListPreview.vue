<!--
 * @Author: glitter 1321554372@qq.com
 * @Date: 2025-01-13 08:29:55
 * @LastEditors: glitter 1321554372@qq.com
 * @LastEditTime: 2025-02-10 09:52:08
 * @FilePath: /mint_bio/src/components/MiNTNews/MiNTNewsListPreview.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="newslist">
    <div v-for="news in props.filteredNews" :key="news.detailKey || news.slug || news.id" class="newsbox hover-scale-transition"
      @mousemove="cardHover(news)" @mouseleave="cardLeave(news)" :style="{ transform: news.transform }">
      <!-- 展示新闻内容 -->
      <NewsCardPreview :info="news"> </NewsCardPreview>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";

import NewsCardPreview from "./NewsCardPreview.vue";

const props = defineProps({
  filteredNews: {
    Object,
    required: true,
  },
});

function cardHover(card) {
  card.transform = "scale(1.05)";
}
function cardLeave(card) {
  card.transform = "scale(1)";
}
</script>

<style lang="less" scoped>
@import "@/style/variable.less";
@media screen and (min-width: 992px) {
  .newslist {
    width: 100%;
    display: grid;
    // position: relative;
    grid-column-gap: 16px;
    grid-row-gap: 80px;
    grid-template-columns: repeat(3, 1fr);
    overflow: hidden;
    // justify-content: left;


    .newslist {
      width: 100%;
      display: grid;
      // position: relative;
      grid-column-gap: 16px;
      grid-row-gap: 80px;
      grid-template-columns: repeat(3, 1fr);
      overflow: hidden;
      // justify-content: left;

      .newsbox {
        width: 100%;
        height: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        // display: flex;
        justify-content: center;
      }
    }
  }
}

@media screen and (max-width: 992px) {
  .newslist {
    display: flex;
    flex-direction: column;
    gap: 40px;

  }
}
</style>