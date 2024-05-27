/**
 * Namespace with functions transforming clientXY coordinates to vw coordinates
 */
const Units = {
    pageXYFromClientXY: function(clientX, clientY) {
        return [
            clientX + document.documentElement.scrollLeft,
            clientY + document.documentElement.scrollTop
        ]
    },

    vwFromPx: function(px) {
        const board = document.querySelector(Constants.NOTES_WRAPPER);
        return px / board.clientWidth * 100;
    },

    pageVwFromClientXY: function(clientX, clientY) {
        const [pageX, pageY] = Units.pageXYFromClientXY(clientX, clientY);
        return [Units.vwFromPx(pageX), Units.vwFromPx(pageY)];
    }
};

Object.freeze(Units);
