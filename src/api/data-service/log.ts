import service from '@/utils/request'

export const useLogApi = (id: number) => {
	return service.get('/data-service/log/' + id)
}

export const useLogSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-service/log', dataForm)
	} else {
		return service.post('/data-service/log', dataForm)
	}
}