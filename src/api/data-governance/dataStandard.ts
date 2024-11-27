import service from '@/utils/request'

export const useStandardApi = (id: number) => {
	return service.get('/data-governance/data-standard/' + id)
}

export const useStandardSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/data-standard', dataForm)
	} else {
		return service.post('/data-governance/data-standard', dataForm)
	}
}

export const useCategoryApi = (id: number) => {
	return service.get('/data-governance/standard-category/' + id)
}

export const useCategorySubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/standard-category', dataForm)
	} else {
		return service.post('/data-governance/standard-category', dataForm)
	}
}


export const listTreeApi = () => {
	return service.get('/data-governance/standard-category/list-tree')
}

export const delTreeNodeApi = (id: number) => {
	return service.delete('/data-governance/standard-category/' + id)
}

export const dataStandardCheckApi = (metadataId, standardId) => {
	return service.get('/data-governance/data-standard/check/'+metadataId+'/'+standardId)
}