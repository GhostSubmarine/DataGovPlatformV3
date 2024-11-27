<template>
	<el-scrollbar>
		<div style="padding: 20px">
			<div style="margin-bottom: 10px">
				<el-tooltip
							effect="dark"
							content="清空结果页面"
							placement="top-start"
				      >
				      <el-button v-show = "!!taskType && !ifOnlyShow" :icon="Delete" @click="clear"/>
				</el-tooltip>
			</div>
			<!-- sql -->
			<div v-show="taskType == '1'">
				<el-collapse>
					<el-collapse-item v-for="(item, index) in sqlResults" :title="(index + 1) + '. ' + item.sql">
						<div v-if="!item.ifQuery && item.success">
							<p><b>> Affected rows:&nbsp;</b><span><b>{{item.count}}</b></span></p>
							<p><b>> time:&nbsp;</b><span><b>{{item.time}}ms</b></span></p>
						</div>
						<div v-if="item.ifQuery && item.success">
							<p><b>> rows:&nbsp;</b><b>{{item.rowData.length}}</b></p>
							<!-- 表格数据 -->
							<el-table :data="item.rowData">
								 <el-table-column
									 :show-overflow-tooltip="true"
									 :prop="column"
									 :label="column"
									 v-for="(column, index) in item.columns"
									 :key="index"
								 >
								 </el-table-column>
							</el-table>
							<p><b>> time:&nbsp;</b><span><b>{{item.time}}ms</b></span></p>
						</div>
						<div v-if="!item.success">
							<p><b>> errorMsg: </b></p>
							<ReadonlyStudio id="sqlItemErrorMsgId" :value="item.errorMsg" style="height: 500px"></ReadonlyStudio>
							<!-- <p>{{item.errorMsg}}</p> -->
							<p><b>> time:&nbsp;</b><span><b>{{item.time}}ms</b></span></p>
						</div>
					</el-collapse-item>
				</el-collapse>
			</div>
			<!-- flinkSql -->
			<div v-show="taskType == '2'">
				<div v-show="!ifOnlyShow">
					<div style="margin-bottom: 10px">
						<el-tag>注意：flinkSql只有在同步执行模式下，当执行配置勾选了预览结果并且最后一条语句为查询语句时才会有结果显示！</el-tag>
					</div>
					<div style="margin-bottom: 10px">
						<el-button :icon="Search" type="primary" v-show="!!flinkResult.jobId" @click="getJobData()">获取最近一次任务执行返回的最新数据</el-button>
					</div>
					<p style="margin-bottom: 10px" v-show="!!!flinkResult.jobId" ><el-tag type="warning">没有获取到jobId，请自行排查原因（local模式下第一次可能获取不到，初始本地flink需要时间，有些语句不需要启动flink实例，也会导致无jobId）</el-tag></p>
				</div>
				<p><b>> rows:&nbsp;</b><b>{{flinkResult.rowData.length}}</b></p>
				<el-table :data="flinkResult.rowData" style="margin-bottom: 10px">
					 <el-table-column
						 :show-overflow-tooltip="true"
						 :prop="column"
						 :label="column"
						 v-for="(column, index) in flinkResult.columns"
						 :key="index"
					 >
					 </el-table-column>
				</el-table>
				<div v-if="!flinkResult.success && !!flinkResult.error">
					<el-tag style="margin-bottom: 10px"	 type="danger">过程中的错误日志：</el-tag>
					<ReadonlyStudio ref="flinkJobErrorMgRef" v-if="!flinkResult.success" id="flinkJobErrorMgId" :value="flinkResult.error" style="height:500px"></ReadonlyStudio>
				</div>
			</div>
		</div>
	</el-scrollbar>
</template>

<script lang="ts" setup>
	import { ref } from 'vue'
	import { getJobDataApi } from '@/api/data-development/task'
	import { ElMessage } from 'element-plus/es'
	import { Search,Delete } from '@element-plus/icons-vue'
	import ReadonlyStudio from './readonly-studio.vue'
	
	const ifOnlyShow = ref(false)
	const taskType = ref('')
	//sql查询的结果
	const sqlResults = ref([])
	const flinkResult = ref({rowData:[],columns:[]})
	
	const reset = () => {
		sqlResults.value = []
		flinkResult.value = {rowData:[],columns:[]}
	}
	
	const flinkJobErrorMgRef = ref()
	const init = (result, type, onlyShow) => {
		if(onlyShow) {
			ifOnlyShow.value = true
		}
		taskType.value = type
		if( type == '1' ) {
			sqlResults.value = result.results
		} else if( type == '2' ) {
			if(result) {
				result.rowData = result.rowData ? result.rowData: []
				result.columns = result.columns ? result.columns: []
				flinkResult.value = result
				if(!result.success) {
					setErrorMsg(result.error)
				}
				console.log(result)
			} else {
				flinkResult.value = {rowData:[],columns:[]}
			}
		}
	}
	
	const setErrorMsg = (error: any) => {
		if (flinkJobErrorMgRef.value) {
			flinkJobErrorMgRef.value.setEditorValue(error)
			return
		}
		setTimeout(() => {setErrorMsg(error)},500)
	}
	
	const getJobData = () => {
		getJobDataApi(flinkResult.value.jobId).then(res=>{
			if(!res.data.rowData) {
				flinkResult.value.rowData = []
			}
			if (!res.data.columns) {
				flinkResult.value.columns = []
			}
			flinkResult.value = res.data
			if(!res.data.success) {
				ElMessage.error("获取任务数据过程中出错了，请前往作业运维查看任务实例是否正常执行！")
			}
		})
	}
	
	const clear = () => {
		taskType.value = ''
		sqlResults.value = []
		flinkResult.value = {rowData:[],columns:[]}
	}
	
	
	defineExpose({
		clear,
		reset,
		init
	})
	
</script>

<style>
</style>