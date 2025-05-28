<template>
  <div id="app" class="layout">
    <div :class="isPc ? 'pc-layout' : 'mobile-layout'">
      <Header v-if="!$route.meta.unRequiresHeader && isPc" />
      <MobileHeader v-if="!isPc" />
      <router-view />
      <Footer v-if="isPc" />
      <FooterMobile v-else />
      <Contact v-if="isPc" />
      <ContactMobile v-else />
    </div>
  </div>
</template>

<script>
export default {
  components: {
    Header,
    Footer,
    Contact,
    MobileHeader,
    FooterMobile,
    ContactMobile
  },
  data() {
    return {
      isPc: validPcOrPhone()
    };
  },
  watch: {
    isPc() {
      window.location.reload();
    }
  },
  mounted() {
    autoFont();
    window.onresize = () => { // 修改: 使用箭头函数确保 this 指向正确
      autoFont();
      this.isPc = validPcOrPhone();
      // console.log('this.isPc', this.isPc);
    };
  },
};
import Header from './components/Header'
import Footer from './components/Footer'
import FooterMobile from './components/FooterMobile'
import Contact from './components/Contact'
import MobileHeader from './components/MobileHeader'
import ContactMobile from './components/ContactMobile'
import { validPcOrPhone, autoFont } from './utils/isPc'
import './style/common.less'

</script>

<style scoped>
@import '@/style/common.less';
</style>
