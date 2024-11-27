<template>
	<div class="resource_dialog">
	  <el-dialog
	    :close-on-click-modal="false"
	    title="资源目录"
	    append-to-body
	    v-model="visible"
	    width="1200px"
	    class="resource_dialog">
	    <el-tabs v-model="activeName" @tab-click="tabClick">
	      <el-tab-pane label="资源详情" name="1" class="dimensional_sheet-right">
	        <div class="info-part">
	          <h6>基本信息</h6>
	          <el-form :model="resourceInfo" label-width="100px">
				<el-row>
					<el-col :span="12">
					  <el-form-item label="所属目录" prop="parentPath" label-width="auto">
						<span>{{resourceInfo.parentPath}}</span>
					  </el-form-item>
					</el-col>
					<el-col :span="12">
					  <el-form-item label="名称" prop="name" label-width="auto">
						<span>{{resourceInfo.name}}</span>
					  </el-form-item>
					</el-col>
	          	</el-row>
				<el-row>
					<el-col :span="12">
						<el-form-item label="编码" prop="code" label-width="auto">
							<span>{{resourceInfo.code}}</span>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="版本号" prop="versionNo" label-width="auto">
							<span>{{resourceInfo.versionNo}}</span>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="开放类型" prop="openType" label-width="auto" v-show="!market">
					<fast-select v-model="resourceInfo.openType" dict-type="open_type" placeholder="开放类型" clearable disabled></fast-select>
				</el-form-item>
				<el-form-item label="开放角色" prop="openRoles" label-width="auto"  v-show="!market" v-if="resourceInfo.openType == 2">
					<el-select v-model="resourceInfo.openRoles"
							   disabled
							   multiple
							   clearable
							   filterable
					           placeholder="请选择">
					  <el-option v-for="(item,index) in roles"
					             :key="item.id"
					             :label="`[${item.id}]${item.name}`"
					             :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="开放用户" prop="openUsers" label-width="auto" v-show="!market" v-if="resourceInfo.openType == 3">
					<el-select v-model="resourceInfo.openUsers"
							   disabled
							   multiple
							   clearable
							   filterable
					           placeholder="请选择">
					  <el-option v-for="(item,index) in users"
					             :key="item.id"
					             :label="`[${item.id}]${item.username}`"
					             :value="item.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="负责人" prop="dutyUser" label-width="auto">
					<span>{{resourceInfo.dutyUser}}</span>
				</el-form-item>
				<el-form-item label="摘要" prop="summary" label-width="auto">
					<p>{{resourceInfo.summary}}</p>
				</el-form-item>
	          </el-form>
	        </div>
	        <div class="info-part" style="margin-bottom: 16px">
	          <h6>其他信息</h6>
			  <el-row>
			  	<el-col :span="12">
			  		<el-form-item label="最新更新人" prop="updater" label-width="auto">
			  			<span>{{getNameByUserId(store.appStore.sysUserList, resourceInfo.updater)}}</span>
			  		</el-form-item>
			  	</el-col>
			  	<el-col :span="12">
			  		<el-form-item label="最新更新时间" prop="updater" label-width="auto">
			  			<span>{{resourceInfo.updateTime}}</span>
			  		</el-form-item>
			  	</el-col>
			  </el-row>
	          <el-row>
	          	<el-col :span="12">
	          		<el-form-item label="上架人" prop="releaseUserId" label-width="auto">
	          			<span>{{getNameByUserId(store.appStore.sysUserList, resourceInfo.releaseUserId)}}</span>
	          		</el-form-item>
	          	</el-col>
	          	<el-col :span="12">
	          		<el-form-item label="上架时间" prop="versionNo" label-width="auto">
	          			<span>{{resourceInfo.releaseTime}}</span>
	          		</el-form-item>
	          	</el-col>
	          </el-row>
	        </div>
	      </el-tab-pane>
	     <!-- <el-tab-pane label="变更信息" name="2">
	        
	      </el-tab-pane> -->
	      <el-tab-pane label="资源信息" name="3">
	        <MountInfo ref="mountInfoRef"></MountInfo>
	      </el-tab-pane>
	      <el-tab-pane label="资源评价" name="4">
	        <ResourceComment ref="resourceCommentRef"></ResourceComment>
	      </el-tab-pane>
	    </el-tabs>
	  </el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, provide } from 'vue'
import { useRoleListApi } from '@/api/sys/role'
import { listUserApi } from '@/api/sys/user'
import store from '@/store'
import { getNameByUserId } from '@/utils/tool'
import MountInfo from './mount-info.vue'
import ResourceComment from '../../data-market/resource/resource-comment.vue'

const roles = ref([])
const users = ref([])

onMounted(()=>{
	useRoleListApi().then(res => {
		roles.value = res.data
	})
	listUserApi().then(res=> {
		users.value = res.data
	})
})

const visible = ref(false)
provide("visible",visible)
const activeName = ref('1')
const resourceInfo = reactive({
	
})
const mountInfoRef = ref()
const resourceCommentRef = ref()
const market = ref()
const init = (resourceItem: any) => {
	market.value = resourceItem.market
	visible.value = true
	Object.assign(resourceInfo, resourceItem)
	setTimeout(()=>{
		mountInfoRef.value.init(resourceItem)
		resourceCommentRef.value.init(resourceItem)
	},300)
	
}

const tabClick = () => {
	
}

defineExpose({
	init
})	
</script>

<style lang="scss">
	.resource_dialog {
	  h6 {
	    padding: 10px;
	  }
	}
	
	.dimensional_sheet-right {
	  padding: 0 !important;
	  .dsr-part {
	    height: calc(100% - 62px);
	    overflow: auto;
	  }
	  .action_part {
	    background-color: #fff;
	    padding: 12px;
	    border-bottom: 1px solid #ebeef5;
	    box-sizing: border-box;
	  }
	  .info-part {
	    background-color: #f3f8fd;
	    width: calc(100% - 20px);
	    margin: 12px auto 0;
	    border: 1px solid #ebeef5;
	    padding: 12px;
	    box-sizing: border-box;
	    border-radius: 8px;
	    h6 {
	      padding: 12px 0;
	      padding-left: 20px;
	      position: relative;
	      font-size: 16px;
	      font-family: Alibaba-PuHuiTi-M, Alibaba-PuHuiTi;
	      font-weight: normal;
	      color: #020e19;
	      &::after {
	        content: '';
	        height: 12px;
	        width: 4px;
	        position: absolute;
	        left: 6px;
	        top: 50%;
	        transform: translateY(-50%);
	        // background-color: $--color-primary;
	        background: linear-gradient(180deg, #118af9 0%, rgba(17, 138, 249, 0.3) 100%);
	      }
	    }
	  }
	}
</style>