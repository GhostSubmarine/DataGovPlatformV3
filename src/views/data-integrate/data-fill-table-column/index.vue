<template>
	<el-dialog v-model="visible" title="字段配置">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.name" placeholder="字段名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.cnName" placeholder="中文名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" v-if="justLook" @click="getDataList()">查询</el-button>
				<el-button v-if="!justLook" @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()" v-if="!justLook">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()" v-if="!justLook">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<!-- <el-table-column prop="tableId" label="填报表id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="name" label="字段名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="cnName" label="中文名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="comment" label="注释" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="fieldType" label="数据类型" header-align="center" align="center" dict-type="fill_table_column_type"></fast-table-column>
			<fast-table-column prop="pk" label="主键" header-align="center" align="center" dict-type="yes_or_no"></fast-table-column>
			<fast-table-column prop="pkType" label="主键类型" header-align="center" align="center" dict-type="fill_table_pk_type"></fast-table-column>
			<el-table-column prop="fieldLength" label="长度" header-align="center" align="center"></el-table-column>
			<el-table-column prop="sacle" label="小数位数" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="nullable" label="可为空" header-align="center" align="center" dict-type="yes_or_no"></fast-table-column>
			<el-table-column prop="defaultValue" label="默认值" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="fillType" label="录入类型" header-align="center" align="center" dict-type="fill_table_column_fill_type"></fast-table-column>
			<el-table-column prop="fillValues" label="动态值" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="fillHide" label="录入隐藏" header-align="center" align="center" dict-type="yes_or_no"></fast-table-column>
			<fast-table-column prop="ifQuery" label="可查询" header-align="center" align="center" dict-type="yes_or_no"></fast-table-column>
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150" v-if="!justLook">
				<template #default="scope">
					<el-button type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
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

		<!-- 弹窗, 新增 / 修改 -->
		<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
	</el-dialog>
</template>

<script setup lang="ts" name="SrtDataFillTableColumnIndex">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'

const visible = ref(false)

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-integrate/dataFillTableColumn/page',
	deleteUrl: '/data-integrate/dataFillTableColumn',
	queryForm: {
		tableId: '',
		name: '',
		cnName: '',
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id, state.queryForm.tableId)
}

const justLook = ref(false)
const init = (table: any, ifLook: any) => {
	state.queryForm.tableId = table.id
	visible.value = true
	if(ifLook) {
		justLook.value = ifLook
	}
	getDataList()
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)

defineExpose({
	init
})
</script>
