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
				      title=""
					  border
				      :column="1"
				      size="large"
				      direction="horizontal"
				    >
				      <el-descriptions-item label="名称">{{bisData.name}}</el-descriptions-item>
				      <el-descriptions-item label="编码">{{bisData.code}}</el-descriptions-item>
					  <el-descriptions-item label="类型">{{bisData.builtin == 1?'内置元模型':'自定义元模型'}}</el-descriptions-item>
				      <el-descriptions-item label="路径">{{bisData.path}}</el-descriptions-item>
				      <el-descriptions-item label="创建人">{{ getNameByUserId(store.appStore.sysUserList,bisData.creator) }}</el-descriptions-item>
				      <el-descriptions-item label="创建时间">{{ bisData.createTime }}</el-descriptions-item>
					  <el-descriptions-item label="描述">{{ bisData.description }}</el-descriptions-item>
				    </el-descriptions>
			  </div>
			</el-tab-pane>
			<el-tab-pane>
			  <template #label>
				<span>
				  <el-icon><Reading /></el-icon>&nbsp;
				  <span>属性</span>
				</span>
			  </template>
			  <div>
				  <PropertyInfo ref="propertyInfoRef"></PropertyInfo>
			  </div>
			</el-tab-pane>
		</el-tabs>
	</div>
	
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import store from '@/store'
import { getNameByUserId } from '@/utils/tool'
import PropertyInfo from './property-info.vue'

/**
 * 基本信息
 */
const bisData = reactive({
	name: '',
	code: '',
	path: '',
	builtin: '',
	description: '',
})
//属性列表
const propertyInfoRef = ref()

const init = (data: any) => {
	//赋值给基本信息
	Object.assign(bisData, data)
	//获取属性列表
	propertyInfoRef.value.init(data.id)
}

defineExpose({
	init
})
	
</script>

<style>
</style>