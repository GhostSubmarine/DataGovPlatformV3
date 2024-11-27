<template>
	<el-dialog v-model="visible" title="执行记录">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
				<fast-select v-model="state.queryForm.runStatus" placeholder="运行状态" dict-type="run_status" clearable></fast-select>
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
			<el-table-column prop="id" label="序号" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="runStatus" label="运行状态" header-align="center" align="center" dict-type="run_status" width="120px"></fast-table-column>
			<fast-table-column prop="runType" label="任务类型" header-align="center" align="center" dict-type="access_run_type" width="120px"></fast-table-column>
			<el-table-column show-overflow-tooltip="" prop="startTime" label="开始时间" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="endTime" label="结束时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="dataCount" label="推送数据量" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="250">
				<template #default="scope">
					<el-button type="primary" link @click="getRealTimeLog(scope.row.id)">实时日志</el-button>
					<el-button type="primary" v-if="scope.row.runStatus == 2" link @click="stopTask(scope.row.executeNo)">终止</el-button>
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
	
		<el-dialog v-model="realTimeLogVisbale" title="实时日志" width="65%">
			<el-button type="primary" @click="getNewestRealTimeLog">获取最新日志</el-button>
			<div style="padding: 15px">
				<ReadonlyStudio id="dataPushTaskRealTimeLog" ref="accessRealTimeLogRef" style="height: 500px"></ReadonlyStudio>
			</div>
		</el-dialog>
	</el-dialog>
</template>

<script setup lang="ts" name="SrtDataPushTaskLogIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'
import ReadonlyStudio from '../../data-development/production/readonly-studio.vue'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import { getTaskByIdApi,stopTaskApi } from '@/api/data-governance/dataPushTaskLog'

const visible = ref(false)
const state: IHooksOptions = reactive({
	dataListUrl: '/data-governance/dataPushTaskLog/page',
	deleteUrl: '/data-governance/dataPushTaskLog',
	queryForm: {
		dataPushTaskId: '',
		runStatus: ''
	}
})

const init = (id?: number) => {
	state.queryForm.dataPushTaskId = id
	visible.value = true
	getDataList()
}

const realTimeLogVisbale = ref(false)
const accessRealTimeLogRef = ref()
const currentId = ref()
const getRealTimeLog = (id) => {
	realTimeLogVisbale.value = true
	currentId.value = id
	getTaskByIdApi(id).then(res=> {
		accessRealTimeLogRef.value.setEditorValue(res.data.realTimeLog)
	})
}
const getNewestRealTimeLog = () => {
	getTaskByIdApi(currentId.value).then(res=> {
		accessRealTimeLogRef.value.setEditorValue(res.data.realTimeLog)
	})
}

const stopTask = (executeNo: any) => {
	if(!executeNo) {
		ElMessage.warning("自动调度类型的任务请前往数据接入，点击取消发布停止！")
		return
	}
	ElMessageBox.confirm('确定终止该手动调度的任务吗?', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(() => {
			stopTaskApi(executeNo).then( res => {
				ElMessage({
				    message: '任务已成功终止',
				    type: 'success',
				  })
				getDataList()
			})
		})
		.catch(() => {})
}

defineExpose({
	init
})



const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
