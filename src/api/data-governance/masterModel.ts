import service from '@/utils/request'

export const saveMasterModelApi = (dataForm: any) => {
	return service.post('/data-governance/master-model', dataForm)
}

export const getMasterModelApiById = (id: any) => {
	return service.get('/data-governance/master-model/by-id/' + id)
}

export const getMasterModelApi = (catalogId: any) => {
	return service.get('/data-governance/master-model/' + catalogId)
}

export const updateMasterModelApi = (dataForm: any) => {
	return service.put('/data-governance/master-model', dataForm)
}

export const deleteMasterModelApi = (id: number) => {
	return service.delete('/data-governance/master-model/' + id)
}

export const releaseMasterModelApi = (id: number) => {
	return service.put('/data-governance/master-model/release/' + id)
}

export const cancelReleaseMasterModelApi = (id: number) => {
	return service.put('/data-governance/master-model/cancel-release/' + id)
}


