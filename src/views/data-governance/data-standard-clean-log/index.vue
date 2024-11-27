<template>
	<el-card>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.standardCleanName" placeholder="清洗名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.startTime"
						 type="datetime"
						 placeholder="开始时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
				<el-date-picker
						 v-model="state.queryForm.endTime"
						 type="datetime"
						 placeholder="结束时间"
						 format="YYYY-MM-DD hh:mm:ss"
						 value-format="YYYY-MM-DD hh:mm:ss"
				     />
			</el-form-item>
			<el-form-item>
			   <fast-select v-model="state.queryForm.status" dict-type="metadata_collect_status" placeholder="状态" clearable filterable></fast-select>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column prop="standardCleanName" label="清洗名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="startTime" label="开始时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="endTime" label="结束时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="status" label="状态" header-align="center" align="center">
				<template #default="scope">
					<span>
						<el-tag v-if="scope.row.status == 0" type="danger">失败</el-tag>
						<el-tag v-if="scope.row.status == 1" type="success">成功</el-tag>
						<el-tag v-if="scope.row.status == 2" type="success">运行中</el-tag>
					</span>
				</template>
			</el-table-column>
			<!-- <el-table-column prop="realTimeLog" label="实时日志" header-align="center" align="center"></el-table-column>
			<el-table-column prop="errorLog" label="错误日志" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="230">
				<template #default="scope">
					<el-button type="primary" link @click="getRealTimeLog(scope.row.id)">实时日志</el-button>
					<el-button v-if="scope.row.status == 0" type="primary" link @click="getErrorLog(scope.row.errorLog)">错误日志</el-button>
					<el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<el-pagination
			:current-page="state.page"
			:page-sizes="state.pageSizes"
			:page-size="state.limit"
			:total="state.total"
			layout="total, sizes, prev, pager, next, jumper"
			@size-change="sizeChangeHandle"
			@current-change="currentChangeHandle"
		>
		</el-pagination>

		<el-dialog v-model="realTimeLogVisbale" title="实时日志" width="55%">
			<el-button type="primary" @click="getNewestRealTimeLog">获取最新日志</el-button>
			<div style="padding: 15px">
				<ReadonlyStudio id="standardRealTimeLog" ref="standardRealTimeLogRef" style="height: 500px"></ReadonlyStudio>
			</div>
		</el-dialog>
		
		<el-dialog v-model="errorLogVisbale" title="错误日志" width="55%">
			<div style="padding: 15px">
				<ReadonlyStudio id="standardErrorLog" ref="standardErrorLogRef" style="height: 500px"></ReadonlyStudio>
			</div>
		</el-dialog>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceData-standard-clean-logIndex">
import { useCrud } from '@/hooks'
import { reactive, ref,onMounted } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import ReadonlyStudio from '../../data-development/production/readonly-studio.vue'
import { useStandardCleanLogApi } from '@/api/data-governance/standardCleanLog'

const props = defineProps({
	hasMetadataId: {
		type: String,
		required: false,
		default: () => ''
	}
})

onMounted(()=>{
  if(!props.hasMetadataId) {
	  getDataList()
  }
})

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/standard-clean-log/page',
	deleteUrl: '/data-governance/standard-clean-log',
	queryForm: {
		startTime: '',
		endTime: '',
		status: '',
		standardCleanName: ''
	}
})

const init = (id: number) => {
	state.queryForm.metadataId = id
	getDataList()
}

const standardRealTimeLogRef = ref()
const realTimeLogVisbale = ref(false)
const currentId = ref()
const getRealTimeLog = (id) => {
	realTimeLogVisbale.value = true
	useStandardCleanLogApi(id).then(res => {
		currentId.value = id 
		standardRealTimeLogRef.value.setEditorValue(res.data.realTimeLog)
	})
}

const getNewestRealTimeLog = () => {
	useStandardCleanLogApi(currentId.value).then(res => {
		standardRealTimeLogRef.value.setEditorValue(res.data.realTimeLog)
	})
}

const errorLogVisbale = ref(false)
const standardErrorLogRef = ref()
const getErrorLog = (errorLog) => {
	errorLogVisbale.value = true
	setTimeout(()=>{
		standardErrorLogRef.value.setEditorValue(errorLog)
	}, 500)
	
}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
