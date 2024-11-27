<template>
	<el-dialog v-model="visable" title="检测记录" width="85%">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.tableName" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.status" dict-type="run_status" placeholder="状态" clearable></fast-select>
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
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
			<el-table-column show-overflow-tooltip prop="tableName" label="表名" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="checkColumns" label="字段" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="status" show-overflow-tooltip label="状态" header-align="center" align="center" dict-type='run_status'></fast-table-column>
			<el-table-column prop="checkCount" label="检测条数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="passCount" label="检测通过数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="notPassCount" label="未通过数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="passRate" label="合格率" header-align="center" align="center"></el-table-column>
			<el-table-column prop="startTime" show-overflow-tooltip label="开始时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="endTime" show-overflow-tooltip label="结束时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="250">
				<template #default="scope">
					<el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
					<el-button type="primary" link @click="pageTaskColumn(scope.row.id)">详情</el-button>
					<el-button type="primary" v-if="scope.row.status==4" link @click="getErrorLog(scope.row.errorLog)">错误日志</el-button>
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
		
		<el-dialog v-model="errorLogVisable" title="错误日志" width="55%">
			<div style="padding: 15px">
				<ReadonlyStudio id="qualityTableErrorLog" ref="qualityTableErrorLogRef" style="height: 500px"></ReadonlyStudio>
			</div>
		</el-dialog>
		<TaskColumn ref="taskColumnRef"></TaskColumn>
	</el-dialog>
</template>

<script setup lang="ts">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import ReadonlyStudio from '../../data-development/production/readonly-studio.vue'
import TaskColumn from './task-column.vue'
import { IHooksOptions } from '@/hooks/interface'

const visable = ref(false)
const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/quality-task-table/page',
	deleteUrl: '/data-governance/quality-task-table',
	queryForm: {
		qualityTaskId: '',
		tableName: '',
		status: '',
		startTime: '',
		endTime: ''
	}
})

const init = (qualityTaskId: number) => {
	visable.value = true
	state.queryForm.qualityTaskId = qualityTaskId
	getDataList()
}

const errorLogVisable = ref(false)
const qualityTableErrorLogRef = ref()
const getErrorLog = (errorLog: any) => {
	errorLogVisable.value = true
	setTimeout(()=> {
		qualityTableErrorLogRef.value.setEditorValue(errorLog)
	},500)
}

const taskColumnRef = ref()
const pageTaskColumn = (id) => {
	taskColumnRef.value.init(id)
}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
