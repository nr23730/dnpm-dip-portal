import type { CollectionResponse, PatientFilter, PatientFilterInput } from '@dnpm-dip/core';
import { BaseAPI } from '@dnpm-dip/core';
import type { RDPatientMatch, RDPatientRecord } from '../patient';
import { QueryRequestMode } from './constants';
import type {
    RDQuerySession, RDQuerySessionCreate, RDQuerySummary,
} from './types';

export class QueryAPI extends BaseAPI {
    /**
     * Create a query session.
     *
     * @param query
     */
    async submit(query: RDQuerySessionCreate) : Promise<RDQuerySession> {
        query.mode = query.mode || QueryRequestMode.LOCAL;

        const response = await this.client.post('rd/queries', query);
        return response.data;
    }

    async getOne(id: string) : Promise<RDQuerySession> {
        const response = await this.client.get(`rd/queries/${id}`);
        return response.data;
    }

    /**
     * Refresh the query session.
     *
     * @param id
     */
    async refresh(id: string) : Promise<RDQuerySession> {
        const response = await this.client.put(`rd/queries/${id}`);
        return response.data;
    }

    /**
     * Get a summary/overview in the context of a specific query.
     *
     * @param id
     */
    async getSummary(id: string) : Promise<RDQuerySummary> {
        const response = await this.client.get(`rd/queries/${id}/summary`);
        return response.data;
    }

    /**
     * Get all patients in the context of a specific query.
     * @param id
     * @param filters
     * @throws ClientError
     */
    async getPatients(id: string, filters?: PatientFilterInput) : Promise<CollectionResponse<RDPatientMatch>> {
        const parts : string[] = [];
        if (typeof filters !== 'undefined') {
            if (filters.ageRange) {
                if (typeof filters.ageRange.min !== 'undefined') {
                    parts.push(`age[min]=${filters.ageRange.min}`);
                }

                if (typeof filters.ageRange.max !== 'undefined') {
                    parts.push(`age[max]=${filters.ageRange.max}`);
                }
            }

            if (
                filters.gender &&
                filters.gender.length > 0
            ) {
                for (let i = 0; i < filters.gender.length; i++) {
                    parts.push(`gender=${filters.gender[i].code}`);
                }
            }

            if (
                filters.vitalStatus &&
                filters.vitalStatus.length > 0
            ) {
                for (let i = 0; i < filters.vitalStatus.length; i++) {
                    parts.push(`vitalStatus=${filters.vitalStatus[i].code}`);
                }
            }
        }

        const qs = parts.length > 0 ? `?${parts.join('&')}` : '';

        const response = await this.client.get(`rd/queries/${id}/patients${qs}`);
        return response.data;
    }

    /**
     * Get an individual patient in the context of a specific query.
     *
     * @param queryId
     * @param patientId
     */
    async getPatientRecord(queryId: string, patientId: string) : Promise<RDPatientRecord> {
        const response = await this.client.get(`rd/queries/${queryId}/patient-record/${patientId}`);
        return response.data;
    }
}
