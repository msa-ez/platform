class ChunkIterator {
    constructor(textChunker, text) {
        if(!textChunker) {
            throw new Error('textChunker is required');
        }
        if(!text) {
            throw new Error('text is required');
        }

        this.textChunker = textChunker;
        this.chunks = this.textChunker.splitIntoChunksByLine(text);
        this.currentChunkIndex = -1;
        this.currentChunkText = '';
        this.currentChunkStartLine = 0;
    }

    moveToNextChunk() {
        if (!this.hasMoreChunks()) {
            return false;
        }
        this.currentChunkIndex += 1;
        const currentChunk = this.chunks[this.currentChunkIndex];
        this.currentChunkStartLine = currentChunk.startLine;
        this.currentChunkText = currentChunk.text;
        return true;
    }

    hasMoreChunks() {
        return this.currentChunkIndex + 1 < this.chunks.length;
    }

    getCurrentChunkText() {
        return this.currentChunkText;
    }

    getCurrentChunkStartLine() {
        return this.currentChunkStartLine;
    }

    getCurrentChunkIndex() {
        return this.currentChunkIndex;
    }

    getTotalChunks() {
        return this.chunks.length;
    }
}

module.exports = ChunkIterator;