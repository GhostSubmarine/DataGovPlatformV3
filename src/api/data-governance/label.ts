import service from '@/utils/request'

export const useLabelApi = (id: number) => {
	return service.get('/data-governance/label/' + id)
}

export const useLabelSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/label', dataForm)
	} else {
		return service.post('/data-governance/label', dataForm)
	}
}

export const getCategoryListApi = () => {
	return service.get('/data-governance/label-category/list')
}

export const getLabelTypesApi = () => {
	return service.get('/data-governance/label-type/list')
}

export const getLabelModelsApi = () => {
	return service.get('/data-governance/label-model/list')
}

export const useCategoryApi = (id: number) => {
	return service.get('/data-governance/label-category/' + id)
}

export const useCategorySubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/label-category', dataForm)
	} else {
		return service.post('/data-governance/label-category', dataForm)
	}
}


export const listTreeApi = () => {
	return service.get('/data-governance/label-category/list-tree')
}

export const delTreeNodeApi = (id: number) => {
	return service.delete('/data-governance/label-category/' + id)
}

export const listColumnByModelIdApi = (id: number) => {
	return service.get('/data-governance/label-model/list-column/' + id)
}

export const onLabelApi = (id: number) => {
	return service.post('/data-governance/label/on/' + id)
}

export const offLabelApi = (id: number) => {
	return service.post('/data-governance/label/off/' + id)
}

export const getLabelsApi = (typeId: number) => {
	if(typeId) {
		return service.get('/data-governance/label/list?typeId='+typeId)
	}
	return service.get('/data-governance/label/list')
}

export const getColumnsByLabelIdApi = (id: number) => {
	return service.get('/data-governance/label/list-column/' + id)
}
