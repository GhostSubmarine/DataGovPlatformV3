import service from '@/utils/request'

export const useApiGroupApi = (id: number) => {
	return service.get('/data-service/api-group/' + id)
}

export const useApiGroupSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-service/api-group', dataForm)
	} else {
		return service.post('/data-service/api-group', dataForm)
	}
}

export const useCatalogueListApi = () => {
	return service.get('/data-service/api-group')
}

export const useCatalogueDelApi = (id: any) => {
	return service.delete('/data-service/api-group/'+id)
}