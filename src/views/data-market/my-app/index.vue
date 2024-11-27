<template>
	<el-card>
		<div class="appDivClass">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
					<el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="state.queryForm.appKey" placeholder="appKey"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button @click="getDataList()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="addOrUpdateHandle()">创建应用</el-button>
				</el-form-item>
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" max-height="calc(100vh - 400px )" @selection-change="selectionChangeHandle">
				<el-table-column prop="name" label="名称" header-align="center" align="center"></el-table-column>
				<el-table-column prop="appKey" label="appKey" header-align="center" align="center"></el-table-column>
				<el-table-column prop="appSecret" label="appSecret" header-align="center" align="center" width="300"></el-table-column>
				<fast-table-column prop="expireDesc" label="token有效期" dict-type="api_expire_desc" header-align="center" align="center"></fast-table-column>
				<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
				<el-table-column prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="200">
					<template #default="scope">
						<el-button type="primary" link @click="getAuthInfo(scope.row.id)">查看授权</el-button>
						<!-- <el-button type="primary" link @click="addOrUpdateHandle(scope.row.id)">修改</el-button> -->
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
			<div class="drawerClass" style="height:100%">
				<el-drawer v-model="authDialogVisable" title="查看授权" size="100%" :destroy-on-close="true">
					<AppAuthInfo ref="appAuthInfoRef"></AppAuthInfo>
				</el-drawer>
			</div>
		</div>
	</el-card>
</template>

<script setup lang="ts" name="Data-marketMy-appIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, provide } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { IHooksOptions } from '@/hooks/interface'
import AppAuthInfo from '../../data-service/api-config/index.vue'

const state: IHooksOptions = reactive({
	dataListUrl: '/data-service/app/page',
	deleteUrl: '/data-service/app',
	queryForm: {
		name: '',
		appKey: '',
		ifMarket: 1
	}
})

const addOrUpdateRef = ref()
const addOrUpdateHandle = (id?: number) => {
	addOrUpdateRef.value.init(id)
}

const appAuthInfoRef = ref()
const authDialogVisable = ref(false)
const getAuthInfo = (appIdVal: number) => {
	authDialogVisable.value = true
	setTimeout(()=>{
		appAuthInfoRef.value.init(null,null,appIdVal,true,true)
	},200)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style>
	.appDivClass {
		height: calc(100vh - 170px );
		position: relative;
		overflow: hidden;
	}
	.appDivClass > .drawerClass > div {
		height: 100%;
		position: absolute !important;
		overflow: hidden;
	}
</style>