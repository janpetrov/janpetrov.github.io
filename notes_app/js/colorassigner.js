/**
 * Used for assigning a color to a newly created note
 */
class ColorAssigner {
    constructor(loadObj = null) {
        if (loadObj === null)
            this.next = -1;
        else
            this.setState(loadObj);
    }

    updateNext() {
        ++this.next;
        this.next %= Constants.COLORS.length;
    }

    getColor() {
        this.updateNext();
        return Constants.COLORS[this.next];
    }

    getState() {
        return this.next;
    }

    setState(loadObj) {
        this.next = loadObj;
    }
}

/**
 * The info-note is assigned a specific and special color.
 */
class ColorInfoAssigner extends ColorAssigner{
    getColor() {
        return Constants.INFO_SCHEME;
    }
}
