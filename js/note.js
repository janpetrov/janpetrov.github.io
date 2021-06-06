/**
 * The class representing a note and creating it and its components (text area, closing SVG
 * circle with SVG cross), animations and event listeners.
 */
class Note {
    /**
     * @param managers object with dragManager, colorAssigner, zAssigner, removeFunction
     * and storeFunction
     * @param leftVw Left vw position where the note is to be created on the board. If loadObj is
     * used (is not null), the lefVw value is irrelevant
     * @param topVw Top vw position where the note is to be created on the board. If loadObj is
     * used (is not null), the lefVw value is irrelevant
     * @param loadObj State object (see getState and setState methods) specifying the note to be
     * created. By default is set to null, in which case the note is created anew upon user's click.
     */
    constructor(managers, leftVw, topVw, loadObj = null) {
        // allows the note to register itself for being dragged over the board
        this.dragManager = managers.dragManager;

        // allows the note to get its color
        this.colorAssigner = managers.colorAssigner;

        // allows the note to get and update its z-depth
        this.zAssigner = managers.zAssigner;

        // allows the note to make itself removed
        this.removeFunction = managers.removeFunction;

        // allows the note to trigger, upon its update, application store into WebStorage
        this.storeFunction = managers.storeFunction;

        this.el = document.createElement('article');
        this.el.classList.add(Constants.NOTE_CLASS);

        this.addMousedownListener();
        this.addTextArea();
        this.addClosingSVG();

        if (loadObj === null) {  // we create the note de nove
            this.scheme = this.colorAssigner.getColor();
            this.el.dataset.scheme = this.scheme;
            this.setTopZ();
            this.offsetXVw = 0;
            this.offsetYVw = 0;
            this.setPositionVwMinusOffset(leftVw - Constants.NOTE_WIDTH / 2,
                topVw - Constants.NOTE_HEIGHT / 2);
        }
        else
            this.setState(loadObj); // we reconstruct it from the state object

        let wrapper = document.querySelector(Constants.NOTES_WRAPPER);
        wrapper.appendChild(this.el);
    }

    addMousedownListener() {
        this.el.addEventListener('mousedown', event => {
            const [clickXVw, clickYVw] = Units.pageVwFromClientXY(event.clientX, event.clientY);
            const [leftVw, topVw] = this.getPosition();
            this.offsetXVw = clickXVw - leftVw;
            this.offsetYVw = clickYVw - topVw;
            this.setTopZ();
            this.storeFunction(true);
            this.dragManager.register(this);
        });
    }

    resetOffset() {
        this.offsetXVw = 0;
        this.offsetYVw = 0;
    }

    /**
     * Get the vw position of the note stored in its transform CSS attribute
     * @returns [leftPositionInVW, topPositionInVW]
     */
    getPosition() {
        const matches = this.el.style.transform.match(/(\d+(\.\d+)?)/g);
        const leftVw = parseFloat(matches[0]);
        const topVw = parseFloat(matches[1]);
        return [leftVw, topVw];
    }

    /**
     * @returns object representing all information for the note (to be saved and retrieved later),
     * that is, an object with {scheme, zIndex, position, text} object variables
     */
    getState() {
        return {
            scheme: this.scheme,
            zIndex: this.zIndex,
            position: this.getPosition(),
            text: this.textarea.value
        }
    }

    /**
     * Sets the object state according to the load object
     * @param loadObj object with {scheme, zIndex, position, text} object variables
     */
    setState(loadObj) {
        this.scheme = loadObj.scheme;
        this.el.dataset.scheme = this.scheme;
        this.zIndex = loadObj.zIndex;
        const [leftVw, topVw] = loadObj.position;
        this.resetOffset();
        this.setPositionVwMinusOffset(leftVw, topVw);
        this.textarea.value = loadObj.text;
    }

    /**
     * Adds text area within the node and creates all related listeners
     */
    addTextArea() {
        this.textarea = document.createElement("TEXTAREA");
        this.textarea.spellcheck = false;
        this.el.appendChild(this.textarea);

        this.el.addEventListener('mousemove', event => {
            event.preventDefault();
        });

        this.el.addEventListener('transitionend', () => {
            this.el.dataset.scheme = this.scheme;
        });

        // avoid adding more lines (or characters) if the note (or its line) would overflow
        this.textarea.addEventListener('keydown', event => {
            let before = this.textarea.value.slice(0, this.textarea.selectionStart);
            let after = this.textarea.value.slice(this.textarea.selectionEnd);

            if (event.ctrlKey) {
                const scheme = Constants.KEYCODES[event.key];
                if (scheme !== undefined) {
                    this.scheme = scheme;
                    this.el.dataset.scheme = scheme;
                    this.storeFunction(true);
                    event.preventDefault();
                }
            }
            else if (event.key==='Enter') {
                let txt = before + after;
                let linesArray = txt.split(/\r\n|\n|\r/gm);
                if (linesArray.length >= Constants.MAX_LINES) {
                    this.el.dataset.scheme = 'redflash';
                    event.preventDefault();
                }
                else
                    this.storeFunction(true, true);
            }
            else if (event.key.length===1) {
                let txt = before + 'X' + after;
                let linesArray = txt.split(/\r\n|\n|\r/gm);
                let maxLineLength = linesArray.reduce((acc, val) => Math.max(acc, val.length), 0);
                if (maxLineLength > Constants.MAX_COLS) {
                    this.el.dataset.scheme = 'redflash';
                    event.preventDefault();
                }
                else
                    this.storeFunction(true, true);
            }
            this.storeFunction();
        });

        // avoid pasting if the note contents would overflow
        this.textarea.addEventListener('paste', event => {
            let before = this.textarea.value.slice(0, this.textarea.selectionStart);
            let after = this.textarea.value.slice(this.textarea.selectionEnd);
            let txt = before +
                      (event.clipboardData || window.clipboardData).getData('text') +
                      after;
            let linesArray = txt.split(/\r\n|\n|\r/gm);
            let maxLineLength = linesArray.reduce((acc, val) => Math.max(acc, val.length), 0);
            if (linesArray.length > Constants.MAX_LINES || maxLineLength > Constants.MAX_COLS) {
                this.el.dataset.scheme = 'redflash';
                event.preventDefault();
            }

            this.storeFunction();
        });

        setTimeout(() => this.textarea.focus(), Constants.FOCUS_TIMEOUT_MS);
    }

    setAttributes(obj, dict) {
        for(let [key, value] of Object.entries(dict))
            obj.setAttributeNS(null, key, value);
    };

    /**
     * Custom function used by addClosingSVG
     * @param obj SVG dom object to be animated (object)
     * @param attrib attribute to be animated (string)
     * @param fromVal initial value (string)
     * @param toVal end value (string)
     * @param durVal time duration (string)
     * @returns pair of animation object (the first for animation forward, the second backward)
     */
    createAnimation(obj, attrib, fromVal, toVal, durVal) {
        const svgURI = 'http://www.w3.org/2000/svg';
        let attributes = {attributeName: attrib, from: fromVal,
            to: toVal, dur: durVal, begin: 'indefinite', fill: 'freeze'};

        let animTo = document.createElementNS(svgURI, 'animate');
        this.setAttributes(animTo, attributes);
        obj.appendChild(animTo);

        let animBack = document.createElementNS(svgURI, 'animate');
        [attributes.from, attributes.to] = [attributes.to, attributes.from];
        this.setAttributes(animBack, attributes);
        obj.appendChild(animBack);

        return [animTo, animBack];
    };

    /**
     * Adds functionality that the closing cross (at top-right corner) fades in as soon as
     * the user hovers over the note
     */
    addClosingSVG() {
        const svgURI = 'http://www.w3.org/2000/svg';
        this.svg = document.createElementNS(svgURI, "svg");
        this.setAttributes(this.svg, {width: '4vw', height: '4vw'});

        // e.g. Safari does not allow to size SVG elements using vw
        // therefore, % units are used insted
        this.svgBottomCircle = document.createElementNS(svgURI, 'circle');
        this.setAttributes(this.svgBottomCircle, {
            cx: '50%', cy: '50%', r: '30%',
            fill: 'lightgray', 'fill-opacity': 0.0,
            stroke: 'black', 'stroke-width':'5%', 'stroke-opacity': 0.0
        });
        this.svgBottomCircle.addEventListener('mousedown', event => {
            event.stopPropagation();
        });
        this.svg.appendChild(this.svgBottomCircle);

        this.svgLine1 = document.createElementNS(svgURI, 'line');
        this.setAttributes(this.svgLine1, {
            x1: '37%', y1: '37%', x2: '63%', y2: '63%', 'stroke-opacity': 0
        });
        this.svg.appendChild(this.svgLine1);

        this.svgLine2 = document.createElementNS(svgURI, 'line');
        this.setAttributes(this.svgLine2, {
            x1: '37%', y1: '63%', x2: '63%', y2: '37%', 'stroke-opacity': 0
        });
        this.svg.appendChild(this.svgLine2);

        this.svgTopVoidCircle = document.createElementNS(svgURI, 'circle');
        this.setAttributes(this.svgTopVoidCircle, {
            cx: '50%', cy: '50%', r: '30%',
            fill: 'lightgray', 'fill-opacity': 0.0,
            stroke: 'black', 'stroke-width':'5%', 'stroke-opacity': 0.0
        });
        this.svgTopVoidCircle.addEventListener('mousedown', event => {
            event.stopPropagation();
        });
        this.svg.appendChild(this.svgTopVoidCircle);

        this.el.appendChild(this.svg);

        [this.animFillOpacityOn, this.animFillOpacityOff] = this.createAnimation(this.svgBottomCircle,
            'fill-opacity', '0', '1.0', Constants.ANIM_TIME);
        [this.animStrokeOpacityOn, this.animStrokeOpacityOff] = this.createAnimation(this.svgBottomCircle,
            'stroke-opacity', '0', '0.5', Constants.ANIM_TIME);
        [this.animRed, this.animGray] = this.createAnimation(this.svgBottomCircle,
            'fill', 'lightgray', 'red', Constants.ANIM_TIME);
        [this.animRed, this.animGray] = this.createAnimation(this.svgBottomCircle,
            'fill', 'lightgray', 'red', Constants.ANIM_TIME);

        [this.animLine1StrokeOn, this.animLine1StrokeOff] = this.createAnimation(this.svgLine1,
            'stroke-opacity', '0', '1.0', Constants.ANIM_TIME);
        [this.animLine2StrokeOn, this.animLine2StrokeOff] = this.createAnimation(this.svgLine2,
            'stroke-opacity', '0', '1.0', Constants.ANIM_TIME);

        this.el.addEventListener('mouseenter', () => {
            this.animFillOpacityOn.beginElement();
            this.animStrokeOpacityOn.beginElement();
        });
        this.el.addEventListener('mouseleave', () => {
            this.animFillOpacityOff.beginElement();
            this.animStrokeOpacityOff.beginElement();
        });

        this.svgTopVoidCircle.addEventListener('mouseenter', () => {
            this.animRed.beginElement();
            this.animLine1StrokeOn.beginElement();
            this.animLine2StrokeOn.beginElement();
        });
        this.svgTopVoidCircle.addEventListener('mouseleave', () => {
            this.animGray.beginElement();
            this.animLine1StrokeOff.beginElement();
            this.animLine2StrokeOff.beginElement();
        });
        this.svgTopVoidCircle.addEventListener('click', event => {
            this.storeFunction(true);
            this.removeFunction(this);
            event.stopPropagation();
        });
    }

    removeSelfFromDOM() {
        this.el.remove();
    }

    /**
     * Updates the position of a note on the board (taking in the account previously store offset
     * according to where in the note the user has clicked when he/she started dragging the note).
     * @param leftVw current vw position (x-coordinate) of mouse cursor on the board
     * @param topVw current vw postion (y-coordinate) of mouse cursor on the board
     */
    setPositionVwMinusOffset(leftVw, topVw) {
        let leftOff = leftVw - this.offsetXVw;
        let topOff = topVw - this.offsetYVw;
        let clampValue = (value, min, max) => Math.min(Math.max(value, min), max);
        let leftLim = clampValue(leftOff, 0, 100 - Constants.NOTE_WIDTH);
        let topLim = clampValue(topOff, 0, Constants.BOARD_HEIGHT - Constants.NOTE_HEIGHT);
        ['transform', '-webkit-transform', '-ms-transform'].forEach(transform => {
            this.el.style[transform] = `translate(${leftLim.toFixed(2)}vw,` +
                `${topLim.toFixed(2)}vw)`;
        });
    }

    getZ() {
        return this.zIndex;
    }

    setZ(zIndex) {
        this.zIndex = zIndex;
        this.el.style.zIndex = '' + zIndex;
    }

    setTopZ() {
        let topZ = this.zAssigner.getTopZ();
        this.setZ(topZ);
    }
}
