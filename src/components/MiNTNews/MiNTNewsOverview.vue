<template>
	<div class="overview-container">
		<div class="pic">
			<img :src="getImageUrl(props.info.pic)" mode="aspectFill" />
		</div>

		<div class="desc">
			<div class="desc-content">
				<div class="title">
					<span :style="{color: props.info.categorycolor}"> {{props.info.categorylabel}} </span>
					<span class="title-time"> {{props.info.time}} </span>
				</div>
				
				<div class="overviewtitle">
					<span> {{props.info.overviewtitle}} </span>
				</div>
				
				<div class="overviewcontent">
					<span> {{props.info.overviewcontent}} </span>
				</div>
			</div>
			
		</div>
	</div>
</template>

<script setup>
	import { getImageUrl } from "@/utils/index";
	const props = defineProps({
		info:{
			Object,
			required: true,
		}
	});
	
</script>

<style lang="scss" scoped>
	.overview-container{
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: space-between;

		.pic{
			width: 66%;
			height: 100%;
			
			img{
				width: 100%;
				height: 100%;
				border-radius: 10px;
				object-fit: cover;
			}
		}
		
		.desc{
			width: 33%;
			height: 100%;
			border-radius: 10px;
			background-color: #282828;
			display: flex;
			justify-content: center;
			
			.desc-content{
				width: 80%;
				height: 100%;
				
				.title{
					width: 80%;
					height: 30%;
					display: flex;
					justify-content: left;
					align-items: center;
					gap: 56px;
					span{
						font-size: 18px;
						font-weight: 450;
						line-height: 23.87px;
					}
					.title-time{
						color: #F1F3F7;
					}
				}
				
				.overviewtitle{
					width: 100%;
					height: 50px;
					margin-bottom: 40px;
					display: flex;
					justify-content: center;
					align-items: center;
					span{
						color: #F1F3F7;
						font-size: 24px;
						font-weight: 450;
						line-height: 31.82px;
					}
				}
				
				.overviewcontent{
					width: 100%;
					span{
						color: #F1F3F7;
						font-size: 15px;
						font-weight: 380;
						line-height: 30px;
					}
				}
			}
			
			
		}
		
		
	}
</style>