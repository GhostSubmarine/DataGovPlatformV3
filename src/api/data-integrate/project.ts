import service from '@/utils/request'

export const useProjectApi = (id: number) => {
	return service.get('/data-integrate/project/' + id)
}

export const useProjectSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/project', dataForm)
	} else {
		return service.post('/data-integrate/project', dataForm)
	}
}

export const addUserApi = (projectId: number, userIds: any[]) => {
	return service.post('/data-integrate/project/adduser/' + projectId, userIds)
}

export const currentUserProjectsApi = () => {
	return service.get('/data-integrate/project/current-user-projects')
}

export const changeProjectApi = (id) => {
	return service.put('/data-integrate/project/change-project/'+id)
}

export const testOnlineApi = (dataForm: any) => {
	return service.post('/data-integrate/project/test-online', dataForm)
}

