export const googleSpreadsheetKey = '1F7YsZk5now_twhccVQYmqgpyKyO9zYi1OFk0mpWYg2k';

export const binaryConditions = [
    [ '<', 'lessThan' ],
    [ '>', 'greaterThan' ],
    [ '<=', 'lessThanOrEqual' ],
    [ '>=', 'greaterThanOrEqual' ],
    [ '=', 'equals' ],
];

export const unaryConditions = [
    [ '!', 'doesntHaveTag' ],
];

export const binaryOperations = [
    [ '=', 'set' ],
    [ '+', 'add' ],
    [ '-', 'subtract' ],
    ['go', 'go'],
];

export const unaryOperations = [
    [ '+', 'addTag' ],
    [ '-', 'removeTag' ],
    ['restart', 'restart'],
];

export const defaultTags = [ 'start', 'death' ];
