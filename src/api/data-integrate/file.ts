import service from '@/utils/request'

export const useFileApi = (id: number) => {
	return service.get('/data-integrate/file/' + id)
}

export const useFileSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/file', dataForm)
	} else {
		return service.post('/data-integrate/file', dataForm)
	}
}