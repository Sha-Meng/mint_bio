<template>
	<div class="header" :class="{ 'blur-background': shouldBlur }">
		<div class="header-left">
			<div class="header-left-logo" :style="{ cursor: 'pointer' }">
				<img src="@/assets/images/logo.png" alt="Logo" @click="handleJumps('home')" />
			</div>
		</div>

		<div class="header-middle">
			<div class="header-middle-left">
				<ul class="nav">
					<li class="nav-item" v-for="item in navData" :key="item.key" :class="{
			    'nav-item_current': item.state,
			    'has-submenu': item.submenu && item.submenu.length > 0,
			  }" @mouseover="setMouseOver(item)" @mouseleave="setMouseLeave(item)" @click.prevent="handleClick(item)">
						<router-link class="nav-item-link" :to="item.submenu.length
			      ? 'javascript:void(0)'
			      : { name: item.router }
			      " v-if="!item.submenu.length">
							{{ item.name }}
						</router-link>
						<span class="nav-item-link" v-else>
							{{ item.name }}
							<img :src="item.state ? item.iconUp : item.iconDown" alt="Toggle Icon"
								class="submenu-icon" />
						</span>

						<ul v-if="item.submenu && item.submenu.length" class="submenu">
							<li class="submenu-item" v-for="subItem in item.submenu" :key="subItem.key"
								@mouseover="setMouseOver(subItem)" @mouseleave="setMouseLeave(subItem)">
								<router-link :to="{ name: subItem.router }" class="submenu-item-link">
									{{ subItem.name }}
								</router-link>
							</li>
						</ul>
					</li>
				</ul>
			</div>

			<div class="header-middle-right">
				<div class="contactnav" @click="openContact">
					<div class="contactnav-item">
						<span>{{ getText('nav.contact') }}</span>
					</div>
				</div>
			</div>

		</div>

		<div class="header-right">
			<el-popover placement="bottom" width="891" trigger="manual" :visible="visible" :show-arrow="false"
				effect="dark" popper-class="header-popover" :popper-options="popperOptions">
				<div class="popover-content">
					<div class="popover-content-close" @click="visible = !visible">
						<svg class="close-icon" width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="close" role="button">
							<path d="M17 17 L37 37 M37 17 L17 37" stroke="#f1f3f7" stroke-width="2.5" stroke-linecap="round" />
						</svg>
					</div>
					<div class="popover-content-menu">
						<div class="popover-content-menu-item">
							<p class="pointer" @click="handleJumps('bioIntelligent')">
								{{ getText('nav.bioIntelligent') }}
							</p>
						</div>
						<div class="popover-content-menu-item">
							<p>{{ getText('nav.products') }}</p>
							<p class="pointer" @click="handleJumps('material')">
								{{ getText('nav.material') }}
							</p>
							<p class="pointer" @click="handleJumps('aminoAcid')">
								{{ getText('nav.aminoAcid') }}
							</p>
							<p class="pointer" @click="handleJumps('knotWeed')">
								{{ getText('nav.knotWeed') }}
							</p>
						</div>
						<div class="popover-content-menu-item">
							<p>{{ getText('nav.aboutUs') }}</p>
							<p class="pointer" @click="handleJumps('corporate')">{{ getText('nav.corporate') }}</p>
							<p class="pointer" @click="handleJumps('vision')">{{ getText('nav.vision') }}</p>
						</div>
						<div class="popover-content-menu-item">
							<p class="pointer" @click="handleJumps('mintNews')">{{ getText('nav.news') }}</p>
						</div>
						<!-- <div class="popover-content-menu-item">
              <p>加入我们</p>
            </div>
            <div class="popover-content-menu-item">
              <p>下载中心</p>
            </div> -->
					</div>
				<div v-if="isEnglishEnabled()" class="popover-content-language">
					<p class="popover-content-language-cn" 
					   :class="{ 'active-language': isChinese() }"
					   @click="switchToCN">{{ getText('nav.language', 'zh') }}</p>
					<p class="popover-content-language-en"
					   :class="{ 'active-language': !isChinese() }"
					   @click="switchToEN">{{ getText('nav.language', 'en') }}</p>
				</div>
				</div>
				<template #reference>
					<div class="menu" @click="visible = !visible">
						<img :src="menuIcon" alt="Menu" />
					</div>
				</template>
			</el-popover>
			<div v-if="visible" class="popover-overlay" @click="visible = false"></div>
		</div>
	</div>
</template>

<script setup>
	import {
		ref,
		inject,
		onMounted,
		onUnmounted,
		computed,
		effect
	} from "vue";
	import {
		useRouter,
		useRoute
	} from "vue-router";
	import {
		debounce
	} from "lodash";
	import emitter from "@/event/event";
	import { currentLanguage, switchLanguage, isChinese, getText, isEnglishEnabled } from "@/utils/language";
	import arrowUpIcon from "@/components/Header/images/arrow_up.png";
	import arrowDownIcon from "@/components/Header/images/arrow_down.png";
	import menuIcon from "@/components/Header/images/menu.png";

	const router = useRouter();
	const route = useRoute();

	// 语言切换函数
	const switchToCN = () => switchLanguage('zh');
	const switchToEN = () => switchLanguage('en');

	// 使用动态菜单数据，支持语言切换
	const navData = computed(() => [
		{
			key: 0,
			name: getText('nav.bioIntelligent'),
			router: "bioIntelligent",
			state: false,
			submenu: [],
			disabled: true,
		},
		{
			key: 1,
			name: getText('nav.products'),
			router: "/",
			state: false,
			submenu: [
				{
					key: 1,
					name: getText('nav.material'),
					router: "material"
				},
				{
					key: 2,
					name: getText('nav.aminoAcid'),
					router: "aminoAcid"
				},
				{
					key: 3,
					name: getText('nav.knotWeed'),
					router: "knotWeed"
				},
			],
			iconUp: arrowUpIcon,
			iconDown: arrowDownIcon,
		},
		{
			key: 2,
			name: getText('nav.aboutUs'),
			router: "/",
			state: false,
			submenu: [
				{
					key: 21,
					name: getText('nav.corporate'),
					router: "corporate"
				},
				{
					key: 22,
					name: getText('nav.vision'),
					router: "vision"
				},
			],
			iconUp: arrowUpIcon,
			iconDown: arrowDownIcon,
		},
		{
			key: 3,
			name: getText('nav.news'),
			router: "mintNews",
			state: false,
			submenu: [],
			disabled: true,
		}
	]);
	const visible = ref(false);

	const bannerHeight = inject('bannerHeight');

	const isOverHeight = ref(false);

	const toggleBlurRoutes = ['/', 'home', 'bioIntelligent', 'corporate'];

	const openContact = () => {
		emitter.emit('open-popover')
	}

	const handleScroll = debounce(() => {
		// 如果当前路由不是首页，直接退出
		if (!toggleBlurRoutes.includes(route.name)) {
			return;
		}

		if (bannerHeight && bannerHeight.value !== undefined) {
			// 获取当前滚动位置
			const scrollY = window.scrollY;

			// 检查滚动位置是否超过 bannerHeight
			isOverHeight.value = scrollY > bannerHeight.value;
		}
	}, 500);

	const shouldBlur = computed(() => {
		return !toggleBlurRoutes.includes(route.name) || isOverHeight.value;
	});

	onMounted(() => {
		window.addEventListener('scroll', handleScroll);
	});

	onUnmounted(() => {
		window.removeEventListener('scroll', handleScroll);
	});

	// 添加状态管理
	const navStates = ref({});

	const setMouseOver = (item) => {
		// 清除所有状态
		Object.keys(navStates.value).forEach(key => {
			navStates.value[key] = false;
		});
		// 设置当前项状态
		navStates.value[item.key] = true;
		item.state = true;
	};

	const setMouseLeave = (item) => {
		navStates.value[item.key] = false;
		item.state = false;
	};

	const handleClick = (item) => {
		// 如果菜单项被禁用，阻止点击
		if (item.disabled) {
			return;
		}
		// 如果主菜单项有子菜单，阻止点击事件
		if (item.submenu && item.submenu.length > 0) {
			return;
		}
		// 如果没有子菜单，正常跳转
		const targetPath = item.router;
		if (router.currentRoute.value.path !== targetPath) {
			// 只有在目标路径与当前路径不同时才导航
			router.push({
				name: item.router
			});
		}
	};
	const handleJumps = (item) => {
		router.push({
			name: item
		});
	};

	const popperOptions = ref({
		modifiers: [{
			name: "offset",
			options: {
				offset: [-415, 30], // 控制水平和垂直偏移
			},
		}, ],
	});
</script>

<style lang="less">
	.el-popover.el-popper.header-popover {
		padding: 24px 26px 95px 72px;
		border-radius: 20px;
		background-color: #12161b;
	}

	.popover-content {

		&-close {
			margin-bottom: 62px;
			text-align: right;

			img {
				width: 54px;
				height: 54px;
			}

			.close-icon {
				width: 54px;
				height: 54px;
				cursor: pointer;
				transition: transform 0.25s ease, opacity 0.25s ease;
				opacity: 0.85;

				&:hover {
					opacity: 1;
					transform: rotate(90deg);
				}
			}
		}

		&-menu {
			display: flex;
			gap: 80px;

			&-item {
				display: flex;
				flex-direction: column;
				gap: 39px;

				p {
					font-size: 16px;
					font-weight: 500;
					color: #f1f3f7;
				}
			}
		}

		&-language {
			margin-top: 118px;
			display: flex;
			align-items: center;
			gap: 80px;

			&-cn,
			&-en {
				font-size: 16px;
				font-weight: 500;
				color: #f1f3f7;
				cursor: pointer;
				transition: color 0.3s ease;

				&:hover {
					color: #ff7200;
				}

				&.active-language {
					color: #ff7200;
					font-weight: 600;
				}
			}
		}

		&-download {
			display: flex;
			justify-content: center;
			align-items: center;
			width: 158px;
			height: 67px;
			color: #f1f3f7;
			border: 1px solid #ffffff1a;
			border-radius: 999px;
		}
	}

	.popover-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		/* Semi-transparent background */
		z-index: 9;
		/* Ensure it's above the page content but below the popover */
	}
</style>
<style lang="less" scoped>
	@import "@/style/variable.less";

	.header {
		z-index: 10;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-around;
		padding-top: 16px;

		&-left {
			&-logo {
				width: 122px;
				height: 60px;

				img {
					width: 100%;
					height: 100%;
				}
			}
		}

		&-middle {
			width: 50%;
			display: flex;
			justify-content: space-between;

			&-left {
				width: 80%;

				.nav {
					width: 100%;
					display: flex;

					align-items: center;
					padding: 0;
					margin: 0;
					list-style: none;
					// border: 1px solid #fff;
					border-radius: 16px;
					// background-color: #2828289f;
					border: 1px solid transparent;
					background-image: linear-gradient(#282828, #292b2d),
						linear-gradient(185deg,
							rgba(255, 255, 255, 0.4) 2.12%,
							rgba(255, 255, 255, 0.3) 50%,
							rgba(255, 255, 255, 0.2) 70%,
							rgba(255, 255, 255, 0.1) 93.02%);
					background-origin: border-box;
					background-clip: content-box, border-box;

					.nav-item {
						position: relative;
						flex: 1;
						min-width: 0;
						height: 54px;
						line-height: 54px;
						text-align: center;
						font-size: 16px;
						font-weight: 500;
						color: #fff;
						transition: background-color 0.3s ease, color 0.3s ease;
						cursor: pointer;

						&-link {
							display: block;
							width: 100%;
							height: 100%;
							padding: 0 12px;
							box-sizing: border-box;
							text-decoration: none;
							color: inherit;
							white-space: nowrap;
							overflow: hidden;
							text-overflow: ellipsis;
						}

						&-current {
							color: #ff7200;
						}

						&:hover {
							background-color: #ff7200;
							color: #fff;
							cursor: pointer;
						}

						&:first-child {
							border-top-left-radius: 16px;
							border-bottom-left-radius: 16px;
						}

						&:last-child {
							border-top-right-radius: 16px;
							border-bottom-right-radius: 16px;
						}

						&.nav-item_current {
							background-color: #ff7200;
							color: #fff;
						}

						&.has-submenu:hover {
							background-color: #ff7200;
						}

						.submenu {
							display: none;
							list-style: none;
							padding: 0;
							margin-top: 1px;
							position: absolute;
							top: 100%;
							left: 0;
							background-color: #2828289f;
							border-radius: 12px;
							opacity: 0;
							transition: opacity 0.3s ease;
							z-index: 10;
							white-space: nowrap;
						}

						&:hover .submenu {
							padding: 19px 26px;
							display: flex;
							box-sizing: border-box;
							gap: 8px;
							opacity: 1;
						}

						.submenu-icon {
							margin-left: 4px;
							width: 12px;
							vertical-align: middle;
						}
					}

					.submenu-item {
						// padding: 0 30px;
						// width: 100%;
						height: 72px;
						line-height: 72px;
						text-align: center;
						font-size: 16px;
						border-radius: 12px;
						background-color: #02030833;

						&-link {
							// margin: 0 30px;
							padding-right: 30px;
							display: block;
							width: 100%;
							height: 100%;
							text-decoration: none;
							color: inherit;
						}

						&:hover {
							background-color: #ff7200;
							color: #fff;
						}
					}
				}
			}

			&-right {
				width: 12%;
				display: flex;

				.contactnav {
					width: 100%;
					display: flex;

					align-items: center;
					padding: 0;
					margin: 0;
					list-style: none;
					// border: 1px solid #fff;
					border-radius: 16px;
					// background-color: #2828289f;
					border: 1px solid transparent;
					background-image: linear-gradient(#282828, #292b2d),
						linear-gradient(185deg,
							rgba(255, 255, 255, 0.4) 2.12%,
							rgba(255, 255, 255, 0.3) 50%,
							rgba(255, 255, 255, 0.2) 70%,
							rgba(255, 255, 255, 0.1) 93.02%);
					background-origin: border-box;
					background-clip: content-box, border-box;

					&-item {
						display: block;
						width: 100%;
						height: 100%;
						position: relative;
						
						line-height: 54px;
						text-align: center;
						font-size: 16px;
						font-weight: 500;
						color: #fff;
						transition: background-color 0.3s ease, color 0.3s ease;
						cursor: pointer;
					}
				}


			}

			&-right {
				.menu {
					width: 54px;

					img {
						width: 100%;
						height: 100%;
					}
				}
			}
		}

		.header::after {
			content: "";
			position: absolute;
			top: 0;
			/* 位于边框下方 */
			left: 50%;
			/* 水平居中 */
			width: 80%;
			/* 光晕的宽度 */
			height: 450px;
			/* 光晕的高度 */
			background: radial-gradient(55% 50% at 50% 0%,
					rgba(255, 255, 255, 0.5) 0%,
					rgba(255, 255, 255, 0) 100%);
			transform: translateX(-50%);
			filter: blur(20px);
			opacity: 0.1;
			pointer-events: none;
			/* 光晕不影响交互 */
		}

		.blur-background {
			backdrop-filter: blur(5px);
		}
	}
</style>