<template>
	<div class="apiGroupBox">
		<div class="leftBox">
			<el-scrollbar>
				<div style="height: 100%;" class="apiGroupTreeDiv">
					<div>
						<el-input v-model="filterCatalogueText" placeholder="search" />
						<br><br>
					</div>
					<div v-if="!props.ifAuth">
						<el-button type="primary" @click="appendCatalogueRoot">添加根目录</el-button><br><br>
					</div>
					<el-tree
						ref="catalogueTreeRef"
					 :data="catalogueTreeList"
					 @node-click="catalogueTreeNodeCk"
					 default-expand-all
					 node-key="id"
					 :filter-node-method="filterNode"
				 >
						 <template #default="{ node, data }">
							 <div class="api-group-tree-node">
								 <span>
									 <img v-show="data.type=='1'" :src="folderPng"/>
									 <img v-show="data.type=='2'" :src="apiPng"/>
									 <span style="margin-left: 8px;">{{ data.name }}</span>
								 </span>
							 </div>
						 </template>
					</el-tree>
				</div>
			</el-scrollbar>
		</div>
		<div class="rightBox">
			<ApiConfigIndex ref="apiConfigRef"></ApiConfigIndex>
		</div>
	</div>
</template>

<script setup lang="ts" name="Data-serviceApi-groupIndex">
import { reactive, ref, onMounted,watch,inject } from 'vue'
import { useCatalogueListApi,useCatalogueDelApi } from '@/api/data-service/apiGroup'
import folderPng from "../../../assets/folder.png"
import apiPng from "../../../assets/api.png"
import { ElMessageBox,ElMessage } from 'element-plus/es'
import ApiConfigIndex from '../api-config/index.vue'

const appId = inject('appId')
const props = defineProps({
	ifAuth: {
		type: Boolean,
		required: false,
		default: () => false
	}
})

onMounted(()=>{
	getCatalogueTreeList()
})
const catalogueTreeRef = ref()
const catalogueTreeList = ref([])
const filterCatalogueText = ref('')
const apiConfigRef = ref()
/**
 * 获取目录树
 */
const getCatalogueTreeList = () => {
	useCatalogueListApi().then(res=>{
		catalogueTreeList.value = res.data
	})
}

watch(filterCatalogueText, (val) => {
	catalogueTreeRef.value!.filter(val)
})

/**
 * 节点筛选
 */
const filterNode = (value: string, data: Tree) => {
	if (!value) return true
	return data.label.includes(value) || data.label.includes(value.toUpperCase()) || data.label.includes(value.toLowerCase())
}

/**
 * 作业目录树点击触发
 */
const catalogueTreeNodeCk = (e, data, n, t) => {
	//如果是api目录，添加tab
	console.log(data.data)
	if(data.data.type == '2') {	
		apiConfigRef.value.init(data.data.id, data.data.path, appId ? appId.value : null, props.ifAuth)
	}
} 

</script>

<style>
	.apiGroupBox {
		display: flex;
	}
	/* 左侧布局 */
	.apiGroupBox .leftBox {
		height: 100%;
		flex: 1;
	}
	/* 右侧布局 */
	.apiGroupBox .rightBox {
		height: 100%;
		flex: 6;
	}
	
	/* 树节点相关属性 */
	.apiGroupTreeDiv .el-tree-node__content {
			height: 35px;
		}
	.api-group-tree-node {
		 font-size: 16px;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	
</style>