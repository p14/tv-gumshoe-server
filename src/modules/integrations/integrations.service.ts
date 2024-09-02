import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { MediaContent } from './integrations.types';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export default class IntegrationService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    /**
     * Retrieves an auth token for TVDB to make requests
     * @returns {Promise<string>}
     */
    private async getAuthToken(): Promise<string> {
        const cachedToken = await this.cacheManager.get<string>('tvdb_token');

        if (cachedToken) {
            return cachedToken;
        }

        const { data: response } = await axios.request({
            data: {
                apikey: String(process.env.TVDB_KEY),
                pin: 'string'
            },
            method: 'POST',
            url: `${process.env.TVDB_URL}/login`
        });

        const cacheTimeLimit = (1000 * 60 * 60 * 24 * 7); // 1 week
        await this.cacheManager.set('tvdb_token', response.data.token, cacheTimeLimit);

        return response.data.token;
    }

    /**
     * Retrieves media content items by query from TVDB
     * @param {string} query 
     * @returns {Promise<MediaContent[]>}
     */
    public async searchShows(query: string): Promise<MediaContent[]> {
        const token = await this.getAuthToken();
        const { data: response } = await axios.request({
            headers: { Authorization: token },
            method: 'GET',
            url: `${process.env.TVDB_URL}/search?query=${query}&type=series&language=eng`,
        });

        const shows: MediaContent[] = response.data.map((data: any) => {
            const parsedShowData: MediaContent = {
                id: String(data.tvdb_id),
                name: data.name,
                firstAiredDate: data.first_air_time,
                overview: data.overview,
                status: data.status,
                thumbnail: data.thumbnail,
                year: data.year,
            };

            if (data.primary_language !== 'eng' && data.translations?.['eng']) {
                parsedShowData.name = data.translations['eng'];
            }

            if (data.primary_language !== 'eng' && data.overviews?.['eng']) {
                parsedShowData.overview = data.overviews['eng'];
            }

            return parsedShowData;
        }).filter((data: MediaContent) => data.thumbnail && data.overview);

        return shows;
    }

    /**
     * Retrieves a media content item by ID from TVDB
     * @param {string} id 
     * @returns {Promise<MediaContent>}
     */
    public async getShow(id: string): Promise<MediaContent> {
        const cachedShow = await this.cacheManager.get<MediaContent>(`tvdb_series_${id}`);

        if (cachedShow) {
            return cachedShow;
        }

        const token = await this.getAuthToken();
        const { data: response } = await axios.request({
            headers: { Authorization: token },
            method: 'GET',
            url: `${process.env.TVDB_URL}/series/${id}/extended`,
        });

        const { data: translationResponse } = await axios.request({
            headers: { Authorization: token },
            method: 'GET',
            url: `${process.env.TVDB_URL}/series/${id}/translations/eng`,
        });

        const parsedShowData: MediaContent = {
            id: String(response.data.id),
            name: response.data.name,
            firstAiredDate: response.data.firstAired,
            nextAiredDate: response.data.nextAired,
            overview: response.data.overview,
            status: response.data.status.name,
            thumbnail: response.data.image,
            year: response.data.year,
        };

        if (response.data.original_language !== 'eng' && translationResponse.data.name) {
            parsedShowData.name = translationResponse.data.name;
        }

        if (response.data.primary_language !== 'eng' && translationResponse.data.overview) {
            parsedShowData.overview = translationResponse.data.overview;
        }

        const cacheTimeLimit = (1000 * 60 * 60 * 24); // 1 day
        await this.cacheManager.set(`tvdb_series_${id}`, parsedShowData, cacheTimeLimit);

        return parsedShowData;
    }
}
