import service from '@/utils/request'

export const useResourceMountApi = (id: number) => {
	return service.get('/data-assets/resource-mount/' + id)
}

export const useResourceMountSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-assets/resource-mount', dataForm)
	} else {
		return service.post('/data-assets/resource-mount', dataForm)
	}
}

export const listDbInfoById = (resourceId: number, queryApply: any) => {
	return service.get('/data-assets/resource-mount/db-info/' + resourceId + '/' + (queryApply?queryApply:0))
}

export const sqlCheckApi = (data: any) => {
	return service.post('/data-assets/resource-mount/sql-check', data)
}

export const checkStatusApi = (resourceId: number) => {
	return service.get('/data-assets/resource-mount/check/'+resourceId)
}


