import service from '@/utils/request'

export const useAssetsCatalogApi = (id: number) => {
	return service.get('/data-assets/catalog/' + id)
}

export const useAssetsCatalogSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-assets/catalog/', dataForm)
	} else {
		return service.post('/data-assets/catalog/', dataForm)
	}
}

export const listTreeApi = (id: number) => {
	return service.get('/data-assets/catalog/list-tree')
}

export const delTreeNodeApi = (id: number) => {
	return service.delete('/data-assets/catalog/'+id)
}