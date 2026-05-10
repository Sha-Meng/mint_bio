<template>
  <div class="news-detail-container">
    <MiNTNewsDetailCom v-if="configData" :info="configData">
    </MiNTNewsDetailCom>
    <MiNTDivider :content="'+'"></MiNTDivider>
    <div class="more-dynamic">更多动态</div>
    <MiNTNewsListPreview class="news-preview" :filteredNews="newsList"></MiNTNewsListPreview>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchNewsDetail, fetchNewsList } from "@/api/news";

import MiNTNewsDetailCom from "@/components/MiNTNews/MiNTNewsDetailCom.vue";
import MiNTNewsListPreview from "@/components/MiNTNews/MiNTNewsListPreview.vue";
import MiNTDivider from "@/components/Divider";
export default {
  components: {
    MiNTNewsDetailCom,
    MiNTNewsListPreview,
    MiNTDivider,
  },

  setup() {
    const route = useRoute();
    const configId = ref(route.params.configId); // 假设configId是从路由参数中获取的
    const configData = ref(null);
    const loading = ref(true);
    const error = ref(false);
    const errorMessage = ref("");
    const newsList = ref([]);

    async function loadConfigById(configIdValue) {
      try {
        configData.value = await fetchNewsDetail(configIdValue);
      } catch (err) {
        error.value = true;
        errorMessage.value = `Error loading config: ${err.message}`;
      } finally {
        loading.value = false;
      }
    }

    async function fetchNewsData() {
      try {
        newsList.value = await fetchNewsList();
      } catch (error) {

        console.error("Error fetching news data:", error);
      }
    }

    // 监视 route.params.configId 的变化
    watch(
      () => route.params.configId,
      (newConfigId) => {
        configId.value = newConfigId;
        loadConfigById(newConfigId);
        fetchNewsData();
        // 在这里可以添加其他逻辑，比如重新获取数据
      }
    );
    onMounted(() => {
      if (configId.value) {
        loadConfigById(configId.value);
        fetchNewsData();
      } else {
        console.warn("configId is not set");
      }
    });

    return {
      configData,
      loading,
      error,
      errorMessage,
      newsList,
    };
  },
};
</script>

<style lang="scss" scoped>
.news-detail-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .more-dynamic {
    margin-top: 100px;
    font-size: 21px;
    color: #ffffff;
  }

  .news-preview {
    padding-top: 80px;
    padding-bottom: 300px;
    width: 82.5%;
  }
}
</style>