import service from '@/utils/request'

export const useMetadataApi = (id: number) => {
	return service.get('/data-governance/metadata/' + id)
}

export const useMetadataSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/metadata', dataForm)
	} else {
		return service.post('/data-governance/metadata', dataForm)
	}
}

export const listChildApi = (parentId: number) => {
	return service.get('/data-governance/metadata/list-child?parentId='+parentId)
}

export const listDbApi = () => {
	return service.get('/data-governance/metadata/list-db')
}

export const listColumnApi = (id: number) => {
	return service.get('/data-governance/metadata/list-column?parentId='+id)
}

export const delTreeNodeApi = (id: number) => {
	return service.delete('/data-governance/metadata/'+id)
}

export const listMetamodelPropertyApi = (metaModelId: number) => {
	return service.get('/data-governance/metamodel-property/properties/'+metaModelId)
}

export const listKeywordApi = (keyword: any) => {
	return service.get('/data-governance/metadata/list-keyword?keyword='+keyword)
}

export const listMetadataFloderApi = () => {
	return service.get('/data-governance/metadata/list-floder')
}

export const updateNeo4jApi = (dataForm: any) => {
	return service.post('/data-governance/metadata/neo4j', dataForm)
}

export const getNeo4jApi = () => {
	return service.get('/data-governance/metadata/neo4j')
}




