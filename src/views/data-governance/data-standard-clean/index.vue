<template>
	<el-card>
		<div class="metadataBox" style="height: calc(100vh - 170px );">
			<div class="leftBox">
				<el-scrollbar style="max-width: 300px;">
					<div style="height: 100%;" class="metadataTreeDiv">
						<div>
							<el-input v-model="filterNodeText" placeholder="search" /><br><br>
							<el-button type="primary" @click="filterNode">查询</el-button>
							<br><br>
						</div>
						<!-- <div>
							<el-button type="primary" @click="appendRoot">添加根目录</el-button><br><br>
						</div> -->
						<el-tree
						 v-if="openTree"
						 ref="treeRef"
						 :props="props"
						 :load="loadNode" 
						 :lazy="lazyTree"
						 :data="treeList"
						 :expand-on-click-node="false"
						 @node-click="treeNodeCk"
						 :default-expand-all="expandTree"
						 node-key="id"
					 >
							 <template #default="{ node, data }">
								 <div class="metadata-tree-node">
									 <span>
										 <!-- 如果是目录-->
										 <img v-if="data.icon=='/src/assets/folder.png'" src="/src/assets/folder.png"/>
										 <img v-if="data.icon=='/src/assets/database.png'" src="/src/assets/database.png"/>
										 <img v-if="data.icon=='/src/assets/table.png'" src="/src/assets/table.png"/>
										 <img v-if="data.icon=='/src/assets/column.png'" src="/src/assets/column.png"/>
										 <img v-if="data.icon=='/src/assets/model.png'" src="/src/assets/model.png"/>
										 <span style="margin-left: 8px;">{{ data.name }}&emsp;{{ data.code }}</span>
									 </span>
								 </div>
							 </template>
						</el-tree>
					</div>
				</el-scrollbar>
			</div>
			<div class="rightBox">
				<MeatadataInfo ref="meatadataInfoRef" v-show="infoView"></MeatadataInfo>
			</div>
		</div>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceData-standard-cleanIndex">
import { reactive, ref, onMounted,watch,inject } from 'vue'
import MeatadataInfo from './info.vue'
import { listChildApi,delTreeNodeApi,listKeywordApi } from '@/api/data-governance/metadata'
import folderPng from "../../../assets/folder.png"
import { ElMessageBox,ElMessage } from 'element-plus/es'
import type Node from 'element-plus/es/components/tree/src/model/node'

onMounted(()=>{
	getTreeList()
})
const addOrUpdateRef = ref()
const treeRef = ref()
const treeList = ref([])
const filterNodeText = ref('')
const meatadataInfoRef = ref()
const expandTree = ref(false)
const lazyTree = ref(true)
const openTree = ref(true)
/**
 * 获取目录树
 */
const getTreeList = () => {
	infoView.value = false
	filterNode()
}

interface Tree {
  name: string
  leaf?: boolean
}

const props = {
  label: 'name',
  children: 'children',
  isLeaf: 'leaf'
}

const loadNode = async (node: Node, resolve: (data: Tree[]) => void) => {
  if (node.level == 0) {
    return resolve(treeList.value)
  }
  if (node.level >= 1) {
	if(node.data.children) {
		resolve(node.data.children)
	} else {
		const {data} = await listChildApi(node.data.id)
		resolve(data)
	}
  }
}

/**
 * 节点筛选
 */
const filterNode = () => {
	if(filterNodeText.value) {
		openTree.value = false
		//打开节点
		expandTree.value = true
	} else {
		openTree.value = false
		//关闭节点
		expandTree.value = false
	}
	listKeywordApi(filterNodeText.value).then(res=> {
		treeList.value = res.data
		openTree.value = true
	})
	
}

/**
 * 作业目录树点击触发
 */
const infoView = ref(false)
const treeNodeCk = (e, data, n, t) => {
	//如果是元数据
	//console.log(data.data)
	if(data.data.metamodelId) {
		infoView.value = true
		meatadataInfoRef.value.init(data.data)
	} else {
		infoView.value = false
	}
	
} 
</script>

<style>
	.metadataBox {
		display: flex;
	}
	/* 左侧布局 */
	.metadataBox .leftBox {
		height: 100%;
		flex: 1;
	}
	/* 右侧布局 */
	.metadataBox .rightBox {
		height: 100%;
		flex: 6;
	}

	/* 树节点相关属性 */
	.metadataTreeDiv .el-tree-node__content {
			height: 35px;
		}
	.metadata-tree-node {
		 font-size: 16px;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.option-card-button {
		width: 100%;
		margin-left: 0 !important;
		padding: 20px 20px;
		font-size: 14px;
		border-radius: 0;
	}
</style>