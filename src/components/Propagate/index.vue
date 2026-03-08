<template>
  <div class="propagate">
    <div class="propagate-title">{{ getText('propagate.title') }}</div>
    <div class="propagate-target">
      <div class="propagate-target-top">
        <p>{{ getText('propagate.slogan1') }}</p>
        <p>{{ getText('propagate.slogan2') }}</p>
      </div>
      <div class="propagate-target-bottom">
        <p>
          Create Green Products <br />
          Benefiting Every Life
        </p>
      </div>
    </div>
    <div class="propagate-more">
      <p>{{ getText('common.buttons.learnMore') }}</p>
    </div>

  </div>
</template>

<script>
import { getText } from "@/utils/language";
export default {
  setup() {
    return { getText };
  }
}
</script>
<style lang="less" scoped>
.propagate {
  margin-top: 60px;
  padding: 10% 14% 10% 10%;
  display: flex;
  height: 260px;
  background-image: url("@/assets/AminoAcid/module3_bg.jpeg");
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: 20px;
  box-sizing: border-box;

  &-title {
    width: 5.6%;
    font-size: 24px;
    font-weight: 500;
    color: #fff;
  }

  &-target {
    margin-left: 15%;
    width: 100%;

    &-top {
      margin-bottom: 37%;
      font-size: 16px;
      font-weight: 500;
      color: transparent;
      background-clip: text;
      background-image: linear-gradient(90deg,
          #6a3e1d 0%,
          #3e0603 30%,
          #000 50%,
          #000 100%);

      p:last-child {
        margin-left: 48px;
      }
    }

    &-bottom {
      font-family: Montserrat;
      font-size: 12px;
      font-weight: 600;
      color: transparent;
      background-clip: text;
      background-image: linear-gradient(200deg,
          #c47c66 0%,
          #fffffe 10%,
          #735546 40%,
          #463c26 60%,
          #605b34 80%,
          #efa085 90%,
          #373020 100%);
    }
  }

  &-more {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 29%;


    p {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100px;
      height: 49px;
      color: #f1f3f7;
      font-size: 12px;
      font-weight: 500;
      border-radius: 209px;
      border: 2.09px solid transparent;
      background-image: linear-gradient(#181a1d, #2828289f),
        linear-gradient(156.52deg,
          rgba(255, 255, 255, 0.4) 2.12%,
          rgba(255, 255, 255, 0.0001) 60%,
          rgba(255, 255, 255, 0.0001) 54%,
          rgba(255, 255, 255, 0.1) 93.02%);
      background-origin: border-box;
      background-clip: content-box, border-box;
    }
  }

}
</style>