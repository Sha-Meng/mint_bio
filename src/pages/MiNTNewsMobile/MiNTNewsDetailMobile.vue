<template>
  <div class="news-detail-container">
    <MiNTNewsDetailCom v-if="configData" :info="configData">
    </MiNTNewsDetailCom>
    <MiNTDivider :content="'+'"></MiNTDivider>
    <div class="more-dynamic">
      {{ getText('news.moreNews') }}
    </div>
    <MiNTNewsListMobile class="news-preview" :filteredNews="newsList" :isDetail="true" />
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { fetchNewsDetail, fetchNewsList } from "@/api/news";
import { getText } from "@/utils/language";

import MiNTNewsDetailCom from "@/components/MiNTNews/MiNTNewsDetailCom.vue";
import MiNTNewsListMobile from "@/components/MiNTNews/MiNTNewsListMobile.vue";
import MiNTDivider from "@/components/Divider";
export default {
  components: {
    MiNTNewsDetailCom,
    MiNTNewsListMobile,
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
      loading.value = true;
      error.value = false;
      errorMessage.value = "";
      configData.value = null;
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



    watch(
      () => route.params.configId,
      (newConfigId) => {
        configId.value = newConfigId;
        loadConfigById(newConfigId);
        fetchNewsData();
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
      getText,
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
    margin-top: 60px;
    font-size: 21px;
    color: #FFFFFF;
  }
}
</style>
