<template>
  <el-card body-style="height: calc(100vh - 170px )" @click="OptionCardClose($event)">
	<div>
	  <SideLayout class="fp-content table-content" left-title="资产目录" right-title="资产列表">
		<div slot="left-title" class="rm-left-title">
		  <span>资产目录</span>
		  <!-- 添加按钮-->
		</div>
		<template #left>
			<div>
			  <el-scrollbar style="height: calc(100vh - 220px )">
			  	<div style="height: 100%;" class="dataAssetsTreeDiv">
			  		<div>
			  			<el-input v-model="filterNodeText" placeholder="search" />
			  			<br><br>
			  		</div>
			  		<div>
			  			<el-button type="primary" @click="appendRoot">添加根目录</el-button><br><br>
			  		</div>
			  		<el-tree
			  		 ref="treeRef"
			  		 :data="treeList"
			  		 @node-contextmenu="ckRightOption"
			  		 @node-click="treeNodeCk"
			  		 default-expand-all
			  		 node-key="id"
			  		 :filter-node-method="filterNode"
			  	 >
			  			 <template #default="{ node, data }">
			  				 <div class="dataAssets-tree-node">
			  					 <span>
			  						 <img v-if="data.type==0" src="/src/assets/folder.png"/>
			  						 <img v-if="data.type==1" src="/src/assets/assets.png"/>
			  						 <span style="margin-left: 8px;">{{ data.name }}</span>
			  					 </span>
			  				 </div>
			  			 </template>
			  		</el-tree>
			  	</div>
			  </el-scrollbar>
			</div>
		</template>
		<template #right>
			<div v-if="infoView">
			  <el-form :inline="true" :model="state.queryForm" @keyup.enter="getDataList()">			  	<el-form-item>			  	  <el-input v-model="state.queryForm.name" placeholder="名称"></el-input>			  	</el-form-item>			  	<el-form-item>			  	  <el-input v-model="state.queryForm.code" placeholder="编码"></el-input>			  	</el-form-item>
				<el-form-item>
				  <fast-select v-model="state.queryForm.status" dict-type="ground_status" placeholder="上架状态" clearable filterable></fast-select>
				</el-form-item>
				<el-form-item>
				  <fast-select v-model="state.queryForm.mountStatus" dict-type="mount_status" placeholder="挂载状态" clearable filterable></fast-select>
				</el-form-item>
				<el-form-item>
				  <el-input v-model="state.queryForm.dutyUser" placeholder="负责人"></el-input>
				</el-form-item>			  	<el-form-item>			  		<el-button @click="getDataList()">查询</el-button>			  	</el-form-item>			  	<el-form-item>			  		<el-button type="primary" @click="addOrUpdateResouce()">新增</el-button>			  	</el-form-item>			  </el-form>
			  <el-empty description="暂无数据" v-if="!state.dataList.length"/>
			  <div v-loading="state.dataListLoading" class="row_datas" v-if="state.dataList.length">
				<el-scrollbar style="height: calc(100vh - 265px )">
					<div v-for="(item, i) in state.dataList" :key="i" class="rd-item">
						  <div class="rd-lables">
							<span class="rd_code">{{ item.code }}</span>
							<span class="rd_name">{{ item.name }}</span>
						  </div>
						  <div class="rd-datas">
							<div>
							  <label>所属目录：</label>
							  <p>{{ curentNode.parentPath }}</p>
							</div>
							<div>
							  <label>版本号：</label>
							  <p>{{ item.versionNo }}</p>
							</div>
							<div>
							  <label>上架时间：</label>
							  <p>{{ item.releaseTime }}</p>
							</div>
							<div>
							  <label>创建时间：</label>
							  <p>{{ item.createTime }}</p>
							</div>
							<div>
							  <label>更新时间：</label>
							  <p>{{ item.updateTime }}</p>
							</div>
							<div>
							  <label>资源摘要：</label>
							  <p>{{ item.summary }}</p>
							</div>
						  </div>
						  <div class="rd-status">
							<span>{{ item.status == 1? '已上架':'未上架' }}</span>
							<span>{{ item.mountStatus == 1? '已挂载':'未挂载' }}</span>
						  </div>
						  <div class="rd-actions">
							<el-button type="primary" size="small" @click="toDetail(item)">详情</el-button>
							<el-button type="warning" size="small" @click="addOrUpdateResouce(item.id)">修改</el-button>
							<el-button type="primary" size="small" @click="toMount(item)">资源挂载</el-button>
							<el-button v-if="item.status == 1" type="primary" size="small" @click="offline(item.id)">下架</el-button>
							<el-button v-if="item.status == 0" type="primary" size="small" @click="online(item.id)">上架</el-button>
							<el-button type="danger" size="small" @click="toDelete(item.id)">删除</el-button>
						  </div>
					</div>
					<el-pagination
						v-if="state.dataList.length"
						:current-page="state.page"
						:page-sizes="[1,5,10,20]"
						:page-size="state.limit"
						:total="state.total"
						layout="total, sizes, prev, pager, next, jumper"
						@size-change="sizeChangeHandle"
						@current-change="currentChangeHandle"
					>
					</el-pagination>
				</el-scrollbar>
			</div>
		  </div>
	    </template>
	  </SideLayout>
	</div>
    <!-- 右键菜单 -->
    <div :style="{'z-index': 9999, position: 'fixed',left: ckRightOptionData.optionCardX + 'px', 
    				top: ckRightOptionData.optionCardY + 'px', width: '100px', background: 'white',
    				 'box-shadow': '0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)'}" 
    				 v-show="ckRightOptionData.optionCardShow" id="option-button-group">
    	<el-button v-show="ckRightOptionData.optionData.type == 0" @click="appendChild" class="option-card-button">添加子目录</el-button>
    	<el-button @click="renameItem" class="option-card-button">修改</el-button>
    	<el-button @click="deleteItem" class="option-card-button">删除</el-button>
    </div>
	<!-- 弹窗, 新增 / 修改 -->
	<add-or-update ref="addOrUpdateRef" @refreshDataList="getTreeList"></add-or-update>
	<ResourceInfo ref="resourceInfoRef" @refreshDataList="getDataList"></ResourceInfo>
	<ResourceDetail ref="resourceDetailRef"></ResourceDetail>
	<ResourceMount ref="resourceMountRef" @refreshDataList="getDataList"></ResourceMount>
  </el-card>
</template>

<script setup lang="ts" name="Data-assetsCatalogIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted, watch } from 'vue'
import AddOrUpdate from './add-or-update.vue'
import ResourceInfo from './resource-info.vue'
import ResourceDetail from './resource-detail.vue'
import ResourceMount from './resource-mount.vue'
import SideLayout from '@/components/side-layout/index.vue'
import { listTreeApi,delTreeNodeApi } from '@/api/data-assets/catalog'
import { onlineApi,offlineApi,deleteApi } from '@/api/data-assets/resource'
import { IHooksOptions } from '@/hooks/interface'
import { ElMessage, ElMessageBox } from 'element-plus/es'

onMounted(()=>{
	getTreeList()
})

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	limit: 5,
	dataListUrl: '/data-assets/resource/page',
	deleteUrl: '/data-assets/resource',
	queryForm: {
		catalogId: '',
		name: '',
		code: '',
		status: '',
		mountStatus: '',
		dutyUser: '',
	}
})


const addOrUpdateRef = ref()
const treeRef = ref()
const treeList = ref([])
const filterNodeText = ref('')

/**
 * 获取目录树
 */
const getTreeList = () => {
	listTreeApi().then(res=>{
		treeList.value = res.data
	})
}

watch(filterNodeText, (val) => {
	treeRef.value!.filter(val)
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
	ElMessageBox.confirm('确认删除吗?','提示', {
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

const online = (id: number) => {
	ElMessageBox.confirm('确认上架吗？','提示', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		onlineApi(id).then(res=> {
			ElMessage.success("上架成功！")
			getDataList()
		})
	}) .catch(() => {})
}

const offline = (id: number) => {
	ElMessageBox.confirm('确认下架吗？','提示', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		offlineApi(id).then(res=> {
			ElMessage.success("下架成功！")
			getDataList()
		})
	}) .catch(() => {})
}

const toDelete = (id: number) => {
	ElMessageBox.confirm('确认删除吗，删除后挂载的资源将自动解绑','提示', {
		confirmButtonText: '是',
		cancelButtonText: '否',
		type: 'warning'
	}).then(() => {
		deleteApi(id).then(res=> {
			ElMessage.success("删除成功！")
			getDataList()
		})
	}) .catch(() => {})
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

const infoView = ref(false)
const curentNode = ref()
const treeNodeCk = (e, data, n, t) => {
	//关闭右键菜单
	OptionCardClose()
	//如果是元模型
	console.log(data.data)
	if(data.data.type != 0) {
		infoView.value = true
		curentNode.value = data.data
		state.queryForm.catalogId = data.data.id
		getDataList()
		/* standardView.value = true
		standardRef.value.init(data.data) */
	} else {
		infoView.value = false
	}
} 

const resourceInfoRef = ref()
const addOrUpdateResouce = (id?: number) => {
	resourceInfoRef.value.init(id, state.queryForm.catalogId,curentNode.value.parentPath)
}
//详情
const resourceDetailRef = ref()
const toDetail = (item: any) => {
	item.parentPath = curentNode.value.parentPath
	resourceDetailRef.value.init(item)
}
const resourceMountRef = ref()
//挂载资源
const toMount = (item: any) => {
	resourceMountRef.value.init(item)
}

const { getDataList, selectionChangeHandle, sizeChangeHandle, currentChangeHandle, deleteBatchHandle } = useCrud(state)

</script>


<style lang="scss">
	/* 树节点相关属性 */
	.dataAssetsTreeDiv .el-tree-node__content {
			height: 35px;
		}
	.dataAssets-tree-node {
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
	
	.row_datas {
	  .rd-item {
	    background: linear-gradient(360deg, rgba(243, 248, 253, 0) 0%, #f3f8fd 100%);
	    border-radius: 8px;
	    margin-bottom: 12px;
	    padding: 12px 16px;
	    position: relative;
	    .rd-lables {
	      .rd_code {
	        font-size: 14px;
	        font-family: TeXGyreAdventor-Bold, TeXGyreAdventor;
	        font-weight: bold;
	        color: #118af9;
	        margin-right: 8px;
	      }
	      .rd_name {
	        margin-right: 8px;
	        font-size: 14px;
	        font-family: Alibaba-PuHuiTi-M, Alibaba-PuHuiTi;
	        font-weight: normal;
	        color: #020e19;
	      }
	      .rd_level {
	        background: linear-gradient(270deg, #efb091 0%, #fcdabe 100%);
	        border-radius: 4px;
	        font-size: 11px;
	        font-family: TeXGyreAdventor-Bold, TeXGyreAdventor;
	        font-weight: bold;
	        color: #662809;
	        padding: 2px 6px;
	      }
	    }
	    .rd-datas {
	      margin-top: 8px;
	      > div {
	        display: inline-block;
	        width: 26%;
	        line-height: 30px;
	        label {
	          width: 100px;
	          font-size: 12px;
	          font-family: Alibaba-PuHuiTi-R, Alibaba-PuHuiTi;
	          font-weight: normal;
	          color: rgba(2, 14, 25, 0.55);
	        }
	        p {
	          display: inline-block;
	          font-size: 12px;
	          font-family: Alibaba-PuHuiTi-R, Alibaba-PuHuiTi;
	          font-weight: normal;
	          color: #020e19;
	        }
	      }
	    }
	    .rd-status {
	      background: #f3f8fd;
	      border-radius: 8px;
	      padding: 6px 16px;
	      font-size: 12px;
	      font-family: Alibaba-PuHuiTi-R, Alibaba-PuHuiTi;
	      font-weight: normal;
	      color: #118af9;
	      position: absolute;
	      bottom: 8px;
	      right: 16px;
	      span {
	        padding: 0 8px;
	        &:first-child {
	          padding-left: 0;
	        }
	        &:last-child {	
	          padding-right: 0;
	        }
	        & + span {
	          border-left: 1px solid rgba(17, 138, 249, 0.35);
	        }
	      }
	    }
	    .rd-actions {
	      position: absolute;
	      top: 10px;
	      right: 0px;
	    }
	    .rd-detail {
	      cursor: pointer;
	      position: absolute;
	      top: 0;
	      right: 0;
	      height: 42px;
	      width: 70px;
	      /* background-image: url('../assets/detail-page.png'); */
	      background-repeat: no-repeat;
	      background-size: 100% 100%;
	      font-family: Alibaba-PuHuiTi-M, Alibaba-PuHuiTi;
	      font-weight: normal;
	      color: #f3f8fd;
	      font-size: 12px;
	      padding-top: 10px;
	      padding-left: 38px;
	      box-sizing: border-box;
	    }
	  }
	}
	
</style>