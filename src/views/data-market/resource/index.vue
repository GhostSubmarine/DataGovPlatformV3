<template>
  <el-card body-style="height: calc(100vh - 170px )">
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
			  		<!-- <div>
			  			<el-button type="primary" @click="appendRoot">添加根目录</el-button><br><br>
			  		</div> -->
			  		<el-tree
			  		 ref="treeRef"
			  		 :data="treeList"
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
				<!-- <el-form-item>
				  <fast-select v-model="state.queryForm.status" dict-type="ground_status" placeholder="上架状态" clearable filterable></fast-select>
				</el-form-item>
				<el-form-item>
				  <fast-select v-model="state.queryForm.mountStatus" dict-type="mount_status" placeholder="挂载状态" clearable filterable></fast-select>
				</el-form-item> -->
				<el-form-item>
				  <el-input v-model="state.queryForm.dutyUser" placeholder="负责人"></el-input>
				</el-form-item>			  	<el-form-item>			  		<el-button type="primary" @click="getDataList()">查询</el-button>			  	</el-form-item>			  	<!-- <el-form-item>			  		<el-button type="primary" @click="addOrUpdateResouce()">新增</el-button>			  	</el-form-item> -->			  </el-form>
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
						  <!-- <div class="rd-status">
							<span>{{ item.status == 1? '已上架':'未上架' }}</span>
							<span>{{ item.mountStatus == 1? '已挂载':'未挂载' }}</span>
						  </div> -->
						  <div class="rd-actions">
							<el-button type="warning" size="small" @click="toDetail(item)">详情</el-button>
							<!-- <el-button type="warning" size="small" @click="addOrUpdateResouce(item.id)">修改</el-button> -->
							<el-button type="primary" size="small" @click="toMount(item)">资源信息</el-button>
							<el-button type="primary" size="small" @click="toApply(item)">我申请的</el-button>
							<!-- <el-button v-if="item.status == 1" type="primary" size="small" @click="offline(item.id)">下架</el-button>
							<el-button v-if="item.status == 0" type="primary" size="small" @click="online(item.id)">上架</el-button>
							<el-button type="danger" size="small" @click="toDelete(item.id)">删除</el-button> -->
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
	<ResourceDetail ref="resourceDetailRef"></ResourceDetail>
	<ResourceMount ref="resourceMountRef" @refreshDataList="getDataList"></ResourceMount>
	<ApplyPage ref='applyPageRef'></ApplyPage>
  </el-card>
</template>

<script setup lang="ts" name="Data-marketResourceIndex">
import { useCrud } from '@/hooks'
import { reactive, ref, onMounted, watch } from 'vue'
import ResourceDetail from '../../data-assets/catalog/resource-detail.vue'
import ResourceMount from '../../data-assets/catalog/resource-mount.vue'
import SideLayout from '@/components/side-layout/index.vue'
import { listTreeApi } from '@/api/data-assets/catalog'
import { IHooksOptions } from '@/hooks/interface'
import { ElMessage, ElMessageBox } from 'element-plus/es'
import ApplyPage from './apply-page.vue'

onMounted(()=>{
	getTreeList()
})

const state: IHooksOptions = reactive({
	createdIsNeed: false,
	limit: 5,
	dataListUrl: '/data-assets/resource/page-market',
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

const infoView = ref(false)
const curentNode = ref()
const treeNodeCk = (e, data, n, t) => {
	console.log(data.data)
	if(data.data.type != 0) {
		infoView.value = true
		curentNode.value = data.data
		state.queryForm.catalogId = data.data.id
		getDataList()
	} else {
		infoView.value = false
	}
} 


//详情
const resourceDetailRef = ref()
const toDetail = (item: any) => {
	item.parentPath = curentNode.value.parentPath
	item.market = true
	resourceDetailRef.value.init(item)
}
const resourceMountRef = ref()
//挂载资源
const toMount = (item: any) => {
	item.market = true
	resourceMountRef.value.init(item)
}

const applyPageRef = ref()
const toApply = (item: any)=> {
	applyPageRef.value.init(item.id)
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