import service from '@/utils/request'

export const useMetadataCollectApi = (id: number) => {
	return service.get('/data-governance/metadata-collect/' + id)
}

export const useMetadataCollectSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/metadata-collect', dataForm)
	} else {
		return service.post('/data-governance/metadata-collect', dataForm)
	}
}

export const releaseApi = (id) => {
	return service.put('/data-governance/metadata-collect/release/'+id)
}

export const cancelApi = (id) => {
	return service.put('/data-governance/metadata-collect/cancel/'+id)
}

export const getCollectRecordApi = (id) => {
	return service.get('/data-governance/metadata-collect-record/'+id)
}

export const handRunApi = (id) => {
	return service.post('/data-governance/metadata-collect/hand-run/'+id)
}