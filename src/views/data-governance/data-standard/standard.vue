<template>
	<div style="padding-left: 20px;">
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
			<el-form-item>
			  <el-input v-model="state.queryForm.engName" placeholder="英文名称"></el-input>
			</el-form-item>
			<el-form-item>
			  <el-input v-model="state.queryForm.cnName" placeholder="中文名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()">查询</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="deleteBatchHandle()">删除</el-button>
			</el-form-item>
		</el-form>
		<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
			<!-- <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column> -->
			<!-- <el-table-column prop="id" label="主键id" header-align="center" align="center"></el-table-column> -->
			<!-- <el-table-column prop="categoryId" label="所属目录id" header-align="center" align="center"></el-table-column> -->
			<el-table-column prop="engName" label="英文名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="cnName" label="中文名称" header-align="center" align="center"></el-table-column>
			<fast-table-column prop="type" dict-type="standard_type" label="类型" header-align="center" align="center"></fast-table-column>
			<el-table-column prop="codeNum" label="标准数量" header-align="center" align="center"></el-table-column>
			<!-- <el-table-column prop="dataType" label="数据类型 数字，字符串，日期，小数" header-align="center" align="center"></el-table-column>
			<el-table-column prop="dataLength" label="长度" header-align="center" align="center"></el-table-column>
			<el-table-column prop="dataPrecision" label="精度" header-align="center" align="center"></el-table-column>
			<el-table-column prop="ifNull" label="非空 0-否 1-是" header-align="center" align="center"></el-table-column> -->
			<!-- <el-table-column prop="standardCodeId" label="标准码表id" header-align="center" align="center"></el-table-column> -->
			<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
			<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center"></el-table-column>
			<el-table-column label="操作" fixed="right" header-align="center" align="center" width="230">
				<template #default="scope">
					<el-button type="primary" link @click="getStandardCode(scope.row.id)">标准数据</el-button>
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
		<StandardCode ref="standardCodeRef"></StandardCode>
	</div>
</template>

<script setup lang="ts">
import { useCrud } from '@/hooks'
import { reactive, ref } from 'vue'
import StandardCode from '../data-standard-code/index.vue'
import AddOrUpdate from './standard-edit.vue'
import { IHooksOptions } from '@/hooks/interface'

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/data-standard/page',
	deleteUrl: '/data-governance/data-standard',
	queryForm: {
	}
})

const standardType = ref()
const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id, standardType.value,state.queryForm.categoryId)
}

const init = (categroy: any) => {
	standardType.value = categroy.type
	state.queryForm.categoryId = categroy.id
	getDataList()
}

const standardCodeRef = ref()
const getStandardCode = (id) => {
	standardCodeRef.value.init(id)
}

defineExpose({
	init
})

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>
