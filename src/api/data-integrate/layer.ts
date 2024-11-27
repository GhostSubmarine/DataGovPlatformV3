import service from '@/utils/request'

export const useLayerApi = (id: number) => {
	return service.get('/data-integrate/layer/' + id)
}

export const useLayerSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-integrate/layer', dataForm)
	} else {
		return service.post('/data-integrate/layer', dataForm)
	}
}