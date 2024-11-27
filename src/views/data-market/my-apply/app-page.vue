<template>
	<div>
		<div style="margin-bottom: 8px;">
			<el-tag type="warning" v-if="!ifInfo">tips: API 为私有 API，需要选择一个 APP 为其授权</el-tag>
			<el-tag type="warning" v-else>tips: API 为私有 API，用户需要授权的 APP 如下</el-tag>
		</div>
		<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()" v-if="!ifInfo">
			<el-form-item>
				<el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
			</el-form-item>
			<el-form-item>
				<el-input v-model="state.queryForm.appKey" placeholder="appKey"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button @click="getDataList()" type="primary">查询</el-button>
			</el-form-item>
		</el-form>
		<el-table v-if="!ifInfo" v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" highlight-current-row  @current-change="appCurrentChange">
			<el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="appKey" label="appKey" header-align="center" align="center"></el-table-column>
			<el-table-column prop="appSecret" label="appSecret" header-align="center" align="center" width="300"></el-table-column>
			<fast-table-column prop="expireDesc" label="token有效期" dict-type="api_expire_desc" header-align="center" align="center"></fast-table-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
		</el-table>
		<el-table v-else v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%">
			<el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
			<el-table-column prop="appKey" label="appKey" header-align="center" align="center"></el-table-column>
			<el-table-column prop="appSecret" label="appSecret" header-align="center" align="center" width="300">
				<template #default="scope">
					******
				</template>
			</el-table-column>
			<fast-table-column prop="expireDesc" label="token有效期" dict-type="api_expire_desc" header-align="center" align="center"></fast-table-column>
			<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
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
		
	</div>
</template>

<script setup lang="ts" name="Data-serviceAppIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, inject } from 'vue'
import { IHooksOptions } from '@/hooks/interface'

const props = defineProps({
	ifInfo: {
		type: Boolean,
		required: false,
		default: () => false
	},
})

const applyId = inject("applyId")
const state: IHooksOptions = reactive({
	dataListUrl: '/data-service/app/page',
	deleteUrl: '/data-service/app',
	queryForm: {
		name: '',
		appKey: '',
		ifMarket: 1,
		ifInfo: props.ifInfo,
		applyId: applyId?applyId.value?applyId.value:null:null
	}
})

const appApplyInfo = inject("appApplyInfo")
const appCurrentChange = (row) => {
	appApplyInfo.value = row
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style>
</style>