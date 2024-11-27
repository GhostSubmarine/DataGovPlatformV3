<template>
	<el-card>
		<div class="apiConfigDivClass">
			<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
				<el-form-item>
					<el-input v-model="state.queryForm.name" placeholder="名称"></el-input>
				</el-form-item>
				<el-form-item>
					<fast-select v-model="state.queryForm.contentType" dict-type="content_type" placeholder="内容类型" clearable filterable></fast-select>
				</el-form-item>
				<!-- <el-form-item>
					<fast-select v-model="state.queryForm.status" dict-type="release_status" placeholder="状态" clearable filterable></fast-select>
				</el-form-item> -->
				<el-form-item>
					<el-select v-model="state.queryForm.sqlDbType" clearable filterable placeholder="sql库类型">
							<el-option :key="1" label="数据库" :value="1"></el-option>
							<el-option :key="2" label="中台库" :value="2"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-select v-model="state.queryForm.databaseId"
										 clearable
										 filterable 
					           placeholder="数据库">
					  <el-option v-for="(item,index) in state.databaseList"
					             :key="item.id"
					             :label="`[${item.id}]${item.name}`"
					             :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<fast-select v-model="state.queryForm.previlege" dict-type="yes_or_no" placeholder="是否私有" clearable filterable></fast-select>
				</el-form-item>
				<el-form-item>
					<fast-select v-model="state.queryForm.openTrans" dict-type="yes_or_no" placeholder="开启事务" clearable filterable></fast-select>
				</el-form-item>
				<el-form-item>
					<el-button @click="getDataList()">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="warning" @click="exportDocs()">导出文档</el-button>
				</el-form-item>
				<!-- <el-form-item>
					<el-button v-auth="'srt:api-config:delete'" type="danger" @click="deleteBatchHandle()">删除</el-button>
				</el-form-item> -->
			</el-form>
			<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%" @selection-change="selectionChangeHandle">
				<el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>	
				<el-table-column show-overflow-tooltip label="分组" header-align="center" align="center" width="150" prop="group"></el-table-column>
				<el-table-column prop="path" show-overflow-tooltip label="api地址" header-align="center" align="center"></el-table-column>
				<el-table-column show-overflow-tooltip prop="name" label="名称" header-align="center" align="center"></el-table-column>
				<!-- <el-table-column prop="note" label="描述" header-align="center" align="center"></el-table-column>
				<el-table-column prop="sqlText" label="sql语句" header-align="center" align="center"></el-table-column> 
				<el-table-column prop="params" label=" application/x-www-form-urlencoded 类API对应的参数" header-align="center" align="center"></el-table-column>
				<el-table-column prop="jsonParam" label="application/json 类API对应的json参数示例" header-align="center" align="center"></el-table-column> -->
				<fast-table-column prop="contentType" label="内容类型" dict-type="content_type" width="150" header-align="center" align="center"></fast-table-column>
				<el-table-column prop="status" label="状态" header-align="center" align="center">
					<template #default="scope">
						<el-tag v-show="scope.row.status == 0" type="info">未发布</el-tag>
						<el-tag v-show="scope.row.status == 1" type="success">已发布</el-tag>
					</template>
				</el-table-column>
				<!-- <el-table-column prop="sqlDbType" label="1-数据库 2-中台库" header-align="center" align="center"></el-table-column>
				<el-table-column prop="databaseId" label="数据库id" header-align="center" align="center"></el-table-column> -->
				<fast-table-column prop="previlege" label="私有" dict-type="yes_or_no" header-align="center" align="center"></fast-table-column>
				<fast-table-column prop="openTrans" label="开启事务" dict-type="yes_or_no" header-align="center" align="center"></fast-table-column>
				<fast-creator-column prop="releaseUserId" label="发布者" header-align="center" align="center"></fast-creator-column>
				<el-table-column show-overflow-tooltip prop="releaseTime" label="发布时间" header-align="center" align="center"></el-table-column>
				<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
				<el-table-column show-overflow-tooltip prop="createTime" label="创建时间" header-align="center" align="center"></el-table-column>
				<el-table-column show-overflow-tooltip prop="updateTime" label="更新时间" header-align="center" align="center"></el-table-column>
				<el-table-column label="操作" fixed="right" header-align="center" align="center" width="260">
					<template #default="scope">
						<el-button type="primary" link @click="lookInfo(scope.row.id, scope.row.authId)">查看</el-button>
						<el-button type="primary" v-show="scope.row.status==1" link @click="test(scope.row)">测试</el-button>
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
			<!-- <div class="drawerClass" style="height:100%">
				<add-or-update ref="addOrUpdateRef" @refreshDataList="getDataList"></add-or-update>
			</div> -->
			
			<!-- 弹窗, 查看 -->
			<div class="drawerClass" style="height:100%">
				<AppInfo ref="appInfoRef" ></AppInfo>
			</div>
			
			<!-- 测试 -->
			<div class="drawerClass" style="height:100%">
				<ApiTest ref="apiTestRef"></ApiTest>
			</div>
		</div>
	</el-card>
</template>

<script setup lang="ts" name="DataAssetsApiResource">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted } from 'vue'
import AppInfo from '../../data-service/api-config/app-info.vue'
import ApiTest from '../../data-service/api-config/api-test.vue'
import { IHooksOptions } from '@/hooks/interface'
import { listDatabase } from '@/api/data-integrate/database'
import { executeSqlApi, ipPortApi } from '@/api/data-service/apiConfig'
import { ElMessage,ElMessageBox } from 'element-plus/es'

onMounted(()=>{
	getDatabaseList()
})

const databaseList = ref([])

const getDatabaseList = () => {
	listDatabase().then(res => {
		state.databaseList = res.data
	})
}

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	databaseList: [],
	dataListUrl: '/data-service/api-config/page-resource',
	deleteUrl: '/data-service/api-config',
	path: '',
	queryForm: {
		groupId: '',
		name: '',
		path: '',
		contentType: '',
		status: '',
		sqlDbType: '',
		databaseId: '',
		previlege: '',
		openTrans: ''
	}
})


onMounted(()=>{
	const apiResourceId = sessionStorage.getItem("apiResourceId")
	const queryApply = sessionStorage.getItem("queryApply")
	state.queryForm.resourceId = apiResourceId
	state.queryForm.queryApply = queryApply?queryApply:0
	getDataList()
})


const appInfoRef = ref()
const lookInfo = (id: number, authId: any) => {
	appInfoRef.value.init(id, authId)
}

const apiTestRef = ref()
const test = (apiConfig: any) => {
	apiTestRef.value.init(apiConfig)
}
 
const exportDocs = async () => {
	let ids = state.dataListSelections ? state.dataListSelections : []
	
	if (ids.length === 0) {
		ElMessage.warning('请勾选需要导出的api')
		return
	}
	const { data } = await ipPortApi()
	await downloadHandle('http://' + data + '/data-service/api-config/export-docs','API DOCS.md','POST',ids)
}  
 
const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle, downloadHandle } = useCrud(state)

</script>

<style>
	.apiConfigDivClass {
		height: calc(100vh - 170px );
		position: relative;
		overflow: hidden;
	}
	.apiConfigDivClass > .drawerClass > div {
		height: 100%;
		position: absolute !important;
		overflow: hidden;
	}
</style>