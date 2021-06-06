/**
 * Namespace with various named constants used in other .js files to avoid 'magic constants'
 */
const Constants = {
    /**
     * names of available colors (color schemes)
     */
    COLORS: ['yellow', 'blue', 'red', 'green', 'fuchsia'],

    /**
     * keycodes (shortcuts for setting note to a particular color)
     */
    KEYCODES: {y: 'yellow', b: 'blue', r: 'red', g: 'green', f: 'fuchsia',
               Y: 'yellow', B: 'blue', R: 'red', G: 'green', F: 'fuchsia'},

    /**
     * color of the info-panel
     */
    INFO_SCHEME: 'infonote',

    /**
     * string selecting the html node the nodes should be put into
     */
    NOTES_WRAPPER: 'main',

    /**
     * CSS class name (string) that defines the note appearance
     */
    NOTE_CLASS: 'note',

    /**
     * Highest zIndex number before defragmentation
     */
    MAX_Z: 10000,

    /**
     * width of a node (including 2 borders and 2 paddings) in vw
     */
    NOTE_WIDTH: 17,

    /**
     * Animation length (in seconds) as string
     */
    ANIM_TIME: '0.4',

    /**
     * height of a node (including 2 borders and 2 paddings) in vw
     */
    NOTE_HEIGHT: 17,

    /**
     * initial position (x-dimension) of the info panel
     */
    INFO_LEFT_VW: 90,

    /**
     * initial position (y-dimension) of the info panel
     */
    INFO_TOP_VW: 59,

    /**
     * Size of the tiny gap between border edge and note edge
     */
    EDGE_GAP: 0.1,

    /**
     * height of the board in vw (width is 100vw)
     */
    BOARD_HEIGHT: 69,  // to fit 4 notes vertically

    /**
     * the maximum number of text lines inside a note
     */
    MAX_LINES: 8,

    /**
     * the maximum number of letters on one line inside a note
     */
    MAX_COLS: 16,

    /**
     * delay after which the textarea within the note get focus (in milliseconds)
     */
    FOCUS_TIMEOUT_MS: 50,

    /**
     * Length (in characters) of hash string validating the input file
     */
    HASH_LENGTH: 20,
};

Object.freeze(Constants);
