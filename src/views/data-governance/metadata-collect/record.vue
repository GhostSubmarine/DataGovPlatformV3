<template>
	<el-dialog v-model="visible" title="采集记录" :close-on-click-modal="false">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
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
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column>
			<el-table-column prop="metadataCollectId" label="采集任务id" header-align="center" align="center"></el-table-column> -->
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
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="250">
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
	</el-dialog>
	
	<el-dialog v-model="realTimeLogVisbale" title="实时日志" width="55%">
		<el-button type="primary" @click="getNewestRealTimeLog">获取最新日志</el-button>
		<div style="padding: 15px">
			<ReadonlyStudio id="collectRealTimeLog" ref="collectRealTimeLogRef" style="height: 500px"></ReadonlyStudio>
		</div>
	</el-dialog>
	
	<el-dialog v-model="errorLogVisbale" title="错误日志" width="55%">
		<div style="padding: 15px">
			<ReadonlyStudio id="collectErrorLog" ref="collectErrorLogRef" style="height: 500px"></ReadonlyStudio>
		</div>
	</el-dialog>
	
</template>

<script setup lang="ts" name="SrtRecordIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import ReadonlyStudio from '../../data-development/production/readonly-studio.vue'
import { getCollectRecordApi } from '@/api/data-governance/metadataCollect'

const visible = ref(false)
const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/metadata-collect-record/page',
	deleteUrl: '/data-governance/metadata-collect-record',
	queryForm: {
		startTime: '',
		endTime: '',
		status: ''
	}
})

const init = (id: number) => {
	visible.value = true
	state.queryForm.metadataCollectId = id
	getDataList()
}

const collectRealTimeLogRef = ref()
const realTimeLogVisbale = ref(false)
const currentId = ref()
const getRealTimeLog = (id) => {
	realTimeLogVisbale.value = true
	getCollectRecordApi(id).then(res => {
		currentId.value = id 
		collectRealTimeLogRef.value.setEditorValue(res.data.realTimeLog)
	})
}

const getNewestRealTimeLog = () => {
	getCollectRecordApi(currentId.value).then(res => {
		collectRealTimeLogRef.value.setEditorValue(res.data.realTimeLog)
	})
}

const errorLogVisbale = ref(false)
const collectErrorLogRef = ref()
const getErrorLog = (errorLog) => {
	errorLogVisbale.value = true
	setTimeout(()=>{
		collectErrorLogRef.value.setEditorValue(errorLog)
	}, 500)
	
}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
