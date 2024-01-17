
export default class PostService {
    static async getAll(limit = 25, page = 1) {
        const response = await fetch('https://659d64ca633f9aee79095579.mockapi.io/lot', {
            params: {
                _limit: limit,
                _page: page
            }
        })
        return response;
    }
}