<template>
	<el-dialog v-model="visible" title="查看" :close-on-click-modal="false">
		<el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="100px" @keyup.enter="submitHandle()">
			<el-form-item label="标题:" prop="title" label-width="auto">
				<span>{{dataForm.title}}</span>
			</el-form-item>
			<el-form-item label="资产名称:" prop="resourceName" label-width="auto">
				<span>{{dataForm.resourceName}}</span>
			</el-form-item>
			<el-form-item label="资源名称:" prop="resourceMountName" label-width="auto">
				<span>{{dataForm.resourceMountName}}</span>
			</el-form-item>
			<el-form-item label="电话:" prop="phone" label-width="auto">
				<span>{{dataForm.phone}}</span>
			</el-form-item>
			<el-form-item  label="邮箱:" prop="email" label-width="auto">
				<span>{{dataForm.email}}</span>
			</el-form-item>
			<el-form-item label="申请开始时间:" prop="applyStartTime" label-width="auto">
				<span>{{dataForm.applyStartTime}}</span>
			</el-form-item>
			<el-form-item label="申请结束时间:" prop="applyEndTime" label-width="auto">
				<span>{{dataForm.applyEndTime}}</span>
			</el-form-item>
			<el-form-item label="调用类型:" prop="applyUseType" v-if="dataForm.mountType==2" label-width="auto">
				<span>{{dataForm.applyUseType == 0? '不限次数':'指定次数'}}</span>
			</el-form-item>
			<el-form-item label="调用次数:" prop="applyUseTimes" v-if="dataForm.applyUseType == 1 && dataForm.mountType==2" label-width="auto">
				<span>{{dataForm.applyUseTimes}}</span>
			</el-form-item>
			<el-form-item label="调用说明:" v-if="dataForm.mountType==2" label-width="auto">
				<span v-if="appShow">该 API 为私有 API，调用前需要先获取 token 才可正常调用</span>
				<span v-if="!appShow">该 API 为公有 API，调用不受申请的时间和次数限制</span>
			</el-form-item>
			<el-form-item label="授权状态:" prop="ifAuth" v-if="dataForm.status == 1" label-width="auto">
				<span>
					<el-tag v-show="dataForm.ifAuth=='0'" type="info">未授权（请联系管理员授权）</el-tag>
					<el-tag v-show="dataForm.ifAuth=='1'" type="success">已授权</el-tag>
				</span>
			</el-form-item>
			<!-- <el-form-item  label="申请说明" prop="applyNote" label-width="auto">
				<span>{{dataForm.applyNote}}</span>
			</el-form-item> -->
	    </el-form>
		<div v-if="dataForm.mountType == 2 && appShow">
			<AppPage ifInfo></AppPage>
		</div>
		<el-timeline>
			<el-timeline-item type="primary" timestamp="提交申请" placement="top">
			  <div>
				  <p class="process">申请时间：{{ dataForm.createTime }}</p>
				  <p class="process">申请人：{{ getNameByUserId(store.appStore.sysUserList, dataForm.creator) }}</p>
				  <p class="process">申请说明：{{dataForm.applyNote}}</p>
			  </div>
			</el-timeline-item>
			<el-timeline-item :type="dataForm.status == 1? 'success':'danger'" v-if="dataForm.status != 0" timestamp="审核" placement="top">
			  <p class="process" v-if="dataForm.status == 1">结果：<el-tag type="success">审核通过</el-tag></p>
			  <p class="process" v-if="dataForm.status == 2">结果：<el-tag type="danger">审核不通过</el-tag></p>
			  <p class="process">审核时间：{{dataForm.checkTime}}</p>
			  <p class="process">审核人：{{ getNameByUserId(store.appStore.sysUserList, dataForm.checkUserId) }}</p>
			  <p class="process">审核说明：{{dataForm.checkNote}}</p>
			</el-timeline-item>
			<el-timeline-item type="warning" v-else  timestamp="待审核" placement="top">
			</el-timeline-item>
		</el-timeline>
		<template #footer>
			<el-button type="primary" @click="visible = false">取消</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref,provide } from 'vue'
import { ElMessage } from 'element-plus/es'
import store from '@/store'
import { getNameByUserId } from '@/utils/tool'
import { useApiConfigApi} from '@/api/data-service/apiConfig'
import AppPage from './app-page.vue'

const visible = ref(false)
const dataFormRef = ref()

const appApplyInfo = ref()
provide("appApplyInfo", appApplyInfo)
const applyId = ref()
provide("applyId", applyId)

const dataForm = reactive({
	title: '',
	mountType: '',
	phone: '',
	email: '',
	applyStartTime: '',
	applyEndTime: '',
	applyUseType: '',
	applyUseTimes: '',
	applyNote: ''
})

const appShow = ref(false)
const init = (data: any) => {
	Object.assign(dataForm, data)
	applyId.value = data.id
	visible.value = true
	//如果是私有api，需要选择授权的app
	if(dataForm.mountType==2) {
		//获取api
		useApiConfigApi(dataForm.mountId).then(res=> {
			console.log(res.data)
			if(res.data.previlege == 1) {
				appShow.value = true
			} else {
				appShow.value = false
			}
		})
	} else {
		appShow.value = false
	}
}

const dataRules = ref({
})

defineExpose({
	init
})
</script>

<style scoped lang="scss">
	.process {
		padding: 5px
	}
</style>