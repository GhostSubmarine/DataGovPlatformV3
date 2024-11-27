<template>
	<el-card @click="OptionCardClose($event)">
		<div class="metadataBox" style="height: calc(100vh - 170px );">
			<div class="leftBox">
				<el-scrollbar style="max-width: 300px;">
					<div style="height: 100%;" class="metadataTreeDiv">
						<div>
							<el-input v-model="filterNodeText" placeholder="search" /><br><br>
							<el-button type="primary" @click="filterNode">查询</el-button>
							<br><br>
						</div>
						<div>
							<el-button type="primary" @click="appendRoot">添加根目录</el-button><br><br>
						</div>
						<el-tree
						 v-if="openTree"
						 ref="treeRef"
						 :props="props"
						 :load="loadNode" 
						 :lazy="lazyTree"
						 :data="treeList"
						 @node-contextmenu="ckRightOption"
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
		
		<!-- 右键菜单 -->
		<div :style="{'z-index': 9999, position: 'fixed',left: ckRightOptionData.optionCardX + 'px', 
						top: ckRightOptionData.optionCardY + 'px', width: '100px', background: 'white',
						 'box-shadow': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)'}" 
						 v-show="ckRightOptionData.optionCardShow" id="option-button-group">
			<el-button @click="appendChild" v-show="!ckRightOptionData.optionData.leaf" class="option-card-button">添加子项</el-button>
			<el-button @click="renameItem" class="option-card-button">修改</el-button>
			<el-button @click="deleteItem" class="option-card-button">删除</el-button>
		</div>
		<!-- 弹窗, 新增 / 修改 -->
		<add-or-update ref="addOrUpdateRef" @refreshDataList="getTreeList"></add-or-update>
	</el-card>
</template>

<script setup lang="ts" name="Data-governanceMetadata-manageIndex">
import { reactive, ref, onMounted,watch,inject } from 'vue'
import AddOrUpdate from './add-or-update.vue'
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
 * 添加作业目录根目录
 */
const appendRoot = () => {
	addOrUpdateRef.value.init(null,0,'')
}

/**
 * 添加目录树子菜单
 */
const appendChild = () => {
	let nodeData = ckRightOptionData.optionData
	addOrUpdateRef.value.init(null, nodeData.id, nodeData.path)
	OptionCardClose()
}
/**
 * 重命名
 */
const renameItem = () => {
	let nodeData = ckRightOptionData.optionData
	addOrUpdateRef.value.init(nodeData.id, nodeData.parentId, nodeData.parentPath)
	OptionCardClose()
}
/**
 删除目录
 */
const deleteItem = () => {
	let nodeData = ckRightOptionData.optionData
	OptionCardClose()
	ElMessageBox.confirm('确认删除吗, 提示', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		delTreeNodeApi(nodeData.id).then(res=> {
			ElMessage.success("删除成功！")
			getTreeList()
		})
	})
}


/**
 * 右键相关参数
 */
const ckRightOptionData = reactive({
	optionCardShow: false,
	optionCardX: 0,
	optionCardY: 0,
	optionData: {},
	node: '',
	tree: ''
})
/**
 * 右键节点
 */
const ckRightOption = (e, data, n, t) => {
	ckRightOptionData.optionCardShow = false 
	ckRightOptionData.optionCardX = e.x   // 让右键菜单出现在鼠标右键的位置
	ckRightOptionData.optionCardY = e.y
	ckRightOptionData.optionData = data
	ckRightOptionData.node = n // 将当前节点保存
	ckRightOptionData.tree = t
	ckRightOptionData.optionCardShow = true  // 展示右键菜单
}

/**
 * 点击右键菜单以外的地方
 */
const OptionCardClose = (event) => {
	var currentCli = document.getElementById("option-button-group");
	if (currentCli) {
		ckRightOptionData.optionCardShow = false;
		/* if (!currentCli.contains(event.target)) { //点击到了id为option-button-group以外的区域，就隐藏菜单
			ckRightOptionData.optionCardShow = false;
		} */
	}
}

/**
 * 作业目录树点击触发
 */
const infoView = ref(false)
const treeNodeCk = (e, data, n, t) => {
	//关闭右键菜单
	OptionCardClose()
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