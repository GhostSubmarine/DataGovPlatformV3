<template>
		<el-card @click="OptionCardClose($event)">
			<div class="apiGroupBox" style="height: calc(100vh - 170px );">
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
							 @node-contextmenu="ckRightOption"
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
			
			<!-- 右键菜单 -->
			<div :style="{'z-index': 9999, position: 'fixed',left: ckRightOptionData.optionCardX + 'px', 
							top: ckRightOptionData.optionCardY + 'px', width: '100px', background: 'white',
							 'box-shadow': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)'}" 
							 v-show="ckRightOptionData.optionCardShow" id="option-button-group">
				<el-button v-show="ckRightOptionData.optionData.type == '1'" @click="appendCatalogueChild" class="option-card-button">添加子目录</el-button>
				<el-button @click="renameCatalogue" class="option-card-button">重命名</el-button>
				<el-button @click="deleteCatalogue" class="option-card-button">删除</el-button>
			</div>
			<!-- 弹窗, 新增 / 修改 -->
			<add-or-update ref="addOrUpdateRef" @refreshDataList="getCatalogueTreeList"></add-or-update>
	</el-card>
</template>

<script setup lang="ts" name="Data-serviceApi-groupIndex">
import { reactive, ref, onMounted,watch,inject } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import { useCatalogueListApi,useCatalogueDelApi } from '@/api/data-service/apiGroup'
import folderPng from "../../../assets/folder.png"
import apiPng from "../../../assets/api.png"
import { ElMessageBox,ElMessage } from 'element-plus/es'
import ApiConfigIndex from '../api-config/index.vue'

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
const addOrUpdateRef = ref()
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
 * 添加作业目录根目录
 */
const appendCatalogueRoot = () => {
	addOrUpdateRef.value.init(null,0,'')
}

/**
 * 添加目录树子菜单
 */
const appendCatalogueChild = () => {
	let nodeData = ckRightOptionData.optionData
	addOrUpdateRef.value.init(null, nodeData.id, nodeData.path)
	OptionCardClose()
}
/**
 * 重命名
 */
const renameCatalogue = () => {
	let nodeData = ckRightOptionData.optionData
	addOrUpdateRef.value.init(nodeData.id, nodeData.parentId, nodeData.parentPath, nodeData.type)
	OptionCardClose()
}
/**
 删除目录
 */
const deleteCatalogue = () => {
	OptionCardClose()
	ElMessageBox.confirm('确认删除吗, 提示', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		let nodeData = ckRightOptionData.optionData
		useCatalogueDelApi(nodeData.id).then(res=> {
			ElMessage.success("删除成功！")
			getCatalogueTreeList()
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
	if (props.ifAuth) {
		return
	}
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
const catalogueTreeNodeCk = (e, data, n, t) => {
	//关闭右键菜单
	OptionCardClose()
	//如果是api目录，添加tab
	console.log(data.data)
	if(data.data.type == '2') {	
		apiConfigRef.value.init(data.data.id, data.data.path, null, props.ifAuth)
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
	
	.option-card-button {
		width: 100%;
		margin-left: 0 !important;
		padding: 20px 20px;
		font-size: 14px;
		border-radius: 0;
	}
</style>