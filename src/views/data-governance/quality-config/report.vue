<template>
	
	<el-dialog v-model="visible" class="report-dialog" title="数据质量评估报告" width="60%" :destroy-on-close="true">
		 <!-- 在 header 中添加按钮 -->
		  <template #header>
		 	<div class="dialog-header flex-between mr20" style="display: flex;justify-content: space-between;margin-right:20px;">
		 		<span class="el-dialog__title">数据质量评估报告</span>
		 		<el-button type="warning" size="small" @click="exportPdf">导出 PDF</el-button>
		 	</div>
		 </template>
		 <div id="pdfRef">
			<div class="flex-between-top mb20" style="display: flex;justify-content: space-between;margin-bottom:20px;">
				<div class="flex-start" style="flex: 1; font-weight: 700">【{{ reportData.sourceTableRemark }}】数据质量报告</div>
				<div style="width: 200px; align-items: center" class="flex-end-top">
					<span>评估时间：</span>
					<span style="color: #667afa">{{ reportData.checkEndTime }}</span>
				</div>
			</div>
			<div class="baseInfo mb20" style="margin-bottom:20px;">
				<el-row>
					<el-col :span="2"> </el-col>
					<el-col :span="7">
						<span>模型名称：</span>
						<span>{{ reportData.sourceTableRemark }}</span>
					</el-col>
					<el-col :span="7">
						<span>模型编码：</span>
						<span>{{ reportData.sourceTableName }}</span>
					</el-col>
					<el-col :span="7">
						<span>模型备注：</span>
						<span>{{ reportData.sourceTableRemark }}</span>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="2"> </el-col>
					<el-col :span="7">
						<span>规则名称：</span>
						<span>{{ reportData.qualityConfigName }}</span>
					</el-col>
					<el-col :span="7">
						<span>所属数据源：</span>
						<span>{{ reportData.dataProv }}</span>
					</el-col>
					<el-col :span="7">
						<span>责任人：</span>
						<!-- <el-tag type="success">{{  reportData.dutyUser }}</el-tag> -->
						<span>{{ reportData.dutyUser }}</span>
					</el-col>
				</el-row>
			</div>
			<div class="cardBox">
				<div class="cardItem" style="background-color: #667afa; color: #fff">
					<div class="number" style="color: #fff">
						{{ reportData.checkDataCount ==0 ? '100%' : (((reportData.checkDataCount - reportData.errorDataCount) / reportData.checkDataCount) * 100).toFixed(2) + '%' }}
					</div>
					<div class="title">合格率</div>
				</div>
				<!-- <div class="cardItem" style="background-color: #667afa; color: #fff">
					<div class="number" style="color: #fff;">12</div>
					<div class="title">质量评分</div>
				</div> -->
				<div class="cardItem">
					<div class="number">{{ qualityCount }}</div>
					<div class="title">质量规则数</div>
				</div>
				<div class="cardItem">
					<div class="number">全部数据</div>
					<div class="title">评估范围</div>
				</div>
				<div class="cardItem">
					<div class="number">{{ reportData.checkDataCount }}</div>
					<div class="title">评估总数</div>
				</div>
				<div class="cardItem">
					<div class="number">{{ reportData.checkDataCount - reportData.errorDataCount }}</div>
					<div class="title">合格条数</div>
				</div>
				<div class="cardItem">
					<div class="number">{{ reportData.errorDataCount }}</div>
					<div class="title">不合格条数</div>
				</div>
			</div>
			<h6>趋势分析</h6>
			<div ref="card1Chart" style="width: 100%; height: 300px"></div>
			<h6>脏数据</h6>
			<el-table
				v-loading="state.dataListLoading"
				:data="state.dataList"
				border
				style="width: 100%; margin-top: 20px"
				max-height="calc(100vh - 400px )"
				@selection-change="selectionChangeHandle"
			>
				<fast-table-column
					show-overflow-tooltip
					prop="qualityType"
					dict-type="quality_type"
					label="检测类型"
					header-align="center"
					align="center"
				></fast-table-column>
				<el-table-column prop="sourceTablePk" show-overflow-tooltip label="表主键" header-align="center" align="center"> </el-table-column>
				<el-table-column prop="dataPk" show-overflow-tooltip label="主键值" header-align="center" align="center"> </el-table-column>
				<el-table-column prop="errorColumn" show-overflow-tooltip label="错误字段" header-align="center" align="center"> </el-table-column>
				<el-table-column prop="errorValue" show-overflow-tooltip label="错误数据值" header-align="center" align="center">
					<template #default="scope">
						<span>{{ scope.row.errorValue ? scope.row.errorValue : '-' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="causeReason" show-overflow-tooltip label="发生原因" header-align="center" align="center"> </el-table-column>
				<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center" width="160px">
					<template  #default="scope">
						<span>{{$dayjs(scope.row.createTime).format('YYYY-MM-DD HH:mm:ss')}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="correctStatus" show-overflow-tooltip label="修正状态" header-align="center" align="center" width="120">
					<template #default="scope">
						<el-tag v-if="scope.row.correctStatus == 0" type=""><span>待修正</span></el-tag>
						<el-tag v-if="scope.row.correctStatus == 1" type="success"><span>已修正</span></el-tag>
					</template>
				</el-table-column>
			</el-table>
		</div>
	</el-dialog>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted, provide, getCurrentInstance } from 'vue'
import { useCrud } from '@/hooks'
import { IHooksOptions } from '@/hooks/interface'
import { htmlPdf } from "@/utils/htmlPDF.js"
import { getQualityLogApi, getQualityLogListApi, getQualityCountApi } from '@/api/data-governance/qualityConfigCategory'
//  按需引入 echarts
import * as echarts from 'echarts'
import { color } from 'html2canvas/dist/types/css/types/color'
const { proxy } = getCurrentInstance()
const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/quality-topic/page',
	deleteUrl: '/data-governance/quality-topic',
	queryForm: {
		qualityConfigId: '',
		qualityConfigName: '',
		qualityType: '',
		dataProv: '',
		checkStartTime: '',
		checkEndTime: '',
		qualityLogId: ''
	}
})
const visible = ref(false)
const init = data => {
	visible.value = true
	
	getQualityLogList({
		qualityConfigId: data.id,
		qualityConfigName: data.qualityConfigName
	})
	getQualityCount(data.id)
}
const qualityCount = ref(0)
const getQualityCount = (qualityConfigId) => {
	getQualityCountApi(qualityConfigId).then(res => {
		qualityCount.value = res.data.length
	})
}
const getQualityLogList = data => {
	getQualityLogListApi({
		page: 1,
		limit: 99,
		qualityConfigId: data.qualityConfigId,
		qualityLogId: data.qualityLogId,
		qualityConfigName: data.qualityConfigName
	}).then(res => {
		// 获取日志详情
		getQualityLog(res.data.list[0].id)
		state.queryForm.qualityLogId = res.data.list[0].id
		// 脏数据
		getDataList()
		console.log('res', res)
		if (res.data && res.data.list.length > 0) {
			let dataList = res.data.list.reverse()
			let xData = []
			let yData = []
			dataList.forEach(item => {
				/* item.createTime = proxy.$dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
				xData.push(proxy.$dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')) */
				xData.push(item.createTime)
				yData.push({
					value: item.checkDataCount == 0? 100 : Number((((item.checkDataCount - item.errorDataCount) / item.checkDataCount) * 100).toFixed(2)),
					dataCount: item.checkDataCount - item.errorDataCount,
					errorDataCount: item.errorDataCount,
					checkDataCount: item.checkDataCount,
					logId: item.id
				})
			})
			initCard1Chart(xData, yData)
		}
	})
}
const reportData = reactive({})
const getQualityLog = id => {
	getQualityLogApi(id).then(res => {
		Object.assign(reportData, res.data)
	})
}
const card1Chart = ref()
function initCard1Chart(xData, yData) {
	// 基于准备好的dom，初始化echarts实例
	var myChart = echarts.init(card1Chart.value)
	// 指定图表的配置项和数据
	var option = {
		backgroundColor: '#fff',
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
				textStyle: {
					color: '#fff'
				}
			},
			formatter: function (params) {
				var res = '时间: ' + params[0].name + '<br/>';
				res += '合格率: ' + params[0].data.value + '%' + '<br/>';
				res += '评估总数: ' + params[0].data.checkDataCount + '<br/>';
				res += '合格条数: ' + params[0].data.dataCount + '<br/>';
				res += '不合格条数: ' + params[0].data.errorDataCount;
				return res;
			}
		},
		calculable: true,
		grid: {
			left: '5%', //图表距离容器左侧多少距离
			right: '2%', //图表距离容器右侧侧多少距离
			bottom: '36%', //图表距离容器上面多少距离
			top: '10'
		},
		xAxis: [
			{
				type: 'category',
				axisLine: {
					lineStyle: {
						color: '#0089cc',
						width: 2
					}
				},
				splitLine: {
					show: false
				},
				axisTick: {
					show: true
				},
				splitArea: {
					show: false
				},
				axisLabel: {
					textStyle: {
						color: '#000000'
					},
					interval: 0,
					rotate: 25, // X轴标签倾斜 45 度
					margin: 16,
					formatter: function (params) {
						var newParamsName = '' // 拼接后的新字符串
						var paramsNameNumber = params.length // 实际标签数
						var provideNumber = 10 // 每行显示的字数
						var rowNumber = Math.ceil(paramsNameNumber / provideNumber) // 如需换回，算出要显示的行数
						if (paramsNameNumber > provideNumber) {
							/** 循环每一行,p表示行 */
							for (var i = 0; i < rowNumber; i++) {
								var tempStr = '' // 每次截取的字符串
								var start = i * provideNumber // 截取位置开始
								var end = start + provideNumber // 截取位置结束
								// 最后一行的需要单独处理
								if (i == rowNumber - 1) {
									tempStr = params.substring(start, paramsNameNumber)
								} else {
									tempStr = params.substring(start, end) + '\n'
								}
								newParamsName += tempStr
							}
						} else {
							newParamsName = params
						}
						return newParamsName
					}
				},
				data: xData
			}
		],
		yAxis: [
			{
				type: 'value',
				splitLine: {
					show: false
				},
				axisLine: {
					lineStyle: {
						color: '#0089cc',
						width: 2
					}
				},
				axisTick: {
					show: false
				},
				axisLabel: {
					textStyle: {
						color: '#000000'
					},
					interval: 0
				},
				splitArea: {
					show: false
				}
			}
		],
		dataZoom: [
			{
				show: true,
				height: 30,
				xAxisIndex: [0],
				bottom: 30,
				start: 0,
				end: 100,
				dataBackground: {
					lineStyle: {
						color: '#efefff',
						width: 1
					},
					areaStyle: {
						color: '#efefff',
						shadowBlur: 0,
						opacity: 1
					}
				},
				fillerColor: 'transparent', // 选中范围背景色
				handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
				handleSize: '110%',
				handleStyle: {
					color: '#008acd',
					borderColor: '#fff'
				},
				textStyle: {
					color: '#008acd'
				},
				borderColor: '#4babd9'
			},
			{
				type: 'inside',
				show: true,
				height: 15,
				start: 1,
				end: 35
			}
		],
		series: [
			{
				name: '合格率',
				type: 'line',
				stack: '总量',
				symbolSize: 10,
				symbol: 'circle',
				lineStyle: {
					color: '#37c9cb', // 折线颜色
					width: 2 // 折线宽度
				},
				label: {
					//在折线上显示相对应的数值
					normal: {
						show: true,
						position: 'top', //数值的位置
						distance: 8, //数值距离折线的距离
						fontSize: 12, //数值的字体大小
						color: '#37c9cb' //数值的颜色
					}
				},
				itemStyle: {
					normal: {
						color: '#ffffff',
						borderWidth: 2,
						borderColor: '#37c9cb', // barBorderRadius: 0,
						label: {
							show: true,
							position: 'top',
							formatter: function (p) {
								return p.value > 0 ? p.value + '%' : ''
							}
						}
					}
				},
				data: yData
			}
		]
	}
	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option)
	myChart.on('click', (params) => {
		state.queryForm.qualityLogId = params.data.logId
		//上方数据变化
		getQualityLog(params.data.logId)
		// 脏数据
		getDataList()
	})
}

const exportPdf = () => {
	var fileName= '质量报告'
	const fileList = document.getElementsByClassName('pdfRef')   
	htmlPdf(fileName, document.querySelector('#pdfRef'), fileList)
}

defineExpose({
	init
})
const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteHandle, deleteBatchHandle } = useCrud(state)
</script>
<style lang="less">
.report-dialog {
	margin-top: 2px;
	.el-dialog__body {
		margin: 0 80px;
	}
	.baseInfo {
		background-color: #f4f3f1;
		padding: 10px 0;
		.el-row {
			height: 36px;
			line-height: 36px;
		}
	}
	.cardBox {
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-align: center;
		.cardItem {
			height: 70px;
			width: 100px;
			border-radius: 4px;
			border: 1px solid #f4f3f1;
			.number {
				height: 18px;
				line-height: 18px;
				margin: 16px 0 4px 0;
				color: #667afa;
				font-weight: 700;
			}
			.title {
				font-size: 12px;
			}
		}
	}
	h6 {
		padding: 12px 0;
		padding-left: 20px;
		position: relative;
		font-size: 16px;
		font-family: Alibaba-PuHuiTi-M, Alibaba-PuHuiTi;
		font-weight: normal;
		color: #020e19;
		&::after {
			content: '';
			height: 12px;
			width: 4px;
			position: absolute;
			
			left: 6px;
			top: 50%;
			transform: translateY(-50%);
			// background-color: $--color-primary;
			background: linear-gradient(180deg, #10b0f9 0%, rgba(25, 104, 249, 0.3) 100%);
		}
	}
}
</style>