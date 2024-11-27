import service from '@/utils/request'

export const useMetamodelApi = (id: number) => {
	return service.get('/data-governance/metamodel/' + id)
}

export const useMetamodelSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/metamodel', dataForm)
	} else {
		return service.post('/data-governance/metamodel', dataForm)
	}
}

export const listTreeApi = () => {
	return service.get('/data-governance/metamodel/list-tree')
}

export const delTreeNodeApi = (id: number) => {
	return service.delete('/data-governance/metamodel/'+id)
}