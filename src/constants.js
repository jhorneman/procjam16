export const googleSpreadsheetKey = '1F7YsZk5now_twhccVQYmqgpyKyO9zYi1OFk0mpWYg2k';

export const visibleStatNames = [
    'health',
    'luck',
    'morale',
    'rations',
];

export const distanceStatName = 'miles';
export const timeStatName = 'days';

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
];

export const unaryOperations = [
    [ '+', 'addTag' ],
    [ '-', 'removeTag' ],
    ['restart', 'restart'],     // Strictly speaking restart is not a unary operation, but hey.
    ['go', 'go'],
];

export const defaultTags = [ 'start', 'death' ];

export const defaultStats = [distanceStatName, timeStatName, ...visibleStatNames];
