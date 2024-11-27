<template>
	<el-card>
		<el-tag style="margin-bottom: 10px"><p>tips：当前 ~ 该条历史记录的所有 savepoint 记录；全部 ~ 该条记录对应作业的所有 savepoint 记录</p></el-tag>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
				<el-select v-model="state.queryForm.range" placeholder="查询范围" @change="rangeChange">
				    <el-option key="1" label="当前" value="1"/>
						<el-option key="2" label="全部" value="2"/>
				</el-select>
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
			<el-table-column prop="type" label="类型" header-align="center" align="center"></el-table-column>
			<el-table-column prop="path" label="地址" header-align="center" align="center"></el-table-column>
			<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
			<!-- <el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
				<template #default="scope">
					<el-button type="primary" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
				</template>
			</el-table-column> -->
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
	</el-card>
</template>

<script setup lang="ts" name="SrtSavepointsIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted } from 'vue'
import { IHooksOptions } from '@/hooks/interface'

const props = defineProps({
	taskId: {
		type: [Number, String],
		required: false,
		default: () => ''
	},
	historyId: {
		type: [Number, String],
		required: false,
		default: () => ''
	}
})

onMounted(() => {
	//console.log(props.taskId)
	 if(props.taskId) {
		 state.queryForm.taskId = props.taskId
	 }
	 if(props.historyId) {
	 		 state.queryForm.historyId = props.historyId
	 }
	 getDataList()
})

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-development/task/savepoint/page',
	deleteUrl: '/data-development/task/savepoint',
	queryForm: {
		taskId: '',
		historyId: '',
		range: '1'
	}
})

const rangeChange = (val: any) => {
	if(val == '1') {
		state.queryForm.historyId = props.historyId
	} else {
		state.queryForm.historyId = ''
	}
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
