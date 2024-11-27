import service from '@/utils/request'

export const useStandardRelApi = (id: number) => {
	return service.get('/data-governance/standard-rel/' + id)
}

export const useStandardRelSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/standard-rel', dataForm)
	} else {
		return service.post('/data-governance/standard-rel', dataForm)
	}
}

export const getByMetadataApi = (metadataId: number) => {
	return service.get('/data-governance/standard-rel/' + metadataId + '/metadata-rel')
}

export const delMetadataRelApi = (metadataId: number, standardId: number) => {
	return service.delete('/data-governance/standard-rel/' + metadataId + '/'+ standardId)
}