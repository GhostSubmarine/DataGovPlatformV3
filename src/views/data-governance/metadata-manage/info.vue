<template>
	<div style="padding-left: 20px;">
		<el-tabs>
			<el-tab-pane>
			  <template #label>
				<span>
				  <el-icon><Postcard /></el-icon>&nbsp;
				  <span>基本信息</span>
				</span>
			  </template>
			  <div>
				   <el-descriptions
				      title="概述"
				      :column="1"
					  border
				      size="large"
				      direction="horizontal"
				    >
				      <el-descriptions-item label="名称">{{bisData.name}}</el-descriptions-item>
				      <el-descriptions-item label="编码">{{bisData.code}}</el-descriptions-item>
					  <el-descriptions-item label="元数据类型">{{bisData.metamodel}}</el-descriptions-item>
				      <el-descriptions-item label="路径">{{bisData.path}}</el-descriptions-item>
				      <el-descriptions-item label="创建时间">{{ bisData.createTime }}</el-descriptions-item>
					  <el-descriptions-item label="描述">{{ bisData.description }}</el-descriptions-item>
				    </el-descriptions>
			  </div>
			  <br>
			  <div v-show="hasProperty">
				   <el-descriptions
					  title="属性信息"
					  :column="2"
					  border
					  size="large"
					  direction="horizontal"
					>
					  <el-descriptions-item v-for="(item,index) in metaProperties" :label="item.name">{{item.value}}</el-descriptions-item>
					</el-descriptions>
			  </div>
			</el-tab-pane>
			<!-- <el-tab-pane v-if="canStandard">
			  <template #label>
				<span>
				  <el-icon><Menu /></el-icon>&nbsp;
				  <span>数据标准</span>
				</span>
			  </template>
			  <div>
				<el-form>
					<el-form-item label="关联标准" prop="standardCategoryId">
						<el-tree-select v-model="standardCategoryId" :data="standardCategoryList" clearable @change="standardCategoryChange">
							<template #default="{ node, data }">
								 <div>
									 <span>
										 <img v-if="data.type==0" src="/src/assets/folder.png"/>
										 <img v-if="data.type==1" src="/src/assets/column.png"/>
										 <img v-if="data.type==2" src="/src/assets/table.png"/>
										 <span style="margin-left: 8px;">{{ data.name }}</span>
									 </span>
								 </div>
							</template>
						</el-tree-select>
					</el-form-item>
				</el-form>
				<div v-show="!!standardCategoryId">
					<el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">
						<el-form-item>
						  <el-input v-model="state.queryForm.engName" placeholder="英文名称"></el-input>
						</el-form-item>
						<el-form-item>
						  <el-input v-model="state.queryForm.cnName" placeholder="中文名称"></el-input>
						</el-form-item>
						<el-form-item>
							<el-button @click="getDataList()" type="primary">查询</el-button>
						</el-form-item>
					</el-form>
					<el-table v-loading="state.dataListLoading" :data="state.dataList" border style="width: 100%">
						<el-table-column prop="engName" label="英文名称" header-align="center" align="center"></el-table-column>
						<el-table-column prop="cnName" label="中文名称" header-align="center" align="center"></el-table-column>
						<fast-table-column prop="dataType" dict-type="standard_data_type" label="数据类型" header-align="center" align="center"></fast-table-column>
						<el-table-column prop="dataLength" label="长度" header-align="center" align="center"></el-table-column>
						<el-table-column prop="dataPrecision" label="精度" header-align="center" align="center"></el-table-column>
						<fast-table-column prop="nullable" dict-type="yes_or_no" label="可为空" header-align="center" align="center"></fast-table-column>
						<fast-table-column prop="type" dict-type="standard_type" label="类型" header-align="center" align="center"></fast-table-column>
						<fast-creator-column prop="creator" label="创建者" header-align="center" align="center"></fast-creator-column>
						<el-table-column prop="createTime" show-overflow-tooltip label="创建时间" header-align="center" align="center"></el-table-column>
						<el-table-column label="操作" fixed="right" header-align="center" align="center" width="230">
							<template #default="scope">
								<el-button type="primary" link @click="getInfo(scope.row.id)">查看</el-button>
								<el-button v-show="scope.row.ifStandardRel" type="primary" link @click="standardCheck(scope.row.id)">标准检测</el-button>
								<el-button v-show="!scope.row.ifStandardRel" type="primary" link @click="rel(scope.row.id)">关联</el-button>
								<el-button v-show="scope.row.ifStandardRel" type="primary" link @click="delRel(scope.row.id)">取消关联</el-button>
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
				</div>
			  </div>
			</el-tab-pane> -->
			<!-- <el-tab-pane>
			  <template #label>
				<span>
				  <el-icon><Share /></el-icon>&nbsp;
				  <span>数据血缘</span>
				</span>
			  </template>
			  <div>
				开发中。。。
			  </div>
			</el-tab-pane> -->
		</el-tabs>
		<StandardInfo ref="standardInfoRef"></StandardInfo>
		<StandardCheck ref="standardCheckRef"></StandardCheck>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import store from '@/store'
import { useMetamodelApi } from '@/api/data-governance/metamodel'
import { useMetadataApi } from '@/api/data-governance/metadata'	
import { listTreeApi,dataStandardCheckApi } from '@/api/data-governance/dataStandard'
import { getByMetadataApi,useStandardRelSubmitApi,delMetadataRelApi } from '@/api/data-governance/standardRel'
import { useCrud } from '@/hooks'
import { IHooksOptions } from '@/hooks/interface'
import StandardInfo from '../data-standard/standard-info.vue'
import StandardCheck from '../data-standard/standard-check.vue'
import { ElMessage,ElMessageBox } from 'element-plus/es'


onMounted(()=>{
	//加载数据标准树
	listTreeApi().then(res => {
		standardCategoryList.value = res.data
	})
})

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	dataListUrl: '/data-governance/data-standard/page',
	deleteUrl: '/data-governance/data-standard',
	queryForm: {
		ifMeta: true
	}
})


/**
 * 基本信息
 */
const bisData = reactive({
	name: '',
	code: '',
	path: '',
	metamodel: '',
	builtin: '',
	description: '',
})

const metaProperties = ref([])
const hasProperty = ref(false)
const canStandard = ref(false)
const standardCategoryId = ref()
const standardCategoryList = ref([])
const metadataId = ref()
const init = (data: any) => {
	//赋值给基本信息
	Object.assign(bisData, data)
	canStandard.value = data.metamodelId == 4
	metadataId.value = data.id
	//根据元模型id获取元模型
	useMetamodelApi(data.metamodelId).then(res=> {
		bisData.metamodel = res.data.path
	})
	//获取属性列表
	useMetadataApi(data.id).then(res=>{
		metaProperties.value = res.data.properties
		if(metaProperties.value.length > 0) {
			hasProperty.value = true
		} else {
			hasProperty.value = false
		}
	})
	//获取关联的数据标准
	getByMetadataApi(data.id).then(res=> {
		if(res.data) {
			standardCategoryId.value = res.data.standardCategoryId
			state.queryForm.categoryId = standardCategoryId.value
			state.queryForm.metadataId = metadataId.value
			getDataList()
		} else {
			standardCategoryId.value = null
		}
	})
	
}

const standardCategoryChange = (categoryId) => {
	if(categoryId) {
		//获取数据标准列表
		standardCategoryId.value = categoryId
		state.queryForm.categoryId = categoryId
		state.queryForm.metadataId = metadataId.value
		getDataList()
	}
}

const standardInfoRef = ref()
const getInfo =(id) => {
	standardInfoRef.value.init(id)
}

const rel = (id) => {
	ElMessageBox.confirm('一个字段只能关联一个数据标准字段，若该字段已关联了其他标准字段，将自动解除关联，确认关联吗？', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		useStandardRelSubmitApi({
			metadataId: metadataId.value,
			standardId: id
		}).then(res=> {
			ElMessage.success("关联成功")
			getDataList()
		})
	}).catch(() => {})
}
const delRel = (id) => {
	ElMessageBox.confirm('确认取消关联吗？', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		delMetadataRelApi(metadataId.value, id).then(res=> {
			ElMessage.success("取消关联成功")
			getDataList()
		})
	}).catch(() => {})
}

const standardCheckRef = ref()
const standardCheck = (id) => {
	dataStandardCheckApi(metadataId.value,id).then(res=>{
		standardCheckRef.value.init(res.data)
	})
}

defineExpose({
	init
})
	
const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)
</script>

<style>
</style>