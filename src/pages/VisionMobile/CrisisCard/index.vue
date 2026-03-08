<template>
  <div class="crisis-card">
    <div class="crisis-card-top"><span>{{ getText('mouseScroll.line1') }}</span>MiNT BiO<span></span><span>{{ getText('mouseScroll.line2') }}</span></div>
    <div class="crisis-card-title">{{ module.name }}</div>
    <div class="crisis-card-data">
      <img src="@/assets/images/crisis-back.png">
      <div class="crisis-card-data-text">{{ module.rate }}</div>
    </div>
  </div>
</template>

<script>
import { getText } from "@/utils/language";

export default {
  components: {
  },
  props: {
    module: {},
  },
  setup() {
    return { getText };
  }
};
</script>

<style scoped lang="less">
.crisis-card {
  padding: 10px;
  width: 350px;
  height: 284px;
  border-radius: 12px;
  background: #24272a;
  border: 1px solid;
  margin-left: 10px;

  &-top {
    height: 10px;
    display: flex;
    justify-content: space-between;
    font-size: 8px;
    font-weight: 500;
    line-height: 10px;
    color: rgba(241, 243, 247, 0.5);
  }

  &-title {
    font-size: 20px;
    font-weight: 450;
    line-height: 26.52px;
    text-align: center;
    margin: 30px auto;
    color: white;
  }

  &-data {
    position: relative;
    width: 100%;
    height: 100%;

    img {
      width: 346px;
    }

    &-text {
      font-size: 40px;
      font-weight: 450;
      line-height: 22px;
      text-align: left;
      position: absolute;
      top: 52px;
      left: 105px;
      color: rgba(255, 114, 0, 1);
    }
  }
}
</style>