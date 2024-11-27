import service from '@/utils/request'

export const useDataPushTaskLogApi = (id: number) => {
	return service.get('/data-governance/dataPushTaskLog/' + id)
}

export const useDataPushTaskLogSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/dataPushTaskLog', dataForm)
	} else {
		return service.post('/data-governance/dataPushTaskLog', dataForm)
	}
}

export const getTaskByIdApi = (id: number) => {
	return service.get('/data-governance/dataPushTaskLog/' + id)
}

export const stopTaskApi = (executeNo: any) => {
	return service.post('/data-governance/dataPushTask/stop-task/' + executeNo)
}