<template>
	<el-dialog v-model="visable" title="检测详情" width="65%">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <fast-select v-model="state.queryForm.checkResult" dict-type="yes_or_no" placeholder="检测结果" clearable></fast-select>
			</el-form-item>
			<el-form-item>
			  <fast-select v-model="state.queryForm.notPassReason" dict-type="not_pass_reason" placeholder="未通过原因" clearable></fast-select>
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
			<el-table-column show-overflow-tooltip prop="checkRow" label="数据信息" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="notPassInfo" label="未通过信息" header-align="center" align="center"></el-table-column>
			<el-table-column show-overflow-tooltip prop="checkTime" label="检测时间" header-align="center" align="center"></el-table-column>
			<el-table-column prop="checkResult" label="检测结果" header-align="center" align="center">
				<template #default="scope">
					<el-tag type="danger" v-if="scope.row.checkResult == 0">未通过</el-tag>
					<el-tag type="success" v-if="scope.row.checkResult == 1">通过</el-tag>
				</template>
			</el-table-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
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
</template>

<script setup lang="ts">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import { IHooksOptions } from '@/hooks/interface'

const visable = ref(false)
const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/quality-task-column/page',
	deleteUrl: '/data-governance/quality-task-column',
	queryForm: {
		qualityTaskTableId: '',
		notPassReason: '',
		checkResult: ''
	}
})

const init = (qualityTaskTableId: number) => {
	visable.value = true
	state.queryForm.qualityTaskTableId = qualityTaskTableId
	getDataList()
}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
