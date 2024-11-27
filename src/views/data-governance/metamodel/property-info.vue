<template>
	<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
		<el-form-item>
		  <el-input v-model="state.queryForm.name" placeholder="属性名称"></el-input>
		</el-form-item>
		<el-form-item>
		  <el-input v-model="state.queryForm.code" placeholder="属性代码"></el-input>
		</el-form-item>
		<el-form-item>
			<el-button @click="getDataList()">查询</el-button>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
		</el-form-item>
	</el-form>
	<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
		<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
		<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column>
		<el-table-column prop="metamodelId" label="元模型id" header-align="center" align="center"></el-table-column> -->
		<!-- <el-table-column prop="metamodel" label="所属元模型" header-align="center" align="center"></el-table-column> -->
		<el-table-column prop="orderNo" label="序号" header-align="center" align="center"></el-table-column>
		<el-table-column prop="name" label="属性名称" header-align="center" align="center"></el-table-column>
		<el-table-column prop="code" label="属性代码" header-align="center" align="center"></el-table-column>
		<fast-table-column prop="dataType" label="数据类型" header-align="center" align="center" dict-type="model_property_data_type"></fast-table-column>
		<fast-table-column prop="inputType" label="输入控件" header-align="center" align="center" dict-type="model_property_input_type"></fast-table-column>
		<el-table-column prop="dataLength" label="数据长度" header-align="center" align="center"></el-table-column>
		<fast-table-column prop="nullable" label="允许为空" header-align="center" align="center" dict-type="yes_or_no"></fast-table-column>
		<fast-table-column prop="builtin" label="是否内置" header-align="center" align="center" dict-type="yes_or_no"></fast-table-column>
		<el-table-column prop="comment" label="说明" header-align="center" align="center"></el-table-column>
		<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
		<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center"></el-table-column>
		<el-table-column label="操作" fixed="right" header-align="center" align="center" width="150">
			<template #default="scope">
				<el-button type="primary" v-if="scope.row.builtin == 0" link @click="addOrUpdateHandle(scope.row.id)">编辑</el-button>
				<el-button type="primary" v-if="scope.row.builtin == 0" link @click="deleteBatchHandle(scope.row.id)">删除</el-button>
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
</template>

<script setup lang="ts">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import AddOrUpdate from './property-add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/metamodel-property/page',
	deleteUrl: '/data-governance/metamodel-property',
	queryForm: {
		name: '',
		code: ''
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id, state.queryForm.metamodelId)
}

const init = (metamodelId: number) => {
	state.queryForm.metamodelId = metamodelId
	getDataList()
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)

defineExpose({
	init
})
</script>
