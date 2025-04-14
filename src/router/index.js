import { createWebHashHistory, createRouter } from 'vue-router'
import { validPcOrPhone } from '@/utils/isPc'

import AminoAcid from '@/pages/AminoAcid'
import KnotWeed from '@/pages/KnotWeed'
import Vision from '@/pages/Vision'
import MiNTNews from '@/pages/MiNTNews/MiNTNews.vue'
import MiNTNewsDetail from '@/pages/MiNTNews/MiNTNewsDetail.vue'
import Home from '@/pages/Home'
import BioIntelligent from '@/pages/BioIntelligent'
import CorporateVision from '@/pages/CorporateVision'
import NewMaterial from '@/pages/NewMaterial'

/* 移动端路由 */
import HomeMobile from '@/pages/HomeMobile'
import AminoAcidMobile from '@/pages/AminoAcidMobile'
import KnotWeedMobile from '@/pages/KnotWeedMobile'
import VisionMobile from '@/pages/VisionMobile'
import MiNTNewsMobile from '@/pages/MiNTNewsMobile/MiNTNewsMobile.vue'
import MiNTNewsDetailMObile from '@/pages/MiNTNewsMobile/MiNTNewsDetailMobile.vue'
import BioIntelligentMobile from '@/pages/BioIntelligentMobile'
import CorporateVisionMobile from '@/pages/CorporateVisionMobile'
import NewMaterialMObile from '@/pages/NewMaterialMobile'



export const PcRoutes = [
  {
    path: '/',
    name: '/',
    component: validPcOrPhone() ? Home : HomeMobile,
  },
  {
    path: '/aminoAcid',
    name: 'aminoAcid',
    component: AminoAcid
  },
  {
    path: '/knotWeed',
    name: 'knotWeed',
    component: KnotWeed
  },
  {
    path: '/vision',
    name: 'vision',
    component: Vision
  },
  {
    path: '/mintNews',
    name: 'mintNews',
    component: MiNTNews
  },
  {
    path: '/mintNews/detail/:configId',
    name: 'mintNewsDetail',
    component: MiNTNewsDetail
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    meta: { unRequiresHeader: true }

  },
  {
    path: '/bioIntelligent',
    name: 'bioIntelligent',
    component: BioIntelligent,
    meta: { unRequiresHeader: true }
  },
  {
    path: '/corporate',
    name: 'corporate',
    component: CorporateVision,
    meta: { unRequiresHeader: true }

  },
  {
    path: '/material',
    name: 'material',
    component: NewMaterial
  },
]
export const MobileRoutes = [
  {
    path: '/',
    name: '/',
    component: validPcOrPhone() ? Home : HomeMobile,
  },
  {
    path: '/aminoAcid',
    name: 'aminoAcid',
    component: AminoAcidMobile
  },
  {
    path: '/knotWeed',
    name: 'knotWeed',
    component: KnotWeedMobile
  },
  {
    path: '/vision',
    name: 'vision',
    component: VisionMobile
  },
  {
    path: '/mintNews',
    name: 'mintNews',
    component: MiNTNewsMobile
  },
  {
    path: '/mintNews/detail/:configId',
    name: 'mintNewsDetail',
    component: MiNTNewsDetailMObile
  },
  {
    path: '/home',
    name: 'home',
    component: HomeMobile,
    meta: { unRequiresHeader: true }

  },
  {
    path: '/bioIntelligent',
    name: 'bioIntelligent',
    component: BioIntelligentMobile,
    meta: { unRequiresHeader: true }
  },
  {
    path: '/corporate',
    name: 'corporate',
    component: CorporateVisionMobile,
    meta: { unRequiresHeader: true }

  },
  {
    path: '/material',
    name: 'material',
    component: NewMaterialMObile
  },
]
const router = createRouter({
  history: createWebHashHistory(),
  routes: validPcOrPhone() ? PcRoutes : MobileRoutes,
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0 };
  },
})


export default router