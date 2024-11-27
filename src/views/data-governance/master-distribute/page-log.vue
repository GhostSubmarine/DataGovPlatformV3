<template>
	<el-dialog v-model="visible" title="执行记录" :close-on-click-modal="false">
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
			<el-table-column prop="id" label="执行序号" header-align="center" align="center" width="100px"></el-table-column>
			<fast-table-column prop="runStatus" label="运行状态" header-align="center" align="center" dict-type="run_status" width="120px"></fast-table-column>
			<el-table-column prop="startTime"  label="开始时间" header-align="center" align="center" width="160px"></el-table-column>
			<el-table-column prop="endTime"  label="结束时间" header-align="center" align="center" width="160px"></el-table-column>
			<el-table-column prop="dataCount" label="派发数据量" header-align="center" align="center" width="160px"></el-table-column>
			<el-table-column prop="byteCount" label="数据量大小" header-align="center" align="center" width="160px"></el-table-column>
			<el-table-column prop="createTime"  label="创建时间" header-align="center" align="center" width="160px"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button type="primary" link @click="getErrorLog(scope.row.errorInfo)" v-if="scope.row.errorInfo">错误日志</el-button>
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

		<el-dialog v-model="distributeErrorLogVisbale" title="错误日志" width="65%">
			<div style="padding: 15px">
				<ReadonlyStudio id="distributeErrorLog" ref="distributeErrorLogRef" style="height: 500px"></ReadonlyStudio>
			</div>
		</el-dialog>

	</el-dialog>
</template>

<script setup lang="ts">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'
import ReadonlyStudio from '../../data-development/production/readonly-studio.vue'

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/master-distribute-log/page',
	deleteUrl: '/data-governance/master-distribute-log',
	queryForm: {
		distributeId: '',
		runStatus: '',
		
	}
})

const visible = ref(false)
const init = (id?: number) => {
	state.queryForm.distributeId = id
	visible.value = true
	getDataList()
}

const distributeErrorLogVisbale = ref(false)
const distributeErrorLogRef = ref()
const getErrorLog = (errorLog) => {
	distributeErrorLogVisbale.value = true
	setTimeout(()=>{
		distributeErrorLogRef.value.setEditorValue(errorLog)
	},200)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)

defineExpose({
		init
	})

</script>
