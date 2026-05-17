<template>
  <router-link :to="`/mintNews/detail/${props.info.detailKey || props.info.slug || props.info.id}`" class="news-preview-container">
    <div class="pic">
      <img :src="getImageUrl(props.info.pic)" loading="lazy" />

    </div>
    <div class="newsinfo">
      <span :style="{ color: props.info.categorycolor }">
        {{ props.info.categorylabel }}
      </span>
      <span class="newsinfo-time">{{ props.info.time }}</span>
    </div>
    <div class="title">
      <span>{{ props.info.title }}</span>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps } from "vue";
import { getImageUrl } from "@/utils/index";
const props = defineProps({
  info: {
    Object,
    required: true,
  },
});

</script>

<style lang="scss" scoped>
.news-preview-container {
  &:hover {
    text-decoration: none;
  }

  .pic {
    width: 100%;
    height: 367px;
    img {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      object-fit:cover;
    }
  }

  .newsinfo {
    margin: 30px 0;

    span {
      font-size: 18px;
      font-weight: 450;
      line-height: 23.87px;
      color: #f1f3f7;
    }

    .newsinfo-time {
      margin-left: 24px;
    }
  }

  .title {
    width: 100%;

    span {
      font-size: 20px;
      font-weight: 450;
      line-height: 26.52px;
      color: #f1f3f7;
    }
  }
}

@media screen and (max-width: 922px) {
  .news-preview-container {
    width: 100%;

    .pic {
      height: 240px;
      border-radius: 12px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .newsinfo {
      margin: 20px 0;

      span {
        font-size: 12px;
        font-weight: 450;
        line-height: 23.87px;
        color: #f1f3f7;
      }

      .newsinfo-time {
        margin-left: 24px;
      }
    }

    .title {
      width: 100%;

      span {
        font-size: 16px;
        font-weight: 450;
        line-height: 22.52px;
        color: #f1f3f7;
      }
    }
  }

}
</style>