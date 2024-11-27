<template>
	<el-dropdown class="avatar-container" trigger="hover" @command="handleCommand">
		<div class="avatar-wrapper">
			<el-icon><OfficeBuilding /></el-icon>
			<span>{{ $t('router.changeProject') }}</span>
			<el-icon class="el-icon--right"><ArrowDown /></el-icon>
		</div>
		<template #dropdown>
			<el-dropdown-menu class="user-dropdown">
				<el-dropdown-item :disabled="projectId == data.id" v-for="data in store.appStore.projectList" :command="data.id">{{ data.name }}</el-dropdown-item>
			</el-dropdown-menu>
		</template>
	</el-dropdown>
</template>

<script setup lang="ts">
import store from '@/store'
import { onMounted, ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { SessionStorage } from '@/utils/storage'
import { changeProjectApi } from '@/api/data-integrate/project'

const projectId = ref('')

onMounted(()=> {
	projectId.value = SessionStorage.getItem(store.userStore.token)
	var hasProject = false;
	if(projectId.value) {
		for(var i in store.appStore.projectList) {
			 if(store.appStore.projectList[i].id == projectId.value) {
				 hasProject = true
				 break
			 }
		}
	}
	if (hasProject) {
		 changeProjectApi(projectId.value)
	} else {
		//选择第一个项目为当前项目
		projectId.value = store.appStore.projectList[0].id
		//设置项目
		changeProjectApi(projectId.value)
		SessionStorage.setItem(store.userStore.token, projectId)
	}
})


const handleCommand = (id: number) => {
	//存储当前的项目id
	SessionStorage.setItem(store.userStore.token,id)
	//请求切换项目的api
	changeProjectApi(id).then(res => {
		// 刷新页面
		window.location.reload()
	})
}
</script>

<style lang="scss" scoped>
.avatar-container {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	height: var(--theme-header-height);
	.avatar-wrapper {
		display: flex;
		align-items: center;
		white-space: nowrap;
		cursor: pointer;
		padding: 0 8px;
		color: var(--theme-header-text-color);
		span {
			margin-left: 6px;
		}
	}
	//&:hover {
	//	background: var(--theme-header-hover-color);
	//}
}
</style>
