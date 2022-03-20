const axios = require('axios').default;

class InfuraApiErrorCode {

    static RESULTS_TOO_LARGE = new InfuraApiErrorCode(-32005);

    constructor(code) {
        this.code = code;
    }

    static fromNumber(code) {
        return Object.values(InfuraApiErrorCode)
        .find(searchCode => searchCode.code == code);
    }
}

class InfuraApiError extends Error {
    constructor(message, code) {
        super(message);
        this.code = InfuraApiErrorCode.fromNumber(code);
    }
}

class InfuraEthereumClient {

    static BLOCK_NUMBER_METHOD = 'eth_blockNumber';
    static GET_LOGS_METHOD = 'eth_getLogs';
    static GET_BLOCK_BY_NUMBER_METHOD = 'eth_getBlockByNumber';

    static REQUEST_TEMPLATE = (method, params) => `{
        "jsonrpc":"2.0",
        "method":"${method}",
        "params":${params},
        "id":1
    }`

    constructor({ baseUrl, projectId, projectSecret }) {
        const baseURL = new URL(projectId, baseUrl).toString();
        const headers = {
            Authorization: `Basic ${btoa(`:${projectSecret}`)}`,
        };
        this.httpClient = axios.create({ baseURL, headers })
    }

    async getLogs({ address, fromBlock, toBlock }) {
        const params = { address };
        if (fromBlock != undefined) {
            params.fromBlock = fromBlock;
        }
        if (toBlock != undefined) {
            params.toBlock = toBlock;
        }
        return this.#mapResponse(await this.#makeApiRequest(InfuraEthereumClient.GET_LOGS_METHOD, [params]));
    }

    async getBlockNumber() {
        return this.#mapResponse(await this.#makeApiRequest(InfuraEthereumClient.BLOCK_NUMBER_METHOD));
    }

    async getBlockByNumber(block, includeDetails) {
        return this.#mapResponse(await this.#makeApiRequest(InfuraEthereumClient.GET_BLOCK_BY_NUMBER_METHOD, [block, includeDetails]));
    }

    #mapResponse(response) {
        if (response.status != 200) {
            throw new Error(`Infura response was not ok: ${response.status} ${response.error}`);
        }
        if (response.data == undefined) {
            throw new Error('Infura response was empty');
        }
        const data = response.data;
        if (data.error != undefined) {
            const error = data.error;
            throw new InfuraApiError(`Infura error [${error.code}]: ${error.message}`, error.code);
        }
        if (data.result == undefined) {
            throw new Error('Infura response had no result');
        }
        return data.result;
    }

    async #makeApiRequest(method, params) {
        const paramsString = params ? JSON.stringify(params) : '[]';
        const body = InfuraEthereumClient.REQUEST_TEMPLATE(method, paramsString);
        return this.httpClient.post('', body);
    }
}

module.exports = { InfuraEthereumClient, InfuraApiError, InfuraApiErrorCode };