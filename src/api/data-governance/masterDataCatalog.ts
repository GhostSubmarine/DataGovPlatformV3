import service from '@/utils/request'

export const useMasterDataCatalogApi = (id: number) => {
	return service.get('/data-governance/master-data-catalog/' + id)
}

export const useMasterDataCatalogSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/master-data-catalog', dataForm)
	} else {
		return service.post('/data-governance/master-data-catalog', dataForm)
	}
}

export const listTreeApi = (id: number) => {
	return service.get('/data-governance/master-data-catalog/list-tree')
}

export const delTreeNodeApi = (id: number) => {
	return service.delete('/data-governance/master-data-catalog/'+id)
}

export const listMasterModelTreeApi = (id: number) => {
	return service.get('/data-governance/master-data-catalog/list-master-model-tree')
}