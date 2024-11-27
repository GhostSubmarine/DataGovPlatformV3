import service from '@/utils/request'

export const useDataPushConfigApi = (id: number) => {
	return service.get('/data-governance/dataPushConfig/' + id)
}

export const useDataPushConfigSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/dataPushConfig', dataForm)
	} else {
		return service.post('/data-governance/dataPushConfig', dataForm)
	}
}