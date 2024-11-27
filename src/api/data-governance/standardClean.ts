import service from '@/utils/request'

export const useStandardCleanApi = (id: number) => {
	return service.get('/data-governance/standard-clean/' + id)
}

export const useStandardCleanSubmitApi = (dataForm: any) => {
	if (dataForm.id) {
		return service.put('/data-governance/standard-clean', dataForm)
	} else {
		return service.post('/data-governance/standard-clean', dataForm)
	}
}

export const getCleanConfigApi = (metadataId: number) => {
	return service.get('/data-governance/standard-clean/metadata/' + metadataId)
}

export const getStandardColumnTypeApi = (metadataId: number) => {
	return service.get('/data-governance/standard-clean/metadata-column-type/' + metadataId)
}

export const getStandardCodeApi = (metadataId: number) => {
	return service.get('/data-governance/standard-clean/standard-code/' + metadataId)
}

export const getMetaStandardRelApi = (metadataId: number) => {
	return service.get('/data-governance/standard-clean/meta-standard-rel/' + metadataId)
}

export const releaseApi = (id: number) => {
	return service.post('/data-governance/standard-clean/release/' + id)
}

export const cancelReleaseApi = (id: number) => {
	return service.post('/data-governance/standard-clean/cancel/' + id)
}

export const handleRunApi = (id: number) => {
	return service.post('/data-governance/standard-clean/hand-run/' + id)
}

