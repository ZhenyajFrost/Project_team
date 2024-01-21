
export default class PostService {
    static baseUrl = 'https://659d64ca633f9aee79095579.mockapi.io/lot';
    static async getAll(limit = 25, page = 1) {
        const response = await fetch(this.baseUrl, {
            params: {
                _limit: limit,
                _page: page
            }
        })
        return response;
    }
    static async getById(id){
        const response =  await fetch(this.baseUrl + '/' + id).then(v=>v.json());
        return response;
    }
}