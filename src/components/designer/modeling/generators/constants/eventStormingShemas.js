export const traceMapSchema = {
    type: 'object',
    additionalProperties: {
        type: 'object',
        properties: {
            refs: {
                type: 'array',
                items: {
                    type: 'array',
                    length: 2,
                    items: {
                        type: 'array',
                        length: 2,
                        items: {
                            type: 'number'
                        }
                    }
                }
            },
            isDirectMatching: {
                type: 'boolean'
            }
        },
        additionalProperties: false
    }
}