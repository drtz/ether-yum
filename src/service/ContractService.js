const { InfuraApiError, InfuraApiErrorCode } = require("../infura/InfuraEthereumClient");

class ContractService {
    constructor({ infuraClient }) {
        this.infuraClient = infuraClient;
    }

    async getContractByAddress(address) {
        const blockNumberString = await this.infuraClient.getBlockNumber();
        const blockNumber = parseInt(blockNumberString, 16);
        if (isNaN(blockNumber)) {
            throw new Error(`Block number ${blockNumberString} is not a valid hex number`);
        }

        const logs = await this.#findOldestLogs(address, 0, blockNumber);

        if (logs.length == 0) {
            throw new Error('No logs found for specified address');
        }

        // Assume the oldest log is at index 0. This seems to be true with the addresses I tested, but I'm not sure that's always the case.
        // If that assumption turns out to be incorrect, we could search for the log with the smallest block number instead.
        const firstLog = logs[0];

        const block = await this.infuraClient.getBlockByNumber(firstLog.blockNumber, false);
        return {
            createdInTransaction: {
                transactionHash: firstLog.transactionHash,
                blockNumber: firstLog.blockNumber,
                blockHash: firstLog.blockHash,
                timestamp: parseInt(block.timestamp, 16),
            }
        }
    }

    // To figure out which block & transaction it was created in, we need to find its oldest log. Unfortunately, the
    // Infura API only returns up to 10,000 logs for a single request and does not provide any paging options.
    // 
    // This method executes a binary search for the earliest set of < 10,000 logs for this address block range using
    // a recursive strategy. The result list will always include the oldest log for the specified address at index 0.
    async #findOldestLogs(address, start, end) {
        try {
            return await this.#getLogs(address, start, end);
        } catch (error) {
            if (!(error instanceof InfuraApiError) || error.code != InfuraApiErrorCode.RESULTS_TOO_LARGE) {
                throw error;
            }

            if (start == end) {
                throw new Error('#searchLogs found too many results, but search range cannot be narrowed any further');
            }

            // The result set was too large, do a binary search to find a range small enough to get a result set from Infura
            const midPoint = Math.floor((start + end) / 2);

            // Search the two halves. We want the originating transaction, so search the older section first
            const olderLogs = await this.#findOldestLogs(address, start, midPoint);
            if (olderLogs.length > 0) {
                return olderLogs;
            }

            // No logs were found in the older segment, return the newer segment instead
            return this.#findOldestLogs(address, midPoint + 1, end);
        }
    }

    #getLogs(address, start, end) {
        const fromBlock = this.#numberToHex(start);
        const toBlock = this.#numberToHex(end);
        return this.infuraClient.getLogs({ address, fromBlock, toBlock });
    }

    #numberToHex(number) {
        return `0x${number.toString(16)}`;
    }

}
module.exports = ContractService;