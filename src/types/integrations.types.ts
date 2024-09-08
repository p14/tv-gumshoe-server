export type MediaContent = {
    id: string
    name: string
    firstAiredDate: string
    nextAiredDate?: string
    overview: string
    status: 'Continuing' | 'Ended'
    thumbnail: string
    year: string
};
