import service from '@/utils/request'

export const useCatalogueApi = (id: number) => {
	return service.get('/data-development/catalogue/' + id)
}

export const useCatalogueSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-development/catalogue', dataForm)
	} else {
		return service.post('/data-development/catalogue', dataForm)
	}
}

export const useCatalogueListApi = () => {
	return service.get('/data-development/catalogue')
}

export const useCatalogueDelApi = (id: number) => {
	return service.delete('/data-development/catalogue/' + id)
}